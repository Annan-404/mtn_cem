// Global State
let currentView = 'landing'; // Start with landing page
const charts = {};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Initial content population
    populateKPIs();
    populateComplaints();
    populateFeedback(); // If needed for other views

    // Initialize Charts
    initCharts();

    // Always start at landing page to avoid dashboard flash
    navigateTo('landing');

    // Setup Navigation Listeners (if any distinct from onclick)
    console.log("MTN CEM System Initialized - Welcome to Landing Page");
});

// Navigation Logic
function navigateTo(viewId) {
    // Determine target view ID (some buttons might pass 'landing' but the view is 'view-landing')
    const targetId = `view-${viewId}`;
    const targetSection = document.getElementById(targetId);

    if (!targetSection) {
        console.error(`View ${viewId} not found`);
        return;
    }

    // Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewId) {
            btn.classList.add('active');
        }
    });

    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none'; // Ensure fully hidden
    });

    // Show target view
    targetSection.style.display = 'block'; // Or flex/grid depending on view, but block is safe for containers
    // Trigger reflow for animation if needed
    setTimeout(() => {
        targetSection.classList.add('active');
    }, 10);
    
    // Scroll to top of the new view
    const viewsContainer = document.getElementById('views-container');
    if (viewsContainer) {
        viewsContainer.scrollTop = 0;
    }

    // Specific logic for Landing Page (hide sidebar/header?)
    // For this design, let's keep sidebar/header hidden if it's the landing page
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('main-header');
    const main = document.querySelector('.main-content'); // Actually main content wrapper

    if (viewId === 'landing') {
        sidebar.style.transform = 'translateX(-100%)';
        header.style.display = 'none';
        main.style.marginLeft = '0';
        document.body.style.overflowY = 'auto'; // Allow scroll on landing
    } else {
        // Restore layout for dashboard pages
        if (window.innerWidth > 768) {
            sidebar.style.transform = 'translateX(0)';
            main.style.marginLeft = 'var(--sidebar-width)';
        }
        header.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Fixed dashboard
    }

    // Update Header Text
    const titles = {
        'dashboard': 'Operations Dashboard',
        'analytics': 'Network Analytics',
        'complaints': 'Complaint Management',
        'feedback': 'Customer Feedback',
        'sustainability': 'Sustainability & CSR'
    };
    const headerTitle = document.getElementById('page-title-text');
    if (headerTitle && titles[viewId]) headerTitle.innerText = titles[viewId];

    currentView = viewId;
    
    // Update URL hash (only if not landing to keep clean URL)
    if (viewId === 'landing') {
        // Clear hash for landing page
        if (window.location.hash) {
            history.pushState('', document.title, window.location.pathname);
        }
    } else {
        window.location.hash = viewId;
    }

    // Resize charts if needed
    if (viewId === 'dashboard' && charts.satisfaction) charts.satisfaction.resize();
    if (viewId === 'analytics' && charts.analytics) charts.analytics.resize();
    
    // Re-initialize Lucide icons for the new view
    lucide.createIcons();
}

// Sidebar Mobile Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    const isOpen = sidebar.classList.contains('open');

    if (isOpen) {
        sidebar.classList.remove('open');
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 300);
    } else {
        overlay.style.display = 'block';
        setTimeout(() => overlay.style.opacity = '1', 10);
        sidebar.classList.add('open');
    }
}

// Data Population - KPIs
function populateKPIs() {
    const kpiData = [
        { id: 'nps', label: 'NPS Score', value: '75', trend: '+5%', icon: 'star' },
        { id: 'resolution', label: 'Resolution Time', value: '2.1h', trend: '-15%', icon: 'clock', trendColor: 'green' },
        { id: 'churn', label: 'Churn Rate', value: '1.2%', trend: '-0.3%', icon: 'trending-down', trendColor: 'red' },
        { id: 'engagement', label: 'Daily Active Users', value: '45M', trend: '+8%', icon: 'users' }
    ];

    kpiData.forEach(kpi => {
        const el = document.querySelector(`.kpi-card[data-kpi="${kpi.id}"]`);
        if (el) {
            const trendClass = kpi.trendColor === 'red' ? 'trend-down' : 'trend-up';
            const trendIcon = kpi.trendColor === 'red' ? 'arrow-down-right' : 'arrow-up-right';

            el.innerHTML = `
                <div class="kpi-header">
                    <div class="kpi-icon"><i data-lucide="${kpi.icon}"></i></div>
                    <span class="kpi-trend ${trendClass}">
                        ${kpi.trend} <i data-lucide="${trendIcon}" width="14"></i>
                    </span>
                </div>
                <div class="kpi-title">${kpi.label}</div>
                <div class="kpi-value">${kpi.value}</div>
            `;
        }
    });
    lucide.createIcons();
}

