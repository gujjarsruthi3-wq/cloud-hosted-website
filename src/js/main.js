/* ==========================================================
   main.js — navigation, footer year and the contact form.
   The form posts JSON to /api/contact, which Azure Static Web
   Apps routes to the Azure Function in the /api folder.
   ========================================================== */
(function () {
  "use strict";

  // ---------- Mobile navigation ----------
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("site-nav");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      links.classList.toggle("open", !open);
    });

    // Close the menu with Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && links.classList.contains("open")) {
        toggle.click();
        toggle.focus();
      }
    });
  }

  // ---------- Footer year ----------
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // ---------- Contact form ----------
  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusBox = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");
  const message = form.elements.message;
  const counter = document.getElementById("char-count");
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  message.addEventListener("input", () => {
    counter.textContent = String(message.value.length);
  });

  function setError(input, text) {
    const field = input.closest(".field");
    field.classList.toggle("invalid", Boolean(text));
    field.querySelector(".error").textContent = text || "";
    input.setAttribute("aria-invalid", text ? "true" : "false");
  }

  function validate() {
    const { name, email } = form.elements;
    let ok = true;

    if (name.value.trim().length < 2) { setError(name, "Please enter your name."); ok = false; }
    else setError(name, "");

    if (!EMAIL_RE.test(email.value.trim())) { setError(email, "Please enter a valid email address."); ok = false; }
    else setError(email, "");

    const len = message.value.trim().length;
    if (len < 10) { setError(message, "Your message should be at least 10 characters."); ok = false; }
    else if (len > 2000) { setError(message, "Please keep your message under 2000 characters."); ok = false; }
    else setError(message, "");

    return ok;
  }

  function showStatus(kind, text) {
    statusBox.className = "form-status show " + kind;
    statusBox.textContent = text;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusBox.className = "form-status";

    if (!validate()) {
      const firstBad = form.querySelector("[aria-invalid='true']");
      if (firstBad) firstBad.focus();
      return;
    }

    const payload = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      subject: form.elements.subject.value.trim(),
      message: message.value.trim(),
      website: form.elements.website.value // honeypot
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        showStatus("success", data.message || "Thanks! Your message has been received.");
        form.reset();
        counter.textContent = "0";
      } else {
        showStatus("error", data.error || "Something went wrong. Please try again later.");
      }
    } catch (err) {
      showStatus("error", "Could not reach the server. Check your connection and try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
    }
  });
})();
