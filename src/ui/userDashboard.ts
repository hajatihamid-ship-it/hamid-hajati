import { getUserData, saveUserData, addActivityLog, getCart, saveCart, getDiscounts, getNotifications, clearNotification, setNotification, getStorePlans, getUsers } from '../services/storage';
import { getTodayWorkoutData, calculateBodyMetrics, calculateWorkoutStreak, performMetricCalculations, findBestLifts, calculateWeeklyMetrics } from '../utils/calculations';
import { showToast, updateSliderTrack, openModal, closeModal, exportElement } from '../utils/dom';
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
    <div id="user-dashboard-container" class="flex h-screen bg-bg-primary transition-opacity duration-500 opacity-0">
        <aside class="w-64 bg-bg-secondary p-4 flex flex-col flex-shrink-0 border-l border-border-primary">
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
                <div id="user-page-title-container">
                    <h1 id="user-page-title" class="text-3xl font-bold">داشبورد</h1>
                    <p id="user-page-subtitle" class="text-text-secondary">خلاصه فعالیت‌ها و پیشرفت شما.</p>
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
                         <h4 class="font-bold mb-2 p-2 rounded-md" style="border-right: 4px solid ${dayColors[index % dayColors.length]}; background-color: color-mix(in srgb, ${dayColors[index % dayColors.length]} 10%, transparent);">${day.name}</h4>
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
    
    const hasBaseData = !isNaN(age) && !isNaN(height) && !isNaN(weight) && gender;

    // BMI
    const bmiValue = metrics.bmi;
    const bmiOutput = container.querySelector('.bmi-value-output');
    const bmiIndicator = container.querySelector('#profile-bmi-indicator') as HTMLElement;
    const bmiStatusEl = container.querySelector('.bmi-status-output');

    if (bmiOutput && bmiIndicator && bmiStatusEl) {
        if (bmiValue) {
            bmiOutput.textContent = String(bmiValue);
            let statusText = '', colorClass = '';
            if (bmiValue < 18.5) { statusText = 'کمبود وزن'; colorClass = 'bg-blue-500'; }
            else if (bmiValue < 25) { statusText = 'نرمال'; colorClass = 'bg-green-500'; }
            else if (bmiValue < 30) { statusText = 'اضافه وزن'; colorClass = 'bg-yellow-500 text-black'; }
            else { statusText = 'چاق'; colorClass = 'bg-red-500'; }
            bmiStatusEl.textContent = statusText;
            bmiStatusEl.className = `text-xs font-semibold px-2 py-0.5 rounded-full bmi-status-output ${colorClass}`;
            let percentage = (bmiValue - 15) / (40 - 15) * 100;
            bmiIndicator.style.left = `calc(${Math.max(0, Math.min(100, percentage))}% - 10px)`;
        } else {
            bmiOutput.textContent = '–';
            bmiStatusEl.textContent = '';
            bmiStatusEl.className = 'bmi-status-output';
            bmiIndicator.style.left = 'calc(0% - 10px)';
        }
    }

    // Body Composition
    const bodyCompContainer = container.querySelector('.body-composition-container');
    if (bodyCompContainer) {
        const chart = bodyCompContainer.querySelector('.body-composition-chart') as HTMLElement;
        const placeholder = bodyCompContainer.querySelector('.chart-placeholder') as HTMLElement;
        const bodyfatOutput = bodyCompContainer.querySelector('.bodyfat-output') as HTMLElement;

        const missingBase = [];
        if (isNaN(age)) missingBase.push('سن');
        if (isNaN(height)) missingBase.push('قد');
        if (isNaN(weight)) missingBase.push('وزن');
        if (!gender) missingBase.push('جنسیت');

        const showPlaceholder = (text: string) => {
            chart.classList.add('hidden');
            placeholder.classList.remove('hidden');
            placeholder.innerHTML = `<i data-lucide="info" class="w-4 h-4 ml-2"></i> ${text}`;
            bodyfatOutput.textContent = '';
            window.lucide?.createIcons();
        };

        if (missingBase.length > 0) {
            showPlaceholder(`ابتدا ${missingBase.join('، ')} را کامل کنید.`);
        } else if (metrics.bodyFat === null) {
            const missingMeasurements = [];
            if (isNaN(neck)) missingMeasurements.push('دور گردن');
            if (isNaN(waist)) missingMeasurements.push('دور کمر');
            if (gender === 'زن' && isNaN(hip)) missingMeasurements.push('دور باسن');
            showPlaceholder(`برای محاسبه، ${missingMeasurements.join(' و ')} را وارد کنید.`);
        } else {
            chart.classList.remove('hidden');
            placeholder.classList.add('hidden');
            const fatMass = weight - metrics.lbm!;
            const lbmPercentage = (metrics.lbm! / weight) * 100;
            (chart.querySelector('.lbm-bar') as HTMLElement).style.width = `${lbmPercentage}%`;
            (chart.querySelector('.fat-mass-bar') as HTMLElement).style.width = `${100 - lbmPercentage}%`;
            (chart.querySelector('.lbm-value-output') as HTMLElement).textContent = `${metrics.lbm!.toFixed(1)} kg`;
            (chart.querySelector('.fat-mass-value-output') as HTMLElement).textContent = `${fatMass.toFixed(1)} kg`;
            bodyfatOutput.textContent = `${metrics.bodyFat.toFixed(1)}%`;
        }
    }

    // TDEE
    const tdeeContainer = container.querySelector('.tdee-container');
    if (tdeeContainer) {
        const chart = tdeeContainer.querySelector('.tdee-chart') as HTMLElement;
        const placeholder = tdeeContainer.querySelector('.chart-placeholder') as HTMLElement;
        const tdeeValueOutput = tdeeContainer.querySelector('.tdee-value-output') as HTMLElement;

        const missing = [];
        if (isNaN(age)) missing.push('سن');
        if (isNaN(height)) missing.push('قد');
        if (isNaN(weight)) missing.push('وزن');
        if (!gender) missing.push('جنسیت');
        if (isNaN(activityLevel)) missing.push('سطح فعالیت');

        if (missing.length > 0) {
            chart.classList.add('hidden');
            placeholder.classList.remove('hidden');
            placeholder.innerHTML = `<i data-lucide="info" class="w-4 h-4 ml-2"></i> ${missing.join('، ')} را کامل کنید`;
            tdeeValueOutput.textContent = '';
            window.lucide?.createIcons();
        } else {
            chart.classList.remove('hidden');
            placeholder.classList.add('hidden');
            const activityCalories = metrics.tdee! - metrics.bmr!;
            const bmrPercentage = (metrics.bmr! / metrics.tdee!) * 100;
            (chart.querySelector('.bmr-bar') as HTMLElement).style.width = `${bmrPercentage}%`;
            (chart.querySelector('.activity-calories-bar') as HTMLElement).style.width = `${100 - bmrPercentage}%`;
            (chart.querySelector('.bmr-value-output') as HTMLElement).textContent = `${Math.round(metrics.bmr!)}`;
            (chart.querySelector('.activity-calories-value-output') as HTMLElement).textContent = `${Math.round(activityCalories)}`;
            tdeeValueOutput.textContent = `${Math.round(metrics.tdee!)} kcal`;
        }
    }

    // Ideal Weight
    const idealWeightOutput = container.querySelector('.ideal-weight-output');
    if (idealWeightOutput) {
        idealWeightOutput.textContent = metrics.idealWeight || (isNaN(height) ? 'قد را وارد کنید' : '–');
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
    const activityLevels = [
        { value: 1.2, label: 'نشسته' },
        { value: 1.375, label: 'کم' },
        { value: 1.55, label: 'متوسط' },
        { value: 1.725, label: 'زیاد' },
        { value: 1.9, label: 'خیلی زیاد' }
    ];

    container.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
            <!-- Profile Header -->
            <div class="card p-6 flex items-center gap-6">
                 ${profile?.avatar ? 
                    `<img src="${profile.avatar}" alt="${name}" class="w-20 h-20 rounded-full object-cover flex-shrink-0">` :
                    `<div class="w-20 h-20 rounded-full bg-accent text-bg-secondary flex-shrink-0 flex items-center justify-center text-3xl font-bold">
                        ${initials}
                    </div>`
                }
                <div>
                    <h2 class="text-2xl font-bold">${name}</h2>
                    <p class="text-text-secondary">${email}</p>
                </div>
            </div>

            <form id="user-profile-form">
                <!-- Personal Info Card -->
                <div class="card p-6 mb-6">
                    <h3 class="text-lg font-bold mb-6 flex items-center gap-2 text-text-primary"><i data-lucide="user-round" class="w-5 h-5 text-accent"></i>اطلاعات فردی</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                            <div class="input-group input-group-with-icon">
                                <input type="text" id="user-profile-name" class="input-field w-full" value="${step1?.clientName || ''}" placeholder=" ">
                                <label for="user-profile-name" class="input-label">نام و نام خانوادگی</label>
                                <i data-lucide="user" class="input-icon w-5 h-5"></i>
                            </div>
                            <div class="validation-message"></div>
                        </div>
                        <div class="input-group input-group-with-icon">
                            <input type="email" id="user-profile-email" class="input-field w-full" value="${step1?.clientEmail || ''}" placeholder=" " readonly>
                            <label for="user-profile-email" class="input-label">ایمیل (غیرقابل تغییر)</label>
                            <i data-lucide="mail" class="input-icon w-5 h-5"></i>
                        </div>
                        <div class="input-group input-group-with-icon">
                            <input type="tel" id="user-profile-mobile" class="input-field w-full" value="${step1?.mobile || ''}" placeholder=" ">
                            <label for="user-profile-mobile" class="input-label">شماره موبایل</label>
                             <i data-lucide="phone" class="input-icon w-5 h-5"></i>
                        </div>
                        <div class="input-group input-group-with-icon">
                            <input type="url" id="user-profile-avatar" class="input-field w-full" value="${profile?.avatar || ''}" placeholder=" ">
                            <label for="user-profile-avatar" class="input-label">لینک عکس پروفایل</label>
                            <i data-lucide="image" class="input-icon w-5 h-5"></i>
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-semibold mb-2">مربی</label>
                            <button type="button" id="select-coach-btn" class="input-field w-full text-right flex justify-between items-center ${coachNotSelected ? 'highlight-coach-selection' : ''}">
                                <span id="current-coach-name">${coachName}</span>
                                <i data-lucide="chevron-down" class="w-4 h-4 text-text-secondary"></i>
                            </button>
                            <div class="validation-message">
                                ${coachNotSelected ? `
                                    <div class="coach-selection-warning">
                                        <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                                        <span>لطفا مربی خود را انتخاب کنید.</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Physical Attributes Card -->
                <div class="card p-6 mb-6">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2 text-text-primary"><i data-lucide="scan-line" class="w-5 h-5 text-accent"></i>مشخصات فیزیکی</h3>
                    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div class="lg:col-span-3 space-y-6">
                            <div class="radio-group-pink">
                                <p class="text-sm font-semibold mb-2">جنسیت</p>
                                <div class="grid grid-cols-2 gap-2">
                                    <label class="option-card-label">
                                        <input type="radio" name="gender_user" value="مرد" class="option-card-input" ${step1?.gender === 'مرد' ? 'checked data-is-checked="true"' : ''}>
                                        <span class="option-card-content">مرد</span>
                                    </label>
                                    <label class="option-card-label">
                                        <input type="radio" name="gender_user" value="زن" class="option-card-input" ${step1?.gender === 'زن' ? 'checked data-is-checked="true"' : ''}>
                                        <span class="option-card-content">زن</span>
                                    </label>
                                </div>
                                <div class="validation-message"></div>
                            </div>
                            <div class="space-y-1 slider-container-blue">
                                <label class="font-semibold text-sm">سن: <span>${step1?.age || 25}</span></label>
                                <input type="range" name="age" min="15" max="80" value="${step1?.age || 25}" class="range-slider age-slider w-full mt-1">
                            </div>
                            <div class="space-y-1 slider-container-green">
                                <label class="font-semibold text-sm">قد (cm): <span>${step1?.height || 175}</span></label>
                                <input type="range" name="height" min="140" max="220" value="${step1?.height || 175}" class="range-slider height-slider w-full mt-1">
                            </div>
                            <div class="space-y-1 slider-container-orange">
                                <label class="font-semibold text-sm">وزن فعلی (kg): <span>${step1?.weight || 75}</span></label>
                                <input type="range" name="weight" min="40" max="150" step="0.5" value="${step1?.weight || 75}" class="range-slider weight-slider w-full mt-1">
                            </div>
                            <div>
                                <details open>
                                    <summary class="font-semibold cursor-pointer text-sm flex items-center gap-1">اندازه‌گیری دور بدن (برای محاسبه دقیق چربی) <i data-lucide="chevron-down" class="w-4 h-4 details-arrow"></i></summary>
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4 mt-4">
                                        <div class="input-group input-group-gray">
                                            <input type="number" name="neck" class="input-field w-full neck-input" value="${step1?.neck || ''}" placeholder=" ">
                                            <label class="input-label">دور گردن (cm)</label>
                                        </div>
                                        <div class="input-group input-group-gray">
                                            <input type="number" name="waist" class="input-field w-full waist-input" value="${step1?.waist || ''}" placeholder=" ">
                                            <label class="input-label">دور کمر (cm)</label>
                                        </div>
                                        <div class="input-group input-group-gray">
                                            <input type="number" name="hip" class="input-field w-full hip-input" value="${step1?.hip || ''}" placeholder=" ">
                                            <label class="input-label">دور باسن (cm)</label>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        </div>

                        <div class="lg:col-span-2 space-y-4">
                             <div>
                                <div class="flex justify-between items-center mb-1">
                                    <h4 class="font-semibold text-sm">شاخص توده بدنی (BMI)</h4>
                                    <div class="flex items-center gap-2">
                                        <span class="font-bold text-lg text-text-primary bmi-value-output"></span>
                                        <span class="bmi-status-output"></span>
                                    </div>
                                </div>
                                <div class="w-full bg-bg-tertiary rounded-full h-2.5 relative" title="آبی: کمبود, سبز: نرمال, زرد: اضافه, قرمز: چاق">
                                    <div class="absolute top-0 left-0 h-full rounded-l-full bg-blue-500" style="width: 14%;"></div>
                                    <div class="absolute top-0 h-full bg-green-500" style="left: 14%; width: 26%;"></div>
                                    <div class="absolute top-0 h-full bg-yellow-500" style="left: 40%; width: 20%;"></div>
                                    <div class="absolute top-0 h-full rounded-r-full bg-red-500" style="left: 60%; width: 40%;"></div>
                                    <div id="profile-bmi-indicator" class="absolute -top-1 w-5 h-5 rounded-full bg-white border-2 border-accent shadow-lg transition-all duration-500 ease-out"></div>
                                </div>
                                <div class="flex justify-between text-xs text-text-secondary mt-1 px-1">
                                    <span>۱۸.۵</span>
                                    <span>۲۵</span>
                                    <span>۳۰</span>
                                </div>
                            </div>
                            
                            <!-- Body Composition -->
                            <div class="body-composition-container">
                                <h4 class="font-semibold text-sm mb-2 flex justify-between items-center">
                                    <span>ترکیب بدنی</span>
                                    <span class="font-bold text-lg bodyfat-output"></span>
                                </h4>
                                 <div class="relative h-6">
                                    <div class="chart-placeholder absolute inset-0 bg-bg-tertiary rounded-full flex items-center justify-center text-xs text-text-secondary px-2"></div>
                                    <div class="body-composition-chart w-full bg-bg-tertiary rounded-full h-6 flex overflow-hidden text-white text-xs items-center font-bold hidden">
                                        <div class="lbm-bar bg-admin-accent-green h-full flex items-center justify-center transition-all duration-500">
                                            <span class="lbm-value-output"></span>
                                        </div>
                                        <div class="fat-mass-bar bg-admin-accent-yellow h-full flex items-center justify-center transition-all duration-500">
                                            <span class="fat-mass-value-output"></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center text-xs text-text-secondary mt-1">
                                    <span>توده بدون چربی (LBM)</span>
                                    <span>چربی</span>
                                </div>
                            </div>

                            <!-- TDEE -->
                            <div class="tdee-container">
                                <h4 class="font-semibold text-sm mb-2 flex justify-between items-center">
                                    <span>کالری روزانه (TDEE)</span>
                                    <span class="font-bold text-lg text-accent tdee-value-output"></span>
                                </h4>
                                <div class="relative h-6">
                                    <div class="chart-placeholder absolute inset-0 bg-bg-tertiary rounded-full flex items-center justify-center text-xs text-text-secondary px-2"></div>
                                    <div class="tdee-chart w-full bg-bg-tertiary rounded-full h-6 flex overflow-hidden text-white text-xs items-center font-bold hidden">
                                        <div class="bmr-bar bg-admin-accent-blue h-full flex items-center justify-center transition-all duration-500">
                                            <span class="bmr-value-output"></span>
                                        </div>
                                        <div class="activity-calories-bar bg-admin-accent-pink h-full flex items-center justify-center transition-all duration-500">
                                            <span class="activity-calories-value-output"></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center text-xs text-text-secondary mt-1">
                                    <span>متابولیسم پایه (BMR)</span>
                                    <span>کالری فعالیت</span>
                                </div>
                            </div>
                            
                            <!-- Ideal Weight -->
                            <div class="bg-bg-tertiary rounded-lg p-3 text-center">
                                <span class="text-sm">محدوده وزن ایده‌آل: </span>
                                <strong class="font-semibold text-sm ideal-weight-output"></strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Goals & Activity Card -->
                <div class="card p-6 mb-6">
                    <h3 class="text-lg font-bold mb-6 flex items-center gap-2 text-text-primary"><i data-lucide="target" class="w-5 h-5 text-accent"></i>اهداف و سطح فعالیت</h3>
                    <div class="space-y-6">
                        <div>
                             <p class="text-sm font-semibold mb-2">هدف اصلی تمرین</p>
                             <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                ${trainingGoals.map(goal => `
                                     <label class="option-card-label">
                                        <input type="radio" name="training_goal_user" value="${goal}" class="option-card-input" ${step1?.trainingGoal === goal ? 'checked data-is-checked="true"' : ''}>
                                        <span class="option-card-content">${goal}</span>
                                    </label>
                                `).join('')}
                             </div>
                             <div class="validation-message"></div>
                        </div>
                         <div>
                             <p class="text-sm font-semibold mb-2">روزهای تمرین در هفته</p>
                             <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                ${[2,3,4,5,6].map(day => `
                                     <label class="option-card-label">
                                        <input type="radio" name="training_days_user" value="${day}" class="option-card-input" ${step1?.trainingDays == day ? 'checked data-is-checked="true"' : ''}>
                                        <span class="option-card-content">${day} روز</span>
                                    </label>
                                `).join('')}
                             </div>
                             <div class="validation-message"></div>
                         </div>
                         <div>
                             <p class="text-sm font-semibold mb-2">سطح فعالیت روزانه</p>
                             <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                ${activityLevels.map(level => `
                                    <label class="option-card-label">
                                        <input type="radio" name="activity_level_user" value="${level.value}" class="option-card-input" ${step1?.activityLevel == level.value ? 'checked data-is-checked="true"' : ''}>
                                        <span class="option-card-content">${level.label}</span>
                                    </label>
                                `).join('')}
                             </div>
                             <div class="validation-message"></div>
                         </div>
                    </div>
                </div>
                
                <!-- Save Button -->
                <div class="card p-4 sticky bottom-4 z-10 shadow-lg">
                     <button type="submit" class="primary-button w-full !py-3">ذخیره و محاسبه مجدد</button>
                </div>
            </form>
        </div>
    `;

    container.querySelectorAll('.range-slider').forEach(slider => updateSliderTrack(slider as HTMLInputElement));
    updateProfileMetricsDisplay(container);
};

const openCoachSelectionModal = (currentUser: string) => {
    const modal = document.getElementById('user-dashboard-modal');
    const titleEl = document.getElementById('user-modal-title');
    const bodyEl = document.getElementById('user-modal-body');
    if (!modal || !titleEl || !bodyEl) return;

    const allUsers = getUsers();
    const verifiedCoaches = allUsers.filter((u: any) => u.role === 'coach' && u.coachStatus === 'verified');
    const currentUserData = getUserData(currentUser);
    selectedCoachInModal = currentUserData.step1?.coachName || null;

    titleEl.textContent = 'انتخاب مربی';

    const template = document.getElementById('coach-selection-option-template') as HTMLTemplateElement;

    if (!template) {
        bodyEl.innerHTML = '<p>خطا: قالب انتخاب مربی یافت نشد.</p>';
        openModal(modal);
        return;
    }

    bodyEl.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${verifiedCoaches.map((coach: any) => {
                const coachData = getUserData(coach.username);
                const name = coachData.step1?.clientName || coach.username;
                const specialization = coachData.profile?.specialization || 'مربی رسمی';
                const avatar = coachData.profile?.avatar;

                const clone = template.content.cloneNode(true) as DocumentFragment;
                const button = clone.querySelector('button')!;
                button.dataset.username = coach.username;
                if (coach.username === selectedCoachInModal) {
                    button.classList.add('selected-card');
                }

                const avatarEl = button.querySelector('.coach-avatar')!;
                if (avatar) {
                    avatarEl.innerHTML = `<img src="${avatar}" alt="${name}" class="w-full h-full object-cover">`;
                } else {
                    avatarEl.innerHTML = `<span class="text-3xl font-bold text-text-secondary">${name.charAt(0)}</span>`;
                }
                
                (button.querySelector('.coach-name') as HTMLElement).textContent = name;
                (button.querySelector('.coach-specialization') as HTMLElement).textContent = specialization;

                const tempDiv = document.createElement('div');
                tempDiv.appendChild(clone);
                return tempDiv.innerHTML;
            }).join('')}
        </div>
        <button id="confirm-coach-selection" class="primary-button w-full mt-6">تایید انتخاب</button>
    `;
    
    openModal(modal);
};

const renderHelpTab = () => {
    const container = document.getElementById('help-content');
    if (!container) return;

    container.innerHTML = `
        <div class="space-y-4 max-w-4xl mx-auto">
            <details class="card p-0 overflow-hidden" open>
                <summary class="p-4 cursor-pointer flex justify-between items-center font-bold text-lg">
                    <span><i data-lucide="play-circle" class="inline-block w-5 h-5 -mt-1 ml-2 text-accent"></i>شروع به کار</span>
                    <i data-lucide="chevron-down" class="details-arrow"></i>
                </summary>
                <div class="p-6 border-t border-border-primary bg-bg-tertiary/50">
                    <p class="mb-2">به FitGym Pro خوش آمدید! برای شروع سفر تناسب اندام خود، این مراحل را دنبال کنید:</p>
                    <ol class="list-decimal pr-5 space-y-2">
                        <li><strong>تکمیل پروفایل:</strong> به بخش «پروفایل» بروید و تمام اطلاعات خود را با دقت وارد کنید. این اطلاعات به مربی شما کمک می‌کند تا بهترین برنامه را برای شما طراحی کند.</li>
                        <li><strong>انتخاب مربی:</strong> مهم‌ترین قدم، انتخاب یک مربی از لیست مربیان تایید شده ما در بخش «پروفایل» است. تا زمانی که مربی انتخاب نکنید، نمی‌توانید پلن‌های تمرینی را خریداری کنید.</li>
                        <li><strong>خرید پلن:</strong> به بخش «فروشگاه» بروید و پلنی را که با اهداف شما مطابقت دارد، انتخاب و خریداری کنید.</li>
                        <li><strong>دریافت برنامه:</strong> پس از خرید، مربی شما مطلع می‌شود و برنامه اختصاصی شما را آماده و ارسال می‌کند. شما از طریق نوتیفیکیشن مطلع خواهید شد.</li>
                        <li><strong>شروع تمرین:</strong> برنامه خود را در بخش «برنامه من» مشاهده کرده و تمرینات خود را از داشبورد ثبت کنید!</li>
                    </ol>
                </div>
            </details>
            <details class="card p-0 overflow-hidden">
                <summary class="p-4 cursor-pointer flex justify-between items-center font-bold text-lg">
                    <span><i data-lucide="book-open" class="inline-block w-5 h-5 -mt-1 ml-2 text-accent"></i>درک برنامه شما</span>
                    <i data-lucide="chevron-down" class="details-arrow"></i>
                </summary>
                <div class="p-6 border-t border-border-primary bg-bg-tertiary/50">
                    <p>برنامه شما در بخش «برنامه من» به چند بخش تقسیم می‌شود:</p>
                    <ul class="list-disc pr-5 mt-2 space-y-2">
                        <li><strong>اطلاعات شما:</strong> خلاصه‌ای از مشخصات فیزیکی و اهداف شما که برنامه بر اساس آن طراحی شده است.</li>
                        <li><strong>برنامه تمرینی:</strong> شامل روزهای تمرینی، حرکات، تعداد ست، تکرار و زمان استراحت. حرکاتی که به صورت «سوپرست» مشخص شده‌اند، باید پشت سر هم و بدون استراحت انجام شوند.</li>
                        <li><strong>برنامه مکمل:</strong> لیست مکمل‌های پیشنهادی مربی با دوز و زمان مصرف مشخص.</li>
                        <li><strong>یادداشت مربی:</strong> توصیه‌های کلی مربی برای شما در این بخش قرار دارد. حتما آن را مطالعه کنید.</li>
                    </ul>
                </div>
            </details>
        </div>
    `;

    window.lucide?.createIcons();
};


export function initUserDashboard(currentUser: string, userData: any, handleLogout: () => void, handleGoToHome: () => void) {
    const mainContainer = document.getElementById('user-dashboard-container');
    if (!mainContainer) return;

    // Show a persistent banner if coach is not selected
    const globalNotificationPlaceholder = document.getElementById('global-user-notification-placeholder');
    const hasCoach = userData.step1?.coachName;
    if (globalNotificationPlaceholder && !hasCoach) {
        globalNotificationPlaceholder.innerHTML = `
            <div class="bg-black text-yellow-400 rounded-lg p-4 mb-6 flex items-center gap-3 animate-fade-in-down">
                <i data-lucide="alert-triangle" class="w-6 h-6"></i>
                <div>
                    <h4 class="font-bold">پروفایل شما ناقص است!</h4>
                    <p class="text-sm">برای استفاده از تمام امکانات و دریافت برنامه، لطفاً ابتدا از بخش <button class="font-bold underline" data-action="go-to-profile">پروفایل</button> مربی خود را انتخاب کنید.</p>
                </div>
            </div>
        `;
    }

    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('go-to-home-btn')?.addEventListener('click', handleGoToHome);

    const pageTitles: Record<string, { title: string, subtitle: string }> = {
        'dashboard-content': { title: 'داشبورد', subtitle: 'خلاصه فعالیت‌ها و پیشرفت شما.' },
        'program-content': { title: 'برنامه من', subtitle: 'برنامه تمرینی، مکمل‌ها و غذایی شما.' },
        'nutrition-content': { title: 'برنامه تغذیه', subtitle: 'برنامه غذایی اختصاصی شما.' },
        'chat-content': { title: 'گفتگو با مربی', subtitle: 'ارتباط مستقیم با مربی شما.' },
        'store-content': { title: 'فروشگاه', subtitle: 'پلن‌های عضویت خود را ارتقا دهید.' },
        'profile-content': { title: 'پروفایل', subtitle: 'اطلاعات فردی و اهداف خود را ویرایش کنید.' },
        'help-content': { title: 'راهنما', subtitle: 'پاسخ به سوالات متداول و راهنمایی‌ها.' }
    };

    const switchTab = (activeTab: Element) => {
        const targetId = activeTab.getAttribute('data-target');
        if (!targetId) return;

        if (activeTab.classList.contains('locked-feature')) {
            showToast('برای دسترسی به این بخش، لطفا پلن خود را ارتقا دهید.', 'error');
            return;
        }

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
        
        const freshUserData = getUserData(currentUser);
        clearNotification(currentUser, targetId);
        updateUserNotifications(currentUser);
        
        switch (targetId) {
            case 'dashboard-content':
                renderDashboardTab(currentUser, freshUserData);
                break;
            case 'program-content':
                renderUnifiedProgramView(freshUserData);
                break;
            case 'nutrition-content':
                renderNutritionTab(currentUser, freshUserData);
                break;
            case 'chat-content':
                 renderChatTab(currentUser, freshUserData);
                break;
            case 'store-content':
                renderStoreTab(currentUser);
                break;
            case 'profile-content':
                renderProfileTab(currentUser, freshUserData);
                break;
            case 'help-content':
                renderHelpTab();
                break;
        }
    };
    
    // Redirect logic from auth modal
    const redirectToTab = sessionStorage.getItem('fitgympro_redirect_to_tab');
    if (redirectToTab) {
        const tabButton = mainContainer.querySelector(`.coach-nav-link[data-target="${redirectToTab}"]`);
        if (tabButton) switchTab(tabButton);
        sessionStorage.removeItem('fitgympro_redirect_to_tab');
    } else {
        const defaultTab = mainContainer.querySelector('.coach-nav-link[data-target="dashboard-content"]');
        if(defaultTab) switchTab(defaultTab);
    }
    
    mainContainer.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const navLink = target.closest('.coach-nav-link');
        if (navLink) {
            switchTab(navLink);
            return;
        }

        if (target.dataset.action === 'go-to-profile') {
            const profileTab = mainContainer.querySelector('.coach-nav-link[data-target="profile-content"]');
            if (profileTab) switchTab(profileTab);
            return;
        }

        const actionBtn = target.closest<HTMLButtonElement>('button[data-action]');
        if (actionBtn) {
            const action = actionBtn.dataset.action;
            if (action === 'log-workout') {
                const dayIndex = parseInt(actionBtn.dataset.dayIndex || '-1', 10);
                const todayData = getTodayWorkoutData(getUserData(currentUser));
                if (todayData && dayIndex === todayData.dayIndex) {
                    openWorkoutLogModal(todayData.day, todayData.dayIndex, currentUser);
                }
            }
            if (action === 'go-to-store') {
                const storeTab = mainContainer.querySelector('.coach-nav-link[data-target="store-content"]');
                if (storeTab) switchTab(storeTab);
                return;
            }
        }

        if (target.closest('#save-program-pdf-btn')) {
            exportElement('#unified-program-view', 'pdf', `FitGymPro-Program.pdf`, target.closest('button') as HTMLButtonElement);
        }
        if (target.closest('#save-program-img-btn')) {
            exportElement('#unified-program-view', 'png', `FitGymPro-Program.png`, target.closest('button') as HTMLButtonElement);
        }
        
        const addToCartBtn = target.closest('.add-to-cart-btn');
        if (addToCartBtn && !(addToCartBtn as HTMLButtonElement).disabled) {
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
                    showToast('این پلن قبلا به سبد خرید اضافه شده.', 'error');
                }
            }
        }
        
        if (target.closest('.remove-from-cart-btn')) {
            const planId = (target.closest('.remove-from-cart-btn') as HTMLElement).dataset.planId;
            const cart = getCart(currentUser);
            cart.items = cart.items.filter((item: any) => item.planId !== planId);
            saveCart(currentUser, cart);
            updateCartSummary(currentUser);
        }

        if (target.closest('#apply-discount-btn')) {
            const code = (document.getElementById('discount-code-input') as HTMLInputElement).value.toUpperCase();
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
        
        if (target.closest('#checkout-btn')) {
             const cart = getCart(currentUser);
             if (cart.items.length === 0) return;

             const freshUserData = getUserData(currentUser);
             if (!freshUserData.subscriptions) freshUserData.subscriptions = [];

             cart.items.forEach((item: any) => {
                 freshUserData.subscriptions.push({
                     ...item,
                     purchaseDate: new Date().toISOString(),
                     fulfilled: false
                 });
             });
             
             saveUserData(currentUser, freshUserData);
             
             if (freshUserData.step1?.coachName) {
                setNotification(freshUserData.step1.coachName, 'students-content', '💰');
             }

             saveCart(currentUser, { items: [], discountCode: null });
             showToast('خرید شما با موفقیت انجام شد!', 'success');
             updateCartSummary(currentUser);
        }

        if (target.closest('#select-coach-btn')) {
            openCoachSelectionModal(currentUser);
        }

        if (target.id === 'go-to-store-from-nutrition' || target.id === 'go-to-profile-from-store') {
             const targetTab = target.id === 'go-to-store-from-nutrition' ? 'store-content' : 'profile-content';
             const tabButton = mainContainer.querySelector(`.coach-nav-link[data-target="${targetTab}"]`);
             if (tabButton) switchTab(tabButton);
        }

        const coachCard = target.closest('.coach-selection-card');
        if (coachCard) {
            selectedCoachInModal = (coachCard as HTMLElement).dataset.username || null;
            document.querySelectorAll('.coach-selection-card').forEach(c => c.classList.remove('selected-card'));
            coachCard.classList.add('selected-card');
        }

        if (target.closest('#confirm-coach-selection')) {
            const freshUserData = getUserData(currentUser);
            const oldCoach = freshUserData.step1?.coachName;
            
            if (selectedCoachInModal && oldCoach !== selectedCoachInModal) {
                freshUserData.step1.coachName = selectedCoachInModal;
                saveUserData(currentUser, freshUserData);
                
                setNotification(selectedCoachInModal, 'students-content', '👋');

                showToast('مربی شما با موفقیت تغییر کرد.', 'success');
                renderProfileTab(currentUser, freshUserData);
                renderStoreTab(currentUser); // Re-render store to enable buttons
                
                const coachData = getUserData(selectedCoachInModal);
                const coachName = coachData?.step1?.clientName || selectedCoachInModal;
                const coachNameEl = mainContainer.querySelector('.flex.items-center.gap-3.bg-bg-secondary .text-xs.text-text-secondary');
                if(coachNameEl) coachNameEl.textContent = `مربی: ${coachName}`;
            }
            closeModal(document.getElementById('user-dashboard-modal'));
            return;
        }
    });

    const handleProfileFormUpdate = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const form = target.closest<HTMLFormElement>('#user-profile-form');
        if (form) {
            if (target.matches('.range-slider')) {
                const labelSpan = target.previousElementSibling?.querySelector('span');
                if (labelSpan) labelSpan.textContent = target.value;
                updateSliderTrack(target);
            }
            updateProfileMetricsDisplay(form);
        }
    };
    
    mainContainer.addEventListener('input', handleProfileFormUpdate);
    mainContainer.addEventListener('change', handleProfileFormUpdate);

    mainContainer.addEventListener('submit', e => {
        const form = e.target as HTMLFormElement;
        e.preventDefault();

        if (form.id === 'user-profile-form') {
            form.querySelectorAll('.validation-message').forEach(el => el.textContent = '');
            form.querySelectorAll('.input-field.input-error').forEach(el => el.classList.remove('input-error'));
            let isValid = true;
            
            const clientNameInput = form.querySelector('#user-profile-name') as HTMLInputElement;
            if (!clientNameInput.value.trim()) {
                isValid = false;
                const validationEl = clientNameInput.closest('.input-group-with-icon')?.parentElement.querySelector('.validation-message');
                if(validationEl) validationEl.textContent = 'نام الزامی است.';
                clientNameInput.classList.add('input-error');
            }
            
            const freshUserData = getUserData(currentUser);
            if (!freshUserData.step1?.coachName) {
                isValid = false;
                const validationEl = form.querySelector('#select-coach-btn')?.nextElementSibling;
                if (validationEl && validationEl.classList.contains('validation-message')) {
                    validationEl.innerHTML = `<div class="coach-selection-warning"><i data-lucide="alert-triangle" class="w-4 h-4"></i><span>انتخاب مربی الزامی است.</span></div>`;
                    window.lucide?.createIcons();
                }
            }

            const checkRadioGroup = (name: string, message: string) => {
                const group = form.querySelector(`input[name="${name}"]`)?.closest('.option-card-label')?.parentElement?.parentElement;
                if (!group) return;
                const value = (group.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement)?.value;
                if (!value) {
                    isValid = false;
                    const validationEl = group.querySelector('.validation-message');
                    if (validationEl) validationEl.textContent = message;
                }
            };
            
            checkRadioGroup('gender_user', 'انتخاب جنسیت الزامی است.');
            checkRadioGroup('training_goal_user', 'انتخاب هدف الزامی است.');
            checkRadioGroup('training_days_user', 'انتخاب روزهای تمرین الزامی است.');
            checkRadioGroup('activity_level_user', 'انتخاب سطح فعالیت الزامی است.');
            
            if (!isValid) {
                showToast('لطفا تمام فیلدهای الزامی را کامل کنید.', 'error');
                return;
            }

            if (!freshUserData.profile) freshUserData.profile = {};
            freshUserData.profile.avatar = (form.querySelector('#user-profile-avatar') as HTMLInputElement).value.trim();

            const getFloatOrUndefined = (value: string): number | undefined => {
                const num = parseFloat(value);
                return isNaN(num) || num <= 0 ? undefined : num;
            };
        
            const formData = {
                clientName: (form.querySelector('#user-profile-name') as HTMLInputElement).value,
                mobile: (form.querySelector('#user-profile-mobile') as HTMLInputElement).value,
                gender: (form.querySelector('input[name="gender_user"]:checked') as HTMLInputElement)?.value,
                age: parseInt((form.querySelector('input[name="age"]') as HTMLInputElement).value, 10),
                height: parseInt((form.querySelector('input[name="height"]') as HTMLInputElement).value, 10),
                weight: parseFloat((form.querySelector('input[name="weight"]') as HTMLInputElement).value),
                neck: getFloatOrUndefined((form.querySelector('.neck-input') as HTMLInputElement).value),
                waist: getFloatOrUndefined((form.querySelector('.waist-input') as HTMLInputElement).value),
                hip: getFloatOrUndefined((form.querySelector('.hip-input') as HTMLInputElement).value),
                trainingGoal: (form.querySelector('input[name="training_goal_user"]:checked') as HTMLInputElement)?.value,
                trainingDays: parseInt((form.querySelector('input[name="training_days_user"]:checked') as HTMLInputElement)?.value, 10),
                activityLevel: parseFloat((form.querySelector('input[name="activity_level_user"]:checked') as HTMLInputElement)?.value),
            };
        
            const metrics = performMetricCalculations({
                ...formData,
                gender: formData.gender || 'مرد', 
                activityLevel: formData.activityLevel || 1.55, 
            });
        
            const newStep1Data = {
                ...freshUserData.step1,
                ...formData,
                tdee: metrics ? metrics.tdee : null,
            };
        
            freshUserData.step1 = newStep1Data;
            freshUserData.lastProfileUpdate = new Date().toISOString();
            saveUserData(currentUser, freshUserData);
        
            let toastMessage = 'پروفایل شما با موفقیت به‌روزرسانی شد.';
            if (freshUserData.step1.coachName) {
                setNotification(freshUserData.step1.coachName, 'students-content', '📝');
                toastMessage = 'مشخصات شما با موفقیت برای مربی ارسال شد.';
                 const globalNotificationPlaceholder = document.getElementById('global-user-notification-placeholder');
                if(globalNotificationPlaceholder) globalNotificationPlaceholder.innerHTML = '';
            }
            showToast(toastMessage, 'success');
            renderProfileTab(currentUser, freshUserData); // Re-render to show updated state
            // Also re-render the header
            const headerNameEl = mainContainer.querySelector('.flex.items-center.gap-3.bg-bg-secondary .font-bold.text-sm');
            if(headerNameEl) headerNameEl.textContent = newStep1Data.clientName;
            const headerAvatarContainer = mainContainer.querySelector('.flex.items-center.gap-3.bg-bg-secondary')?.firstElementChild;
            if(headerAvatarContainer) {
                 const avatarUrl = freshUserData.profile?.avatar;
                 const name = newStep1Data.clientName || currentUser;
                 const avatarHtml = avatarUrl
                    ? `<img src="${avatarUrl}" alt="${name}" class="w-10 h-10 rounded-full object-cover">`
                    : `<div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg text-bg-secondary" style="background-color: var(--accent);">
                           ${name.substring(0, 1).toUpperCase()}
                       </div>`;
                headerAvatarContainer.outerHTML = avatarHtml;
            }
        }
        
        if (form.id === 'user-chat-form') {
            const input = form.querySelector('#user-chat-input') as HTMLInputElement;
            const message = input.value.trim();
            if (message) {
                const freshUserData = getUserData(currentUser);
                if (!freshUserData.chatHistory) freshUserData.chatHistory = [];
                freshUserData.chatHistory.push({
                    sender: 'user',
                    message: message,
                    timestamp: new Date().toISOString()
                });
                saveUserData(currentUser, freshUserData);
                
                const coachUsername = freshUserData.step1.coachName;
                if(coachUsername) {
                    setNotification(coachUsername, 'chat-content', '💬');
                }
                
                input.value = '';
                renderChatTab(currentUser, freshUserData);
            }
        }
        if (form.id === 'workout-log-form') {
            const dayIndex = parseInt(form.dataset.dayIndex || '-1', 10);
            if (dayIndex === -1) return;

            const exercisesLog: any[] = [];
            form.querySelectorAll('.exercise-log-item').forEach(exItem => {
                const exerciseName = (exItem.querySelector('h4') as HTMLElement).textContent;
                const setsLog: any[] = [];
                exItem.querySelectorAll('.set-log-row').forEach(setRow => {
                    const weight = (setRow.querySelector('.weight-log-input') as HTMLInputElement).value;
                    const reps = (setRow.querySelector('.reps-log-input') as HTMLInputElement).value;
                    if(weight && reps) { // Only log completed sets
                        setsLog.push({ weight, reps });
                    }
                });
                if (setsLog.length > 0) {
                    exercisesLog.push({ name: exerciseName, sets: setsLog });
                }
            });

            if (exercisesLog.length > 0) {
                const freshUserData = getUserData(currentUser);
                if (!freshUserData.workoutHistory) freshUserData.workoutHistory = [];
                freshUserData.workoutHistory.push({
                    date: new Date().toISOString(),
                    dayIndex,
                    exercises: exercisesLog
                });
                saveUserData(currentUser, freshUserData);
                
                addActivityLog(`${currentUser} یک تمرین ثبت کرد.`);
                if (freshUserData.step1.coachName) {
                    setNotification(freshUserData.step1.coachName, 'students-content', '💪');
                }

                showToast('تمرین شما با موفقیت ثبت شد!', 'success');
                closeModal(document.getElementById('user-dashboard-modal'));
                renderDashboardTab(currentUser, freshUserData); // Re-render dashboard
            } else {
                showToast('لطفا حداقل یک ست را ثبت کنید.', 'error');
            }
        }
    });

    const modal = document.getElementById('user-dashboard-modal');
    modal?.addEventListener('click', e => { if ((e.target as HTMLElement).id === 'user-dashboard-modal') closeModal(modal); });
    document.getElementById('close-user-modal-btn')?.addEventListener('click', () => closeModal(modal));
}
