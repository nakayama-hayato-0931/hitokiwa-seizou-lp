document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }

    // Hero Carousel (Mobile)
    const heroGallery = document.querySelector('.hero-gallery');
    const indicators = document.querySelectorAll('.carousel-indicators .indicator');
    const cards = document.querySelectorAll('.hero-gallery .talent-card-vertical');

    if (heroGallery && indicators.length > 0 && cards.length > 0) {
        // Update indicators based on scroll position
        const updateIndicators = () => {
            const scrollLeft = heroGallery.scrollLeft;
            const cardWidth = cards[0].offsetWidth;
            const gap = 20; // CSS gap value
            const containerPadding = heroGallery.offsetWidth / 2 - cardWidth / 2;

            // Calculate which card is closest to center
            let activeIndex = 0;
            let minDistance = Infinity;

            cards.forEach((card, index) => {
                const cardCenter = card.offsetLeft - containerPadding + cardWidth / 2;
                const scrollCenter = scrollLeft + heroGallery.offsetWidth / 2;
                const distance = Math.abs(cardCenter - scrollCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    activeIndex = index;
                }
            });

            // Update indicator active states
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === activeIndex);
            });
        };

        // Scroll to card when indicator is clicked
        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const index = parseInt(indicator.dataset.index, 10);
                const targetCard = cards[index];

                if (targetCard) {
                    const cardWidth = targetCard.offsetWidth;
                    const containerPadding = heroGallery.offsetWidth / 2 - cardWidth / 2;
                    const scrollPosition = targetCard.offsetLeft - containerPadding;

                    heroGallery.scrollTo({
                        left: scrollPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Listen for scroll events (with debounce for performance)
        let scrollTimeout;
        heroGallery.addEventListener('scroll', () => {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = window.requestAnimationFrame(() => {
                updateIndicators();
            });
        });

        // Initial update
        updateIndicators();
    }

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
    // Anti-Gravity Job Cards 3D Tilt Effect
    const jobCards = document.querySelectorAll('.job-card');

    // Check if device supports hover
    const isHoverable = window.matchMedia('(hover: hover)').matches;

    if (isHoverable) {
        jobCards.forEach(card => {
            const inner = card.querySelector('.job-card-inner');

            if (!inner) return;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Calculate center
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Calculate tilt (max +/- 8 degrees)
                // RotateY is based on X axis movement (left/right)
                // RotateX is based on Y axis movement (up/down) - inverted
                const rotateY = ((x - centerX) / centerX) * 8;
                const rotateX = -((y - centerY) / centerY) * 8;

                // Apply transform (including hover lift/scale)
                inner.style.transform = `translateY(-15px) scale(1.03) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                // Reset to CSS hover state (or empty to let CSS take over)
                inner.style.transform = '';
            });
        });
    }

    // FAQ Accordion
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', !isExpanded);
        });
    });

    // =====================================
    // Contact Form Validation & Submission
    // =====================================

    // reCAPTCHA v3 Site Key (replace with actual key in production)
    const RECAPTCHA_SITE_KEY = 'RECAPTCHA_SITE_KEY';

    // Validation Patterns
    const VALIDATION_PATTERNS = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[0-9\-]+$/
    };

    // Error Messages
    const ERROR_MESSAGES = {
        required: 'この項目は必須です',
        email: '有効なメールアドレスを入力してください',
        phone: '数字とハイフンのみで入力してください',
        radio: '選択してください',
        checkbox: 'チェックが必要です',
        recaptcha: 'reCAPTCHAの検証に失敗しました。ページを再読み込みしてください。'
    };

    /**
     * Show error message for a form group
     * @param {HTMLElement} formGroup - The form group element
     * @param {string} message - Error message to display
     */
    function showError(formGroup, message) {
        formGroup.classList.add('error');
        const errorSpan = formGroup.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = message;
        }
    }

    /**
     * Clear error message for a form group
     * @param {HTMLElement} formGroup - The form group element
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
     * Validate phone format (Japanese: digits and hyphens only)
     * @param {string} phone - Phone number to validate
     * @returns {boolean} - True if valid
     */
    function validatePhone(phone) {
        return VALIDATION_PATTERNS.phone.test(phone);
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

            // Get reCAPTCHA token
            const recaptchaToken = await getRecaptchaToken();
            if (!recaptchaToken) {
                alert(ERROR_MESSAGES.recaptcha);
                return;
            }

            // Set token to hidden field
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
                    // Success
                    contactForm.innerHTML = `
                        <div class="form-success-message" style="text-align: center; padding: 40px 0;">
                            <div style="font-size: 3rem; margin-bottom: 20px;">✅</div>
                            <h3 style="margin-bottom: 10px;">お問い合わせありがとうございます</h3>
                            <p>内容を確認の上、担当者よりご連絡させていただきます。</p>
                        </div>
                    `;
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
