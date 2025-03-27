// This script might be for the original booking.html logic.
// If pages/booking.html uses this, ensure it's loaded correctly by the router.
// Consider integrating this logic into router.js if it's simple,
// or ensure executeScripts loads and runs this correctly.

document.addEventListener("DOMContentLoaded", function () {
    // Use event delegation on the contentDiv if possible,
    // otherwise router.js needs to re-run this or re-attach listeners.

    const contentDiv = document.getElementById('app-content');

    // Example using delegation:
    contentDiv.addEventListener('change', function(event) {
        if (event.target.id === 'seat') {
            const confirmBtn = contentDiv.querySelector("#confirmBtn");
            if(confirmBtn) {
                confirmBtn.disabled = event.target.value === "";
            }
        }
    });

     contentDiv.addEventListener('click', function(event) {
        if (event.target.id === 'confirmBtn') {
            const seatSelect = contentDiv.querySelector("#seat");
            const confirmationMessage = contentDiv.querySelector("#confirmationMessage");
            if (seatSelect && confirmationMessage && seatSelect.value) {
                confirmationMessage.textContent = `Seat ${seatSelect.value} booked successfully!`;
                confirmationMessage.style.color = "green";
                // Maybe disable button again after booking
                // event.target.disabled = true;
            }
        }
    });

    // Original code (might not work reliably if DOMContentLoaded already fired)
    /*
    const seatSelect = document.getElementById("seat"); // Might be null initially
    const confirmBtn = document.getElementById("confirmBtn");
    const confirmationMessage = document.getElementById("confirmationMessage");

    if (seatSelect) { // Check if element exists after content load
        seatSelect.addEventListener("change", function () {
            if(confirmBtn) confirmBtn.disabled = seatSelect.value === "";
        });

        if (confirmBtn) {
            confirmBtn.addEventListener("click", function () {
                 if(confirmationMessage) {
                    confirmationMessage.textContent = `Seat ${seatSelect.value} booked successfully!`;
                    confirmationMessage.style.color = "green";
                 }
            });
        }
    }
    */
});

console.log("script.js loaded"); // For debugging