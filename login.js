const params = new URLSearchParams(window.location.search);
const message = document.querySelector("#authMessage");
const googleLogin = document.querySelector("#googleLoginBtn");
const nextPath = params.get("next");

if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
  googleLogin.href = `/auth/google?next=${encodeURIComponent(nextPath)}`;
}

const oauthError = params.get("error");
if (oauthError) {
  message.hidden = false;
  message.textContent = oauthError;
  message.classList.add("auth-error");
}
