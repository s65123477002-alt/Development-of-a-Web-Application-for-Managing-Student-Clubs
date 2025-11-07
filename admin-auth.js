/**
 * ============================================
 * ADMIN AUTHENTICATION
 * ============================================
 * จัดการระบบ Login/Logout สำหรับ Admin
 */

const AdminAuth = {
    // บัญชีทดสอบ
    testAccounts: [
        {
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            fullName: 'ผู้ดูแลระบบ',
            permissions: ['all'] // สิทธิ์ทั้งหมด
        },
        {
            username: 'manager1',
            password: 'manager123',
            role: 'club_manager',
            fullName: 'ผู้จัดการชมรมดนตรี',
            clubId: 1, // ชมรมดนตรีสากล
            clubName: 'ชมรมดนตรีสากล',
            permissions: ['view_clubs', 'edit_own_club', 'manage_activities', 'view_registrations']
        },
        {
            username: 'manager2',
            password: 'manager123',
            role: 'club_manager',
            fullName: 'ผู้จัดการชมรมฟุตบอล',
            clubId: 2, // ชมรมฟุตบอล
            clubName: 'ชมรมคนใต้ SSRU',
            permissions: ['view_clubs', 'edit_own_club', 'manage_activities', 'view_registrations']
        }
    ],

    currentAdmin: null,

    /**
     * Initialize
     */
    init() {
        console.log('🔐 Initializing Admin Auth...');
        
        // โหลดข้อมูล admin ที่ login อยู่
        const savedAdmin = localStorage.getItem('currentAdmin');
        if (savedAdmin) {
            try {
                this.currentAdmin = JSON.parse(savedAdmin);
                console.log('✅ Admin loaded:', this.currentAdmin.username);
            } catch (e) {
                console.error('❌ Error loading admin:', e);
                localStorage.removeItem('currentAdmin');
            }
        }

        // แสดงข้อมูลบัญชีทดสอบใน Console
        this.showTestAccountsInfo();
    },

    /**
     * Show test accounts info
     */
    showTestAccountsInfo() {
        console.log('🧪 บัญชีทดสอบ Admin:');
        this.testAccounts.forEach((account, index) => {
            console.log(`\n${index + 1}. ${account.role.toUpperCase()}:`);
            console.log(`   Username: ${account.username}`);
            console.log(`   Password: ${account.password}`);
            console.log(`   ชื่อ: ${account.fullName}`);
            if (account.clubName) {
                console.log(`   ชมรม: ${account.clubName}`);
            }
        });
    },

    /**
     * Login
     */
    login() {
        const username = document.getElementById('admin-username')?.value.trim();
        const password = document.getElementById('admin-password')?.value;

        if (!username || !password) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        // ตรวจสอบ username และ password
        const admin = this.testAccounts.find(acc => 
            acc.username === username && acc.password === password
        );

        if (!admin) {
            alert('Username หรือ Password ไม่ถูกต้อง');
            return;
        }

        // บันทึกข้อมูล admin
        this.currentAdmin = {
            ...admin,
            loginAt: new Date().toISOString()
        };

        localStorage.setItem('currentAdmin', JSON.stringify(this.currentAdmin));
        
        console.log('✅ Login successful:', admin.username);
        
        // Redirect ไป admin panel
        window.location.href = 'admin.html';
    },

    /**
     * Logout
     */
    logout() {
        if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
            this.currentAdmin = null;
            localStorage.removeItem('currentAdmin');
            console.log('✅ Logged out');
            window.location.href = 'login-admin.html';
        }
    },

    /**
     * Check if logged in
     */
    isLoggedIn() {
        return this.currentAdmin !== null;
    },

    /**
     * Get current admin
     */
    getCurrentAdmin() {
        return this.currentAdmin;
    },

    /**
     * Check permission
     */
    hasPermission(permission) {
        if (!this.currentAdmin) return false;
        
        // Admin มีสิทธิ์ทั้งหมด
        if (this.currentAdmin.role === 'admin') return true;
        
        // ตรวจสอบสิทธิ์ของ club manager
        return this.currentAdmin.permissions.includes(permission);
    },

    /**
     * Can edit club
     */
    canEditClub(clubId) {
        if (!this.currentAdmin) return false;
        
        // Admin แก้ไขได้ทุกชมรม
        if (this.currentAdmin.role === 'admin') return true;
        
        // Club manager แก้ไขได้เฉพาะชมรมของตัวเอง
        return this.currentAdmin.clubId === clubId;
    },

    /**
     * Require login
     */
    requireLogin() {
        if (!this.isLoggedIn()) {
            alert('กรุณาเข้าสู่ระบบก่อน');
            window.location.href = 'login-admin.html';
            return false;
        }
        return true;
    },

    /**
     * Require admin role
     */
    requireAdmin() {
        if (!this.requireLogin()) return false;
        
        if (this.currentAdmin.role !== 'admin') {
            alert('คุณไม่มีสิทธิ์เข้าถึงส่วนนี้');
            return false;
        }
        return true;
    }
};

// Initialize on page load
if (typeof window !== 'undefined') {
    window.AdminAuth = AdminAuth;
    
    // Auto-init ถ้าอยู่หน้า login
    if (window.location.pathname.includes('login-admin.html')) {
        AdminAuth.init();
    }
}