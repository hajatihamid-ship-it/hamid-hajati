import { getUsers, getDiscounts, getActivityLog, saveUsers, saveUserData, addActivityLog, getUserData } from '../services/storage';
import { STORE_PLANS } from '../config';
import { formatPrice, timeAgo } from '../utils/helpers';
import { openModal, closeModal, showToast } from '../utils/dom';
import { getCurrentUser } from '../state';

const initCharts = () => {
    const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (revenueCtx && window.Chart) {
        new window.Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
                datasets: [{
                    label: 'درآمد (تومان)',
                    data: [1200000, 1900000, 1500000, 2500000, 2200000, 3000000],
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                plugins: { legend: { display: false } }
            }
        });
    }

    const plansCtx = document.getElementById('plansChart') as HTMLCanvasElement;
    if (plansCtx && window.Chart) {
        new window.Chart(plansCtx, {
            type: 'doughnut',
            data: {
                labels: STORE_PLANS.map(p => p.planName),
                datasets: [{
                    label: 'فروش پلن',
                    data: [12, 19, 28, 21],
                    backgroundColor: ['#3b82f6', '#ec4899', '#10b981', '#f97316'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
};

const renderUserRowsHtml = () => {
    const users = getUsers();
    const coaches = users.filter((u: any) => u.role === 'coach');

    const allUsersHtml = users.map((user: any) => `
        <tr class="hover:bg-bg-tertiary transition-colors">
            <td class="p-4 font-semibold">${user.username}</td>
            <td class="p-4">${user.email}</td>
            <td class="p-4">${user.role === 'admin' ? 'ادمین' : user.role === 'coach' ? 'مربی' : 'کاربر'}</td>
            <td class="p-4">${new Date(user.joinDate).toLocaleDateString('fa-IR')}</td>
            <td class="p-4">${getStatusBadge(user.status, user.role, user.coachStatus)}</td>
            <td class="p-4 flex items-center gap-2">
                <button data-action="impersonate" data-username="${user.username}" title="ورود به حساب" class="secondary-button !p-2"><i data-lucide="log-in" class="w-4 h-4 pointer-events-none"></i></button>
                ${user.role !== 'admin' ? `
                    <button data-action="${user.status === 'active' ? 'suspend' : 'activate'}" data-username="${user.username}" title="${user.status === 'active' ? 'مسدود کردن' : 'فعال کردن'}" class="secondary-button !p-2">
                        <i data-lucide="${user.status === 'active' ? 'shield-off' : 'shield'}" class="w-4 h-4 pointer-events-none"></i>
                    </button>` : ''}
            </td>
        </tr>`).join('');

    const coachesHtml = coaches.map((coach: any) => `
        <tr class="hover:bg-bg-tertiary transition-colors">
            <td class="p-4 font-semibold">${coach.username}</td>
            <td class="p-4">${getUserData(coach.username).students || 0}</td>
            <td class="p-4">${new Date(coach.joinDate).toLocaleDateString('fa-IR')}</td>
            <td class="p-4">${getStatusBadge(coach.status, coach.role, coach.coachStatus)}</td>
            <td class="p-4 flex items-center gap-2">
                <button data-action="impersonate" data-username="${coach.username}" title="ورود به حساب" class="secondary-button !p-2"><i data-lucide="log-in" class="w-4 h-4 pointer-events-none"></i></button>
                ${coach.coachStatus === 'pending' ? `
                    <button data-action="approve" data-username="${coach.username}" class="primary-button !py-1 !px-2 !text-xs">تایید</button>
                    <button data-action="reject" data-username="${coach.username}" class="secondary-button !py-1 !px-2 !text-xs !text-red-500">رد</button>` : ''}
                ${coach.coachStatus === 'verified' ? `<button data-action="revoke" data-username="${coach.username}" class="secondary-button !py-1 !px-2 !text-xs !text-red-500">لغو همکاری</button>` : ''}
                ${coach.coachStatus === 'revoked' ? `<button data-action="reapprove" data-username="${coach.username}" class="primary-button !py-1 !px-2 !text-xs">تایید مجدد</button>` : ''}
            </td>
        </tr>`).join('');

    return { allUsersHtml, coachesHtml };
};

const refreshUserTables = () => {
    const { allUsersHtml, coachesHtml } = renderUserRowsHtml();
    const allUsersTbody = document.getElementById('all-users-tbody');
    const coachesTbody = document.getElementById('coaches-tbody');
    if (allUsersTbody) allUsersTbody.innerHTML = allUsersHtml;
    if (coachesTbody) coachesTbody.innerHTML = coachesHtml;
    window.lucide?.createIcons();
};

export function initAdminDashboard(handleLogout: () => void, handleLoginSuccess: (username: string) => void) {
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    
    const navLinks = document.querySelectorAll('.admin-dashboard-container .nav-link');
    const pages = document.querySelectorAll('.admin-dashboard-container .page');

    const switchPage = (targetId: string) => {
        pages.forEach(page => page.classList.add('hidden'));
        const targetPage = document.getElementById(targetId);
        if(targetPage) {
            targetPage.classList.remove('hidden');
            targetPage.classList.add('animate-fade-in');
        }

        navLinks.forEach(l => l.classList.remove('active-link'));
        document.querySelector(`.nav-link[data-target="${targetId}"]`)?.classList.add('active-link');
    };
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = (e.currentTarget as HTMLElement).getAttribute('data-target');
            if (targetId) switchPage(targetId);
        });
    });

    const initTabs = (container: HTMLElement) => {
        const tabButtons = container.querySelectorAll('.admin-tab-button');
        const tabContents = container.querySelectorAll('.admin-tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const target = button.getAttribute('data-target');
                tabButtons.forEach(btn => btn.classList.remove('active-tab'));
                button.classList.add('active-tab');

                tabContents.forEach(content => {
                    if (content.id === target) {
                        content.classList.remove('hidden');
                    } else {
                        content.classList.add('hidden');
                    }
                });
            });
        });
    };

    const usersPage = document.getElementById('admin-users-page');
    if (usersPage) initTabs(usersPage as HTMLElement);

    const financePage = document.getElementById('admin-finance-page');
    if (financePage) initTabs(financePage as HTMLElement);
    
    const addUserBtn = document.getElementById('add-user-btn');
    const addUserModal = document.getElementById('add-user-modal');
    addUserBtn?.addEventListener('click', () => openModal(addUserModal));

    document.getElementById('close-add-user-modal-btn')?.addEventListener('click', () => closeModal(addUserModal));
    addUserModal?.addEventListener('click', e => {
        if ((e.target as HTMLElement).id === 'add-user-modal') {
            closeModal(addUserModal);
        }
    });
    
    const addUserForm = document.getElementById('add-user-form') as HTMLFormElement;
    addUserForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = (addUserForm.querySelector('#add-username') as HTMLInputElement).value.trim();
        const email = (addUserForm.querySelector('#add-email') as HTMLInputElement).value.trim();
        const password = (addUserForm.querySelector('#add-password') as HTMLInputElement).value;
        const role = (addUserForm.querySelector('#add-role') as HTMLSelectElement).value;

        if (!username || !email || !password || !role) {
            showToast('لطفاً تمام فیلدها را پر کنید.', 'error');
            return;
        }

        const users = getUsers();
        if (users.some((u: any) => u.username === username)) {
            showToast('این نام کاربری قبلاً استفاده شده است.', 'error');
            return;
        }

        const newUser = {
            username, email, password, role,
            status: 'active',
            coachStatus: role === 'coach' ? 'verified' : null,
            joinDate: new Date().toISOString()
        };
        
        users.push(newUser);
        saveUsers(users);
        saveUserData(username, {
            step1: { clientName: username, clientEmail: email },
            joinDate: new Date().toISOString()
        });
        addActivityLog(`ادمین کاربر جدیدی اضافه کرد: ${username} با نقش ${role}`);
        showToast('کاربر با موفقیت اضافه شد.', 'success');
        refreshUserTables();
        closeModal(addUserModal);
        addUserForm.reset();
    });
    
    const mainContent = document.querySelector('.admin-dashboard-container main');
    mainContent?.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const actionBtn = target.closest('button[data-action]');
        if (!actionBtn) return;

        const action = actionBtn.getAttribute('data-action')!;
        const username = actionBtn.getAttribute('data-username')!;
        
        const users = getUsers();
        const userIndex = users.findIndex((u: any) => u.username === username);
        if (userIndex === -1) return;
        const user = users[userIndex];

        let message = "";
        let logMessage = "";

        switch(action) {
            case 'impersonate':
                logMessage = `ادمین وارد حساب کاربری ${username} شد.`;
                addActivityLog(logMessage);
                const adminUser = getCurrentUser();
                if(adminUser) sessionStorage.setItem('impersonating_admin', adminUser);
                handleLoginSuccess(username);
                return; // Early return as we are switching pages

            case 'suspend':
                user.status = 'suspended';
                message = `کاربر ${username} مسدود شد.`;
                logMessage = `ادمین کاربر ${username} را مسدود کرد.`;
                break;
            case 'activate':
                user.status = 'active';
                message = `کاربر ${username} فعال شد.`;
                logMessage = `ادمین کاربر ${username} را فعال کرد.`;
                break;
            case 'approve':
            case 'reapprove':
                user.coachStatus = 'verified';
                message = `مربی ${username} تایید شد.`;
                logMessage = `ادمین مربی ${username} را تایید کرد.`;
                break;
            case 'reject':
            case 'revoke':
                user.coachStatus = 'revoked';
                message = `همکاری با مربی ${username} لغو شد.`;
                logMessage = `ادمین همکاری با ${username} را لغو کرد.`;
                break;
        }

        saveUsers(users);
        addActivityLog(logMessage);
        showToast(message, 'success');
        refreshUserTables();
    });


    switchPage('admin-dashboard-page');
    initCharts();
}

