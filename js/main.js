document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Header Scroll Effect
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '10px 0';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.padding = '15px 0';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        }
    });

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Once animated, no need to observe anymore
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // FAQ Accordion
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isOpen = item.classList.contains('active');

            // Optional: Close other items
            // accordionHeaders.forEach(h => h.parentElement.classList.remove('active'));
            // accordionHeaders.forEach(h => h.setAttribute('aria-expanded', 'false'));

            if (!isOpen) {
                item.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
            } else {
                item.classList.remove('active');
                header.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // --- Contact Form Logic ---
    // reCAPTCHA サイトキーをHTMLのscriptタグから自動取得
    const recaptchaScript = document.querySelector('script[src*="recaptcha"]');
    const RECAPTCHA_SITE_KEY = recaptchaScript
        ? new URL(recaptchaScript.src).searchParams.get('render')
        : null;

    const ERROR_MESSAGES = {
        required: '必須項目です',
        email: '有効なメールアドレスを入力してください',
        phone: '有効な電話番号を入力してください（10桁または11桁）',
        checkbox: 'プライバシーポリシーへの同意が必要です',
        radio: 'お問い合わせ内容を選択してください',
        recaptcha: 'reCAPTCHAの認証に失敗しました。ページを更新して再度お試しください。'
    };

    const VALIDATION_PATTERNS = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^\d{10,11}$/
    };

    /**
     * Show error message for a form group
     * @param {HTMLElement} formGroup - The parent .form-group element
     * @param {string} message - The error message to display
     */
    function showError(formGroup, message) {
        formGroup.classList.add('error');
        const errorDisplay = formGroup.querySelector('.error-message');
        if (errorDisplay) {
            errorDisplay.textContent = message;
        }
    }

    /**
     * Clear error message for a form group
     * @param {HTMLElement} formGroup - The parent .form-group element
     */
    function clearError(formGroup) {
        formGroup.classList.remove('error');
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid
     */
    function validateEmail(email) {
        return VALIDATION_PATTERNS.email.test(email);
    }

    /**
     * Validate phone format (Japanese: digits only, 10-11 digits)
     * @param {string} phone - Phone number to validate
     * @returns {boolean} - True if valid
     */
    function validatePhone(phone) {
        // Remove spaces and hyphens before validation
        const cleanPhone = phone.replace(/[\s-]/g, '');
        return VALIDATION_PATTERNS.phone.test(cleanPhone);
    }

    /**
     * Validate a single field
     * @param {HTMLElement} field - The input field
     * @returns {boolean} - True if valid
     */
    function validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return true;

        const value = field.value.trim();
        const fieldType = field.type;
        const fieldId = field.id;

        // Radio button validation
        if (fieldType === 'radio') {
            const name = field.getAttribute('name');
            const checked = document.querySelector(`input[name="${name}"]:checked`);
            if (field.required && !checked) {
                showError(formGroup, ERROR_MESSAGES.radio);
                return false;
            }
            clearError(formGroup);
            return true;
        }

        // Checkbox validation
        if (fieldType === 'checkbox') {
            if (field.required && !field.checked) {
                showError(formGroup, ERROR_MESSAGES.checkbox);
                return false;
            }
            clearError(formGroup);
            return true;
        }

        // Required field validation
        if (field.required && !value) {
            const label = formGroup.querySelector('label');
            const fieldName = label ? label.textContent.replace('必須', '').trim() : 'この項目';
            showError(formGroup, `${fieldName}を入力してください`);
            return false;
        }

        // Email format validation
        if (fieldId === 'email' && value && !validateEmail(value)) {
            showError(formGroup, ERROR_MESSAGES.email);
            return false;
        }

        // Phone format validation
        if (fieldId === 'phone' && value && !validatePhone(value)) {
            showError(formGroup, ERROR_MESSAGES.phone);
            return false;
        }

        clearError(formGroup);
        return true;
    }

    /**
     * Validate entire form
     * @param {HTMLFormElement} form - The form element
     * @returns {boolean} - True if all fields are valid
     */
    function validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input, textarea, select');

        // Track validated radio groups to avoid duplicate validation
        const validatedRadioGroups = new Set();

        fields.forEach(field => {
            if (field.type === 'radio') {
                const name = field.getAttribute('name');
                if (!validatedRadioGroups.has(name)) {
                    validatedRadioGroups.add(name);
                    if (!validateField(field)) {
                        isValid = false;
                    }
                }
            } else if (field.type !== 'hidden') {
                if (!validateField(field)) {
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    /**
     * Get reCAPTCHA token
     * @returns {Promise<string|null>} - Token or null if failed
     */
    async function getRecaptchaToken() {
        try {
            if (typeof grecaptcha === 'undefined') {
                console.warn('reCAPTCHA not loaded');
                return null;
            }

            await new Promise(resolve => grecaptcha.ready(resolve));
            const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'contact_form' });
            return token;
        } catch (error) {
            console.error('reCAPTCHA error:', error);
            return null;
        }
    }

    /**
     * Setup real-time validation listeners
     * @param {HTMLFormElement} form - The form element
     */
    function setupRealtimeValidation(form) {
        const fields = form.querySelectorAll('input, textarea, select');

        fields.forEach(field => {
            // Clear error on input
            field.addEventListener('input', () => {
                validateField(field);
            });

            // Clear error on change (for radio/checkbox)
            field.addEventListener('change', () => {
                validateField(field);
            });

            // Validate on blur
            field.addEventListener('blur', () => {
                validateField(field);
            });
        });
    }

    // Contact Form Submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        // Setup real-time validation
        setupRealtimeValidation(contactForm);

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Reset all error messages
            const formGroups = contactForm.querySelectorAll('.form-group');
            formGroups.forEach(group => clearError(group));

            // Validate form
            const isValid = validateForm(contactForm);

            if (!isValid) {
                const firstError = contactForm.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            // reCAPTCHA トークン取得
            const recaptchaToken = await getRecaptchaToken();
            if (!recaptchaToken) {
                alert(ERROR_MESSAGES.recaptcha);
                return;
            }

            // hidden フィールドにセット
            const recaptchaInput = document.getElementById('recaptcha-token');
            if (recaptchaInput) {
                recaptchaInput.value = recaptchaToken;
            }

            // Prepare Data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Loading State
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '送信中...';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    // サンクスページへリダイレクト
                    window.location.href = '/thanks';
                } else {
                    // Error from API
                    alert(result.error || '送信に失敗しました。時間をおいて再度お試しください。');
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('通信エラーが発生しました。ネットワーク状況を確認してください。');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }
});
