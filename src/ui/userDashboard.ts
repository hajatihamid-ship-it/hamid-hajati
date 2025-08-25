import { getUserData, saveUserData, addActivityLog, getCart, saveCart, getDiscounts, getNotifications, clearNotification, setNotification } from '../services/storage';
import { getTodayWorkoutData, calculateBodyMetrics, calculateWorkoutStreak } from '../utils/calculations';
import { showToast, updateSliderTrack, openModal, closeModal, exportElement } from '../utils/dom';
import { setWeightChartInstance, getWeightChartInstance } from '../state';
import { generateNutritionPlan } from '../services/gemini';
import { sanitizeHTML } from '../utils/dom';
import { STORE_PLANS } from '../config';
import { formatPrice } from '../utils/helpers';

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

const renderFullProgram = (userData: any) => {
    const container = document.getElementById('full-program-container');
    const notesContainer = document.getElementById('program-notes');
    const supplementsContainer = document.getElementById('program-supplements');
    const actionsContainer = document.getElementById('program-actions');

    if (!container || !notesContainer || !actionsContainer || !supplementsContainer) return;

    if (!userData.step2 || !userData.step2.days || userData.step2.days.length === 0) {
        container.innerHTML = `<div class="card p-8 text-center text-text-secondary"><i data-lucide="folder-x" class="w-12 h-12 mx-auto mb-4"></i><p>هنوز برنامه‌ای برای شما ثبت نشده است. مربی شما به زودی برنامه را ارسال خواهد کرد.</p></div>`;
        notesContainer.innerHTML = '';
        supplementsContainer.innerHTML = '';
        actionsContainer.innerHTML = '';
        window.lucide?.createIcons();
        return;
    }
    
    actionsContainer.innerHTML = `
        <button id="save-program-img-btn" class="secondary-button !text-sm"><i data-lucide="image" class="w-4 h-4 ml-2"></i> ذخیره عکس</button>
        <button id="save-program-pdf-btn" class="secondary-button !text-sm"><i data-lucide="file-down" class="w-4 h-4 ml-2"></i> ذخیره PDF</button>
    `;

    const todayWorkoutData = getTodayWorkoutData(userData);

    container.innerHTML = userData.step2.days.map((day: any, index: number) => {
        const isToday = todayWorkoutData && todayWorkoutData.dayIndex === index;
        const hasExercises = day.exercises && day.exercises.length > 0;

        return `
        <details class="day-card card !shadow-none !border" ${isToday ? 'open' : ''}>
            <summary class="font-bold cursor-pointer flex justify-between items-center p-3">
                <div class="flex items-center gap-2">
                    <span>${day.name}</span>
                    ${isToday && hasExercises ? '<span class="text-xs bg-accent text-black font-bold px-2 py-0.5 rounded-full">امروز</span>' : ''}
                    ${!hasExercises ? '<span class="text-xs bg-bg-tertiary text-text-secondary font-semibold px-2 py-0.5 rounded-full">استراحت</span>' : ''}
                </div>
                <i data-lucide="chevron-down" class="details-arrow"></i>
            </summary>
            ${hasExercises ? `
            <div class="p-3 border-t border-border-primary">
                <div class="space-y-2">
                    ${day.exercises.map((ex: any) => `
                        <div class="p-2 rounded-lg ${ex.is_superset ? 'is-superset' : 'bg-bg-tertiary/50'}">
                            <p class="font-semibold">${ex.name}</p>
                            <div class="flex items-center gap-4 text-sm text-text-secondary mt-1">
                                <span><span class="font-semibold">${ex.sets}</span> ست</span>
                                <span><span class="font-semibold">${ex.reps}</span> تکرار</span>
                                <span><span class="font-semibold">${ex.rest}</span> ثانیه استراحت</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${isToday ? `<button class="primary-button w-full mt-4" data-action="log-workout" data-day-index="${index}">ثبت تمرین امروز</button>` : ''}
            </div>
            ` : ''}
        </details>
        `;
    }).join('');

    if (userData.step2.notes) {
        notesContainer.innerHTML = `<h4 class="font-bold mb-2">یادداشت مربی:</h4><p class="text-text-secondary">${userData.step2.notes}</p>`;
    } else {
        notesContainer.innerHTML = '';
    }

    if (userData.supplements && userData.supplements.length > 0) {
        supplementsContainer.innerHTML = `
            <h4 class="font-bold mb-2 mt-6 border-t border-border-primary pt-4">برنامه مکمل</h4>
            <div class="space-y-2">
            ${userData.supplements.map((sup: any) => `
                <div class="p-2 bg-bg-tertiary/50 rounded-lg">
                    <p class="font-bold text-sm">${sup.name}</p>
                    <p class="text-xs text-text-secondary">${sup.dosage} - ${sup.timing}</p>
                    ${sup.notes ? `<p class="text-xs italic text-text-secondary mt-1">یادداشت: ${sup.notes}</p>` : ''}
                </div>
            `).join('')}
            </div>
        `;
    } else {
        supplementsContainer.innerHTML = '';
    }


    window.lucide?.createIcons();
};

const openWorkoutLogModal = (dayData: any, dayIndex: number, currentUser: string) => {
    const modal = document.getElementById('user-dashboard-modal');
    const titleEl = document.getElementById('user-modal-title');
    const bodyEl = document.getElementById('user-modal-body');
    if (!modal || !titleEl || !bodyEl) return;

    titleEl.textContent = `ثبت تمرین: ${dayData.name}`;

    let bodyHtml = `<form id="workout-log-form" data-day-index="${dayIndex}" class="space-y-4">`;
    dayData.exercises.forEach((ex: any, exIndex: number) => {
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

const renderDashboardTab = (currentUser: string, userData: any) => {
    const greetingEl = document.getElementById('user-greeting');
    if (greetingEl) {
        greetingEl.textContent = `سلام، ${userData.step1?.clientName || currentUser}!`;
    }

    const todayWorkoutContainer = document.getElementById('today-workout-card-container');
    if (todayWorkoutContainer) {
        const todayData = getTodayWorkoutData(userData);
        if (todayData && todayData.day.exercises.length > 0) {
            todayWorkoutContainer.innerHTML = `
                <div class="card p-4">
                    <h3 class="font-bold text-lg mb-3">تمرین امروز</h3>
                    <div class="p-3 rounded-lg bg-bg-tertiary">
                        <p class="font-semibold">${todayData.day.name}</p>
                        <p class="text-sm text-text-secondary">${todayData.day.exercises.length} حرکت</p>
                    </div>
                    <button class="primary-button w-full mt-4" data-action="log-workout" data-day-index="${todayData.dayIndex}">شروع تمرین</button>
                </div>
            `;
        } else {
            todayWorkoutContainer.innerHTML = `
                <div class="card p-4">
                    <h3 class="font-bold text-lg mb-3 flex items-center gap-2"><i data-lucide="coffee" class="text-accent"></i> امروز روز استراحت است</h3>
                    <p class="text-text-secondary">از ریکاوری لذت ببرید! بدن شما برای رشد به استراحت نیاز دارد.</p>
                </div>
            `;
        }
    }
    
    const kpiIDs = ['streak', 'total', 'weight', 'bmi'];
    const kpiData = {
        streak: calculateWorkoutStreak(userData.workoutHistory),
        total: (userData.workoutHistory || []).length,
        weight: '۰',
        bmi: '۰'
    };
    
    const lastWeight = (userData.weightHistory && userData.weightHistory.length > 0) ? userData.weightHistory.slice(-1)[0].weight : (userData.step1?.weight || 0);
    kpiData.weight = lastWeight;
    const height = userData.step1?.height;
    if (height && lastWeight > 0) {
        kpiData.bmi = (lastWeight / ((height / 100) ** 2)).toFixed(1);
    }
    
    kpiIDs.forEach(id => {
        const el = document.getElementById(`kpi-${id}-dash`);
        if(el) el.textContent = kpiData[id as keyof typeof kpiData];
    });

    window.lucide?.createIcons();
}

const renderNutritionTab = (userData: any) => {
    const container = document.getElementById('nutrition-content-wrapper');
    if (!container) return;

    if (userData.nutritionPlan) {
        container.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                 <h2 class="text-xl font-bold">برنامه غذایی شما</h2>
                 <div class="flex items-center gap-2">
                    <button id="save-nutrition-img-btn" class="secondary-button !text-sm"><i data-lucide="image" class="w-4 h-4 ml-2"></i> ذخیره عکس</button>
                    <button id="save-nutrition-pdf-btn" class="secondary-button !text-sm"><i data-lucide="file-down" class="w-4 h-4 ml-2"></i> ذخیره PDF</button>
                    <button id="regenerate-nutrition-btn" class="secondary-button !text-sm">ساخت برنامه جدید</button>
                 </div>
            </div>
            <div id="nutrition-plan-content">${userData.nutritionPlan}</div>
        `;
    } else {
        container.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <h2 class="text-xl font-bold">برنامه غذایی هوشمند</h2>
                <button id="generate-nutrition-btn" class="primary-button flex-shrink-0">
                   <i data-lucide="sparkles" class="w-4 h-4 ml-2"></i> ساخت برنامه با AI
                </button>
            </div>
            <div id="nutrition-plan-content" class="text-text-secondary">
                <p>با کلیک بر روی دکمه، یک نمونه برنامه غذایی متناسب با مشخصات و اهداف شما توسط هوش مصنوعی تولید می‌شود. این برنامه توسط هوش مصنوعی تولید شده و جایگزین مشاوره تخصصی با پزشک یا متخصص تغذیه نیست.</p>
            </div>
        `;
    }
    window.lucide?.createIcons();
};

const initWeightChart = (userData: any, canvasId: string = 'weight-chart') => {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx || !window.Chart) return;

    // A simple way to avoid re-creating chart on the same canvas
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

const renderBmiGauge = (bmi: number | null) => {
    const container = document.getElementById('bmi-gauge-container');
    if (!container) return;

    if (bmi === null || isNaN(bmi) || bmi <= 0) {
        container.innerHTML = `
            <h2 class="text-xl font-bold mb-2">شاخص توده بدنی (BMI)</h2>
            <p class="text-text-secondary">برای محاسبه BMI، لطفاً قد و وزن خود را در فرم بالا وارد کنید.</p>
        `;
        return;
    }

    const value = parseFloat(bmi.toFixed(1));
    let statusText = 'نرمال';
    let color = 'var(--green-accent)';
    
    const minBmi = 15;
    const maxBmi = 40;
    let percentage = (value - minBmi) / (maxBmi - minBmi);
    
    if (value < 18.5) {
        statusText = 'کمبود وزن';
        color = '#3b82f6';
    } else if (value >= 25 && value < 30) {
        statusText = 'اضافه وزن';
        color = '#f59e0b';
    } else if (value >= 30) {
        statusText = 'چاقی';
        color = '#ef4444';
    }
    
    percentage = Math.max(0, Math.min(1, percentage));

    const radius = 90;
    const strokeWidth = 18;
    const innerRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * innerRadius;
    const arcLength = circumference / 2;

    const dashoffset = arcLength * (1 - percentage);

    container.innerHTML = `
        <h2 class="text-xl font-bold mb-4">شاخص توده بدنی (BMI)</h2>
        <div class="gauge" style="width: 250px; height: 125px; margin: 0 auto;">
            <svg viewBox="0 0 ${radius*2} ${radius}" style="width: 100%; height: 100%; overflow: visible;">
                <path d="M ${strokeWidth/2},${radius} A ${innerRadius},${innerRadius} 0 0 1 ${radius*2 - strokeWidth/2},${radius}" 
                      class="gauge-track" stroke-width="${strokeWidth}" stroke-linecap="round"></path>
                <path d="M ${strokeWidth/2},${radius} A ${innerRadius},${innerRadius} 0 0 1 ${radius*2 - strokeWidth/2},${radius}" 
                      class="gauge-value" stroke-width="${strokeWidth}"
                      style="stroke: ${color}; stroke-dasharray: ${arcLength}; stroke-dashoffset: ${arcLength};"></path>
            </svg>
            <div class="gauge-text" style="position: absolute; bottom: 5px; left: 0; right: 0; text-align: center;">
                <span class="gauge-number text-5xl" style="color: ${color};">${value.toFixed(1)}</span>
                <p class="font-bold text-lg" style="color: ${color}; margin-top: -10px;">${statusText}</p>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const valuePath = container.querySelector('.gauge-value') as SVGPathElement;
        if (valuePath) {
            valuePath.style.strokeDashoffset = dashoffset.toString();
        }
    }, 100);
};

const updateProfileKPIs = (userData: any) => {
    const streakEl = document.getElementById('kpi-streak');
    const totalEl = document.getElementById('kpi-total');
    const weightEl = document.getElementById('kpi-weight');

    if (streakEl) streakEl.textContent = calculateWorkoutStreak(userData.workoutHistory).toString();
    if (totalEl) totalEl.textContent = (userData.workoutHistory || []).length.toString();
    
    const lastWeight = (userData.weightHistory && userData.weightHistory.length > 0) ? userData.weightHistory.slice(-1)[0].weight : (userData.step1?.weight || 0);
    if (weightEl) weightEl.textContent = lastWeight.toString();

    const height = userData.step1?.height;
    if (height && lastWeight > 0) {
        const bmi = lastWeight / ((height / 100) ** 2);
        renderBmiGauge(bmi);
    } else {
        renderBmiGauge(null);
    }
};

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
        const labelSpan = slider.previousElementSibling?.querySelector('span');
        if (labelSpan) labelSpan.textContent = (slider as HTMLInputElement).value;
        updateSliderTrack(slider as HTMLInputElement);
    });

    const genderRadio = form.querySelector(`input[name="gender_user"][value="${data.gender}"]`) as HTMLInputElement;
    if (genderRadio) genderRadio.checked = true;

    calculateBodyMetrics(form);
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
    const cart = getCart(currentUser);

    container.innerHTML = `
        <div class="text-center mb-8 animate-fade-in-down">
            <h2 class="text-3xl font-extrabold">فروشگاه FitGym Pro</h2>
            <p class="text-text-secondary mt-2">پلن‌های تخصصی ما را برای رسیدن به اهداف خود انتخاب کنید.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
            ${STORE_PLANS.map(plan => {
                const isInCart = cart.items.some((item: any) => item.planId === plan.planId);
                return `
                <div class="card p-6 flex flex-col border-2 ${plan.planId.includes('full-3m') ? 'border-accent' : 'border-border-primary'} transition-all hover:shadow-xl hover:-translate-y-1">
                    <h4 class="text-lg font-bold text-text-primary">${plan.planName}</h4>
                    <p class="text-sm text-text-secondary mt-1 flex-grow">${plan.description}</p>
                    <div class="my-6">
                        <span class="text-3xl font-black">${formatPrice(plan.price).split(' ')[0]}</span>
                        <span class="text-text-secondary"> تومان</span>
                    </div>
                    <ul class="space-y-3 text-sm mb-6">
                        ${plan.features.map(feature => `
                            <li class="flex items-center gap-2">
                                <i data-lucide="check-circle" class="w-5 h-5 text-green-400"></i>
                                <span>${feature}</span>
                            </li>
                        `).join('')}
                    </ul>
                    <button 
                        data-plan-id="${plan.planId}" 
                        class="add-to-cart-btn ${isInCart ? 'green-button' : 'primary-button'} mt-auto w-full"
                        ${isInCart ? 'disabled' : ''}
                    >
                        ${isInCart ? '<i data-lucide="check" class="w-4 h-4 mr-2"></i> اضافه شد' : '<i data-lucide="plus" class="w-4 h-4 mr-2"></i> افزودن به سبد'}
                    </button>
                </div>
            `}).join('')}
        </div>
    `;
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


