import { getUserData, saveUserData, addActivityLog, getCart, saveCart, getDiscounts, getNotifications, clearNotification, setNotification, getStorePlans, getUsers } from '../services/storage';
import { getTodayWorkoutData, calculateBodyMetrics, calculateWorkoutStreak } from '../utils/calculations';
import { showToast, updateSliderTrack, openModal, closeModal, exportElement } from '../utils/dom';
import { setWeightChartInstance, getWeightChartInstance } from '../state';
import { generateNutritionPlan } from '../services/gemini';
import { sanitizeHTML } from '../utils/dom';
import { formatPrice, timeAgo } from '../utils/helpers';

let weightLogCountdownInterval: number | null = null;
let selectedCoachInModal: string | null = null;

const startWeightCountdown = (currentUser: string) => {
    if (weightLogCountdownInterval) clearInterval(weightLogCountdownInterval);
    
    const countdownContainer = document.getElementById('weight-log-countdown');
    if (!countdownContainer) return;
    
    const nextLogTimestamp = parseInt(countdownContainer.dataset.nextLogTimestamp || '0', 10);
    if (!nextLogTimestamp || nextLogTimestamp < Date.now()) {
        const freshData = getUserData(currentUser);
        renderBodyMetricsCard(freshData, 'body-metrics-container');
        return;
    };

    const update = () => {
        const remaining = nextLogTimestamp - Date.now();
        const timerTextEl = document.getElementById('countdown-timer-text');
        
        if (remaining <= 0) {
            clearInterval(weightLogCountdownInterval!);
            weightLogCountdownInterval = null;
            const freshData = getUserData(currentUser);
            renderBodyMetricsCard(freshData, 'body-metrics-container');
            return;
        }

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        if (timerTextEl) {
             timerTextEl.textContent = `${days} روز و ${hours} ساعت و ${minutes} دقیقه و ${seconds} ثانیه`;
        }
    };
    update();
    weightLogCountdownInterval = window.setInterval(update, 1000);
}


export const updateUserNotifications = (currentUser: string) => {
    const notifications = getNotifications(currentUser);
    const dashboardContainer = document.getElementById('user-dashboard-container');
    if (!dashboardContainer) return;

    dashboardContainer.querySelectorAll('.user-dashboard-tab').forEach(tab => {
        const targetId = tab.getAttribute('data-target');
        const badge = tab.querySelector('.notification-badge') as HTMLElement;
        if (!targetId || !badge) return;

        if (notifications[targetId]) {
            badge.textContent = notifications[targetId];
            // Only add 'visible' if it's not already there to trigger animation once.
            if (!badge.classList.contains('visible')) {
                badge.classList.add('visible');
            }
        } else {
            badge.classList.remove('visible');
        }
    });
};

const calculateUserMetrics = (data: any) => {
    if (!data || !data.age || !data.height || !data.weight || !data.gender) {
        return {};
    }

    const s = parseFloat(String(data.age)),
        r = parseFloat(String(data.height)),
        a = parseFloat(String(data.weight)),
        n = data.gender,
        c = parseFloat(String(data.neck)),
        g = parseFloat(String(data.waist)),
        x = parseFloat(String(data.hip));

    const isMale = n === "مرد";
    const heightInMeters = r / 100;

    let bmi = 0;
    if (heightInMeters > 0) {
        bmi = a / (heightInMeters * heightInMeters);
    }
    const bmr = isMale ? 10 * a + 6.25 * r - 5 * s + 5 : 10 * a + 6.25 * r - 5 * s - 161;
    const tdee = bmr * (parseFloat(String(data.activityLevel)) || 1.55);

    let bodyFat = 0;
    if (!isNaN(c) && !isNaN(g) && c > 0 && g > 0 && r > 0) {
        if (isMale) {
            bodyFat = 86.01 * Math.log10(g - c) - 70.041 * Math.log10(r) + 36.76;
        } else if (!isNaN(x) && x > 0) {
            bodyFat = 163.205 * Math.log10(g + x - c) - 97.684 * Math.log10(r) - 78.387;
        }
    }

    const lbm = bodyFat > 0 && bodyFat < 100 ? a * (1 - bodyFat / 100) : null;

    return {
        bmi: bmi ? bmi.toFixed(1) : 'N/A',
        bmr: bmr ? Math.round(bmr) : 'N/A',
        tdee: tdee ? String(Math.round(tdee)) : 'N/A',
        bodyFat: (bodyFat > 0 && bodyFat < 100) ? bodyFat.toFixed(1) : 'N/A',
        lbm: lbm ? lbm.toFixed(1) : 'N/A'
    };
};


