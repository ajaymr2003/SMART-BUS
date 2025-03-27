// Import Firebase modules if needed globally or move imports to specific route handlers
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js"; // Use version from your existing code
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// Firebase configuration (centralized)
const firebaseConfig = {
    apiKey: "AIzaSyB7AAT6A6FggiKYVkD7D-r3C4dkOSONNvw", // Use your actual key
    authDomain: "smartbus-eff5b.firebaseapp.com",
    projectId: "smartbus-eff5b",
    storageBucket: "smartbus-eff5b.firebasestorage.app",
    messagingSenderId: "893667460966",
    appId: "1:893667460966:web:3acfe1e753621d591f6aa7"
};

// Initialize Firebase
let app;
let db;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully in router.");
} catch (error) {
    console.error("Firebase initialization failed:", error);
    // Optionally display an error to the user
}


const routes = {
    '/': 'pages/home.html',
    '/1': 'pages/1.html', // Keep if needed, maybe rename?
    '/about': 'pages/about.html',
    '/admin': 'pages/admin.html',
    '/booking': 'pages/booking.html',
    '/contact': 'pages/contact.html',
    '/destination': 'pages/destination.html',
    '/employee': 'pages/employee.html',
    '/info': 'pages/info.html',
    '/more': 'pages/more.html',
    '/payment': 'pages/payment.html',
    '/ticket': 'pages/ticket.html',
};

const contentDiv = document.getElementById('app-content');

// Function to execute scripts found in the loaded HTML
const executeScripts = (containerElement) => {
    const scripts = containerElement.querySelectorAll('script');
    scripts.forEach(script => {
        const newScript = document.createElement('script');
        // Copy attributes like type, src, module
        script.getAttributeNames().forEach(attr => newScript.setAttribute(attr, script.getAttribute(attr)));
        newScript.textContent = script.textContent; // Copy inline script content

        // Special handling for modules if src is not present (inline module)
        // Note: Dynamically adding inline modules like this is complex and might not work reliably across all browsers.
        // It's often better to load modules via `import()` dynamically within the router logic for the specific route.
        // However, for Firebase setup in admin/ticket, they might need to be structured differently.

        // If it's a module script with a src, let the browser handle it.
        // If it's a regular script (with or without src), appending should work.
        // If it's an INLINE module script, this simple clone/append might fail.
        if (script.type === 'module' && !script.src) {
             console.warn("Inline module script detected. Execution might be unreliable:", script.textContent.substring(0, 100) + "...");
             // Attempt execution (may fail)
             try {
                // This is a basic attempt, might need more robust solution
                // Consider using dynamic import() for specific functionalities needed by the page
                eval(script.textContent); // Using eval is generally discouraged, but might be needed for simple inline modules here
             } catch (e) {
                 console.error("Error executing inline module script:", e);
             }
        } else {
             script.parentNode.replaceChild(newScript, script); // Replace old script node with new one to trigger execution
        }

    });
};


// Function to load content
const loadContent = async (path) => {
    contentDiv.innerHTML = '<p>Loading...</p>'; // Show loading indicator
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        contentDiv.innerHTML = html;
        executeScripts(contentDiv); // Execute scripts after content is loaded

        // --- Route Specific Initialization ---
        // Add any JS initialization needed *after* the specific page's HTML and scripts are loaded.

        // Example: Re-attach event listeners if needed (using event delegation on `contentDiv` is better)

        // Specific logic for pages that need Firebase *after* loading
        const currentHash = window.location.hash.substring(1) || '/';

        if (currentHash === '/admin' && typeof fetchPassengerData === 'function') {
             console.log("Initializing admin page data fetch...");
             // fetchPassengerData(); // This function should be defined globally by the loaded admin.html script
             // Safer: Find the function if it's attached to window or defined globally
             if (window.fetchPassengerData) window.fetchPassengerData();

        } else if (currentHash === '/ticket') {
            // Attach event listeners defined in ticket.html's script
             const proceedButton = contentDiv.querySelector('.submit-button');
             const destinationSelect = contentDiv.querySelector('#destination');
             if (proceedButton && window.proceedToPayment) {
                 proceedButton.onclick = window.proceedToPayment; // Re-attach listener
             }
             if (destinationSelect && window.updateAmount) {
                 destinationSelect.onchange = window.updateAmount; // Re-attach listener
                 window.updateAmount(); // Call initially
             } else if (destinationSelect && typeof updateAmount === 'function') { // Check global scope too
                 destinationSelect.onchange = updateAmount;
                 updateAmount();
             }

        } else if (currentHash === '/payment') {
            // Re-attach listeners and load data for payment page
            const paymentMethodSelect = contentDiv.querySelector('#payment-method');
            const payButton = contentDiv.querySelector('.pay-button');
            if(paymentMethodSelect && window.togglePaymentFields) {
                paymentMethodSelect.onchange = window.togglePaymentFields;
                window.togglePaymentFields(); // Initial call
            }
            if(payButton && window.processPayment) {
                payButton.onclick = window.processPayment;
            }
            // Load stored data
            const destInput = contentDiv.querySelector('#destination');
            const amountInput = contentDiv.querySelector('#amount');
             if (destInput) destInput.value = localStorage.getItem("userDestination") || 'N/A';
             if (amountInput) amountInput.value = localStorage.getItem("ticketAmount") || 'N/A';

        } else if (currentHash === '/' && typeof fetchData === 'function') {
             console.log("Initializing home page data fetch...");
             // fetchData(); // Call the function defined in home.html's script
             if (window.fetchData) window.fetchData();
        }


    } catch (error) {
        console.error('Failed to load page:', error);
        contentDiv.innerHTML = `<p>Error loading page. ${error.message}. <a href="#/">Go Home</a></p>`;
    }
};

