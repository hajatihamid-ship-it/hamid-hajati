import { getUsers, getDiscounts, getActivityLog, saveUsers, saveUserData, addActivityLog, getUserData, getStorePlans, saveStorePlans, getExercisesDB, saveExercisesDB, getSupplementsDB, saveSupplementsDB, saveDiscounts, getSiteSettings, saveSiteSettings } from '../services/storage';
import { formatPrice, timeAgo } from '../utils/helpers';
import { openModal, closeModal, showToast } from '../utils/dom';
import { getCurrentUser } from '../state';
import { sanitizeHTML } from '../utils/dom';

let activityModalChartInstance: any = null;
let coachAnalyticsSort = { key: 'rating', order: 'desc' };

const renderDiscountsAdminHtml = () => {
    const discounts = getDiscounts();
    return `
        <div class="flex justify-between items-center mb-4">
            <div>
                <h3 class="font-bold text-lg">مدیریت کدهای تخفیف</h3>
                <p class="text-text-secondary text-sm">کدهای تخفیف را برای کمپین‌های بازاریابی مدیریت کنید.</p>
            </div>
            <button id="add-discount-btn" data-action="add-discount" class="primary-button flex items-center gap-2"><i data-lucide="plus"></i> افزودن کد</button>
        </div>
        <div id="admin-discounts-list" class="space-y-2">
            ${Object.keys(discounts).length > 0 ? Object.entries(discounts).map(([code, details]: [string, any]) => `
                <div class="p-4 border border-border-primary rounded-lg flex items-center justify-between">
                   <div>
                     <p class="font-bold text-admin-accent-blue">${code}</p>
                     <p class="text-sm text-text-secondary">${details.type === 'percentage' ? `${details.value}% تخفیف` : `${formatPrice(details.value)} تخفیف`}</p>
                   </div>
                   <div class="flex items-center gap-2">
                        <button class="secondary-button !p-2" data-action="edit-discount" data-code="${code}"><i data-lucide="edit-3" class="w-4 h-4 pointer-events-none"></i></button>
                        <button class="secondary-button !p-2 text-red-accent" data-action="delete-discount" data-code="${code}"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button>
                   </div>
                </div>
            `).join('') : '<p class="text-text-secondary">هیچ کد تخفیفی ثبت نشده است.</p>'}
        </div>
    `;
};