const renderUnifiedProgramView = (userData: any) => {
    const container = document.getElementById('program-content');
    if (!container) return;

    // Find the latest program from history, fallback to top-level step2 for old data structure.
    const latestProgram = (userData.programHistory && userData.programHistory.length > 0)
        ? userData.programHistory[0]
        : (userData.step2 ? { step2: userData.step2, supplements: userData.supplements || [] } : null);

    // Check if a valid program with at least one exercise exists
    const hasProgram = latestProgram && latestProgram.step2 && latestProgram.step2.days && latestProgram.step2.days.some((d: any) => d.exercises && d.exercises.length > 0);

    if (!hasProgram) {
        container.innerHTML = `<div class="card p-8 text-center text-text-secondary"><i data-lucide="folder-x" class="w-12 h-12 mx-auto mb-4"></i><p>هنوز برنامه‌ای برای شما ثبت نشده است. مربی شما به زودی برنامه را ارسال خواهد کرد.</p></div>`;
        window.lucide?.createIcons();
        return;
    }

    const { step1: student } = userData;
    const { step2: workout, supplements } = latestProgram;
    const metrics = calculateUserMetrics(student);
    const dayColors = ['#3b82f6', '#ef4444', '#f97316', '#10b981', '#a855f7', '#ec4899', '#f59e0b'];

    // --- BMI Calculation for indicator ---
    const bmi = parseFloat(metrics.bmi);
    let bmiIndicatorPosition = -10; // Default off-screen
    let bmiColorClass = 'text-text-primary';

    if (!isNaN(bmi)) {
        const minBmi = 15;
        const maxBmi = 40;
        let percentage = (bmi - minBmi) / (maxBmi - minBmi) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        // The indicator is 20px wide, so offset by 10px to center it
        bmiIndicatorPosition = percentage;

        if (bmi < 18.5) {
            bmiColorClass = 'text-blue-400';
        } else if (bmi < 25) {
            bmiColorClass = 'text-green-400';
        } else if (bmi < 30) {
            bmiColorClass = 'text-yellow-400';
        } else {
            bmiColorClass = 'text-red-400';
        }
    }
    // --- End BMI Calculation ---

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
                    <div><span>TDEE:</span> <strong>${metrics.tdee || 'N/A'} kcal</strong></div>
                </div>
                
                <div class="mt-4">
                    <div class="flex justify-between items-center mb-1">
                        <h4 class="font-semibold text-sm">شاخص توده بدنی (BMI)</h4>
                        <span class="font-bold text-lg ${bmiColorClass}">${metrics.bmi}</span>
                    </div>
                    <div class="w-full bg-bg-tertiary rounded-full h-2.5 relative" title="آبی: کمبود وزن, سبز: نرمال, زرد: اضافه وزن, قرمز: چاقی">
                        <div class="absolute top-0 left-0 h-full rounded-l-full bg-blue-500" style="width: 14%;"></div>
                        <div class="absolute top-0 h-full bg-green-500" style="left: 14%; width: 26%;"></div>
                        <div class="absolute top-0 h-full bg-yellow-500" style="left: 40%; width: 20%;"></div>
                        <div class="absolute top-0 h-full rounded-r-full bg-red-500" style="left: 60%; width: 40%;"></div>
                        <div class="absolute -top-1 w-5 h-5 rounded-full bg-white border-2 border-accent shadow-lg transition-all duration-500 ease-out" style="left: calc(${bmiIndicatorPosition}% - 10px);">
                                <div class="w-full h-full rounded-full bg-accent/30"></div>
                        </div>
                    </div>
                    <div class="flex justify-between text-xs text-text-secondary mt-1 px-1">
                        <span>۱۸.۵</span>
                        <span>۲۵</span>
                        <span>۳۰</span>
                    </div>
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
        const exerciseTemplate = document.getElementById('exercise-log-template') as HTMLTemplateElement;
        const exNode = exerciseTemplate.content.cloneNode(true) as DocumentFragment;
        (exNode.querySelector('h4') as HTMLElement).textContent = ex.name;
        
        const setsContainer = exNode.querySelector('.sets-log-container') as HTMLElement;
        for (let i = 0; i < ex.sets; i++) {
            const setTemplate = document.getElementById('set-log-row-template') as HTMLTemplateElement;
            const setNode = setTemplate.content.cloneNode(true) as DocumentFragment;
            (setNode.querySelector('.font-semibold') as HTMLElement).textContent = `ست ${i + 1}`;
            (setNode.querySelector('.reps-log-input') as HTMLInputElement).placeholder = `تکرار (${ex.reps})`;
            // Hide plus button on all but the last row for now to simplify
            if (i < ex.sets - 1) {
                (setNode.querySelector('.add-set-btn') as HTMLElement).style.display = 'none';
            }
             (setNode.querySelector('.add-set-btn') as HTMLElement).style.display = 'none';
            setsContainer.appendChild(setNode);
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(exNode);
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
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))); // Assuming Monday is the start of the week
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutDatesThisWeek = history
        .map(log => new Date(log.date))
        .filter(date => date >= startOfWeek);
        
    const uniqueDays = new Set(workoutDatesThisWeek.map(date => date.toDateString()));
    return uniqueDays.size;
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

    const circumference = 2 * Math.PI * 55; // For the gauge
    // Initial offset for animation
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
                    شروع تمرین
                </button>
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
                     <div class="icon-container" style="--icon-bg: var(--admin-accent-orange);"><i data-lucide="gauge-circle" class="w-6 h-6 text-white"></i></div>
                    <div>
                        <p class="kpi-value">${lastWeight} <span class="text-lg">kg</span></p>
                        <p class="kpi-label">آخرین وزن</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="card p-6 lg:col-span-2 animate-fade-in-up" style="animation-delay: 400ms;">
                    <h3 class="font-bold text-lg mb-4">پیشرفت این هفته</h3>
                    <div class="flex flex-col md:flex-row items-center gap-6">
                        <div class="gauge flex-shrink-0" style="width: 150px; height: 150px;">
                            <svg id="weekly-progress-gauge" class="gauge-svg" viewBox="0 0 120 120">
                                <circle class="gauge-track" r="55" cx="60" cy="60" stroke-width="10"></circle>
                                <circle class="gauge-value" r="55" cx="60" cy="60" stroke-width="10" style="stroke:var(--accent); stroke-dasharray: ${circumference}; stroke-dashoffset: ${initialDashoffset};"></circle>
                            </svg>
                            <div class="gauge-text">
                                <span class="gauge-number text-4xl">${workoutsThisWeek}</span>
                                <span class="gauge-label">از ${weeklyGoal} روز</span>
                            </div>
                        </div>
                        <div class="flex-grow w-full text-center md:text-right">
                             <h4 class="font-bold text-xl">آفرین، ادامه بده!</h4>
                             <p class="text-text-secondary mt-2">شما <strong>${workoutsThisWeek}</strong> جلسه از <strong>${weeklyGoal}</strong> جلسه هفتگی خود را تکمیل کرده‌اید. برای رسیدن به اهدافتان عالی پیش می‌روید!</p>
                        </div>
                    </div>
                </div>
                <div class="animate-fade-in-up" style="animation-delay: 500ms;">
                    ${todayWorkoutHtml}
                </div>
            </div>
        </div>
    `;
    
    window.lucide?.createIcons();

    // Trigger gauge animation
    setTimeout(() => {
        const gaugeValue = document.querySelector('#weekly-progress-gauge .gauge-value');
        if (gaugeValue) {
            const finalDashoffset = circumference * (1 - weeklyProgress / 100);
            (gaugeValue as SVGCircleElement).style.strokeDashoffset = `${finalDashoffset}`;
        }
    }, 100); // Small delay for CSS transition
};


const renderNutritionTab = (userData: any) => {
    const container = document.getElementById('nutrition-content-wrapper');
    if (!container) return;

    const latestProgram = (userData.programHistory && userData.programHistory.length > 0) ? userData.programHistory[0] : userData;
    const nutritionPlan = latestProgram.nutritionPlan;

    if (nutritionPlan && typeof nutritionPlan === 'object' && nutritionPlan.weeklyPlan) {
        const plan = nutritionPlan;
        const dayColors = ['#3b82f6', '#ef4444', '#f97316', '#10b981', '#a855f7', '#ec4899', '#f59e0b'];
        const planHtml = `
            <div class="program-page nutrition-plan-text !p-0 !max-w-none !bg-transparent relative" id="nutrition-plan-render-area">
                <div class="watermark-text-overlay">FitGym Pro</div>
                ${(plan.weeklyPlan || []).map((day: any, index: number) => {
                    const dayColor = dayColors[index % dayColors.length];
                    return `
                    <details class="day-card card !shadow-none !border mb-2" open>
                        <summary class="font-bold cursor-pointer flex justify-between items-center p-3" style="border-right: 4px solid ${dayColor}; background-color: color-mix(in srgb, ${dayColor} 10%, transparent);">
                            <span>${day.dayName}</span>
                            <i data-lucide="chevron-down" class="details-arrow"></i>
                        </summary>
                        <div class="p-3 border-t border-border-primary">
                            ${(day.meals || []).map((meal: any) => `
                                <div>
                                    <h4 class="font-semibold text-accent mt-3 mb-2 text-md border-r-2 border-accent pr-2">${meal.mealName}</h4>
                                    <ul class="list-disc pr-4 space-y-1">
                                        ${(meal.options || []).map((option: string) => `<li>${sanitizeHTML(option)}</li>`).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                    </details>
                `}).join('')}

                ${plan.generalTips && plan.generalTips.length > 0 ? `
                    <div class="preview-notes-pro mt-6">
                        <h4 class="font-bold mb-3">نکات مهم و عمومی</h4>
                        <ul class="space-y-2">
                             ${plan.generalTips.map((tip: string) => `<li class="flex items-start gap-2"><i data-lucide="check-circle" class="w-4 h-4 text-accent mt-1 flex-shrink-0"></i><span>${sanitizeHTML(tip)}</span></li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
        container.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                 <h2 class="text-xl font-bold">برنامه غذایی شما</h2>
            </div>
            <div id="nutrition-plan-content">${planHtml}</div>
            <div class="flex justify-center items-center gap-4 mt-6 pt-6 border-t border-border-primary">
                <button id="save-nutrition-img-btn" class="png-button"><i data-lucide="image" class="w-4 h-4 ml-2"></i> ذخیره عکس</button>
                <button id="save-nutrition-pdf-btn" class="pdf-button"><i data-lucide="file-down" class="w-4 h-4 ml-2"></i> ذخیره PDF</button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="card p-8 text-center text-text-secondary">
                <i data-lucide="utensils-crossed" class="w-12 h-12 mx-auto mb-4"></i>
                <h3 class="font-bold text-lg">برنامه غذایی شما آماده نیست</h3>
                <p class="mt-2">مربی شما هنوز برنامه غذایی را ارسال نکرده است. لطفاً منتظر بمانید یا از طریق بخش گفتگو با مربی خود در ارتباط باشید.</p>
            </div>
        `;
    }
    window.lucide?.createIcons();
};

const initWeightChart = (userData: any, canvasId: string = 'weight-chart') => {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx || !window.Chart) return;

    const existingChart = window.Chart.getChart(ctx);
    if(existingChart) {
        existingChart.destroy();
    }
    if (canvasId === 'weight-chart' && getWeightChartInstance()) {
        getWeightChartInstance()?.destroy();
    }

    const weightHistory = userData.weightHistory || [];
    const labels = weightHistory.map((entry: any) => new Date(entry.date).toLocaleDateString('fa-IR'));
    const data = weightHistory.map((entry: any) => entry.weight);

    const chartInstance = new window.Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'وزن (کیلوگرم)',
                data: data,
                borderColor: 'var(--accent)',
                backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                fill: true,
                tension: 0.3,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: false, grid: { color: 'var(--border-primary)' } },
                x: { grid: { display: false } }
            }
        }
    });
    
    if (canvasId === 'weight-chart') {
       setWeightChartInstance(chartInstance);
    }
    return chartInstance;
};

