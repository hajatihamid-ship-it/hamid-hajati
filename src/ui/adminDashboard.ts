import { getUsers, getDiscounts, getActivityLog, saveUsers, saveUserData, addActivityLog, getUserData, getStorePlans, saveStorePlans, getExercisesDB, saveExercisesDB, getSupplementsDB, saveSupplementsDB, saveDiscounts, getSiteSettings, saveSiteSettings } from '../services/storage';
import { formatPrice, timeAgo } from '../utils/helpers';
import { openModal, closeModal, showToast } from '../utils/dom';
import { getCurrentUser } from '../state';
import { sanitizeHTML } from '../utils/dom';

let activityModalChartInstance: any = null;
let coachAnalyticsSort = { key: 'rating', order: 'desc' };

// FIX: Added missing getStatusBadge function
const getStatusBadge = (status: string, role: string, coachStatus: string | null): string => {
    if (role === 'coach') {
        switch (coachStatus) {
            case 'verified':
                return '<span class="status-badge verified">تایید شده</span>';
            case 'pending':
                return '<span class="status-badge pending">در انتظار تایید</span>';
            case 'revoked':
                return '<span class="status-badge revoked">لغو همکاری</span>';
            default:
                return `<span class="status-badge unknown">${coachStatus || 'نامشخص'}</span>`;
        }
    }

    switch (status) {
        case 'active':
            return '<span class="status-badge verified">فعال</span>';
        case 'suspended':
            return '<span class="status-badge revoked">مسدود</span>';
        default:
            return `<span class="status-badge unknown">${status}</span>`;
    }
};

