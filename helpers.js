/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 * ฟังก์ชันช่วยเหลือทั่วไป
 */

const Helpers = {
    /**
     * Format date to Thai format
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Calculate days until event
     */
    getDaysUntilEvent(eventDate) {
        const today = new Date();
        const event = new Date(eventDate);
        const diffTime = event - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    /**
     * Get status text
     */
    getStatusText(status) {
        const statusMap = {
            'open': 'เปิดรับสมัคร',
            'closing': 'ใกล้ปิดรับ',
            'closed': 'ปิดรับแล้ว'
        };
        return statusMap[status] || 'ไม่ทราบสถานะ';
    },

    /**
     * Get activity status config
     */
    getActivityStatusConfig(status) {
        const configs = {
            'open': {
                text: 'เปิดรับสมัคร',
                bgColor: 'bg-green-100',
                textColor: 'text-green-800',
                color: 'green'
            },
            'closing': {
                text: 'ใกล้ปิดรับ',
                bgColor: 'bg-orange-100',
                textColor: 'text-orange-800',
                color: 'orange'
            },
            'closed': {
                text: 'ปิดรับแล้ว',
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-800',
                color: 'gray'
            }
        };
        return configs[status] || configs['closed'];
    },

    /**
     * Get club gradient color
     */
    getClubGradient(category) {
        return categoryConfig[category]?.gradient || 'from-gray-400 to-gray-600';
    },

    /**
     * Get club color
     */
    getClubColor(category) {
        return categoryConfig[category]?.color || 'gray';
    },

    /**
     * Get category name in Thai
     */
    getCategoryName(category) {
        return categoryConfig[category]?.name || 'อื่นๆ';
    },

    /**
     * Get club icon
     */
    getClubIcon(category) {
        return categoryConfig[category]?.icon || '📌';
    },

    /**
     * Get type name in Thai
     */
    getTypeName(type) {
        return typeConfig[type]?.name || 'ไม่ระบุ';
    },

    /**
     * Get type icon
     */
    getTypeIcon(type) {
        return typeConfig[type]?.icon || '📍';
    },

    /**
     * Get type color
     */
    getTypeColor(type) {
        return typeConfig[type]?.color || 'gray';
    },

    /**
     * Truncate text
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    /**
     * Scroll to element
     */
    scrollToElement(elementId, offset = 0) {
        const element = document.getElementById(elementId);
        if (element) {
            const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    },

    /**
     * Copy to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('คัดลอกแล้ว!', 'success');
        } catch (err) {
            console.error('Failed to copy:', err);
            this.showNotification('ไม่สามารถคัดลอกได้', 'error');
        }
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Check if mobile device
     */
    isMobile() {
        return window.innerWidth <= 768;
    },

    /**
     * Format phone number
     */
    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
        return phone;
    },

    /**
     * Sanitize HTML
     */
    sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Get query params
     */
    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    /**
     * Format number with commas
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
};
    
// Export
window.Helpers = Helpers;