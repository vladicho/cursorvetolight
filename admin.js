const panel = document.querySelector("#adminPanel");
const loading = document.querySelector("#adminLoading");
const message = document.querySelector("#adminMessage");
const usersTable = document.querySelector("#usersTable");
const loginsTable = document.querySelector("#loginsTable");
const ragFiles = document.querySelector("#ragFiles");
const ragStatus = document.querySelector("#ragStatus");
const ragProgress = document.querySelector("#ragProgress");
const ragUploadResults = document.querySelector("#ragUploadResults");
const uploadRag = document.querySelector("#uploadRag");

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function userCell(user) {
  const wrapper = document.createElement("div");
  wrapper.className = "admin-user-identity";
  if (user.picture_url) {
    const image = document.createElement("img");
    image.src = user.picture_url;
    image.alt = "";
    image.referrerPolicy = "no-referrer";
    wrapper.appendChild(image);
  }
  const text = document.createElement("div");
  const name = document.createElement("strong");
  const email = document.createElement("span");
  name.textContent = user.name;
  email.textContent = user.email;
  text.append(name, email);
  wrapper.appendChild(text);
  return wrapper;
}

function appendCell(row, value) {
  const cell = document.createElement("td");
  if (value instanceof Node) cell.appendChild(value);
  else cell.textContent = String(value);
  row.appendChild(cell);
}

function renderUsers(users) {
  usersTable.replaceChildren();
  for (const user of users) {
    const row = document.createElement("tr");
    appendCell(row, userCell(user));
    appendCell(row, formatDate(user.created_at));
    appendCell(row, formatDate(user.last_login_at));
    appendCell(row, user.login_count);
    appendCell(row, user.role === "admin" ? "Administrador" : "Usuário");
    usersTable.appendChild(row);
  }
}

function renderLogins(logins) {
  loginsTable.replaceChildren();
  for (const login of logins) {
    const row = document.createElement("tr");
    appendCell(row, userCell(login));
    appendCell(row, formatDate(login.logged_in_at));
    loginsTable.appendChild(row);
  }
}

async function loadAdmin() {
  loading.hidden = false;
  panel.hidden = true;
  message.hidden = true;
  const response = await fetch("/api/admin/overview", { credentials: "same-origin" });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.location.replace("/login.html?next=%2Fadmin.html");
    return;
  }
  if (!response.ok || !data.ok) {
    loading.hidden = true;
    message.hidden = false;
    message.classList.add("auth-error");
    message.textContent = data.error || "Não foi possível carregar os registros.";
    return;
  }
  renderUsers(data.users);
  renderLogins(data.logins);
  document.querySelector("#totalUsers").textContent = data.summary.total_users;
  document.querySelector("#totalLogins").textContent = data.summary.total_logins;
  document.querySelector("#lastLogin").textContent = formatDate(data.summary.last_login_at);
  loading.hidden = true;
  panel.hidden = false;
  loadRagStatus();
}

async function loadRagStatus() {
  const response = await fetch("/api/admin/rag/status", { credentials: "same-origin" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    ragStatus.textContent = data.error || "Não foi possível verificar o RAG.";
    return;
  }
  if (!data.ready) {
    ragStatus.textContent = "A base modelagem-vestuario será criada no primeiro envio.";
    return;
  }
  const indexed = data.stats?.indexed_items ?? data.stats?.total_items ?? data.stats?.items ?? "ativa";
  ragStatus.textContent = `Base modelagem-vestuario: ${indexed} arquivo(s) indexado(s).`;
}

async function uploadRagFiles() {
  const files = Array.from(ragFiles.files || []);
  if (!files.length) {
    ragStatus.textContent = "Selecione os PDFs preparados para indexação.";
    return;
  }
  uploadRag.disabled = true;
  ragProgress.hidden = false;
  ragProgress.max = files.length;
  ragProgress.value = 0;
  ragUploadResults.replaceChildren();

  for (const file of files) {
    const item = document.createElement("li");
    item.textContent = `${file.name}: enviando...`;
    ragUploadResults.appendChild(item);
    const form = new FormData();
    form.append("file", file, file.name);
    try {
      const response = await fetch("/api/admin/rag/upload", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const data = await response.json().catch(() => ({}));
      item.textContent = response.ok ? `${file.name}: recebido para indexação` : `${file.name}: ${data.error || "falha no envio"}`;
      item.dataset.status = response.ok ? "ok" : "error";
    } catch {
      item.textContent = `${file.name}: falha de conexão`;
      item.dataset.status = "error";
    }
    ragProgress.value += 1;
  }
  uploadRag.disabled = false;
  await loadRagStatus();
}

document.querySelector("#refreshUsers").addEventListener("click", () => loadAdmin());
uploadRag.addEventListener("click", uploadRagFiles);
document.querySelector("#adminLogout").addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  window.location.replace("/login.html");
});

loadAdmin().catch(() => {
  loading.hidden = true;
  message.hidden = false;
  message.classList.add("auth-error");
  message.textContent = "Falha ao conectar ao painel.";
});

