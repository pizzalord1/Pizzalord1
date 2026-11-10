const ALLOWED_ORIGIN = "https://pizzalord.online";
const ALLOWED_HOSTNAME = "pizzalord.online";
const MAX_BODY_BYTES = 7000;

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
                return jsonResponse({ error: "Message is too large." }, 413);
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
        if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !turnstileToken) {
            return jsonResponse({ error: "Please check the form and CAPTCHA, then try again." }, 400);
        }
        if (!env.TURNSTILE_SECRET_KEY || !env.CONTACT_RECIPIENT || !env.EMAIL) {
            console.error("Contact Worker is missing a required secret or email binding.");
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

            await env.EMAIL.send({
                to: env.CONTACT_RECIPIENT,
                from: env.SENDER_EMAIL,
                replyTo: email,
                subject: "New message from pizzalord.online",
                text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
            });
        } catch (error) {
            console.error("Contact message could not be processed:", error);
            return jsonResponse({ error: "Your message could not be sent. Please try again later." }, 502);
        }

        return jsonResponse({ success: true });
    },
};
