// Global variables
let currentUser = null;
const users = [
    {
        email: "student@example.com",
        password: "Password123",
        name: "John Doe",
        course: "Computer Science",
        installments: [
            { 
                number: 1, 
                amount: 5000, 
                dueDate: "2023-12-15", 
                paid: true, 
                paidDate: "2023-12-10",
                transactionId: "TXN123456"
            },
            { 
                number: 2, 
                amount: 5000, 
                dueDate: "2024-01-15", 
                paid: false
            },
            { 
                number: 3, 
                amount: 5000, 
                dueDate: "2024-01-27", 
                paid: false
            },
            { 
                number: 4, 
                amount: 5000, 
                dueDate: "2024-02-15", 
                paid: false
            }
        ]
    }
];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize local storage
    initLocalStorage();

    // Check if user is logged in
    checkAuth();

    // Setup event listeners based on current page
    const path = window.location.pathname.split('/').pop();
    switch(path) {
        case 'index.html':
            setupLoginPage();
            break;
        case 'register.html':
            setupRegisterPage();
            break;
        case 'dashboard.html':
            setupDashboardPage();
            break;
        case 'payment.html':
            setupPaymentPage();
            break;
        case 'history.html':
            setupHistoryPage();
            break;
    }
});

// Initialize local storage
function initLocalStorage() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(users));
    }
    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(null));
    }
}

// Check authentication status
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const path = window.location.pathname.split('/').pop();

    // Redirect to login if not authenticated and trying to access protected pages
    const protectedPages = ['dashboard.html', 'payment.html', 'history.html'];
    if (!user && protectedPages.includes(path)) {
        window.location.href = 'index.html';
    }

    // Redirect to dashboard if authenticated and trying to access login/register
    if (user && (path === 'index.html' || path === 'register.html')) {
        window.location.href = 'dashboard.html';
    }

    currentUser = user;
}

// Login Page Setup
function setupLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const storedUsers = JSON.parse(localStorage.getItem('users'));
            const user = storedUsers.find(u => u.email === email && u.password === password);
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid email or password');
            }
        });
    }
}

// Register Page Setup
function setupRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('full-name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            if (password.length < 8) {
                alert('Password must be at least 8 characters');
                return;
            }

            const storedUsers = JSON.parse(localStorage.getItem('users'));
            if (storedUsers.some(u => u.email === email)) {
                alert('Email already registered');
                return;
            }

            const newUser = {
                email,
                password,
                name,
                course: "Computer Science",
                installments: [
                    { number: 1, amount: 5000, dueDate: getFutureDate(30), paid: false },
                    { number: 2, amount: 5000, dueDate: getFutureDate(60), paid: false },
                    { number: 3, amount: 5000, dueDate: getFutureDate(90), paid: false },
                    { number: 4, amount: 5000, dueDate: getFutureDate(120), paid: false }
                ]
            };

            storedUsers.push(newUser);
            localStorage.setItem('users', JSON.stringify(storedUsers));
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            window.location.href = 'dashboard.html';
        });
    }
}

// Dashboard Page Setup
function setupDashboardPage() {
    if (!currentUser) return;

    // Calculate progress
    const paidCount = currentUser.installments.filter(i => i.paid).length;
    const totalCount = currentUser.installments.length;
    const progressPercent = (paidCount / totalCount) * 100;

    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }

    // Setup logout button
    const logoutBtn = document.querySelector('button[onclick="logout()"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// Payment Page Setup
function setupPaymentPage() {
    if (!currentUser) return;

    // Payment method toggle
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            document.getElementById('credit-card-form').classList.toggle('hidden', this.id !== 'credit-card');
        }
