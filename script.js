document.addEventListener("DOMContentLoaded", function () {
    const seatSelect = document.getElementById("seat");
    const confirmBtn = document.getElementById("confirmBtn");
    const confirmationMessage = document.getElementById("confirmationMessage");

    if (seatSelect) {
        seatSelect.addEventListener("change", function () {
            confirmBtn.disabled = seatSelect.value === "";
        });

        confirmBtn.addEventListener("click", function () {
            confirmationMessage.textContent = `Seat ${seatSelect.value} booked successfully!`;
            confirmationMessage.style.color = "green";
        });
    }
});
