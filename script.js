// Global State
let currentView = 'landing'; // Start with landing page
const charts = {};

// Current date reference (as per system date: January 10, 2026)
const LAST_UPDATED = new Date('2026-01-10').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Populate ALL sections
    populateKPIs();
    populateComplaints();
    populateAnalytics();
    populateFeedback();
    populateSustainability();

    // Initialize Charts
    initCharts();

    // Start at landing page
    navigateTo('landing');

    console.log(`MTN CEM System Initialized • Last data update: ${LAST_UPDATED}`);
});

// Navigation Logic
function navigateTo(viewId) {
    const targetId = `view-${viewId}`;
    const targetSection = document.getElementById(targetId);

    if (!targetSection) {
        console.error(`View ${viewId} not found`);
        return;
    }

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewId) {
            btn.classList.add('active');
        }
    });

    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
    });

    // Show target view
    targetSection.style.display = 'block';
    setTimeout(() => targetSection.classList.add('active'), 10);

    // Scroll to top
    const viewsContainer = document.getElementById('views-container');
    if (viewsContainer) viewsContainer.scrollTop = 0;

    // Sidebar & header behavior
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('main-header');
    const main = document.querySelector('.main-content');

    if (viewId === 'landing') {
        sidebar.style.transform = 'translateX(-100%)';
        header.style.display = 'none';
        main.style.marginLeft = '0';
        document.body.style.overflowY = 'auto';
    } else {
        if (window.innerWidth > 768) {
            sidebar.style.transform = 'translateX(0)';
            main.style.marginLeft = 'var(--sidebar-width)';
        }
        header.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Update page title in header
    const titles = {
        'dashboard': 'Operations Dashboard',
        'analytics': 'Network Analytics',
        'complaints': 'Complaint Management',
        'feedback': 'Customer Feedback',
        'sustainability': 'Sustainability & CSR'
    };
    const headerTitle = document.getElementById('page-title-text');
    if (headerTitle && titles[viewId]) {
        headerTitle.innerText = titles[viewId];
    }

    currentView = viewId;

    // URL hash handling
    if (viewId === 'landing') {
        if (window.location.hash) {
            history.pushState('', document.title, window.location.pathname);
        }
    } else {
        window.location.hash = viewId;
    }

    // Force resize ALL charts after view change (with small delay)
    setTimeout(() => {
        Object.values(charts).forEach(chart => {
            if (chart?.resize) chart.resize();
        });
    }, 300);

    lucide.createIcons();
}

// Mobile sidebar toggle
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

// ── DATA POPULATION ────────────────────────────────────────────────────────

function populateKPIs() {
    const kpiData = [
        { id: 'nps', label: 'NPS Score', value: '75', trend: '+5%', icon: 'star' },
        { id: 'resolution', label: 'Avg Resolution Time', value: '2.1h', trend: '-15%', icon: 'clock', trendColor: 'green' },
        { id: 'churn', label: 'Monthly Churn Rate', value: '1.2%', trend: '-0.3%', icon: 'trending-down', trendColor: 'red' },
        { id: 'engagement', label: 'Daily Active Users', value: '45M', trend: '+8%', icon: 'users' }
    ];

    kpiData.forEach(kpi => {
        const el = document.querySelector(`.kpi-card[data-kpi="${kpi.id}"]`);
        if (!el) return;

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
    });
    lucide.createIcons();
}