const renderBodyMetricsCard = (userData: any, containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const lastWeight = (userData.weightHistory && userData.weightHistory.length > 0) 
        ? userData.weightHistory.slice(-1)[0].weight 
        : (userData.step1?.weight || null);
    
    const firstWeight = (userData.weightHistory && userData.weightHistory.length > 0)
        ? userData.weightHistory[0].weight
        : (userData.step1?.weight || null);

    const weightChange = (lastWeight && firstWeight) ? lastWeight - firstWeight : 0;

    const height = userData.step1?.height;
    const bmi = (height && lastWeight > 0) ? (lastWeight / ((height / 100) ** 2)) : null;
    
    const lastWeightLog = userData.weightHistory?.slice(-1)[0];
    let nextLogAvailableTimestamp = 0;
    if (lastWeightLog) {
        const lastLogTime = new Date(lastWeightLog.date).getTime();
        const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
        nextLogAvailableTimestamp = lastLogTime + sevenDaysInMillis;
    }

    let formHtml = '';
    if (nextLogAvailableTimestamp > Date.now()) {
        formHtml = `
            <div id="weight-log-countdown" data-next-log-timestamp="${nextLogAvailableTimestamp}" class="text-center p-3 bg-bg-tertiary rounded-lg">
                <p class="font-semibold text-text-secondary text-sm">ثبت بعدی فعال می‌شود تا:</p>
                <p id="countdown-timer-text" class="text-lg font-bold text-accent mt-1"></p>
            </div>
        `;
    } else {
        formHtml = `
            <form id="weight-log-form" class="flex gap-2">
                <input type="number" step="0.1" id="new-weight-input" class="input-field w-full !py-2" placeholder="ثبت وزن امروز (kg)">
                <button type="submit" class="primary-button !p-2.5"><i data-lucide="plus" class="w-5 h-5"></i></button>
            </form>
        `;
    }

    container.innerHTML = `
        <div id="body-metrics-card" class="card p-4 md:p-6 animate-fade-in">
            <h2 class="text-xl font-bold mb-4">پیگیری پیشرفت</h2>
            <div class="grid grid-cols-2 gap-4 mb-6 text-center">
                <div>
                    <p class="text-sm text-text-secondary">وزن فعلی (kg)</p>
                    <p class="text-3xl font-bold">${lastWeight ? lastWeight.toFixed(1) : '—'}</p>
                </div>
                <div>
                    <p class="text-sm text-text-secondary">تغییر از ابتدا</p>
                    <p class="text-3xl font-bold flex items-center justify-center gap-1 ${weightChange > 0.1 ? 'text-red-500' : (weightChange < -0.1 ? 'text-green-500' : 'text-text-secondary')}">
                        ${weightChange !== 0 ? `<i data-lucide="${weightChange > 0 ? 'trending-up' : 'trending-down'}" class="w-6 h-6"></i>` : ''}
                        ${weightChange >= 0 ? '+' : ''}${weightChange.toFixed(1)}
                    </p>
                </div>
            </div>
            
            <div class="h-48 mb-4"><canvas id="weight-chart"></canvas></div>
            ${formHtml}
        </div>`;

    
    window.lucide?.createIcons();
    initWeightChart(userData, 'weight-chart');
};

const toggleProfileLock = (locked: boolean) => {
    const fieldset = document.getElementById('profile-fieldset') as HTMLFieldSetElement;
    const saveBtn = document.getElementById('save-profile-btn');
    const editBtn = document.getElementById('edit-profile-btn');

    if (fieldset) {
        fieldset.disabled = locked;
        fieldset.classList.toggle('opacity-70', locked);
    }
    if (saveBtn) {
        (saveBtn as HTMLElement).style.display = locked ? 'none' : 'block';
    }
    if (editBtn) {
        (editBtn as HTMLElement).style.display = locked ? 'flex' : 'none';
    }
}

const updateProfileMetricsAndIndicator = (form: HTMLElement) => {
    const metricsResult = calculateBodyMetrics(form);
    
    if (metricsResult) {
        const bmiIndicator = document.getElementById('profile-bmi-indicator');
        if (bmiIndicator && metricsResult.bmi) {
            const bmi = metricsResult.bmi;
            const minBmi = 15;
            const maxBmi = 40;
            let percentage = (bmi - minBmi) / (maxBmi - minBmi) * 100;
            percentage = Math.max(0, Math.min(100, percentage));
            setTimeout(() => {
                const offset = bmiIndicator.offsetWidth / 2;
                bmiIndicator.style.left = `calc(${percentage}% - ${offset}px)`;
            }, 50);
        } else if (bmiIndicator) {
            bmiIndicator.style.left = '-10px';
        }

        const bmiEl = form.querySelector('.bmi-input');
        if (bmiEl && metricsResult.bmi) {
            bmiEl.classList.remove('text-blue-400', 'text-green-400', 'text-yellow-400', 'text-red-400');
            let colorClass = 'text-text-primary';
            const bmi = metricsResult.bmi;
            if (bmi < 18.5) colorClass = 'text-blue-400';
            else if (bmi < 25) colorClass = 'text-green-400';
            else if (bmi < 30) colorClass = 'text-yellow-400';
            else colorClass = 'text-red-400';
            bmiEl.classList.add(colorClass);
        }

        const bmrEl = form.querySelector('.bmr-input');
        if (bmrEl) bmrEl.classList.add('text-accent');
        const tdeeEl = form.querySelector('.tdee-input');
        if (tdeeEl) tdeeEl.classList.add('text-accent');
        const bodyfatEl = form.querySelector('.bodyfat-input');
        if (bodyfatEl) bodyfatEl.classList.add('text-orange-400');
        const lbmEl = form.querySelector('.lbm-input');
        if (lbmEl) lbmEl.classList.add('text-blue-400');
        const idealWeightEl = form.querySelector('.ideal-weight-input');
        if (idealWeightEl) idealWeightEl.classList.add('text-text-secondary');
    }
}