const initCharts = () => {
    const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (revenueCtx && window.Chart) {
        const existingChart = window.Chart.getChart(revenueCtx);
        if (existingChart) existingChart.destroy();
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
        const existingChart = window.Chart.getChart(plansCtx);
        if (existingChart) existingChart.destroy();
        new window.Chart(plansCtx, {
            type: 'doughnut',
            data: {
                labels: getStorePlans().map((p: any) => p.planName),
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

    const allUsersHtml = users.map((user: any) => {
        const userData = getUserData(user.username);
        const name = userData.step1?.clientName || user.username;
        const avatar = userData.profile?.avatar;
        const avatarHtml = avatar
            ? `<img src="${avatar}" class="w-10 h-10 rounded-full object-cover" alt="${name}">`
            : `<div class="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center font-bold text-text-secondary">${name.charAt(0).toUpperCase()}</div>`;
        
        return `
        <tr class="hover:bg-bg-tertiary transition-colors">
            <td class="p-4">
                <div class="flex items-center gap-3">
                    ${avatarHtml}
                    <div>
                        <p class="font-semibold">${name}</p>
                        <p class="text-xs text-text-secondary">${user.username}</p>
                    </div>
                </div>
            </td>
            <td class="p-4">${user.email}</td>
            <td class="p-4">${user.role === 'admin' ? 'ادمین' : user.role === 'coach' ? 'مربی' : 'کاربر'}</td>
            <td class="p-4">${new Date(user.joinDate).toLocaleDateString('fa-IR')}</td>
            <td class="p-4">${getStatusBadge(user.status, user.role, user.coachStatus)}</td>
            <td class="p-4 flex items-center gap-2">
                <button data-action="view-activity" data-username="${user.username}" title="مشاهده فعالیت" class="secondary-button !p-2"><i data-lucide="eye" class="w-4 h-4 pointer-events-none"></i></button>
                <button data-action="edit-user" data-username="${user.username}" title="ویرایش کاربر" class="secondary-button !p-2"><i data-lucide="edit-3" class="w-4 h-4 pointer-events-none"></i></button>
                <button data-action="impersonate" data-username="${user.username}" title="ورود به حساب" class="secondary-button !p-2"><i data-lucide="log-in" class="w-4 h-4 pointer-events-none"></i></button>
                ${user.role !== 'admin' ? `
                    <button data-action="${user.status === 'active' ? 'suspend' : 'activate'}" data-username="${user.username}" title="${user.status === 'active' ? 'مسدود کردن' : 'فعال کردن'}" class="secondary-button !p-2">
                        <i data-lucide="${user.status === 'active' ? 'shield-off' : 'shield'}" class="w-4 h-4 pointer-events-none"></i>
                    </button>` : ''}
            </td>
        </tr>`;
    }).join('');

    const coachesHtml = coaches.map((coach: any) => {
        const coachData = getUserData(coach.username);
        const name = coachData.step1?.clientName || coach.username;
        const avatar = coachData.profile?.avatar;
        const avatarHtml = avatar
            ? `<img src="${avatar}" class="w-10 h-10 rounded-full object-cover" alt="${name}">`
            : `<div class="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center font-bold text-text-secondary">${name.charAt(0).toUpperCase()}</div>`;
            
        return `
        <tr class="hover:bg-bg-tertiary transition-colors">
            <td class="p-4">
                 <div class="flex items-center gap-3">
                    ${avatarHtml}
                    <div>
                        <p class="font-semibold">${name}</p>
                        <p class="text-xs text-text-secondary">${coach.username}</p>
                    </div>
                </div>
            </td>
            <td class="p-4">${getUserData(coach.username).students || 0}</td>
            <td class="p-4">${new Date(coach.joinDate).toLocaleDateString('fa-IR')}</td>
            <td class="p-4">${getStatusBadge(coach.status, coach.role, coach.coachStatus)}</td>
            <td class="p-4 flex items-center gap-2">
                 <button data-action="view-activity" data-username="${coach.username}" title="مشاهده فعالیت" class="secondary-button !p-2"><i data-lucide="eye" class="w-4 h-4 pointer-events-none"></i></button>
                <button data-action="edit-user" data-username="${coach.username}" title="ویرایش کاربر" class="secondary-button !p-2"><i data-lucide="edit-3" class="w-4 h-4 pointer-events-none"></i></button>
                <button data-action="impersonate" data-username="${coach.username}" title="ورود به حساب" class="secondary-button !p-2"><i data-lucide="log-in" class="w-4 h-4 pointer-events-none"></i></button>
                ${coach.coachStatus === 'pending' ? `
                    <button data-action="approve" data-username="${coach.username}" class="primary-button !py-1 !px-2 !text-xs">تایید</button>
                    <button data-action="reject" data-username="${coach.username}" class="secondary-button !py-1 !px-2 !text-xs !text-red-500">رد</button>` : ''}
                ${coach.coachStatus === 'verified' ? `<button data-action="revoke" data-username="${coach.username}" class="secondary-button !py-1 !px-2 !text-xs !text-red-500">لغو همکاری</button>` : ''}
                ${coach.coachStatus === 'revoked' ? `<button data-action="reapprove" data-username="${coach.username}" class="primary-button !py-1 !px-2 !text-xs">تایید مجدد</button>` : ''}
            </td>
        </tr>`;
    }).join('');

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

const renderPlansAdminHtml = () => {
    const plans = getStorePlans();
    const plansListHtml = plans.length > 0 ? plans.map((plan: any) => `
        <div class="p-4 border-l-4 rounded-lg flex items-center justify-between bg-bg-secondary hover:bg-bg-tertiary transition-colors" style="border-left-color: ${plan.color || 'var(--accent)'};">
           <div class="flex items-center gap-3">
                <span class="text-2xl">${plan.emoji || '📄'}</span>
                <div>
                    <p class="font-bold">${plan.planName}</p>
                    <p class="text-sm text-text-secondary">${formatPrice(plan.price)}</p>
                </div>
           </div>
           <div class="flex items-center gap-2">
                <button class="secondary-button !p-2" data-action="edit-plan" data-plan-id="${plan.planId}"><i data-lucide="edit-3" class="w-4 h-4 pointer-events-none"></i></button>
                <button class="secondary-button !p-2 text-red-accent" data-action="delete-plan" data-plan-id="${plan.planId}"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button>
           </div>
        </div>
    `).join('') : '<p class="text-text-secondary p-4 text-center">هنوز پلنی ایجاد نشده است.</p>';

    return `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card p-4">
            <div class="flex justify-between items-center mb-4">
                <div>
                    <h3 class="font-bold text-lg">مدیریت پلن‌ها</h3>
                    <p class="text-text-secondary text-sm">پلن‌های اشتراک را ایجاد، ویرایش یا حذف کنید.</p>
                </div>
                <button id="add-plan-btn" class="primary-button flex items-center gap-2"><i data-lucide="plus"></i> افزودن پلن</button>
            </div>
            <div id="admin-plans-list" class="space-y-2">
                ${plansListHtml}
            </div>
        </div>
        <div>
             <h3 class="font-bold text-lg mb-4 text-center text-text-secondary">پیش‌نمایش کارت پلن</h3>
             <div class="card p-6 flex flex-col border-2 transition-all hover:shadow-xl hover:-translate-y-1 bg-bg-secondary" style="border-color: #ec4899;">
                <h4 class="text-lg font-bold text-text-primary">🚀 پکیج کامل ۳ ماهه</h4>
                <p class="text-sm text-text-secondary mt-1 flex-grow">بهترین گزینه برای نتایج پایدار و جامع.</p>
                <div class="my-6">
                    <span class="text-3xl font-black">${formatPrice(750000).split(' ')[0]}</span>
                    <span class="text-text-secondary"> تومان</span>
                </div>
                <ul class="space-y-3 text-sm mb-6">
                    ${['برنامه تمرینی اختصاصی', 'برنامه غذایی هوشمند', 'پشتیبانی کامل در چت', 'تحلیل هفتگی پیشرفت'].map(feature => `
                        <li class="flex items-center gap-2">
                            <i data-lucide="check-circle" class="w-5 h-5 text-green-400"></i>
                            <span>${feature}</span>
                        </li>
                    `).join('')}
                </ul>
                <button class="primary-button mt-auto w-full cursor-default">انتخاب پلن</button>
            </div>
        </div>
    </div>
    `;
};

const openUserActivityModal = (username: string) => {
    const modal = document.getElementById('view-activity-modal');
    const body = document.getElementById('view-activity-modal-body');
    const title = document.getElementById('view-activity-modal-title');
    if (!modal || !body || !title) return;

    const userData = getUserData(username);

    title.textContent = `نمای کلی فعالیت: ${username}`;

    const latestProgram = (userData.programHistory && userData.programHistory.length > 0) 
        ? userData.programHistory[0] 
        : { step2: userData.step2 };
        
    const chatHistory = (userData.chatHistory || []).slice(-5);

    body.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-1 space-y-4">
                <div class="card p-4">
                    <h4 class="font-bold mb-2">متریک‌های کلیدی</h4>
                    <div class="text-sm space-y-1">
                        <p><strong>هدف:</strong> ${userData.step1?.trainingGoal || 'N/A'}</p>
                        <p><strong>وزن:</strong> ${userData.step1?.weight || 'N/A'} kg</p>
                        <p><strong>قد:</strong> ${userData.step1?.height || 'N/A'} cm</p>
                        <p><strong>TDEE:</strong> ${Math.round(userData.step1?.tdee) || 'N/A'} kcal</p>
                    </div>
                </div>
                 <div class="card p-4">
                    <h4 class="font-bold mb-2">تاریخچه وزن</h4>
                    <div class="h-48"><canvas id="activity-modal-weight-chart"></canvas></div>
                </div>
            </div>
            <div class="md:col-span-2 space-y-4">
                <div class="card p-4">
                    <h4 class="font-bold mb-2">آخرین برنامه تمرینی</h4>
                    ${!latestProgram.step2 ? '<p class="text-text-secondary text-sm">برنامه‌ای یافت نشد.</p>' : 
                        latestProgram.step2.days.slice(0, 2).map((day: any) => `
                        <div class="mb-2">
                            <p class="font-semibold text-sm">${day.name}</p>
                            <p class="text-xs text-text-secondary">${day.exercises.map((e:any) => e.name).join(' - ')}</p>
                        </div>
                        `).join('')
                    }
                </div>
                 <div class="card p-4">
                    <h4 class="font-bold mb-2">آخرین گفتگوها</h4>
                    <div class="space-y-2 text-sm">
                        ${chatHistory.length === 0 ? '<p class="text-text-secondary text-sm">گفتگویی یافت نشد.</p>' :
                            chatHistory.map((msg: any) => `
                            <div class="p-2 rounded-lg ${msg.sender === 'user' ? 'bg-bg-tertiary' : 'bg-green-500/10'}">
                                <p><strong>${msg.sender === 'user' ? username : 'مربی'}:</strong> ${sanitizeHTML(msg.message)}</p>
                            </div>
                            `).join('')
                        }
                    </div>
                </div>
            </div>
        </div>
    `;

    openModal(modal);

    const ctx = document.getElementById('activity-modal-weight-chart') as HTMLCanvasElement;
    if (activityModalChartInstance) activityModalChartInstance.destroy();
    if (ctx && window.Chart) {
        activityModalChartInstance = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: (userData.weightHistory || []).map((e: any) => new Date(e.date).toLocaleDateString('fa-IR')),
                datasets: [{
                    data: (userData.weightHistory || []).map((e: any) => e.weight),
                    borderColor: 'var(--accent)',
                    tension: 0.2,
                    pointRadius: 2
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }
};

const renderCommissionsHtml = () => {
    const coaches = getUsers().filter((u: any) => u.role === 'coach' && u.coachStatus === 'verified');
    const users = getUsers();
    const coachSales: Record<string, { totalSales: number }> = {};

    coaches.forEach(coach => {
        coachSales[coach.username] = { totalSales: 0 };
    });

    users.forEach(user => {
        const userData = getUserData(user.username);
        const coachName = userData.step1?.coachName;
        if (coachName && coachSales[coachName]) {
            const userSales = (userData.subscriptions || []).reduce((sum: number, sub: any) => sum + sub.price, 0);
            coachSales[coachName].totalSales += userSales;
        }
    });

    const commissionRate = 0.30; // 30%

    return `
        <div class="card p-4">
            <div class="flex justify-between items-center mb-4">
                <div>
                    <h3 class="font-bold text-lg">کمیسیون مربیان</h3>
                    <p class="text-text-secondary text-sm">درآمد و کمیسیون قابل پرداخت به مربیان را مدیریت کنید.</p>
                </div>
                 <div class="bg-bg-tertiary p-2 rounded-lg">
                    <span class="text-sm font-semibold">نرخ کمیسیون: <strong>${commissionRate * 100}%</strong></span>
                </div>
            </div>
            <div class="card overflow-hidden border border-border-primary">
                <table class="w-full text-sm text-right">
                    <thead>
                        <tr class="font-semibold">
                            <th class="p-4">نام مربی</th>
                            <th class="p-4">کل فروش</th>
                            <th class="p-4">کمیسیون قابل پرداخت</th>
                            <th class="p-4">وضعیت</th>
                            <th class="p-4">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${coaches.length > 0 ? coaches.map(coach => {
                            const sales = coachSales[coach.username]?.totalSales || 0;
                            const commission = sales * commissionRate;
                            return `
                                <tr class="hover:bg-bg-tertiary transition-colors">
                                    <td class="p-4 font-semibold">${coach.username}</td>
                                    <td class="p-4">${formatPrice(sales)}</td>
                                    <td class="p-4 font-bold text-admin-accent-green">${formatPrice(commission)}</td>
                                    <td class="p-4">
                                        ${commission > 0 ? '<span class="status-badge pending">پرداخت نشده</span>' : '<span class="status-badge verified">تسویه شده</span>'}
                                    </td>
                                    <td class="p-4">
                                        <button class="primary-button !py-1 !px-2 !text-xs" ${commission === 0 ? 'disabled' : ''}>ثبت پرداخت</button>
                                    </td>
                                </tr>
                            `;
                        }).join('') : `<tr><td colspan="5" class="p-8 text-center text-text-secondary">هیچ مربی تایید شده‌ای برای محاسبه کمیسیون یافت نشد.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

export function initAdminDashboard(handleLogout: () => void, handleLoginSuccess: (username: string) => void, handleGoToHome: () => void) {
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('go-to-home-btn')?.addEventListener('click', handleGoToHome);
    
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

        if(targetId === 'admin-analytics-page') {
             renderAnalyticsPage();
        }
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
    
    const communicationsPage = document.getElementById('admin-communications-page');
    if(communicationsPage) initTabs(communicationsPage);

    const contentPage = document.getElementById('admin-content-page');
    if(contentPage) initTabs(contentPage);
    
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

    const editUserModal = document.getElementById('edit-user-modal');
    document.getElementById('close-edit-user-modal-btn')?.addEventListener('click', () => closeModal(editUserModal));
    editUserModal?.addEventListener('click', e => {
        if ((e.target as HTMLElement).id === 'edit-user-modal') {
            closeModal(editUserModal);
        }
    });

    const editUserForm = document.getElementById('edit-user-form') as HTMLFormElement;
    editUserForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const originalUsername = (editUserForm.elements.namedItem('originalUsername') as HTMLInputElement).value;
        const email = (editUserForm.elements.namedItem('email') as HTMLInputElement).value.trim();
        const password = (editUserForm.elements.namedItem('password') as HTMLInputElement).value;
        const role = (editUserForm.elements.namedItem('role') as HTMLSelectElement).value;

        if (!originalUsername || !email || !role) {
            showToast('لطفاً تمام فیلدهای لازم را پر کنید.', 'error');
            return;
        }

        const users = getUsers();
        const userIndex = users.findIndex((u: any) => u.username === originalUsername);

        if (userIndex === -1) {
            showToast('خطا: کاربر برای ویرایش یافت نشد.', 'error');
            return;
        }

        users[userIndex].email = email;
        users[userIndex].role = role;
        if (password) {
            users[userIndex].password = password;
        }
        users[userIndex].coachStatus = role === 'coach' ? (users[userIndex].coachStatus || 'verified') : null;

        saveUsers(users);
        addActivityLog(`ادمین اطلاعات کاربر ${originalUsername} را ویرایش کرد.`);
        showToast('اطلاعات کاربر با موفقیت ویرایش شد.', 'success');
        refreshUserTables();
        closeModal(editUserModal);
    });

    const refreshPlansAdminList = () => {
        const container = document.getElementById('plans-content');
        if (container) {
            container.innerHTML = renderPlansAdminHtml();
            window.lucide?.createIcons();
        }
    };
    
    const refreshDiscountsAdminList = () => {
        const container = document.getElementById('discounts-content')?.querySelector('.card');
        if (container) {
            container.innerHTML = renderDiscountsAdminHtml();
            window.lucide?.createIcons();
        }
    };

    const openDiscountModal = (codeData: { code: string; type: string; value: number } | null = null) => {
        const modal = document.getElementById('add-edit-discount-modal');
        const form = document.getElementById('discount-form') as HTMLFormElement;
        const titleEl = document.getElementById('discount-modal-title');
        if (!modal || !form || !titleEl) return;

        form.reset();
        const codeInput = form.elements.namedItem('discountCode') as HTMLInputElement;

        if (codeData) {
            titleEl.textContent = 'ویرایش کد تخفیف';
            (form.elements.namedItem('originalCode') as HTMLInputElement).value = codeData.code;
            codeInput.value = codeData.code;
            codeInput.readOnly = true;
            (form.elements.namedItem('discountType') as HTMLSelectElement).value = codeData.type;
            (form.elements.namedItem('discountValue') as HTMLInputElement).value = String(codeData.value);
        } else {
            titleEl.textContent = 'افزودن کد تخفیف';
            (form.elements.namedItem('originalCode') as HTMLInputElement).value = '';
            codeInput.readOnly = false;
        }
        openModal(modal);
    };

    const mainContent = document.querySelector('.admin-dashboard-container main');
    mainContent?.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        
        const sortHeader = target.closest<HTMLElement>('.sortable-header');
        if (sortHeader && sortHeader.dataset.sortKey) {
            const key = sortHeader.dataset.sortKey;
            if (coachAnalyticsSort.key === key) {
                coachAnalyticsSort.order = coachAnalyticsSort.order === 'asc' ? 'desc' : 'asc';
            } else {
                coachAnalyticsSort.key = key;
                coachAnalyticsSort.order = 'desc';
            }
            renderAnalyticsPage(); // Re-render the page with new sorting
            return;
        }

        const actionBtn = target.closest('button[data-action]');
        if (!actionBtn) return;

        const action = actionBtn.getAttribute('data-action')!;
        const username = actionBtn.getAttribute('data-username')!;
        
        const users = getUsers();
        const userIndex = users.findIndex((u: any) => u.username === username);
        if (userIndex === -1 && !action.includes('plan') && !action.includes('discount') && action !== 'view-activity' && action !== 'edit-user') return;
        const user = users[userIndex];

        let message = "";
        let logMessage = "";

        switch(action) {
            case 'view-activity':
                openUserActivityModal(username);
                return;
            case 'edit-user': {
                const userToEdit = users.find((u: any) => u.username === username);
                if (userToEdit) {
                    const modal = document.getElementById('edit-user-modal');
                    const form = document.getElementById('edit-user-form') as HTMLFormElement;
                    if (modal && form) {
                        (form.elements.namedItem('originalUsername') as HTMLInputElement).value = userToEdit.username;
                        (form.elements.namedItem('username') as HTMLInputElement).value = userToEdit.username;
                        (form.elements.namedItem('email') as HTMLInputElement).value = userToEdit.email;
                        (form.elements.namedItem('role') as HTMLSelectElement).value = userToEdit.role;
                        (form.elements.namedItem('password') as HTMLInputElement).value = '';
                        openModal(modal);
                    }
                }
                return;
            }
            case 'impersonate':
                logMessage = `ادمین وارد حساب کاربری ${username} شد.`;
                addActivityLog(logMessage);
                const adminUser = getCurrentUser();
                if(adminUser) sessionStorage.setItem('impersonating_admin', adminUser);
                handleLoginSuccess(username);
                return;

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
            case 'edit-plan': {
                const planId = actionBtn.getAttribute('data-plan-id');
                const plans = getStorePlans();
                const plan = plans.find((p:any) => p.planId === planId);
                if(plan) openPlanModal(plan);
                return;
            }
            case 'delete-plan': {
                const planId = actionBtn.getAttribute('data-plan-id');
                if (confirm('آیا از حذف این پلن مطمئن هستید؟ این عمل غیرقابل بازگشت است.')) {
                    let plans = getStorePlans();
                    plans = plans.filter((p: any) => p.planId !== planId);
                    saveStorePlans(plans);
                    showToast('پلن با موفقیت حذف شد.', 'success');
                    addActivityLog(`ادمین پلن با شناسه ${planId} را حذف کرد.`);
                    refreshPlansAdminList();
                }
                return;
            }
            case 'add-discount':
                openDiscountModal();
                return;
            case 'edit-discount': {
                const code = actionBtn.getAttribute('data-code');
                const discounts = getDiscounts();
                if (code && discounts[code]) {
                    openDiscountModal({ code, ...discounts[code] });
                }
                return;
            }
            case 'delete-discount': {
                const code = actionBtn.getAttribute('data-code');
                if (code && confirm(`آیا از حذف کد تخفیف "${code}" مطمئن هستید؟`)) {
                    const discounts = getDiscounts();
                    delete discounts[code];
                    saveDiscounts(discounts);
                    showToast('کد تخفیف با موفقیت حذف شد.', 'success');
                    addActivityLog(`ادمین کد تخفیف ${code} را حذف کرد.`);
                    refreshDiscountsAdminList();
                }
                return;
            }
        }

        if (action.includes('plan') || action.includes('discount')) return;

        saveUsers(users);
        addActivityLog(logMessage);
        showToast(message, 'success');
        refreshUserTables();
    });

    const openPlanModal = (planData: any | null = null) => {
        const modal = document.getElementById('add-edit-plan-modal');
        const form = document.getElementById('plan-form') as HTMLFormElement;
        const titleEl = document.getElementById('plan-modal-title');
        if (!modal || !form || !titleEl) return;

        form.reset();

        const dataToDisplay = planData || {
            planId: '',
            planName: 'پلن جدید',
            description: 'توضیحات این پلن را ویرایش کنید.',
            price: 100000,
            features: ['ویژگی ۱', 'ویژگی ۲', 'ویژگی ۳'],
            emoji: '🚀',
            color: '#3b82f6'
        };

        titleEl.textContent = planData ? 'ویرایش پلن' : 'افزودن پلن جدید';

        (form.elements.namedItem('planId') as HTMLInputElement).value = dataToDisplay.planId;
        (form.elements.namedItem('planName') as HTMLInputElement).value = dataToDisplay.planName;
        (form.elements.namedItem('planDescription') as HTMLInputElement).value = dataToDisplay.description;
        (form.elements.namedItem('planPrice') as HTMLInputElement).value = dataToDisplay.price;
        (form.elements.namedItem('planFeatures') as HTMLTextAreaElement).value = (dataToDisplay.features || []).join('\n');
        (form.elements.namedItem('planEmoji') as HTMLInputElement).value = dataToDisplay.emoji || '🚀';
        (form.elements.namedItem('planColor') as HTMLInputElement).value = dataToDisplay.color || '#3b82f6';

        openModal(modal);
    };

    document.getElementById('add-plan-btn')?.addEventListener('click', () => openPlanModal());
    const planModal = document.getElementById('add-edit-plan-modal');
    document.getElementById('close-plan-modal-btn')?.addEventListener('click', () => closeModal(planModal));
    planModal?.addEventListener('click', e => {
        if ((e.target as HTMLElement).id === 'add-edit-plan-modal') closeModal(planModal);
    });

    const planForm = document.getElementById('plan-form') as HTMLFormElement;
    planForm?.addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(planForm);
        const planId = formData.get('planId') as string;
        const planData = {
            planId: planId || `plan_${Date.now()}`,
            planName: formData.get('planName') as string,
            description: formData.get('planDescription') as string,
            price: parseInt(formData.get('planPrice') as string, 10),
            features: (formData.get('planFeatures') as string).split('\n').filter(f => f.trim() !== ''),
            emoji: formData.get('planEmoji') as string,
            color: formData.get('planColor') as string
        };

        if (!planData.planName || isNaN(planData.price)) {
            showToast('نام پلن و قیمت الزامی است.', 'error');
            return;
        }

        let plans = getStorePlans();
        if (planId) { // Editing
            const index = plans.findIndex((p: any) => p.planId === planId);
            const oldPlan = plans[index];
            if (index > -1) plans[index] = planData;
            
            let logMessage = `ادمین پلن "${planData.planName}" را ویرایش کرد.`;
            if (oldPlan && oldPlan.price !== planData.price) {
                logMessage += ` قیمت از ${formatPrice(oldPlan.price)} به ${formatPrice(planData.price)} تغییر یافت.`;
            }
            addActivityLog(logMessage);

        } else { // Adding
            plans.push(planData);
            addActivityLog(`ادمین پلن جدیدی ایجاد کرد: "${planData.planName}" با قیمت ${formatPrice(planData.price)}.`);
        }
        
        saveStorePlans(plans);
        showToast(`پلن "${planData.planName}" با موفقیت ذخیره شد.`, 'success');
        refreshPlansAdminList();
        closeModal(planModal);
    });

    const activityModal = document.getElementById('view-activity-modal');
    document.getElementById('close-view-activity-modal-btn')?.addEventListener('click', () => closeModal(activityModal));
    activityModal?.addEventListener('click', e => {
        if((e.target as HTMLElement).id === 'view-activity-modal') closeModal(activityModal);
    });

    const discountModal = document.getElementById('add-edit-discount-modal');
    document.getElementById('close-discount-modal-btn')?.addEventListener('click', () => closeModal(discountModal));
    discountModal?.addEventListener('click', e => {
        if ((e.target as HTMLElement).id === 'add-edit-discount-modal') closeModal(discountModal);
    });

    const discountForm = document.getElementById('discount-form') as HTMLFormElement;
    discountForm?.addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(discountForm);
        const originalCode = formData.get('originalCode') as string;
        const code = (formData.get('discountCode') as string).toUpperCase();
        const type = formData.get('discountType') as string;
        const value = parseInt(formData.get('discountValue') as string, 10);

        if (!code || isNaN(value)) {
            showToast('کد و مقدار تخفیف الزامی است.', 'error');
            return;
        }

        const discounts = getDiscounts();
        const originalDiscount = originalCode ? { ...discounts[originalCode] } : null;
        
        if (!originalCode && discounts[code]) {
            showToast('این کد تخفیف قبلا ثبت شده است.', 'error');
            return;
        }
        
        if (originalCode && originalCode !== code) {
             delete discounts[originalCode];
        }

        discounts[code] = { type, value };
        saveDiscounts(discounts);
        
        if (originalCode) { // Editing
            let logMessage = `ادمین کد تخفیف "${code}" را ویرایش کرد.`;
            if (originalDiscount && (originalDiscount.value !== value || originalDiscount.type !== type)) {
                logMessage += ` مقدار از ${originalDiscount.type === 'percentage' ? originalDiscount.value + '%' : formatPrice(originalDiscount.value)} به ${type === 'percentage' ? value + '%' : formatPrice(value)} تغییر یافت.`;
            }
            addActivityLog(logMessage);
        } else { // Adding
            addActivityLog(`ادمین کد تخفیف جدیدی ایجاد کرد: "${code}" (${type === 'percentage' ? value + '%' : formatPrice(value)}).`);
        }
        
        showToast(`کد تخفیف "${code}" با موفقیت ذخیره شد.`, 'success');
        refreshDiscountsAdminList();
        closeModal(discountModal);
    });

    // --- CMS Management ---
    const cmsPage = document.getElementById('admin-content-page');
    if(cmsPage) {
        const refreshCmsLists = () => {
            const exerciseContainer = document.getElementById('exercise-list-container');
            const supplementContainer = document.getElementById('supplement-list-container');
            if(exerciseContainer) exerciseContainer.innerHTML = renderExercisesCmsHtml();
            if(supplementContainer) supplementContainer.innerHTML = renderSupplementsCmsHtml();
            window.lucide?.createIcons();
        };

        cmsPage.addEventListener('input', e => {
            const target = e.target as HTMLInputElement;
            if (target.id === 'exercise-search-input') {
                const searchTerm = target.value.toLowerCase();
                document.querySelectorAll('.exercise-list-item').forEach(item => {
                    const name = (item as HTMLElement).dataset.exerciseName?.toLowerCase() || '';
                    (item as HTMLElement).style.display = name.includes(searchTerm) ? 'flex' : 'none';
                });
            }
        });

        cmsPage.addEventListener('click', e => {
            const target = e.target as HTMLElement;
            // FIX: Cast Element to HTMLElement to safely access dataset property.
            const button = target.closest<HTMLButtonElement>('button[data-action]');
            if (!button) return;

            const action = button.dataset.action;
            const groupDetails = button.closest<HTMLElement>('.cms-group-details');
            const groupName = groupDetails?.dataset.groupName;
            const listItem = button.closest<HTMLElement>('.exercise-list-item, .supplement-list-item');
            
            if (action === 'add-exercise') {
                const input = button.previousElementSibling as HTMLInputElement;
                const newName = input.value.trim();
                if (newName && groupName) {
                    const db = getExercisesDB();
                    db[groupName].push(newName);
                    saveExercisesDB(db);
                    showToast('حرکت اضافه شد.', 'success');
                    refreshCmsLists();
                }
            } else if (action === 'delete-exercise') {
                const name = listItem?.dataset.exerciseName;
                if (name && groupName && confirm(`آیا از حذف "${name}" مطمئن هستید؟`)) {
                    const db = getExercisesDB();
                    db[groupName] = db[groupName].filter(ex => ex !== name);
                    saveExercisesDB(db);
                    showToast('حرکت حذف شد.', 'success');
                    refreshCmsLists();
                }
            } else if (action === 'edit-exercise') {
                const span = listItem?.querySelector('.exercise-name-text') as HTMLElement;
                const currentName = listItem?.dataset.exerciseName;
                if (span && currentName && !listItem?.querySelector('.edit-exercise-input')) {
                    span.style.display = 'none';
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = currentName;
                    input.dataset.originalName = currentName;
                    input.className = 'edit-exercise-input input-field !text-sm flex-grow';
                    span.after(input);
                    input.focus();
                }
            } else if (action === 'delete-supplement') {
                 // FIX: Use optional chaining with HTMLElement to safely access dataset
                 const supCategory = listItem?.dataset.supCategory;
                 const supIndex = parseInt(listItem?.dataset.supIndex || '-1', 10);
                 if (supCategory && supIndex > -1 && confirm('آیا از حذف این مکمل مطمئن هستید؟')) {
                     const db = getSupplementsDB();
                     const name = db[supCategory][supIndex].name;
                     db[supCategory].splice(supIndex, 1);
                     saveSupplementsDB(db);
                     showToast(`مکمل "${name}" حذف شد.`, 'success');
                     refreshCmsLists();
                 }
            } else if(action === 'edit-supplement') {
                 // FIX: Use optional chaining with HTMLElement to safely access dataset
                 const supCategory = listItem?.dataset.supCategory;
                 const supIndex = parseInt(listItem?.dataset.supIndex || '-1', 10);
                 if (supCategory && supIndex > -1) {
                     const db = getSupplementsDB();
                     openSupplementModal(db[supCategory][supIndex], supCategory, supIndex);
                 }
            }
        });

        const saveExerciseEdit = (input: HTMLInputElement) => {
            const originalName = input.dataset.originalName;
            const newName = input.value.trim();
            // FIX: Cast closest result to HTMLElement to access dataset property
            const groupName = input.closest<HTMLElement>('.cms-group-details')?.dataset.groupName;

            if (newName && originalName && groupName && newName !== originalName) {
                const db = getExercisesDB();
                const index = db[groupName].indexOf(originalName);
                if (index > -1) {
                    db[groupName][index] = newName;
                    saveExercisesDB(db);
                    showToast('تغییرات ذخیره شد.', 'success');
                }
            }
            refreshCmsLists();
        };

        cmsPage.addEventListener('blur', e => {
            if ((e.target as HTMLElement).matches('.edit-exercise-input')) {
                saveExerciseEdit(e.target as HTMLInputElement);
            }
        }, true);

        cmsPage.addEventListener('keydown', e => {
            if ((e.target as HTMLElement).matches('.edit-exercise-input') && e.key === 'Enter') {
                saveExerciseEdit(e.target as HTMLInputElement);
            }
        });

        document.getElementById('add-supplement-btn')?.addEventListener('click', () => openSupplementModal());
        const supplementModal = document.getElementById('add-edit-supplement-modal');
        document.getElementById('close-supplement-modal-btn')?.addEventListener('click', () => closeModal(supplementModal));
        supplementModal?.addEventListener('click', e => { if((e.target as HTMLElement).id === 'add-edit-supplement-modal') closeModal(supplementModal); });

        const supplementForm = document.getElementById('supplement-form') as HTMLFormElement;
        supplementForm?.addEventListener('submit', e => {
            e.preventDefault();
            const formData = new FormData(supplementForm);
            const data = {
                name: formData.get('supName') as string,
                note: formData.get('supNote') as string,
                dosageOptions: (formData.get('supDosage') as string).split(',').map(s => s.trim()).filter(Boolean),
                timingOptions: (formData.get('supTiming') as string).split(',').map(s => s.trim()).filter(Boolean),
            };

            const originalCategory = formData.get('supCategory') as string;
            const selectedCategory = formData.get('supCategorySelect') as string;
            const index = parseInt(formData.get('supIndex') as string, 10);

            if (!data.name || !selectedCategory) {
                showToast('نام و دسته بندی مکمل الزامی است.', 'error');
                return;
            }

            const db = getSupplementsDB();
            if (!isNaN(index) && originalCategory) { // Editing
                if (originalCategory !== selectedCategory) {
                    db[originalCategory].splice(index, 1);
                    if (!db[selectedCategory]) db[selectedCategory] = [];
                    db[selectedCategory].push(data);
                } else {
                    db[selectedCategory][index] = data;
                }
            } else { // Adding
                 if (!db[selectedCategory]) db[selectedCategory] = [];
                 db[selectedCategory].push(data);
            }
            saveSupplementsDB(db);
            showToast('مکمل ذخیره شد.', 'success');
            refreshCmsLists();
            closeModal(supplementModal);
        });
    }

    // --- Communications Management ---
    if(communicationsPage) {
        const coachSelect = document.getElementById('conversation-coach-select') as HTMLSelectElement;
        const studentSelect = document.getElementById('conversation-student-select') as HTMLSelectElement;
        const chatContainer = document.getElementById('conversation-chat-container');

        const coaches = getUsers().filter((u:any) => u.role === 'coach' && u.coachStatus === 'verified');
        coachSelect.innerHTML = '<option value="">انتخاب مربی...</option>' + coaches.map(c => `<option value="${c.username}">${c.username}</option>`).join('');

        coachSelect.addEventListener('change', () => {
            const coachUsername = coachSelect.value;
            studentSelect.innerHTML = '<option value="">انتخاب شاگرد...</option>';
            studentSelect.disabled = true;
            if (chatContainer) chatContainer.innerHTML = '<p class="text-text-secondary">ابتدا یک مربی و سپس یک شاگرد را انتخاب کنید.</p>';

            if (coachUsername) {
                const allUsers = getUsers();
                const students = allUsers.filter(u => {
                    if (u.role !== 'user') return false;
                    const userData = getUserData(u.username);
                    return userData.step1?.coachName === coachUsername;
                });
                studentSelect.innerHTML += students.map(s => `<option value="${s.username}">${s.step1?.clientName || s.username}</option>`).join('');
                studentSelect.disabled = false;
            }
        });

        studentSelect.addEventListener('change', () => {
            const studentUsername = studentSelect.value;
            if (!chatContainer) return;

            if (studentUsername) {
                const userData = getUserData(studentUsername);
                const chatHistory = userData.chatHistory || [];
                chatContainer.innerHTML = chatHistory.length > 0 ? chatHistory.map((msg: any) => `
                    <div class="message ${msg.sender === 'coach' ? 'coach-message' : 'user-message'}">
                        <p class="font-bold text-xs">${msg.sender === 'user' ? (userData.step1?.clientName || studentUsername) : 'مربی'}</p>
                        ${sanitizeHTML(msg.message)}
                        <p class="text-xs text-right mt-1 opacity-60">${timeAgo(msg.timestamp)}</p>
                    </div>
                `).join('') : '<p class="text-text-secondary">گفتگویی یافت نشد.</p>';
            } else {
                chatContainer.innerHTML = '<p class="text-text-secondary">شاگردی را برای مشاهده گفتگو انتخاب کنید.</p>';
            }
        });
        
        const announcementForm = document.getElementById('announcement-form') as HTMLFormElement;
        announcementForm?.addEventListener('submit', e => {
            e.preventDefault();
            const title = (announcementForm.elements.namedItem('announcement-title') as HTMLInputElement).value;
            const message = (announcementForm.elements.namedItem('announcement-message') as HTMLTextAreaElement).value;
            const target = (announcementForm.elements.namedItem('announcement-target') as HTMLInputElement).value;
            
            if (!title || !message) {
                showToast('عنوان و پیام اطلاعیه الزامی است.', 'error');
                return;
            }
            
            addActivityLog(`ادمین اطلاعیه سراسری با عنوان "${title}" برای "${target}" ارسال کرد.`);
            showToast('اطلاعیه با موفقیت ارسال شد.', 'success');
            announcementForm.reset();
        });
    }
    
    // --- Site Settings ---
    const socialMediaForm = document.getElementById('social-media-form') as HTMLFormElement;
    if (socialMediaForm) {
        socialMediaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(socialMediaForm);
            const settings = getSiteSettings();
            
            settings.socialMedia.instagram = formData.get('instagram') as string;
            settings.socialMedia.telegram = formData.get('telegram') as string;
            settings.socialMedia.youtube = formData.get('youtube') as string;
            
            saveSiteSettings(settings);
            showToast('لینک‌های شبکه‌های اجتماعی با موفقیت ذخیره شد.', 'success');
            addActivityLog('ادمین لینک‌های شبکه‌های اجتماعی را به‌روزرسانی کرد.');
        });
    }

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

const renderExercisesCmsHtml = () => {
    const exerciseDB = getExercisesDB();
    return Object.entries(exerciseDB).map(([group, exercises]) => `
        <details class="bg-bg-tertiary rounded-lg overflow-hidden cms-group-details" data-group-name="${group}">
            <summary class="p-3 font-semibold cursor-pointer flex justify-between items-center">
                <span>${group}</span>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-text-secondary bg-bg-secondary px-2 py-1 rounded-md">${exercises.length} حرکت</span>
                    <i data-lucide="chevron-down" class="details-arrow transition-transform"></i>
                </div>
            </summary>
            <div class="p-3 border-t border-border-primary bg-bg-secondary">
                <ul class="space-y-2">
                    ${exercises.map(ex => `
                        <li class="flex justify-between items-center p-2 rounded-md hover:bg-bg-tertiary exercise-list-item" data-exercise-name="${ex}">
                            <span class="exercise-name-text font-medium">${ex}</span>
                            <div class="flex items-center gap-2">
                                <button class="secondary-button !p-1.5" data-action="edit-exercise" title="ویرایش"><i data-lucide="edit-3" class="w-4 h-4 pointer-events-none"></i></button>
                                <button class="secondary-button !p-1.5 text-red-accent" data-action="delete-exercise" title="حذف"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button>
                            </div>
                        </li>
                    `).join('')}
                </ul>
                <div class="mt-4 pt-3 border-t border-border-primary flex items-center gap-2">
                    <input type="text" class="add-exercise-input input-field flex-grow !text-sm" placeholder="نام حرکت جدید...">
                    <button class="primary-button !py-2" data-action="add-exercise">افزودن</button>
                </div>
            </div>
        </details>
    `).join('');
};

const renderSupplementsCmsHtml = () => {
    const supplementsDB = getSupplementsDB();
    return Object.entries(supplementsDB).map(([category, supplements]) => `
        <details class="bg-bg-tertiary rounded-lg overflow-hidden cms-group-details" data-group-name="${category}">
            <summary class="p-3 font-semibold cursor-pointer flex justify-between items-center">
                <span>${category}</span>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-text-secondary bg-bg-secondary px-2 py-1 rounded-md">${supplements.length} مکمل</span>
                    <i data-lucide="chevron-down" class="details-arrow transition-transform"></i>
                </div>
            </summary>
            <div class="p-3 border-t border-border-primary bg-bg-secondary grid grid-cols-1 md:grid-cols-2 gap-3">
                ${supplements.map((sup, index) => `
                    <div class="border border-border-primary rounded-lg p-3 supplement-list-item" data-sup-category="${category}" data-sup-index="${index}">
                        <div class="flex justify-between items-start">
                            <h5 class="font-bold">${sup.name}</h5>
                            <div class="flex items-center gap-2">
                                <button class="secondary-button !p-1.5" data-action="edit-supplement" title="ویرایش"><i data-lucide="edit-3" class="w-4 h-4 pointer-events-none"></i></button>
                                <button class="secondary-button !p-1.5 text-red-accent" data-action="delete-supplement" title="حذف"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button>
                            </div>
                        </div>
                        <p class="text-xs text-text-secondary mt-1">${sup.note}</p>
                        <div class="mt-2 text-xs space-y-1">
                            <p><strong class="font-semibold">دوزها:</strong> ${sup.dosageOptions.join('، ')}</p>
                            <p><strong class="font-semibold">زمان‌ها:</strong> ${sup.timingOptions.join('، ')}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </details>
    `).join('');
};

const openSupplementModal = (data: any | null = null, category: string | null = null, index: number | null = null) => {
    const modal = document.getElementById('add-edit-supplement-modal');
    const form = document.getElementById('supplement-form') as HTMLFormElement;
    const titleEl = document.getElementById('supplement-modal-title');
    const categorySelect = document.getElementById('supCategorySelect') as HTMLSelectElement;

    if (!modal || !form || !titleEl || !categorySelect) return;

    form.reset();
    
    // Populate category select
    const categories = Object.keys(getSupplementsDB());
    categorySelect.innerHTML = `<option value="">انتخاب دسته بندی...</option>` + categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

    if (data) {
        titleEl.textContent = 'ویرایش مکمل';
        (form.elements.namedItem('supCategory') as HTMLInputElement).value = category || '';
        (form.elements.namedItem('supIndex') as HTMLInputElement).value = index !== null ? String(index) : '';
        (form.elements.namedItem('supName') as HTMLInputElement).value = data.name;
        (form.elements.namedItem('supNote') as HTMLTextAreaElement).value = data.note;
        (form.elements.namedItem('supDosage') as HTMLTextAreaElement).value = data.dosageOptions.join(', ');
        (form.elements.namedItem('supTiming') as HTMLTextAreaElement).value = data.timingOptions.join(', ');
        categorySelect.value = category || '';
    } else {
        titleEl.textContent = 'افزودن مکمل جدید';
        (form.elements.namedItem('supIndex') as HTMLInputElement).value = '';
    }
    openModal(modal);
};

export function renderAdminDashboard() {
    const { allUsersHtml, coachesHtml } = renderUserRowsHtml();
    const activityLog = getActivityLog();
    const transactions = getAllTransactions();
    const users = getUsers();
    const coaches = users.filter((u: any) => u.role === 'coach');
    const verifiedCoaches = coaches.filter((c: any) => c.coachStatus === 'verified').length;
    const coachActivationRate = coaches.length > 0 ? Math.round((verifiedCoaches / coaches.length) * 100) : 0;
    const circumference = 2 * Math.PI * 25;
    const dashoffset = circumference * (1 - coachActivationRate / 100);
    const settings = getSiteSettings();

    const kpiCards = [
        { title: 'ثبت‌نام جدید (۳۰ روز)', value: '۴۲', change: '+15%', changeColor: 'text-green-500', icon: 'fa-user-plus', color: 'admin-accent-green' },
        { title: 'درآمد ماهانه', value: formatPrice(3000000), change: '+8.2%', changeColor: 'text-green-500', icon: 'fa-dollar-sign', color: 'admin-accent-pink' },
        { title: 'برنامه‌های ساخته شده', value: '۱۲۲', change: '+20', changeColor: 'text-green-500', icon: 'fa-file-signature', color: 'admin-accent-orange' }
    ];

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
                    { target: 'admin-communications-page', icon: 'fa-bullhorn', label: 'ارتباطات' },
                    { target: 'admin-analytics-page', icon: 'fa-chart-line', label: 'تحلیل عملکرد' },
                    { target: 'admin-content-page', icon: 'fa-database', label: 'مدیریت محتوا' },
                    { target: 'admin-finance-page', icon: 'fa-chart-pie', label: 'مالی و بازاریابی' },
                    { target: 'admin-settings-page', icon: 'fa-cog', label: 'تنظیمات سایت' },
                    { target: 'admin-audit-log-page', icon: 'fa-clipboard-list', label: 'گزارش فعالیت‌ها' },
                ].map(item => `
                    <a href="#" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-md" data-target="${item.target}">
                        <i class="fas ${item.icon} w-6 text-center"></i><span>${item.label}</span>
                    </a>
                `).join('')}
            </nav>
            <div class="space-y-2">
                <button id="go-to-home-btn" class="secondary-button w-full !justify-start !gap-3 !px-4 !py-3"><i data-lucide="home" class="w-6"></i><span>صفحه اصلی</span></button>
                <button id="theme-toggle-btn-dashboard" class="secondary-button w-full !justify-start !gap-3 !px-4 !py-3"><i data-lucide="sun" class="w-6"></i><span>تغییر پوسته</span></button>
                <button id="logout-btn" class="secondary-button w-full !justify-start !gap-3 !px-4 !py-3"><i data-lucide="log-out" class="w-6"></i><span>خروج</span></button>
            </div>
        </aside>
        <main class="flex-1 p-6 lg:p-8 overflow-y-auto bg-bg-primary">
            <!-- Dashboard Page -->
            <div id="admin-dashboard-page" class="page">
                <h2 class="text-3xl font-extrabold mb-6 text-text-primary">مرکز فرماندهی</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    ${kpiCards.map(kpi => `
                    <div class="admin-kpi-card">
                        <div class="icon-container" style="background-color: var(--${kpi.color}); color: white;"><i class="fas ${kpi.icon} fa-lg"></i></div>
                        <div>
                            <p class="text-sm text-text-secondary">${kpi.title}</p>
                            <p class="text-2xl font-bold text-text-primary">${kpi.value}</p>
                            <p class="text-xs font-semibold ${kpi.changeColor}">${kpi.change}</p>
                        </div>
                    </div>`).join('')}
                    <div class="admin-kpi-card">
                        <div class="gauge relative" style="width: 70px; height: 70px;">
                            <svg class="gauge-svg absolute inset-0" viewBox="0 0 60 60">
                                <circle class="gauge-track" r="25" cx="30" cy="30" stroke-width="8"></circle>
                                <circle class="gauge-value" r="25" cx="30" cy="30" stroke-width="8" style="stroke:var(--admin-accent-blue); stroke-dasharray: ${circumference}; stroke-dashoffset: ${dashoffset};"></circle>
                            </svg>
                            <div class="absolute inset-0 flex items-center justify-center font-bold text-lg">${coachActivationRate}%</div>
                        </div>
                        <div class="flex-grow">
                            <p class="text-sm text-text-secondary">نرخ تایید مربیان</p>
                            <p class="text-2xl font-bold text-text-primary">${verifiedCoaches} <span class="text-base font-normal">/ ${coaches.length}</span></p>
                            <p class="text-xs font-semibold text-text-secondary">مربیان تایید شده</p>
                        </div>
                    </div>
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
                           <thead><tr class="font-semibold"><th class="p-4">کاربر</th><th class="p-4">ایمیل</th><th class="p-4">نقش</th><th class="p-4">تاریخ عضویت</th><th class="p-4">وضعیت</th><th class="p-4">عملیات</th></tr></thead>
                           <tbody id="all-users-tbody">
                               ${allUsersHtml}
                           </tbody>
                        </table>
                     </div>
                 </div>
                 <div id="coaches-content" class="admin-tab-content hidden">
                    <div class="card overflow-hidden">
                       <table class="w-full text-sm text-right">
                          <thead><tr class="font-semibold"><th class="p-4">مربی</th><th class="p-4">شاگردان فعال</th><th class="p-4">تاریخ عضویت</th><th class="p-4">وضعیت</th><th class="p-4">عملیات</th></tr></thead>
                          <tbody id="coaches-tbody">
                              ${coachesHtml}
                          </tbody>
                       </table>
                    </div>
                 </div>
            </div>
            
             <!-- Communications Page -->
            <div id="admin-communications-page" class="page hidden">
                 <h2 class="text-3xl font-extrabold mb-6 text-text-primary">ارتباطات و اطلاعیه‌ها</h2>
                 <div class="bg-bg-tertiary p-1 rounded-lg flex items-center gap-1 mb-4">
                     <button class="admin-tab-button active-tab" data-target="conversation-review-content">بازبینی گفتگوها</button>
                     <button class="admin-tab-button" data-target="announcement-content">ارسال اطلاعیه</button>
                 </div>
                 <div id="conversation-review-content" class="admin-tab-content">
                    <div class="card p-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="md:col-span-1 space-y-3">
                                <h3 class="font-bold text-lg">بازبینی گفتگوها</h3>
                                <div>
                                    <label class="text-sm font-semibold mb-1 block">۱. انتخاب مربی</label>
                                    <select id="conversation-coach-select" class="input-field w-full"></select>
                                </div>
                                 <div>
                                    <label class="text-sm font-semibold mb-1 block">۲. انتخاب شاگرد</label>
                                    <select id="conversation-student-select" class="input-field w-full" disabled></select>
                                </div>
                            </div>
                            <div class="md:col-span-2">
                                <div id="conversation-chat-container" class="h-96 bg-bg-tertiary rounded-lg p-4 overflow-y-auto flex flex-col gap-3">
                                    <p class="text-text-secondary m-auto">ابتدا یک مربی و سپس یک شاگرد را انتخاب کنید.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
                 <div id="announcement-content" class="admin-tab-content hidden">
                     <div class="card p-4 max-w-2xl mx-auto">
                         <h3 class="font-bold text-lg mb-4">ارسال اطلاعیه سراسری</h3>
                         <form id="announcement-form" class="space-y-4">
                             <div class="input-group">
                                <input name="announcement-title" type="text" class="input-field w-full" placeholder=" " required>
                                <label class="input-label">عنوان اطلاعیه</label>
                            </div>
                             <div class="input-group">
                                <textarea name="announcement-message" class="input-field w-full min-h-[120px]" placeholder=" " required></textarea>
                                <label class="input-label">متن پیام</label>
                            </div>
                            <div>
                                <p class="text-sm font-semibold mb-2">ارسال برای:</p>
                                <div class="flex items-center gap-4">
                                    <label><input type="radio" name="announcement-target" value="all" checked> همه</label>
                                    <label><input type="radio" name="announcement-target" value="users"> فقط کاربران</label>
                                    <label><input type="radio" name="announcement-target" value="coaches"> فقط مربیان</label>
                                </div>
                            </div>
                            <button type="submit" class="primary-button w-full">ارسال اطلاعیه</button>
                         </form>
                    </div>
                 </div>
            </div>

            <!-- Analytics Page -->
            <div id="admin-analytics-page" class="page hidden">
                <!-- Content will be rendered by JS -->
            </div>

            <!-- Content Management Page -->
            <div id="admin-content-page" class="page hidden">
                 <h2 class="text-3xl font-extrabold mb-6">مدیریت محتوای پلتفرم</h2>
                 <div class="bg-bg-tertiary p-1 rounded-lg flex items-center gap-1 mb-4">
                     <button class="admin-tab-button active-tab" data-target="exercises-content-admin">تمرینات</button>
                     <button class="admin-tab-button" data-target="supplements-content-admin">مکمل‌ها</button>
                 </div>
                 <div id="exercises-content-admin" class="admin-tab-content">
                    <div class="card p-4">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <h3 class="font-bold text-lg">کتابخانه تمرینات</h3>
                                <p class="text-text-secondary text-sm">حرکات تمرینی موجود در سیستم را مدیریت کنید.</p>
                            </div>
                            <div class="relative w-64">
                                <i data-lucide="search" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"></i>
                                <input type="search" id="exercise-search-input" class="input-field w-full !pr-10 !text-sm" placeholder="جستجوی حرکت...">
                            </div>
                        </div>
                        <div id="exercise-list-container" class="space-y-2">
                           ${renderExercisesCmsHtml()}
                        </div>
                    </div>
                 </div>
                 <div id="supplements-content-admin" class="admin-tab-content hidden">
                     <div class="card p-4">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <h3 class="font-bold text-lg">کتابخانه مکمل‌ها</h3>
                                <p class="text-text-secondary text-sm">مکمل‌های موجود در سیستم را مدیریت کنید.</p>
                            </div>
                            <button id="add-supplement-btn" data-action="add-supplement-modal" class="primary-button flex items-center gap-2"><i data-lucide="plus"></i> افزودن مکمل</button>
                        </div>
                        <div id="supplement-list-container" class="space-y-2">
                           ${renderSupplementsCmsHtml()}
                        </div>
                    </div>
                 </div>
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
                    ${renderPlansAdminHtml()}
                </div>
                <div id="discounts-content" class="admin-tab-content hidden">
                     <div class="card p-4">
                       ${renderDiscountsAdminHtml()}
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
                    ${renderCommissionsHtml()}
                </div>
            </div>

            <!-- Site Settings Page -->
            <div id="admin-settings-page" class="page hidden">
                <h2 class="text-3xl font-extrabold mb-6 text-text-primary">تنظیمات سایت</h2>
                <div class="card p-6 max-w-2xl mx-auto">
                    <h3 class="font-bold text-lg mb-4">مدیریت شبکه‌های اجتماعی</h3>
                    <p class="text-text-secondary text-sm mb-6">لینک‌های شبکه‌های اجتماعی که در فوتر صفحه اصلی نمایش داده می‌شوند را در اینجا مدیریت کنید. برای مخفی کردن یک آیکون، فیلد آن را خالی بگذارید.</p>
                    <form id="social-media-form" class="space-y-4">
                        <div class="input-group">
                            <input id="instagram-link" name="instagram" type="url" class="input-field w-full" placeholder=" " value="${settings.socialMedia.instagram || ''}">
                            <label for="instagram-link" class="input-label">لینک اینستاگرام</label>
                        </div>
                        <div class="input-group">
                            <input id="telegram-link" name="telegram" type="url" class="input-field w-full" placeholder=" " value="${settings.socialMedia.telegram || ''}">
                            <label for="telegram-link" class="input-label">لینک تلگرام</label>
                        </div>
                        <div class="input-group">
                            <input id="youtube-link" name="youtube" type="url" class="input-field w-full" placeholder=" " value="${settings.socialMedia.youtube || ''}">
                            <label for="youtube-link" class="input-label">لینک یوتیوب</label>
                        </div>
                        <div class="pt-2">
                            <button type="submit" class="primary-button w-full">ذخیره تغییرات</button>
                        </div>
                    </form>
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
    
    <!-- Modals -->
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

    <div id="edit-user-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-md transform scale-95 transition-transform duration-300 relative">
            <button id="close-edit-user-modal-btn" class="absolute top-3 left-3 secondary-button !p-2 rounded-full z-10"><i data-lucide="x"></i></button>
            <div class="p-8">
                <h2 class="font-bold text-2xl text-center mb-6">ویرایش کاربر</h2>
                <form id="edit-user-form" class="space-y-4" novalidate>
                    <input type="hidden" id="edit-original-username" name="originalUsername">
                    <div class="input-group">
                        <input id="edit-username" name="username" type="text" class="input-field w-full" placeholder=" " required readonly>
                        <label for="edit-username" class="input-label">نام کاربری (غیرقابل تغییر)</label>
                    </div>
                    <div class="input-group">
                        <input id="edit-email" name="email" type="email" class="input-field w-full" placeholder=" " required>
                        <label for="edit-email" class="input-label">ایمیل</label>
                    </div>
                    <div class="input-group">
                        <input id="edit-password" name="password" type="password" class="input-field w-full" placeholder=" ">
                        <label for="edit-password" class="input-label">رمز عبور جدید (اختیاری)</label>
                    </div>
                    <div>
                        <label for="edit-role" class="block text-sm font-medium text-text-secondary mb-1">نقش</label>
                        <select id="edit-role" name="role" class="input-field w-full">
                            <option value="user">کاربر</option>
                            <option value="coach">مربی</option>
                        </select>
                    </div>
                    <div class="pt-2">
                        <button type="submit" class="primary-button w-full !py-3 !text-base">ذخیره تغییرات</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="add-edit-plan-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-lg transform scale-95 transition-transform duration-300 relative">
             <button id="close-plan-modal-btn" class="absolute top-3 left-3 secondary-button !p-2 rounded-full z-10"><i data-lucide="x"></i></button>
            <div class="p-8">
                <h2 id="plan-modal-title" class="font-bold text-2xl text-center mb-6"></h2>
                <form id="plan-form" class="space-y-4" novalidate>
                    <input type="hidden" name="planId">
                    <div class="input-group">
                        <input name="planName" type="text" class="input-field w-full" placeholder=" " required>
                        <label class="input-label">نام پلن</label>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="input-group sm:col-span-1">
                            <input name="planEmoji" type="text" class="input-field w-full text-center !p-2" placeholder=" " maxlength="2">
                            <label class="input-label">ایموجی</label>
                        </div>
                        <div class="sm:col-span-2">
                            <label for="plan-color-input" class="block text-sm font-medium text-text-secondary mb-1">رنگ پلن</label>
                            <input id="plan-color-input" name="planColor" type="color" class="input-field w-full !p-1" value="#3b82f6">
                        </div>
                    </div>
                    <div class="input-group">
                        <input name="planDescription" type="text" class="input-field w-full" placeholder=" " required>
                        <label class="input-label">توضیحات</label>
                    </div>
                    <div class="input-group">
                        <input name="planPrice" type="number" class="input-field w-full" placeholder=" " required>
                        <label class="input-label">قیمت (تومان)</label>
                    </div>
                     <div class="input-group">
                        <textarea name="planFeatures" class="input-field w-full min-h-[100px]" placeholder=" "></textarea>
                        <label class="input-label">ویژگی‌ها (هر ویژگی در یک خط)</label>
                    </div>
                    <div class="pt-2">
                        <button type="submit" class="primary-button w-full !py-3 !text-base">ذخیره پلن</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <div id="view-activity-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-4xl transform scale-95 transition-transform duration-300 relative max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-border-primary flex-shrink-0">
                <h2 id="view-activity-modal-title" class="font-bold text-xl"></h2>
                <button id="close-view-activity-modal-btn" class="secondary-button !p-2 rounded-full z-10"><i data-lucide="x"></i></button>
            </div>
            <div id="view-activity-modal-body" class="p-6 overflow-y-auto">
                <!-- Content injected by JS -->
            </div>
        </div>
    </div>

    <div id="add-edit-supplement-modal" class="modal fixed inset-0 bg-black/60 z-[101] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-lg transform scale-95 transition-transform duration-300 relative">
             <button id="close-supplement-modal-btn" class="absolute top-3 left-3 secondary-button !p-2 rounded-full z-10"><i data-lucide="x"></i></button>
            <div class="p-8">
                <h2 id="supplement-modal-title" class="font-bold text-2xl text-center mb-6"></h2>
                <form id="supplement-form" class="space-y-4" novalidate>
                    <input type="hidden" name="supCategory">
                    <input type="hidden" name="supIndex">
                    <div class="input-group">
                        <input name="supName" type="text" class="input-field w-full" placeholder=" " required>
                        <label class="input-label">نام مکمل</label>
                    </div>
                    <div>
                        <label for="supCategorySelect" class="block text-sm font-medium text-text-secondary mb-1">دسته بندی</label>
                        <select id="supCategorySelect" name="supCategorySelect" class="input-field w-full">
                        </select>
                    </div>
                    <div class="input-group">
                        <textarea name="supNote" class="input-field w-full min-h-[80px]" placeholder=" "></textarea>
                        <label class="input-label">توضیحات کوتاه</label>
                    </div>
                     <div class="input-group">
                        <textarea name="supDosage" class="input-field w-full" placeholder=" "></textarea>
                        <label class="input-label">دوزها (با کاما جدا کنید)</label>
                    </div>
                     <div class="input-group">
                        <textarea name="supTiming" class="input-field w-full" placeholder=" "></textarea>
                        <label class="input-label">زمان‌های مصرف (با کاما جدا کنید)</label>
                    </div>
                    <div class="pt-2">
                        <button type="submit" class="primary-button w-full !py-3 !text-base">ذخیره مکمل</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <div id="add-edit-discount-modal" class="modal fixed inset-0 bg-black/60 z-[101] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-md transform scale-95 transition-transform duration-300 relative">
            <button id="close-discount-modal-btn" class="absolute top-3 left-3 secondary-button !p-2 rounded-full z-10"><i data-lucide="x"></i></button>
            <div class="p-8">
                <h2 id="discount-modal-title" class="font-bold text-2xl text-center mb-6"></h2>
                <form id="discount-form" class="space-y-4" novalidate>
                    <input type="hidden" name="originalCode">
                    <div class="input-group">
                        <input name="discountCode" type="text" class="input-field w-full" placeholder=" " required>
                        <label class="input-label">کد تخفیف</label>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-1">نوع تخفیف</label>
                        <select name="discountType" class="input-field w-full">
                            <option value="percentage">درصدی (%)</option>
                            <option value="fixed">مبلغ ثابت (تومان)</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <input name="discountValue" type="number" class="input-field w-full" placeholder=" " required>
                        <label class="input-label">مقدار</label>
                    </div>
                    <div class="pt-2">
                        <button type="submit" class="primary-button w-full !py-3 !text-base">ذخیره</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
}

const renderStarRating = (rating: number) => {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star text-yellow-400"></i>';
        } else if (i - rating < 1) {
            stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
        } else {
            stars += '<i class="far fa-star text-yellow-400"></i>';
        }
    }
    return `<div class="flex items-center gap-1">${stars} <span class="text-xs text-text-secondary ml-1">(${rating.toFixed(1)})</span></div>`;
};

const renderProgressBar = (value: number, colorClass: string) => {
    return `
        <div class="w-20 bg-bg-tertiary rounded-full h-2">
            <div class="${colorClass} h-2 rounded-full" style="width: ${value}%"></div>
        </div>
        <span class="font-semibold text-sm">${value}%</span>
    `;
};

const calculateAvgWeightChange = (coachUsername: string) => {
    const students = getUsers().filter((u: any) => u.role === 'user' && getUserData(u.username).step1?.coachName === coachUsername);
    if (students.length === 0) return { change: 0, trend: 'neutral' };

    let totalChange = 0;
    let studentsWithHistory = 0;

    students.forEach((student: any) => {
        const userData = getUserData(student.username);
        if (userData.weightHistory && userData.weightHistory.length >= 2) {
            const firstWeight = userData.weightHistory[0].weight;
            const lastWeight = userData.weightHistory[userData.weightHistory.length - 1].weight;
            totalChange += (lastWeight - firstWeight);
            studentsWithHistory++;
        }
    });

    if (studentsWithHistory === 0) return { change: 0, trend: 'neutral' };

    const avgChange = totalChange / studentsWithHistory;
    const trend = avgChange > 0.1 ? 'up' : avgChange < -0.1 ? 'down' : 'neutral';

    return { change: parseFloat(avgChange.toFixed(1)), trend };
};

const renderAnalyticsPage = () => {
    const pageContainer = document.getElementById('admin-analytics-page');
    if (!pageContainer) return;

    const coaches = getUsers().filter((u: any) => u.role === 'coach' && u.coachStatus === 'verified').map((c: any) => ({
        ...c,
        ...getUserData(c.username)
    }));
    
    if (coaches.length === 0) {
        pageContainer.innerHTML = '<p class="text-text-secondary text-center p-8">هیچ مربی فعالی برای نمایش آمار وجود ندارد.</p>';
        return;
    }

    // --- KPI Calculations ---
    const totalRetention = coaches.reduce((sum, c) => sum + (c.performance?.retentionRate || 0), 0);
    const avgRetention = totalRetention / coaches.length;
    const totalNps = coaches.reduce((sum, c) => sum + (c.performance?.nps || 0), 0);
    const avgNps = totalNps / coaches.length;
    
    // --- Sorting Logic ---
    coaches.sort((a, b) => {
        let valA, valB;
        if (coachAnalyticsSort.key === 'progress') {
            valA = calculateAvgWeightChange(a.username).change;
            valB = calculateAvgWeightChange(b.username).change;
        } else {
            valA = a.performance?.[coachAnalyticsSort.key] || 0;
            valB = b.performance?.[coachAnalyticsSort.key] || 0;
        }
        
        if (coachAnalyticsSort.order === 'asc') {
            return valA - valB;
        }
        return valB - valA;
    });

    const headers = [
        { key: 'coach', label: 'مربی' },
        { key: 'retentionRate', label: 'نرخ حفظ' },
        { key: 'progress', label: 'پیشرفت شاگردان' },
        { key: 'avgProgramDeliveryHours', label: 'زمان تحویل برنامه' },
        { key: 'nps', label: 'شاخص NPS' },
        { key: 'rating', label: 'امتیاز' },
    ];
    
    const kpiCards = [
        { title: 'میانگین نرخ حفظ', value: `${avgRetention.toFixed(1)}%`, icon: 'fa-users', color: 'admin-accent-blue' },
        { title: 'میانگین امتیاز', value: (coaches.reduce((sum, c) => sum + (c.performance?.rating || 0), 0) / coaches.length).toFixed(1), icon: 'fa-star', color: 'admin-accent-yellow' },
        { title: 'میانگین NPS', value: `${avgNps.toFixed(1)}`, icon: 'fa-smile', color: 'admin-accent-green' }
    ];

    pageContainer.innerHTML = `
        <h2 class="text-3xl font-extrabold mb-6 text-text-primary">تحلیل عملکرد مربیان</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            ${kpiCards.map(kpi => `
                <div class="admin-kpi-card">
                    <div class="icon-container" style="background-color: var(--${kpi.color}); color: white;"><i class="fas ${kpi.icon} fa-lg"></i></div>
                    <div>
                        <p class="text-sm text-text-secondary">${kpi.title}</p>
                        <p class="text-2xl font-bold text-text-primary">${kpi.value}</p>
                    </div>
                </div>`).join('')}
        </div>
        <div class="card overflow-hidden">
            <table class="w-full text-sm text-right">
                <thead>
                    <tr class="font-semibold">
                        ${headers.map(h => `
                            <th class="p-4 cursor-pointer sortable-header" data-sort-key="${h.key}">
                                <div class="flex items-center gap-2">
                                    ${h.label}
                                    ${coachAnalyticsSort.key === h.key ? `<i data-lucide="${coachAnalyticsSort.order === 'asc' ? 'arrow-up' : 'arrow-down'}" class="w-4 h-4"></i>` : ''}
                                </div>
                            </th>
                        `).join('')}
                        <th class="p-4">جزئیات</th>
                    </tr>
                </thead>
                <tbody id="analytics-table-body">
                    ${coaches.map(coach => {
                        const performance = coach.performance || {};
                        const progress = calculateAvgWeightChange(coach.username);
                        const progressColor = progress.trend === 'up' ? 'text-red-500' : progress.trend === 'down' ? 'text-green-500' : 'text-text-secondary';
                        const progressIcon = progress.trend === 'up' ? 'trending-up' : progress.trend === 'down' ? 'trending-down' : 'minus';

                        return `
                        <tr class="hover:bg-bg-tertiary transition-colors">
                            <td class="p-4">
                                <div class="flex items-center gap-3">
                                    <img src="${coach.profile?.avatar || `https://i.pravatar.cc/150?u=${coach.username}`}" class="w-10 h-10 rounded-full object-cover" alt="${coach.step1?.clientName}">
                                    <div>
                                        <p class="font-semibold">${coach.step1?.clientName || coach.username}</p>
                                        <p class="text-xs text-text-secondary">${coach.students || 0} شاگرد</p>
                                    </div>
                                </div>
                            </td>
                            <td class="p-4"><div class="flex items-center gap-2">${renderProgressBar(performance.retentionRate || 0, 'bg-admin-accent-blue')}</div></td>
                            <td class="p-4">
                                <div class="flex items-center gap-2 font-semibold ${progressColor}">
                                    <i data-lucide="${progressIcon}" class="w-4 h-4"></i>
                                    <span>${progress.change > 0 ? '+' : ''}${progress.change} kg</span>
                                </div>
                            </td>
                            <td class="p-4">${performance.avgProgramDeliveryHours || 'N/A'} ساعت</td>
                            <td class="p-4"><div class="flex items-center gap-2">${renderProgressBar(performance.nps || 0, 'bg-admin-accent-green')}</div></td>
                            <td class="p-4">${renderStarRating(performance.rating || 0)}</td>
                            <td class="p-4">
                                <button data-action="view-activity" data-username="${coach.username}" title="مشاهده فعالیت" class="secondary-button !p-2"><i data-lucide="eye" class="w-4 h-4 pointer-events-none"></i></button>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    window.lucide?.createIcons();
};