function populateComplaints() {
    const complaintsData = [
        { id: 'CMT-001', customer: 'John Kofi', type: 'Network Coverage', status: 'OPEN', filed: '2h ago' },
        { id: 'CMT-002', customer: 'Ama Mensah', type: 'Billing Error', status: 'IN PROGRESS', filed: '45m ago' },
        { id: 'CMT-003', customer: 'Kwame Asare', type: 'Service Outage', status: 'RESOLVED', filed: '10m ago' },
        { id: 'CMT-004', customer: 'Efua Darko', type: 'Slow Data', status: 'OPEN', filed: '1d ago' },
        { id: 'CMT-005', customer: 'Yaw Boateng', type: 'MoMo Transaction', status: 'CLOSED', filed: '5h ago' }
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

function populateAnalytics() {
    const desc = document.querySelector('#view-analytics .section-header p');
    if (desc) {
        desc.textContent = `Real-time tracking of voice, data, MoMo, and VAS usage across all regions (${LAST_UPDATED}).`;
    }
}

function populateFeedback() {
    const desc = document.querySelector('#view-feedback .section-header p');
    if (desc) {
        desc.textContent = `Customer satisfaction distribution and NPS trends (Latest survey: ${LAST_UPDATED}).`;
    }
}

function populateSustainability() {
    const desc = document.querySelector('#view-sustainability .section-header p');
    if (desc) {
        desc.textContent = `Progress tracking of green energy adoption, e-waste recycling & digital inclusion impact (${LAST_UPDATED}).`;
    }
}

// ── CHARTS INITIALIZATION ──────────────────────────────────────────────────

function initCharts() {
    // Satisfaction Trend (Dashboard)
    const ctxSat = document.getElementById('satisfactionChart');
    if (ctxSat) {
        charts.satisfaction = new Chart(ctxSat, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                    { label: 'Target', data: [70,72,75,75,78,78,80], borderColor: '#64748b', borderDash: [5,5], tension: 0.4, pointRadius: 0 },
                    { label: 'Actual',  data: [68,70,74,73,76,75,77], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    // Analytics - Usage (weekly)
    const ctxAnalytics = document.getElementById('analyticsChart');
    if (ctxAnalytics) {
        charts.analytics = new Chart(ctxAnalytics, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    { label: 'Voice (M mins)', data: [4.5, 5.2, 4.8, 5.5, 5.9, 6.0, 5.8], backgroundColor: '#f59e0b', borderRadius: 4 },
                    { label: 'Data (TB)', data: [2.0, 1.5, 1.8, 1.2, 1.0, 0.5, 0.8], backgroundColor: '#3b82f6', borderRadius: 4 }
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

    // Feedback Distribution
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

    // Sustainability Breakdown
    const ctxSustainability = document.getElementById('sustainabilityChart');
    if (ctxSustainability) {
        charts.sustainability = new Chart(ctxSustainability, {
            type: 'doughnut',
            data: {
                labels: ['Green Energy', 'E-Waste Recycling', 'Digital Inclusion', 'Other'],
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

// ── INTERACTIVE FUNCTIONS ──────────────────────────────────────────────────

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconName = type === 'info' ? 'info' : type === 'error' ? 'alert-triangle' : 'check-circle';

    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.5s forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function runDiagnostics() {
    const btn = document.getElementById('diagnostic-btn');
    const text = document.getElementById('diagnostic-text');
    if (!btn || btn.disabled) return;

    btn.disabled = true;
    const originalText = text.innerText;
    text.innerText = "Scanning Network...";

    let step = 0;
    const interval = setInterval(() => {
        step++;
        if (step === 1) showToast('Checking Signal Strength...', 'info');
        if (step === 2) showToast('Verifying User Connectivity...', 'info');
        if (step === 3) showToast('Average Latency: 28ms', 'info');

        if (step >= 4) {
            clearInterval(interval);
            showToast('Network Scan Complete: All Systems Optimal', 'success');
            text.innerText = "Scan Complete";
            setTimeout(() => {
                text.innerText = originalText;
                btn.disabled = false;
            }, 2000);
        }
    }, 800);
}

function logout() {
    if (confirm("Secure Logout: End current session?")) {
        navigateTo('landing');
        showToast('Session ended securely', 'info');
    }
}

// Browser history navigation support
window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    navigateTo(hash || 'landing');
});

// Resize charts when tab/page becomes visible again
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        setTimeout(() => {
            Object.values(charts).forEach(chart => chart?.resize?.());
        }, 300);
    }
});