export function initUserDashboard(currentUser: string, userData: any, handleLogout: () => void) {
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    const dashboardContainer = document.getElementById('user-dashboard-container');
    if (!dashboardContainer) return;

    // --- Springy Tab Logic ---
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
        
        let currentData = getUserData(currentUser);

        // Initialize content for the active tab
        if (targetId === 'dashboard-content') renderDashboardTab(currentUser, currentData);
        if (targetId === 'program-content') renderFullProgram(currentData);
        if (targetId === 'nutrition-content') renderNutritionTab(currentData);
        if (targetId === 'store-content') renderStoreTab(currentUser);
        if (targetId === 'profile-content') {
            populateProfileForm(currentData);
            initWeightChart(currentData, 'weight-chart');
            updateProfileKPIs(currentData);
        }
        if (targetId === 'chat-content') {
            const chatForm = document.getElementById('coach-chat-form') as HTMLFormElement;
            const chatInput = document.getElementById('coach-chat-input') as HTMLInputElement;
            const messagesContainer = document.getElementById('coach-chat-messages') as HTMLElement;

            const renderChat = () => {
                const chatUserData = getUserData(currentUser);
                const chatHistory = chatUserData.chatHistory || [];
                messagesContainer.innerHTML = chatHistory.map((msg: any) => `
                    <div class="message ${msg.sender === 'coach' ? 'coach-message' : 'user-message'}">${sanitizeHTML(msg.message)}</div>
                `).join('') || '<div class="message coach-message">سلام! چطور میتونم کمکت کنم؟</div>';
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
                    
                    const coachUsername = chatUserData.step1?.coachName;
                    if (coachUsername) {
                        setNotification(coachUsername, 'students-content', '💬');
                    }
                    
                    chatInput.value = '';
                    renderChat();
                });
                chatForm.dataset.listenerAttached = 'true';
            }
        }
    };
    
    const initialTab = dashboardContainer.querySelector('.user-dashboard-tab[data-target="profile-content"]');
    if(initialTab) {
        setTimeout(() => switchTab(initialTab), 50); // Small delay to ensure correct indicator position on load
    }
    
    tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab)));
    updateCartBadge(currentUser);
    updateUserNotifications(currentUser);

    // --- Event Listeners ---
    dashboardContainer.addEventListener('click', async e => {
        if (!(e.target instanceof HTMLElement)) return;
        const target = e.target;
        const button = target.closest('button');
        if (!button) return;

        // Add to cart
        const addToCartBtn = target.closest('.add-to-cart-btn');
        if (addToCartBtn && !addToCartBtn.hasAttribute('disabled')) {
            const planId = addToCartBtn.getAttribute('data-plan-id');
            const plan = STORE_PLANS.find(p => p.planId === planId);
            if (plan) {
                const cart = getCart(currentUser);
                cart.items.push(plan);
                saveCart(currentUser, cart);
                showToast(`${plan.planName} به سبد خرید اضافه شد.`, 'success');
                updateCartBadge(currentUser);
                (addToCartBtn as HTMLButtonElement).disabled = true;
                addToCartBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 mr-2"></i> اضافه شد`;
                addToCartBtn.classList.replace('primary-button', 'green-button');
                window.lucide.createIcons();
            }
        }

        // Cart modal open
        if (button.id === 'cart-btn') {
            const modal = document.getElementById('cart-modal');
            renderCartModalContent(currentUser);
            openModal(modal);
        }

        // Log workout button
        if (button.dataset.action === "log-workout") {
            const dayIndex = parseInt(button.getAttribute('data-day-index')!, 10);
            const currentData = getUserData(currentUser);
            openWorkoutLogModal(currentData.step2.days[dayIndex], dayIndex, currentUser);
        }

        // Generate Nutrition Plan button
        if (button.id === 'generate-nutrition-btn') {
            button.classList.add('is-loading');
            button.setAttribute('disabled', 'true');
            const currentData = getUserData(currentUser);
            const planHtml = await generateNutritionPlan(currentData);
            const contentEl = document.getElementById('nutrition-plan-content');
            if (contentEl) {
                contentEl.innerHTML = planHtml + `<button id="save-nutrition-plan-btn" class="primary-button w-full mt-4">ذخیره این برنامه</button>`;
            }
            button.classList.remove('is-loading');
            button.removeAttribute('disabled');
        }
        
        // Export buttons
        if(button.id === 'save-program-pdf-btn') exportElement('#program-export-wrapper', 'pdf', 'برنامه-تمرینی.pdf', button);
        if(button.id === 'save-program-img-btn') exportElement('#program-export-wrapper', 'png', 'برنامه-تمرینی.png', button);
        if(button.id === 'save-nutrition-pdf-btn') exportElement('#nutrition-plan-content', 'pdf', 'برنامه-غذایی.pdf', button);
        if(button.id === 'save-nutrition-img-btn') exportElement('#nutrition-plan-content', 'png', 'برنامه-غذایی.png', button);

        // Re-generate Nutrition Plan button
        if (button.id === 'regenerate-nutrition-btn') {
            let freshUserData = getUserData(currentUser);
            delete freshUserData.nutritionPlan;
            saveUserData(currentUser, freshUserData);
            renderNutritionTab(freshUserData);
        }

        // Save Nutrition Plan button
        if (button.id === 'save-nutrition-plan-btn') {
            const planContent = document.getElementById('nutrition-plan-content')?.innerHTML;
            if (planContent) {
                const planHtmlToSave = planContent.replace(/<button.*<\/button>/, '').trim();
                let freshUserData = getUserData(currentUser);
                freshUserData.nutritionPlan = planHtmlToSave;
                saveUserData(currentUser, freshUserData);
                showToast('برنامه غذایی ذخیره شد.', 'success');
                renderNutritionTab(freshUserData);
            }
        }
    });
    
    // Profile form
    const profileForm = document.getElementById('user-profile-form');
    if (profileForm) {
        const updateMetrics = () => {
            const metrics = calculateBodyMetrics(profileForm as HTMLElement);
            if (metrics && metrics.bmi) {
                renderBmiGauge(metrics.bmi);
            } else {
                renderBmiGauge(null);
            }
        };

        profileForm.addEventListener('input', e => {
             const target = e.target as HTMLInputElement;
             if(target.classList.contains('range-slider')) {
                const labelSpan = target.previousElementSibling?.querySelector('span');
                if(labelSpan) labelSpan.textContent = target.value;
                updateSliderTrack(target);
             }
             updateMetrics();
        });
        profileForm.addEventListener('change', updateMetrics);
        
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let freshUserData = getUserData(currentUser);
            const formData = new FormData(e.target as HTMLFormElement);
            
            freshUserData.step1.age = parseInt(formData.get('age_user') as string);
            freshUserData.step1.height = parseInt(formData.get('height_user') as string);
            freshUserData.step1.weight = parseInt(formData.get('weight_user') as string);
            freshUserData.step1.gender = formData.get('gender_user') as string;
            freshUserData.step1.activityLevel = parseFloat(formData.get('activity_level_user') as string);
            freshUserData.step1.neck = parseFloat(formData.get('neck_user') as string) || undefined;
            freshUserData.step1.waist = parseFloat(formData.get('waist_user') as string) || undefined;
            freshUserData.step1.hip = parseFloat(formData.get('hip_user') as string) || undefined;
            
            freshUserData.step1.mobile = formData.get('mobile_user') as string;
            freshUserData.step1.trainingGoal = formData.get('training_goal_user') as string;
            freshUserData.step1.trainingDays = parseInt(formData.get('training_days_user') as string, 10);

            saveUserData(currentUser, freshUserData);
            addActivityLog(`${currentUser} اطلاعات پروفایل خود را به‌روزرسانی کرد.`);
            
            const coachUsername = freshUserData.step1?.coachName;
            if (coachUsername) {
                setNotification(coachUsername, 'students-content', '🔔');
            }
            
            showToast('اطلاعات پروفایل با موفقیت ذخیره و برای مربی ارسال شد.', 'success');
            
            calculateBodyMetrics(profileForm as HTMLElement);
            updateProfileKPIs(freshUserData);
        });
    }

    // Weight log form
    document.getElementById('weight-log-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const input = document.getElementById('new-weight-input') as HTMLInputElement;
        const newWeight = parseFloat(input.value);
        if (isNaN(newWeight) || newWeight <= 0) {
            showToast('لطفا یک وزن معتبر وارد کنید.', 'error');
            return;
        }

        let freshUserData = getUserData(currentUser);
        if (!freshUserData.weightHistory) freshUserData.weightHistory = [];
        freshUserData.weightHistory.push({ date: new Date().toISOString(), weight: newWeight });
        saveUserData(currentUser, freshUserData);
        
        showToast('وزن جدید ثبت شد!', 'success');
        input.value = '';
        initWeightChart(freshUserData, 'weight-chart');
        updateProfileKPIs(freshUserData);
    });

    // Modal listeners
    const modal = document.getElementById('user-dashboard-modal');
    document.getElementById('close-user-modal-btn')?.addEventListener('click', () => closeModal(modal));
    modal?.addEventListener('click', e => {
        if ((e.target as HTMLElement).id === 'user-dashboard-modal') closeModal(modal);
    });
    modal?.addEventListener('submit', e => {
        if((e.target as HTMLElement).id === 'workout-log-form') {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const dayIndex = parseInt(form.dataset.dayIndex!, 10);
            
            let freshUserData = getUserData(currentUser);
            if(!freshUserData.workoutHistory) freshUserData.workoutHistory = [];
            
            const logEntry = {
                date: new Date().toISOString(),
                dayIndex: dayIndex,
                exercises: [] as any[]
            };

            const exItems = form.querySelectorAll('.exercise-log-item');
            exItems.forEach(exItem => {
                const exerciseName = (exItem.querySelector('h4') as HTMLElement).textContent;
                const setsData: any[] = [];
                const setRows = exItem.querySelectorAll('.set-log-row');
                setRows.forEach(setRow => {
                    const weight = (setRow.querySelector('.weight-log-input') as HTMLInputElement).value;
                    const reps = (setRow.querySelector('.reps-log-input') as HTMLInputElement).value;
                    if(weight && reps) {
                        setsData.push({ weight: parseFloat(weight), reps: parseInt(reps) });
                    }
                });
                if (setsData.length > 0) {
                    logEntry.exercises.push({ name: exerciseName, sets: setsData });
                }
            });

            freshUserData.workoutHistory.push(logEntry);
            saveUserData(currentUser, freshUserData);
            showToast('تمرین با موفقیت ثبت شد!', 'success');
            updateProfileKPIs(freshUserData);
            renderFullProgram(freshUserData);
            closeModal(modal);
        }
    });

    // Cart Modal Logic
    const cartModal = document.getElementById('cart-modal');
    cartModal?.addEventListener('click', e => {
        if ((e.target as HTMLElement).id === 'cart-modal') closeModal(cartModal);

        const target = e.target as HTMLElement;
        const button = target.closest('button');
        if (!button) return;

        // Remove item
        if (button.classList.contains('remove-cart-item-btn')) {
            const itemIndex = parseInt(button.dataset.itemIndex!, 10);
            const cart = getCart(currentUser);
            cart.items.splice(itemIndex, 1);
            saveCart(currentUser, cart);
            updateCartBadge(currentUser);
            renderCartModalContent(currentUser);
            renderStoreTab(currentUser); // re-render store to update buttons
        }

        // Apply discount
        if (button.id === 'apply-discount-btn') {
            const input = document.getElementById('discount-code-input') as HTMLInputElement;
            const code = input.value.trim().toUpperCase();
            const feedbackEl = document.getElementById('discount-feedback');
            const discounts = getDiscounts();
            
            if (discounts[code]) {
                const cart = getCart(currentUser);
                cart.discountCode = code;
                saveCart(currentUser, cart);
                if(feedbackEl) {
                    feedbackEl.textContent = 'کد تخفیف با موفقیت اعمال شد.';
                    feedbackEl.className = 'text-sm h-5 mb-2 text-green-500';
                }
            } else {
                 const cart = getCart(currentUser);
                 cart.discountCode = null;
                 saveCart(currentUser, cart);
                if(feedbackEl) {
                    feedbackEl.textContent = 'کد تخفیف نامعتبر است.';
                    feedbackEl.className = 'text-sm h-5 mb-2 text-red-500';
                }
            }
            renderCartModalContent(currentUser);
        }

        // Checkout
        if (button.id === 'checkout-btn') {
            button.classList.add('is-loading');
            const cart = getCart(currentUser);
            let freshUserData = getUserData(currentUser);
            if (!freshUserData.subscriptions) freshUserData.subscriptions = [];

            cart.items.forEach((item: any) => {
                freshUserData.subscriptions.push({
                    planId: item.planId,
                    planName: item.planName,
                    price: item.price,
                    purchaseDate: new Date().toISOString(),
                    fulfilled: false
                });
            });
            
            saveUserData(currentUser, freshUserData);
            saveCart(currentUser, { items: [], discountCode: null }); // Clear cart
            
            const coachUsername = freshUserData.step1?.coachName;
            if (coachUsername) {
                setNotification(coachUsername, 'students-content', '💰');
            }

            setTimeout(() => {
                button.classList.remove('is-loading');
                showToast('خرید شما با موفقیت انجام شد! مربی به زودی برنامه شما را ارسال خواهد کرد.', 'success');
                closeModal(cartModal);
                updateCartBadge(currentUser);
                renderStoreTab(currentUser);
                addActivityLog(`${currentUser} purchased ${cart.items.length} plan(s).`);
            }, 1000); // Simulate network delay
        }
    });
    document.getElementById('close-cart-modal-btn')?.addEventListener('click', () => closeModal(cartModal));

}