const renderAnalyticsPage = () => {
    const pageContainer = document.getElementById('admin-analytics-page');
    if (!pageContainer) return;

    const coaches = getUsers().filter((u: any) => u.role === 'coach' && u.coachStatus === 'verified').map((c: any) => {
        const data = getUserData(c.username);
        return {
            username: c.username,
            name: data.step1?.clientName || c.username,
            students: data.students || 0,
            rating: data.performance?.rating || 0,
            nps: data.performance?.nps || 0,
            retentionRate: data.performance?.retentionRate || 0,
            avgProgramDeliveryHours: data.performance?.avgProgramDeliveryHours || 0
        };
    });

    coaches.sort((a, b) => {
        const key = coachAnalyticsSort.key as keyof typeof a;
        if (a[key] < b[key]) return coachAnalyticsSort.order === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return coachAnalyticsSort.order === 'asc' ? 1 : -1;
        return 0;
    });

    const renderSortIcon = (key: string) => {
        if (coachAnalyticsSort.key !== key) return `<i data-lucide="unfold-vertical" class="w-4 h-4 ml-1 text-text-secondary"></i>`;
        return coachAnalyticsSort.order === 'asc'
            ? `<i data-lucide="arrow-up" class="w-4 h-4 ml-1 text-accent"></i>`
            : `<i data-lucide="arrow-down" class="w-4 h-4 ml-1 text-accent"></i>`;
    };

    pageContainer.innerHTML = `
        <div class="card overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-right min-w-[700px]">
                    <thead>
                        <tr class="font-semibold">
                            <th class="p-4">نام مربی</th>
                            <th class="p-4 sortable-header cursor-pointer" data-sort-key="students">تعداد شاگردان ${renderSortIcon('students')}</th>
                            <th class="p-4 sortable-header cursor-pointer" data-sort-key="rating">امتیاز (از ۵) ${renderSortIcon('rating')}</th>
                            <th class="p-4 sortable-header cursor-pointer" data-sort-key="nps">شاخص NPS ${renderSortIcon('nps')}</th>
                            <th class="p-4 sortable-header cursor-pointer" data-sort-key="retentionRate">نرخ نگهداری (%) ${renderSortIcon('retentionRate')}</th>
                            <th class="p-4 sortable-header cursor-pointer" data-sort-key="avgProgramDeliveryHours">زمان تحویل برنامه (ساعت) ${renderSortIcon('avgProgramDeliveryHours')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${coaches.map(coach => `
                            <tr class="hover:bg-bg-tertiary transition-colors">
                                <td class="p-4 font-semibold">${coach.name}</td>
                                <td class="p-4 text-center">${coach.students}</td>
                                <td class="p-4 text-center">${coach.rating.toFixed(1)}</td>
                                <td class="p-4 text-center">${coach.nps}</td>
                                <td class="p-4 text-center">${coach.retentionRate}%</td>
                                <td class="p-4 text-center">${coach.avgProgramDeliveryHours}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    window.lucide?.createIcons();
};

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

        const plans = getStorePlans();
        const revenueData = {
            'basic-1m': [200000, 300000, 250000, 400000, 350000, 500000],
            'full-3m': [500000, 800000, 600000, 1000000, 900000, 1200000],
            'pro-6m': [400000, 600000, 500000, 800000, 700000, 1000000],
            'nutrition-1m': [100000, 200000, 150000, 300000, 250000, 300000],
        };

        const datasets = plans.map((plan: any) => ({
            label: plan.planName,
            data: revenueData[plan.planId as keyof typeof revenueData] || [],
            backgroundColor: plan.color,
        })).filter((ds: any) => ds.data.length > 0);

        new window.Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
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
                    backgroundColor: ['#3b82f6', '#ec4899', '#f97316', '#10b981'],
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

    const programHistory = userData.programHistory || [];
    if (programHistory.length === 0 && userData.step2) {
        programHistory.push({
            date: userData.joinDate || new Date().toISOString(),
            step2: userData.step2,
            supplements: userData.supplements || []
        });
    }

    const chatHistory = (userData.chatHistory || []).slice().reverse();

    body.innerHTML = `
        <div class="space-y-6">
            <div>
                <h4 class="font-bold text-lg mb-2 text-accent border-b-2 border-accent/30 pb-2">تاریخچه وزن</h4>
                <div class="h-64 card p-4"><canvas id="activity-modal-weight-chart"></canvas></div>
            </div>
            <div>
                <h4 class="font-bold text-lg mb-2 text-accent border-b-2 border-accent/30 pb-2">تاریخچه برنامه‌ها</h4>
                <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
                    ${programHistory.length > 0 ? programHistory.map((p: any) => `
                        <details class="day-card card !shadow-none !border mb-2" open>
                            <summary class="font-bold cursor-pointer flex justify-between items-center p-3">
                                <span>برنامه تاریخ: ${new Date(p.date).toLocaleDateString('fa-IR')}</span>
                                <i data-lucide="chevron-down" class="details-arrow"></i>
                            </summary>
                            <div class="p-3 border-t border-border-primary text-sm">
                                ${(p.step2?.days || []).map((day: any) => `
                                    <div class="mb-2">
                                        <p class="font-semibold">${day.name}</p>
                                        <p class="text-xs text-text-secondary">${day.exercises.map((e:any) => e.name).join(' - ')}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </details>
                    `).join('') : '<p class="text-text-secondary text-center p-4">هنوز برنامه‌ای برای این کاربر ثبت نشده است.</p>'}
                </div>
            </div>
            <div>
                <h4 class="font-bold text-lg mb-2 text-accent border-b-2 border-accent/30 pb-2">تاریخچه گفتگو</h4>
                <div class="space-y-2 text-sm max-h-96 overflow-y-auto pr-2 bg-bg-tertiary p-3 rounded-lg">
                    ${chatHistory.length > 0 ? chatHistory.map((msg: any) => `
                        <div class="p-2 rounded-lg ${msg.sender === 'user' ? 'bg-bg-secondary' : 'bg-green-500/10'}">
                            <p class="font-semibold text-xs">${msg.sender === 'user' ? username : 'مربی'} - <span class="text-text-secondary">${timeAgo(msg.timestamp)}</span></p>
                            <p>${sanitizeHTML(msg.message)}</p>
                        </div>
                    `).join('') : '<p class="text-text-secondary text-center p-4">گفتگویی یافت نشد.</p>'}
                </div>
            </div>
        </div>
    `;

    openModal(modal);
    window.lucide?.createIcons();

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
                    pointRadius: 2,
                    backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                    fill: true,
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
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-right min-w-[600px]">
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
        </div>
    `;
};

