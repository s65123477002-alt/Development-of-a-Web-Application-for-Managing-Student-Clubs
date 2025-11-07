/**
 * ============================================
 * ADMIN CLUBS MANAGEMENT
 * ============================================
 * จัดการชมรมในระบบ
 */

const AdminClubs = {
    clubs: [],
    currentEditingClub: null,

    /**
     * Load clubs
     */
    loadClubs() {
        console.log('📚 Loading clubs...');
        
        // โหลดจาก data.js
        this.clubs = clubsData || [];
        
        this.renderClubsTable();
    },

    /**
     * Render clubs table
     */
    renderClubsTable() {
        const container = document.getElementById('clubs-table-container');
        if (!container) return;

        const admin = AdminAuth.getCurrentAdmin();
        
        // กรองชมรมตามสิทธิ์
        let displayClubs = this.clubs;
        if (admin.role === 'club_manager') {
            // Club manager เห็นได้เฉพาะชมรมของตัวเอง
            displayClubs = this.clubs.filter(club => club.id === admin.clubId);
        }

        if (displayClubs.length === 0) {
            showEmptyState('clubs-table-container', 'ไม่มีข้อมูลชมรม', 'fa-users');
            return;
        }

        const tableHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อชมรม</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หมวดหมู่</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">คำอธิบาย</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การดำเนินการ</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${displayClubs.map(club => this.renderClubRow(club)).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
    },

    /**
     * Render club row
     */
    renderClubRow(club) {
        const canEdit = AdminPermissions.canEditClub(club.id);
        const canDelete = AdminPermissions.canDeleteClub(club.id);

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="text-3xl mr-3">${Helpers.getClubIcon(club.category)}</div>
                        <div class="text-sm font-medium text-gray-900">${club.name}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${Helpers.getCategoryName(club.category)}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 truncate max-w-xs">${club.description}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${canEdit ? `
                        <button onclick="AdminClubs.editClub(${club.id})" 
                                class="text-indigo-600 hover:text-indigo-900 mr-3">
                            <i class="fas fa-edit"></i> แก้ไข
                        </button>
                    ` : `
                        <span class="text-gray-400"><i class="fas fa-lock"></i> แก้ไขไม่ได้</span>
                    `}
                    ${canDelete ? `
                        <button onclick="AdminClubs.deleteClub(${club.id})" 
                                class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i> ลบ
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    },

    /**
     * Open modal
     */
    openModal(clubId = null) {
        // ตรวจสอบสิทธิ์
        if (clubId) {
            if (!AdminPermissions.canEditClub(clubId)) {
                AdminPermissions.showPermissionDenied();
                return;
            }
        } else {
            if (!AdminPermissions.canCreateClub()) {
                AdminPermissions.showPermissionDenied();
                return;
            }
        }

        const modal = document.getElementById('club-modal');
        const title = document.getElementById('club-modal-title');
        const container = document.getElementById('club-form-container');

        if (!modal || !container) return;

        if (clubId) {
            // Edit mode
            const club = this.clubs.find(c => c.id === clubId);
            if (!club) return;

            title.textContent = 'แก้ไขชมรม';
            this.currentEditingClub = club;
            this.renderClubForm(club);
        } else {
            // Create mode
            title.textContent = 'เพิ่มชมรมใหม่';
            this.currentEditingClub = null;
            this.renderClubForm();
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    /**
     * Render club form
     */
    renderClubForm(club = null) {
        const container = document.getElementById('club-form-container');
        if (!container) return;

        container.innerHTML = `
            <form id="club-form" onsubmit="AdminClubs.saveClub(event)">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            ชื่อชมรม <span class="text-red-500">*</span>
                        </label>
                        <input type="text" 
                               id="club-name" 
                               value="${club?.name || ''}"
                               required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            หมวดหมู่ <span class="text-red-500">*</span>
                        </label>
                        <select id="club-category" 
                                required
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">เลือกหมวดหมู่</option>
                            <option value="sports" ${club?.category === 'sports' ? 'selected' : ''}>กีฬา</option>
                            <option value="art" ${club?.category === 'art' ? 'selected' : ''}>ศิลปะ</option>
                            <option value="volunteer" ${club?.category === 'volunteer' ? 'selected' : ''}>อาสาสมัคร</option>
                            <option value="tech" ${club?.category === 'tech' ? 'selected' : ''}>เทคโนโลยี</option>
                            <option value="academic" ${club?.category === 'academic' ? 'selected' : ''}>วิชาการ</option>
                        </select>
                    </div>
                </div>

                <div class="mt-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        คำอธิบาย <span class="text-red-500">*</span>
                    </label>
                    <textarea id="club-description" 
                            required
                            rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">${club?.description || ''}</textarea>
                </div>

                <div class="mt-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">ประวัติ</label>
                    <textarea id="club-history" 
                            rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">${club?.history || ''}</textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                        <input type="text" 
                            id="club-facebook"
                            value="${club?.contact?.facebook || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                        <input type="text" 
                            id="club-instagram"
                            value="${club?.contact?.instagram || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Line</label>
                        <input type="text" 
                            id="club-line"
                            value="${club?.contact?.line || ''}"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                </div>

                <div class="flex gap-4 mt-8">
                    <button type="button" 
                            onclick="closeModal('club-modal')"
                            class="flex-1 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg transition-colors">
                        ยกเลิก
                    </button>
                    <button type="submit"
                            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-save mr-2"></i>บันทึก
                    </button>
                </div>
            </form>
        `;
    },

    /**
     * Edit club
     */
    editClub(clubId) {
        this.openModal(clubId);
    },

    /**
     * Save club
     */
    saveClub(event) {
        event.preventDefault();

        const formData = {
            name: document.getElementById('club-name').value.trim(),
            category: document.getElementById('club-category').value,
            description: document.getElementById('club-description').value.trim(),
            history: document.getElementById('club-history').value.trim(),
            contact: {
                facebook: document.getElementById('club-facebook').value.trim(),
                instagram: document.getElementById('club-instagram').value.trim(),
                line: document.getElementById('club-line').value.trim()
            }
        };

        if (this.currentEditingClub) {
            // Update existing club
            const index = this.clubs.findIndex(c => c.id === this.currentEditingClub.id);
            if (index !== -1) {
                this.clubs[index] = {
                    ...this.clubs[index],
                    ...formData,
                    updatedAt: new Date().toISOString()
                };
            }
            showSuccess('แก้ไขชมรมเรียบร้อยแล้ว');
        } else {
            // Create new club
            const newClub = {
                id: Date.now(),
                ...formData,
                logo: `https://via.placeholder.com/150?text=${encodeURIComponent(formData.name)}`,
                pastActivities: [],
                createdAt: new Date().toISOString()
            };
            this.clubs.push(newClub);
            clubsData.push(newClub);
            showSuccess('เพิ่มชมรมเรียบร้อยแล้ว');
        }

        closeModal('club-modal');
        this.renderClubsTable();
    },

    /**
     * Delete club
     */
    deleteClub(clubId) {
        if (!AdminPermissions.canDeleteClub(clubId)) {
            AdminPermissions.showPermissionDenied();
            return;
        }

        if (!confirmAction('คุณต้องการลบชมรมนี้หรือไม่?')) return;

        const index = this.clubs.findIndex(c => c.id === clubId);
        if (index !== -1) {
            this.clubs.splice(index, 1);
            const dataIndex = clubsData.findIndex(c => c.id === clubId);
            if (dataIndex !== -1) {
                clubsData.splice(dataIndex, 1);
            }
            showSuccess('ลบชมรมเรียบร้อยแล้ว');
            this.renderClubsTable();
        }
    }
};

// Export
window.AdminClubs = AdminClubs;