type LightboxWindow = Window & {
    __imageLightboxKeyBound?: boolean;
};

function closeOverlay(overlay: HTMLElement): void {
    const overlayImg = overlay.querySelector(".image-lightbox__img");
    const overlayCaption = overlay.querySelector(".image-lightbox__caption");

    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("image-lightbox-open");
    overlay.classList.remove("is-ready", "is-loading", "is-error");

    if (overlayImg instanceof HTMLImageElement) {
        overlayImg.src = "";
        overlayImg.alt = "";
        overlayImg.onload = null;
        overlayImg.onerror = null;
    }

    if (overlayCaption instanceof HTMLElement) {
        overlayCaption.textContent = "";
        overlayCaption.hidden = true;
    }
}

function openOverlay(overlay: HTMLElement, img: HTMLImageElement): void {
    const overlayImg = overlay.querySelector(".image-lightbox__img");
    if (!(overlayImg instanceof HTMLImageElement)) return;

    const overlayCaption = overlay.querySelector(".image-lightbox__caption");
    const src = img.currentSrc || img.src;
    if (!src) return;

    overlayImg.alt = img.alt || "";
    overlay.classList.add("is-loading");
    overlay.classList.remove("is-ready", "is-error");
    overlayImg.onload = () => {
        overlay.classList.add("is-ready");
        overlay.classList.remove("is-loading");
    };
    overlayImg.onerror = () => {
        overlay.classList.remove("is-loading");
        overlay.classList.add("is-error");
    };
    overlayImg.src = src;

    if (overlayCaption instanceof HTMLElement) {
        const text = img.alt?.trim();
        overlayCaption.textContent = text || "";
        overlayCaption.hidden = !text;
    }

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("image-lightbox-open");
}

function setupImageLightbox(): void {
    const article = document.querySelector(".blog-article");
    const overlay = document.getElementById("image-lightbox");
    if (!(article instanceof HTMLElement) || !(overlay instanceof HTMLElement)) return;
    if (article.dataset.lightboxBound === "true") return;
    article.dataset.lightboxBound = "true";

    if (overlay.dataset.lightboxBound !== "true") {
        overlay.dataset.lightboxBound = "true";
        overlay.addEventListener("click", (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.dataset.close === "true") {
                closeOverlay(overlay);
            }
        });
    }

    article.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLImageElement)) return;
        if (target.closest("a")) return;
        if (target.dataset.noZoom === "true") return;

        event.preventDefault();
        openOverlay(overlay, target);
    });
}

function bindGlobalLightboxClose(): void {
    const globalWindow = window as LightboxWindow;
    if (globalWindow.__imageLightboxKeyBound) return;

    globalWindow.__imageLightboxKeyBound = true;
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;

        const overlay = document.getElementById("image-lightbox");
        if (!(overlay instanceof HTMLElement) || !overlay.classList.contains("is-open")) return;

        closeOverlay(overlay);
    });
}

bindGlobalLightboxClose();
document.addEventListener("DOMContentLoaded", setupImageLightbox);
document.addEventListener("astro:page-load", setupImageLightbox);

export {};
