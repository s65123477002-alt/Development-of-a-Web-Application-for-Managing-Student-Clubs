/**
 * ============================================
 * CLUBS PAGE
 * ============================================
 * จัดการหน้าแสดงรายชื่อชมรม
 */

const ClubsPage = {
    currentFilter: 'all',
    currentTypeFilter: 'all-types',

    /**
     * Initialize Clubs Page
     */
    init() {
        console.log('🎭 Initializing Clubs Page...');
        this.renderFilters();
        this.renderClubs();
        console.log('✅ Clubs Page initialized');
    },

    /**
     * Render Category Filters
     */
    renderFilters() {
    const container = document.getElementById('club-filters');
    if (!container) return;

        const categories = [
            { key: 'all', name: 'ทั้งหมด', color: 'purple' },
            { key: 'volunteer', name: 'อาสา', color: 'red' },
            { key: 'culture', name: 'ศิลปวัฒนธรรม', color: 'purple' },
            { key: 'sports', name: 'กีฬา', color: 'green' }
        ];

        const types = [
            { key: 'all-types', name: 'ทุกประเภท', color: 'gray' },
            { key: 'central', name: 'ส่วนกลาง', color: 'blue' },
            { key: 'faculty', name: 'ส่วนคณะ', color: 'indigo' }
        ];

        container.innerHTML = `
            <div class="w-full space-y-4">
                <!-- Category Filters -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">หมวดหมู่:</label>
                    <div class="flex flex-wrap gap-3">
                        ${categories.map(cat => `
                            <button onclick="ClubsPage.filterByCategory('${cat.key}')" 
                                    data-category="${cat.key}"
                                    class="category-filter-btn bg-${cat.color}-600 text-white px-6 py-2 rounded-full font-medium hover:bg-${cat.color}-700 transition-colors ${cat.key === 'all' ? 'ring-2 ring-white shadow-lg' : ''}">
                                ${cat.name}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Type Filters -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">ประเภท:</label>
                    <div class="flex flex-wrap gap-3">
                        ${types.map(type => `
                            <button onclick="ClubsPage.filterByType('${type.key}')" 
                                    data-type="${type.key}"
                                    class="type-filter-btn bg-${type.color}-600 text-white px-6 py-2 rounded-full font-medium hover:bg-${type.color}-700 transition-colors ${type.key === 'all-types' ? 'ring-2 ring-white shadow-lg' : ''}">
                                ${type.name}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render Clubs Grid
     */
    renderClubs() {
        const container = document.getElementById('clubs-grid');
        if (!container) return;

        container.innerHTML = clubsData.map(club => `
            <div class="club-card card-hover bg-white rounded-2xl shadow-lg overflow-hidden" data-category="${club.category}" data-type="${club.type}">
                <!-- Club Header with Logo -->
                <div class="h-48 bg-gradient-to-br ${Helpers.getClubGradient(club.category)} relative flex items-center justify-center">
                    <div class="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div class="relative z-10 text-center text-white">
                        <div class="mx-auto mb-4">
                            <img src="${club.logo}"
                                alt="${club.name} logo"
                                class="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover mx-auto"
                                onerror="this.style.display='none'">
                        </div>
                        <h3 class="text-xl font-bold">${club.name}</h3>
                    </div>
                </div>
                
                <!-- Club Content -->
                <div class="p-6">
                <!-- Category & Type Badges -->
                    <div class="mb-4 flex items-center gap-2">
                        <span class="inline-flex items-center bg-${Helpers.getClubColor(club.category)}-100 text-${Helpers.getClubColor(club.category)}-800 text-xs px-3 py-1 rounded-full font-medium">
                            <span class="mr-1">${Helpers.getClubIcon(club.category)}</span>
                            ${Helpers.getCategoryName(club.category)}
                        </span>
                        <span class="inline-flex items-center bg-${Helpers.getTypeColor(club.type)}-100 text-${Helpers.getTypeColor(club.type)}-800 text-xs px-3 py-1 rounded-full font-medium">
                            <span class="mr-1">${Helpers.getTypeIcon(club.type)}</span>
                            ${Helpers.getTypeName(club.type)}
                        </span>
                    </div>
                    
                    <!-- Description -->
                    <p class="text-gray-600 mb-4">${club.description}</p>
                    
                    <!-- History -->
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-800 mb-2">ประวัติ</h4>
                        <p class="text-sm text-gray-600">${club.history}</p>
                    </div>
                    
                    <!-- Past Activities -->
                    ${club.pastActivities && club.pastActivities.length > 0 ? `
                        <div class="mb-4">
                            <h4 class="font-semibold text-gray-800 mb-2">กิจกรรมที่ผ่านมา</h4>
                            <ul class="text-sm text-gray-600 space-y-1">
                                ${club.pastActivities.slice(0, 3).map(activity => `
                                    <li class="flex items-start">
                                        <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                                        <span>${activity}</span>
                                    </li>
                                `).join('')}
                                ${club.pastActivities.length > 3 ? `
                                    <li class="text-blue-600 cursor-pointer hover:text-blue-800" onclick="ClubsPage.showAllActivities(${club.id})">
                                        <i class="fas fa-plus-circle mr-1"></i>
                                        ดูเพิ่มเติม (${club.pastActivities.length - 3} รายการ)
                                    </li>
                                ` : ''}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <!-- Contact -->
                    <div class="border-t pt-4">
                        <h4 class="font-semibold text-gray-800 mb-2">ติดต่อ</h4>
                        <div class="flex space-x-3 mb-2">
                            <a href="https://facebook.com/${club.contact.facebook}" target="_blank" 
                            class="text-blue-600 hover:text-blue-800 transition-colors">
                                <i class="fab fa-facebook text-xl"></i>
                            </a>
                            <a href="https://instagram.com/${club.contact.instagram.replace('@', '')}" target="_blank"
                            class="text-pink-600 hover:text-pink-800 transition-colors">
                                <i class="fab fa-instagram text-xl"></i>
                            </a>
                            <a href="https://line.me/ti/p/${club.contact.line}" target="_blank"
                            class="text-green-600 hover:text-green-800 transition-colors">
                                <i class="fab fa-line text-xl"></i>
                            </a>
                        </div>
                        <div class="text-xs text-gray-500 space-y-1">
                            <div><i class="fab fa-facebook mr-1"></i> ${club.contact.facebook}</div>
                            <div><i class="fab fa-instagram mr-1"></i> ${club.contact.instagram}</div>
                            <div><i class="fab fa-line mr-1"></i> ${club.contact.line}</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

/**
 * Filter Clubs by Category
 */
filterByCategory(category) {
    console.log('🔍 Filtering clubs by category:', category);
    
    this.currentFilter = category;

    // Update button states
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-white', 'shadow-lg');
        if (btn.dataset.category === category) {
            btn.classList.add('ring-2', 'ring-white', 'shadow-lg');
        }
    });

    // Apply filters
    this.applyFilters();
},

/**
 * Filter Clubs by Type
 */
filterByType(type) {
    console.log('🔍 Filtering clubs by type:', type);
    
    this.currentTypeFilter = type;

    // Update button states
    document.querySelectorAll('.type-filter-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-white', 'shadow-lg');
        if (btn.dataset.type === type) {
            btn.classList.add('ring-2', 'ring-white', 'shadow-lg');
        }
    });

    // Apply filters
    this.applyFilters();
},

/**
 * Filter Clubs by Category
 */
filterByCategory(category) {
    console.log('🔍 Filtering clubs by category:', category);
    
    this.currentFilter = category;

    // Update button states
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-white', 'shadow-lg');
        if (btn.dataset.category === category) {
            btn.classList.add('ring-2', 'ring-white', 'shadow-lg');
        }
    });

    // Apply filters
    this.applyFilters();
},

/**
 * Filter Clubs by Type
 */
filterByType(type) {
    console.log('🔍 Filtering clubs by type:', type);
    
    this.currentTypeFilter = type;

    // Update button states
    document.querySelectorAll('.type-filter-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-white', 'shadow-lg');
        if (btn.dataset.type === type) {
            btn.classList.add('ring-2', 'ring-white', 'shadow-lg');
        }
    });

    // Apply filters
    this.applyFilters();
},

/**
 * Apply all filters
 */
applyFilters() {
    const clubCards = document.querySelectorAll('.club-card');
    const category = this.currentFilter || 'all';
    const type = this.currentTypeFilter || 'all-types';
    
    clubCards.forEach(card => {
        const cardCategory = card.dataset.category;
        const cardType = card.dataset.type;
        
        const categoryMatch = category === 'all' || cardCategory === category;
        const typeMatch = type === 'all-types' || cardType === type;
        
        if (categoryMatch && typeMatch) {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
        }
    });

    // Scroll to clubs grid
    const clubsGrid = document.getElementById('clubs-grid');
    if (clubsGrid) {
        clubsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
},

    /**
     * Show All Activities of a Club
     */
    showAllActivities(clubId) {
        const club = clubsData.find(c => c.id === clubId);
        if (!club || !club.pastActivities) return;

        const modal = document.getElementById('registration-modal');
        const content = document.getElementById('registration-content');

        if (!modal || !content) return;

        content.innerHTML = `
            <div class="space-y-4">
                <h4 class="text-xl font-bold text-gray-800">${club.name}</h4>
                <h5 class="text-lg font-semibold text-gray-700">กิจกรรมที่ผ่านมาทั้งหมด</h5>
                
                <div class="max-h-96 overflow-y-auto space-y-2">
                    ${club.pastActivities.map((activity, index) => `
                        <div class="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div class="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                                ${index + 1}
                            </div>
                            <div class="flex-1">
                                <p class="text-gray-800">${activity}</p>
                            </div>
                            <i class="fas fa-check-circle text-green-500 ml-2"></i>
                        </div>
                    `).join('')}
                </div>
                
                <div class="flex justify-end">
                    <button onclick="Modals.closeRegistration()" 
                            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                        ปิด
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    /**
     * Search Clubs
     */
    searchClubs(query) {
        const searchTerm = query.toLowerCase();
        const clubCards = document.querySelectorAll('.club-card');

        clubCards.forEach(card => {
            const clubName = card.querySelector('h3').textContent.toLowerCase();
            const clubDesc = card.querySelector('.text-gray-600').textContent.toLowerCase();

            if (clubName.includes(searchTerm) || clubDesc.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },

    /**
     * Reset Filters
     */
    resetFilters() {
        this.filterClubs('all');
    }
};

// Export
window.ClubsPage = ClubsPage;