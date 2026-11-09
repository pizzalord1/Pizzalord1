const discordContactDialog = document.querySelector("#discordContactDialog");
const discordStatusTrigger = document.querySelector(".discord-status-trigger");
const discordContactBack = document.querySelector(".discord-contact-back");
const discordUsername = document.querySelector("#discordUsername");
const copyDiscordUsername = document.querySelector("#copyDiscordUsername");
const discordCopyStatus = document.querySelector("#discordCopyStatus");
const discordStatusTooltip = document.querySelector("#discordStatusTooltip");
let discordContactClosing = false;
let discordContactCloseAnimationEnd;

function closeDiscordContactDialog() {
    if (!discordContactDialog.open || discordContactClosing) {
        return;
    }

    discordContactClosing = true;
    discordContactDialog.classList.add("is-closing");
    discordContactCloseAnimationEnd = (event) => {
        if (event.target !== discordContactDialog || event.animationName !== "discord-contact-disappear") {
            return;
        }

        discordContactDialog.removeEventListener("animationend", discordContactCloseAnimationEnd);
        discordContactDialog.classList.remove("is-closing");
        discordContactCloseAnimationEnd = undefined;
        discordContactClosing = false;
        discordStatusTrigger.setAttribute("aria-expanded", "false");
        discordContactDialog.close();
    };
    discordContactDialog.addEventListener("animationend", discordContactCloseAnimationEnd);
}

discordStatusTrigger.addEventListener("click", () => {
    discordCopyStatus.textContent = "";
    discordContactDialog.showModal();
    discordStatusTrigger.setAttribute("aria-expanded", "true");
});

discordStatusTrigger.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
    }

    discordStatusTooltip.hidden = false;
    const gap = 12;
    const tooltipBounds = discordStatusTooltip.getBoundingClientRect();
    const left = event.clientX + gap + tooltipBounds.width <= window.innerWidth
        ? event.clientX + gap
        : event.clientX - tooltipBounds.width - gap;
    const top = event.clientY + gap + tooltipBounds.height <= window.innerHeight
        ? event.clientY + gap
        : event.clientY - tooltipBounds.height - gap;

    discordStatusTooltip.style.left = `${Math.max(8, left)}px`;
    discordStatusTooltip.style.top = `${Math.max(8, top)}px`;
});

discordStatusTrigger.addEventListener("pointerleave", () => {
    discordStatusTooltip.hidden = true;
});

discordContactBack.addEventListener("click", () => {
    closeDiscordContactDialog();
});

discordContactDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDiscordContactDialog();
});

discordContactDialog.addEventListener("close", () => {
    if (discordContactCloseAnimationEnd) {
        discordContactDialog.removeEventListener("animationend", discordContactCloseAnimationEnd);
        discordContactCloseAnimationEnd = undefined;
    }
    discordContactDialog.classList.remove("is-closing");
    discordContactClosing = false;
    discordStatusTrigger.setAttribute("aria-expanded", "false");
});

discordContactDialog.addEventListener("click", (event) => {
    if (event.target === discordContactDialog) {
        closeDiscordContactDialog();
    }
});

copyDiscordUsername.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(discordUsername.value);
        discordCopyStatus.textContent = "copied";
    } catch {
        discordUsername.select();
        discordCopyStatus.textContent = "copy failed, please try again later";
    }
});
