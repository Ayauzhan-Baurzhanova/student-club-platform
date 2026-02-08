const API_URL = "/api"; // Works on localhost and Render
let currentClub = null;

// ---  CHECK AUTH ON LOAD ---
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const path = window.location.pathname;

    // nav
    const authLinks = document.getElementById("authLinks");
    if (authLinks) {
        if (token) {
            authLinks.innerHTML = `<a href="profile.html" class="btn-primary">My Profile</a>`;
        } else {
            authLinks.innerHTML = `<a href="login.html" class="btn-outline">Log In</a>`;
        }
    }

    // pages
    if (document.body.id === "page-home") initHome();
    if (document.body.id === "page-login") initLogin();
    if (document.body.id === "page-profile") initProfile(user);
    if (document.body.id === "page-admin") initAdmin(user);
});

// --- LOGOUT FUNCTION ---
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

// ==========================================
// PAGE: HOME
// ==========================================
// --- TOAST FUNCTION ---
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.className = type === "success" ? "success show" : "error show";
    toast.innerText = message;
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 3000);
}

// ==========================================
// PAGE: HOME
// ==========================================
function initHome() {
    window.openJoinModal = (clubName) => {
        if (!localStorage.getItem("token")) {
            showToast("Please log in to join clubs!", "error");
            setTimeout(() => window.location.href = "login.html", 1500);
            return;
        }
        currentClub = clubName;
        document.getElementById("modalClubName").innerText = clubName.toUpperCase();
        
        const modal = document.getElementById("joinModal");
        modal.classList.remove("hidden");
        setTimeout(() => modal.classList.add("visible"), 10);
    };

    window.closeModal = () => {
        const modal = document.getElementById("joinModal");
        modal.classList.remove("visible");
        setTimeout(() => modal.classList.add("hidden"), 300);
    };

    window.submitJoinRequest = async () => {
        const message = document.getElementById("joinMessage").value;
        const token = localStorage.getItem("token");
        
        try {
            const res = await fetch(`${API_URL}/requests`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ club: currentClub, message })
            });

            const data = await res.json();

            if (!res.ok) {
                
                throw new Error(data.message || "Failed to join");
            }

            // SUCCESS!
            closeModal();
            document.getElementById("joinMessage").value = ""; // Clear text
            showToast(`Request sent to ${currentClub.toUpperCase()} club!`, "success");
            
        } catch (err) {
            showToast(err.message, "error");
        }
    };
}

// ==========================================
// PAGE: LOGIN / REGISTER
// ==========================================
function initLogin() {
    // Toggle between Login and Register forms
    window.toggleAuth = (mode) => {
        if (mode === 'register') {
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('registerForm').classList.remove('hidden');
            document.getElementById('formTitle').innerText = "Create Account";
        } else {
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('formTitle').innerText = "Welcome Back";
        }
    };

    // Handle Login Submit
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await handleAuth('/login', { email, password });
    });

    // Handle Register Submit
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        await handleAuth('/register', { username, email, password, role: 'user' }); // Default role
    });
}

async function handleAuth(endpoint, data) {
    const errorBox = document.getElementById('errorBox');
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        
        if (!res.ok) throw new Error(result.message);

        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result));
        window.location.href = "profile.html"; // Go to profile after login
    } catch (err) {
        errorBox.innerText = err.message;
        errorBox.classList.remove("hidden");
    }
}

// ==========================================
// PAGE: PROFILE
// ==========================================
async function initProfile(user) {
    if (!user) { window.location.href = "login.html"; return; }

    // Fill Info
    document.getElementById("profileName").innerText = user.username;
    document.getElementById("profileEmail").innerText = user.email;
    document.getElementById("profileRole").innerText = user.role;

    if (user.role === "admin") {
        document.getElementById("adminLink").classList.remove("hidden");
    }

    // Fetch My Requests
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/requests`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const requests = await res.json();
        
        const list = document.getElementById("myRequestsList");
        if (requests.length === 0) {
            list.innerHTML = "<p>You haven't joined any clubs yet.</p>";
            return;
        }

        list.innerHTML = requests.map(req => `
            <div class="card" style="padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${req.club.toUpperCase()} Club</strong>
                    <br>
                    <small>${req.message}</small>
                </div>
                <span class="badge status-${req.status}">${req.status}</span>
            </div>
        `).join("");
    } catch (err) {
        console.error(err);
    }
}

// ==========================================
// PAGE: ADMIN
// ==========================================
async function initAdmin(user) {
    if (!user || user.role !== "admin") {
        alert("Access Denied");
        window.location.href = "index.html";
        return;
    }

    const token = localStorage.getItem("token");
    const list = document.getElementById("adminRequestsList");

    async function loadData() {
        try {
            const res = await fetch(`${API_URL}/requests/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const requests = await res.json();

            // Stats
            document.getElementById("statTotal").innerText = requests.length;
            document.getElementById("statPending").innerText = requests.filter(r => r.status === 'pending').length;

            // Table
            list.innerHTML = requests.map(req => `
                <tr>
                    <td>${req.user}</td> <td>${req.club}</td>
                    <td>${req.message}</td>
                    <td>${new Date(req.createdAt).toLocaleDateString()}</td>
                    <td><span class="status-${req.status}">${req.status.toUpperCase()}</span></td>
                    <td>
                        <button onclick="updateStatus('${req._id}', 'approved')" style="color: green; font-weight:bold; border:none; background:none; cursor:pointer;">Approve</button>
                        <button onclick="updateStatus('${req._id}', 'rejected')" style="color: red; font-weight:bold; border:none; background:none; cursor:pointer;">Reject</button>
                    </td>
                </tr>
            `).join("");
        } catch (err) {
            list.innerHTML = "<tr><td colspan='6'>Error loading data</td></tr>";
        }
    }

    window.updateStatus = async (id, status) => {
        try {
            await fetch(`${API_URL}/requests/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            loadData(); // Refresh table
        } catch (err) {
            alert("Error updating");
        }
    };

    loadData();
}


// --- HERO SCROLL FADE EFFECT ---
window.addEventListener('scroll', () => {
    const heroBg = document.getElementById('hero-bg');
    if (heroBg) {
        const scrollPosition = window.scrollY;
        // Calculate opacity: starts at 1, goes to 0 as you scroll 600px down
        let opacity = 1 - (scrollPosition / 600);
        
        // Don't let opacity go below 0
        if (opacity < 0) opacity = 0;
        
        heroBg.style.opacity = opacity;
        // Optional: Also move it slightly for parallax effect
        heroBg.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    }
});


window.openJoinModal = (clubName) => {
    if (!localStorage.getItem("token")) {
        alert("Please log in to join clubs!");
        window.location.href = "login.html";
        return;
    }
    currentClub = clubName;
    document.getElementById("modalClubName").innerText = clubName.toUpperCase();
    const modal = document.getElementById("joinModal");
    modal.classList.remove("hidden"); // Remove display:none
    
    // Small timeout to allow CSS transition to catch the opacity change
    setTimeout(() => {
        modal.classList.add("visible");
    }, 10);
};

window.closeModal = () => {
    const modal = document.getElementById("joinModal");
    modal.classList.remove("visible");
    // Wait for animation to finish before hiding
    setTimeout(() => {
        modal.classList.add("hidden");
    }, 300);
};