// Function to handle routing
const handleRouteChange = () => {
    const hash = window.location.hash.substring(1) || '/'; // Get hash path, default to '/'
    const path = routes[hash];

    if (path) {
        loadContent(path);
    } else {
        // Handle 404 Not Found
        contentDiv.innerHTML = '<p>Page not found (404). <a href="#/">Go Home</a></p>';
    }
};

// --- Global Firebase Functions (Moved from specific pages if possible/needed) ---
// These functions need to be globally accessible or passed to the loaded scripts if needed.
// Making them global (attach to window) is easier for this simple setup.

// From admin.html
window.fetchPassengerData = async function() {
    if (!db) { console.error("Firestore DB not initialized"); return; }
    console.log("Fetching passenger data for admin...");
    const passengerTable = document.getElementById("passengerTable");
    const summaryTable = document.getElementById("destinationSummary");
    const totalPassengersSpan = document.getElementById("totalPassengers");

    if (!passengerTable || !summaryTable || !totalPassengersSpan) {
         console.error("Admin page elements not found.");
         return;
     }

    passengerTable.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>"; // Loading indicator

    try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        passengerTable.innerHTML = ""; // Clear loading/existing rows

        let destinationCounts = {};
        let totalPassengers = 0;

        if (querySnapshot.empty) {
             passengerTable.innerHTML = "<tr><td colspan='4'>No passenger data found.</td></tr>";
        }

        querySnapshot.forEach((doc) => {
            let data = doc.data();
            // Basic validation
            const name = data.name || 'N/A';
            const amount = data.amount || 'N/A';
            const phone = data.phone || 'N/A';
            const destination = data.destination || 'N/A';

            let row = `<tr>
                <td>${name}</td>
                <td>₹${amount}</td>
                <td>${phone}</td>
                <td>${destination}</td>
            </tr>`;
            passengerTable.innerHTML += row;

            if (destination !== 'N/A') {
                destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
            }
            totalPassengers++;
        });

        totalPassengersSpan.textContent = totalPassengers;
        updateDestinationSummary(destinationCounts);

    } catch (error) {
        console.error("Error fetching passenger data:", error);
        passengerTable.innerHTML = `<tr><td colspan='4' style='color:red;'>Error loading data: ${error.message}</td></tr>`;
    }
}

// Helper for admin summary
window.updateDestinationSummary = function(destinationCounts) {
     const summaryTable = document.getElementById("destinationSummary");
     if (!summaryTable) return;
     summaryTable.innerHTML = "";
     if (Object.keys(destinationCounts).length === 0) {
          summaryTable.innerHTML = "<tr><td colspan='2'>No destination summary available.</td></tr>";
          return;
      }
     for (let destination in destinationCounts) {
         let row = `<tr><td>${destination}</td><td>${destinationCounts[destination]}</td></tr>`;
         summaryTable.innerHTML += row;
     }
}


