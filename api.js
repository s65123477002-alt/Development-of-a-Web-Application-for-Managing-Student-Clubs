// ตัวแปรสำหรับเก็บข้อมูล
let clubs = [];
let activities = [];
let registrations = [];
let currentEditingClub = null;
let currentEditingActivity = null;

// เริ่มต้นระบบ
async function initAdmin() {
    // ตรวจสอบการเข้าสู่ระบบ
    if (!utils.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // ตรวจสอบ token
        await authAPI.verifyToken();
        
        // โหลดข้อมูล
        await loadAllData();
        
        // แสดงชื่อผู้ใช้
        const user = utils.getUserFromToken();
        if (user) {
            document.getElementById('admin-username').textContent = user.username || 'Admin';
        }
        
        // แสดงแท็บแรก
        showTab('clubs');
        
    } catch (error) {
        console.error('Admin initialization error:', error);
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }
}

// โหลดข้อมูลทั้งหมด
async function loadAllData() {
    try {
        // ตรวจสอบว่ามี backend หรือไม่
        const isBackendAvailable = await utils.isBackendAvailable();
        
        if (isBackendAvailable) {
            // โหลดจาก API
            clubs = await clubsAPI.getAll();
            activities = await activitiesAPI.getAll();
            registrations = await registrationsAPI.getAll();
        } else {
            // ใช้ข้อมูลจำลอง
            console.log('Backend not available, using mock data');
            const mockData = await utils.loadMockData();
            clubs = mockData.clubs;
            activities = mockData.activities;
            registrations = mockData.registrations;
        }
        
        // อัพเดต UI
        renderClubsTable();
        renderActivitiesTable();
        renderRegistrationsTable();
        populateClubSelect();
        populateActivityFilter();
        
    } catch (error) {
        handleApiError(error);
    }
}

// จัดการแท็บ
function showTab(tabName) {
    // ซ่อนแท็บทั้งหมด
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // แสดงแท็บที่เลือก
    document.getElementById(tabName + '-tab').classList.remove('hidden');
    
    // อัพเดตปุ่มแท็บ
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    event.target.classList.add('active', 'border-blue-500', 'text-blue-600');
    event.target.classList.remove('border-transparent', 'text-gray-500');
}

// === CLUBS MANAGEMENT ===

