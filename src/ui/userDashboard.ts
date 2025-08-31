import { getUserData, saveUserData, addActivityLog, getCart, saveCart, getDiscounts, getNotifications, clearNotification, setNotification, getStorePlans, getUsers } from '../services/storage';
import { getTodayWorkoutData, calculateBodyMetrics, calculateWorkoutStreak, performMetricCalculations, findBestLifts, calculateWeeklyMetrics } from '../utils/calculations';
import { showToast, updateSliderTrack, openModal, closeModal, exportElement, hexToRgba } from '../utils/dom';
import { generateNutritionPlan } from '../services/gemini';
import { sanitizeHTML } from '../utils/dom';
import { formatPrice, timeAgo, getLatestSubscription, getUserAccessPermissions, canUserChat } from '../utils/helpers';

let selectedCoachInModal: string | null = null;

export function renderUserDashboard(currentUser: string, userData: any) {
    const name = userData.step1?.clientName || currentUser;
    const coachData = userData.step1?.coachName ? getUserData(userData.step1.coachName) : null;
    const coachName = coachData?.step1?.clientName || userData.step1?.coachName || 'بدون مربی';
    const avatarUrl = userData.profile?.avatar;

    const navItems = [
        { target: 'dashboard-content', icon: 'layout-dashboard', label: 'داشبورد' },
        { target: 'program-content', icon: 'clipboard-list', label: 'برنامه من' },
        { target: 'nutrition-content', icon: 'utensils-crossed', label: 'برنامه تغذیه' },
        { target: 'chat-content', icon: 'message-square', label: 'گفتگو با مربی' },
        { target: 'store-content', icon: 'shopping-cart', label: 'فروشگاه' },
        { target: 'profile-content', icon: 'user', label: 'پروفایل' },
        { target: 'help-content', icon: 'help-circle', label: 'راهنما' }
    ];

    const hasAccess = (permission: string) => {
        if (permission === 'chat') {
            return canUserChat(userData).canChat;
        }
        const permissions = getUserAccessPermissions(userData);
        return permissions.has(permission);
    };

    const avatarHtml = avatarUrl
        ? `<img src="${avatarUrl}" alt="${name}" class="w-10 h-10 rounded-full object-cover">`
        : `<div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg text-bg-secondary" style="background-color: var(--accent);">
               ${name.substring(0, 1).toUpperCase()}
           </div>`;

    return `
    <div id="user-dashboard-container" class="lg:flex h-screen bg-bg-primary transition-opacity duration-500 opacity-0">
        <aside class="fixed inset-y-0 right-0 z-40 w-64 bg-bg-secondary p-4 flex flex-col flex-shrink-0 border-l border-border-primary transform translate-x-full transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0">
            <div class="flex items-center gap-3 p-2 mb-6">
                <i data-lucide="dumbbell" class="w-8 h-8 text-accent"></i>
                <h1 class="text-xl font-bold">FitGym Pro</h1>
            </div>
            <nav class="space-y-2 flex-grow">
                ${navItems.map(item => {
                    const requiresWorkoutPlan = item.target === 'program-content';
                    const requiresNutrition = item.target === 'nutrition-content';
                    const requiresChat = item.target === 'chat-content';

                    let isLocked = false;
                    if (requiresWorkoutPlan && !hasAccess('workout_plan')) {
                        isLocked = true;
                    }
                    if (requiresNutrition && !hasAccess('nutrition_plan')) {
                        isLocked = true;
                    }
                    if (requiresChat && !hasAccess('chat')) {
                        isLocked = true;
                    }

                    // The help section is never locked
                    if (item.target === 'help-content') {
                        isLocked = false;
                    }

                    return `
                    <button class="coach-nav-link w-full flex items-center gap-3 py-3 rounded-lg text-md ${isLocked ? 'locked-feature' : ''}" data-target="${item.target}" ${isLocked ? 'title="برای دسترسی، پلن خود را ارتقا دهید"' : ''}>
                        <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                        <span>${item.label}</span>
                        ${isLocked ? '<i data-lucide="lock" class="w-4 h-4 lock-icon mr-auto"></i>' : '<span class="notification-badge mr-auto"></span>'}
                    </button>
                    `;
                }).join('')}
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
            <div id="global-user-notification-placeholder"></div>
            <div id="impersonation-banner-placeholder"></div>
            <header class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div class="flex items-center gap-2">
                     <button id="sidebar-toggle" class="lg:hidden p-2 -mr-2 text-text-secondary hover:text-text-primary">
                        <i data-lucide="menu" class="w-6 h-6"></i>
                    </button>
                    <div id="user-page-title-container">
                        <h1 id="user-page-title" class="text-3xl font-bold">داشبورد</h1>
                        <p id="user-page-subtitle" class="text-text-secondary">خلاصه فعالیت‌ها و پیشرفت شما.</p>
                    </div>
                </div>
                 <div class="flex items-center gap-3 bg-bg-secondary p-2 rounded-lg">
                    ${avatarHtml}
                    <div>
                        <p class="font-bold text-sm">${name}</p>
                        <p class="text-xs text-text-secondary">مربی: ${coachName}</p>
                    </div>
                </div>
            </header>

            <div id="dashboard-content" class="user-tab-content hidden"></div>
            <div id="program-content" class="user-tab-content hidden"></div>
            <div id="nutrition-content" class="user-tab-content hidden"></div>
            <div id="chat-content" class="user-tab-content hidden"></div>
            <div id="store-content" class="user-tab-content hidden"></div>
            <div id="profile-content" class="user-tab-content hidden"></div>
            <div id="help-content" class="user-tab-content hidden"></div>
        </main>
        
        <div id="user-dashboard-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
            <div class="card w-full max-w-2xl transform scale-95 transition-transform duration-300 relative max-h-[90vh] flex flex-col">
                <div class="flex justify-between items-center p-4 border-b border-border-primary flex-shrink-0">
                    <h2 id="user-modal-title" class="font-bold text-xl"></h2>
                    <button id="close-user-modal-btn" class="secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button>
                </div>
                <div id="user-modal-body" class="p-6 overflow-y-auto">
                    <!-- Content injected by JS -->
                </div>
            </div>
        </div>
    </div>
    `;
}

export const updateUserNotifications = (currentUser: string) => {
    const notifications = getNotifications(currentUser);
    const dashboardContainer = document.getElementById('user-dashboard-container');
    if (!dashboardContainer) return;

    dashboardContainer.querySelectorAll('.coach-nav-link').forEach(tab => {
        const targetId = tab.getAttribute('data-target');
        const badge = tab.querySelector('.notification-badge') as HTMLElement;
        if (!targetId || !badge) return;

        if (notifications[targetId]) {
            badge.textContent = notifications[targetId];
            if (!badge.classList.contains('visible')) {
                badge.classList.add('visible');
            }
        } else {
            badge.classList.remove('visible');
        }
    });
};

