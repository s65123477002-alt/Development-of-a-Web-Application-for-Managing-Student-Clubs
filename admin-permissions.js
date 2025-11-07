/**
 * ============================================
 * ADMIN PERMISSIONS MANAGER
 * ============================================
 * จัดการและตรวจสอบสิทธิ์การใช้งาน
 */

const AdminPermissions = {
    // รายการสิทธิ์ทั้งหมด
    allPermissions: {
        // Clubs
        'view_clubs': 'ดูรายชื่อชมรม',
        'create_club': 'สร้างชมรมใหม่',
        'edit_own_club': 'แก้ไขชมรมของตัวเอง',
        'edit_all_clubs': 'แก้ไขชมรมทั้งหมด',
        'delete_club': 'ลบชมรม',
        
        // Activities
        'view_activities': 'ดูรายการกิจกรรม',
        'create_activity': 'สร้างกิจกรรมใหม่',
        'edit_activity': 'แก้ไขกิจกรรม',
        'delete_activity': 'ลบกิจกรรม',
        'manage_activities': 'จัดการกิจกรรมทั้งหมด',
        
        // Registrations
        'view_registrations': 'ดูรายชื่อผู้สมัคร',
        'export_registrations': 'ส่งออกรายชื่อผู้สมัคร',
        'delete_registration': 'ลบข้อมูลผู้สมัคร',
        
        // Users
        'view_users': 'ดูรายชื่อผู้ใช้',
        'manage_users': 'จัดการผู้ใช้',
        
        // System
        'view_dashboard': 'ดู Dashboard',
        'system_settings': 'ตั้งค่าระบบ'
    },

    // สิทธิ์ตาม Role
    rolePermissions: {
        'admin': ['all'], // ทุกสิทธิ์
        'club_manager': [
            'view_clubs',
            'edit_own_club',
            'view_activities',
            'create_activity',
            'edit_activity',
            'manage_activities',
            'view_registrations'
        ]
    },

    /**
     * Check if current admin has permission
     */
    hasPermission(permission) {
        const admin = AdminAuth.getCurrentAdmin();
        if (!admin) return false;

        // Admin มีสิทธิ์ทั้งหมด
        if (admin.role === 'admin' || admin.permissions.includes('all')) {
            return true;
        }

        // ตรวจสอบสิทธิ์เฉพาะ
        return admin.permissions.includes(permission);
    },

    /**
     * Can edit club
     */
    canEditClub(clubId) {
        const admin = AdminAuth.getCurrentAdmin();
        if (!admin) return false;

        // Admin แก้ไขได้ทุกชมรม
        if (this.hasPermission('edit_all_clubs')) return true;

        // Club manager แก้ไขได้เฉพาะชมรมของตัวเอง
        if (this.hasPermission('edit_own_club')) {
            return admin.clubId === clubId;
        }

        return false;
    },

    /**
     * Can delete club
     */
    canDeleteClub(clubId) {
        // เฉพาะ Admin เท่านั้น
        return this.hasPermission('delete_club');
    },

    /**
     * Can create club
     */
    canCreateClub() {
        return this.hasPermission('create_club');
    },

    /**
     * Can manage activity
     */
    canManageActivity(activity) {
        const admin = AdminAuth.getCurrentAdmin();
        if (!admin) return false;

        // Admin จัดการได้ทั้งหมด
        if (admin.role === 'admin') return true;

        // Club manager จัดการได้เฉพาะกิจกรรมของชมรมตัวเอง
        if (admin.role === 'club_manager') {
            // ตรวจสอบว่ากิจกรรมเป็นของชมรมตัวเองหรือไม่
            const club = clubsData.find(c => c.id === admin.clubId);
            if (club) {
                return activity.club === club.name;
            }
        }

        return false;
    },

    /**
     * Get permissions for current admin
     */
    getCurrentPermissions() {
        const admin = AdminAuth.getCurrentAdmin();
        if (!admin) return [];

        if (admin.role === 'admin') {
            return Object.keys(this.allPermissions);
        }

        return admin.permissions;
    },

    /**
     * Get role display name
     */
    getRoleDisplayName(role) {
        const roleNames = {
            'admin': 'ผู้ดูแลระบบ',
            'club_manager': 'ผู้จัดการชมรม'
        };
        return roleNames[role] || role;
    },

    /**
     * Show permission denied message
     */
    showPermissionDenied() {
        alert('⚠️ คุณไม่มีสิทธิ์เข้าถึงส่วนนี้\n\nหากต้องการสิทธิ์เพิ่มเติม กรุณาติดต่อผู้ดูแลระบบ');
    },

    /**
     * Hide elements without permission
     */
    applyPermissions() {
        const admin = AdminAuth.getCurrentAdmin();
        if (!admin) return;

        console.log('🔒 Applying permissions for:', admin.role);

        // ซ่อนปุ่มสร้างชมรมถ้าไม่มีสิทธิ์
        if (!this.canCreateClub()) {
            const createClubBtn = document.querySelector('[onclick*="openClubModal()"]');
            if (createClubBtn && !createClubBtn.textContent.includes('เพิ่มกิจกรรม')) {
                createClubBtn.style.display = 'none';
            }
        }

        // แสดงข้อมูลสิทธิ์ใน UI
        this.displayPermissionInfo();
    },

    /**
     * Display permission info
     */
    displayPermissionInfo() {
        const admin = AdminAuth.getCurrentAdmin();
        if (!admin) return;

        const permissionInfo = document.getElementById('permission-info');
        if (!permissionInfo) return;

        const roleColor = admin.role === 'admin' ? 'blue' : 'green';
        const roleIcon = admin.role === 'admin' ? 'fa-crown' : 'fa-user-tie';

        permissionInfo.innerHTML = `
            <div class="bg-${roleColor}-50 border border-${roleColor}-200 rounded-lg p-3 mb-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <i class="fas ${roleIcon} text-${roleColor}-600"></i>
                        <div>
                            <p class="text-sm font-bold text-${roleColor}-900">
                                ${this.getRoleDisplayName(admin.role)}
                            </p>
                            ${admin.clubName ? `
                                <p class="text-xs text-${roleColor}-700">
                                    <i class="fas fa-users mr-1"></i>${admin.clubName}
                                </p>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Export
if (typeof window !== 'undefined') {
    window.AdminPermissions = AdminPermissions;
}