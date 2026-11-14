const CONTACT_TURNSTILE_SITE_KEY = "0x4AAAAAAF7yHdT0l1hZofbq";
const contactTrigger = document.querySelector("#contactTrigger");
const contactDialog = document.querySelector("#contactDialog");
const contactForm = document.querySelector("#contactForm");
const contactStatus = document.querySelector("#contactStatus");
const contactSubmit = contactForm.querySelector(".contact-submit");
const contactPhoto = document.querySelector("#contactPhoto");
const contactPhotoDropZone = document.querySelector("#contactPhotoDropZone");
const contactPhotoSelection = document.querySelector("#contactPhotoSelection");
const contactTurnstile = document.querySelector("#contactTurnstile");
const isLocalPreview = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(window.location.hostname);
const localPreviewMessage = "The contact form can only be sent from pizzalord.online.";
const maxContactPhotoBytes = 3 * 1024 * 1024;
const allowedContactPhotoTypes = ["image/jpeg", "image/png", "image/webp"];
let selectedContactPhoto = null;
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

async function detectContactPhotoType(file) {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return "image/jpeg";
    }
    if (
        bytes.length >= 8
        && bytes[0] === 0x89
        && bytes[1] === 0x50
        && bytes[2] === 0x4e
        && bytes[3] === 0x47
        && bytes[4] === 0x0d
        && bytes[5] === 0x0a
        && bytes[6] === 0x1a
        && bytes[7] === 0x0a
    ) {
        return "image/png";
    }
    if (
        bytes.length >= 12
        && String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF"
        && String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP"
    ) {
        return "image/webp";
    }
    return "";
}

async function prepareContactPhoto(file, type) {
    if (type !== "image/webp") {
        return { file, type };
    }

    const bitmap = await createImageBitmap(file);
    try {
        const maxDimension = 2048;
        const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Your browser could not prepare the WebP photo. Please choose a JPEG or PNG instead.");
        }

        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const jpeg = await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Your browser could not convert the WebP photo. Please choose a JPEG or PNG instead."));
                }
            }, "image/jpeg", 0.9);
        });
        if (jpeg.size > maxContactPhotoBytes) {
            throw new Error("The converted photo is larger than 3 MB. Please choose a smaller image.");
        }

        const filename = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return { file: new File([jpeg], filename, { type: "image/jpeg" }), type: "image/jpeg" };
    } finally {
        bitmap.close();
    }
}

function setSelectedContactPhoto(file) {
    selectedContactPhoto = file || null;
    contactPhotoSelection.textContent = file
        ? file.name + " (" + Math.ceil(file.size / 1024) + " KB). Checking image…"
        : "No photo selected.";

    if (!file) {
        return;
    }

    if (file.size > maxContactPhotoBytes) {
        contactPhotoSelection.textContent = "That photo is larger than 3 MB. Choose a smaller image.";
        return;
    }

    detectContactPhotoType(file).then((type) => {
        if (selectedContactPhoto !== file) {
            return;
        }
        contactPhotoSelection.textContent = type && allowedContactPhotoTypes.includes(type)
            ? file.name + " (" + Math.ceil(file.size / 1024) + " KB). "
                + (type === "image/webp" ? "WEBP will be sent as JPEG." : type.replace("image/", "").toUpperCase() + " ready.")
            : "That file is not a supported JPEG, PNG, or WebP image.";
    }).catch(() => {
        if (selectedContactPhoto === file) {
            contactPhotoSelection.textContent = "Could not read that photo. Try choosing it again.";
        }
    });
}

contactPhoto.addEventListener("change", () => {
    setSelectedContactPhoto(contactPhoto.files[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
    contactPhotoDropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        contactPhotoDropZone.classList.add("is-dragging");
    });
});

["dragleave", "drop"].forEach((eventName) => {
    contactPhotoDropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        if (eventName === "drop" || !contactPhotoDropZone.contains(event.relatedTarget)) {
            contactPhotoDropZone.classList.remove("is-dragging");
        }
    });
});

contactPhotoDropZone.addEventListener("drop", (event) => {
    setSelectedContactPhoto(event.dataTransfer.files[0]);
});

contactForm.addEventListener("reset", () => {
    setSelectedContactPhoto(null);
});

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
    const photoFile = selectedContactPhoto || contactPhoto.files[0];
    let photoType = "";
    if (photoFile) {
        if (photoFile.size > maxContactPhotoBytes) {
            contactStatus.textContent = "Choose a JPEG, PNG, or WebP photo no larger than 3 MB.";
            return;
        }
        try {
            photoType = await detectContactPhotoType(photoFile);
        } catch (error) {
            contactStatus.textContent = "Could not read the selected photo. Please choose it again.";
            return;
        }
        if (!allowedContactPhotoTypes.includes(photoType)) {
            contactStatus.textContent = "Choose a valid JPEG, PNG, or WebP photo no larger than 3 MB. The file extension does not matter.";
            return;
        }
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
    contactStatus.textContent = photoType === "image/webp"
        ? "Preparing your photo…"
        : "Sending your message…";

    try {
        if (photoFile) {
            const preparedPhoto = await prepareContactPhoto(photoFile, photoType);
            contactStatus.textContent = "Sending your message…";
            payload.photo = {
                type: preparedPhoto.type,
                content: await encodeFileAsBase64(preparedPhoto.file),
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
