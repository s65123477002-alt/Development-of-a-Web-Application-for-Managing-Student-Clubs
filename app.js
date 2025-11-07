/**
 * ============================================
 * MAIN APPLICATION
 * ============================================
 * จุดเริ่มต้นของแอปพลิเคชัน
 */

// Application State
const App = {
    // Global state
    state: {
        currentUser: null,
        currentPage: 'home',
        registeredUsers: []
    },

    /**
     * Initialize Application
     */
    init() {
        console.log('🚀 Initializing Student Club System...');
        
        // Load saved data
        this.loadSavedData();
        
        // Initialize all modules
        this.initModules();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show initial page
        Navigation.showPage('home');
        
        console.log('✅ Application initialized successfully!');
    },

    /**
     * Load saved data from localStorage
     */
    loadSavedData() {
        // Load current user
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.state.currentUser = JSON.parse(savedUser);
                console.log('✅ User loaded:', this.state.currentUser.fullName);
            } catch (e) {
                console.error('❌ Error parsing saved user:', e);
                localStorage.removeItem('currentUser');
            }
        }

        // Load registered users
        const savedUsers = localStorage.getItem('registeredUsers');
        if (savedUsers) {
            try {
                this.state.registeredUsers = JSON.parse(savedUsers);
                console.log(`✅ Loaded ${this.state.registeredUsers.length} registered users`);
            } catch (e) {
                console.error('❌ Error parsing registered users:', e);
                this.state.registeredUsers = [];
            }
        }
    },

    /**
     * Initialize all modules
     */
    initModules() {
        // Initialize Auth module
        if (typeof Auth !== 'undefined') {
            Auth.init(this.state.currentUser);
        }

        // Initialize Slider
        if (typeof Slider !== 'undefined') {
            Slider.init();
        }

        // Initialize Calendar
        if (typeof Calendar !== 'undefined') {
            Calendar.init();
        }

        // Initialize Pages
        if (typeof HomePage !== 'undefined') {
            HomePage.init();
        }

        if (typeof ClubsPage !== 'undefined') {
            ClubsPage.init();
        }

        if (typeof ActivitiesPage !== 'undefined') {
            ActivitiesPage.init();
        }
    },

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            const loginModal = document.getElementById('login-modal');
            const registrationModal = document.getElementById('registration-modal');

            if (e.target === loginModal) {
                Auth.closeLoginModal();
            }

            if (e.target === registrationModal) {
                Modals.closeRegistration();
            }
        });

        // Handle Enter key in forms
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const loginModal = document.getElementById('login-modal');
                if (loginModal && !loginModal.classList.contains('hidden')) {
                    const activeTab = document.getElementById('login-tab');
                    if (activeTab && !activeTab.classList.contains('hidden')) {
                        Auth.confirmLogin();
                    }
                }
            }
        });

        // Prevent page unload if there's unsaved data (optional)
        window.addEventListener('beforeunload', (e) => {
            // You can add logic here if needed
        });
    },

    /**
     * Update application state
     */
    setState(key, value) {
        this.state[key] = value;
        
        // Save to localStorage if needed
        if (key === 'currentUser') {
            if (value) {
                localStorage.setItem('currentUser', JSON.stringify(value));
            } else {
                localStorage.removeItem('currentUser');
            }
        }

        if (key === 'registeredUsers') {
            localStorage.setItem('registeredUsers', JSON.stringify(value));
        }
    },

    /**
     * Get application state
     */
    getState(key) {
        return this.state[key];
    }
};

// Navigation Manager
const Navigation = {
    /**
     * Show specific page
     */
    showPage(pageId) {
        console.log(`📄 Navigating to: ${pageId}`);
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.add('hidden');
        });

        // Show target page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            App.setState('currentPage', pageId);
        }

        // Update navigation buttons
        this.updateNavButtons(pageId);

        // Handle page-specific logic
        this.handlePageSpecificLogic(pageId);
    },

    /**
     * Update navigation button states
     */
    updateNavButtons(activePageId) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('text-yellow-300');
        });

        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            const btnText = btn.textContent.toLowerCase();
            if (
                (activePageId === 'home' && btnText.includes('หน้าหลัก')) ||
                (activePageId === 'clubs' && btnText.includes('ชมรม')) ||
                (activePageId === 'activities' && btnText.includes('กิจกรรม'))
            ) {
                btn.classList.add('text-yellow-300');
            }
        });
    },

    /**
     * Handle page-specific logic
     */
    handlePageSpecificLogic(pageId) {
        const currentUser = App.getState('currentUser');
        
        if (pageId === 'activities') {
            const loginWarning = document.getElementById('login-warning');
            if (loginWarning) {
                if (!currentUser) {
                    loginWarning.classList.remove('hidden');
                } else {
                    loginWarning.classList.add('hidden');
                }
            }
        }

        // Refresh page content if needed
        if (pageId === 'home' && typeof HomePage !== 'undefined') {
            HomePage.refresh();
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for use in other modules
window.App = App;
window.Navigation = Navigation;