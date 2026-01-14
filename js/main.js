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

    // Contact Form Submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Reset error messages
            const formGroups = contactForm.querySelectorAll('.form-group');
            formGroups.forEach(group => group.classList.remove('error'));

            // Basic Validation
            let isValid = true;
            const requiredFields = contactForm.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                if (field.type === 'radio') {
                    const name = field.getAttribute('name');
                    const checked = contactForm.querySelector(`input[name="${name}"]:checked`);
                    if (!checked) {
                        field.closest('.form-group').classList.add('error');
                        isValid = false;
                    }
                } else if (field.type === 'checkbox') {
                    if (!field.checked) {
                        field.closest('.form-group').classList.add('error');
                        isValid = false;
                    }
                } else {
                    if (!field.value.trim()) {
                        field.closest('.form-group').classList.add('error');
                        isValid = false;
                    }
                }
            });

            if (!isValid) {
                const firstError = contactForm.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
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
