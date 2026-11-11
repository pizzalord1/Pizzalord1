const CONTACT_TURNSTILE_SITE_KEY = "0x4AAAAAAF7yHdT0l1hZofbq";
const contactTrigger = document.querySelector("#contactTrigger");
const contactDialog = document.querySelector("#contactDialog");
const contactForm = document.querySelector("#contactForm");
const contactStatus = document.querySelector("#contactStatus");
const contactSubmit = contactForm.querySelector(".contact-submit");
const contactPhoto = document.querySelector("#contactPhoto");
const contactTurnstile = document.querySelector("#contactTurnstile");
const isLocalPreview = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(window.location.hostname);
const localPreviewMessage = "The contact form can only be sent from pizzalord.online.";
const maxContactPhotoBytes = 3 * 1024 * 1024;
const allowedContactPhotoTypes = ["image/jpeg", "image/png", "image/webp"];
let turnstileWidgetId;
let turnstileLoadPromise;
let contactDialogClosing = false;
let contactDialogCloseAnimationEnd;
let contactDialogCloseTimeout;

async function encodeFileAsBase64(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
}

function loadTurnstile() {
    if (window.turnstile) {
        return Promise.resolve(window.turnstile);
    }
    if (turnstileLoadPromise) {
        return turnstileLoadPromise;
    }

    turnstileLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.onload = () => {
            if (window.turnstile) {
                resolve(window.turnstile);
            } else {
                reject(new Error("Turnstile did not initialize."));
            }
        };
        script.onerror = () => reject(new Error("Turnstile could not be loaded."));
        document.head.append(script);
    });

    return turnstileLoadPromise;
}

contactTrigger.addEventListener("click", async () => {
    contactStatus.textContent = "";
    contactDialog.showModal();
    contactTrigger.setAttribute("aria-expanded", "true");

    if (isLocalPreview) {
        contactStatus.textContent = localPreviewMessage;
        return;
    }
    if (!CONTACT_TURNSTILE_SITE_KEY) {
        contactStatus.textContent = "The contact form is not configured yet.";
        return;
    }
    if (turnstileWidgetId === undefined) {
        try {
            const turnstile = await loadTurnstile();
            turnstileWidgetId = turnstile.render(contactTurnstile, {
                sitekey: CONTACT_TURNSTILE_SITE_KEY,
                action: "contact",
            });
        } catch (error) {
            console.error("Could not initialize the contact CAPTCHA:", error);
            window.siteErrorLog?.record("CAPTCHA", "The CAPTCHA could not be initialized.");
            contactStatus.textContent = "The CAPTCHA could not load. Please try again later.";
        }
    }
});

function closeContactDialog() {
    if (!contactDialog.open || contactDialogClosing) {
        return;
    }

    contactDialogClosing = true;
    contactDialog.classList.add("is-closing");
    contactDialogCloseAnimationEnd = (event) => {
        if (event.target !== contactDialog || event.animationName !== "discord-contact-disappear") {
            return;
        }

        contactDialog.removeEventListener("animationend", contactDialogCloseAnimationEnd);
        contactDialog.classList.remove("is-closing");
        contactDialogCloseAnimationEnd = undefined;
        contactDialogClosing = false;
        contactDialog.close();
    };
    contactDialog.addEventListener("animationend", contactDialogCloseAnimationEnd);
}

contactDialog.querySelector("form[method='dialog']").addEventListener("submit", (event) => {
    event.preventDefault();
    closeContactDialog();
});

contactDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeContactDialog();
});

contactDialog.addEventListener("close", () => {
    window.clearTimeout(contactDialogCloseTimeout);
    contactDialogCloseTimeout = undefined;
    if (contactDialogCloseAnimationEnd) {
        contactDialog.removeEventListener("animationend", contactDialogCloseAnimationEnd);
        contactDialogCloseAnimationEnd = undefined;
    }
    contactDialog.classList.remove("is-closing");
    contactDialogClosing = false;
    contactTrigger.setAttribute("aria-expanded", "false");
    contactTrigger.focus();
});

contactDialog.addEventListener("click", (event) => {
    if (event.target === contactDialog) {
        closeContactDialog();
    }
});

contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    contactStatus.textContent = "";

    if (isLocalPreview) {
        contactStatus.textContent = localPreviewMessage;
        return;
    }
    const photoFile = contactPhoto.files[0];
    if (photoFile && (!allowedContactPhotoTypes.includes(photoFile.type) || photoFile.size > maxContactPhotoBytes)) {
        contactStatus.textContent = "Choose a JPEG, PNG, or WebP photo no larger than 3 MB.";
        return;
    }
    const turnstile = window.turnstile;
    if (!CONTACT_TURNSTILE_SITE_KEY || !turnstile || turnstileWidgetId === undefined) {
        contactStatus.textContent = "The contact form is not configured yet.";
        return;
    }
    const turnstileToken = turnstile.getResponse(turnstileWidgetId);
    if (!turnstileToken) {
        contactStatus.textContent = "Please complete the CAPTCHA before sending.";
        return;
    }

    const formData = new FormData(contactForm);
    const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message"),
        website: formData.get("website"),
        turnstileToken,
        photo: null,
    };

    contactSubmit.disabled = true;
    contactStatus.textContent = "Sending your message…";

    try {
        if (photoFile) {
            payload.photo = {
                type: photoFile.type,
                content: await encodeFileAsBase64(photoFile),
            };
        }
        const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const result = await response.json();

        if (!response.ok) {
            window.siteErrorLog?.record("Contact form", "The server rejected the submission (HTTP " + response.status + ").");
            throw new Error(result.error || "Your message could not be sent.");
        }

        contactForm.reset();
        turnstile.reset(turnstileWidgetId);
        contactStatus.textContent = "Thanks, your message has been sent.";
        contactDialogCloseTimeout = window.setTimeout(closeContactDialog, 3000);
    } catch (error) {
        console.error("Contact form submission failed:", error);
        if (error instanceof TypeError) {
            window.siteErrorLog?.record("Contact form", "The request could not reach the contact service.");
        }
        contactStatus.textContent = error instanceof TypeError
            ? "Could not connect to the contact service. Please try again later."
            : error.message;
        turnstile.reset(turnstileWidgetId);
    } finally {
        contactSubmit.disabled = false;
    }
});
