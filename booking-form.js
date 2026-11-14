(() => {
  "use strict";

  const form = document.querySelector("[data-ajax-enquiry]");
  if (!form) return;

  const checkIn = form.querySelector("#enquiry-arrival");
  const checkOut = form.querySelector("#enquiry-departure");
  const phone = form.querySelector("#enquiry-phone");
  const submit = form.querySelector(".enquiry-submit");
  const status = form.querySelector("[data-enquiry-status]");
  const originalButton = submit.innerHTML;

  // Use a local calendar date (not UTC) to avoid timezone date shifts.
  const today = new Date();
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
  checkIn.min = localToday;
  checkOut.min = localToday;

  checkIn.addEventListener("change", () => {
    const arrival = checkIn.value;
    checkOut.disabled = !arrival;
    if (!arrival) {
      checkOut.value = "";
      checkOut.min = localToday;
      return;
    }
    const nextDay = new Date(arrival + "T12:00:00");
    nextDay.setDate(nextDay.getDate() + 1);
    const minDeparture = [
      nextDay.getFullYear(),
      String(nextDay.getMonth() + 1).padStart(2, "0"),
      String(nextDay.getDate()).padStart(2, "0")
    ].join("-");
    checkOut.min = minDeparture;
    if (checkOut.value && checkOut.value < minDeparture) checkOut.value = "";
  });

  // Telephone fields accept international punctuation, but not alphabetic characters.
  phone.addEventListener("input", () => {
    phone.value = phone.value.replace(/[^0-9+().\s-]/g, "").slice(0, 20);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    status.classList.remove("is-error", "is-success");

    if (checkIn.value && checkOut.value && checkOut.value <= checkIn.value) {
      status.textContent = "Please choose a check-out date after your check-in date.";
      status.classList.add("is-error");
      checkOut.focus();
      return;
    }
    if (!form.reportValidity()) return;

    submit.disabled = true;
    submit.innerHTML = "Sending enquiry…";
    status.textContent = "Sending your enquiry securely. Please keep this page open.";
    status.classList.remove("is-error", "is-success");

    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      // FormSubmit's AJAX API reports success as the string "true".
      if (String(result.success) !== "true") {
        throw new Error(result.message || "We couldn't send your enquiry just now. Please try again.");
      }

      form.reset();
      checkIn.min = localToday;
      checkOut.min = localToday;
      checkOut.disabled = true;
      status.textContent = "Thanks! Your enquiry has been sent. We'll be in touch as soon as we can.";
      status.classList.add("is-success");
    } catch (error) {
      status.textContent = error.message || "Something went wrong. Please try again, or email saikwalityhome@gmail.com directly.";
      status.classList.add("is-error");
    } finally {
      submit.disabled = false;
      submit.innerHTML = originalButton;
    }
  });
})();
