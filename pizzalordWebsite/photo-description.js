const photoDialog = document.querySelector("#photoDescriptionDialog");
const photoDescription = document.querySelector("#photoDescription");
const photoAdditionalDescription = document.querySelector("#photoAdditionalDescription");
const photoDescriptionImage = document.querySelector("#photoDescriptionImage");
const photoDownloadLink = document.querySelector("#photoDownloadLink");
const carouselSlideToggles = document.querySelectorAll(".carousel-slide-toggle");
let photoDialogClosing = false;
let photoDialogCloseAnimationEnd;

function loadCarouselSlide(toggle) {
    const slides = toggle.parentElement.querySelectorAll(".carousel-item");
    const slide = slides[[...carouselSlideToggles].indexOf(toggle)];
    const picture = slide?.querySelector("picture");
    const source = picture?.querySelector("source[data-srcset]");
    const image = picture?.querySelector("img[data-src]");

    if (source) {
        source.srcset = source.dataset.srcset;
        delete source.dataset.srcset;
    }

    if (image) {
        image.loading = "eager";
        image.src = image.dataset.src;
        delete image.dataset.src;
    }
}

carouselSlideToggles.forEach((toggle) => {
    toggle.addEventListener("change", () => {
        if (toggle.checked) {
            loadCarouselSlide(toggle);
        }
    });
});

const initialCarouselSlide = [...carouselSlideToggles].find((toggle) => toggle.checked);
if (initialCarouselSlide) {
    loadCarouselSlide(initialCarouselSlide);
}

document.querySelectorAll(".photo-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
        const photo = trigger.querySelector("img");
        const photoUrl = photo.currentSrc || photo.src;
        const downloadUrl = photo.dataset.download || photoUrl;
        const photoFilename = downloadUrl.split("/").pop().split("?")[0];
        const extraDescription = trigger.dataset.description || "";

        photoDescription.textContent = photo.alt;
        photoAdditionalDescription.textContent = extraDescription;
        photoAdditionalDescription.hidden = extraDescription === "";
        photoDescriptionImage.src = photoUrl;
        photoDescriptionImage.alt = photo.alt;
        photoDownloadLink.href = downloadUrl;
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
