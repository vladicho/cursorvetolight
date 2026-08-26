const SESSION_COOKIE = "__Host-moldelab_session";
const OAUTH_COOKIE = "__Host-moldelab_oauth";
const SESSION_SECONDS = 60 * 60 * 24 * 7;
const OAUTH_SECONDS = 60 * 10;
const RAG_INSTANCE = "modelagem-vestuario";
const MAX_RAG_FILE_BYTES = 4_000_000;
const encoder = new TextEncoder();

type UserRow = {
  id: string;
  google_sub: string;
  email: string;
  name: string;
  picture_url: string | null;
  role: "user" | "admin";
  status: "approved" | "blocked";
  created_at: string;
  last_login_at: string;
  login_count: number;
};

type OAuthStateRow = {
  code_verifier: string;
  return_to: string;
  expires_at: string;
};

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomToken(size = 32): string {
  return base64Url(crypto.getRandomValues(new Uint8Array(size)));
}

function timingSafeStringEqual(left: string, right: string): boolean {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  const length = Math.max(a.length, b.length);
  let difference = a.length ^ b.length;
  for (let index = 0; index < length; index += 1) {
    difference |= (a[index] || 0) ^ (b[index] || 0);
  }
  return difference === 0;
}

async function sha256(value: string): Promise<string> {
  return base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

function cookieValue(request: Request, name: string): string | null {
  const cookies = request.headers.get("Cookie") || "";
  for (const part of cookies.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=") || null;
  }
  return null;
}

function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

function oauthCookie(token: string): string {
  return `${OAUTH_COOKIE}=${token}; Path=/; Max-Age=${OAUTH_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

function clearCookie(name: string): string {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

function json(payload: unknown, status = 200): Response {
  return Response.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function redirect(location: string, status = 302, cookies: string[] = []): Response {
  const headers = new Headers({ Location: location, "Cache-Control": "no-store" });
  for (const cookie of cookies) headers.append("Set-Cookie", cookie);
  return new Response(null, { status, headers });
}

function safeNext(value: string | null): string {
  const pathname = value?.split(/[?#]/, 1)[0].toLowerCase();
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    pathname === "/http" ||
    pathname === "/https"
  ) return "/";
  if (pathname === "/" || pathname === "/index.html") return "/";
  return value;
}

function adminEmails(env: Env): Set<string> {
  return new Set(env.ADMIN_EMAILS.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
}

function allowedOrigins(env: Env): Set<string> {
  return new Set(
    [env.APP_ORIGIN, ...env.APP_ORIGINS.split(",")]
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

function requestOrigin(request: Request, env: Env): string {
  const origin = new URL(request.url).origin;
  if (!allowedOrigins(env).has(origin)) throw new Error("Origem não autorizada.");
  return origin;
}

function publicUser(user: UserRow) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    picture_url: user.picture_url,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
    last_login_at: user.last_login_at,
    login_count: user.login_count,
  };
}

async function currentUser(request: Request, env: Env): Promise<UserRow | null> {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  return env.DB.prepare(`
    SELECT u.id, u.google_sub, u.email, u.name, u.picture_url, u.role, u.status,
           u.created_at, u.last_login_at, u.login_count
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ? AND u.status = 'approved'
  `).bind(tokenHash, new Date().toISOString()).first<UserRow>();
}

function sameOrigin(request: Request, env: Env): boolean {
  const origin = request.headers.get("Origin");
  return origin !== null && origin === requestOrigin(request, env);
}

async function cleanupExpired(env: Env): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now),
    env.DB.prepare("DELETE FROM oauth_states WHERE expires_at <= ?").bind(now),
  ]);
}

async function startGoogleLogin(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return redirect("/login.html?error=Login%20Google%20ainda%20n%C3%A3o%20configurado");
  }

  const url = new URL(request.url);
  const origin = requestOrigin(request, env);
  const state = randomToken();
  const stateHash = await sha256(state);
  const verifier = randomToken(48);
  const challenge = await sha256(verifier);
  const returnTo = safeNext(url.searchParams.get("next"));
  const expiresAt = new Date(Date.now() + OAUTH_SECONDS * 1000).toISOString();

  await env.DB.prepare(
    "INSERT INTO oauth_states (state_hash, code_verifier, return_to, expires_at) VALUES (?, ?, ?, ?)",
  ).bind(stateHash, verifier, returnTo, expiresAt).run();
  ctx.waitUntil(cleanupExpired(env).catch((error) => {
    console.error(JSON.stringify({ event: "cleanup_failed", message: String(error) }));
  }));

  const authorization = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorization.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  authorization.searchParams.set("redirect_uri", `${origin}/auth/google/callback`);
  authorization.searchParams.set("response_type", "code");
  authorization.searchParams.set("scope", "openid email profile");
  authorization.searchParams.set("state", state);
  authorization.searchParams.set("code_challenge", challenge);
  authorization.searchParams.set("code_challenge_method", "S256");
  authorization.searchParams.set("prompt", "select_account");

  return redirect(authorization.toString(), 302, [oauthCookie(state)]);
}

async function googleCallback(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const origin = requestOrigin(request, env);
  const providerError = url.searchParams.get("error");
  if (providerError) return redirect("/login.html?error=Entrada%20cancelada", 302, [clearCookie(OAUTH_COOKIE)]);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = cookieValue(request, OAUTH_COOKIE);
  if (!code || !state || !cookieState) {
    return redirect("/login.html?error=Solicita%C3%A7%C3%A3o%20de%20login%20inv%C3%A1lida", 302, [clearCookie(OAUTH_COOKIE)]);
  }

  const stateMatches = timingSafeStringEqual(state, cookieState);
  if (!stateMatches) {
    return redirect("/login.html?error=Solicita%C3%A7%C3%A3o%20de%20login%20inv%C3%A1lida", 302, [clearCookie(OAUTH_COOKIE)]);
  }

  const stateHash = await sha256(state);
  const stored = await env.DB.prepare(
    "SELECT code_verifier, return_to, expires_at FROM oauth_states WHERE state_hash = ?",
  ).bind(stateHash).first<OAuthStateRow>();
  if (!stored || stored.expires_at <= new Date().toISOString()) {
    return redirect("/login.html?error=O%20login%20expirou.%20Tente%20novamente", 302, [clearCookie(OAUTH_COOKIE)]);
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${origin}/auth/google/callback`,
      grant_type: "authorization_code",
      code_verifier: stored.code_verifier,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const tokenData = await tokenResponse.json<GoogleTokenResponse>();
  if (!tokenResponse.ok || !tokenData.access_token) {
    console.error(JSON.stringify({ event: "google_token_failed", status: tokenResponse.status, code: tokenData.error || "unknown" }));
    return redirect("/login.html?error=O%20Google%20n%C3%A3o%20concluiu%20a%20entrada", 302, [clearCookie(OAUTH_COOKIE)]);
  }

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
    signal: AbortSignal.timeout(10_000),
  });
  const profile = await profileResponse.json<GoogleProfile>();
  if (!profileResponse.ok || !profile.sub || !profile.email || profile.email_verified !== true) {
    return redirect("/login.html?error=N%C3%A3o%20foi%20poss%C3%ADvel%20confirmar%20seu%20e-mail", 302, [clearCookie(OAUTH_COOKIE)]);
  }

  const email = profile.email.trim().toLowerCase();
  const role: UserRow["role"] = adminEmails(env).has(email) ? "admin" : "user";
  const now = new Date().toISOString();
  const existing = await env.DB.prepare(
    "SELECT * FROM users WHERE google_sub = ? OR email = ? LIMIT 1",
  ).bind(profile.sub, email).first<UserRow>();
  const userId = existing?.id || crypto.randomUUID();
  const sessionToken = randomToken(48);
  const sessionHash = await sha256(sessionToken);
  const sessionExpires = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString();

  const userStatement = existing
    ? env.DB.prepare(`
        UPDATE users
        SET google_sub = ?, email = ?, name = ?, picture_url = ?, role = ?,
            last_login_at = ?, login_count = login_count + 1
        WHERE id = ?
      `).bind(profile.sub, email, profile.name || email, profile.picture || null, role, now, userId)
    : env.DB.prepare(`
        INSERT INTO users
          (id, google_sub, email, name, picture_url, role, status, created_at, last_login_at, login_count)
        VALUES (?, ?, ?, ?, ?, ?, 'approved', ?, ?, 1)
      `).bind(userId, profile.sub, email, profile.name || email, profile.picture || null, role, now, now);

  await env.DB.batch([
    userStatement,
    env.DB.prepare("INSERT INTO login_events (user_id, logged_in_at) VALUES (?, ?)").bind(userId, now),
    env.DB.prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
      .bind(sessionHash, userId, now, sessionExpires),
    env.DB.prepare("DELETE FROM oauth_states WHERE state_hash = ?").bind(stateHash),
  ]);
  ctx.waitUntil(cleanupExpired(env).catch((error) => {
    console.error(JSON.stringify({ event: "cleanup_failed", message: String(error) }));
  }));

  return redirect(safeNext(stored.return_to), 302, [sessionCookie(sessionToken), clearCookie(OAUTH_COOKIE)]);
}

