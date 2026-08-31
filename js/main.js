(() => {
    // Footer year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Mobile menu toggle
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    const setMenuOpen = (open) => {
        if (!menuBtn || !mobileMenu) return;
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
        mobileMenu.hidden = !open;
    };

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", () => {
            const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
            setMenuOpen(!isOpen);
        });

        mobileMenu.addEventListener("click", (e) => {
            const t = e.target;
            if (t && t.tagName === "A") setMenuOpen(false);
        });
    }

    // Formspree async submit
    const form = document.getElementById("contactForm");
    const statusEl = document.getElementById("formStatus");

    const showStatus = (msg, kind) => {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.classList.remove("ok", "err", "show");
        statusEl.classList.add("show", kind);
    };

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Basic safety: ensure action is set
            const endpoint = form.getAttribute("action");
            const isValidFormspree = /^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(endpoint);
            const hasPlaceholder = /mdaongka|REPLACE|XXXX|<.*?>/i.test(endpoint);
            if (!endpoint || hasPlaceholder || !isValidFormspree) {
                showStatus(
                    "Form not configured. Please send an email instead. Sorry for the trouble.",
                    "err"
                );
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : null;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending…";
            }

            try {
                const formData = new FormData(form);
                const res = await fetch(endpoint, {
                    method: "POST",
                    body: formData,
                    headers: { "Accept": "application/json" }
                });

                if (res.ok) {
                    form.reset();
                    showStatus("Thanks — your enquiry has been sent. We’ll get back to you shortly.", "ok");
                } else {
                    let errText = "Something went wrong while sending. Please try again, or email us instead.";
                    try {
                        const data = await res.json();
                        if (data?.errors?.length) {
                            errText = data.errors.map(e => e.message).join(" ");
                        }
                    } catch (_) {}
                    showStatus(errText, "err");
                }
            } catch (err) {
                showStatus("Network error. Please check your connection and try again, or email us instead.", "err");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText || "Send enquiry →";
                }
            }
        });
    }
})();