const renderUnifiedProgramView = (userData: any) => {
    const container = document.getElementById('program-content');
    if (!container) return;

    const latestProgram = (userData.programHistory && userData.programHistory.length > 0)
        ? userData.programHistory[0]
        : (userData.step2 ? { date: userData.joinDate, step2: userData.step2, supplements: userData.supplements || [] } : null);

    const hasProgram = latestProgram && latestProgram.step2 && latestProgram.step2.days && latestProgram.step2.days.some((d: any) => d.exercises && d.exercises.length > 0);

    if (!hasProgram) {
        container.innerHTML = `<div class="card p-8 text-center text-text-secondary"><i data-lucide="folder-x" class="w-12 h-12 mx-auto mb-4"></i><p>هنوز برنامه‌ای برای شما ثبت نشده است. مربی شما به زودی برنامه را ارسال خواهد کرد.</p></div>`;
        window.lucide?.createIcons();
        return;
    }

    const { step1: student } = userData;
    const { step2: workout, supplements } = latestProgram;
    const dayColors = ['#3b82f6', '#ef4444', '#f97316', '#10b981', '#a855f7', '#ec4899', '#f59e0b'];

    container.innerHTML = `
        <div class="program-page mx-auto bg-bg-secondary rounded-xl shadow-lg" id="unified-program-view">
             <div class="watermark-text-overlay">FitGym Pro</div>
             <div class="p-4 md:p-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">برنامه اختصاصی FitGym Pro</h2>
                    <p class="font-semibold">${new Date(latestProgram.date || Date.now()).toLocaleDateString('fa-IR')}</p>
                </div>

                <h3 class="preview-section-header"><i data-lucide="user-check"></i> اطلاعات شما</h3>
                <div class="preview-vitals-grid">
                    <div><span>نام:</span> <strong>${student.clientName || 'N/A'}</strong></div>
                    <div><span>هدف:</span> <strong>${student.trainingGoal || 'N/A'}</strong></div>
                    <div><span>سن:</span> <strong>${student.age || 'N/A'}</strong></div>
                    <div><span>قد:</span> <strong>${student.height || 'N/A'} cm</strong></div>
                    <div><span>وزن:</span> <strong>${student.weight || 'N/A'} kg</strong></div>
                    <div><span>TDEE:</span> <strong>${student.tdee ? Math.round(student.tdee) : 'N/A'} kcal</strong></div>
                </div>

                <h3 class="preview-section-header mt-6"><i data-lucide="clipboard-list"></i> برنامه تمرینی</h3>
                <div class="space-y-4">
                ${(workout.days || []).filter((d: any) => d.exercises && d.exercises.length > 0).map((day: any, index: number) => `
                    <div>
                         <h4 class="font-bold mb-2 p-2 rounded-md" style="border-right: 4px solid ${dayColors[index % dayColors.length]}; background-color: ${hexToRgba(dayColors[index % dayColors.length], 0.1)};">${day.name}</h4>
                        <table class="preview-table-pro">
                            <thead><tr><th>حرکت</th><th>ست</th><th>تکرار</th><th>استراحت</th></tr></thead>
                            <tbody>
                            ${(day.exercises || []).map((ex: any) => `<tr class="${ex.is_superset ? 'superset-group-pro' : ''}"><td>${ex.name}</td><td>${ex.sets}</td><td>${ex.reps}</td><td>${ex.rest}s</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                `).join('')}
                </div>
                
                ${supplements && supplements.length > 0 ? `
                <h3 class="preview-section-header mt-6"><i data-lucide="pill"></i> برنامه مکمل</h3>
                <table class="preview-table-pro">
                    <thead><tr><th>مکمل</th><th>دوز</th><th>زمان</th><th>یادداشت</th></tr></thead>
                    <tbody>
                        ${supplements.map((sup: any) => `<tr><td>${sup.name}</td><td>${sup.dosage}</td><td>${sup.timing}</td><td>${sup.notes || '-'}</td></tr>`).join('')}
                    </tbody>
                </table>
                ` : ''}

                ${workout.notes ? `
                <h3 class="preview-section-header mt-6"><i data-lucide="file-text"></i> یادداشت مربی</h3>
                <div class="preview-notes-pro">${workout.notes.replace(/\n/g, '<br>')}</div>
                ` : ''}
                
                <footer class="page-footer">ارائه شده توسط FitGym Pro - مربی شما: ${student.coachName || 'مربی'}</footer>
            </div>
        </div>
        <div class="flex justify-center items-center gap-4 mt-6">
            <button id="save-program-img-btn" class="png-button"><i data-lucide="image" class="w-4 h-4 ml-2"></i> ذخیره عکس</button>
            <button id="save-program-pdf-btn" class="pdf-button"><i data-lucide="file-down" class="w-4 h-4 ml-2"></i> ذخیره PDF</button>
        </div>
    `;

    window.lucide.createIcons();
};

const openWorkoutLogModal = (dayData: any, dayIndex: number, currentUser: string) => {
    const modal = document.getElementById('user-dashboard-modal');
    const titleEl = document.getElementById('user-modal-title');
    const bodyEl = document.getElementById('user-modal-body');
    if (!modal || !titleEl || !bodyEl) return;

    titleEl.textContent = `ثبت تمرین: ${dayData.name}`;

    let bodyHtml = `<form id="workout-log-form" data-day-index="${dayIndex}" class="space-y-4">`;
    (dayData.exercises || []).forEach((ex: any, exIndex: number) => {
        const template = document.getElementById('exercise-log-template') as HTMLTemplateElement;
        const exerciseNode = template.content.cloneNode(true) as DocumentFragment;
        
        (exerciseNode.querySelector('h4') as HTMLElement).textContent = ex.name;
        
        const setsContainer = exerciseNode.querySelector('.sets-log-container') as HTMLElement;
        setsContainer.innerHTML = ''; // Clear template content
        
        for (let i = 0; i < ex.sets; i++) {
            const setTemplate = document.getElementById('set-log-row-template') as HTMLTemplateElement;
            const setNode = setTemplate.content.cloneNode(true) as DocumentFragment;
            (setNode.querySelector('.font-semibold') as HTMLElement).textContent = `ست ${i + 1}`;
            (setNode.querySelector('.reps-log-input') as HTMLInputElement).placeholder = `تکرار (${ex.reps})`;
             (setNode.querySelector('.add-set-btn') as HTMLButtonElement).style.display = 'none';

            setsContainer.appendChild(setNode);
        }
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(exerciseNode);
        bodyHtml += tempDiv.innerHTML;
    });
    bodyHtml += `<button type="submit" class="primary-button w-full mt-4">ذخیره و پایان تمرین</button></form>`;
    bodyEl.innerHTML = bodyHtml;
    
    openModal(modal);
    window.lucide?.createIcons();
};

const getWorkoutsThisWeek = (history: any[] = []): number => {
    if (!history) return 0;
    const now = new Date();
    // In Iran, week starts on Saturday. getDay() has Sunday as 0.
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutDatesThisWeek = history
        .map(log => new Date(log.date))
        .filter(date => date >= startOfWeek);
        
    const uniqueDays = new Set(workoutDatesThisWeek.map(date => date.toDateString()));
    return uniqueDays.size;
};

const getPlanStatus = (userData: any) => {
    const latestSub = getLatestSubscription(userData);
    if (!latestSub) {
        return null;
    }

    const planId = latestSub.planId;
    const purchaseDate = new Date(latestSub.purchaseDate);
    
    let durationInMonths = 0;
    if (planId.includes('-1m')) durationInMonths = 1;
    else if (planId.includes('-3m')) durationInMonths = 3;
    else if (planId.includes('-6m')) durationInMonths = 6;
    
    if (durationInMonths === 0) return null;

    const totalDurationInDays = durationInMonths * 30;
    const endDate = new Date(purchaseDate);
    endDate.setDate(purchaseDate.getDate() + totalDurationInDays);

    const today = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return null;

    const daysPassed = totalDurationInDays - daysRemaining;
    const progressPercentage = Math.min(100, Math.max(0, (daysPassed / totalDurationInDays) * 100));

    return {
        planName: latestSub.planName,
        daysRemaining,
        progressPercentage,
    };
};

const renderDashboardTab = (currentUser: string, userData: any) => {
    const dashboardContentEl = document.getElementById('dashboard-content');
    if (!dashboardContentEl) return;

    const name = userData.step1?.clientName || currentUser;
    const streak = calculateWorkoutStreak(userData.workoutHistory);
    const totalWorkouts = (userData.workoutHistory || []).length;
    const lastWeight = (userData.weightHistory && userData.weightHistory.length > 0) ? userData.weightHistory.slice(-1)[0].weight : (userData.step1?.weight || 0);
    
    const workoutsThisWeek = getWorkoutsThisWeek(userData.workoutHistory);
    const weeklyGoal = userData.step1?.trainingDays || 4;
    const weeklyProgress = weeklyGoal > 0 ? Math.min(100, (workoutsThisWeek / weeklyGoal) * 100) : 0;

    const circumference = 2 * Math.PI * 55;
    const initialDashoffset = circumference;

    const todayData = getTodayWorkoutData(userData);
    let todayWorkoutHtml = `
        <div class="divi-today-workout card p-6 text-center h-full flex flex-col justify-center items-center">
            <div class="w-20 h-20 bg-bg-tertiary rounded-full mx-auto flex items-center justify-center mb-4">
                 <i data-lucide="coffee" class="w-10 h-10 text-accent"></i>
            </div>
            <h4 class="font-bold text-lg">امروز روز استراحت است</h4>
            <p class="text-sm text-text-secondary mt-1">از ریکاوری و رشد عضلات لذت ببرید!</p>
        </div>
    `;
    if (todayData && todayData.day.exercises.length > 0) {
        todayWorkoutHtml = `
             <div class="divi-today-workout card p-6 h-full flex flex-col">
                <h3 class="font-bold text-lg mb-4">تمرین امروز: <span class="text-accent">${todayData.day.name.split(':')[1]?.trim() || ''}</span></h3>
                <div class="p-4 rounded-xl bg-bg-tertiary flex-grow">
                    <ul class="space-y-2 text-sm">
                    ${todayData.day.exercises.slice(0, 3).map((ex: any) => `<li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-accent"></i> ${ex.name}</li>`).join('')}
                    ${todayData.day.exercises.length > 3 ? `<li class="text-text-secondary mt-2">+ ${todayData.day.exercises.length - 3} حرکت دیگر...</li>` : ''}
                    </ul>
                </div>
                <button class="primary-button w-full mt-6" data-action="log-workout" data-day-index="${todayData.dayIndex}">
                    <i data-lucide="play-circle" class="w-5 h-5 mr-2"></i>
                    ثبت تمرین امروز
                </button>
            </div>
        `;
    }

    const planStatus = getPlanStatus(userData);
    let planStatusHtml = '';
    if (planStatus) {
        planStatusHtml = `
            <div class="card p-6 flex flex-col animate-fade-in-up" style="animation-delay: 500ms;">
                <h3 class="font-bold text-lg mb-4 w-full">وضعیت پلن شما</h3>
                <p class="text-sm text-text-secondary font-semibold">${planStatus.planName}</p>
                <div class="w-full my-4">
                    <div class="flex justify-between text-xs text-text-secondary mb-1">
                        <span>شروع</span>
                        <span>پایان</span>
                    </div>
                    <div class="w-full bg-bg-tertiary rounded-full h-2.5">
                        <div class="bg-accent h-2.5 rounded-full transition-all duration-500" style="width: ${planStatus.progressPercentage}%"></div>
                    </div>
                </div>
                <div class="text-center">
                    <p class="font-bold text-2xl">${planStatus.daysRemaining} <span class="text-base font-normal text-text-secondary">روز باقی مانده</span></p>
                </div>
                <button data-action="go-to-store" class="primary-button w-full mt-6">تمدید یا ارتقا پلن</button>
            </div>
        `;
    }

    dashboardContentEl.innerHTML = `
        <div class="space-y-8 animate-fade-in-up">
            <div class="divi-welcome-header">
                <h2 class="text-3xl font-bold text-white">سلام، ${name}!</h2>
                <p class="text-white/80">خوش آمدید! بیایید روز خود را با قدرت شروع کنیم.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="divi-kpi-card animate-fade-in-up" style="animation-delay: 100ms;">
                    <div class="icon-container" style="--icon-bg: var(--admin-accent-pink);"><i data-lucide="flame" class="w-6 h-6 text-white"></i></div>
                    <div>
                        <p class="kpi-value">${streak}</p>
                        <p class="kpi-label">زنجیره تمرین</p>
                    </div>
                </div>
                <div class="divi-kpi-card animate-fade-in-up" style="animation-delay: 200ms;">
                     <div class="icon-container" style="--icon-bg: var(--admin-accent-blue);"><i data-lucide="dumbbell" class="w-6 h-6 text-white"></i></div>
                    <div>
                        <p class="kpi-value">${totalWorkouts}</p>
                        <p class="kpi-label">کل تمرینات</p>
                    </div>
                </div>
                 <div class="divi-kpi-card animate-fade-in-up" style="animation-delay: 300ms;">
                     <div class="icon-container" style="--icon-bg: var(--admin-accent-green);"><i data-lucide="weight" class="w-6 h-6 text-white"></i></div>
                    <div>
                        <p class="kpi-value">${lastWeight} <span class="text-base font-normal">kg</span></p>
                        <p class="kpi-label">آخرین وزن ثبت شده</p>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                    ${todayWorkoutHtml}
                </div>
                <div class="space-y-6">
                    <div class="card p-6 flex flex-col items-center justify-center animate-fade-in-up" style="animation-delay: 400ms;">
                        <h3 class="font-bold text-lg mb-4">پیشرفت هفتگی</h3>
                        <div class="gauge relative" style="width: 150px; height: 150px;">
                            <svg class="gauge-svg absolute inset-0" viewBox="0 0 120 120">
                                <circle class="gauge-track" r="55" cx="60" cy="60" stroke-width="10"></circle>
                                <circle class="gauge-value" r="55" cx="60" cy="60" stroke-width="10" style="stroke:var(--accent); stroke-dasharray: ${circumference}; stroke-dashoffset: ${initialDashoffset};"></circle>
                            </svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span class="font-bold text-3xl weekly-progress-value">${weeklyProgress.toFixed(0)}%</span>
                                <span class="text-xs text-text-secondary">${workoutsThisWeek} / ${weeklyGoal} تمرین</span>
                            </div>
                        </div>
                    </div>
                    ${planStatusHtml}
                </div>
            </div>
        </div>
    `;
    window.lucide?.createIcons();

    const gaugeValue = dashboardContentEl.querySelector('.gauge-value') as SVGCircleElement;
    if (gaugeValue) {
        setTimeout(() => {
            const finalDashoffset = circumference * (1 - weeklyProgress / 100);
            gaugeValue.style.strokeDashoffset = String(finalDashoffset);
        }, 100);
    }
};

const updateCartSummary = (currentUser: string) => {
    const cart = getCart(currentUser);
    const cartContainer = document.getElementById('cart-summary-container');
    if (!cartContainer) return;

    if (cart.items.length === 0) {
        cartContainer.innerHTML = '<p class="text-text-secondary">سبد خرید شما خالی است.</p>';
        document.getElementById('checkout-btn')?.setAttribute('disabled', 'true');
        return;
    }

    const subtotal = cart.items.reduce((sum: number, item: any) => sum + item.price, 0);
    const discounts = getDiscounts();
    let discountAmount = 0;
    let finalTotal = subtotal;

    if (cart.discountCode && discounts[cart.discountCode]) {
        const discount = discounts[cart.discountCode];
        if (discount.type === 'percentage') {
            discountAmount = subtotal * (discount.value / 100);
        } else {
            discountAmount = discount.value;
        }
        finalTotal = Math.max(0, subtotal - discountAmount);
    }

    cartContainer.innerHTML = `
        <div class="space-y-3">
            ${cart.items.map((item: any) => `
                <div class="flex justify-between items-center text-sm">
                    <p>${item.planName}</p>
                    <div class="flex items-center gap-2">
                        <span class="font-semibold">${formatPrice(item.price)}</span>
                        <button class="remove-from-cart-btn text-red-accent hover:text-red-500" data-plan-id="${item.planId}"><i class="w-4 h-4 pointer-events-none" data-lucide="trash-2"></i></button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="border-t border-border-primary mt-4 pt-4 space-y-2">
            <div class="flex justify-between text-sm">
                <span>جمع کل:</span>
                <span>${formatPrice(subtotal)}</span>
            </div>
            ${discountAmount > 0 ? `
            <div class="flex justify-between text-sm text-green-500">
                <span>تخفیف (${cart.discountCode}):</span>
                <span>- ${formatPrice(discountAmount)}</span>
            </div>
            ` : ''}
            <div class="flex justify-between font-bold text-lg mt-2">
                <span>مبلغ قابل پرداخت:</span>
                <span>${formatPrice(finalTotal)}</span>
            </div>
        </div>
    `;
    document.getElementById('checkout-btn')?.removeAttribute('disabled');
    window.lucide?.createIcons();
};

const renderStoreTab = (currentUser: string) => {
    const container = document.getElementById('store-content');
    if (!container) return;
    const plans = getStorePlans();
    const hasCoach = !!getUserData(currentUser).step1?.coachName;
    
    container.innerHTML = `
        ${!hasCoach ? `
            <div class="info-card !bg-admin-accent-yellow/10 !border-admin-accent-yellow p-4 mb-6 flex items-center gap-3">
                <i data-lucide="alert-triangle" class="w-6 h-6 text-admin-accent-yellow"></i>
                <div>
                    <h4 class="font-bold text-admin-accent-yellow">پروفایل شما ناقص است</h4>
                    <p class="text-sm text-yellow-700 dark:text-yellow-300">برای خرید پلن، ابتدا باید مربی خود را از بخش <button class="font-bold underline" id="go-to-profile-from-store">پروفایل</button> انتخاب کنید.</p>
                </div>
            </div>
        ` : ''}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
                <h3 class="font-bold text-xl mb-4">پلن‌های موجود</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${plans.map((plan: any) => {
                        const buttonState = hasCoach ? '' : 'disabled';
                        const buttonClasses = hasCoach ? '' : 'opacity-50 cursor-not-allowed';
                        return `
                        <div class="card p-6 flex flex-col border-2 transition-all hover:shadow-xl hover:-translate-y-1" style="border-color: ${plan.color || 'var(--border-primary)'};">
                            <h4 class="text-lg font-bold text-text-primary">${plan.emoji || ''} ${plan.planName}</h4>
                            <p class="text-sm text-text-secondary mt-1 flex-grow">${plan.description}</p>
                            <div class="my-6">
                                <span class="text-3xl font-black">${formatPrice(plan.price).split(' ')[0]}</span>
                                <span class="text-text-secondary"> تومان</span>
                            </div>
                            <ul class="space-y-3 text-sm mb-6">
                                ${(plan.features || []).map((feature: string) => `
                                    <li class="flex items-center gap-2">
                                        <i data-lucide="check-circle" class="w-5 h-5 text-green-400"></i>
                                        <span>${feature}</span>
                                    </li>
                                `).join('')}
                            </ul>
                            <button class="add-to-cart-btn primary-button mt-auto w-full ${buttonClasses}" data-plan-id='${plan.planId}' ${buttonState} title="${!hasCoach ? 'ابتدا مربی خود را انتخاب کنید' : 'افزودن به سبد خرید'}">افزودن به سبد خرید</button>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
            <div class="lg:col-span-1">
                 <div class="card p-6 sticky top-6">
                    <h3 class="font-bold text-xl mb-4">سبد خرید</h3>
                    <div id="cart-summary-container" class="mb-4">
                        <!-- Cart summary will be rendered here -->
                    </div>
                    <div class="flex items-center gap-2 mb-4">
                        <input type="text" id="discount-code-input" class="input-field flex-grow !text-sm" placeholder="کد تخفیف">
                        <button id="apply-discount-btn" class="secondary-button !text-sm">اعمال</button>
                    </div>
                    <button id="checkout-btn" class="primary-button w-full">پرداخت</button>
                 </div>
            </div>
        </div>
    `;
    updateCartSummary(currentUser);
    window.lucide?.createIcons();
};

const renderChatTab = (currentUser: string, userData: any) => {
    const container = document.getElementById('chat-content');
    if (!container) return;
    const coachData = userData.step1?.coachName ? getUserData(userData.step1.coachName) : null;
    const coachName = coachData?.step1?.clientName || userData.step1?.coachName || 'بدون مربی';
    const coachAvatar = coachData?.profile?.avatar;

    const chatAccess = canUserChat(userData);
    if (!chatAccess.canChat) {
        container.innerHTML = `<div class="card p-8 text-center text-text-secondary"><i data-lucide="message-square-off" class="w-12 h-12 mx-auto mb-4"></i><p>${chatAccess.reason}</p></div>`;
        window.lucide?.createIcons();
        return;
    }

    const latestProgram = (userData.programHistory && userData.programHistory.length > 0) ? userData.programHistory[0] : null;
    let timerHtml = '';
    if (latestProgram) {
        const programSentDate = new Date(latestProgram.date);
        const now = new Date();
        const hoursPassed = (now.getTime() - programSentDate.getTime()) / (1000 * 60 * 60);
        if (hoursPassed >= 0 && hoursPassed <= 48) {
            const hoursLeft = Math.floor(48 - hoursPassed);
            const minutesLeft = Math.floor(((48 - hoursPassed) * 60) % 60);
            timerHtml = `
            <div class="p-2 text-center text-sm bg-accent/10 text-accent font-semibold flex-shrink-0">
                زمان باقی‌مانده برای گفتگو: ${hoursLeft} ساعت و ${minutesLeft} دقیقه
            </div>`;
        }
    }

    container.innerHTML = `
        <div class="card h-[calc(100vh-12rem)] flex flex-col max-w-4xl mx-auto">
            <div class="chat-header">
                ${coachAvatar ? 
                    `<img src="${coachAvatar}" alt="${coachName}" class="chat-avatar">` :
                    `<div class="chat-avatar bg-accent flex items-center justify-center font-bold text-bg-secondary text-lg">${coachName.charAt(0)}</div>`
                }
                <div>
                    <h3 class="font-bold">${coachName}</h3>
                    <p class="text-xs text-text-secondary">مربی شما</p>
                </div>
            </div>
            ${timerHtml}
            <div id="user-chat-messages-container" class="p-4 flex-grow overflow-y-auto message-container flex flex-col">
                <div class="space-y-4">
                    <!-- Messages will be injected here -->
                </div>
            </div>
            <div class="p-4 border-t border-border-primary">
                <div id="user-quick-replies" class="flex items-center gap-2 mb-2 flex-wrap"></div>
                <form id="user-chat-form" class="flex items-center gap-3">
                    <input id="user-chat-input" type="text" class="input-field flex-grow" placeholder="پیام خود را بنویسید..." autocomplete="off">
                    <button type="submit" class="primary-button !p-3"><i data-lucide="send" class="w-5 h-5"></i></button>
                </form>
            </div>
        </div>
    `;

    const renderMessages = () => {
        const messagesContainer = document.querySelector('#user-chat-messages-container');
        const messagesInnerContainer = messagesContainer?.querySelector('div');
        if (!messagesContainer || !messagesInnerContainer) return;
        
        const currentData = getUserData(currentUser);
        const chatHistory = (currentData.chatHistory || []);
        messagesInnerContainer.innerHTML = chatHistory.map((msg: any) => `
            <div class="flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}">
                 <div class="message-bubble ${msg.sender === 'user' ? 'message-sent' : 'message-received'}">
                    <div class="message-content">${sanitizeHTML(msg.message)}</div>
                    <div class="message-timestamp">${timeAgo(msg.timestamp)}</div>
                 </div>
            </div>
        `).join('');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };
    renderMessages();

    const quickRepliesContainer = document.getElementById('user-quick-replies');
    if (quickRepliesContainer) {
        const replies = ['سلام مربی، وقت بخیر.', 'متشکرم.', 'انجام شد.', 'سوال داشتم.'];
        quickRepliesContainer.innerHTML = replies.map(reply => `<button class="quick-reply-btn secondary-button !text-xs !py-1 !px-3">${reply}</button>`).join('');
        quickRepliesContainer.addEventListener('click', e => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('quick-reply-btn')) {
                const input = document.getElementById('user-chat-input') as HTMLInputElement;
                if (input) {
                    input.value = target.textContent || '';
                    input.focus();
                }
            }
        });
    }

    window.lucide?.createIcons();
};

const renderNutritionTab = (currentUser: string, userData: any) => {
    const container = document.getElementById('nutrition-content');
    if (!container) return;

    const hasAccess = getUserAccessPermissions(userData).has('nutrition_plan');
    if (!hasAccess) {
        container.innerHTML = `
            <div class="card p-8 text-center text-text-secondary flex flex-col items-center justify-center">
                <i data-lucide="lock" class="w-12 h-12 mx-auto mb-4 text-accent"></i>
                <h3 class="font-bold text-xl">دسترسی به این بخش محدود است</h3>
                <p class="mt-2">برای مشاهده و دریافت برنامه‌های غذایی، لطفا پلن عضویت خود را از فروشگاه ارتقا دهید.</p>
                <button id="go-to-store-from-nutrition" class="primary-button mt-6">مشاهده پلن‌ها</button>
            </div>
        `;
        window.lucide?.createIcons();
        return;
    }

    const latestProgram = (userData.programHistory && userData.programHistory.length > 0)
        ? userData.programHistory[0]
        : null;

    const nutritionPlan = latestProgram?.nutritionPlan;

    if (!nutritionPlan || !nutritionPlan.weeklyPlan) {
        container.innerHTML = `<div class="card p-8 text-center text-text-secondary"><i data-lucide="folder-x" class="w-12 h-12 mx-auto mb-4"></i><p>هنوز برنامه غذایی برای شما ثبت نشده است. مربی شما به زودی برنامه را ارسال خواهد کرد.</p></div>`;
        window.lucide?.createIcons();
        return;
    }

    container.innerHTML = `
        <div class="card p-6 max-w-4xl mx-auto animate-fade-in-up">
            <h2 class="text-2xl font-bold mb-4">برنامه غذایی هفتگی</h2>
            <p class="text-text-secondary mb-6">این یک برنامه غذایی نمونه است که می‌توانید آن را به صورت هفتگی تکرار کنید. برای تنوع، از گزینه‌های مختلف در هر وعده استفاده نمایید.</p>
            <div class="space-y-4">
                ${(nutritionPlan.weeklyPlan || []).map((day: any) => `
                    <details class="bg-bg-tertiary rounded-lg">
                        <summary class="p-3 font-semibold cursor-pointer flex justify-between items-center">
                            <span>${day.dayName}</span>
                            <i data-lucide="chevron-down" class="details-arrow transition-transform"></i>
                        </summary>
                        <div class="p-4 border-t border-border-primary bg-bg-secondary rounded-b-lg nutrition-plan-text">
                            <ul class="space-y-4">
                            ${(day.meals || []).map((meal: any) => `
                                <li>
                                    <strong class="font-bold">${meal.mealName}:</strong>
                                    <ul class="list-disc pr-5 mt-1 text-text-secondary space-y-1">
                                        ${(meal.options || []).map((opt: string) => `<li>${sanitizeHTML(opt)}</li>`).join('')}
                                    </ul>
                                </li>
                            `).join('')}
                            </ul>
                        </div>
                    </details>
                `).join('')}
            </div>
            ${nutritionPlan.generalTips && nutritionPlan.generalTips.length > 0 ? `
            <div class="mt-6">
                <h3 class="font-bold text-lg mb-3">نکات عمومی</h3>
                <ul class="list-disc pr-5 text-text-secondary space-y-1">
                    ${nutritionPlan.generalTips.map((tip: string) => `<li>${sanitizeHTML(tip)}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
    `;
    window.lucide?.createIcons();
};

const updateProfileMetricsDisplay = (container: HTMLElement) => {
    const metrics = calculateBodyMetrics(container);
    if (!metrics) return;

    const {
        age, height, weight, gender, activityLevel,
        neck, waist, hip
    } = {
        age: parseFloat((container.querySelector('input[name="age"]') as HTMLInputElement)?.value),
        height: parseFloat((container.querySelector('input[name="height"]') as HTMLInputElement)?.value),
        weight: parseFloat((container.querySelector('input[name="weight"]') as HTMLInputElement)?.value),
        gender: (container.querySelector('input[name="gender_user"]:checked') as HTMLInputElement)?.value,
        activityLevel: parseFloat((container.querySelector('input[name="activity_level_user"]:checked') as HTMLInputElement)?.value),
        neck: parseFloat((container.querySelector('.neck-input') as HTMLInputElement)?.value),
        waist: parseFloat((container.querySelector('.waist-input') as HTMLInputElement)?.value),
        hip: parseFloat((container.querySelector('.hip-input') as HTMLInputElement)?.value),
    };
    
    // Selectors for the new metrics panel
    const metricsPanel = document.getElementById('profile-metrics-panel');
    if (!metricsPanel) return;

    // BMI
    const bmiValue = metrics.bmi;
    const bmiGaugeValue = metricsPanel.querySelector('.bmi-gauge-value');
    const bmiGaugeCircle = metricsPanel.querySelector('.bmi-gauge-circle') as SVGCircleElement;

    if (bmiGaugeValue && bmiGaugeCircle) {
        if (bmiValue) {
            bmiGaugeValue.textContent = String(bmiValue);
            const circumference = 2 * Math.PI * 45;
            let percentage = (bmiValue - 15) / (25); // Normalize from 15 to 40
            percentage = Math.max(0, Math.min(1, percentage));
            bmiGaugeCircle.style.strokeDashoffset = `${circumference * (1 - percentage)}`;
        } else {
            bmiGaugeValue.textContent = '–';
             bmiGaugeCircle.style.strokeDashoffset = `${2 * Math.PI * 45}`;
        }
    }
    
    // Body Composition
    const bodyCompContainer = metricsPanel.querySelector('.body-composition-container');
    if (bodyCompContainer) {
        const chart = bodyCompContainer.querySelector('.body-composition-chart') as HTMLElement;
        const placeholder = bodyCompContainer.querySelector('.chart-placeholder') as HTMLElement;
        const bodyfatOutput = bodyCompContainer.querySelector('.bodyfat-output') as HTMLElement;

        if (metrics.bodyFat === null) {
            chart.classList.add('hidden');
            placeholder.classList.remove('hidden');
            bodyfatOutput.textContent = '–';
        } else {
            chart.classList.remove('hidden');
            placeholder.classList.add('hidden');
            const lbmPercentage = (metrics.lbm! / weight) * 100;
            (chart.querySelector('.lbm-bar') as HTMLElement).style.width = `${lbmPercentage}%`;
            (chart.querySelector('.fat-mass-bar') as HTMLElement).style.width = `${100 - lbmPercentage}%`;
            bodyfatOutput.textContent = `${metrics.bodyFat.toFixed(1)}%`;
        }
    }

    // TDEE
    const tdeeValue = metrics.tdee;
    const tdeeGaugeValue = metricsPanel.querySelector('.tdee-gauge-value');
    const tdeeGaugeCircle = metricsPanel.querySelector('.tdee-gauge-circle') as SVGCircleElement;
     if (tdeeGaugeValue && tdeeGaugeCircle) {
        if (tdeeValue) {
            tdeeGaugeValue.textContent = String(Math.round(tdeeValue));
            const circumference = 2 * Math.PI * 45;
            let percentage = (tdeeValue - 1000) / (4000); // Normalize from 1000 to 5000
            percentage = Math.max(0, Math.min(1, percentage));
            tdeeGaugeCircle.style.strokeDashoffset = `${circumference * (1 - percentage)}`;
        } else {
            tdeeGaugeValue.textContent = '–';
            tdeeGaugeCircle.style.strokeDashoffset = `${2 * Math.PI * 45}`;
        }
    }

    // Ideal Weight
    const idealWeightOutput = metricsPanel.querySelector('.ideal-weight-output');
    if (idealWeightOutput) {
        idealWeightOutput.textContent = metrics.idealWeight || '–';
    }
};

const renderProfileTab = (currentUser: string, userData: any) => {
    const container = document.getElementById('profile-content');
    if (!container) return;
    const { step1, profile } = userData;

    const name = step1?.clientName || currentUser;
    const email = step1?.clientEmail || 'ایمیل ثبت نشده';
    const initials = (name || '?').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    
    const coachData = step1?.coachName ? getUserData(step1.coachName) : null;
    const coachName = coachData?.step1?.clientName || step1?.coachName || 'انتخاب کنید';
    const coachNotSelected = !step1?.coachName;

    const trainingGoals = ['کاهش وزن', 'افزایش حجم', 'بهبود ترکیب بدنی', 'تناسب اندام عمومی', 'افزایش قدرت'];
    const specializedSports = [
        { value: 'bodybuilding', label: '💪 بدنسازی' },
        { value: 'martial_arts', label: '🥋 رزمی' },
        { value: 'general_fitness', label: '🤸 آمادگی جسمانی' },
        { value: 'health_wellness', label: '❤️ سلامتی' },
        { value: 'pro_athlete', label: '🏆 حرفه‌ای' },
        { value: 'other', label: '⚪️ سایر' }
    ];
    const activityLevels = [
        { value: 1.2, label: 'نشسته' },
        { value: 1.375, label: 'کم' },
        { value: 1.55, label: 'متوسط' },
        { value: 1.725, label: 'زیاد' },
        { value: 1.9, label: 'خیلی زیاد' }
    ];
    const showSpecificSportInput = step1?.specializedSport && ['martial_arts', 'pro_athlete', 'other'].includes(step1.specializedSport);

    container.innerHTML = `
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
            <!-- Form Column -->
            <div class="lg:col-span-2 space-y-6">
                 <!-- Profile Header -->
                <div class="card p-6 flex flex-col sm:flex-row items-center gap-6">
                    ${profile?.avatar ? 
                        `<img src="${profile.avatar}" alt="${name}" class="w-24 h-24 rounded-full object-cover flex-shrink-0 border-4 border-accent/30">` :
                        `<div class="w-24 h-24 rounded-full bg-accent text-bg-secondary flex-shrink-0 flex items-center justify-center text-4xl font-bold">
                            ${initials}
                        </div>`
                    }
                    <div class="text-center sm:text-right">
                        <h2 class="text-2xl font-bold">${name}</h2>
                        <p class="text-text-secondary">${email}</p>
                    </div>
                </div>

                <form id="user-profile-form" class="space-y-6">
                    <div class="card p-6">
                        <h3 class="text-lg font-bold mb-6 flex items-center gap-2"><i data-lucide="user-round" class="w-5 h-5 text-accent"></i>اطلاعات فردی</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div class="input-group"><input type="text" id="user-profile-name" class="input-field w-full" value="${step1?.clientName || ''}" placeholder=" "><label class="input-label">نام و نام خانوادگی</label></div>
                            <div class="input-group"><input type="email" class="input-field w-full" value="${step1?.clientEmail || ''}" placeholder=" " readonly><label class="input-label">ایمیل (غیرقابل تغییر)</label></div>
                            <div class="input-group"><input type="tel" id="user-profile-mobile" class="input-field w-full" value="${step1?.mobile || ''}" placeholder=" "><label class="input-label">شماره موبایل</label></div>
                            <div class="input-group"><input type="url" id="user-profile-avatar" class="input-field w-full" value="${profile?.avatar || ''}" placeholder=" "><label class="input-label">لینک عکس پروفایل</label></div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-semibold mb-2">مربی</label>
                                <button type="button" id="select-coach-btn" class="input-field w-full text-right flex justify-between items-center ${coachNotSelected ? 'highlight-coach-selection' : ''}">
                                    <span id="current-coach-name">${coachName}</span><i data-lucide="chevron-down" class="w-4 h-4"></i>
                                </button>
                                ${coachNotSelected ? `<div class="coach-selection-warning"><i data-lucide="alert-triangle" class="w-4 h-4"></i><span>لطفا مربی خود را انتخاب کنید.</span></div>` : ''}
                            </div>
                        </div>
                    </div>

                    <div class="card p-6">
                         <h3 class="text-lg font-bold mb-6 flex items-center gap-2"><i data-lucide="scan-line" class="w-5 h-5 text-accent"></i>مشخصات فیزیکی</h3>
                         <div class="space-y-6">
                            <div class="radio-group-pink"><p class="text-sm font-semibold mb-2">جنسیت</p><div class="grid grid-cols-2 gap-2">
                                <label class="option-card-label"><input type="radio" name="gender_user" value="مرد" class="option-card-input" ${step1?.gender === 'مرد' ? 'checked data-is-checked="true"' : ''}><span class="option-card-content">مرد</span></label>
                                <label class="option-card-label"><input type="radio" name="gender_user" value="زن" class="option-card-input" ${step1?.gender === 'زن' ? 'checked data-is-checked="true"' : ''}><span class="option-card-content">زن</span></label>
                            </div></div>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div class="space-y-1 slider-container-blue"><label class="font-semibold text-sm">سن: <span>${step1?.age || 25}</span></label><input type="range" name="age" min="15" max="80" value="${step1?.age || 25}" class="range-slider age-slider w-full mt-1"></div>
                                <div class="space-y-1 slider-container-green"><label class="font-semibold text-sm">قد (cm): <span>${step1?.height || 175}</span></label><input type="range" name="height" min="140" max="220" value="${step1?.height || 175}" class="range-slider height-slider w-full mt-1"></div>
                                <div class="space-y-1 slider-container-orange"><label class="font-semibold text-sm">وزن (kg): <span>${step1?.weight || 75}</span></label><input type="range" name="weight" min="40" max="150" step="0.5" value="${step1?.weight || 75}" class="range-slider weight-slider w-full mt-1"></div>
                            </div>
                            <details><summary class="font-semibold cursor-pointer text-sm flex items-center gap-1">اندازه‌گیری دور بدن (اختیاری) <i data-lucide="chevron-down" class="w-4 h-4 details-arrow"></i></summary>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                                    <div class="input-group"><input type="number" name="neck" class="input-field w-full neck-input" value="${step1?.neck || ''}" placeholder=" "><label class="input-label">دور گردن (cm)</label></div>
                                    <div class="input-group"><input type="number" name="waist" class="input-field w-full waist-input" value="${step1?.waist || ''}" placeholder=" "><label class="input-label">دور کمر (cm)</label></div>
                                    <div class="input-group"><input type="number" name="hip" class="input-field w-full hip-input" value="${step1?.hip || ''}" placeholder=" "><label class="input-label">دور باسن (cm)</label></div>
                                </div>
                            </details>
                         </div>
                    </div>

                    <div class="card p-6">
                        <h3 class="text-lg font-bold mb-6 flex items-center gap-2"><i data-lucide="target" class="w-5 h-5 text-accent"></i>اهداف و سطح فعالیت</h3>
                        <div class="space-y-6">
                            <div>
                                <p class="text-sm font-semibold mb-2">هدف اصلی شما</p>
                                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                    ${trainingGoals.map(goal => `<label class="option-card-label"><input type="radio" name="training_goal_user" value="${goal}" class="option-card-input" ${step1?.trainingGoal === goal ? 'checked data-is-checked="true"' : ''}><span class="option-card-content">${goal}</span></label>`).join('')}
                                </div>
                            </div>
                             <div>
                                <p class="text-sm font-semibold mb-2">ورزش تخصصی</p>
                                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    ${specializedSports.map(sport => `<label class="option-card-label"><input type="radio" name="specialized_sport_user" value="${sport.value}" class="option-card-input" ${step1?.specializedSport === sport.value ? 'checked data-is-checked="true"' : ''}><span class="option-card-content !text-xs sm:!text-sm">${sport.label}</span></label>`).join('')}
                                </div>
                            </div>
                            <div id="specific-sport-container" class="mt-4 ${!showSpecificSportInput ? 'hidden' : ''}">
                                <div class="input-group">
                                    <input type="text" id="specific_sport_name_user" name="specific_sport_name_user" class="input-field w-full" value="${step1?.specificSportName || ''}" placeholder=" ">
                                    <label for="specific_sport_name_user" class="input-label">نام دقیق رشته (مثلا: جودو)</label>
                                </div>
                            </div>
                            <div>
                                <p class="text-sm font-semibold mb-2">روزهای تمرین در هفته</p>
                                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    ${[3, 4, 5, 6].map(day => `<label class="option-card-label"><input type="radio" name="training_days_user" value="${day}" class="option-card-input" ${step1?.trainingDays === day ? 'checked data-is-checked="true"' : ''}><span class="option-card-content">${day} روز</span></label>`).join('')}
                                </div>
                            </div>
                            <div>
                                <p class="text-sm font-semibold mb-2">سطح فعالیت روزانه</p>
                                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                    ${activityLevels.map(level => `<label class="option-card-label"><input type="radio" name="activity_level_user" value="${level.value}" class="option-card-input" ${step1?.activityLevel === level.value ? 'checked data-is-checked="true"' : ''}><span class="option-card-content">${level.label}</span></label>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-center"><button type="submit" class="primary-button !py-3 !px-8">ذخیره تغییرات</button></div>
                </form>
            </div>
            
            <!-- Metrics Column -->
            <div id="profile-metrics-panel" class="lg:col-span-1 space-y-6">
                <div class="card p-6 sticky top-6 space-y-6">
                    <h3 class="text-lg font-bold text-center">آمار کلیدی بدن شما</h3>
                    <!-- BMI Gauge -->
                    <div class="text-center"><h4 class="font-semibold mb-2">شاخص توده بدنی (BMI)</h4>
                        <div class="gauge inline-block" style="width: 120px; height: 120px;">
                            <svg class="gauge-svg" viewBox="0 0 100 100"><circle class="gauge-track" r="45" cx="50" cy="50" stroke-width="8"></circle><circle class="gauge-value bmi-gauge-circle" r="45" cx="50" cy="50" stroke-width="8" style="stroke:var(--admin-accent-blue); stroke-dasharray: 283; stroke-dashoffset: 283;"></circle></svg>
                            <div class="gauge-text"><span class="gauge-number text-2xl bmi-gauge-value"></span></div>
                        </div>
                    </div>
                    <!-- Body Comp -->
                    <div class="body-composition-container"><h4 class="font-semibold mb-2 flex justify-between items-center"><span>ترکیب بدنی</span><span class="font-bold bodyfat-output"></span></h4>
                        <div class="relative h-6">
                            <div class="chart-placeholder hidden absolute inset-0 text-xs text-text-secondary bg-bg-tertiary rounded-md p-2 flex items-center justify-center">دور بدن را وارد کنید</div>
                            <div class="body-composition-chart flex h-full rounded-md overflow-hidden">
                                <div class="lbm-bar bg-green-500 transition-all duration-500"></div>
                                <div class="fat-mass-bar bg-red-500 transition-all duration-500"></div>
                            </div>
                        </div>
                        <div class="flex justify-between text-xs text-text-secondary mt-1"><span>توده بدون چربی</span><span>توده چربی</span></div>
                    </div>
                    <!-- TDEE Gauge -->
                    <div class="text-center"><h4 class="font-semibold mb-2">کالری روزانه (TDEE)</h4>
                        <div class="gauge inline-block" style="width: 120px; height: 120px;">
                            <svg class="gauge-svg" viewBox="0 0 100 100"><circle class="gauge-track" r="45" cx="50" cy="50" stroke-width="8"></circle><circle class="gauge-value tdee-gauge-circle" r="45" cx="50" cy="50" stroke-width="8" style="stroke:var(--admin-accent-orange); stroke-dasharray: 283; stroke-dashoffset: 283;"></circle></svg>
                            <div class="gauge-text"><span class="gauge-number text-2xl tdee-gauge-value"></span><span class="gauge-label">kcal</span></div>
                        </div>
                    </div>
                    <!-- Ideal Weight -->
                    <div class="info-card !bg-bg-tertiary p-3 text-center">
                        <p class="text-sm text-text-secondary">محدوده وزن ایده‌آل شما</p>
                        <p class="font-bold text-lg ideal-weight-output"></p>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export function initUserDashboard(currentUser: string, userData: any, handleLogout: () => void, handleGoToHome: () => void) {
    const mainContainer = document.getElementById('user-dashboard-container');
    if (!mainContainer) return;

    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('go-to-home-btn')?.addEventListener('click', handleGoToHome);

    const pageTitles: Record<string, { title: string, subtitle: string }> = {
        'dashboard-content': { title: 'داشبورد', subtitle: 'خلاصه فعالیت‌ها و پیشرفت شما.' },
        'program-content': { title: 'برنامه من', subtitle: 'برنامه تمرینی و مکمل‌های شما.' },
        'nutrition-content': { title: 'برنامه تغذیه', subtitle: 'برنامه غذایی اختصاصی شما.' },
        'chat-content': { title: 'گفتگو با مربی', subtitle: 'با مربی خود در ارتباط باشید.' },
        'store-content': { title: 'فروشگاه', subtitle: 'پلن‌های عضویت را مشاهده و خریداری کنید.' },
        'profile-content': { title: 'پروفایل', subtitle: 'اطلاعات فردی و فیزیکی خود را مدیریت کنید.' },
        'help-content': { title: 'راهنما', subtitle: 'پاسخ به سوالات متداول.' }
    };

    const switchTab = (activeTab: HTMLElement) => {
        const targetId = activeTab.getAttribute('data-target');
        if (!targetId) return;

        mainContainer.querySelectorAll('.coach-nav-link').forEach(t => t.classList.remove('active-nav-link'));
        activeTab.classList.add('active-nav-link');
        mainContainer.querySelectorAll('.user-tab-content').forEach(content => {
            content.classList.toggle('hidden', content.id !== targetId);
        });

        const targetData = pageTitles[targetId];
        const titleEl = document.getElementById('user-page-title');
        const subtitleEl = document.getElementById('user-page-subtitle');
        if (titleEl && subtitleEl && targetData) {
            titleEl.textContent = targetData.title;
            subtitleEl.textContent = targetData.subtitle;
        }

        clearNotification(currentUser, targetId);
        updateUserNotifications(currentUser);

        const currentData = getUserData(currentUser);
        switch (targetId) {
            case 'dashboard-content':
                renderDashboardTab(currentUser, currentData);
                break;
            case 'program-content':
                renderUnifiedProgramView(currentData);
                break;
            case 'nutrition-content':
                renderNutritionTab(currentUser, currentData);
                break;
            case 'chat-content':
                renderChatTab(currentUser, currentData);
                break;
            case 'store-content':
                renderStoreTab(currentUser);
                break;
            case 'profile-content':
                renderProfileTab(currentUser, currentData);
                // Initial calculation for metrics panel
                const form = document.getElementById('user-profile-form');
                if (form) updateProfileMetricsDisplay(form as HTMLElement);
                break;
            case 'help-content':
                const helpContainer = document.getElementById('help-content');
                if (helpContainer) helpContainer.innerHTML = `<div class="card p-6">محتوای راهنما در حال آماده سازی است.</div>`;
                break;
        }
    };
    
    const defaultTab = mainContainer.querySelector<HTMLElement>('.coach-nav-link');
    if (defaultTab) {
        if (sessionStorage.getItem('fitgympro_redirect_to_tab') === 'store-content') {
            const storeTab = mainContainer.querySelector<HTMLElement>('.coach-nav-link[data-target="store-content"]');
            switchTab(storeTab || defaultTab);
            sessionStorage.removeItem('fitgympro_redirect_to_tab');
        } else if (sessionStorage.getItem('fromProfileSave') === 'true') {
            const profileTab = mainContainer.querySelector<HTMLElement>('.coach-nav-link[data-target="profile-content"]');
            switchTab(profileTab || defaultTab);
            sessionStorage.removeItem('fromProfileSave');
        } else {
            switchTab(defaultTab);
        }
    }

    mainContainer.querySelectorAll('.coach-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!(e.currentTarget as HTMLElement).classList.contains('locked-feature')) {
                switchTab(e.currentTarget as HTMLElement)
            } else {
                showToast('برای دسترسی به این بخش، لطفا یک پلن مناسب از فروشگاه تهیه کنید.', 'warning');
            }
        });
    });

    document.getElementById('close-user-modal-btn')?.addEventListener('click', () => {
        closeModal(document.getElementById('user-dashboard-modal'));
    });

    const openCoachSelectionModal = (coaches: any[]) => {
        const modal = document.getElementById('user-dashboard-modal');
        const titleEl = document.getElementById('user-modal-title');
        const bodyEl = document.getElementById('user-modal-body');
        if (!modal || !titleEl || !bodyEl) return;
    
        titleEl.textContent = 'انتخاب مربی';
        bodyEl.innerHTML = `
            <p class="text-text-secondary mb-4">لطفا مربی مورد نظر خود را برای دریافت برنامه انتخاب کنید.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${coaches.map(coach => {
                    const coachData = getUserData(coach.username);
                    const name = coachData.step1?.clientName || coach.username;
                    const specialization = coachData.profile?.specialization || 'مربی بدنسازی';
                    const avatar = coachData.profile?.avatar;
                    return `
                        <button class="coach-selection-card text-center p-4 border rounded-lg hover:bg-bg-tertiary hover:border-accent transition-colors" data-coach-username="${coach.username}" data-coach-name="${name}">
                            ${avatar ? `<img src="${avatar}" class="w-20 h-20 rounded-full mx-auto mb-3 object-cover">` : `<div class="w-20 h-20 rounded-full mx-auto mb-3 bg-bg-tertiary flex items-center justify-center font-bold text-2xl">${name.charAt(0)}</div>`}
                            <p class="font-bold">${name}</p>
                            <p class="text-xs text-text-secondary">${specialization}</p>
                        </button>
                    `;
                }).join('')}
            </div>
        `;
        openModal(modal);
    }
    
    mainContainer.addEventListener('click', e => {
        if (!(e.target instanceof HTMLElement)) return;
        const target = e.target;
        
        const actionBtn = target.closest<HTMLButtonElement>('button[data-action]');
        if (actionBtn) {
            const action = actionBtn.dataset.action;
            const dayIndex = parseInt(actionBtn.dataset.dayIndex || '-1', 10);
            
            if (action === 'log-workout' && dayIndex !== -1) {
                const todayData = getTodayWorkoutData(getUserData(currentUser));
                if (todayData && todayData.dayIndex === dayIndex) {
                    openWorkoutLogModal(todayData.day, dayIndex, currentUser);
                }
            } else if (action === 'go-to-store') {
                const storeTab = document.querySelector<HTMLElement>('.coach-nav-link[data-target="store-content"]');
                if (storeTab) switchTab(storeTab);
            }
        }

        const savePdfBtn = target.closest('#save-program-pdf-btn');
        if (savePdfBtn) {
            exportElement('#unified-program-view', 'pdf', 'FitGymPro-Program.pdf', savePdfBtn as HTMLButtonElement);
        }
        const saveImgBtn = target.closest('#save-program-img-btn');
        if (saveImgBtn) {
            exportElement('#unified-program-view', 'png', 'FitGymPro-Program.png', saveImgBtn as HTMLButtonElement);
        }

        const addToCartBtn = target.closest('.add-to-cart-btn');
        if (addToCartBtn) {
            const planId = (addToCartBtn as HTMLElement).dataset.planId;
            const plans = getStorePlans();
            const planToAdd = plans.find((p:any) => p.planId === planId);
            if (planToAdd) {
                const cart = getCart(currentUser);
                if (!cart.items.some((item: any) => item.planId === planId)) {
                    cart.items.push(planToAdd);
                    saveCart(currentUser, cart);
                    showToast(`${planToAdd.planName} به سبد خرید اضافه شد.`, 'success');
                    updateCartSummary(currentUser);
                } else {
                    showToast('این پلن قبلا به سبد خرید اضافه شده است.', 'warning');
                }
            }
        }

        const removeFromCartBtn = target.closest('.remove-from-cart-btn');
        if (removeFromCartBtn) {
            const planId = (removeFromCartBtn as HTMLElement).dataset.planId;
            let cart = getCart(currentUser);
            cart.items = cart.items.filter((item: any) => item.planId !== planId);
            saveCart(currentUser, cart);
            updateCartSummary(currentUser);
        }

        const applyDiscountBtn = target.closest('#apply-discount-btn');
        if (applyDiscountBtn) {
            const input = document.getElementById('discount-code-input') as HTMLInputElement;
            const code = input.value.trim().toUpperCase();
            const discounts = getDiscounts();
            if (discounts[code]) {
                const cart = getCart(currentUser);
                cart.discountCode = code;
                saveCart(currentUser, cart);
                showToast(`کد تخفیف ${code} اعمال شد.`, 'success');
                updateCartSummary(currentUser);
            } else {
                showToast('کد تخفیف نامعتبر است.', 'error');
            }
        }

        const checkoutBtn = target.closest('#checkout-btn');
        if (checkoutBtn) {
            const cart = getCart(currentUser);
            if(cart.items.length === 0) return;

            const freshUserData = getUserData(currentUser);
            if (!freshUserData.subscriptions) freshUserData.subscriptions = [];
            
            const newSubscriptions = cart.items.map((item: any) => ({
                ...item,
                purchaseDate: new Date().toISOString(),
                fulfilled: false,
            }));
            
            freshUserData.subscriptions.push(...newSubscriptions);
            saveUserData(currentUser, freshUserData);
            
            saveCart(currentUser, { items: [], discountCode: null });
            
            showToast('خرید شما با موفقیت انجام شد! مربی به زودی برنامه شما را ارسال خواهد کرد.', 'success');
            
            const coachUsername = freshUserData.step1?.coachName;
            if (coachUsername) {
                setNotification(coachUsername, 'students-content', '🔔');
            }

            const dashboardTab = document.querySelector<HTMLElement>('.coach-nav-link[data-target="dashboard-content"]');
            if (dashboardTab) switchTab(dashboardTab);
        }

        const goToProfileBtn = target.closest('#go-to-profile-from-store') || target.closest('#go-to-profile-from-nutrition');
        if (goToProfileBtn) {
            const profileTab = document.querySelector<HTMLElement>('.coach-nav-link[data-target="profile-content"]');
            if (profileTab) switchTab(profileTab);
        }

        const selectCoachBtn = target.closest('#select-coach-btn');
        if (selectCoachBtn) {
            const coaches = getUsers().filter((u:any) => u.role === 'coach' && u.coachStatus === 'verified');
            openCoachSelectionModal(coaches);
        }

        const coachCard = target.closest('.coach-selection-card');
        if (coachCard) {
            selectedCoachInModal = (coachCard as HTMLElement).dataset.coachUsername || null;
            const coachName = (coachCard as HTMLElement).dataset.coachName || 'انتخاب کنید';

            const btn = document.getElementById('select-coach-btn');
            const nameEl = document.getElementById('current-coach-name');
            if (btn && nameEl) {
                nameEl.textContent = coachName;
                btn.classList.remove('highlight-coach-selection');
                const warning = btn.parentElement?.querySelector('.validation-message');
                if (warning) warning.innerHTML = '';
            }
            closeModal(document.getElementById('user-dashboard-modal'));
        }
    });

    mainContainer.addEventListener('input', e => {
        const target = e.target as HTMLInputElement;
        const profileForm = target.closest('#user-profile-form');
        if (target.matches('.range-slider')) {
            const labelSpan = target.previousElementSibling?.querySelector('span');
            if (labelSpan) labelSpan.textContent = target.value;
            updateSliderTrack(target);
            if (profileForm) {
                updateProfileMetricsDisplay(profileForm as HTMLElement);
            }
        }
        if (profileForm && (target.matches('.neck-input, .waist-input, .hip-input'))) {
            updateProfileMetricsDisplay(profileForm as HTMLElement);
        }
    });

    mainContainer.addEventListener('change', e => {
        const target = e.target as HTMLInputElement;
        const profileForm = target.closest('#user-profile-form');
        if (target.matches('input[type="radio"]') && profileForm) {
            updateProfileMetricsDisplay(profileForm as HTMLElement);
        }
        if (target.name === 'specialized_sport_user' && profileForm) {
            const specificSportContainer = profileForm.querySelector('#specific-sport-container');
            const showFor = ['martial_arts', 'pro_athlete', 'other'];
            if (showFor.includes(target.value)) {
                specificSportContainer?.classList.remove('hidden');
            } else {
                specificSportContainer?.classList.add('hidden');
                const input = specificSportContainer?.querySelector('input');
                if(input) input.value = '';
            }
        }
    });

    mainContainer.addEventListener('submit', e => {
        e.preventDefault();
        const target = e.target as HTMLFormElement;

        if (target.id === 'user-chat-form') {
            const input = document.getElementById('user-chat-input') as HTMLInputElement;
            const message = input.value.trim();
            if (message) {
                const freshUserData = getUserData(currentUser);
                if (!freshUserData.chatHistory) freshUserData.chatHistory = [];
                freshUserData.chatHistory.push({
                    sender: 'user',
                    message,
                    timestamp: new Date().toISOString()
                });
                saveUserData(currentUser, freshUserData);
                input.value = '';
                renderChatTab(currentUser, freshUserData);
                
                const coachUsername = freshUserData.step1?.coachName;
                if(coachUsername) {
                    setNotification(coachUsername, 'chat-content', '💬');
                }
            }
        }
        
        if (target.id === 'workout-log-form') {
            const dayIndex = parseInt(target.dataset.dayIndex || '-1', 10);
            if (dayIndex === -1) return;

            const exercises: any[] = [];
            target.querySelectorAll('.exercise-log-item').forEach(exItem => {
                const name = (exItem.querySelector('h4') as HTMLElement).textContent || '';
                const sets: any[] = [];
                exItem.querySelectorAll('.set-log-row').forEach(setRow => {
                    const weight = (setRow.querySelector('.weight-log-input') as HTMLInputElement).value;
                    const reps = (setRow.querySelector('.reps-log-input') as HTMLInputElement).value;
                    if(weight && reps) {
                        sets.push({ weight: parseFloat(weight), reps: parseInt(reps, 10) });
                    }
                });
                if (sets.length > 0) {
                    exercises.push({ name, sets });
                }
            });

            const freshUserData = getUserData(currentUser);
            if (!freshUserData.workoutHistory) freshUserData.workoutHistory = [];
            freshUserData.workoutHistory.push({
                date: new Date().toISOString(),
                dayIndex: dayIndex,
                exercises: exercises
            });
            saveUserData(currentUser, freshUserData);
            addActivityLog(`${currentUser} logged a workout.`);
            showToast('تمرین با موفقیت ثبت شد!', 'success');
            closeModal(document.getElementById('user-dashboard-modal'));
            renderDashboardTab(currentUser, freshUserData);
        }

        if (target.id === 'user-profile-form') {
            const form = target;
            let hasError = false;
            const nameInput = form.querySelector('#user-profile-name') as HTMLInputElement;
            if (nameInput.value.trim().length < 3) {
                showToast('نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد.', 'error');
                hasError = true;
            }
            if (!selectedCoachInModal && !getUserData(currentUser).step1?.coachName) {
                 showToast('لطفا مربی خود را انتخاب کنید.', 'error');
                 hasError = true;
            }

            if (hasError) return;

            const freshUserData = getUserData(currentUser);
            const dataToUpdate: any = {
                step1: { ...freshUserData.step1 },
                profile: { ...freshUserData.profile }
            };

            const getVal = (selector: string) => (form.querySelector(selector) as HTMLInputElement)?.value.trim();
            const getFloat = (selector: string) => parseFloat((form.querySelector(selector) as HTMLInputElement)?.value);
            const getInt = (selector: string) => parseInt((form.querySelector(selector) as HTMLInputElement)?.value, 10);
            const getRadio = (name: string) => (form.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement)?.value;

            const clientName = getVal('#user-profile-name');
            if (clientName) dataToUpdate.step1.clientName = clientName;

            const mobile = getVal('#user-profile-mobile');
            if (mobile) dataToUpdate.step1.mobile = mobile;

            const avatar = getVal('#user-profile-avatar');
            if (avatar) dataToUpdate.profile.avatar = avatar;

            if (selectedCoachInModal) dataToUpdate.step1.coachName = selectedCoachInModal;

            const gender = getRadio("gender_user");
            if (gender) dataToUpdate.step1.gender = gender;

            const age = getInt('input[name="age"]');
            if (!isNaN(age)) dataToUpdate.step1.age = age;
            
            const height = getInt('input[name="height"]');
            if (!isNaN(height)) dataToUpdate.step1.height = height;
            
            const weight = getFloat('input[name="weight"]');
            if (!isNaN(weight)) dataToUpdate.step1.weight = weight;

            const neck = getFloat('.neck-input');
            if (!isNaN(neck)) dataToUpdate.step1.neck = neck;

            const waist = getFloat('.waist-input');
            if (!isNaN(waist)) dataToUpdate.step1.waist = waist;

            const hip = getFloat('.hip-input');
            if (!isNaN(hip)) dataToUpdate.step1.hip = hip;

            const trainingGoal = getRadio("training_goal_user");
            if (trainingGoal) dataToUpdate.step1.trainingGoal = trainingGoal;
            
            const specializedSport = getRadio("specialized_sport_user");
            if (specializedSport) {
                dataToUpdate.step1.specializedSport = specializedSport;
                const specificSportName = getVal('input[name="specific_sport_name_user"]');
                const showFor = ['martial_arts', 'pro_athlete', 'other'];
                if (showFor.includes(specializedSport)) {
                    dataToUpdate.step1.specificSportName = specificSportName;
                } else {
                    dataToUpdate.step1.specificSportName = ''; // Clear it if not applicable
                }
            }

            const trainingDays = getRadio("training_days_user");
            if (trainingDays) dataToUpdate.step1.trainingDays = parseInt(trainingDays, 10);
            
            const activityLevel = getRadio("activity_level_user");
            if (activityLevel) dataToUpdate.step1.activityLevel = parseFloat(activityLevel);
            
            const metrics = performMetricCalculations(dataToUpdate.step1);
            if (metrics) {
                dataToUpdate.step1.tdee = metrics.tdee;
            }
            dataToUpdate.lastProfileUpdate = new Date().toISOString();

            saveUserData(currentUser, { ...freshUserData, ...dataToUpdate });
            
            addActivityLog(`${currentUser} updated their profile.`);
            showToast('پروفایل با موفقیت ذخیره شد.', 'success');
            
            const name = dataToUpdate.step1.clientName || currentUser;
            const coachData = getUserData(dataToUpdate.step1.coachName);
            const coachName = coachData?.step1?.clientName || dataToUpdate.step1.coachName || 'بدون مربی';
            
            const headerNameEl = mainContainer.querySelector('.flex.items-center.gap-3.bg-bg-secondary .font-bold.text-sm');
            if(headerNameEl) headerNameEl.textContent = name;
            const headerCoachEl = mainContainer.querySelector('.flex.items-center.gap-3.bg-bg-secondary .text-xs.text-text-secondary');
            if(headerCoachEl) headerCoachEl.textContent = `مربی: ${coachName}`;
            
            // Re-render tab to show updated info
            renderProfileTab(currentUser, getUserData(currentUser));
            const profileForm = document.getElementById('user-profile-form');
            if (profileForm) updateProfileMetricsDisplay(profileForm as HTMLElement);
        }
    });
}