const populateProfileForm = (userData: any) => {
    const form = document.getElementById('user-profile-form') as HTMLFormElement;
    if (!form || !userData.step1) return;

    const data = userData.step1;

    const nameEl = document.getElementById('profile-user-name');
    const emailEl = document.getElementById('profile-user-email');
    if (nameEl) nameEl.textContent = data.clientName || 'کاربر';
    if (emailEl) emailEl.textContent = data.clientEmail || 'ایمیل ثبت نشده';

    (form.querySelector('input[name="mobile_user"]') as HTMLInputElement).value = data.mobile || '';
    
    const trainingGoal = data.trainingGoal || 'افزایش حجم';
    const trainingGoalRadio = form.querySelector(`input[name="training_goal_user"][value="${trainingGoal}"]`) as HTMLInputElement;
    if (trainingGoalRadio) trainingGoalRadio.checked = true;

    const athleteType = data.athleteType;
    if (athleteType) {
        const athleteTypeRadio = form.querySelector(`input[name="athlete_type_user"][value="${athleteType}"]`) as HTMLInputElement;
        if (athleteTypeRadio) athleteTypeRadio.checked = true;
    }

    const trainingDays = (data.trainingDays || 4).toString();
    const trainingDaysRadio = form.querySelector(`input[name="training_days_user"][value="${trainingDays}"]`) as HTMLInputElement;
    if (trainingDaysRadio) trainingDaysRadio.checked = true;

    const activityLevel = (data.activityLevel || 1.55).toString();
    const activityLevelRadio = form.querySelector(`input[name="activity_level_user"][value="${activityLevel}"]`) as HTMLInputElement;
    if (activityLevelRadio) activityLevelRadio.checked = true;

    (form.querySelector('.age-slider') as HTMLInputElement).value = data.age || 25;
    (form.querySelector('.height-slider') as HTMLInputElement).value = data.height || 175;
    (form.querySelector('.weight-slider') as HTMLInputElement).value = data.weight || 75;
    (form.querySelector('.neck-input') as HTMLInputElement).value = data.neck || '';
    (form.querySelector('.waist-input') as HTMLInputElement).value = data.waist || '';
    (form.querySelector('.hip-input') as HTMLInputElement).value = data.hip || '';
    
    form.querySelectorAll('.range-slider').forEach(slider => {
        const s = slider as HTMLInputElement;
        const valueDisplay = s.closest('.slider-group')?.querySelector('.value-display');
        if (valueDisplay) (valueDisplay as HTMLElement).textContent = s.value;
        updateSliderTrack(s);
    });

    const genderRadio = form.querySelector(`input[name="gender_user"][value="${data.gender}"]`) as HTMLInputElement;
    if (genderRadio) genderRadio.checked = true;

    updateProfileMetricsAndIndicator(form);
    
    const isLocked = data.profileLocked === true;
    toggleProfileLock(isLocked);
};

const updateCartBadge = (currentUser: string) => {
    const cart = getCart(currentUser);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const count = cart.items.length;
        badge.textContent = count.toString();
        badge.classList.toggle('hidden', count === 0);
    }
};