// แสดงตารางชมรม
function renderClubsTable() {
    const tbody = document.getElementById('clubs-table-body');
    
    if (clubs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    ไม่มีข้อมูลชมรม
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = clubs.map(club => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${club.name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${utils.getCategoryText(club.category)}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900 truncate max-w-xs">${club.description}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editClub(${club.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">
                    <i class="fas fa-edit"></i> แก้ไข
                </button>
                <button onclick="deleteClub(${club.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i> ลบ
                </button>
            </td>
        </tr>
    `).join('');
}

// เปิด Modal เพิ่มชมรม
function openClubModal(clubId = null) {
    const modal = document.getElementById('club-modal');
    const title = document.getElementById('club-modal-title');
    const form = document.getElementById('club-form');
    
    if (clubId) {
        // แก้ไขชมรม
        const club = clubs.find(c => c.id === clubId);
        if (!club) return;
        
        title.textContent = 'แก้ไขชมรม';
        currentEditingClub = club;
        
        // เติมข้อมูลในฟอร์ม
        document.getElementById('club-id').value = club.id;
        document.getElementById('club-name').value = club.name;
        document.getElementById('club-category').value = club.category;
        document.getElementById('club-description').value = club.description;
        document.getElementById('club-history').value = club.history || '';
        document.getElementById('club-facebook').value = club.contact?.facebook || '';
        document.getElementById('club-instagram').value = club.contact?.instagram || '';
        document.getElementById('club-line').value = club.contact?.line || '';
    } else {
        // เพิ่มชมรมใหม่
        title.textContent = 'เพิ่มชมรมใหม่';
        currentEditingClub = null;
        form.reset();
        document.getElementById('club-id').value = '';
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// ปิด Modal ชมรม
function closeClubModal() {
    document.getElementById('club-modal').classList.add('hidden');
    document.getElementById('club-modal').classList.remove('flex');
    currentEditingClub = null;
}

// แก้ไขชมรม
function editClub(clubId) {
    openClubModal(clubId);
}

// ลบชมรม
async function deleteClub(clubId) {
    if (!confirm('คุณต้องการลบชมรมนี้หรือไม่?')) return;
    
    try {
        const isBackendAvailable = await utils.isBackendAvailable();
        
        if (isBackendAvailable) {
            await clubsAPI.delete(clubId);
        }
        
        // ลบจากอาร์เรย์
        clubs = clubs.filter(club => club.id !== clubId);
        renderClubsTable();
        populateClubSelect();
        
        alert('ลบชมรมเรียบร้อยแล้ว');
    } catch (error) {
        handleApiError(error);
    }
}

// จัดการฟอร์มชมรม
document.getElementById('club-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('club-name').value,
        category: document.getElementById('club-category').value,
        description: document.getElementById('club-description').value,
        history: document.getElementById('club-history').value,
        contact: {
            facebook: document.getElementById('club-facebook').value,
            instagram: document.getElementById('club-instagram').value,
            line: document.getElementById('club-line').value
        }
    };
    
    try {
        const isBackendAvailable = await utils.isBackendAvailable();
        let result;
        
        if (currentEditingClub) {
            // แก้ไข
            if (isBackendAvailable) {
                result = await clubsAPI.update(currentEditingClub.id, formData);
            } else {
                // แก้ไขในอาร์เรย์
                const index = clubs.findIndex(c => c.id === currentEditingClub.id);
                if (index !== -1) {
                    clubs[index] = { ...clubs[index], ...formData };
                }
            }
        } else {
            // เพิ่มใหม่
            if (isBackendAvailable) {
                result = await clubsAPI.create(formData);
                clubs.push(result);
            } else {
                // เพิ่มในอาร์เรย์
                const newClub = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString()
                };
                clubs.push(newClub);
            }
        }
        
        renderClubsTable();
        populateClubSelect();
        closeClubModal();
        
        alert(currentEditingClub ? 'แก้ไขชมรมเรียบร้อยแล้ว' : 'เพิ่มชมรมเรียบร้อยแล้ว');
        
    } catch (error) {
        handleApiError(error);
    }
});

// === ACTIVITIES MANAGEMENT ===

// แสดงตารางกิจกรรม
function renderActivitiesTable() {
    const tbody = document.getElementById('activities-table-body');
    
    if (activities.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    ไม่มีข้อมูลกิจกรรม
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = activities.map(activity => {
        const club = clubs.find(c => c.id === activity.club_id);
        const statusColors = {
            'open': 'bg-green-100 text-green-800',
            'closing': 'bg-yellow-100 text-yellow-800',
            'closed': 'bg-gray-100 text-gray-800'
        };
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${activity.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${club ? club.name : 'ไม่ระบุ'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${utils.formatDate(activity.event_date)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[activity.status]}">
                        ${utils.getStatusText(activity.status)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editActivity(${activity.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i> แก้ไข
                    </button>
                    <button onclick="deleteActivity(${activity.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i> ลบ
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// เปิด Modal เพิ่มกิจกรรม
function openActivityModal(activityId = null) {
    const modal = document.getElementById('activity-modal');
    const title = document.getElementById('activity-modal-title');
    const form = document.getElementById('activity-form');
    
    if (activityId) {
        // แก้ไขกิจกรรม
        const activity = activities.find(a => a.id === activityId);
        if (!activity) return;
        
        title.textContent = 'แก้ไขกิจกรรม';
        currentEditingActivity = activity;
        
        // เติมข้อมูลในฟอร์ม
        document.getElementById('activity-id').value = activity.id;
        document.getElementById('activity-name').value = activity.name;
        document.getElementById('activity-club').value = activity.club_id;
        document.getElementById('activity-description').value = activity.description;
        document.getElementById('activity-date').value = activity.event_date;
        document.getElementById('activity-deadline').value = activity.deadline;
        document.getElementById('activity-status').value = activity.status;
    } else {
        // เพิ่มกิจกรรมใหม่
        title.textContent = 'เพิ่มกิจกรรมใหม่';
        currentEditingActivity = null;
        form.reset();
        document.getElementById('activity-id').value = '';
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// ปิด Modal กิจกรรม
function closeActivityModal() {
    document.getElementById('activity-modal').classList.add('hidden');
    document.getElementById('activity-modal').classList.remove('flex');
    currentEditingActivity = null;
}

// แก้ไขกิจกรรม
function editActivity(activityId) {
    openActivityModal(activityId);
}

// ลบกิจกรรม
async function deleteActivity(activityId) {
    if (!confirm('คุณต้องการลบกิจกรรมนี้หรือไม่?')) return;
    
    try {
        const isBackendAvailable = await utils.isBackendAvailable();
        
        if (isBackendAvailable) {
            await activitiesAPI.delete(activityId);
        }
        
        // ลบจากอาร์เรย์
        activities = activities.filter(activity => activity.id !== activityId);
        renderActivitiesTable();
        populateActivityFilter();
        
        alert('ลบกิจกรรมเรียบร้อยแล้ว');
    } catch (error) {
        handleApiError(error);
    }
}

// จัดการฟอร์มกิจกรรม
document.getElementById('activity-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('activity-name').value,
        club_id: parseInt(document.getElementById('activity-club').value),
        description: document.getElementById('activity-description').value,
        event_date: document.getElementById('activity-date').value,
        deadline: document.getElementById('activity-deadline').value,
        status: document.getElementById('activity-status').value
    };
    
    try {
        const isBackendAvailable = await utils.isBackendAvailable();
        let result;
        
        if (currentEditingActivity) {
            // แก้ไข
            if (isBackendAvailable) {
                result = await activitiesAPI.update(currentEditingActivity.id, formData);
            } else {
                // แก้ไขในอาร์เรย์
                const index = activities.findIndex(a => a.id === currentEditingActivity.id);
                if (index !== -1) {
                    activities[index] = { ...activities[index], ...formData };
                }
            }
        } else {
            // เพิ่มใหม่
            if (isBackendAvailable) {
                result = await activitiesAPI.create(formData);
                activities.push(result);
            } else {
                // เพิ่มในอาร์เรย์
                const newActivity = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString()
                };
                activities.push(newActivity);
            }
        }
        
        renderActivitiesTable();
        populateActivityFilter();
        closeActivityModal();
        
        alert(currentEditingActivity ? 'แก้ไขกิจกรรมเรียบร้อยแล้ว' : 'เพิ่มกิจกรรมเรียบร้อยแล้ว');
        
    } catch (error) {
        handleApiError(error);
    }
});