async function logout(request: Request, env: Env): Promise<Response> {
  if (!sameOrigin(request, env)) return json({ ok: false, error: "Origem inválida." }, 403);
  const token = cookieValue(request, SESSION_COOKIE);
  if (token) {
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  }
  return new Response(null, {
    status: 204,
    headers: { "Set-Cookie": clearCookie(SESSION_COOKIE), "Cache-Control": "no-store" },
  });
}

async function adminOverview(env: Env) {
  const [usersResult, loginsResult, summary] = await Promise.all([
    env.DB.prepare(`
      SELECT id, email, name, picture_url, role, status, created_at, last_login_at, login_count
      FROM users ORDER BY last_login_at DESC LIMIT 500
    `).all(),
    env.DB.prepare(`
      SELECT e.id, e.logged_in_at, u.name, u.email, u.picture_url
      FROM login_events e JOIN users u ON u.id = e.user_id
      ORDER BY e.logged_in_at DESC LIMIT 200
    `).all(),
    env.DB.prepare(`
      SELECT COUNT(*) AS total_users, COALESCE(SUM(login_count), 0) AS total_logins,
             MAX(last_login_at) AS last_login_at
      FROM users
    `).first(),
  ]);
  return json({ ok: true, users: usersResult.results, logins: loginsResult.results, summary });
}

