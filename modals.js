/**
 * ============================================
 * MODALS MANAGEMENT
 * ============================================
 * จัดการ Modal ทั้งหมดในระบบ
 */

const Modals = {
    selectedActivity: null,

    /**
     * Handle Registration Click
     * ตรวจสอบ login ก่อนเปิด modal
     */
    handleRegistrationClick(activityId) {
        const currentUser = App.getState('currentUser');
        
        if (!currentUser) {
            // ยังไม่ได้ login - แสดง login modal
            localStorage.setItem('pendingRegistration', activityId.toString());
            Auth.showLoginModal();
            return;
        }
        
        // Login แล้ว - เปิด registration modal
        this.openRegistration(activityId);
    },

    /**
     * Open Registration Modal
     */
    openRegistration(activityId) {
        console.log('📝 Opening registration modal for activity:', activityId);
        
        const activity = activitiesData.find(a => a.id === activityId);
        if (!activity) {
            console.error('❌ Activity not found:', activityId);
            return;
        }

        const currentUser = App.getState('currentUser');
        if (!currentUser) {
            console.error('❌ No current user');
            alert('กรุณาเข้าสู่ระบบก่อนสมัครกิจกรรม');
            return;
        }

        this.selectedActivity = activity;

        const modal = document.getElementById('registration-modal');
        const content = document.getElementById('registration-content');

        if (!modal || !content) {
            console.error('❌ Modal elements not found');
            return;
        }

        // สร้างข้อมูลผู้ใช้
        const userInfoHTML = currentUser.isTemporary ? `
            <div class="bg-yellow-50 p-4 rounded-lg">
                <h5 class="font-medium text-yellow-900 mb-2">ข้อมูลพื้นฐาน</h5>
                <div class="text-sm text-yellow-800">
                    <div><strong>ชื่อ:</strong> ${currentUser.fullName}</div>
                    <div><strong>รหัสนักศึกษา:</strong> ${currentUser.studentId}</div>
                    <div><strong>เบอร์โทร:</strong> ${currentUser.phone}</div>
                </div>
                <p class="text-xs text-yellow-600 mt-2">💡 ลงทะเบียนเต็มรูปแบบเพื่อได้รับข้อมูลข่าวสารเพิ่มเติม</p>
            </div>
        ` : `
            <div class="bg-blue-50 p-4 rounded-lg">
                <h5 class="font-medium text-blue-900 mb-2">ข้อมูลของคุณ</h5>
                <div class="text-sm text-blue-800 grid grid-cols-2 gap-3">
                    <div><strong>ชื่อ:</strong> ${currentUser.fullName}</div>
                    <div><strong>รหัสนักศึกษา:</strong> ${currentUser.studentId}</div>
                    <div><strong>อีเมล:</strong> ${currentUser.email || 'ไม่ระบุ'}</div>
                    <div><strong>เบอร์โทร:</strong> ${currentUser.phone}</div>
                    <div><strong>คณะ:</strong> ${currentUser.faculty || 'ไม่ระบุ'}</div>
                    <div><strong>สาขา:</strong> ${currentUser.major || 'ไม่ระบุ'}</div>
                </div>
                <p class="text-xs text-blue-600 mt-2">* ข้อมูลจะถูกส่งให้ชมรมเพื่อติดต่อกลับ</p>
            </div>
        `;

        content.innerHTML = `
            <div class="space-y-4">
                <div>
                    <h4 class="font-semibold text-gray-800 text-lg">${activity.name}</h4>
                    <p class="text-gray-600">${activity.description}</p>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="font-medium">ชมรม:</span>
                            <div>${activity.club}</div>
                        </div>
                        <div>
                            <span class="font-medium">วันที่จัด:</span>
                            <div>${Helpers.formatDate(activity.date)}</div>
                        </div>
                        <div>
                            <span class="font-medium">ปิดรับสมัคร:</span>
                            <div>${Helpers.formatDate(activity.deadline)}</div>
                        </div>
                        <div>
                            <span class="font-medium">สถานะ:</span>
                            <div>${Helpers.getStatusText(activity.status)}</div>
                        </div>
                    </div>
                </div>
                
                ${userInfoHTML}

                <div class="flex gap-4 mt-6">
                    <button onclick="Modals.closeRegistration()" 
                            class="flex-1 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg transition-colors">
                        ยกเลิก
                    </button>
                    <button onclick="Modals.confirmRegistration()" 
                            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        ยืนยันการสมัคร
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        console.log('✅ Registration modal opened');
    },

    /**
     * Close Registration Modal
     */
    closeRegistration() {
        const modal = document.getElementById('registration-modal');
        if (!modal) return;

        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.selectedActivity = null;
    },

    /**
     * Confirm Registration
     */
    confirmRegistration() {
        if (!this.selectedActivity) return;

        const currentUser = App.getState('currentUser');
        if (!currentUser) return;
        // แจ้งเตือนแบบเดิม
        alert(`สมัครกิจกรรม "${this.selectedActivity.name}" เรียบร้อยแล้ว!\n\nชื่อ: ${currentUser.fullName}\nรหัสนักศึกษา: ${currentUser.studentId}\nเบอร์โทร: ${currentUser.phone}\n\nทางชมรมจะติดต่อกลับภายใน 3 วันทำการ`);
        
        this.closeRegistration();
        
        // Show success notification
        if (typeof Helpers !== 'undefined') {
            NotificationSystem.notifyActivityRegistration(this.selectedActivity.name);
        }
        if (typeof Helpers !== 'undefined') {
            Helpers.showNotification('สมัครกิจกรรมสำเร็จ!', 'success');
        }
    },

    /**
     * Show Day Activities Modal
     */
    showDayActivities(dateStr, activities) {
        const modal = document.getElementById('registration-modal');
        const content = document.getElementById('registration-content');

        if (!modal || !content) return;

        content.innerHTML = `
            <div class="space-y-4">
                <h4 class="text-xl font-bold text-gray-800">กิจกรรมวันที่ ${Helpers.formatDate(dateStr)}</h4>
                <div class="space-y-3 max-h-96 overflow-y-auto">
                    ${activities.map(activity => {
                        const statusConfig = Helpers.getActivityStatusConfig(activity.status);
                        return `
                            <div class="border rounded-lg p-4 hover:bg-gray-50">
                                <div class="flex justify-between items-start mb-2">
                                    <h5 class="font-semibold text-gray-800">${activity.name}</h5>
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}">
                                        ${statusConfig.text}
                                    </span>
                                </div>
                                <p class="text-gray-600 text-sm mb-2">${activity.description}</p>
                                <div class="text-xs text-gray-500 mb-3">
                                    <div><i class="fas fa-users mr-1"></i>${activity.club}</div>
                                    <div><i class="fas fa-clock mr-1"></i>ปิดรับสมัคร: ${Helpers.formatDate(activity.deadline)}</div>
                                </div>
                                ${activity.status !== 'closed' ? `
                                    <button onclick="Modals.closeRegistration(); setTimeout(() => Modals.handleRegistrationClick(${activity.id}), 100);"
                                            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors">
                                        <i class="fas fa-user-plus mr-1"></i>สมัครเข้าร่วม
                                    </button>
                                ` : `
                                    <button disabled class="w-full bg-gray-300 text-gray-500 py-2 px-3 rounded text-sm cursor-not-allowed">
                                        <i class="fas fa-lock mr-1"></i>ปิดรับสมัครแล้ว
                                    </button>
                                `}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="flex justify-end">
                    <button onclick="Modals.closeRegistration()" 
                            class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg transition-colors">
                        ปิด
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

// Export
window.Modals = Modals;