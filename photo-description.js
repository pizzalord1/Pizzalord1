const photoDialog = document.querySelector("#photoDescriptionDialog");
const photoDescription = document.querySelector("#photoDescription");
const photoDescriptionImage = document.querySelector("#photoDescriptionImage");
const photoFullSizeLink = document.querySelector("#photoFullSizeLink");
const photoDownloadLink = document.querySelector("#photoDownloadLink");

document.querySelectorAll(".photo-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
        const photo = trigger.querySelector("img");
        const photoUrl = photo.currentSrc || photo.src;
        const photoFilename = photoUrl.split("/").pop().split("?")[0];

        photoDescription.textContent = photo.alt;
        photoDescriptionImage.src = photoUrl;
        photoDescriptionImage.alt = photo.alt;
        photoFullSizeLink.href = photoUrl;
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
