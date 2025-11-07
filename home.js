/**
 * ============================================
 * HOME PAGE - ADVANCED AI RECOMMENDATION
 * ============================================
 * จัดการหน้า Home และ AI Club Recommendation แบบขั้นสูง
 */

const HomePage = {
    searchHistory: [],
    maxHistorySize: 5,
    
    /**
     * Initialize Home Page
     */
    init() {
        console.log('🏠 Initializing Home Page...');
        this.loadSearchHistory();
        this.setupEventListeners();
        this.showPopularSearches();
        console.log('✅ Home Page initialized');
    },

    /**
     * Load Search History from localStorage
     */
    loadSearchHistory() {
        const saved = localStorage.getItem('clubSearchHistory');
        if (saved) {
            try {
                this.searchHistory = JSON.parse(saved);
            } catch (e) {
                this.searchHistory = [];
            }
        }
    },

    /**
     * Save Search to History
     */
    saveSearchToHistory(searchTerm) {
        // ไม่เพิ่มถ้าซ้ำกับค้นหาล่าสุด
        if (this.searchHistory[0] === searchTerm) return;
        
        // ลบถ้ามีอยู่แล้ว
        this.searchHistory = this.searchHistory.filter(term => term !== searchTerm);
        
        // เพิ่มที่หัวสุด
        this.searchHistory.unshift(searchTerm);
        
        // จำกัดจำนวน
        if (this.searchHistory.length > this.maxHistorySize) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
        }
        
        // บันทึก
        localStorage.setItem('clubSearchHistory', JSON.stringify(this.searchHistory));
    },

    /**
     * Show Popular Searches
     */
    showPopularSearches() {
        const popularSearches = [
            { term: 'กีฬา', icon: '⚽', color: 'green' },
            { term: 'ดนตรี', icon: '🎵', color: 'blue' },
            { term: 'เทคโนโลยี', icon: '💻', color: 'indigo' },
            { term: 'ศิลปะ', icon: '🎨', color: 'purple' },
            { term: 'วัฒนธรรมใต้', icon: '🎭', color: 'pink' },
            { term: 'อาสาสมัคร', icon: '🤝', color: 'red' }
        ];

        const container = document.createElement('div');
        container.className = 'mt-4 flex flex-wrap gap-2 justify-center';
        container.innerHTML = `
            <span class="text-white/70 text-sm mr-2">คำค้นหายอดนิยม:</span>
            ${popularSearches.map(search => `
                <button onclick="HomePage.quickSearch('${search.term}')" 
                        class="bg-${search.color}-500/30 hover:bg-${search.color}-500/50 text-white text-sm px-3 py-1 rounded-full transition-colors border border-white/20">
                    ${search.icon} ${search.term}
                </button>
            `).join('')}
        `;

        const aiGlow = document.querySelector('.ai-glow');
        if (aiGlow && !document.getElementById('popular-searches')) {
            container.id = 'popular-searches';
            aiGlow.appendChild(container);
        }
    },

    /**
     * Quick Search
     */
    quickSearch(term) {
        const input = document.getElementById('interest-input');
        if (input) {
            input.value = term;
            this.generateRecommendations();
        }
    },

    /**
     * Setup Event Listeners
     */
    setupEventListeners() {
        const interestInput = document.getElementById('interest-input');
        if (interestInput) {
            // Enter key to generate recommendations
            interestInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.generateRecommendations();
                }
            });
        }
    },

    /**
     * Generate Club Recommendations (Advanced AI)
     */
    generateRecommendations() {
        const input = document.getElementById('interest-input');
        const recommendationsDiv = document.getElementById('ai-recommendations');
        const clubsDiv = document.getElementById('recommended-clubs');

        if (!input || !recommendationsDiv || !clubsDiv) {
            console.error('❌ Required elements not found');
            return;
        }

        const interest = input.value.toLowerCase().trim();

        if (!interest) {
            alert('กรุณาใส่ความสนใจของคุณ');
            return;
        }

        console.log('🤖 AI Analyzing:', interest);

        // Save to history
        this.saveSearchToHistory(interest);

        // Advanced AI Analysis
        const analysisResult = this.advancedAIAnalysis(interest);
        
        // แสดงผลการวิเคราะห์
        this.displayRecommendations(analysisResult, clubsDiv);
        
        recommendationsDiv.classList.remove('hidden');

        // Scroll to results
        recommendationsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

        console.log(`✅ Analysis complete: ${analysisResult.recommendations.length} clubs found`);
    },

    /**
     * Advanced AI Analysis
     * วิเคราะห์ความสนใจและจับคู่กับชมรม
     */
    advancedAIAnalysis(interest) {
        console.log('Running advanced AI analysis...');
        
        const results = [];
        
        // วิเคราะห์แต่ละชมรม
        clubsData.forEach(club => {
            const score = this.calculateClubScore(club, interest);
            
            if (score.totalScore > 0) {
                results.push({
                    club: club,
                    score: score.totalScore,
                    reasons: score.reasons,
                    matchDetails: score.details
                });
            }
        });

        // เรียงตาม score สูงสุด
        results.sort((a, b) => b.score - a.score);

        // เอาแค่ top 5
        const topResults = results.slice(0, 5);

        return {
            searchTerm: interest,
            totalMatches: results.length,
            recommendations: topResults,
            analysis: this.generateAnalysisText(interest, topResults)
        };
    },

    /**
     * Calculate Club Score
     * คำนวณคะแนนความเหมาะสมของชมรม
     */
    calculateClubScore(club, interest) {
        let totalScore = 0;
        const reasons = [];
        const details = {};

        // 1. ตรวจสอบชื่อชมรม (น้ำหนัก 30%)
        const nameMatch = this.calculateTextMatch(club.name, interest);
        if (nameMatch.score > 0) {
            totalScore += nameMatch.score * 30;
            reasons.push(`ชื่อชมรมตรงกับคำค้นหา (${Math.round(nameMatch.score * 100)}%)`);
            details.nameMatch = nameMatch;
        }

        // 2. ตรวจสอบคำอธิบาย (น้ำหนัก 25%)
        const descMatch = this.calculateTextMatch(club.description, interest);
        if (descMatch.score > 0) {
            totalScore += descMatch.score * 25;
            reasons.push(`คำอธิบายเกี่ยวข้อง (${Math.round(descMatch.score * 100)}%)`);
            details.descriptionMatch = descMatch;
        }

        // 3. ตรวจสอบประวัติ (น้ำหนัก 15%)
        if (club.history) {
            const historyMatch = this.calculateTextMatch(club.history, interest);
            if (historyMatch.score > 0) {
                totalScore += historyMatch.score * 15;
                reasons.push(`ประวัติชมรมเกี่ยวข้อง (${Math.round(historyMatch.score * 100)}%)`);
                details.historyMatch = historyMatch;
            }
        }

        // 4. ตรวจสอบกิจกรรมในอดีต (น้ำหนัก 20%)
        if (club.pastActivities && club.pastActivities.length > 0) {
            const activityMatches = this.analyzePastActivities(club.pastActivities, interest);
            if (activityMatches.score > 0) {
                totalScore += activityMatches.score * 20;
                reasons.push(`มีกิจกรรมที่เกี่ยวข้อง ${activityMatches.matchCount}/${club.pastActivities.length} รายการ`);
                details.activityMatches = activityMatches;
            }
        }

        // 5. ตรวจสอบกิจกรรมปัจจุบัน (น้ำหนัก 10%)
        const currentActivities = this.getCurrentClubActivities(club.id);
        if (currentActivities.length > 0) {
            const currentMatch = this.analyzeCurrentActivities(currentActivities, interest);
            if (currentMatch.score > 0) {
                totalScore += currentMatch.score * 10;
                reasons.push(`มีกิจกรรมที่เปิดรับสมัคร ${currentMatch.matchCount} รายการ`);
                details.currentActivities = currentMatch;
            }
        }

        // 6. ตรวจสอบหมวดหมู่ (Bonus)
        const categoryMatch = this.matchCategory(club.category, interest);
        if (categoryMatch.matched) {
            totalScore += 20;
            reasons.push(`หมวดหมู่ตรงกับความสนใจ (${categoryMatch.categoryName})`);
            details.categoryMatch = categoryMatch;
        }

        return {
            totalScore: Math.min(totalScore, 100), // จำกัดไม่เกิน 100
            reasons: reasons,
            details: details
        };
    },

    /**
     * Calculate Text Match
     * คำนวณความตรงกันของข้อความ
     */
    calculateTextMatch(text, searchTerm) {
        if (!text) return { score: 0, matches: [] };

        const textLower = text.toLowerCase();
        const searchTermLower = searchTerm.toLowerCase();
        
        // แยกคำค้นหา
        const searchWords = searchTermLower.split(/\s+/).filter(w => w.length > 1);
        
        let matchCount = 0;
        const matches = [];

        searchWords.forEach(word => {
            if (textLower.includes(word)) {
                matchCount++;
                matches.push(word);
            }
        });

        const score = searchWords.length > 0 ? matchCount / searchWords.length : 0;

        return {
            score: score,
            matches: matches,
            matchCount: matchCount,
            totalWords: searchWords.length
        };
    },

    /**
     * Analyze Past Activities
     * วิเคราะห์กิจกรรมในอดีต
     */
    analyzePastActivities(activities, interest) {
        let totalScore = 0;
        let matchCount = 0;
        const matchedActivities = [];

        activities.forEach(activity => {
            const match = this.calculateTextMatch(activity, interest);
            if (match.score > 0) {
                matchCount++;
                totalScore += match.score;
                matchedActivities.push({
                    activity: activity,
                    score: match.score,
                    matches: match.matches
                });
            }
        });

        const avgScore = activities.length > 0 ? totalScore / activities.length : 0;

        return {
            score: avgScore,
            matchCount: matchCount,
            totalActivities: activities.length,
            matchedActivities: matchedActivities
        };
    },

    /**
     * Get Current Club Activities
     * หากิจกรรมปัจจุบันของชมรม
     */
    getCurrentClubActivities(clubId) {
        const club = clubsData.find(c => c.id === clubId);
        if (!club) return [];

        return activitiesData.filter(activity => 
            activity.club === club.name && 
            (activity.status === 'open' || activity.status === 'closing')
        );
    },

    /**
     * Analyze Current Activities
     * วิเคราะห์กิจกรรมปัจจุบัน
     */
    analyzeCurrentActivities(activities, interest) {
        let totalScore = 0;
        let matchCount = 0;
        const matchedActivities = [];

        activities.forEach(activity => {
            const nameMatch = this.calculateTextMatch(activity.name, interest);
            const descMatch = this.calculateTextMatch(activity.description, interest);
            
            const activityScore = Math.max(nameMatch.score, descMatch.score);
            
            if (activityScore > 0) {
                matchCount++;
                totalScore += activityScore;
                matchedActivities.push({
                    activity: activity,
                    score: activityScore
                });
            }
        });

        const avgScore = activities.length > 0 ? totalScore / activities.length : 0;

        return {
            score: avgScore,
            matchCount: matchCount,
            totalActivities: activities.length,
            matchedActivities: matchedActivities
        };
    },

    /**
     * Match Category
     * ตรวจสอบหมวดหมู่พร้อม Synonym และ Context
     */
    matchCategory(category, interest) {
        const categoryKeywords = {
            sports: {
                primary: ['กีฬา', 'sport'],
                secondary: ['วิ่ง', 'เล่น', 'ออกกำลัง', 'แข่ง', 'ฝึก'],
                specific: ['ฟุตบอล', 'แบดมินตัน', 'ต่อสู้', 'มวย', 'บาส', 'วอลเลย์', 'เทเบิล', 'เทนนิส', 'ว่ายน้ำ']
            },
            music: {
                primary: ['ดนตรี', 'music'],
                secondary: ['เพลง', 'ร้อง', 'เล่น', 'ดนตรี'],
                specific: ['กีตาร์', 'เปียโน', 'กลอง', 'วง', 'คอนเสิร์ต', 'แจ๊ส', 'คลาสสิก', 'ป๊อป']
            },
            art: {
                primary: ['ศิลปะ', 'art'],
                secondary: ['วาด', 'ระบาย', 'สร้างสรรค์'],
                specific: ['จิตรกรรม', 'ประติมากรรม', 'ภาพ', 'สี', 'ดิจิทัล', 'กราฟฟิก']
            },
            academic: {
                primary: ['วิชาการ', 'academic'],
                secondary: ['เรียน', 'ติว', 'สอน', 'ความรู้'],
                specific: ['ภาษา', 'คณิต', 'วิทย์', 'งานวิจัย', 'ฟิสิกส์', 'เคมี', 'ชีววิทยา']
            },
            volunteer: {
                primary: ['อาสา', 'volunteer'],
                secondary: ['ช่วยเหลือ', 'สังคม', 'ชุมชน', 'พัฒนา'],
                specific: ['บริจาค', 'โลหิต', 'สิ่งแวดล้อม', 'ผู้ด้อยโอกาส', 'ผู้สูงอายุ']
            },
            culture: {
                primary: ['วัฒนธรรม', 'culture'],
                secondary: ['ประเพณี', 'ท้องถิ่น', 'ศิลปวัฒนธรรม'],
                specific: ['ใต้', 'โนรา', 'ภาคใต้', 'ไทย', 'ดนตรีพื้นบ้าน', 'นาฏศิลป์']
            }
        };

        const interestLower = interest.toLowerCase();
        let matchType = null;
        let matchScore = 0;

        // ตรวจสอบแต่ละหมวดหมู่
        for (const [cat, keywords] of Object.entries(categoryKeywords)) {
            if (cat !== category) continue;

            // Primary keywords (คะแนนสูงสุด)
            const primaryMatch = keywords.primary.some(k => interestLower.includes(k));
            if (primaryMatch) {
                matchType = 'primary';
                matchScore = 30;
                break;
            }

            // Specific keywords (คะแนนสูง)
            const specificMatch = keywords.specific.some(k => interestLower.includes(k));
            if (specificMatch) {
                matchType = 'specific';
                matchScore = 25;
                break;
            }

            // Secondary keywords (คะแนนปานกลาง)
            const secondaryMatch = keywords.secondary.some(k => interestLower.includes(k));
            if (secondaryMatch) {
                matchType = 'secondary';
                matchScore = 15;
                break;
            }
        }

        if (matchType) {
            return {
                matched: true,
                matchType: matchType,
                score: matchScore,
                categoryName: categoryConfig[category]?.name || category
            };
        }

        return { matched: false, score: 0 };
    },

    /**
     * Generate Analysis Text
     * สร้างข้อความวิเคราะห์
     */
    generateAnalysisText(interest, recommendations) {
        if (recommendations.length === 0) {
            return `ไม่พบชมรมที่ตรงกับคำค้นหา "${interest}"`;
        }

        const topScore = recommendations[0].score;
        const avgScore = recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length;

        return `พบ ${recommendations.length} ชมรมที่เหมาะสมกับ "${interest}" 
                (คะแนนสูงสุด: ${Math.round(topScore)}%, เฉลี่ย: ${Math.round(avgScore)}%)`;
    },

    /**
     * Display Recommendations
     * แสดงผลคำแนะนำแบบเรียบง่าย
     */
    displayRecommendations(analysisResult, container) {
        const { recommendations, analysis, searchTerm } = analysisResult;

        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="col-span-3 text-center py-8">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-xl font-bold text-white mb-2">ไม่พบชมรมที่ตรงกับความสนใจ</h3>
                    <p class="text-white/80 mb-4">ลองใช้คำค้นหาอื่น เช่น "กีฬา", "ดนตรี", "เทคโนโลยี", "วัฒนธรรมใต้"</p>
                    <button onclick="HomePage.showAllClubs()" 
                            class="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-colors">
                        <i class="fas fa-th-large mr-2"></i>ดูชมรมทั้งหมด
                    </button>
                </div>
            `;
            return;
        }

        // แสดงข้อความวิเคราะห์แบบง่าย
        const analysisHTML = `
            <div class="col-span-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 mb-4 border border-white/20">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="bg-white/20 rounded-full p-2">
                            <i class="fas fa-check-circle text-white text-xl"></i>
                        </div>
                        <div>
                            <p class="text-white font-bold text-lg">พบ ${recommendations.length} ชมรมที่เหมาะสม</p>
                            <p class="text-white/80 text-sm">สำหรับคำค้นหา "${searchTerm}"</p>
                        </div>
                    </div>
                    <button onclick="HomePage.clearRecommendations()" 
                            class="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        <i class="fas fa-times mr-1"></i>ล้าง
                    </button>
                </div>
            </div>
        `;

        // แสดงชมรมที่แนะนำแบบเรียบง่าย
        const clubsHTML = recommendations.map((result, index) => {
            const club = result.club;
            const currentActivities = this.getCurrentClubActivities(club.id);

            return `
                <div class="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center fade-in cursor-pointer hover:bg-white/30 transition-all transform hover:scale-105 hover:shadow-2xl border border-white/30" 
                    onclick="HomePage.viewClubDetails(${club.id})">
                    
                    <!-- Club Icon -->
                    <div class="bg-white/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span class="text-5xl">${Helpers.getClubIcon(club.category)}</span>
                    </div>
                    
                    <!-- Club Name -->
                    <h5 class="font-bold text-xl mb-3 text-white drop-shadow-lg">${club.name}</h5>
                    
                    <!-- Category -->
                    <div class="inline-block bg-white/30 text-white text-sm px-4 py-1.5 rounded-full mb-4 border border-white/30">
                        <i class="fas fa-tag mr-1"></i>${Helpers.getCategoryName(club.category)}
                    </div>
                    
                    <!-- Description -->
                    <p class="text-sm text-white/90 mb-4 leading-relaxed">${club.description}</p>
                    
                    <!-- Club Info -->
                    <div class="bg-white/10 rounded-lg p-4 mb-4 border border-white/20">
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="text-center">
                                <div class="text-white font-bold text-2xl mb-1">
                                    ${currentActivities.length}
                                </div>
                                <div class="text-white/70 text-xs">กิจกรรมเปิดรับ</div>
                            </div>
                            <div class="text-center">
                                <div class="text-white font-bold text-2xl mb-1">
                                    ${club.pastActivities?.length || 0}
                                </div>
                                <div class="text-white/70 text-xs">กิจกรรมที่ผ่านมา</div>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Info -->
                    ${club.contact ? `
                        <div class="flex justify-center space-x-4 mb-4">
                            ${club.contact.facebook ? `
                                <a href="https://facebook.com/${club.contact.facebook}" 
                                target="_blank" 
                                onclick="event.stopPropagation()"
                                class="text-white/70 hover:text-white transition-colors">
                                    <i class="fab fa-facebook text-2xl"></i>
                                </a>
                            ` : ''}
                            ${club.contact.instagram ? `
                                <a href="https://instagram.com/${club.contact.instagram.replace('@', '')}" 
                                target="_blank"
                                onclick="event.stopPropagation()"
                                class="text-white/70 hover:text-white transition-colors">
                                    <i class="fab fa-instagram text-2xl"></i>
                                </a>
                            ` : ''}
                            ${club.contact.line ? `
                                <a href="https://line.me/ti/p/${club.contact.line}" 
                                target="_blank"
                                onclick="event.stopPropagation()"
                                class="text-white/70 hover:text-white transition-colors">
                                    <i class="fab fa-line text-2xl"></i>
                                </a>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    <!-- CTA -->
                    <div class="pt-4 border-t border-white/20">
                        <div class="flex items-center justify-center text-sm text-white/80 hover:text-white transition-colors">
                            <i class="fas fa-arrow-right mr-2"></i>
                            <span>คลิกเพื่อดูรายละเอียดเพิ่มเติม</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = analysisHTML + clubsHTML;
    },



    /**
     * View Club Details
     * ดูรายละเอียดชมรม
     */
    viewClubDetails(clubId) {
        const club = clubsData.find(c => c.id === clubId);
        if (!club) return;

        console.log('👁️ Viewing club:', club.name);

        // Navigate to clubs page
        Navigation.showPage('clubs');

        // Highlight the selected club
        setTimeout(() => {
            const clubCards = document.querySelectorAll('.club-card');
            clubCards.forEach(card => {
                card.classList.remove('ring-4', 'ring-yellow-400');
            });

            const targetCard = Array.from(clubCards).find(card =>
                card.querySelector('h3')?.textContent === club.name
            );

            if (targetCard) {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetCard.classList.add('ring-4', 'ring-yellow-400');

                // Remove highlight after 3 seconds
                setTimeout(() => {
                    targetCard.classList.remove('ring-4', 'ring-yellow-400');
                }, 3000);
            }
        }, 300);
    },

    /**
     * Show All Clubs
     * ไปหน้าชมรมทั้งหมด
     */
    showAllClubs() {
        Navigation.showPage('clubs');
    },

    /**
     * Refresh Home Page
     */
    refresh() {
        if (typeof Calendar !== 'undefined') {
            Calendar.refresh();
        }
    },

    /**
     * Clear Recommendations
     */
    clearRecommendations() {
        const input = document.getElementById('interest-input');
        const recommendationsDiv = document.getElementById('ai-recommendations');

        if (input) input.value = '';
        if (recommendationsDiv) {
            recommendationsDiv.classList.add('hidden');
        }
    }
};

// Export
window.HomePage = HomePage;