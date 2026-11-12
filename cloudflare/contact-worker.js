const ALLOWED_ORIGIN = "https://pizzalord.online";
const ALLOWED_HOSTNAME = "pizzalord.online";
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const MAX_BODY_BYTES = Math.ceil(MAX_PHOTO_BYTES / 3) * 4 + 64 * 1024;

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}

function getString(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getPhotoAttachment(photo) {
    if (photo === undefined || photo === null) {
        return undefined;
    }
    if (!photo || typeof photo !== "object" || Array.isArray(photo)) {
        return null;
    }

    const extensions = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    };
    const extension = extensions[photo.type];
    const content = photo.content;
    if (!extension
        || typeof content !== "string"
        || content.length === 0
        || content.length > Math.ceil(MAX_PHOTO_BYTES / 3) * 4
        || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(content)) {
        return null;
    }

    let bytes;
    try {
        bytes = Uint8Array.from(atob(content), (character) => character.charCodeAt(0));
    } catch {
        return null;
    }
    if (bytes.length === 0 || bytes.length > MAX_PHOTO_BYTES) {
        return null;
    }

    const isJpeg = photo.type === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = photo.type === "image/png"
        && bytes.length >= 8
        && bytes[0] === 0x89
        && bytes[1] === 0x50
        && bytes[2] === 0x4e
        && bytes[3] === 0x47
        && bytes[4] === 0x0d
        && bytes[5] === 0x0a
        && bytes[6] === 0x1a
        && bytes[7] === 0x0a;
    const isWebp = photo.type === "image/webp"
        && bytes.length >= 12
        && String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF"
        && String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP";
    if (!isJpeg && !isPng && !isWebp) {
        return null;
    }

    return {
        content: bytes,
        filename: `contact-photo.${extension}`,
        type: photo.type,
        disposition: "attachment",
    };
}

async function verifyTurnstile(token, secret, ip) {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) {
        body.set("remoteip", ip);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    });
    if (!response.ok) {
        throw new Error(`Turnstile verification returned HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.success
        && result.hostname === ALLOWED_HOSTNAME
        && result.action === "contact";
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname !== "/api/contact") {
            return jsonResponse({ error: "Not found." }, 404);
        }
        if (request.method !== "POST") {
            return jsonResponse({ error: "Method not allowed." }, 405);
        }
        if (request.headers.get("Origin") !== ALLOWED_ORIGIN) {
            return jsonResponse({ error: "Request origin is not allowed." }, 403);
        }
        if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
            return jsonResponse({ error: "Expected a JSON request." }, 415);
        }
        let payload;
        try {
            const rawBody = await request.text();
            if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
                return jsonResponse({ error: "Message or photo is too large." }, 413);
            }
            payload = JSON.parse(rawBody);
        } catch {
            return jsonResponse({ error: "Invalid request body." }, 400);
        }
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            return jsonResponse({ error: "Invalid request body." }, 400);
        }

        const name = getString(payload.name, 100);
        const email = getString(payload.email, 254);
        const message = getString(payload.message, 5000);
        const website = getString(payload.website, 200);
        const turnstileToken = getString(payload.turnstileToken, 2048);
        if (website) {
            return jsonResponse({ success: true });
        }
        const photo = getPhotoAttachment(payload.photo);
        if (payload.photo !== undefined && payload.photo !== null && !photo) {
            return jsonResponse({ error: "Please choose a valid JPEG, PNG, or WebP photo up to 3 MB." }, 400);
        }
        if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !turnstileToken) {
            return jsonResponse({ error: "Please check the form and CAPTCHA, then try again." }, 400);
        }
        const missingConfiguration = [
            !env.TURNSTILE_SECRET_KEY && "TURNSTILE_SECRET_KEY",
            !env.CONTACT_RECIPIENT && "CONTACT_RECIPIENT",
            !env.EMAIL && "EMAIL",
        ].filter(Boolean);
        if (missingConfiguration.length > 0) {
            console.error("Contact Worker is missing configuration:", missingConfiguration);
            return jsonResponse({ error: "The contact service is not configured yet." }, 503);
        }

        try {
            const verified = await verifyTurnstile(
                turnstileToken,
                env.TURNSTILE_SECRET_KEY,
                request.headers.get("CF-Connecting-IP"),
            );
            if (!verified) {
                return jsonResponse({ error: "CAPTCHA verification failed. Please try again." }, 400);
            }

            const emailMessage = {
                to: env.CONTACT_RECIPIENT,
                from: env.SENDER_EMAIL,
                replyTo: email,
                subject: "New message from pizzalord.online",
                text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
            };
            if (photo) {
                emailMessage.attachments = [photo];
            }
            await env.EMAIL.send(emailMessage);
        } catch (error) {
            console.error("Contact message could not be processed:", error);
            return jsonResponse({ error: "An error has occured, and your message could not be sent. Try again later" }, 502);
        }

        return jsonResponse({ success: true });
    },
};