// FIX: Added missing renderAdminDashboard function
export function renderAdminDashboard() {
    const name = "Admin";
    const navItems = [
        { page: 'dashboard', icon: 'layout-dashboard', label: 'داشبورد' },
        { page: 'users', icon: 'users', label: 'مدیریت کاربران' },
        { page: 'coaches', icon: 'award', label: 'مدیریت مربیان' },
        { page: 'store', icon: 'shopping-cart', label: 'فروشگاه' },
        { page: 'analytics', icon: 'activity', label: 'آنالیتیکس' },
        { page: 'commissions', icon: 'dollar-sign', label: 'کمیسیون‌ها' },
        { page: 'cms', icon: 'database', label: 'مدیریت محتوا' },
        { page: 'settings', icon: 'settings', label: 'تنظیمات سایت' },
        { page: 'activity-log', icon: 'history', label: 'گزارش فعالیت' }
    ];

    return `
    <div class="admin-dashboard-container flex h-screen bg-bg-primary transition-opacity duration-500 opacity-0">
        <aside class="w-64 bg-bg-secondary p-4 flex flex-col flex-shrink-0 border-l border-border-primary">
             <div class="flex items-center gap-3 p-2 mb-6">
                <i data-lucide="shield-check" class="w-8 h-8 text-accent"></i>
                <h1 class="text-xl font-bold">Admin Panel</h1>
            </div>
            <nav class="space-y-2 flex-grow">
                ${navItems.map(item => `
                    <button class="nav-link w-full flex items-center gap-3 py-3 rounded-lg text-md" data-page="${item.page}">
                        <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                        <span>${item.label}</span>
                    </button>
                `).join('')}
            </nav>
            <div class="space-y-2">
                 <button id="go-to-home-btn" class="secondary-button w-full !justify-start !gap-3 !px-4 !py-3"><i data-lucide="home" class="w-5 h-5"></i><span>صفحه اصلی</span></button>
                 <div id="theme-switcher" class="bg-bg-tertiary rounded-xl p-1 relative flex items-center justify-around">
                    <div id="theme-glider"></div>
                    <button data-theme="lemon" class="theme-option-btn flex-1 py-2 px-4 z-10 rounded-lg">روشن</button>
                    <button data-theme="dark" class="theme-option-btn flex-1 py-2 px-4 z-10 rounded-lg">تاریک</button>
                </div>
                <button id="logout-btn" class="secondary-button w-full !justify-start !gap-3 !px-4 !py-3"><i data-lucide="log-out" class="w-5 h-5"></i><span>خروج</span></button>
            </div>
        </aside>

        <main class="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div id="impersonation-banner-placeholder"></div>
            <header class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 id="admin-page-title" class="text-3xl font-bold">داشبورد</h1>
                </div>
                 <div class="flex items-center gap-3 bg-bg-secondary p-2 rounded-lg">
                    <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg text-bg-secondary" style="background-color: var(--accent);">
                        ${name.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-bold text-sm">${name}</p>
                        <p class="text-xs text-text-secondary">ادمین</p>
                    </div>
                </div>
            </header>
            
            <div id="admin-dashboard-page" class="page"></div>
            <div id="admin-users-page" class="page hidden"></div>
            <div id="admin-coaches-page" class="page hidden"></div>
            <div id="admin-store-page" class="page hidden"></div>
            <div id="admin-analytics-page" class="page hidden"></div>
            <div id="admin-commissions-page" class="page hidden"></div>
            <div id="admin-cms-page" class="page hidden"></div>
            <div id="admin-settings-page" class="page hidden"></div>
            <div id="admin-activity-log-page" class="page hidden"></div>
        </main>
    </div>
    
    <!-- Modals for Admin Dashboard -->
    <div id="edit-user-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-lg transform scale-95 transition-transform duration-300 relative">
             <div class="flex justify-between items-center p-4 border-b border-border-primary">
                <h2 id="edit-user-modal-title" class="font-bold text-xl">ویرایش کاربر</h2>
                <button class="close-modal-btn secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button>
            </div>
            <div id="edit-user-modal-body" class="p-6"></div>
        </div>
    </div>
     <div id="view-activity-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-3xl transform scale-95 transition-transform duration-300 relative max-h-[90vh] flex flex-col">
             <div class="flex justify-between items-center p-4 border-b border-border-primary flex-shrink-0">
                <h2 id="view-activity-modal-title" class="font-bold text-xl">نمای کلی فعالیت</h2>
                <button class="close-modal-btn secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button>
            </div>
            <div id="view-activity-modal-body" class="p-6 overflow-y-auto"></div>
        </div>
    </div>
    `;
}

export function initAdminDashboard(handleLogout: () => void, handleLoginSuccess: (username: string) => void, handleGoToHome: () => void) {
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('go-to-home-btn')?.addEventListener('click', handleGoToHome);
    
    const navLinks = document.querySelectorAll('.admin-dashboard-container .nav-link');
    const pages = document.querySelectorAll('.admin-dashboard-container .page');
    const adminTitleEl = document.getElementById('admin-page-title');

    const pageTitles: Record<string, string> = {