const renderStoreTab = (currentUser: string) => {
    const container = document.getElementById('store-content');
    if (!container) return;

    const userData = getUserData(currentUser);
    const cart = getCart(currentUser);
    const plans = getStorePlans();
    const allCoaches = getUsers().filter((u: any) => u.role === 'coach' && u.coachStatus === 'verified');
    const selectedCoachUsername = userData.step1?.coachName;
    const hasCoachSelected = !!selectedCoachUsername;

    let step1Html = '';
    if (hasCoachSelected) {
        const coach = allCoaches.find(c => c.username === selectedCoachUsername);
        const coachData = getUserData(selectedCoachUsername);
        const coachName = coachData.step1?.clientName || selectedCoachUsername;
        const specialization = coachData.profile?.specialization || 'مربی رسمی';
        const avatar = coachData.profile?.avatar;
        const avatarHtml = avatar
            ? `<img src="${avatar}" alt="${coachName}" class="w-12 h-12 rounded-full object-cover flex-shrink-0">`
            : `<div class="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg text-white" style="background-color: var(--admin-accent-gray);">${coachName.charAt(0).toUpperCase()}</div>`;

        step1Html = `
            <h2 class="text-xl font-bold mb-4">قدم ۱: مربی شما انتخاب شد</h2>
            <div class="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg">
                <div class="flex items-center gap-4">
                    ${avatarHtml}
                    <div>
                        <p class="font-bold">${coachName}</p>
                        <p class="text-sm text-text-secondary">${specialization}</p>
                    </div>
                </div>
                <button id="change-coach-btn" class="secondary-button !text-sm">تغییر مربی</button>
            </div>
        `;
    } else {
        step1Html = `
            <h2 class="text-xl font-bold mb-4">قدم ۱: مربی خود را انتخاب کنید</h2>
            <div class="text-center p-8 bg-bg-tertiary rounded-lg">
                <p class="text-text-secondary mb-4">برای مشاهده و انتخاب پلن‌های اشتراک، ابتدا باید مربی مورد نظر خود را انتخاب کنید.</p>
                <button id="open-coach-modal-btn" class="primary-button !text-lg !px-8 !py-3">
                    <i data-lucide="users" class="w-5 h-5 ml-2"></i>
                    انتخاب مربی
                </button>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="space-y-8 animate-fade-in-up">
            <!-- Step 1: Coach Selection -->
            <div class="card p-4 md:p-6">
                ${step1Html}
            </div>

            <div id="coach-selection-feedback" class="text-center transition-all duration-500"></div>

            <!-- Step 2: Plan Selection -->
            <div id="plan-selection-section" class="card p-4 md:p-6 transition-opacity duration-500 ${!hasCoachSelected ? 'opacity-50 pointer-events-none' : ''}">
                <h2 class="text-xl font-bold mb-4">قدم ۲: پلن اشتراک خود را انتخاب کنید</h2>
                ${!hasCoachSelected ? '<p class="text-center text-accent font-semibold mb-4 -mt-2">ابتدا یک مربی انتخاب کنید تا پلن‌ها فعال شوند.</p>' : ''}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${plans.map((plan: any) => {
                        const isInCart = cart.items.some((item: any) => item.planId === plan.planId);
                        const isRecommended = plan.recommended;
                        return `
                        <div class="bg-bg-secondary p-6 rounded-xl flex flex-col border-2 relative overflow-hidden ${isRecommended ? 'border-accent shadow-lg shadow-accent/10' : ''}" style="border-color: ${plan.color || 'var(--border-border-primary)'};">
                            ${isRecommended ? '<div class="absolute top-0 right-0 bg-accent text-bg-secondary text-xs font-bold px-4 py-1 rounded-bl-lg">محبوب‌ترین</div>' : ''}
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
                            <button 
                                data-plan-id="${plan.planId}" 
                                class="add-to-cart-btn ${isInCart ? 'green-button cursor-not-allowed' : 'primary-button'} mt-auto w-full flex items-center justify-center"
                                ${isInCart || !hasCoachSelected ? 'disabled' : ''}
                            >
                                ${isInCart ? '<i data-lucide="check" class="w-4 h-4 mr-2"></i> اضافه شد' : '<i data-lucide="plus" class="w-4 h-4 mr-2"></i> افزودن به سبد'}
                            </button>
                        </div>
                    `}).join('')}
                </div>
            </div>
        </div>
    `;

    const fromProfileSave = sessionStorage.getItem('fromProfileSave');
    if (fromProfileSave) {
        const feedbackEl = document.getElementById('coach-selection-feedback');
        if (feedbackEl) {
            feedbackEl.innerHTML = `
                <div class="p-4 mb-6 bg-yellow-400/10 border-l-4 border-yellow-500 text-yellow-600 rounded-r-lg animate-fade-in">
                    <p class="font-bold">پروفایل شما با موفقیت ذخیره شد!</p>
                    <p class="text-sm">حالا مربی خود را انتخاب کنید تا بتوانید پلن‌های اشتراک را مشاهده نمایید.</p>
                </div>
            `;
        }
        sessionStorage.removeItem('fromProfileSave');
    }
    
    window.lucide?.createIcons();
};

const renderCartModalContent = (currentUser: string) => {
    const bodyEl = document.getElementById('cart-modal-body');
    if (!bodyEl) return;

    const cart = getCart(currentUser);
    const discounts = getDiscounts();
    
    let subtotal = cart.items.reduce((sum: number, item: any) => sum + item.price, 0);
    let discountAmount = 0;
    let total = subtotal;

    let appliedDiscount: any = null;
    if (cart.discountCode && discounts[cart.discountCode]) {
        appliedDiscount = discounts[cart.discountCode];
        if (appliedDiscount.type === 'percentage') {
            discountAmount = (subtotal * appliedDiscount.value) / 100;
        } else if (appliedDiscount.type === 'fixed') {
            discountAmount = appliedDiscount.value;
        }
        total = Math.max(0, subtotal - discountAmount);
    }
    
    if (cart.items.length === 0) {
        bodyEl.innerHTML = `
            <div class="text-center p-8">
                <i data-lucide="shopping-cart" class="w-16 h-16 mx-auto text-text-secondary mb-4"></i>
                <h3 class="font-bold text-lg">سبد خرید شما خالی است</h3>
                <p class="text-text-secondary mt-2">از فروشگاه، پلن مورد نظر خود را انتخاب کنید.</p>
            </div>
        `;
    } else {
        bodyEl.innerHTML = `
            <div class="space-y-3">
                ${cart.items.map((item: any, index: number) => `
                    <div class="flex items-center justify-between p-2 bg-bg-tertiary rounded-lg">
                        <div>
                            <p class="font-semibold">${item.planName}</p>
                            <p class="text-sm text-text-secondary">${formatPrice(item.price)}</p>
                        </div>
                        <button data-item-index="${index}" class="remove-cart-item-btn secondary-button !p-2 text-red-accent hover:!bg-red-500/10">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="mt-6 pt-4 border-t border-border-primary">
                <div class="flex items-center gap-2 mb-4">
                    <input type="text" id="discount-code-input" class="input-field flex-grow !text-sm" placeholder="کد تخفیف" value="${cart.discountCode || ''}">
                    <button id="apply-discount-btn" class="secondary-button !text-sm">اعمال</button>
                </div>
                <div id="discount-feedback" class="text-sm h-5 mb-2"></div>
                <div class="space-y-2 font-semibold">
                    <div class="flex justify-between"><span>جمع کل:</span><span>${formatPrice(subtotal)}</span></div>
                    ${discountAmount > 0 ? `<div class="flex justify-between text-green-500"><span>تخفیف:</span><span>- ${formatPrice(discountAmount)}</span></div>` : ''}
                    <div class="flex justify-between text-xl border-t border-border-primary pt-2 mt-2"><span>مبلغ قابل پرداخت:</span><span>${formatPrice(total)}</span></div>
                </div>
                <button id="checkout-btn" class="primary-button w-full mt-6 !py-3">پرداخت و ثبت نهایی</button>
            </div>
        `;
    }
    window.lucide?.createIcons();
};

const renderCoachesInModal = (genderFilter: 'all' | 'مرد' | 'زن' = 'all') => {
    const listContainer = document.getElementById('modal-coach-list');
    if (!listContainer) return;

    const allCoaches = getUsers().filter((u: any) => u.role === 'coach' && u.coachStatus === 'verified');

    let filteredCoaches = allCoaches;
    if (genderFilter !== 'all') {
        filteredCoaches = allCoaches.filter(c => getUserData(c.username).step1?.gender === genderFilter);
    }
    
    const confirmBtn = document.getElementById('confirm-coach-selection-btn') as HTMLButtonElement;
    if (confirmBtn) confirmBtn.disabled = !selectedCoachInModal;

    if (filteredCoaches.length === 0) {
        listContainer.innerHTML = `<p class="text-text-secondary text-center col-span-full py-8">مربی با این مشخصات یافت نشد.</p>`;
        return;
    }

    listContainer.innerHTML = filteredCoaches.map((coach: any) => {
        const coachData = getUserData(coach.username);
        const isSelected = selectedCoachInModal === coach.username;
        const coachName = coachData.step1?.clientName || coach.username;
        const specialization = coachData.profile?.specialization || 'مربی رسمی بدنسازی';
        const avatar = coachData.profile?.avatar;
        const studentsCount = coachData.students || 0;

        const avatarHtml = avatar
            ? `<img src="${avatar}" alt="${coachName}" class="w-16 h-16 rounded-full object-cover flex-shrink-0 pointer-events-none">`
            : `<div class="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xl text-white pointer-events-none" style="background-color: var(--admin-accent-gray);">${coachName.charAt(0).toUpperCase()}</div>`;
        
        return `
            <button 
                class="store-coach-card w-full text-right p-4 border-2 rounded-xl flex flex-col gap-3 transition-all duration-200 hover:border-accent hover:shadow-lg hover:-translate-y-1 ${isSelected ? 'selected-card !border-accent' : 'border-border-primary'}" 
                data-coach-username="${coach.username}"
            >
                <div class="flex items-center gap-4 pointer-events-none">
                    ${avatarHtml}
                    <div class="flex-grow">
                        <p class="font-bold text-lg">${coachName}</p>
                        <p class="text-sm text-text-secondary">${specialization}</p>
                    </div>
                    ${isSelected ? '<i data-lucide="check-circle-2" class="w-8 h-8 text-accent flex-shrink-0"></i>' : '<div class="w-8 h-8 flex-shrink-0 rounded-full border-2 border-dashed border-border-primary"></div>'}
                </div>
                <div class="flex items-center justify-between text-xs text-text-secondary pt-3 border-t border-border-primary pointer-events-none mt-2">
                    <div class="flex items-center gap-1.5">
                        <i data-lucide="users" class="w-4 h-4"></i>
                        <span>${studentsCount} شاگرد فعال</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-green-500 font-semibold">
                         <i data-lucide="shield-check" class="w-4 h-4"></i>
                         <span>مربی تایید شده</span>
                    </div>
                </div>
            </button>
        `;
    }).join('');
    window.lucide.createIcons();
};

export function renderUserDashboard(currentUser: string, userData: any) {
    const name = userData.step1?.clientName || currentUser;
    
    const navItems = [
        { target: 'dashboard-content', icon: 'layout-dashboard', label: 'داشبورد' },
        { target: 'program-content', icon: 'clipboard-list', label: 'برنامه' },
        { target: 'nutrition-content', icon: 'utensils-crossed', label: 'تغذیه' },
        { target: 'store-content', icon: 'store', label: 'فروشگاه' },
        { target: 'profile-content', icon: 'user', label: 'پروفایل' },
        { target: 'chat-content', icon: 'message-square', label: 'گفتگو' }
    ];

    return `
    <div id="user-dashboard-container" class="flex h-screen bg-bg-primary text-text-primary transition-opacity duration-500 opacity-0">
        <main class="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div id="impersonation-banner-placeholder"></div>
            <header class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div class="flex items-center gap-4">
                    <img src="https://i.pravatar.cc/150?u=${currentUser}" alt="User Avatar" class="w-12 h-12 rounded-full object-cover border-2 border-accent">
                    <div>
                        <h1 class="text-2xl font-bold text-text-primary">${name}</h1>
                        <p class="text-sm text-text-secondary">خوش آمدید!</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <button id="go-to-home-btn" class="secondary-button"><i data-lucide="home" class="w-5 h-5"></i><span class="hidden sm:inline"> صفحه اصلی</span></button>
                    <button id="cart-button" class="secondary-button relative">
                        <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                        <span id="cart-badge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center hidden">0</span>
                    </button>
                    <button id="logout-btn" class="secondary-button"><i data-lucide="log-out" class="w-5 h-5"></i><span class="hidden sm:inline"> خروج</span></button>
                </div>
            </header>
            <div class="relative bg-bg-secondary p-2 rounded-xl mb-6">
                <div id="tab-indicator" class="absolute top-2 h-10 bg-accent rounded-lg transition-all duration-300 ease-in-out"></div>
                <div class="relative grid grid-cols-3 md:grid-cols-6 gap-2">
                    ${navItems.map(item => `
                        <button class="user-dashboard-tab" data-target="${item.target}">
                            <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                            <span class="hidden md:inline">${item.label}</span>
                            <span class="notification-badge"></span>
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="flex-grow">
                <div id="dashboard-content" class="tab-content-panel hidden"></div>
                <div id="program-content" class="tab-content-panel hidden"></div>
                <div id="nutrition-content" class="tab-content-panel hidden"><div id="nutrition-content-wrapper"></div></div>
                <div id="store-content" class="tab-content-panel hidden"></div>
                <div id="profile-content" class="tab-content-panel hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="lg:col-span-2">
                            <form id="user-profile-form" class="card p-4 md:p-6">
                                <div class="flex justify-between items-center mb-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-12 h-12 bg-bg-tertiary rounded-full flex items-center justify-center font-bold text-xl">${name.charAt(0)}</div>
                                        <div>
                                            <h2 id="profile-user-name" class="text-xl font-bold"></h2>
                                            <p id="profile-user-email" class="text-sm text-text-secondary"></p>
                                        </div>
                                    </div>
                                    <button type="button" id="edit-profile-btn" class="secondary-button flex items-center gap-2"><i data-lucide="edit-3" class="w-4 h-4"></i> ویرایش</button>
                                </div>
                                <fieldset id="profile-fieldset" class="space-y-6 pt-4 border-t border-border-primary" disabled>
                                    <div class="input-group"><input type="tel" name="mobile_user" class="input-field w-full" placeholder=" "><label class="input-label">شماره موبایل</label></div>
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div class="slider-group"><label class="flex justify-between text-sm font-medium text-text-secondary mb-1"><span>سن</span><span class="value-display font-bold text-accent">25</span></label><input type="range" min="15" max="80" value="25" class="range-slider age-slider w-full"></div>
                                        <div class="slider-group"><label class="flex justify-between text-sm font-medium text-text-secondary mb-1"><span>قد (cm)</span><span class="value-display font-bold text-accent">175</span></label><input type="range" min="140" max="220" value="175" class="range-slider height-slider w-full"></div>
                                        <div class="slider-group"><label class="flex justify-between text-sm font-medium text-text-secondary mb-1"><span>وزن (kg)</span><span class="value-display font-bold text-accent">75</span></label><input type="range" min="40" max="150" step="0.5" value="75" class="range-slider weight-slider w-full"></div>
                                    </div>
                                    <div class="flex items-center gap-4"><span class="font-semibold text-sm w-16 text-text-secondary shrink-0">جنسیت:</span><div class="flex-grow grid grid-cols-2 gap-2"><label class="option-card-label"><input type="radio" name="gender_user" value="مرد" class="option-card-input"><span class="option-card-content !py-2">مرد</span></label><label class="option-card-label"><input type="radio" name="gender_user" value="زن" class="option-card-input"><span class="option-card-content !py-2">زن</span></label></div></div>
                                    <div><h4 class="font-semibold text-sm mb-2">هدف تمرینی</h4><div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs"><label class="option-card-label"><input type="radio" name="training_goal_user" value="کاهش وزن" class="option-card-input"><span class="option-card-content !py-2">کاهش وزن</span></label><label class="option-card-label"><input type="radio" name="training_goal_user" value="افزایش حجم" class="option-card-input"><span class="option-card-content !py-2">افزایش حجم</span></label><label class="option-card-label"><input type="radio" name="training_goal_user" value="تناسب اندام عمومی" class="option-card-input"><span class="option-card-content !py-2">تناسب اندام</span></label><label class="option-card-label"><input type="radio" name="training_goal_user" value="افزایش قدرت" class="option-card-input"><span class="option-card-content !py-2">افزایش قدرت</span></label></div></div>
                                    <div><h4 class="font-semibold text-sm mb-2">روزهای تمرین در هفته</h4><div class="grid grid-cols-4 gap-2 text-xs"><label class="option-card-label"><input type="radio" name="training_days_user" value="3" class="option-card-input"><span class="option-card-content !py-2">3 روز</span></label><label class="option-card-label"><input type="radio" name="training_days_user" value="4" class="option-card-input"><span class="option-card-content !py-2">4 روز</span></label><label class="option-card-label"><input type="radio" name="training_days_user" value="5" class="option-card-input"><span class="option-card-content !py-2">5 روز</span></label><label class="option-card-label"><input type="radio" name="training_days_user" value="6" class="option-card-input"><span class="option-card-content !py-2">6 روز</span></label></div></div>
                                    <div><h4 class="font-semibold text-sm mb-2">سطح فعالیت روزانه</h4><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs"><label class="option-card-label"><input type="radio" name="activity_level_user" value="1.2" class="option-card-input"><span class="option-card-content !py-2">نشسته</span></label><label class="option-card-label"><input type="radio" name="activity_level_user" value="1.375" class="option-card-input"><span class="option-card-content !py-2">کم</span></label><label class="option-card-label"><input type="radio" name="activity_level_user" value="1.55" class="option-card-input"><span class="option-card-content !py-2">متوسط</span></label><label class="option-card-label"><input type="radio" name="activity_level_user" value="1.725" class="option-card-input"><span class="option-card-content !py-2">زیاد</span></label><label class="option-card-label"><input type="radio" name="activity_level_user" value="1.9" class="option-card-input"><span class="option-card-content !py-2">خیلی زیاد</span></label></div></div>
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2"><div class="input-group"><input type="number" class="input-field w-full neck-input" placeholder=" "><label class="input-label">دور گردن (cm)</label></div><div class="input-group"><input type="number" class="input-field w-full waist-input" placeholder=" "><label class="input-label">دور کمر (cm)</label></div><div class="input-group"><input type="number" class="input-field w-full hip-input" placeholder=" "><label class="input-label">دور باسن (cm)</label></div></div>
                                </fieldset>
                                <button type="submit" id="save-profile-btn" class="primary-button w-full mt-4" style="display: none;">ذخیره تغییرات</button>
                            </form>
                        </div>
                        <div id="body-metrics-container" class="lg:col-span-1 space-y-6"></div>
                    </div>
                </div>
                <div id="chat-content" class="tab-content-panel hidden">
                    <div class="card h-[calc(100vh-16rem)] flex flex-col overflow-hidden">
                        <div id="user-chat-header" class="p-4 border-b border-border-primary flex items-center gap-3"></div>
                        <div id="coach-chat-messages" class="flex-grow p-4 space-y-4 overflow-y-auto flex flex-col bg-bg-tertiary"></div>
                        <form id="coach-chat-form" class="p-4 border-t border-border-primary flex items-center gap-2">
                            <input type="text" id="coach-chat-input" class="input-field flex-grow" placeholder="پیام خود را بنویسید...">
                            <button type="submit" class="primary-button !p-3"><i data-lucide="send" class="w-5 h-5"></i></button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
        
        <div id="user-dashboard-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
            <div class="card w-full max-w-lg transform scale-95 transition-transform duration-300 relative max-h-[90vh] flex flex-col">
                <div class="flex justify-between items-center p-4 border-b border-border-primary flex-shrink-0"><h2 id="user-modal-title" class="font-bold text-xl"></h2><button id="close-user-modal-btn" class="secondary-button !p-2 rounded-full z-10"><i data-lucide="x"></i></button></div>
                <div id="user-modal-body" class="p-6 overflow-y-auto"></div>
            </div>
        </div>
        <div id="cart-modal" class="modal fixed inset-0 bg-black/60 z-[101] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
            <div class="card w-full max-w-md transform scale-95 transition-transform duration-300 relative">
                 <div class="flex justify-between items-center p-4 border-b border-border-primary"><h2 class="font-bold text-xl">سبد خرید</h2><button id="close-cart-modal-btn" class="secondary-button !p-2 rounded-full z-10"><i data-lucide="x"></i></button></div>
                <div id="cart-modal-body" class="p-6"></div>
            </div>
        </div>
        <div id="coach-selection-modal" class="modal fixed inset-0 bg-black/60 z-[102] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
            <div class="card w-full max-w-4xl h-[80vh] transform scale-95 transition-transform duration-300 relative flex flex-col">
                 <div class="p-4 border-b border-border-primary flex-shrink-0">
                    <div class="flex justify-between items-center mb-3"><h2 class="font-bold text-xl">انتخاب مربی</h2><button id="close-coach-selection-modal-btn" class="secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button></div>
                    <div class="flex items-center gap-2 bg-bg-tertiary p-1 rounded-lg"><button class="coach-filter-chip active" data-gender="all">همه</button><button class="coach-filter-chip" data-gender="مرد">آقایان</button><button class="coach-filter-chip" data-gender="زن">بانوان</button></div>
                 </div>
                 <div id="modal-coach-list" class="p-4 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 content-start"></div>
                 <div class="p-4 border-t border-border-primary flex-shrink-0"><button id="confirm-coach-selection-btn" class="primary-button w-full" disabled>تایید و ادامه</button></div>
            </div>
        </div>
    </div>
    `;
}

export function initUserDashboard(currentUser: string, userData: any, handleLogout: () => void, handleGoToHome: () => void) {
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    const dashboardContainer = document.getElementById('user-dashboard-container');
    if (!dashboardContainer) return;

    const tabs = dashboardContainer.querySelectorAll('.user-dashboard-tab');
    const indicator = dashboardContainer.querySelector('#tab-indicator') as HTMLElement;
    const contents = dashboardContainer.querySelectorAll('.tab-content-panel');

    const switchTab = (activeTab: Element) => {
        tabs.forEach(tab => tab.classList.remove('active-spring-tab'));
        activeTab.classList.add('active-spring-tab');

        if (indicator) {
            indicator.style.width = `${(activeTab as HTMLElement).offsetWidth}px`;
            indicator.style.left = `${(activeTab as HTMLElement).offsetLeft}px`;
        }

        const targetId = activeTab.getAttribute('data-target');
        if (!targetId) return;

        contents.forEach(content => {
            content.classList.toggle('hidden', content.id !== targetId);
        });
        
        clearNotification(currentUser, targetId);
        updateUserNotifications(currentUser);
        
        if (weightLogCountdownInterval) {
            clearInterval(weightLogCountdownInterval);
            weightLogCountdownInterval = null;
        }

        let currentData = getUserData(currentUser);

        if (targetId === 'dashboard-content') renderDashboardTab(currentUser, currentData);
        if (targetId === 'program-content') renderUnifiedProgramView(currentData);
        if (targetId === 'nutrition-content') renderNutritionTab(currentData);
        if (targetId === 'store-content') renderStoreTab(currentUser);
        if (targetId === 'profile-content') {
            populateProfileForm(currentData);
            renderBodyMetricsCard(currentData, 'body-metrics-container');
            startWeightCountdown(currentUser);
            const form = document.getElementById('user-profile-form');
            if(form) {
                updateProfileMetricsAndIndicator(form as HTMLElement);
            }
        }
        if (targetId === 'chat-content') {
            const chatHeader = document.getElementById('user-chat-header');
            const chatForm = document.getElementById('coach-chat-form') as HTMLFormElement;
            const chatInput = document.getElementById('coach-chat-input') as HTMLInputElement;
            const messagesContainer = document.getElementById('coach-chat-messages') as HTMLElement;

            const coachUsername = getUserData(currentUser).step1?.coachName;
            let coachData: any = {};
            let coachAvatar = `https://i.pravatar.cc/150?u=coach_default`;
            let coachName = 'مربی شما';

            if (coachUsername) {
                coachData = getUserData(coachUsername);
                coachName = coachData.step1?.clientName || coachUsername;
                coachAvatar = coachData.profile?.avatar || `https://i.pravatar.cc/150?u=${coachUsername}`;
            }

            if (chatHeader) {
                chatHeader.innerHTML = `
                    <img src="${coachAvatar}" alt="${coachName}" class="chat-avatar">
                    <div>
                        <p class="font-bold">${coachName}</p>
                        <p class="text-xs text-text-secondary">${coachData.profile?.specialization || 'مربی رسمی'}</p>
                    </div>
                `;
            }

            const renderChat = () => {
                const chatUserData = getUserData(currentUser);
                const chatHistory = chatUserData.chatHistory || [];
                messagesContainer.innerHTML = chatHistory.map((msg: any) => {
                    const isCoach = msg.sender === 'coach';
                    const messageContainerClass = isCoach ? 'coach-message-container' : 'user-message-container';
                    const messageClass = isCoach ? 'coach-message' : 'user-message';
                    const avatarHtml = isCoach ? `<img src="${coachAvatar}" alt="${coachName}" class="chat-avatar w-8 h-8 self-end">` : '';

                    return `
                        <div class="message-container ${messageContainerClass}">
                            ${avatarHtml}
                            <div class="message ${messageClass}">
                                <p class="message-content">${sanitizeHTML(msg.message)}</p>
                                <span class="message-timestamp">${timeAgo(msg.timestamp)}</span>
                            </div>
                        </div>
                    `;
                }).join('') || `<p class="text-text-secondary text-center my-auto">گفتگوی شما با مربی‌تان در اینجا نمایش داده می‌شود.</p>`;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            };

            renderChat();

            if (!chatForm.dataset.listenerAttached) {
                chatForm.addEventListener('submit', e => {
                    e.preventDefault();
                    const message = chatInput.value.trim();
                    if (!message) return;

                    const chatUserData = getUserData(currentUser);
                    if (!chatUserData.chatHistory) chatUserData.chatHistory = [];
                    chatUserData.chatHistory.push({
                        sender: 'user',
                        message: message,
                        timestamp: new Date().toISOString()
                    });
                    saveUserData(currentUser, chatUserData);
                    
                    const coachUsernameForNotif = chatUserData.step1?.coachName;
                    if (coachUsernameForNotif) {
                        setNotification(coachUsernameForNotif, 'chat-content', '💬');
                    }
                    
                    chatInput.value = '';
                    renderChat();
                });
                chatForm.dataset.listenerAttached = 'true';
            }
        }
    };

    // --- Handle post-login actions ---
    const redirectToTab = sessionStorage.getItem('fitgympro_redirect_to_tab');
    if (redirectToTab) {
        const tabButton = dashboardContainer.querySelector(`.user-dashboard-tab[data-target="${redirectToTab}"]`);
        if (tabButton) {
            setTimeout(() => switchTab(tabButton), 50);
        }
        sessionStorage.removeItem('fitgympro_redirect_to_tab');
    } else {
        const initialTab = dashboardContainer.querySelector('.user-dashboard-tab[data-target="dashboard-content"]');
        if(initialTab) {
            setTimeout(() => switchTab(initialTab), 50);
        }
    }

    const openCart = sessionStorage.getItem('fitgympro_open_cart');
    if (openCart === 'true') {
        setTimeout(() => {
            const cartModal = document.getElementById('cart-modal');
            if(cartModal) {
                renderCartModalContent(currentUser);
                openModal(cartModal);
            }
        }, 100);
        sessionStorage.removeItem('fitgympro_open_cart');
    }

    // --- Event Delegation ---
    dashboardContainer.addEventListener('click', async (e) => {
        if (!(e.target instanceof HTMLElement)) return;
        const target = e.target;

        const tab = target.closest('.user-dashboard-tab');
        if (tab) {
            switchTab(tab);
            return;
        }

        const actionButton = target.closest('button[data-action="log-workout"]') as HTMLButtonElement | null;
        if (actionButton) {
            const dayIndex = parseInt(actionButton.dataset.dayIndex || '-1', 10);
            const todayData = getTodayWorkoutData(userData);
            if (todayData && dayIndex === todayData.dayIndex) {
                openWorkoutLogModal(todayData.day, dayIndex, currentUser);
            }
        }
        
        if (target.id === 'save-program-img-btn') {
            exportElement('#unified-program-view', 'png', 'برنامه-تمرینی.png', target as HTMLButtonElement);
        }
        if (target.id === 'save-program-pdf-btn') {
            exportElement('#unified-program-view', 'pdf', 'برنامه-تمرینی.pdf', target as HTMLButtonElement);
        }
        if (target.id === 'save-nutrition-img-btn') {
            exportElement('#nutrition-plan-render-area', 'png', 'برنامه-غذایی.png', target as HTMLButtonElement);
        }
        if (target.id === 'save-nutrition-pdf-btn') {
            exportElement('#nutrition-plan-render-area', 'pdf', 'برنامه-غذایی.pdf', target as HTMLButtonElement);
        }
        if (target.id === 'edit-profile-btn') {
            toggleProfileLock(false);
        }

        if(target.id === 'cart-button') {
            renderCartModalContent(currentUser);
            openModal(document.getElementById('cart-modal'));
        }
        
        if (target.id === 'open-coach-modal-btn') {
            selectedCoachInModal = getUserData(currentUser).step1?.coachName || null;
            renderCoachesInModal();
            openModal(document.getElementById('coach-selection-modal'));
        }
        
        if(target.id === 'change-coach-btn') {
            selectedCoachInModal = getUserData(currentUser).step1?.coachName || null;
            renderCoachesInModal();
            openModal(document.getElementById('coach-selection-modal'));
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
                    updateCartBadge(currentUser);
                    renderStoreTab(currentUser);
                }
            }
        }
    });

    const profileForm = document.getElementById('user-profile-form');
    profileForm?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        if(target.classList.contains('range-slider')) {
            const labelSpan = target.closest('.slider-group')?.querySelector('.value-display');
            if(labelSpan) labelSpan.textContent = target.value;
            updateSliderTrack(target);
        }
        updateProfileMetricsAndIndicator(profileForm as HTMLElement);
    });
     profileForm?.addEventListener('change', () => updateProfileMetricsAndIndicator(profileForm as HTMLElement));

    profileForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(profileForm as HTMLFormElement);
        const freshUserData = getUserData(currentUser);
        if (!freshUserData.step1) freshUserData.step1 = {};

        const step1Data: any = {
            ...freshUserData.step1,
            mobile: formData.get('mobile_user'),
            gender: formData.get('gender_user'),
            age: parseInt(formData.get('age') as string, 10),
            height: parseInt(formData.get('height') as string, 10),
            weight: parseFloat(formData.get('weight') as string),
            neck: formData.get('neck'),
            waist: formData.get('waist'),
            hip: formData.get('hip'),
            trainingGoal: formData.get('training_goal_user'),
            trainingDays: parseInt(formData.get('training_days_user') as string, 10),
            activityLevel: parseFloat(formData.get('activity_level_user') as string)
        };

        const metrics = calculateBodyMetrics(profileForm as HTMLElement);
        if (metrics) {
            step1Data.bmi = metrics.bmi;
            step1Data.bmr = metrics.bmr;
            step1Data.tdee = metrics.tdee;
            step1Data.bodyFat = metrics.bodyFat;
            step1Data.lbm = metrics.lbm;
        }

        freshUserData.step1 = step1Data;
        
        saveUserData(currentUser, freshUserData);
        toggleProfileLock(true);
        showToast('پروفایل شما با موفقیت ذخیره شد.', 'success');
        addActivityLog(`${currentUser} updated their profile.`);

        const coachName = freshUserData.step1?.coachName;
        if (coachName) {
            setNotification(coachName, 'students-content', '👤');
        } else {
             sessionStorage.setItem('fromProfileSave', 'true');
             renderStoreTab(currentUser);
        }
    });
    
    const userModal = document.getElementById('user-dashboard-modal');
    document.getElementById('close-user-modal-btn')?.addEventListener('click', () => closeModal(userModal));
    userModal?.addEventListener('click', e => {
        if((e.target as HTMLElement).id === 'user-dashboard-modal') closeModal(userModal);
    });
    
    userModal?.addEventListener('submit', e => {
        if((e.target as HTMLElement).id === 'workout-log-form') {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const dayIndex = parseInt(form.dataset.dayIndex || '-1', 10);
            if (dayIndex === -1) return;
            
            const exercises: any[] = [];
            form.querySelectorAll('.exercise-log-item').forEach(exEl => {
                const name = (exEl.querySelector('h4') as HTMLElement).textContent;
                const sets: any[] = [];
                exEl.querySelectorAll('.set-log-row').forEach(setEl => {
                    const weight = parseFloat((setEl.querySelector('.weight-log-input') as HTMLInputElement).value) || 0;
                    const reps = parseFloat((setEl.querySelector('.reps-log-input') as HTMLInputElement).value) || 0;
                    if(reps > 0) sets.push({ weight, reps });
                });
                if(sets.length > 0) exercises.push({ name, sets });
            });
            
            if(exercises.length > 0) {
                const freshUserData = getUserData(currentUser);
                if (!freshUserData.workoutHistory) freshUserData.workoutHistory = [];
                freshUserData.workoutHistory.push({
                    date: new Date().toISOString(),
                    dayIndex,
                    exercises
                });
                saveUserData(currentUser, freshUserData);
                showToast('تمرین با موفقیت ثبت شد. آفرین!', 'success');
                addActivityLog(`${currentUser} logged a workout.`);
                renderDashboardTab(currentUser, freshUserData);
            }
            closeModal(userModal);
        }
    });
    
    const cartModal = document.getElementById('cart-modal');
    cartModal?.addEventListener('click', e => {
        if ((e.target as HTMLElement).id === 'cart-modal') closeModal(cartModal);
        
        const target = e.target as HTMLElement;
        if (target.closest('#close-cart-modal-btn')) closeModal(cartModal);

        const removeBtn = target.closest('.remove-cart-item-btn') as HTMLButtonElement | null;
        if (removeBtn) {
            const index = parseInt(removeBtn.dataset.itemIndex || '-1', 10);
            if (index > -1) {
                const cart = getCart(currentUser);
                cart.items.splice(index, 1);
                saveCart(currentUser, cart);
                renderCartModalContent(currentUser);
                updateCartBadge(currentUser);
                renderStoreTab(currentUser);
            }
        }
        
        if (target.id === 'apply-discount-btn') {
            const input = document.getElementById('discount-code-input') as HTMLInputElement;
            const code = input.value.trim().toUpperCase();
            const discounts = getDiscounts();
            const feedbackEl = document.getElementById('discount-feedback');

            if (code && discounts[code]) {
                const cart = getCart(currentUser);
                cart.discountCode = code;
                saveCart(currentUser, cart);
                renderCartModalContent(currentUser);
                if (feedbackEl) {
                    feedbackEl.textContent = 'کد تخفیف با موفقیت اعمال شد.';
                    feedbackEl.className = 'text-sm h-5 mb-2 text-green-500';
                }
            } else {
                if (feedbackEl) {
                    feedbackEl.textContent = 'کد تخفیف نامعتبر است.';
                    feedbackEl.className = 'text-sm h-5 mb-2 text-red-500';
                }
            }
        }
        
        if (target.id === 'checkout-btn') {
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
             
             const coachUsername = freshUserData.step1?.coachName;
             if (coachUsername) {
                setNotification(coachUsername, 'students-content', '💰');
             }
             
             addActivityLog(`${currentUser} purchased ${cart.items.map((i:any) => i.planName).join(', ')}.`);
             saveCart(currentUser, { items: [], discountCode: null });
             
             showToast('خرید شما با موفقیت ثبت شد! مربی به زودی برنامه شما را ارسال می‌کند.', 'success');
             closeModal(cartModal);
             renderStoreTab(currentUser);
             updateCartBadge(currentUser);
        }
    });

    const coachModal = document.getElementById('coach-selection-modal');
    coachModal?.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        if (target.id === 'coach-selection-modal' || target.closest('#close-coach-selection-modal-btn')) {
            closeModal(coachModal);
            selectedCoachInModal = null;
        }

        const filterChip = target.closest('.coach-filter-chip') as HTMLElement | null;
        if (filterChip) {
            document.querySelectorAll('.coach-filter-chip').forEach(c => c.classList.remove('active'));
            filterChip.classList.add('active');
            renderCoachesInModal(filterChip.dataset.gender as any);
        }
        
        const coachCard = target.closest('.store-coach-card') as HTMLElement | null;
        if (coachCard) {
            selectedCoachInModal = coachCard.dataset.coachUsername || null;
            renderCoachesInModal((document.querySelector('.coach-filter-chip.active') as HTMLElement)?.dataset.gender as any);
        }
        
        if (target.id === 'confirm-coach-selection-btn' && selectedCoachInModal) {
            const freshUserData = getUserData(currentUser);
            freshUserData.step1.coachName = selectedCoachInModal;
            saveUserData(currentUser, freshUserData);
            showToast(`مربی شما با موفقیت انتخاب شد.`, 'success');
            addActivityLog(`${currentUser} selected ${selectedCoachInModal} as their coach.`);
            renderStoreTab(currentUser);
            closeModal(coachModal);
        }
    });

    updateCartBadge(currentUser);
}