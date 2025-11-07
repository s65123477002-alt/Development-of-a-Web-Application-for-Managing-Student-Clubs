/**
 * ============================================
 * NOTIFICATION SYSTEM
 * ============================================
 * ระบบแจ้งเตือนสำหรับผู้ใช้
 */

const NotificationSystem = {
    notifications: [],
    unreadCount: 0,

    /**
     * Initialize notification system
     */
    init() {
        console.log('🔔 Initializing Notification System...');
        
        // โหลดการแจ้งเตือนจาก localStorage
        this.loadNotifications();
        
        // สร้าง UI
        this.createNotificationUI();
        
        // เช็คกิจกรรมที่ใกล้ปิดรับสมัคร
        this.checkUpcomingActivities();
        
        // เช็คทุก 1 ชั่วโมง
        setInterval(() => {
            this.checkUpcomingActivities();
        }, 60 * 60 * 1000);
        
        console.log('✅ Notification System initialized');
    },

    /**
     * Load notifications from localStorage
     */
    loadNotifications() {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            try {
                this.notifications = JSON.parse(saved);
                this.updateUnreadCount();
            } catch (e) {
                this.notifications = [];
            }
        }
    },

    /**
     * Save notifications to localStorage
     */
    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    },

    /**
     * Create notification UI in navigation
     */
    createNotificationUI() {
        const nav = document.querySelector('nav .flex.items-center.space-x-8');
        if (!nav) return;

        // สร้าง notification bell
        const notifContainer = document.createElement('div');
        notifContainer.className = 'relative';
        notifContainer.innerHTML = `
            <button id="notification-bell" 
                    onclick="NotificationSystem.toggleNotificationPanel()"
                    class="relative text-white hover:text-yellow-300 transition-colors">
                <i class="fas fa-bell text-2xl"></i>
                <span id="notification-badge" 
                    class="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center hidden">
                    0
                </span>
            </button>
        `;

        // ใส่ก่อน auth-section
        const authSection = document.getElementById('auth-section');
        if (authSection) {
            nav.insertBefore(notifContainer, authSection);
        } else {
            nav.appendChild(notifContainer);
        }

        // สร้าง notification panel
        this.createNotificationPanel();
        
        // อัพเดท badge
        this.updateBadge();
    },

    /**
     * Create notification panel
     */
    createNotificationPanel() {
        const panel = document.createElement('div');
        panel.id = 'notification-panel';
        panel.className = 'fixed right-4 top-20 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 hidden z-50 max-h-[80vh] flex flex-col';
        panel.innerHTML = `
            <!-- Header -->
            <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-bell"></i>
                    <h3 class="font-bold text-lg">การแจ้งเตือน</h3>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="NotificationSystem.markAllAsRead()" 
                            class="text-xs hover:text-yellow-300 transition-colors"
                            title="อ่านทั้งหมด">
                        <i class="fas fa-check-double"></i>
                    </button>
                    <button onclick="NotificationSystem.clearAll()" 
                            class="text-xs hover:text-yellow-300 transition-colors"
                            title="ลบทั้งหมด">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button onclick="NotificationSystem.toggleNotificationPanel()" 
                            class="text-xl hover:text-yellow-300 transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- Notifications List -->
            <div id="notification-list" class="overflow-y-auto flex-1">
                <!-- Notifications will be inserted here -->
            </div>

            <!-- Footer -->
            <div class="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg text-center">
                <button onclick="Navigation.showPage('activities')" 
                        class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <i class="fas fa-calendar-alt mr-1"></i>ดูกิจกรรมทั้งหมด
                </button>
            </div>
        `;

        document.body.appendChild(panel);

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notification-panel');
            const bell = document.getElementById('notification-bell');
            if (panel && !panel.contains(e.target) && !bell.contains(e.target)) {
                panel.classList.add('hidden');
            }
        });

        this.renderNotifications();
    },

    /**
     * Toggle notification panel
     */
    toggleNotificationPanel() {
        const panel = document.getElementById('notification-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                this.renderNotifications();
            }
        }
    },

    /**
     * Render notifications
     */
    renderNotifications() {
        const container = document.getElementById('notification-list');
        if (!container) return;

        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i class="fas fa-bell-slash text-4xl mb-3 opacity-50"></i>
                    <p>ไม่มีการแจ้งเตือน</p>
                </div>
            `;
            return;
        }

        // เรียงตามวันที่ ใหม่สุดก่อน
        const sorted = [...this.notifications].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        container.innerHTML = sorted.map(notif => this.renderNotificationItem(notif)).join('');
    },

    /**
     * Render single notification
     */
    renderNotificationItem(notif) {
        const icons = {
            'activity': 'fa-calendar-check',
            'deadline': 'fa-clock',
            'success': 'fa-check-circle',
            'info': 'fa-info-circle',
            'warning': 'fa-exclamation-triangle'
        };

        const colors = {
            'activity': 'text-blue-600 bg-blue-50',
            'deadline': 'text-orange-600 bg-orange-50',
            'success': 'text-green-600 bg-green-50',
            'info': 'text-blue-600 bg-blue-50',
            'warning': 'text-yellow-600 bg-yellow-50'
        };

        const timeAgo = this.getTimeAgo(notif.timestamp);
        const unreadClass = notif.read ? '' : 'bg-blue-50 border-l-4 border-blue-500';

        return `
            <div class="notification-item p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${unreadClass}"
                onclick="NotificationSystem.handleNotificationClick('${notif.id}')">
                <div class="flex items-start space-x-3">
                    <!-- Icon -->
                    <div class="flex-shrink-0 w-10 h-10 rounded-full ${colors[notif.type]} flex items-center justify-center">
                        <i class="fas ${icons[notif.type]}"></i>
                    </div>
                    
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold text-gray-900 text-sm">
                            ${notif.title}
                            ${!notif.read ? '<span class="inline-block w-2 h-2 bg-blue-600 rounded-full ml-2"></span>' : ''}
                        </p>
                        <p class="text-sm text-gray-600 mt-1">${notif.message}</p>
                        <p class="text-xs text-gray-400 mt-1">
                            <i class="far fa-clock mr-1"></i>${timeAgo}
                        </p>
                    </div>

                    <!-- Delete button -->
                    <button onclick="event.stopPropagation(); NotificationSystem.deleteNotification('${notif.id}')"
                            class="text-gray-400 hover:text-red-600 transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Add new notification
     */
    addNotification(type, title, message, data = {}) {
        const notification = {
            id: Date.now().toString(),
            type: type,
            title: title,
            message: message,
            timestamp: new Date().toISOString(),
            read: false,
            data: data
        };

        this.notifications.unshift(notification);
        
        // จำกัดจำนวนไม่เกิน 50 รายการ
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }

        this.saveNotifications();
        this.updateBadge();
        this.renderNotifications();

        // แสดง toast notification
        this.showToast(notification);

        // เล่นเสียง (optional)
        this.playNotificationSound();
    },

    /**
     * Show toast notification
     */
    showToast(notification) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-4 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 animate-slideInRight max-w-sm';
        
        const icons = {
            'activity': 'fa-calendar-check text-blue-600',
            'deadline': 'fa-clock text-orange-600',
            'success': 'fa-check-circle text-green-600',
            'info': 'fa-info-circle text-blue-600',
            'warning': 'fa-exclamation-triangle text-yellow-600'
        };

        toast.innerHTML = `
            <div class="flex items-start space-x-3">
                <i class="fas ${icons[notification.type]} text-2xl"></i>
                <div class="flex-1">
                    <p class="font-semibold text-gray-900">${notification.title}</p>
                    <p class="text-sm text-gray-600 mt-1">${notification.message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('animate-slideOutRight');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    /**
     * Play notification sound
     */
    playNotificationSound() {
        // สร้างเสียง beep แบบง่ายๆ
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    },

    /**
     * Handle notification click
     */
    handleNotificationClick(notifId) {
        const notif = this.notifications.find(n => n.id === notifId);
        if (!notif) return;

        // ทำเครื่องหมายว่าอ่านแล้ว
        notif.read = true;
        this.saveNotifications();
        this.updateBadge();
        this.renderNotifications();

        // นำไปยังหน้าที่เกี่ยวข้อง
        if (notif.data.activityId) {
            Navigation.showPage('activities');
            setTimeout(() => {
                ActivitiesPage.showActivityDetails(notif.data.activityId);
            }, 100);
        }

        // ปิด panel
        this.toggleNotificationPanel();
    },

    /**
     * Mark all as read
     */
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateBadge();
        this.renderNotifications();
    },

    /**
     * Clear all notifications
     */
    clearAll() {
        if (confirm('ต้องการลบการแจ้งเตือนทั้งหมดหรือไม่?')) {
            this.notifications = [];
            this.saveNotifications();
            this.updateBadge();
            this.renderNotifications();
        }
    },

    /**
     * Delete single notification
     */
    deleteNotification(notifId) {
        this.notifications = this.notifications.filter(n => n.id !== notifId);
        this.saveNotifications();
        this.updateBadge();
        this.renderNotifications();
    },

    /**
     * Update unread count
     */
    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
    },

    /**
     * Update badge
     */
    updateBadge() {
        this.updateUnreadCount();
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    },

    /**
     * Check upcoming activities
     */
    checkUpcomingActivities() {
        const currentUser = App.getState('currentUser');
        if (!currentUser) return;

        const now = new Date();
        const notifications = [];

        activitiesData.forEach(activity => {
            if (activity.status === 'closed') return;

            const deadline = new Date(activity.deadline);
            const eventDate = new Date(activity.date);
            const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
            const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

            // แจ้งเตือนก่อนปิดรับสมัคร 3 วัน
            if (daysUntilDeadline === 3 && daysUntilDeadline > 0) {
                notifications.push({
                    type: 'deadline',
                    title: '⏰ ใกล้ปิดรับสมัคร!',
                    message: `"${activity.name}" จะปิดรับสมัครในอีก 3 วัน`,
                    activityId: activity.id
                });
            }

            // แจ้งเตือนวันสุดท้าย
            if (daysUntilDeadline === 0) {
                notifications.push({
                    type: 'warning',
                    title: '🔥 วันสุดท้าย!',
                    message: `วันนี้เป็นวันสุดท้ายในการสมัคร "${activity.name}"`,
                    activityId: activity.id
                });
            }

            // แจ้งเตือนก่อนกิจกรรม 1 วัน
            if (daysUntilEvent === 1) {
                notifications.push({
                    type: 'info',
                    title: '📅 กิจกรรมใกล้จะถึง',
                    message: `"${activity.name}" จะจัดขึ้นในวันพรุ่งนี้`,
                    activityId: activity.id
                });
            }
        });

        // เพิ่มการแจ้งเตือนที่ยังไม่มี
        notifications.forEach(notif => {
            const exists = this.notifications.some(n => 
                n.data.activityId === notif.activityId && 
                n.title === notif.title
            );

            if (!exists) {
                this.addNotification(
                    notif.type,
                    notif.title,
                    notif.message,
                    { activityId: notif.activityId }
                );
            }
        });
    },

    /**
     * Get time ago string
     */
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 7) {
            return time.toLocaleDateString('th-TH');
        } else if (days > 0) {
            return `${days} วันที่แล้ว`;
        } else if (hours > 0) {
            return `${hours} ชั่วโมงที่แล้ว`;
        } else if (minutes > 0) {
            return `${minutes} นาทีที่แล้ว`;
        } else {
            return 'เมื่อสักครู่';
        }
    },

    /**
     * Send notification when user registers for activity
     */
    notifyActivityRegistration(activityName) {
        this.addNotification(
            'success',
            '✅ สมัครสำเร็จ!',
            `คุณได้สมัครเข้าร่วมกิจกรรม "${activityName}" เรียบร้อยแล้ว`,
            {}
        );
    },

    /**
     * Send welcome notification for new users
     */
    notifyWelcome(userName) {
        this.addNotification(
            'info',
            '🎉 ยินดีต้อนรับ!',
            `สวัสดี ${userName} ขอบคุณที่เข้าร่วมกับเรา อย่าลืมสำรวจกิจกรรมต่างๆ นะคะ`,
            {}
        );
    }
};

// Export
window.NotificationSystem = NotificationSystem;