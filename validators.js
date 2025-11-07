/**
 * ============================================
 * VALIDATORS
 * ============================================
 * ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
 */

const Validators = {
    /**
     * ตรวจสอบรหัสนักศึกษา (11 หลัก)
     */
    validateStudentId(studentId) {
        const regex = /^\d{11}$/;
        return {
            isValid: regex.test(studentId),
            message: regex.test(studentId) ? '' : 'รหัสนักศึกษาต้องเป็นตัวเลข 11 หลัก'
        };
    },

    /**
     * ตรวจสอบเบอร์โทรศัพท์ (10 หลัก)
     */
    validatePhone(phone) {
        const regex = /^0\d{9}$/;
        return {
            isValid: regex.test(phone),
            message: regex.test(phone) ? '' : 'เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 และมี 10 หลัก'
        };
    },

    /**
     * ตรวจสอบอีเมล
     */
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
            isValid: regex.test(email),
            message: regex.test(email) ? '' : 'รูปแบบอีเมลไม่ถูกต้อง'
        };
    },

    /**
     * ตรวจสอบชื่อ-นามสกุล (ต้องมีอย่างน้อย 2 คำ)
     */
    validateFullName(fullName) {
        const trimmed = fullName.trim();
        const words = trimmed.split(/\s+/);
        const isValid = words.length >= 2 && trimmed.length >= 3;
        
        return {
            isValid: isValid,
            message: isValid ? '' : 'กรุณากรอกชื่อและนามสกุล'
        };
    },

    /**
     * ตรวจสอบว่าฟิลด์ว่างหรือไม่
     */
    validateRequired(value, fieldName) {
        const isValid = value && value.trim().length > 0;
        return {
            isValid: isValid,
            message: isValid ? '' : `กรุณากรอก${fieldName}`
        };
    },

    /**
     * ตรวจสอบความยาวข้อความ
     */
    validateLength(value, min, max, fieldName) {
        const length = value.trim().length;
        const isValid = length >= min && length <= max;
        
        let message = '';
        if (!isValid) {
            if (length < min) {
                message = `${fieldName}ต้องมีอย่างน้อย ${min} ตัวอักษร`;
            } else {
                message = `${fieldName}ต้องไม่เกิน ${max} ตัวอักษร`;
            }
        }
        
        return {
            isValid: isValid,
            message: message
        };
    },

    /**
     * ตรวจสอบรูปแบบตัวเลขเท่านั้น
     */
    validateNumeric(value) {
        const regex = /^\d+$/;
        return {
            isValid: regex.test(value),
            message: regex.test(value) ? '' : 'กรุณากรอกตัวเลขเท่านั้น'
        };
    },

    /**
     * ตรวจสอบฟอร์ม Login
     */
    validateLoginForm(studentId, fullName, phone) {
        const errors = [];

        // Validate Student ID
        const studentIdValidation = this.validateStudentId(studentId);
        if (!studentIdValidation.isValid) {
            errors.push({ field: 'studentId', message: studentIdValidation.message });
        }

        // Validate Full Name
        const fullNameValidation = this.validateFullName(fullName);
        if (!fullNameValidation.isValid) {
            errors.push({ field: 'fullName', message: fullNameValidation.message });
        }

        // Validate Phone
        const phoneValidation = this.validatePhone(phone);
        if (!phoneValidation.isValid) {
            errors.push({ field: 'phone', message: phoneValidation.message });
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * ตรวจสอบฟอร์ม Register
     */
    validateRegisterForm(data) {
        const errors = [];
        const { fullName, studentId, email, faculty, major, phone } = data;

        // Validate Full Name
        const fullNameValidation = this.validateFullName(fullName);
        if (!fullNameValidation.isValid) {
            errors.push({ field: 'fullName', message: fullNameValidation.message });
        }

        // Validate Student ID
        const studentIdValidation = this.validateStudentId(studentId);
        if (!studentIdValidation.isValid) {
            errors.push({ field: 'studentId', message: studentIdValidation.message });
        }

        // Validate Email
        const emailValidation = this.validateEmail(email);
        if (!emailValidation.isValid) {
            errors.push({ field: 'email', message: emailValidation.message });
        }

        // Validate Faculty
        if (!faculty || faculty.trim() === '') {
            errors.push({ field: 'faculty', message: 'กรุณาเลือกคณะ' });
        }

        // Validate Major
        const majorValidation = this.validateRequired(major, 'สาขาวิชา');
        if (!majorValidation.isValid) {
            errors.push({ field: 'major', message: majorValidation.message });
        }

        // Validate Phone
        const phoneValidation = this.validatePhone(phone);
        if (!phoneValidation.isValid) {
            errors.push({ field: 'phone', message: phoneValidation.message });
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * แสดงข้อความ Error ในฟอร์ม
     */
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Remove existing error
        this.clearFieldError(fieldId);

        // Add error class
        field.classList.add('border-red-500');

        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-xs mt-1';
        errorDiv.id = `${fieldId}-error`;
        errorDiv.textContent = message;

        // Insert after field
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    },

    /**
     * ลบข้อความ Error
     */
    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.remove('border-red-500');

        const errorDiv = document.getElementById(`${fieldId}-error`);
        if (errorDiv) {
            errorDiv.remove();
        }
    },

    /**
     * ลบ Error ทั้งหมดในฟอร์ม
     */
    clearAllErrors(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        // Remove all error classes
        form.querySelectorAll('.border-red-500').forEach(field => {
            field.classList.remove('border-red-500');
        });

        // Remove all error messages
        form.querySelectorAll('[id$="-error"]').forEach(error => {
            error.remove();
        });
    },

    /**
     * Real-time validation
     */
    setupRealTimeValidation(fieldId, validatorFunc) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.addEventListener('blur', () => {
            const result = validatorFunc(field.value);
            if (!result.isValid) {
                this.showFieldError(fieldId, result.message);
            } else {
                this.clearFieldError(fieldId);
            }
        });

        field.addEventListener('input', () => {
            const errorDiv = document.getElementById(`${fieldId}-error`);
            if (errorDiv) {
                this.clearFieldError(fieldId);
            }
        });
    }
};

// Export
window.Validators = Validators;