const getStatusBadge = (status: string, role: string, coachStatus: string | null) => {
    if (role === 'coach') {
        switch (coachStatus) {
            case 'verified': return `<span class="status-badge verified">تایید شده</span>`;
            case 'pending': return `<span class="status-badge pending">در انتظار تایید</span>`;
            case 'revoked': return `<span class="status-badge revoked">لغو همکاری</span>`;
            default: return `<span class="status-badge suspended">${coachStatus || 'نامشخص'}</span>`;
        }
    } else {
         switch (status) {
            case 'active': return `<span class="status-badge active">فعال</span>`;
            case 'suspended': return `<span class="status-badge suspended">مسدود</span>`;
            default: return `<span class="status-badge">${status}</span>`;
        }
    }
};

const getAllTransactions = () => {
    const users = getUsers();
    let transactions: any[] = [];
    users.forEach((user: any) => {
        const userData = getUserData(user.username);
        if (userData.subscriptions) {
            userData.subscriptions.forEach((sub: any) => {
                transactions.push({ ...sub, username: user.username });
            });
        }
    });
    return transactions.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
};

export function renderAdminDashboard() {
    const { allUsersHtml, coachesHtml } = renderUserRowsHtml();
    const discounts = getDiscounts();
    const activityLog = getActivityLog();
    const transactions = getAllTransactions();

    return `
    <div class="admin-dashboard-container flex h-screen text-text-primary transition-opacity duration-500 opacity-0">
        <aside class="w-64 p-4 space-y-4 flex flex-col flex-shrink-0">
            <div class="flex items-center gap-3 p-2">
                <i class="fas fa-shield-halved text-2xl text-admin-accent-green"></i>
                <h1 class="text-xl font-bold">پنل مدیریت</h1>
            </div>
            <nav class="space-y-2 flex-grow">
                ${[
                    { target: 'admin-dashboard-page', icon: 'fa-tachometer-alt', label: 'داشبورد' },
                    { target: 'admin-users-page', icon: 'fa-users-cog', label: 'کاربران و مربیان' },
                    { target: 'admin-programs-page', icon: 'fa-dumbbell', label: 'برنامه‌ها' },
                    { target: 'admin-finance-page', icon: 'fa-chart-pie', label: 'مالی و بازاریابی' },
                    { target: 'admin-audit-log-page', icon: 'fa-clipboard-list', label: 'گزارش فعالیت‌ها' },
                ].map(item => `
                    <a href="#" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-md" data-target="${item.target}">
                        <i class="fas ${item.icon} w-6 text-center"></i><span>${item.label}</span>
                    </a>
                `).join('')}
            </nav>
            <div class="space-y-2">
                <button id="theme-toggle-btn-dashboard" class="secondary-button w-full !justify-start !gap-3 !px-4 !py-3"><i data-lucide="sun" class="w-6"></i><span>تغییر پوسته</span></button>
                <button id="logout-btn" class="secondary-button w-full !justify-start !gap-3 !px-4 !py-3"><i data-lucide="log-out" class="w-6"></i><span>خروج</span></button>
            </div>
        </aside>
        <main class="flex-1 p-6 lg:p-8 overflow-y-auto bg-bg-primary">
            <!-- Dashboard Page -->
            <div id="admin-dashboard-page" class="page">
                <h2 class="text-3xl font-extrabold mb-6 text-text-primary">مرکز فرماندهی</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    ${[
                        { title: 'ثبت‌نام جدید (۳۰ روز)', value: '۴۲', change: '+15%', color: 'admin-accent-green', icon: 'fa-user-plus' },
                        { title: 'درآمد ماهانه', value: formatPrice(3000000), change: '+8.2%', color: 'admin-accent-pink', icon: 'fa-dollar-sign' },
                        { title: 'نرخ ریزش', value: '۳.۱٪', change: '-1.5%', color: 'admin-accent-blue', icon: 'fa-arrow-trend-down' },
                        { title: 'برنامه‌های ساخته شده', value: '۱۱۲', change: '+20', color: 'admin-accent-orange', icon: 'fa-file-signature' }
                    ].map(kpi => `
                    <div class="admin-kpi-card">
                        <div class="icon-container" style="background-color: var(--${kpi.color}); color: white;"><i class="fas ${kpi.icon} fa-lg"></i></div>
                        <div>
                            <p class="text-sm text-text-secondary">${kpi.title}</p>
                            <p class="text-2xl font-bold text-text-primary">${kpi.value}</p>
                            <p class="text-xs text-text-secondary">${kpi.change}</p>
                        </div>
                    </div>`).join('')}
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 admin-chart-container h-96">
                        <h3 class="font-bold text-lg mb-4">گزارش درآمد</h3>
                        <canvas id="revenueChart"></canvas>
                    </div>
                    <div class="admin-chart-container h-96">
                        <h3 class="font-bold text-lg mb-4">محبوب‌ترین پلن‌ها</h3>
                        <canvas id="plansChart"></canvas>
                    </div>
                </div>
                <div class="mt-6">
                    <div class="card p-6">
                        <h3 class="font-bold text-lg mb-4">عملکرد برتر مربیان</h3>
                        <div class="space-y-4">
                             ${[
                                { name: 'coach10186', students: 28, avatar: 'https://i.pravatar.cc/150?u=coach10186' },
                                { name: 'Jessica Miller', students: 21, avatar: 'https://i.pravatar.cc/150?u=jessica' },
                                { name: 'David Wilson', students: 15, avatar: 'https://i.pravatar.cc/150?u=david' }
                            ].map((coach, index) => `
                                <div class="flex items-center gap-3">
                                    <span class="font-bold text-text-secondary w-5">${index + 1}.</span>
                                    <img src="${coach.avatar}" class="w-10 h-10 rounded-full" alt="${coach.name}">
                                    <div class="flex-grow">
                                        <p class="font-semibold text-text-primary">${coach.name}</p>
                                        <p class="text-xs text-text-secondary">${coach.students} شاگرد فعال</p>
                                    </div>
                                    <button class="secondary-button !py-1 !px-2 !text-xs">مشاهده</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Users & Coaches Page -->
            <div id="admin-users-page" class="page hidden">
                 <h2 class="text-3xl font-extrabold mb-6 text-text-primary">مدیریت کاربران و مربیان</h2>
                 <div class="flex items-center justify-between mb-4">
                     <div class="bg-bg-tertiary p-1 rounded-lg flex items-center gap-1">
                         <button class="admin-tab-button active-tab" data-target="all-users-content">همه کاربران</button>
                         <button class="admin-tab-button" data-target="coaches-content">مربیان</button>
                     </div>
                     <button id="add-user-btn" class="primary-button flex items-center gap-2"><i data-lucide="plus"></i> افزودن کاربر</button>
                 </div>
                 <div id="all-users-content" class="admin-tab-content">
                     <div class="card overflow-hidden">
                        <table class="w-full text-sm text-right">
                           <thead><tr class="font-semibold"><th class="p-4">نام کاربری</th><th class="p-4">ایمیل</th><th class="p-4">نقش</th><th class="p-4">تاریخ عضویت</th><th class="p-4">وضعیت</th><th class="p-4">عملیات</th></tr></thead>
                           <tbody id="all-users-tbody">
                               ${allUsersHtml}
                           </tbody>
                        </table>
                     </div>
                 </div>
                 <div id="coaches-content" class="admin-tab-content hidden">
                    <div class="card overflow-hidden">
                       <table class="w-full text-sm text-right">
                          <thead><tr class="font-semibold"><th class="p-4">نام مربی</th><th class="p-4">شاگردان فعال</th><th class="p-4">تاریخ عضویت</th><th class="p-4">وضعیت</th><th class="p-4">عملیات</th></tr></thead>
                          <tbody id="coaches-tbody">
                              ${coachesHtml}
                          </tbody>
                       </table>
                    </div>
                 </div>
            </div>

            <!-- Programs Page -->
            <div id="admin-programs-page" class="page hidden">
                <h2 class="text-3xl font-extrabold mb-6">بررسی برنامه‌ها و گفتگوها</h2>
                <p class="text-text-secondary">این بخش برای مشاهده برنامه‌های ارسالی مربیان و بازبینی گفتگوها در حال توسعه است.</p>
            </div>
            
            <!-- Finance Page -->
            <div id="admin-finance-page" class="page hidden">
                <h2 class="text-3xl font-extrabold mb-6">مالی و بازاریابی</h2>
                <div class="bg-bg-tertiary p-1 rounded-lg flex items-center gap-1 mb-4">
                    <button class="admin-tab-button active-tab" data-target="plans-content">پلن‌ها</button>
                    <button class="admin-tab-button" data-target="discounts-content">کدهای تخفیف</button>
                    <button class="admin-tab-button" data-target="transactions-content">تراکنش‌ها</button>
                    <button class="admin-tab-button" data-target="commissions-content">کمیسیون مربیان</button>
                </div>
                <div id="plans-content" class="admin-tab-content">
                    <div class="card p-4">
                        <h3 class="font-bold text-lg mb-2">مدیریت پلن‌ها</h3>
                        <p class="text-text-secondary text-sm mb-4">پلن‌های اشتراک را ایجاد، ویرایش یا حذف کنید.</p>
                        ${STORE_PLANS.map(plan => `
                            <div class="p-4 border border-border-primary rounded-lg mb-2 flex items-center justify-between">
                               <div>
                                 <p class="font-bold">${plan.planName}</p>
                                 <p class="text-sm text-text-secondary">${formatPrice(plan.price)}</p>
                               </div>
                               <button class="secondary-button !py-1 !px-3 !text-sm">ویرایش</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div id="discounts-content" class="admin-tab-content hidden">
                    <div class="card p-4">
                        <h3 class="font-bold text-lg mb-2">مدیریت کدهای تخفیف</h3>
                        <p class="text-text-secondary text-sm mb-4">کدهای تخفیف را برای کمپین‌های بازاریابی مدیریت کنید.</p>
                         ${Object.entries(discounts).map(([code, details]: [string, any]) => `
                             <div class="p-4 border border-border-primary rounded-lg mb-2 flex items-center justify-between">
                                <div>
                                  <p class="font-bold text-admin-accent-blue">${code}</p>
                                  <p class="text-sm text-text-secondary">${details.type === 'percentage' ? `${details.value}% تخفیف` : `${formatPrice(details.value)} تخفیف`}</p>
                                </div>
                                <button class="secondary-button !py-1 !px-3 !text-sm">ویرایش</button>
                             </div>
                         `).join('')}
                    </div>
                </div>
                 <div id="transactions-content" class="admin-tab-content hidden">
                    <div class="card overflow-hidden">
                        <table class="w-full text-sm text-right">
                           <thead><tr class="font-semibold"><th class="p-4">کاربر</th><th class="p-4">پلن</th><th class="p-4">مبلغ</th><th class="p-4">تاریخ</th><th class="p-4">وضعیت</th></tr></thead>
                           <tbody>
                               ${transactions.map((tx: any) => `
                               <tr class="hover:bg-bg-tertiary transition-colors">
                                   <td class="p-4 font-semibold">${tx.username}</td>
                                   <td class="p-4">${tx.planName}</td>
                                   <td class="p-4">${formatPrice(tx.price)}</td>
                                   <td class="p-4">${new Date(tx.purchaseDate).toLocaleDateString('fa-IR')}</td>
                                   <td class="p-4">${tx.fulfilled ? '<span class="status-badge verified">انجام شده</span>' : '<span class="status-badge pending">در انتظار</span>'}</td>
                               </tr>
                               `).join('')}
                           </tbody>
                        </table>
                    </div>
                </div>
                <div id="commissions-content" class="admin-tab-content hidden">
                    <p class="text-text-secondary">این بخش برای مدیریت کمیسیون مربیان در حال توسعه است.</p>
                </div>
            </div>

            <!-- Audit Log Page -->
            <div id="admin-audit-log-page" class="page hidden">
                <h2 class="text-3xl font-extrabold mb-6">گزارش فعالیت‌ها (Audit Log)</h2>
                <div class="card overflow-hidden">
                    <table class="w-full text-sm text-right">
                       <thead><tr class="font-semibold"><th class="p-4">زمان</th><th class="p-4">رویداد</th></tr></thead>
                       <tbody>
                           ${activityLog.map((log: any) => `
                           <tr class="hover:bg-bg-tertiary transition-colors">
                               <td class="p-4 text-text-secondary whitespace-nowrap">${timeAgo(log.date)}</td>
                               <td class="p-4">${log.message}</td>
                           </tr>`).join('')}
                       </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
    
    <!-- Add User Modal -->
    <div id="add-user-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-md transform scale-95 transition-transform duration-300 relative">
             <button id="close-add-user-modal-btn" class="absolute top-3 left-3 secondary-button !p-2 rounded-full z-10"><i data-lucide="x"></i></button>
            <div class="p-8">
                <h2 class="font-bold text-2xl text-center mb-6">افزودن کاربر جدید</h2>
                <form id="add-user-form" class="space-y-4" novalidate>
                    <div class="input-group">
                        <input id="add-username" type="text" class="input-field w-full" placeholder=" " required>
                        <label for="add-username" class="input-label">نام کاربری</label>
                    </div>
                    <div class="input-group">
                        <input id="add-email" type="email" class="input-field w-full" placeholder=" " required>
                        <label for="add-email" class="input-label">ایمیل</label>
                    </div>
                    <div class="input-group">
                        <input id="add-password" type="password" class="input-field w-full" placeholder=" " required>
                        <label for="add-password" class="input-label">رمز عبور</label>
                    </div>
                     <div>
                        <label for="add-role" class="block text-sm font-medium text-text-secondary mb-1">نقش</label>
                        <select id="add-role" class="input-field w-full">
                            <option value="user">کاربر</option>
                            <option value="coach">مربی</option>
                        </select>
                    </div>
                    <div class="pt-2">
                        <button type="submit" class="primary-button w-full !py-3 !text-base">افزودن</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
}