const discordContactDialog = document.querySelector("#discordContactDialog");
const discordStatusTrigger = document.querySelector(".discord-status-trigger");
const discordContactBack = document.querySelector(".discord-contact-back");
const discordUsername = document.querySelector("#discordUsername");
const copyDiscordUsername = document.querySelector("#copyDiscordUsername");
const discordCopyStatus = document.querySelector("#discordCopyStatus");

discordStatusTrigger.addEventListener("click", () => {
    discordCopyStatus.textContent = "";
    discordContactDialog.showModal();
});

discordContactBack.addEventListener("click", () => {
    discordContactDialog.close();
});

discordContactDialog.addEventListener("click", (event) => {
    if (event.target === discordContactDialog) {
        discordContactDialog.close();
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
