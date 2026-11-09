const photoDialog = document.querySelector("#photoDescriptionDialog");
const photoDescription = document.querySelector("#photoDescription");
const photoAdditionalDescription = document.querySelector("#photoAdditionalDescription");
const photoDescriptionImage = document.querySelector("#photoDescriptionImage");
const photoDownloadLink = document.querySelector("#photoDownloadLink");
let photoDialogClosing = false;
let photoDialogCloseAnimationEnd;

document.querySelectorAll(".photo-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
        const photo = trigger.querySelector("img");
        const photoUrl = photo.currentSrc || photo.src;
        const photoFilename = photoUrl.split("/").pop().split("?")[0];
        const extraDescription = trigger.dataset.description || "";

        photoDescription.textContent = photo.alt;
        photoAdditionalDescription.textContent = extraDescription;
        photoAdditionalDescription.hidden = extraDescription === "";
        photoDescriptionImage.src = photoUrl;
        photoDescriptionImage.alt = photo.alt;
        photoDownloadLink.href = photoUrl;
        photoDownloadLink.download = photoFilename;
        photoDialog.classList.remove("is-closing");
        photoDialogClosing = false;
        photoDialog.showModal();
    });
});

function closePhotoDialog() {
    if (!photoDialog.open || photoDialogClosing) {
        return;
    }

    photoDialogClosing = true;
    photoDialog.classList.add("is-closing");
    photoDialogCloseAnimationEnd = (event) => {
        if (event.target !== photoDialog || event.animationName !== "discord-contact-disappear") {
            return;
        }

        photoDialog.removeEventListener("animationend", photoDialogCloseAnimationEnd);
        photoDialog.classList.remove("is-closing");
        photoDialogCloseAnimationEnd = undefined;
        photoDialogClosing = false;
        photoDialog.close();
    };
    photoDialog.addEventListener("animationend", photoDialogCloseAnimationEnd);
}

photoDialog.querySelector("form[method='dialog']").addEventListener("submit", (event) => {
    event.preventDefault();
    closePhotoDialog();
});

photoDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePhotoDialog();
});

photoDialog.addEventListener("close", () => {
    if (photoDialogCloseAnimationEnd) {
        photoDialog.removeEventListener("animationend", photoDialogCloseAnimationEnd);
        photoDialogCloseAnimationEnd = undefined;
    }
    photoDialog.classList.remove("is-closing");
    photoDialogClosing = false;
});

photoDialog.addEventListener("click", (event) => {
    if (event.target === photoDialog) {
        closePhotoDialog();
    }
});