// From admin.html - Search (needs to be global or re-attached)
window.searchPassenger = function() {
    let input = document.getElementById("searchInput")?.value.toLowerCase();
    let rows = document.getElementById("passengerTable")?.getElementsByTagName("tr");
    if (!input || !rows) return;

    for (let i = 0; i < rows.length; i++) {
        let rowData = rows[i].textContent.toLowerCase();
        rows[i].style.display = rowData.includes(input) ? "" : "none";
    }
}

// From ticket.html
window.updateAmount = function() {
    const destinationSelect = document.getElementById("destination");
    const amountInput = document.getElementById("amount");
    if (!destinationSelect || !amountInput) return;
    let selectedOption = destinationSelect.options[destinationSelect.selectedIndex];
    amountInput.value = selectedOption ? selectedOption.getAttribute("data-amount") : '';
}

window.proceedToPayment = async function() {
     if (!db) { console.error("Firestore DB not initialized"); return; }
     let name = document.getElementById("name")?.value;
     let phone = document.getElementById("phone")?.value;
     let destination = document.getElementById("destination")?.value;
     let amount = document.getElementById("amount")?.value;

     if (!name || !phone || !amount || !destination) {
         alert("Please enter all details.");
         return;
     }

     try {
         console.log("Storing booking:", { name, phone, destination, amount });
         const docRef = await addDoc(collection(db, "bookings"), {
             name: name,
             phone: phone,
             destination: destination,
             amount: amount, // Store as string or number? Ensure consistency
             timestamp: new Date()
         });
         console.log("Booking stored with ID: ", docRef.id);

         // Store in localStorage for payment page
         localStorage.setItem("userName", name);
         localStorage.setItem("userPhone", phone);
         localStorage.setItem("userDestination", destination);
         localStorage.setItem("ticketAmount", amount);

         // Navigate to payment page using hash
         window.location.hash = '#/payment';

     } catch (error) {
         console.error("Error storing booking:", error);
         alert(`Error processing booking: ${error.message}. Please try again.`);
     }
}

// From payment.html
window.togglePaymentFields = function() {
     let method = document.getElementById("payment-method")?.value;
     const cardDetails = document.getElementById("card-details");
     const upiDetails = document.getElementById("upi-details");
     const netbankingDetails = document.getElementById("netbanking-details");

     if(cardDetails) cardDetails.style.display = method === "card" ? "block" : "none";
     if(upiDetails) upiDetails.style.display = method === "upi" ? "block" : "none";
     if(netbankingDetails) netbankingDetails.style.display = method === "netbanking" ? "block" : "none";
}

window.processPayment = function() {
     // In a real app, integrate with a payment gateway here.
     // For this example, just simulate success.
     alert("Payment Successful! Your ticket is booked. (Simulation)");

     // Optionally clear local storage after successful payment simulation
     // localStorage.removeItem("userName");
     // localStorage.removeItem("userPhone");
     // localStorage.removeItem("userDestination");
     // localStorage.removeItem("ticketAmount");

     // Redirect to home page
     window.location.hash = '#/';
}

// From home.html (original index.html data fetch)
window.fetchData = async function() {
    if (!db) { console.error("Firestore DB not initialized for home page"); return; }
    console.log("Fetching data from Firestore for home...");
    let dataContainer = document.getElementById("data-display");
    if (!dataContainer) { console.log("Data display container not found on home page."); return; }

    dataContainer.innerHTML = "<p>Loading data...</p>"; // Temporary message

    try {
        const querySnapshot = await getDocs(collection(db, "test")); // Using 'test' collection as in original index.html
        dataContainer.innerHTML = ""; // Clear loading message

        if (querySnapshot.empty) {
            console.warn("No data found in the 'test' collection.");
            dataContainer.innerHTML = "<p>No test data found.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            let data = doc.data();
            console.log(`Fetched document: ${doc.id} -> Data: ${JSON.stringify(data)}`); // Log fetched data

            let para = document.createElement("p");
             // Displaying the raw data object - adjust as needed
            para.textContent = `Test Data (${doc.id}): ${JSON.stringify(data)}`;
            dataContainer.appendChild(para);
        });
    } catch (error) {
        console.error("Error fetching test data:", error);
        dataContainer.innerHTML = `<p style="color:red;">Error loading test data: ${error.message}</p>`;
    }
}

// --- Event Listeners ---
// Listen for hash changes
window.addEventListener('hashchange', handleRouteChange);

// Load initial content based on the current hash when the page loads
window.addEventListener('DOMContentLoaded', handleRouteChange);