(() => {
  "use strict";


  // Booking menu: use a simple overlay for compatibility with older mobile browsers.
  const bookingDialog = document.getElementById("booking-dialog");
  const bookingTriggers = document.querySelectorAll("[data-open-booking]");
  const closeBooking = bookingDialog && bookingDialog.querySelector("[data-close-booking]");
  let lastBookingTrigger = null;

  function openBookingMenu(trigger) {
    if (!bookingDialog) {
      window.location.href = "https://www.booking.com/Share-pNHwYV";
      return;
    }
    lastBookingTrigger = trigger || null;
    bookingDialog.hidden = false;
    bookingDialog.setAttribute("aria-hidden", "false");
    document.body.classList.add("booking-menu-open");
    if (closeBooking) closeBooking.focus();
  }

  function closeBookingMenu() {
    if (!bookingDialog || bookingDialog.hidden) return;
    bookingDialog.hidden = true;
    bookingDialog.setAttribute("aria-hidden", "true");
    document.body.classList.remove("booking-menu-open");
    if (lastBookingTrigger && document.contains(lastBookingTrigger)) lastBookingTrigger.focus();
  }

  bookingTriggers.forEach((button) => {
    button.addEventListener("click", () => openBookingMenu(button));
  });
  if (closeBooking) closeBooking.addEventListener("click", closeBookingMenu);
  if (bookingDialog) {
    bookingDialog.addEventListener("click", (event) => {
      if (event.target === bookingDialog) closeBookingMenu();
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { closeBookingMenu(); closeEnquiryDialog(); closeContactDialog(); }
  });


  // Enquiry form pop-up controls.
  const enquiryDialog = document.getElementById("enquiry-dialog");
  const enquiryTriggers = document.querySelectorAll("[data-open-enquiry]");
  const closeEnquiry = enquiryDialog && enquiryDialog.querySelector("[data-close-enquiry]");
  let lastEnquiryTrigger = null;
  function openEnquiryDialog(trigger) {
    if (!enquiryDialog) { window.location.href = "booking.html"; return; }
    lastEnquiryTrigger = trigger || null;
    enquiryDialog.hidden = false;
    enquiryDialog.setAttribute("aria-hidden", "false");
    document.body.classList.add("enquiry-menu-open");
    if (closeEnquiry) closeEnquiry.focus();
  }
  function closeEnquiryDialog() {
    if (!enquiryDialog || enquiryDialog.hidden) return;
    enquiryDialog.hidden = true;
    enquiryDialog.setAttribute("aria-hidden", "true");
    document.body.classList.remove("enquiry-menu-open");
    if (lastEnquiryTrigger && document.contains(lastEnquiryTrigger)) lastEnquiryTrigger.focus();
  }
  enquiryTriggers.forEach((button) => button.addEventListener("click", () => openEnquiryDialog(button)));
  if (closeEnquiry) closeEnquiry.addEventListener("click", closeEnquiryDialog);
  if (enquiryDialog) enquiryDialog.addEventListener("click", (event) => {
    if (event.target === enquiryDialog) closeEnquiryDialog();
  });


  // Floating Contact us menu.
  const contactDialog = document.getElementById("contact-dialog");
  const contactTriggers = document.querySelectorAll("[data-open-contact]");
  const closeContact = contactDialog && contactDialog.querySelector("[data-close-contact]");
  let lastContactTrigger = null;
  function openContactDialog(trigger) {
    if (!contactDialog) { window.location.href = "contact.html#contact-form"; return; }
    lastContactTrigger = trigger || null;
    contactDialog.hidden = false;
    contactDialog.setAttribute("aria-hidden", "false");
    document.body.classList.add("booking-menu-open");
    if (closeContact) closeContact.focus();
  }
  function closeContactDialog() {
    if (!contactDialog || contactDialog.hidden) return;
    contactDialog.hidden = true;
    contactDialog.setAttribute("aria-hidden", "true");
    document.body.classList.remove("booking-menu-open");
    if (lastContactTrigger && document.contains(lastContactTrigger)) lastContactTrigger.focus();
  }
  contactTriggers.forEach((button) => button.addEventListener("click", () => openContactDialog(button)));
  if (contactDialog) contactDialog.querySelectorAll('a[href*="#contact-form"]').forEach((link) => link.addEventListener("click", closeContactDialog));
  if (closeContact) closeContact.addEventListener("click", closeContactDialog);
  if (contactDialog) contactDialog.addEventListener("click", (event) => {
    if (event.target === contactDialog) closeContactDialog();
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Reveal content as it enters the viewport. Content remains visible by
  // default; the hidden state is enabled only after the observer is ready.
  const revealTargets = document.querySelectorAll(
    ".intro-label, .intro > div:not(.intro-label), .property-photo, .property-info, " +
    ".section-heading, .gallery-grid figure, .map-copy, .map-frame, " +
    ".contact-section > *"
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

  const gallery = document.querySelector("[data-property-gallery]");
  if (!gallery) return;

  const featuredButton = gallery.querySelector("[data-gallery-open]");
  const featuredImage = gallery.querySelector(".gallery-feature-image");
  const featuredCaption = gallery.querySelector(".gallery-feature-caption");
  const thumbnails = Array.from(gallery.querySelectorAll("[data-gallery-index]"));
  const images = thumbnails.map((button) => button.querySelector("img")).filter(Boolean);
  if (!featuredButton || !featuredImage || !images.length) return;

  let activeIndex = 0;
  let lastTrigger = null;
  let touchStartX = 0;

  function selectPhoto(index) {
    activeIndex = (index + images.length) % images.length;
    const source = images[activeIndex];
    const thumb = thumbnails[activeIndex];
    const caption = thumb.querySelector("span");
    featuredImage.src = source.currentSrc || source.src;
    featuredImage.alt = source.alt || caption?.textContent.trim() || "Sai Kwality Home property photograph";
    featuredButton.setAttribute("aria-label", "Open " + featuredImage.alt + " full screen");
    if (featuredCaption) featuredCaption.textContent = caption ? caption.textContent.trim() : featuredImage.alt;
    thumbnails.forEach((button, i) => {
      const active = i === activeIndex;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  thumbnails.forEach((button, index) => {
    const image = images[index];
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      button.disabled = true;
      button.classList.add("gallery-thumb-unavailable");
      button.setAttribute("aria-label", "Photo unavailable");
    }, { once: true });
    button.addEventListener("click", () => selectPhoto(index));
  });

  const dialog = document.createElement("dialog");
  dialog.className = "gallery-lightbox";
  dialog.setAttribute("aria-label", "Sai Kwality Home photo gallery");
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
      <div class="lightbox-stage"><img class="lightbox-image" alt=""></div>
      <p class="lightbox-caption"></p>
    </div>`;
  document.body.appendChild(dialog);

  const lightboxImage = dialog.querySelector(".lightbox-image");
  const caption = dialog.querySelector(".lightbox-caption");
  const count = dialog.querySelector(".lightbox-count");
  const previous = dialog.querySelector(".lightbox-prev");
  const next = dialog.querySelector(".lightbox-next");
  const close = dialog.querySelector(".lightbox-close");

  function showPhoto(index) {
    activeIndex = (index + images.length) % images.length;
    const source = images[activeIndex];
    const thumb = thumbnails[activeIndex];
    const label = thumb.querySelector("span");
    lightboxImage.src = source.currentSrc || source.src;
    lightboxImage.alt = source.alt || label?.textContent.trim() || "Sai Kwality Home property photograph";
    caption.textContent = label ? label.textContent.trim() : lightboxImage.alt;
    count.textContent = "Photo " + (activeIndex + 1) + " of " + images.length;
    selectPhoto(activeIndex);
    previous.disabled = next.disabled = images.length < 2;
  }
  function openPhoto(trigger) {
    lastTrigger = trigger;
    showPhoto(activeIndex);
    if (!dialog.open) dialog.showModal();
    close.focus();
  }
  function closeGallery() { if (dialog.open) dialog.close(); }

  featuredButton.addEventListener("click", () => openPhoto(featuredButton));
  previous.addEventListener("click", () => showPhoto(activeIndex - 1));
  next.addEventListener("click", () => showPhoto(activeIndex + 1));
  close.addEventListener("click", closeGallery);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeGallery(); });
  dialog.addEventListener("close", () => { if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus(); });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); showPhoto(activeIndex - 1); }
    else if (event.key === "ArrowRight") { event.preventDefault(); showPhoto(activeIndex + 1); }
  });
  dialog.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
  dialog.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(distance) > 50) showPhoto(activeIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });

  selectPhoto(0);
})();