async function ragInstance(env: Env) {
  const instance = env.AI_SEARCH.get(RAG_INSTANCE);
  try {
    await instance.info();
    return instance;
  } catch {
    return env.AI_SEARCH.create({
      id: RAG_INSTANCE,
      index_method: { vector: true, keyword: true },
      chunk_size: 700,
      chunk_overlap: 100,
      max_num_results: 8,
    });
  }
}

async function adminRagStatus(env: Env): Promise<Response> {
  const instance = env.AI_SEARCH.get(RAG_INSTANCE);
  try {
    const [info, stats] = await Promise.all([instance.info(), instance.stats()]);
    return json({ ok: true, ready: true, instance: info, stats });
  } catch {
    return json({ ok: true, ready: false, instance: { id: RAG_INSTANCE } });
  }
}

async function adminRagUpload(request: Request, env: Env): Promise<Response> {
  if (!sameOrigin(request, env)) return json({ ok: false, error: "Origem inválida." }, 403);
  const form = await request.formData();
  const value = form.get("file");
  if (!(value instanceof File)) return json({ ok: false, error: "Selecione um PDF." }, 400);
  if (!value.name.toLowerCase().endsWith(".pdf") || value.type !== "application/pdf") {
    return json({ ok: false, error: "Somente arquivos PDF são aceitos." }, 415);
  }
  if (value.size > MAX_RAG_FILE_BYTES) {
    return json({ ok: false, error: "O PDF ultrapassa o limite de 4 MB do AI Search." }, 413);
  }

  const instance = await ragInstance(env);
  const uploaded = await instance.items.upload(value.name, value);
  return json({ ok: true, file: value.name, size: value.size, item: uploaded }, 202);
}

