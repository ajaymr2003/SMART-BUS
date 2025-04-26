// Import Firebase modules
import { firebaseService } from './firebase.js';

const routes = {
    '/': 'pages/home.html',
    '/about': 'pages/about.html',
    '/admin': 'pages/admin.html',
    '/booking': 'pages/booking.html',
    '/contact': 'pages/contact.html',
    '/destination': 'pages/destination.html',
    '/employee': 'pages/employee.html',
    '/info': 'pages/info.html',
    '/payment': 'pages/payment.html',
    '/ticket': 'pages/ticket.html',
};

class Router {
    constructor(contentDiv) {
        this.contentDiv = contentDiv;
        this.routes = routes;
        this.setupEventListeners();
    }

    async loadContent(path) {
        this.contentDiv.innerHTML = '<div class="loading">Loading...</div>';
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            this.contentDiv.innerHTML = html;
            this.initializePageScripts();
        } catch (error) {
            console.error('Failed to load page:', error);
            this.showError(error);
        }
    }

    initializePageScripts() {
        const currentPath = window.location.pathname;

        switch (currentPath) {
            case '/admin':
                this.initAdminPage();
                break;
            case '/ticket':
                this.initTicketPage();
                break;
            case '/payment':
                this.initPaymentPage();
                break;
        }
    }

    setupEventListeners() {
        window.addEventListener('popstate', () => this.handleLocation());
        document.addEventListener('click', (e) => this.handleClick(e));
    }

    async handleLocation() {
        const path = window.location.pathname;
        const route = this.routes[path] || this.routes['/'];

        try {
            await this.loadContent(route);
        } catch (error) {
            console.error('Error loading route:', error);
            this.showError(error);
        }
    }

    handleClick(e) {
        const { target } = e;
        if (!target.matches('a')) {
            return;
        }
        e.preventDefault();
        const href = target.getAttribute('href');
        if (href.startsWith('http') || href.startsWith('//')) {
            window.location.href = href;
            return;
        }
        window.history.pushState({}, '', href);
        this.handleLocation();
    }

    showError(error) {
        this.contentDiv.innerHTML = `<p>Error loading page. ${error.message}. <a href="/">Go Home</a></p>`;
    }

    initAdminPage() {
        if (typeof fetchPassengerData === 'function') {
            console.log("Initializing admin page data fetch...");
            if (window.fetchPassengerData) window.fetchPassengerData();
        }
    }

    initTicketPage() {
        const proceedButton = this.contentDiv.querySelector('.submit-button');
        const destinationSelect = this.contentDiv.querySelector('#destination');
        if (proceedButton && window.proceedToPayment) {
            proceedButton.onclick = window.proceedToPayment;
        }
        if (destinationSelect && window.updateAmount) {
            destinationSelect.onchange = window.updateAmount;
            window.updateAmount();
        } else if (destinationSelect && typeof updateAmount === 'function') {
            destinationSelect.onchange = updateAmount;
            updateAmount();
        }
    }

    initPaymentPage() {
        const paymentMethodSelect = this.contentDiv.querySelector('#payment-method');
        const payButton = this.contentDiv.querySelector('.pay-button');
        if (paymentMethodSelect && window.togglePaymentFields) {
            paymentMethodSelect.onchange = window.togglePaymentFields;
            window.togglePaymentFields();
        }
        if (payButton && window.processPayment) {
            payButton.onclick = window.processPayment;
        }
        const destInput = this.contentDiv.querySelector('#destination');
        const amountInput = this.contentDiv.querySelector('#amount');
        if (destInput) destInput.value = localStorage.getItem("userDestination") || 'N/A';
        if (amountInput) amountInput.value = localStorage.getItem("ticketAmount") || 'N/A';
    }
}

const router = new Router(document.getElementById('app-content'));
export default router;