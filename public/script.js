const API_URL = "http://localhost:5000/api";

// Utils
function show(id) { document.getElementById(id).classList.remove('hidden'); }
function hide(id) { document.getElementById(id).classList.add('hidden'); }
function showError(msg) {
    const el = document.getElementById('errorBox');
    el.innerText = msg;
    show('errorBox');
    setTimeout(() => hide('errorBox'), 3000);
}

// Check Auth on Load
const token = localStorage.getItem('token');
if (token) loadDashboard();
else show('authSection');

// Tabs
function switchTab(tab) {
    if (tab === 'login') {
        show('loginForm'); hide('registerForm');
        document.querySelectorAll('.tab')[0].classList.add('active');
        document.querySelectorAll('.tab')[1].classList.remove('active');
    } else {
        hide('loginForm'); show('registerForm');
        document.querySelectorAll('.tab')[0].classList.remove('active');
        document.querySelectorAll('.tab')[1].classList.add('active');
    }
}

// LOGIN & REGISTER
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    handleAuth(e, '/register', 'reg');
});
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    handleAuth(e, '/login', 'login');
});

async function handleAuth(e, endpoint, prefix) {
    e.preventDefault();
    const payload = prefix === 'reg' 
        ? { username: document.getElementById('regUsername').value, email: document.getElementById('regEmail').value, password: document.getElementById('regPassword').value }
        : { email: document.getElementById('loginEmail').value, password: document.getElementById('loginPassword').value };

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        loadDashboard();
    } catch (err) { showError(err.message); }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

// --- DASHBOARD ---
function loadDashboard() {
    hide('authSection');
    show('dashboardSection');
    show('navbar');

    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('userGreeting').innerText = `Hi, ${user.username}`;
    document.getElementById('profileName').innerText = user.username;
    document.getElementById('profileRole').innerText = user.role;

    // ADMIN CHECK
    if (user.role === 'admin') {
        show('adminBadge');
        show('adminPanel');
        fetchAdminRequests(); // Fetch ALL requests
    } else {
        hide('adminBadge');
        hide('adminPanel');
    }

    fetchMyRequests(); // Fetch MY requests
}

// Join Club
document.getElementById('joinClubForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                club: document.getElementById('clubSelect').value,
                message: document.getElementById('clubMessage').value
            })
        });
        if (!res.ok) throw new Error('Failed to join');
        alert('Sent!');
        fetchMyRequests();
        // If admin, refresh admin list too
        if(JSON.parse(localStorage.getItem('user')).role === 'admin') fetchAdminRequests();
    } catch (err) { showError(err.message); }
});

// Fetch MY Requests
async function fetchMyRequests() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/requests`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        renderList('requestsList', data, false);
    } catch (err) { console.error(err); }
}

// --- ADMIN FUNCTIONS ---

async function fetchAdminRequests() {
    const token = localStorage.getItem('token');
    try {
        
        const res = await fetch(`${API_URL}/requests/all`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const data = await res.json();
        renderList('adminRequestsList', data, true);
    } catch (err) { 
        document.getElementById('adminRequestsList').innerText = "Error loading admin data. Did you fix the backend route?";
    }
}

async function updateStatus(id, newStatus) {
    const token = localStorage.getItem('token');
    try {
        await fetch(`${API_URL}/requests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus })
        });
        fetchAdminRequests(); // Refresh list
    } catch (err) { alert(err.message); }
}

async function deleteRequest(id) {
    if(!confirm("Delete this request?")) return;
    const token = localStorage.getItem('token');
    try {
        await fetch(`${API_URL}/requests/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchAdminRequests();
    } catch (err) { alert(err.message); }
}

// Render Helper
function renderList(elementId, data, isAdmin) {
    const list = document.getElementById(elementId);
    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-muted">No requests found.</p>';
        return;
    }
    
    list.innerHTML = data.map(req => `
        <div class="request-item" style="border-left: 4px solid ${getColor(req.status)}">
            <div style="display:flex; justify-content:space-between">
                <strong>${req.club.toUpperCase()}</strong>
                <span class="badge status-${req.status}">${req.status}</span>
            </div>
            <p>${req.message}</p>
            <small>User ID: ${req.user} | Date: ${new Date(req.createdAt).toLocaleDateString()}</small>
            
            ${isAdmin ? `
                <div class="admin-actions">
                    <button class="btn-approve" onclick="updateStatus('${req._id}', 'approved')">Approve</button>
                    <button class="btn-reject" onclick="updateStatus('${req._id}', 'rejected')">Reject</button>
                    <button class="btn-delete" onclick="deleteRequest('${req._id}')">Delete</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function getColor(status) {
    if(status === 'approved') return '#2ecc71';
    if(status === 'rejected') return '#e74c3c';
    return '#f1c40f';
}