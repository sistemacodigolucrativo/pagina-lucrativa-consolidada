const toast = document.querySelector(".toast");
let toastTimer = 0;

function showToast(message) {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1500);
}

document.querySelectorAll(".shortcut").forEach((button) => {
  button.addEventListener("click", () => {
    const label = button.textContent.trim();
    showToast(`${label}: interação demonstrativa`);
  });
});

document.querySelector(".journey-card")?.addEventListener("click", () => {
  showToast("Jornada do Iniciante: protótipo visual");
});

document.querySelectorAll(".icon-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("fullscreen-button")) return;
    showToast(button.getAttribute("aria-label") || "Ação demonstrativa");
  });
});

const fullscreenButton = document.querySelector(".fullscreen-button");
const fullscreenTarget = document.querySelector(".template-shell");

function syncFullscreenState() {
  document.body.classList.toggle("is-fullscreen", Boolean(document.fullscreenElement));
  fullscreenButton?.setAttribute(
    "aria-label",
    document.fullscreenElement ? "Sair da tela cheia" : "Tela cheia",
  );
}

fullscreenButton?.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      showToast("Tela cheia desativada");
      return;
    }

    await fullscreenTarget?.requestFullscreen();
    showToast("Tela cheia ativada");
  } catch {
    showToast("Tela cheia indisponível neste navegador");
  } finally {
    syncFullscreenState();
  }
});

document.addEventListener("fullscreenchange", syncFullscreenState);
