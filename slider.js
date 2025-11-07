/**
 * ============================================
 * BANNER SLIDER COMPONENT
 * ============================================
 * จัดการ banner slider บนหน้า home
 */

const Slider = {
    currentSlide: 0,
    totalSlides: 4,
    autoPlayInterval: null,
    autoPlayDelay: 5000, // 5 วินาที

    /**
     * Initialize Slider
     */
    init() {
        console.log('🎬 Initializing Slider...');
        this.render();
        this.startAutoPlay();
        console.log('✅ Slider initialized');
    },

    /**
     * Render Slider HTML
     */
    render() {
        const container = document.getElementById('slider-container');
        if (!container) {
            console.error('❌ Slider container not found');
            return;
        }

        container.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 py-16">
                <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">🎯 กิจกรรมแนะนำ</h2>
                
                <div class="relative">
                    <!-- Slider Container -->
                    <div class="overflow-hidden rounded-2xl shadow-2xl">
                        <div id="banner-slider" class="flex transition-transform duration-500 ease-in-out">
                            ${this.renderSlides()}
                        </div>
                    </div>

                    <!-- Navigation Arrows -->
                    <button onclick="Slider.previousSlide()"
                            class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button onclick="Slider.nextSlide()"
                            class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10">
                        <i class="fas fa-chevron-right"></i>
                    </button>

                    <!-- Dots Indicator -->
                    <div class="flex justify-center mt-6 space-x-2">
                        ${this.renderDots()}
                    </div>
                </div>
            </div>
        `;

        this.updateSlider();
    },

    /**
     * Render Slide Items
     */
    renderSlides() {
        const slides = [
            {
                image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&h=400&fit=crop',
                title: 'คอนเสิร์ตดนตรีประจำปี',
                subtitle: 'ชมรมดนตรีสากล',
                description: 'เข้าร่วมการแสดงดนตรีสุดยิ่งใหญ่ประจำปี พบกับนักดนตรีมากมาย',
                activityId: 1,
                color: 'blue'
            },
            {
                image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=400&fit=crop',
                title: 'แข่งขันฟุตบอลระหว่างคณะ',
                subtitle: 'ชมรมฟุตบอล',
                description: 'ร่วมเชียร์และสนับสนุนทีมของคุณในการแข่งขันฟุตบอลสุดมันส์',
                activityId: 2,
                color: 'green'
            },
            {
                image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=400&fit=crop',
                title: 'นิทรรศการศิลปกรรม',
                subtitle: 'ชมรมศิลปกรรม',
                description: 'ชมผลงานศิลปกรรมสุดสร้างสรรค์จากนักศึกษาและศิลปินรุ่นใหม่',
                activityId: 3,
                color: 'purple'
            },
            {
                image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=400&fit=crop',
                title: 'Workshop การเขียนโปรแกรม',
                subtitle: 'ชมรมเทคโนโลยี',
                description: 'เรียนรู้การเขียนโปรแกรมจากพื้นฐานไปจนถึงขั้นสูงกับผู้เชี่ยวชาญ',
                activityId: 4,
                color: 'indigo'
            }
        ];

        return slides.map((slide, index) => `
            <div class="min-w-full h-96 relative">
                <img src="${slide.image}"
                    alt="${slide.title}"
                    class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
                <div class="absolute inset-0 flex items-center">
                    <div class="text-white px-8 md:px-16">
                        <h3 class="text-4xl md:text-5xl font-bold mb-4">${slide.title}</h3>
                        <p class="text-xl md:text-2xl mb-4 opacity-90">${slide.subtitle}</p>
                        <p class="text-lg mb-6 max-w-2xl">${slide.description}</p>
                        <div class="flex gap-4">
                            <button onclick="Modals.handleRegistrationClick(${slide.activityId})"
                                    class="bg-${slide.color}-600 hover:bg-${slide.color}-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                                สมัครเข้าร่วม
                            </button>
                            <button onclick="ActivitiesPage.showActivityDetails(${slide.activityId})"
                                    class="border-2 border-white text-white hover:bg-white hover:text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors">
                                ดูรายละเอียด
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Render Dots
     */
    renderDots() {
        let dots = '';
        for (let i = 0; i < this.totalSlides; i++) {
            dots += `<button onclick="Slider.goToSlide(${i})"
                            class="slide-dot w-3 h-3 rounded-full transition-colors ${i === 0 ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}">
                    </button>`;
        }
        return dots;
    },

    /**
     * Update Slider Position
     */
    updateSlider() {
        const slider = document.getElementById('banner-slider');
        if (!slider) return;

        const translateX = -this.currentSlide * 100;
        slider.style.transform = `translateX(${translateX}%)`;

        // Update dots
        document.querySelectorAll('.slide-dot').forEach((dot, index) => {
            if (index === this.currentSlide) {
                dot.classList.add('bg-blue-600');
                dot.classList.remove('bg-gray-300');
            } else {
                dot.classList.remove('bg-blue-600');
                dot.classList.add('bg-gray-300');
            }
        });
    },

    /**
     * Next Slide
     */
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlider();
        this.resetAutoPlay();
    },

    /**
     * Previous Slide
     */
    previousSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
        this.resetAutoPlay();
    },

    /**
     * Go to Specific Slide
     */
    goToSlide(slideIndex) {
        this.currentSlide = slideIndex;
        this.updateSlider();
        this.resetAutoPlay();
    },

    /**
     * Start Auto Play
     */
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    },

    /**
     * Stop Auto Play
     */
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    },

    /**
     * Reset Auto Play
     */
    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    },

    /**
     * Pause on Hover (Optional)
     */
    setupHoverPause() {
        const slider = document.getElementById('banner-slider');
        if (!slider) return;

        slider.addEventListener('mouseenter', () => {
            this.stopAutoPlay();
        });

        slider.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });
    }
};

// Export
window.Slider = Slider;