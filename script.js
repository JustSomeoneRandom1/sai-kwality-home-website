(() => {
  "use strict";

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Reveal content as it enters the viewport. Content remains visible by
  // default; the hidden state is enabled only after the observer is ready.
  const revealTargets = document.querySelectorAll(
    ".intro-label, .intro > div:not(.intro-label), .property-photo, .property-info, " +
    ".section-heading, .gallery-grid figure, .map-copy, .map-frame, " +
    ".contact-section > *, footer > *"
  );
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window && revealTargets.length) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -10% 0px" });

    revealTargets.forEach((element, index) => {
      element.classList.add("reveal-on-scroll");
      if (element.matches(".gallery-grid figure")) {
        element.style.setProperty("--reveal-delay", (index % 4) * 100 + "ms");
      }
      revealObserver.observe(element);
    });
    // Add this only after every target is observed, so a JS error or an
    // unsupported browser can never leave page content hidden.
    document.documentElement.classList.add("has-scroll-reveal");
  }

  const gallery = document.querySelector(".gallery-grid");
  if (!gallery) return;

  const items = Array.from(gallery.querySelectorAll("figure")).filter((figure) => {
    const image = figure.querySelector("img");
    return image && image.getAttribute("src");
  });

  if (!items.length) return;

  items.forEach((figure, index) => {
    const image = figure.querySelector("img");
    figure.setAttribute("tabindex", "0");
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-haspopup", "dialog");
    figure.setAttribute("aria-label", "Enlarge photo: " + (image.alt || "Property photo"));
    figure.dataset.galleryIndex = String(index);
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      figure.classList.add("gallery-placeholder");
      figure.setAttribute("aria-disabled", "true");
      figure.removeAttribute("tabindex");
      figure.removeAttribute("role");
    }, { once: true });
  });

  const dialog = document.createElement("dialog");
  dialog.className = "gallery-lightbox";
  dialog.setAttribute("aria-label", "Property photo gallery");
  dialog.innerHTML = `
    <div class="lightbox-layout">
      <div class="lightbox-toolbar">
        <span class="lightbox-count" aria-live="polite"></span>
        <div class="lightbox-controls">
          <button class="lightbox-button lightbox-prev" type="button" aria-label="Previous photo">‹</button>
          <button class="lightbox-button lightbox-next" type="button" aria-label="Next photo">›</button>
          <button class="lightbox-button lightbox-close" type="button" aria-label="Close gallery">×</button>
        </div>
      </div>
      <div class="lightbox-stage">
        <img class="lightbox-image" alt="">
      </div>
      <p class="lightbox-caption"></p>
    </div>`;
  document.body.appendChild(dialog);

  const lightboxImage = dialog.querySelector(".lightbox-image");
  const caption = dialog.querySelector(".lightbox-caption");
  const count = dialog.querySelector(".lightbox-count");
  const previous = dialog.querySelector(".lightbox-prev");
  const next = dialog.querySelector(".lightbox-next");
  const close = dialog.querySelector(".lightbox-close");
  let activeIndex = 0;
  let lastTrigger = null;
  let touchStartX = 0;

  function showPhoto(index) {
    activeIndex = (index + items.length) % items.length;
    const source = items[activeIndex];
    const image = source.querySelector("img");
    const label = source.querySelector("figcaption");
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "Sai Kwality Homes property photograph";
    caption.textContent = label ? label.textContent.trim() : lightboxImage.alt;
    count.textContent = (activeIndex + 1) + " / " + items.length;
    previous.disabled = items.length < 2;
    next.disabled = items.length < 2;
  }

  function openPhoto(index, trigger) {
    lastTrigger = trigger;
    showPhoto(index);
    if (!dialog.open) dialog.showModal();
    close.focus();
  }

  function closeGallery() {
    if (dialog.open) dialog.close();
  }

  items.forEach((figure, index) => {
    figure.addEventListener("click", () => {
      if (!figure.classList.contains("gallery-placeholder")) openPhoto(index, figure);
    });
    figure.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!figure.classList.contains("gallery-placeholder")) openPhoto(index, figure);
      }
    });
  });

  previous.addEventListener("click", () => showPhoto(activeIndex - 1));
  next.addEventListener("click", () => showPhoto(activeIndex + 1));
  close.addEventListener("click", closeGallery);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeGallery();
  });
  dialog.addEventListener("close", () => {
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPhoto(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(activeIndex + 1);
    }
  });
  dialog.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });
  dialog.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(distance) > 50) showPhoto(activeIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });
})();