// ------------------------------------------------------------
// La fragilità è di tutti? — script condiviso
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Toggle menu mobile
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav.primary");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => nav.classList.remove("open"))
    );
  }

  // Header che si condensa scorrendo (stile Apple)
  const header = document.querySelector("header.site");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Rivelazioni "fade + slide" all'ingresso in viewport
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${Math.min(i % 4, 3) * 0.09}s`);
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  // Leggera parallasse sulla farfalla dell'hero
  const heroButterfly = document.querySelector(".hero-butterfly");
  if (heroButterfly && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener(
      "scroll",
      () => {
        const y = Math.min(window.scrollY, 500) * 0.12;
        heroButterfly.style.transform = `translateY(${y}px)`;
      },
      { passive: true }
    );
  }

  // Pagina Puntate: carica gli episodi da data/episodes.json
  const epGrid = document.querySelector("[data-episodes]");
  if (epGrid) loadEpisodes(epGrid);
});

const FALLBACK_EPISODES = [
  {
    title: "Esempio di puntata — sostituiscila con la tua",
    youtubeId: "dQw4w9WgXcQ",
    description: "Questa è una puntata di esempio: aggiorna data/episodes.json con le tue puntate vere, oppure pubblica il sito online perché questa pagina possa leggerle automaticamente.",
    url_youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    url_spotify: "https://open.spotify.com/",
    url_apple: "https://podcasts.apple.com/",
  },
];

async function loadEpisodes(container) {
  if (window.EMBEDDED_EPISODES && window.EMBEDDED_EPISODES.length) {
    renderEpisodes(container, window.EMBEDDED_EPISODES);
    return;
  }
  try {
    const res = await fetch("data/episodes.json");
    if (!res.ok) throw new Error("File episodi non trovato");
    const episodes = await res.json();

    if (!episodes || episodes.length === 0) {
      container.innerHTML = `<div class="ep-empty">Nessuna puntata caricata ancora. Aggiungile in <code>data/episodes.json</code>.</div>`;
      return;
    }

    renderEpisodes(container, episodes);
  } catch (err) {
    // Se il file JSON non è raggiungibile (es. anteprima locale ristretta),
    // mostriamo comunque un esempio funzionante invece di un errore secco.
    renderEpisodes(container, FALLBACK_EPISODES);
    const note = document.createElement("div");
    note.className = "ep-empty";
    note.style.gridColumn = "1/-1";
    note.innerHTML = `Questa è una puntata di esempio: pubblica il sito online (o aprilo tramite un piccolo server locale) perché possa leggere <code>data/episodes.json</code> automaticamente.`;
    container.prepend(note);
    console.error(err);
  }
}

function renderEpisodes(container, episodes) {
  container.innerHTML = episodes.map((ep, i) => episodeCard(ep, i + 1)).join("");
  container.querySelectorAll(".info-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const desc = btn.closest(".ep-card").querySelector(".ep-desc");
      const isOpen = desc.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      btn.textContent = isOpen ? "Chiudi" : "Info";
    });
  });
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("ep-highlight");
      setTimeout(() => target.classList.remove("ep-highlight"), 2400);
    }
  }
}

function episodeCard(ep, n) {
  const thumb =
    ep.cover ||
    ep.thumbnail ||
    (ep.youtubeId ? `https://img.youtube.com/vi/${ep.youtubeId}/hqdefault.jpg` : "");
  const ytUrl = ep.url_youtube || (ep.youtubeId ? `https://www.youtube.com/watch?v=${ep.youtubeId}` : "#");
  return `
    <article class="ep-card" id="puntata-${n}">
      <div class="ep-thumb">${thumb ? `<img src="${thumb}" alt="Copertina — ${escapeHtml(ep.title)}" loading="lazy">` : ""}</div>
      <div class="ep-body">
        <h3 class="ep-title">${escapeHtml(ep.title)}</h3>
        <div class="ep-actions">
          <button class="info-btn" aria-expanded="false">Info</button>
          <div class="platform-row">
            ${platformBtn(ytUrl, "YouTube", iconYouTube)}
            ${ep.url_spotify ? platformBtn(ep.url_spotify, "Spotify", iconSpotify) : ""}
            ${ep.url_apple ? platformBtn(ep.url_apple, "Apple Podcast", iconApple) : ""}
          </div>
        </div>
        <p class="ep-desc">${escapeHtml(ep.description || "Descrizione in arrivo.")}</p>
      </div>
    </article>`;
}

function platformBtn(url, label, icon) {
  return `<a class="platform-btn" href="${url}" target="_blank" rel="noopener" aria-label="Ascolta su ${label}">${icon}</a>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

const iconYouTube = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.6-.45-5.3a3 3 0 0 0-2.1-2.1C18.7 4 12 4 12 4s-6.7 0-8.45.6a3 3 0 0 0-2.1 2.1C1 8.4 1 12 1 12s0 3.6.45 5.3a3 3 0 0 0 2.1 2.1C5.3 20 12 20 12 20s6.7 0 8.45-.6a3 3 0 0 0 2.1-2.1C23 15.6 23 12 23 12ZM9.7 15.5v-7l6.3 3.5-6.3 3.5Z"/></svg>`;
const iconSpotify = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.4 14.4a.7.7 0 0 1-1 .2c-2.6-1.6-5.9-2-9.8-1a.7.7 0 1 1-.3-1.3c4.2-1 7.9-.6 10.8 1.2a.7.7 0 0 1 .3 1Zm1.2-2.7a.85.85 0 0 1-1.2.3c-3-1.8-7.5-2.4-11-1.3a.85.85 0 1 1-.5-1.6c4-1.2 9-.5 12.4 1.5a.85.85 0 0 1 .3 1.1Zm.1-2.8C14.4 9 8 8.8 4.9 9.7a1 1 0 1 1-.6-1.9c3.6-1 10.6-.8 14.7 1.6a1 1 0 0 1-1 1.7Z"/></svg>`;
const iconApple = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.3 12.6c0-2.7 2.2-4 2.3-4.1-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1 1-3.9 1-.8 0-2.1-1-3.4-1-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.2-2.5.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.6-1-2.7-3.9ZM14.7 4.7c.7-.9 1.2-2.1 1.1-3.4-1.1.1-2.4.7-3.2 1.6-.7.8-1.3 2-1.1 3.3 1.2.1 2.5-.6 3.2-1.5Z"/></svg>`;
