/**
 * PATCH: nesting-guard.js
 * Adicione este bloco ao final do app.js, ANTES das últimas linhas de inicialização.
 *
 * Substitui a função autoNest original por uma versão que:
 *  1. Busca o status de uso do servidor
 *  2. Verifica limite de 85 peças
 *  3. Bloqueia com modal amigável se esgotado
 *  4. Registra o uso ao servidor após iniciar
 */

// ── Modal de limite esgotado ─────────────────────────────────────────────────
function createNestingLimitModal() {
  const existing = document.getElementById("nestingLimitModal");
  if (existing) return existing;

  const modal = document.createElement("div");
  modal.id = "nestingLimitModal";
  modal.style.cssText = `
    display:none; position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,0.55); align-items:center; justify-content:center;
  `;

  modal.innerHTML = `
    <div style="
      background:#fff; border-radius:12px; padding:32px 28px; max-width:440px; width:90%;
      box-shadow:0 8px 32px rgba(0,0,0,0.18); font-family:Arial,sans-serif;
    ">
      <div style="font-size:2rem; margin-bottom:8px;">⚠️</div>
      <h2 style="margin:0 0 12px; color:#1d2424; font-size:1.15rem;" id="nestingLimitTitle">
        Limite de encaixes atingido
      </h2>
      <p id="nestingLimitMsg" style="color:#4b5563; margin:0 0 20px; line-height:1.5; font-size:0.95rem;"></p>
      <div id="nestingLimitStatus" style="
        background:#f3f4f6; border-radius:8px; padding:12px 14px; margin-bottom:20px;
        font-size:0.88rem; color:#374151; line-height:1.6;
      "></div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button id="nestingLimitContact" style="
          flex:1; padding:10px 16px; background:#0891b2; color:#fff;
          border:none; border-radius:8px; cursor:pointer; font-size:0.95rem; font-weight:700;
        ">📧 Contatar Admin</button>
        <button id="nestingLimitClose" style="
          flex:1; padding:10px 16px; background:#f3f4f6; color:#374151;
          border:none; border-radius:8px; cursor:pointer; font-size:0.95rem;
        ">Fechar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#nestingLimitClose").addEventListener("click", () => {
    modal.style.display = "none";
  });
  modal.querySelector("#nestingLimitContact").addEventListener("click", () => {
    // Abre email para o admin com assunto pré-preenchido
    const subject = encodeURIComponent("MoldeLab - Solicitação de créditos de encaixe");
    const body = encodeURIComponent(
      `Olá,\n\nGostaria de adquirir créditos extras de encaixe para minha conta.\n\nAtenciosamente.`
    );
    window.open(`mailto:${window._nestingAdminContact || "admin@moldelab.com.br"}?subject=${subject}&body=${body}`);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  return modal;
}

function showNestingLimitModal(reason, status) {
  const modal = createNestingLimitModal();
  const isBloqueiodia = status && status.remaining === 0;

  modal.querySelector("#nestingLimitTitle").textContent = isBloqueiodia
    ? "Limite diário de encaixes atingido"
    : "Limite de peças excedido";

  modal.querySelector("#nestingLimitMsg").textContent = reason || "Você atingiu o limite de encaixes.";

  if (status) {
    window._nestingAdminContact = status.adminContact;
    modal.querySelector("#nestingLimitStatus").innerHTML = `
      <strong>Uso hoje:</strong> ${status.used} / ${status.limit} encaixe(s)<br>
      <strong>Restantes:</strong> ${status.remaining}<br>
      <strong>Máx. peças/encaixe:</strong> ${status.maxPiecesPerNesting}<br>
      <strong>Contato:</strong> <a href="mailto:${status.adminContact}" style="color:#0891b2">${status.adminContact}</a>
    `;
  }

  modal.style.display = "flex";
}

// ── Indicador de uso no header ────────────────────────────────────────────────
function updateNestingUsageDisplay(status) {
  if (!status) return;
  let badge = document.getElementById("nestingUsageBadge");
  if (!badge) {
    // Tenta inserir ao lado do botão de encaixe
    const btn = document.querySelector("#autoNest");
    if (!btn) return;
    badge = document.createElement("span");
    badge.id = "nestingUsageBadge";
    badge.style.cssText = `
      font-size:0.78rem; color:#6b7280; margin-left:6px;
      background:#f3f4f6; border-radius:6px; padding:2px 7px;
      vertical-align:middle; white-space:nowrap;
    `;
    btn.parentNode.insertBefore(badge, btn.nextSibling);
  }
  const pct = Math.round((status.used / status.limit) * 100);
  badge.textContent = `${status.used}/${status.limit} encaixes`;
  badge.style.color = status.remaining === 0 ? "#dc2626" : status.remaining <= 2 ? "#d97706" : "#6b7280";
  badge.title = `Você usou ${status.used} de ${status.limit} encaixes hoje (limite diário). Máx ${status.maxPiecesPerNesting} peças/encaixe.`;
}

// ── Guard principal ───────────────────────────────────────────────────────────
const _originalAutoNest = autoNest;

async function autoNest() {
  // Conta peças não bloqueadas (as que vão pro nesting)
  const pieceCount = pieces.filter((p) => !p.locked).length;

  try {
    const response = await fetch("/api/nesting/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ pieceCount }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.blocked) {
      showNestingLimitModal(data.reason, data.status);
      updateNestingUsageDisplay(data.status);
      return; // Bloqueia o encaixe
    }

    // Atualiza badge com novo status
    updateNestingUsageDisplay(data.status);
  } catch (err) {
    // Se a rota não existir ainda (deploy antigo), deixa passar silenciosamente
    console.warn("Nesting check indisponivel, prosseguindo sem limite:", err.message);
  }

  // Tudo ok → executa o encaixe original
  return _originalAutoNest();
}

// ── Carrega status ao abrir a página ─────────────────────────────────────────
async function loadNestingStatus() {
  try {
    const response = await fetch("/api/nesting/status", { credentials: "same-origin" });
    if (!response.ok) return;
    const data = await response.json();
    if (data.ok && data.status) updateNestingUsageDisplay(data.status);
  } catch {
    // Silencioso se não suportado ainda
  }
}

window.addEventListener("load", loadNestingStatus);