export function renderUserDashboard(currentUser: string, userData: any) {
    const trainingGoals = [
        { value: 'کاهش وزن', label: 'کاهش وزن' },
        { value: 'افزایش حجم', label: 'افزایش حجم' },
        { value: 'تناسب اندام عمومی', label: 'تناسب اندام' },
        { value: 'افزایش قدرت', label: 'افزایش قدرت' }
    ];
    const activityLevels = [
        { value: '1.2', label: 'نشسته' },
        { value: '1.375', label: 'کم' },
        { value: '1.55', label: 'متوسط' },
        { value: '1.725', label: 'زیاد' },
        { value: '1.9', label: 'خیلی زیاد' }
    ];

    return `
    <div id="user-dashboard-container" class="p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto transition-opacity duration-500 opacity-0">
        <div id="impersonation-banner-placeholder"></div>
        <header class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
                 <h1 class="text-3xl font-bold">داشبورد شما</h1>
                 <p class="text-text-secondary">برنامه‌ها و پیشرفت خود را مدیریت کنید.</p>
            </div>
            <div class="flex items-center gap-2">
                 <button id="cart-btn" class="secondary-button !p-2.5 rounded-full relative">
                    <i data-lucide="shopping-cart"></i>
                    <span id="cart-badge" class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center hidden">0</span>
                 </button>
                 <button id="theme-toggle-btn-dashboard" class="secondary-button !p-2.5 rounded-full"><i data-lucide="sun"></i></button>
                 <button id="logout-btn" class="secondary-button">خروج</button>
            </div>
        </header>
        
        <div class="card !p-1.5 !rounded-full mb-6 relative flex">
            <div id="tab-indicator"></div>
            ${[
                { target: 'profile-content', icon: 'user', label: 'پروفایل' },
                { target: 'dashboard-content', icon: 'layout-dashboard', label: 'داشبورد' },
                { target: 'program-content', icon: 'clipboard-list', label: 'برنامه من' },
                { target: 'nutrition-content', icon: 'utensils', label: 'تغذیه' },
                { target: 'store-content', icon: 'shopping-bag', label: 'فروشگاه' },
                { target: 'chat-content', icon: 'message-square', label: 'گفتگو' }
            ].map(tab => `
                <button class="user-dashboard-tab" data-target="${tab.target}">
                    <i data-lucide="${tab.icon}" class="w-5 h-5"></i>
                    <span class="hidden sm:inline">${tab.label}</span>
                    <span class="notification-badge"></span>
                </button>
            `).join('')}
        </div>

        <div id="profile-content" class="tab-content-panel">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-6">
                     <div class="card p-4 md:p-6">
                        <div class="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
                            <img src="https://i.pravatar.cc/150?u=${currentUser}" alt="Profile Picture" class="w-24 h-24 rounded-full border-4 border-bg-tertiary shadow-md">
                            <div class="flex-grow">
                                <h2 id="profile-user-name" class="text-2xl font-bold">${userData.step1?.clientName || currentUser}</h2>
                                <p id="profile-user-email" class="text-text-secondary">${userData.step1?.clientEmail || 'ایمیل ثبت نشده'}</p>
                            </div>
                        </div>
                    </div>
                     <form id="user-profile-form" class="card p-4 md:p-6 space-y-6">
                        <h2 class="text-xl font-bold">اطلاعات کاربری و اهداف</h2>
                        
                        <div>
                            <label for="mobile_user_input" class="font-semibold text-sm mb-2 block">شماره موبایل</label>
                            <input id="mobile_user_input" type="tel" name="mobile_user" class="input-field w-full" placeholder="مثال: 09123456789">
                        </div>

                        <div>
                            <label class="font-semibold text-sm mb-3 block">هدف تمرینی</label>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                                ${trainingGoals.map(goal => `
                                <label class="option-card-label">
                                    <input type="radio" name="training_goal_user" value="${goal.value}" class="option-card-input">
                                    <span class="option-card-content">${goal.label}</span>
                                </label>
                                `).join('')}
                            </div>
                        </div>

                        <div>
                            <label class="font-semibold text-sm mb-3 block">تعداد روزهای تمرین در هفته</label>
                            <div class="grid grid-cols-4 lg:grid-cols-7 gap-2">
                                ${[1, 2, 3, 4, 5, 6, 7].map(d => `
                                <label class="option-card-label">
                                    <input type="radio" name="training_days_user" value="${d}" class="option-card-input">
                                    <span class="option-card-content">${d}</span>
                                </label>
                                `).join('')}
                            </div>
                        </div>

                        <div>
                            <label class="font-semibold text-sm mb-3 block">سطح فعالیت</label>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                ${activityLevels.map(level => `
                                <label class="option-card-label">
                                    <input type="radio" name="activity_level_user" value="${level.value}" class="option-card-input">
                                    <span class="option-card-content">${level.label}</span>
                                </label>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border-primary">
                            <div class="space-y-2">
                                <label class="font-semibold text-sm flex justify-between">سن: <span>25</span></label>
                                <input type="range" name="age_user" min="15" max="80" value="25" class="range-slider age-slider">
                            </div>
                            <div class="space-y-2">
                                <label class="font-semibold text-sm flex justify-between">قد (cm): <span>175</span></label>
                                <input type="range" name="height_user" min="140" max="220" value="175" class="range-slider height-slider">
                            </div>
                            <div class="space-y-2">
                                <label class="font-semibold text-sm flex justify-between">وزن (kg): <span>75</span></label>
                                <input type="range" name="weight_user" min="40" max="150" value="75" class="range-slider weight-slider">
                            </div>
                        </div>
                        <div>
                            <label class="font-semibold text-sm mb-3 block">جنسیت</label>
                            <div class="grid grid-cols-2 gap-2">
                                <label class="option-card-label">
                                    <input type="radio" name="gender_user" value="مرد" class="option-card-input">
                                    <span class="option-card-content">مرد</span>
                                </label>
                                <label class="option-card-label">
                                    <input type="radio" name="gender_user" value="زن" class="option-card-input">
                                    <span class="option-card-content">زن</span>
                                </label>
                            </div>
                        </div>

                        <div class="pt-4 border-t border-border-primary">
                            <h3 class="font-semibold text-sm mb-3 block">اندازه‌گیری بدن (اختیاری)</h3>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label for="neck_user_input" class="font-semibold text-sm mb-2 block">دور گردن</label>
                                    <input id="neck_user_input" type="number" name="neck_user" class="input-field w-full neck-input" placeholder="(cm)">
                                </div>
                                <div>
                                    <label for="waist_user_input" class="font-semibold text-sm mb-2 block">دور کمر</label>
                                    <input id="waist_user_input" type="number" name="waist_user" class="input-field w-full waist-input" placeholder="(cm)">
                                </div>
                                <div>
                                    <label for="hip_user_input" class="font-semibold text-sm mb-2 block">دور باسن (بانوان)</label>
                                    <input id="hip_user_input" type="number" name="hip_user" class="input-field w-full hip-input" placeholder="(cm)">
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            <input type="text" class="input-field bmi-input" placeholder="BMI" title="BMI" readonly><input type="text" class="input-field bmr-input" placeholder="BMR" title="BMR" readonly><input type="text" class="input-field tdee-input" placeholder="TDEE" title="TDEE" readonly><input type="text" class="input-field bodyfat-input" placeholder="Body Fat %" title="Body Fat" readonly><input type="text" class="input-field lbm-input" placeholder="LBM" title="LBM" readonly><input type="text" class="input-field ideal-weight-input" placeholder="Ideal Weight" title="Ideal Weight" readonly>
                        </div>
                        <button type="submit" class="primary-button w-full">ذخیره و ارسال برای مربی</button>
                     </form>
                </div>
                <div class="space-y-6">
                    <div id="bmi-gauge-container" class="card p-4 md:p-6 text-center">
                        <!-- JS renders BMI gauge here -->
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="info-card p-4 text-center">
                             <h4 class="font-black text-4xl" id="kpi-streak">0</h4>
                             <p class="text-sm text-text-secondary mt-1">روز زنجیره تمرین</p>
                        </div>
                        <div class="info-card p-4 text-center">
                             <h4 class="font-black text-4xl" id="kpi-total">0</h4>
                             <p class="text-sm text-text-secondary mt-1">کل تمرینات</p>
                        </div>
                        <div class="info-card p-4 text-center">
                             <h4 class="font-black text-4xl" id="kpi-weight">0</h4>
                             <p class="text-sm text-text-secondary mt-1">وزن فعلی (kg)</p>
                        </div>
                    </div>
                    <div class="card p-4 md:p-6">
                         <h2 class="text-xl font-bold mb-4">پیگیری وزن</h2>
                         <div class="h-48 mb-4"><canvas id="weight-chart"></canvas></div>
                         <form id="weight-log-form" class="flex gap-2">
                            <input type="number" step="0.1" id="new-weight-input" class="input-field w-full !py-2" placeholder="وزن امروز (kg)">
                            <button type="submit" class="primary-button !p-2.5"><i data-lucide="plus" class="w-5 h-5"></i></button>
                         </form>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="dashboard-content" class="tab-content-panel hidden">
             <div class="space-y-6 animate-fade-in-up">
                <div class="card p-6">
                    <h2 id="user-greeting" class="text-2xl font-bold">...</h2>
                    <p class="text-text-secondary">خوش آمدید! بیایید روز خود را با قدرت شروع کنیم.</p>
                </div>
                <div id="today-workout-card-container"></div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="card p-4 text-center"><h4 class="font-bold text-2xl" style="color: var(--admin-accent-pink);" id="kpi-streak-dash">0</h4><p class="text-sm text-text-secondary">روز زنجیره</p></div>
                    <div class="card p-4 text-center"><h4 class="font-bold text-2xl" style="color: var(--admin-accent-blue);" id="kpi-total-dash">0</h4><p class="text-sm text-text-secondary">کل تمرینات</p></div>
                    <div class="card p-4 text-center"><h4 class="font-bold text-2xl" style="color: var(--admin-accent-orange);" id="kpi-weight-dash">0</h4><p class="text-sm text-text-secondary">وزن فعلی (kg)</p></div>
                    <div class="card p-4 text-center"><h4 class="font-bold text-2xl text-accent" id="kpi-bmi-dash">0</h4><p class="text-sm text-text-secondary">شاخص BMI</p></div>
                </div>
             </div>
        </div>

        <div id="program-content" class="tab-content-panel hidden">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
                <div class="lg:col-span-2 space-y-4">
                    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                        <h2 class="text-xl font-bold">برنامه تمرینی هفتگی شما</h2>
                        <div id="program-actions" class="flex items-center gap-2">
                            <!-- JS injects export buttons -->
                        </div>
                    </div>
                    <div id="program-export-wrapper">
                         <div id="full-program-container" class="space-y-2">
                            <!-- JS renders program -->
                         </div>
                    </div>
                </div>
                <div class="lg:col-span-1">
                    <div class="card p-4 sticky top-6">
                        <div id="program-notes">
                           <!-- JS renders notes -->
                        </div>
                         <div id="program-supplements">
                           <!-- JS renders supplements -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="nutrition-content" class="tab-content-panel hidden">
            <div id="nutrition-content-wrapper" class="card p-4 md:p-6 max-w-4xl mx-auto animate-fade-in-up">
                <!-- JS renders nutrition plan -->
            </div>
        </div>

        <div id="store-content" class="tab-content-panel hidden">
            <!-- JS renders store content -->
        </div>

        <div id="chat-content" class="tab-content-panel hidden">
            <div class="card p-4 md:p-6 max-w-3xl mx-auto animate-fade-in-up">
                <h2 class="text-xl font-bold mb-4">گفتگو با مربی</h2>
                <div class="flex flex-col h-[60vh]">
                    <div id="coach-chat-messages" class="flex-grow p-4 bg-bg-tertiary rounded-t-lg space-y-4 overflow-y-auto flex flex-col">
                        <!-- Chat messages injected by JS -->
                    </div>
                    <form id="coach-chat-form" class="flex items-center gap-2 p-3 bg-bg-secondary border-t border-border-primary rounded-b-lg">
                        <input type="text" id="coach-chat-input" class="input-field flex-grow" placeholder="پیام خود را بنویسید...">
                        <button type="submit" class="primary-button !p-3"><i data-lucide="send" class="w-5 h-5"></i></button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal for logging workouts -->
    <div id="user-dashboard-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-lg transform scale-95 transition-transform duration-300 relative flex flex-col max-h-[90vh]">
            <div class="flex justify-between items-center p-4 border-b border-border-primary flex-shrink-0">
                <h2 id="user-modal-title" class="font-bold text-xl"></h2>
                <button id="close-user-modal-btn" class="secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button>
            </div>
            <div id="user-modal-body" class="p-4 md:p-6 overflow-y-auto">
                <!-- Modal content will be injected here -->
            </div>
        </div>
    </div>
    
    <!-- Cart Modal -->
    <div id="cart-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-md transform scale-95 transition-transform duration-300 relative flex flex-col max-h-[90vh]">
             <div class="flex justify-between items-center p-4 border-b border-border-primary flex-shrink-0">
                <h2 id="cart-modal-title" class="font-bold text-xl flex items-center gap-2"><i data-lucide="shopping-cart"></i> سبد خرید</h2>
                <button id="close-cart-modal-btn" class="secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button>
            </div>
            <div id="cart-modal-body" class="p-4 md:p-6 overflow-y-auto">
                <!-- Cart content will be injected here by JS -->
            </div>
        </div>
    </div>
    `;
}
