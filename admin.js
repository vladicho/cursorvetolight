const panel = document.querySelector("#adminPanel");
const loading = document.querySelector("#adminLoading");
const message = document.querySelector("#adminMessage");
const usersTable = document.querySelector("#usersTable");
const loginsTable = document.querySelector("#loginsTable");

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
}

document.querySelector("#refreshUsers").addEventListener("click", () => loadAdmin());
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