// Data Population - Complaints
function populateComplaints() {
    const complaintsData = [
        { id: 'CMT-001', customer: 'John Doe', type: 'Network Issue', status: 'OPEN', filed: '2h ago' },
        { id: 'CMT-002', customer: 'Jane Smith', type: 'Billing Query', status: 'IN PROGRESS', filed: '45m ago' },
        { id: 'CMT-003', customer: 'Alex Johnson', type: 'Service Outage', status: 'RESOLVED', filed: '10m ago' },
        { id: 'CMT-004', customer: 'Emily Davis', type: 'Data Speed', status: 'OPEN', filed: '1d ago' },
        { id: 'CMT-005', customer: 'Michael Brown', type: 'Other', status: 'CLOSED', filed: '5h ago' }
    ];

    const tbody = document.querySelector('#complaints-table tbody');
    if (!tbody) return;

    tbody.innerHTML = complaintsData.map(item => {
        let badgeClass = 'ok';
        if (item.status === 'OPEN') badgeClass = 'crit';
        if (item.status === 'IN PROGRESS') badgeClass = 'low';

        return `
            <tr>
                <td><span style="font-weight:600; color:#fff">${item.id}</span></td>
                <td>${item.customer}</td>
                <td>${item.type}</td>
                <td><span class="status-badge ${badgeClass}">${item.status}</span></td>
                <td style="color:var(--text-muted)">${item.filed}</td>
            </tr>
        `;
    }).join('');
}

// Charts Initialization
function initCharts() {
    // 1. Satisfaction Chart (Dashboard)
    const ctxSatisfaction = document.getElementById('satisfactionChart');
    if (ctxSatisfaction) {
        charts.satisfaction = new Chart(ctxSatisfaction, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                    {
                        label: 'Target',
                        data: [70, 72, 75, 75, 78, 78, 80],
                        borderColor: '#64748b',
                        borderDash: [5, 5],
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Actual',
                        data: [68, 70, 74, 73, 76, 75, 77],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false, color: '#334155' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    // 2. Analytics Chart
    const ctxAnalytics = document.getElementById('analyticsChart');
    if (ctxAnalytics) {
        charts.analytics = new Chart(ctxAnalytics, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Voice Calls (Mins)',
                        data: [4500, 5200, 4800, 5500, 5900, 6000, 5800],
                        backgroundColor: '#f59e0b',
                        borderRadius: 4
                    },
                    {
                        label: 'Data Usage (GB)',
                        data: [2000, 1500, 1800, 1200, 1000, 500, 800],
                        backgroundColor: '#3b82f6',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' }, stacked: true }
                }
            }
        });
    }

    // 3. Feedback Chart
    const ctxFeedback = document.getElementById('feedbackChart');
    if (ctxFeedback) {
        charts.feedback = new Chart(ctxFeedback, {
            type: 'doughnut',
            data: {
                labels: ['Excellent', 'Good', 'Average', 'Poor'],
                datasets: [{
                    data: [50, 30, 15, 5],
                    backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'right', labels: { color: '#e2e8f0' } }
                }
            }
        });
    }

    // 4. Sustainability Chart
    const ctxSustainability = document.getElementById('sustainabilityChart');
    if (ctxSustainability) {
        charts.sustainability = new Chart(ctxSustainability, {
            type: 'doughnut',
            data: {
                labels: ['Green Energy', 'Recycling', 'Community', 'Other'],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'right', labels: { color: '#e2e8f0' } }
                }
            }
        });
    }
}

// Interactive Functions
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Icon based on type
    let iconName = 'check-circle';
    if (type === 'info') iconName = 'info';
    if (type === 'error') iconName = 'alert-triangle';

    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Animate out
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.5s forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function runDiagnostics() {
    const btn = document.getElementById('diagnostic-btn');
    const text = document.getElementById('diagnostic-text');

    if (btn.disabled) return;

    btn.disabled = true;
    const originalText = text.innerText;
    text.innerText = "Scanning Network...";

    let step = 0;
    const interval = setInterval(() => {
        step++;
        if (step === 1) showToast('Checking Signal Strength...', 'info');
        if (step === 2) showToast('Verifying User Connectivity...', 'info');
        if (step === 3) showToast('Latency: 28ms', 'info');

        if (step >= 4) {
            clearInterval(interval);
            showToast('Network Scan Complete: Optimal', 'success');
            text.innerText = "Scan Complete";
            setTimeout(() => {
                text.innerText = originalText;
                btn.disabled = false;
            }, 2000);
        }
    }, 800);
}

function logout() {
    if (confirm("Secure Logout: End Session?")) {
        navigateTo('landing');
        showToast('Session Ended Securely', 'info');
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        navigateTo(hash);
    } else {
        navigateTo('landing');
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && currentView) {
        // Refresh charts when page becomes visible
        if (charts[currentView]) {
            charts[currentView].resize();
        }
    }
});