/**
 * ============================================
 * ADMIN REGISTRATIONS MANAGEMENT
 * ============================================
 * จัดการข้อมูลผู้สมัครกิจกรรม
 */

const AdminRegistrations = {
    registrations: [],

    /**
     * Load registrations
     */
    loadRegistrations() {
        console.log('📋 Loading registrations...');
        
        // สร้างข้อมูลจำลองผู้สมัคร
        this.registrations = this.generateMockRegistrations();
        
        this.renderRegistrationsTable();
        this.renderActivityFilter();
    },

    /**
     * Generate mock registrations
     */
    generateMockRegistrations() {
        const mockRegistrations = [];
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

        // สร้างข้อมูลจำลอง
        activitiesData.forEach(activity => {
            // สุ่มจำนวนผู้สมัคร 3-8 คน
            const numRegistrants = Math.floor(Math.random() * 6) + 3;
            
            for (let i = 0; i < numRegistrants; i++) {
                // ใช้ข้อมูลจาก registeredUsers หรือสร้างใหม่
                let user;
                if (registeredUsers.length > 0 && Math.random() > 0.5) {
                    user = registeredUsers[Math.floor(Math.random() * registeredUsers.length)];
                } else {
                    user = {
                        studentId: '6' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0'),
                        fullName: this.generateRandomName(),
                        phone: '08' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
                    };
                }

                mockRegistrations.push({
                    id: Date.now() + Math.random(),
                    activityId: activity.id,
                    activityName: activity.name,
                    clubName: activity.club,
                    studentId: user.studentId,
                    fullName: user.fullName,
                    phone: user.phone,
                    email: user.email || `${user.studentId}@student.ac.th`,
                    registeredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
                });
            }
        });

        return mockRegistrations;
    },

    /**
     * Generate random Thai name
     */
    generateRandomName() {
        const firstNames = ['สมชาย', 'สมหญิง', 'ประยุทธ์', 'สุดา', 'วิชัย', 'นภา', 'ธนา', 'พิมพ์', 'อนุชา', 'รัตนา'];
        const lastNames = ['ใจดี', 'รักเรียน', 'มั่นคง', 'สุขสันต์', 'เจริญ', 'วัฒนา', 'ศรีสุข', 'บุญมี', 'ทองดี', 'สวัสดี'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    },

    /**
     * Render activity filter
     */
    renderActivityFilter() {
        const select = document.getElementById('registration-activity-filter');
        if (!select) return;

        const admin = AdminAuth.getCurrentAdmin();
        let filterActivities = activitiesData;

        // กรองตามสิทธิ์
        if (admin.role === 'club_manager') {
            const club = clubsData.find(c => c.id === admin.clubId);
            if (club) {
                filterActivities = activitiesData.filter(a => a.club === club.name);
            }
        }

        select.innerHTML = `
            <option value="">ทุกกิจกรรม</option>
            ${filterActivities.map(activity => `
                <option value="${activity.id}">${activity.name} (${activity.club})</option>
            `).join('')}
        `;

        select.addEventListener('change', () => {
            this.renderRegistrationsTable(parseInt(select.value) || null);
        });
    },

    /**
     * Render registrations table
     */
    renderRegistrationsTable(filterActivityId = null) {
        const container = document.getElementById('registrations-table-container');
        if (!container) return;

        const admin = AdminAuth.getCurrentAdmin();
        
        // กรองข้อมูลตามสิทธิ์
        let displayRegistrations = this.registrations;
        
        if (admin.role === 'club_manager') {
            // Club manager เห็นเฉพาะผู้สมัครของชมรมตัวเอง
            displayRegistrations = displayRegistrations.filter(reg => 
                reg.clubName === admin.clubName
            );
        }

        // กรองตาม activity ที่เลือก
        if (filterActivityId) {
            displayRegistrations = displayRegistrations.filter(reg => 
                reg.activityId === filterActivityId
            );
        }

        if (displayRegistrations.length === 0) {
            showEmptyState('registrations-table-container', 'ยังไม่มีผู้สมัครกิจกรรม', 'fa-user-slash');
            return;
        }

        // สรุปสถิติ
        const statsHTML = this.renderStats(displayRegistrations);

        const tableHTML = `
            ${statsHTML}
            
            <div class="overflow-x-auto mt-6">
                <table class="min-w-full bg-white">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">กิจกรรม</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสนักศึกษา</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เบอร์โทร</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่สมัคร</th>
                            ${admin.role === 'admin' ? '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การดำเนินการ</th>' : ''}
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${displayRegistrations.map((reg, index) => this.renderRegistrationRow(reg, index + 1)).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Export Button -->
            <div class="mt-6 flex justify-end">
                <button onclick="AdminRegistrations.exportToCSV()" 
                        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <i class="fas fa-file-excel mr-2"></i>ส่งออก Excel
                </button>
            </div>
        `;

        container.innerHTML = tableHTML;
    },

    /**
     * Render stats
     */
    renderStats(registrations) {
        const totalRegistrations = registrations.length;
        const uniqueActivities = [...new Set(registrations.map(r => r.activityName))].length;
        const recentRegistrations = registrations.filter(r => {
            const regDate = new Date(r.registeredAt);
            const daysDiff = (Date.now() - regDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
        }).length;

        return `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-blue-600 font-medium">ผู้สมัครทั้งหมด</p>
                            <p class="text-3xl font-bold text-blue-900">${totalRegistrations}</p>
                        </div>
                        <div class="bg-blue-100 rounded-full p-3">
                            <i class="fas fa-users text-blue-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-green-600 font-medium">กิจกรรมที่มีผู้สมัคร</p>
                            <p class="text-3xl font-bold text-green-900">${uniqueActivities}</p>
                        </div>
                        <div class="bg-green-100 rounded-full p-3">
                            <i class="fas fa-calendar-check text-green-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-purple-600 font-medium">สมัครใน 7 วันล่าสุด</p>
                            <p class="text-3xl font-bold text-purple-900">${recentRegistrations}</p>
                        </div>
                        <div class="bg-purple-100 rounded-full p-3">
                            <i class="fas fa-chart-line text-purple-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render registration row
     */
    renderRegistrationRow(registration, index) {
        const admin = AdminAuth.getCurrentAdmin();
        const regDate = new Date(registration.registeredAt);
        const formattedDate = regDate.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${index}
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">${registration.activityName}</div>
                    <div class="text-sm text-gray-500">${registration.clubName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${registration.fullName}</div>
                    <div class="text-sm text-gray-500">${registration.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${registration.studentId}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${registration.phone}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${formattedDate}
                </td>
                ${admin.role === 'admin' ? `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="AdminRegistrations.deleteRegistration(${registration.id})" 
                                class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                ` : ''}
            </tr>
        `;
    },

    /**
     * Delete registration
     */
    deleteRegistration(registrationId) {
        if (!AdminPermissions.hasPermission('delete_registration')) {
            AdminPermissions.showPermissionDenied();
            return;
        }

        if (!confirmAction('คุณต้องการลบข้อมูลผู้สมัครนี้หรือไม่?')) return;

        const index = this.registrations.findIndex(r => r.id === registrationId);
        if (index !== -1) {
            this.registrations.splice(index, 1);
            showSuccess('ลบข้อมูลผู้สมัครเรียบร้อยแล้ว');
            this.renderRegistrationsTable();
        }
    },

    /**
     * Export to CSV
     */
    exportToCSV() {
        const admin = AdminAuth.getCurrentAdmin();
        
        // กรองข้อมูลตามสิทธิ์
        let exportData = this.registrations;
        if (admin.role === 'club_manager') {
            exportData = exportData.filter(reg => reg.clubName === admin.clubName);
        }

        if (exportData.length === 0) {
            showError('ไม่มีข้อมูลสำหรับส่งออก');
            return;
        }

        // สร้าง CSV content
        const headers = ['ลำดับ', 'กิจกรรม', 'ชมรม', 'ชื่อ-นามสกุล', 'รหัสนักศึกษา', 'เบอร์โทร', 'อีเมล', 'วันที่สมัคร'];
        const rows = exportData.map((reg, index) => [
            index + 1,
            reg.activityName,
            reg.clubName,
            reg.fullName,
            reg.studentId,
            reg.phone,
            reg.email,
            new Date(reg.registeredAt).toLocaleDateString('th-TH')
        ]);

        let csvContent = '\uFEFF'; // BOM for UTF-8
        csvContent += headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `registrations_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showSuccess('ส่งออกข้อมูลเรียบร้อยแล้ว');
    }
};

// Export
window.AdminRegistrations = AdminRegistrations;