/**
 * ============================================
 * ADMIN CORE
 * ============================================
 * ฟังก์ชันหลักสำหรับ Admin Panel
 */

const AdminCore = {
    /**
     * Initialize Admin Panel
     */
    init() {
        console.log('🚀 Initializing Admin Panel...');

        // Initialize Auth
        AdminAuth.init();

        // ตรวจสอบ login
        if (!AdminAuth.requireLogin()) {
            return;
        }

        // แสดงข้อมูล admin
        this.displayAdminInfo();

        // Apply permissions
        AdminPermissions.applyPermissions();

        // Load data
        this.loadAllData();

        // Show first tab
        showTab('clubs');

        console.log('✅ Admin Panel initialized');
    },

    /**
     * Display admin info
     */
    displayAdminInfo() {
        const admin = AdminAuth.getCurrentAdmin();
        if (!admin) return;

        const nameEl = document.getElementById('admin-name');
        const roleEl = document.getElementById('admin-role');

        if (nameEl) {
            nameEl.textContent = admin.fullName;
        }

        if (roleEl) {
            const roleIcon = admin.role === 'admin' ? '👑' : '👤';
            const roleText = AdminPermissions.getRoleDisplayName(admin.role);
            roleEl.textContent = `${roleIcon} ${roleText}`;
        }
    },

    /**
     * Load all data
     */
    loadAllData() {
        console.log('📊 Loading data...');

        // Load clubs
        if (AdminPermissions.hasPermission('view_clubs')) {
            AdminClubs.loadClubs();
        }

        // Load activities
        if (AdminPermissions.hasPermission('view_activities')) {
            AdminActivities.loadActivities();
        }

        // Load registrations
        if (AdminPermissions.hasPermission('view_registrations')) {
            AdminRegistrations.loadRegistrations();
        }
    }
};

/**
 * Show Tab
 */
function showTab(tabName) {
    console.log('📂 Switching to tab:', tabName);

    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Show selected tab
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });

    // Set active button
    event?.target?.classList.add('active', 'border-blue-500', 'text-blue-600');
    event?.target?.classList.remove('border-transparent', 'text-gray-500');
}

/**
 * Close Modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

/**
 * Show Loading
 */
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="flex items-center justify-center py-12">
            <div class="loading"></div>
            <span class="ml-3 text-gray-600">กำลังโหลด...</span>
        </div>
    `;
}

/**
 * Show Empty State
 */
function showEmptyState(containerId, message, icon = 'fa-inbox') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-12 text-gray-500">
            <i class="fas ${icon} text-6xl mb-4"></i>
            <p class="text-lg">${message}</p>
        </div>
    `;
}

/**
 * Show Success Message
 */
function showSuccess(message) {
    alert('✅ ' + message);
}

/**
 * Show Error Message
 */
function showError(message) {
    alert('❌ ' + message);
}

/**
 * Confirm Action
 */
function confirmAction(message) {
    return confirm(message);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AdminCore.init();
});

// Export
window.AdminCore = AdminCore;
window.showTab = showTab;
window.closeModal = closeModal;