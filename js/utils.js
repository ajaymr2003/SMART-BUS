export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

export const validateForm = (formData, rules) => {
    const errors = {};
    Object.keys(rules).forEach(field => {
        const value = formData[field];
        const fieldRules = rules[field];
        
        if (fieldRules.required && !value) {
            errors[field] = `${field} is required`;
        }
        
        if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
            errors[field] = fieldRules.message || `Invalid ${field}`;
        }
    });
    return errors;
};

export const showToast = (message, type = 'info') => {
    // Implementation of toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};
