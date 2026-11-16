/* =====================================================
   Portfolio — Axelle Rakotonomenjanahary
   Interactions : thème sombre/clair, menu mobile, lien actif,
   animations d'apparition, images optionnelles, formulaire.
   ===================================================== */

/* ---------- CONFIGURATION (à personnaliser) ---------- */
const CONFIG = {
  email: "axelle.rakoto@outlook.com",
  website: "https://jirobe.framer.media/"
};

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;

  /* ---------- 1. Thème sombre / clair ---------- */
  const themeBtn = document.getElementById("themeToggle");
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    if (metaTheme) metaTheme.setAttribute("content", theme === "dark" ? "#0a1630" : "#f4efe6");
  };

  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) { /* stockage indisponible */ }
  applyTheme(saved || "dark"); // sombre par défaut

  themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* ---------- 2. Header : ombre au défilement ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 3. Menu mobile ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- 4. Lien de navigation actif ---------- */
  const links = [...document.querySelectorAll(".nav__link")];
  const sections = links.map((l) => document.querySelector(l.getAttribute("href"))).filter(Boolean);

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));

  /* ---------- 5. Animations d'apparition au défilement ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 90 + "ms"; // léger décalage en cascade
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- 6. Images optionnelles (avatar + projets) ----------
     Si le fichier indiqué dans data-img existe, il remplace le visuel de secours. */
  document.querySelectorAll("[data-img]").forEach((el) => {
    const src = el.getAttribute("data-img");
    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url("${src}")`;
      el.classList.add("has-img");
    };
    img.src = src; // en cas d'erreur, le visuel de secours reste affiché
  });

  /* ---------- 7. Liens sociaux (depuis CONFIG) ---------- */
  const setLink = (id, url) => {
    const a = document.getElementById(id);
    if (!a) return;
    if (url) { a.href = url; }
    else {
      // Lien pas encore renseigné : on évite un clic sans effet
      a.addEventListener("click", (e) => e.preventDefault());
      a.style.opacity = ".55";
      a.title = "Lien à renseigner dans script.js";
    }
  };
  setLink("siteLink", CONFIG.website);

  /* ---------- 8. Année du footer ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 9. Formulaire de contact ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const copyBtn = document.getElementById("copyBtn");
  const copyLabel = document.getElementById("copyLabel");

  const showError = (field, msg) => {
    const wrap = field.closest(".field");
    wrap.classList.toggle("has-error", Boolean(msg));
    wrap.querySelector(".error").textContent = msg || "";
  };

  const validate = () => {
    let ok = true;
    const { name, email, message } = form.elements;

    showError(name, name.value.trim() ? "" : "Merci d'indiquer votre nom.");
    if (!name.value.trim()) ok = false;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    showError(email, emailOk ? "" : "Merci d'indiquer une adresse e-mail valide.");
    if (!emailOk) ok = false;

    showError(message, message.value.trim().length >= 10 ? "" : "Votre message est un peu court (10 caractères minimum).");
    if (message.value.trim().length < 10) ok = false;

    return ok;
  };

  // Texte complet du message (utilisé pour la copie et le mailto)
  const buildMessage = () => {
    const { name, email, subject, message } = form.elements;
    return `Objet : ${subject.value}\nDe : ${name.value.trim()} <${email.value.trim()}>\n\n${message.value.trim()}`;
  };

  // Envoi : ouvre le client e-mail avec le message pré-rempli
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) { status.textContent = ""; return; }
    const { subject, message, name, email } = form.elements;
    const body = `${message.value.trim()}\n\n— ${name.value.trim()} (${email.value.trim()})`;
    window.location.href =
      `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject.value)}&body=${encodeURIComponent(body)}`;
    status.textContent = "Votre application de messagerie s'ouvre avec le message prêt à envoyer.";
  });

  // Copie dans le presse-papiers
  copyBtn.addEventListener("click", async () => {
    if (!validate()) return;
    const text = buildMessage();
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Solution de repli pour les navigateurs sans API clipboard
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove();
    }
    copyLabel.textContent = "Message copié ✓";
    status.textContent = "Message copié : vous pouvez le coller dans votre messagerie.";
    setTimeout(() => { copyLabel.textContent = "Copier le message"; }, 2500);
  });

  // Effacer l'erreur dès que l'utilisateur corrige un champ
  form.querySelectorAll("input, textarea").forEach((f) =>
    f.addEventListener("input", () => showError(f, ""))
  );
});