async function ragChat(request: Request, env: Env): Promise<Response> {
  if (!sameOrigin(request, env)) return json({ ok: false, error: "Origem inválida." }, 403);
  const body = await request.json<{ message?: unknown }>().catch((): { message?: unknown } => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return json({ ok: false, error: "Escreva uma pergunta." }, 400);
  if (message.length > 4_000) return json({ ok: false, error: "A pergunta é muito longa." }, 413);

  const instance = env.AI_SEARCH.get(RAG_INSTANCE);
  const response = await instance.chatCompletions({
    messages: [
      {
        role: "system",
        content: "Responda em português como especialista em modelagem e confecção do vestuário. Use somente a biblioteca recuperada, explique medidas e etapas com clareza, cite os nomes dos documentos consultados e diga explicitamente quando a biblioteca não sustentar uma afirmação.",
      },
      { role: "user", content: message },
    ],
    ai_search_options: {
      retrieval: {
        retrieval_type: "hybrid",
        max_num_results: 8,
        context_expansion: 1,
      },
      query_rewrite: { enabled: true },
    },
  });
  return json({ ok: true, response });
}

function secure(response: Response): Response {
  const output = new Response(response.body, response);
  output.headers.set("X-Content-Type-Options", "nosniff");
  output.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  output.headers.set("Permissions-Policy", "camera=(self), microphone=(), geolocation=()");
  output.headers.set("X-Frame-Options", "DENY");
  if (output.headers.get("Content-Type")?.includes("text/html")) {
    output.headers.set("Cache-Control", "private, no-store");
  }
  return output;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.hostname === "www.lugarerrado.com") {
      return redirect(`${env.APP_ORIGIN}${url.pathname}${url.search}`, 308);
    }

    if (/^\/https?\/?$/i.test(url.pathname)) {
      const loginUrl = new URL("/login.html", url);
      return secure(await env.ASSETS.fetch(new Request(loginUrl, request)));
    }

    try {
      if (url.pathname === "/api/health" && request.method === "GET") {
        return secure(json({ ok: true }));
      }
      if (url.pathname === "/auth/google" && request.method === "GET") {
        return secure(await startGoogleLogin(request, env, ctx));
      }
      if (url.pathname === "/auth/google/callback" && request.method === "GET") {
        return secure(await googleCallback(request, env, ctx));
      }
      if (url.pathname === "/api/auth/logout" && request.method === "POST") {
        return secure(await logout(request, env));
      }

      const user = await currentUser(request, env);
      if (url.pathname === "/api/auth/me") {
        return secure(user ? json({ ok: true, user: publicUser(user) }) : json({ ok: false, error: "Não autenticado." }, 401));
      }

      const publicAsset =
        url.pathname === "/login.html" ||
        url.pathname === "/login.js" ||
        url.pathname === "/styles.css" ||
        url.pathname === "/privacy.html" ||
        url.pathname === "/terms.html";
      if (publicAsset) return secure(await env.ASSETS.fetch(request));

      if (!user) {
        if (url.pathname.startsWith("/api/")) return secure(json({ ok: false, error: "Não autenticado." }, 401));
        if (url.pathname === "/" || url.pathname === "/index.html") {
          const loginUrl = new URL("/login.html", url);
          return secure(await env.ASSETS.fetch(new Request(loginUrl, request)));
        }
        return secure(redirect(`/login.html?next=${encodeURIComponent(safeNext(url.pathname + url.search))}`));
      }

      if (url.pathname === "/api/admin/overview") {
        if (user.role !== "admin") return secure(json({ ok: false, error: "Acesso restrito ao administrador." }, 403));
        return secure(await adminOverview(env));
      }
      if (url.pathname === "/api/admin/rag/status" && request.method === "GET") {
        if (user.role !== "admin") return secure(json({ ok: false, error: "Acesso restrito ao administrador." }, 403));
        return secure(await adminRagStatus(env));
      }
      if (url.pathname === "/api/admin/rag/upload" && request.method === "POST") {
        if (user.role !== "admin") return secure(json({ ok: false, error: "Acesso restrito ao administrador." }, 403));
        return secure(await adminRagUpload(request, env));
      }
      if (url.pathname === "/api/rag/chat" && request.method === "POST") {
        return secure(await ragChat(request, env));
      }
      if (url.pathname === "/admin.html" && user.role !== "admin") {
        return secure(new Response("Acesso restrito ao administrador.", { status: 403 }));
      }

      if (url.pathname === "/") {
        const indexUrl = new URL("/index.html", url);
        return secure(await env.ASSETS.fetch(new Request(indexUrl, request)));
      }
      if (url.pathname === "/index.html") return secure(redirect("/", 308));
      return secure(await env.ASSETS.fetch(request));
    } catch (error) {
      console.error(JSON.stringify({
        event: "request_failed",
        path: url.pathname,
        message: error instanceof Error ? error.message : "unknown",
      }));
      return secure(url.pathname.startsWith("/api/")
        ? json({ ok: false, error: "Erro interno." }, 500)
        : new Response("Erro interno.", { status: 500 }));
    }
  },
} satisfies ExportedHandler<Env>;
