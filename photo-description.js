const photoDialog = document.querySelector("#photoDescriptionDialog");
const photoDescription = document.querySelector("#photoDescription");
const photoAdditionalDescription = document.querySelector("#photoAdditionalDescription");
const photoDescriptionImage = document.querySelector("#photoDescriptionImage");
const photoDownloadLink = document.querySelector("#photoDownloadLink");

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
        photoDialog.showModal();
    });
});

photoDialog.addEventListener("click", (event) => {
    if (event.target === photoDialog) {
        photoDialog.close();
    }
});
