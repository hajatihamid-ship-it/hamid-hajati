import { getTemplates, saveTemplate, deleteTemplate, getUsers, getUserData, saveUserData, getNotifications, setNotification, clearNotification, getExercisesDB, getSupplementsDB } from '../services/storage';
import { showToast, updateSliderTrack, openModal, closeModal, exportElement, sanitizeHTML } from '../utils/dom';
import { getLatestPurchase, timeAgo, getLastActivity } from '../utils/helpers';
import { generateWorkoutPlan, generateSupplementPlan, generateNutritionPlan } from '../services/gemini';
import { calculateWorkoutStreak } from '../utils/calculations';

let currentStep = 1;
const totalSteps = 4;
let activeStudentUsername: string | null = null;
let studentModalChartInstance: any = null;
let currentSelectionTarget: HTMLElement | null = null;
let exerciseToMuscleGroupMap: Record<string, string> = {};
let currentNutritionPlanObject: any | null = null;

export function renderCoachDashboard(currentUser: string, userData: any) {
    const name = userData.step1?.clientName || currentUser;
    const navItems = [
        { target: 'dashboard-content', icon: 'layout-dashboard', label: 'داشبورد' },
        { target: 'students-content', icon: 'users', label: 'شاگردان' },
        { target: 'chat-content', icon: 'message-square', label: 'گفتگو' },
        { target: 'program-builder-content', icon: 'file-plus-2', label: 'برنامه‌ساز' },
        { target: 'templates-content', icon: 'save', label: 'الگوها' },
        { target: 'profile-content', icon: 'user-cog', label: 'پروفایل' }
    ];
    
    return `
    <div id="coach-dashboard-container" class="flex h-screen bg-bg-primary transition-opacity duration-500 opacity-0">
        <aside class="w-64 bg-bg-secondary p-4 flex flex-col flex-shrink-0 border-l border-border-primary">
            <div class="flex items-center gap-3 p-2 mb-6">
                <i data-lucide="dumbbell" class="w-8 h-8 text-accent"></i>
                <h1 class="text-xl font-bold">FitGym Pro</h1>
            </div>
            <nav class="space-y-2 flex-grow">
                ${navItems.map(item => `
                    <button class="coach-nav-link w-full flex items-center gap-3 py-3 rounded-lg text-md" data-target="${item.target}">
                        <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                        <span>${item.label}</span>
                        <span class="notification-badge mr-auto"></span>
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
                    <h1 id="coach-page-title" class="text-3xl font-bold">داشبورد</h1>
                    <p id="coach-page-subtitle" class="text-text-secondary">خلاصه فعالیت‌ها و آمار شما.</p>
                </div>
                <div class="flex items-center gap-3 bg-bg-secondary p-2 rounded-lg">
                    <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg text-bg-secondary" style="background-color: var(--accent);">
                        ${name.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-bold text-sm">${name}</p>
                        <p class="text-xs text-text-secondary">مربی</p>
                    </div>
                </div>
            </header>

            <div id="dashboard-content" class="coach-tab-content hidden"></div>
            <div id="students-content" class="coach-tab-content hidden"></div>
            <div id="chat-content" class="coach-tab-content hidden"></div>
            <div id="program-builder-content" class="coach-tab-content hidden"></div>
            <div id="templates-content" class="coach-tab-content hidden"></div>
            <div id="profile-content" class="coach-tab-content hidden"></div>
        </main>
    </div>

    <!-- Modals for Coach Dashboard -->
    <div id="selection-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-2xl transform scale-95 transition-transform duration-300 relative max-h-[90vh] flex flex-col">
            <div class="selection-modal-header p-4 border-b border-border-primary flex-shrink-0">
                 <div class="flex justify-between items-center mb-4">
                    <h2 class="selection-modal-title font-bold text-xl"></h2>
                    <button class="close-modal-btn secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div class="relative flex-grow">
                        <i data-lucide="search" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"></i>
                        <input type="search" class="selection-modal-search input-field w-full !pr-10" placeholder="جستجو...">
                    </div>
                    <div id="student-filter-chips" class="flex items-center gap-2">
                        <span class="filter-chip active" data-filter="all">همه</span>
                        <span class="filter-chip" data-filter="needs_plan">در انتظار</span>
                        <span class="filter-chip" data-filter="inactive">غیرفعال</span>
                    </div>
                     <select id="student-sort-select" class="input-field !text-sm">
                        <option value="name">مرتب‌سازی: نام</option>
                        <option value="activity">مرتب‌سازی: آخرین فعالیت</option>
                        <option value="join_date">مرتب‌سازی: تاریخ عضویت</option>
                    </select>
                </div>
            </div>
            <div class="selection-modal-options p-4 pt-2 overflow-y-auto flex-grow">
                <!-- Options will be injected here -->
            </div>
        </div>
    </div>
    
    <div id="student-profile-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-5xl transform scale-95 transition-transform duration-300 relative max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-border-primary flex-shrink-0">
                <h2 id="student-modal-name" class="font-bold text-xl"></h2>
                <button class="close-modal-btn secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button>
            </div>
            <div class="flex-grow flex flex-col md:flex-row overflow-hidden">
                <div class="w-full md:w-1/3 border-l border-border-primary flex-shrink-0 bg-bg-tertiary overflow-y-auto">
                    <!-- Student Info Sidebar -->
                </div>
                <div class="w-full md:w-2/3 flex flex-col">
                    <div class="flex-shrink-0 p-2 bg-bg-tertiary border-b border-border-primary">
                        <div class="bg-bg-secondary p-1 rounded-lg flex items-center gap-1">
                             <button class="student-modal-tab admin-tab-button flex-1 active-tab" data-target="student-program-content">برنامه</button>
                             <button class="student-modal-tab admin-tab-button flex-1" data-target="student-progress-content">روند پیشرفت</button>
                             <button class="student-modal-tab admin-tab-button flex-1" data-target="student-chat-content">گفتگو</button>
                        </div>
                    </div>
                    <div class="flex-grow overflow-y-auto p-4">
                        <div id="student-program-content" class="student-modal-content">
                            <div id="student-program-content-wrapper"></div>
                        </div>
                        <div id="student-progress-content" class="student-modal-content hidden"></div>
                        <div id="student-chat-content" class="student-modal-content hidden h-full">
                           <div class="h-full flex flex-col">
                                 <div id="coach-chat-messages-container" class="p-2 flex-grow overflow-y-auto message-container flex flex-col-reverse">
                                    <div class="space-y-4"></div>
                                </div>
                                <div class="p-2 border-t border-border-primary">
                                    <form id="coach-chat-form" class="flex items-center gap-3">
                                        <input id="coach-chat-input" type="text" class="input-field flex-grow" placeholder="پیام خود را بنویسید..." autocomplete="off">
                                        <button type="submit" class="primary-button !p-3"><i data-lucide="send" class="w-5 h-5"></i></button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

const getCoachStudents = (coachUsername: string) => {
    return getUsers().filter((u: any) => {
        if (u.role !== 'user') return false;
        const studentData = getUserData(u.username);
        return studentData.step1?.coachName === coachUsername;
    });
};

const getColorForName = (name: string) => {
    const colors = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
        '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
};

const getWeightChange = (userData: any) => {
    if (!userData.weightHistory || userData.weightHistory.length < 2) {
        return { change: 0, trend: 'neutral' };
    }
    const firstWeight = userData.weightHistory[0].weight;
    const lastWeight = userData.weightHistory[userData.weightHistory.length - 1].weight;
    const change = lastWeight - firstWeight;
    let trend = 'neutral';
    if (change > 0) trend = 'up';
    if (change < 0) trend = 'down';

    return { change: parseFloat(change.toFixed(1)), trend };
};

const renderProgressTimeline = (userData: any) => {
    const events: any[] = [];
    (userData.workoutHistory || []).forEach((log: any) => events.push({ date: new Date(log.date), type: 'workout', data: log }));
    (userData.weightHistory || []).forEach((log: any) => events.push({ date: new Date(log.date), type: 'weight', data: log }));
    (userData.subscriptions || []).forEach((sub: any) => events.push({ date: new Date(sub.purchaseDate), type: 'purchase', data: sub }));
    (userData.programHistory || []).forEach((prog: any) => events.push({ date: new Date(prog.date), type: 'program', data: prog }));

    if (events.length === 0) {
        return '<p class="text-text-secondary text-center p-8">هنوز فعالیتی برای نمایش وجود ندارد.</p>';
    }

    events.sort((a, b) => b.date.getTime() - a.date.getTime());

    const iconMap = {
        workout: { icon: 'dumbbell', color: 'bg-blue-500' },
        weight: { icon: 'bar-chart-2', color: 'bg-green-500' },
        purchase: { icon: 'shopping-cart', color: 'bg-pink-500' },
        program: { icon: 'clipboard-list', color: 'bg-orange-500' },
    };

    let timelineHtml = '<div class="timeline-container pr-4">';
    events.forEach(event => {
        const { icon, color } = iconMap[event.type as keyof typeof iconMap];
        let title = '';
        let description = '';

        switch (event.type) {
            case 'workout':
                title = 'تمرین ثبت شد';
                description = `${event.data.exercises?.length || 0} حرکت انجام شد.`;
                break;
            case 'weight':
                title = 'وزن ثبت شد';
                description = `وزن جدید: ${event.data.weight} کیلوگرم`;
                break;
            case 'purchase':
                title = 'خرید پلن';
                description = `پلن "${event.data.planName}" خریداری شد.`;
                break;
            case 'program':
                title = 'برنامه جدید ارسال شد';
                description = `شامل ${event.data.step2?.days?.length || 0} روز تمرینی`;
                break;
        }

        timelineHtml += `
            <div class="timeline-item relative pb-8">
                <div class="timeline-dot absolute w-4 h-4 rounded-full ${color} border-4 border-bg-secondary"></div>
                <div class="mr-6">
                    <p class="font-semibold text-sm">${title} - <span class="text-text-secondary font-normal">${timeAgo(event.date.toISOString())}</span></p>
                    <p class="text-xs text-text-secondary">${description}</p>
                </div>
            </div>
        `;
    });
    timelineHtml += '</div>';
    return timelineHtml;
};

export const updateCoachNotifications = (currentUser: string) => {
    const notifications = getNotifications(currentUser);
    const mainContainer = document.getElementById('coach-dashboard-container');
    if (!mainContainer) return;

    mainContainer.querySelectorAll('.coach-nav-link').forEach(tab => {
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

const buildExerciseMap = () => {
    const exerciseDB = getExercisesDB();
    for (const group in exerciseDB) {
        for (const exercise of exerciseDB[group]) {
            exerciseToMuscleGroupMap[exercise] = group;
        }
    }
};

const calculateAndDisplayVolume = () => {
    const volumeByGroup: Record<string, number> = {};
    const allExerciseRows = document.querySelectorAll('#step-content-2 .exercise-row');

    allExerciseRows.forEach(row => {
        const exerciseName = (row.querySelector('.exercise-select') as HTMLElement).dataset.value;
        if (!exerciseName) return;

        const muscleGroup = exerciseToMuscleGroupMap[exerciseName];
        if (!muscleGroup) return;

        const sets = parseInt((row.querySelector('.set-slider') as HTMLInputElement).value, 10);
        const reps = parseInt((row.querySelector('.rep-slider') as HTMLInputElement).value, 10);

        if (!isNaN(sets) && !isNaN(reps)) {
            if (!volumeByGroup[muscleGroup]) {
                volumeByGroup[muscleGroup] = 0;
            }
            volumeByGroup[muscleGroup] += sets * reps;
        }
    });

    const container = document.getElementById('volume-analysis-content');
    if (!container) return;
    
    if (Object.keys(volumeByGroup).length === 0) {
        container.innerHTML = `<p class="text-text-secondary">با افزودن حرکات، حجم تمرین هفتگی برای هر گروه عضلانی در اینجا نمایش داده می‌شود.</p>`;
    } else {
        const totalVolume = Object.values(volumeByGroup).reduce((sum, vol) => sum + vol, 0);
        const maxVolume = Math.max(...Object.values(volumeByGroup));

        container.innerHTML = `
        <div class="mb-3">
            <h5 class="font-bold text-md">کل تکرارها: ${totalVolume}</h5>
        </div>
        ${Object.entries(volumeByGroup).sort((a,b) => b[1] - a[1]).map(([group, volume]) => `
            <div class="volume-analysis-item cursor-pointer p-1 rounded-md transition-colors hover:bg-bg-tertiary" data-muscle-group="${group}">
                <div class="flex justify-between items-center text-sm pointer-events-none">
                    <span class="font-semibold">${group}</span>
                    <span class="text-text-secondary">${volume}</span>
                </div>
                <div class="w-full bg-bg-tertiary rounded-full h-1.5 mt-1 pointer-events-none">
                    <div class="bg-accent h-1.5 rounded-full" style="width: ${Math.min(100, (volume / maxVolume) * 100)}%"></div>
                </div>
            </div>
        `).join('')}
        `;

        container.querySelectorAll('.volume-analysis-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                const group = (item as HTMLElement).dataset.muscleGroup;
                document.querySelectorAll('#step-content-2 .exercise-row').forEach(row => {
                    if ((row as HTMLElement).dataset.exerciseMuscleGroup === group) {
                        row.classList.add('highlight-exercise');
                    }
                });
            });
            item.addEventListener('mouseleave', () => {
                 document.querySelectorAll('#step-content-2 .exercise-row.highlight-exercise').forEach(row => {
                    row.classList.remove('highlight-exercise');
                });
            });
        });
    }
};

const updateStepper = () => {
    const stepperItems = document.querySelectorAll('.stepper-item');
    stepperItems.forEach((item, index) => {
        const stepNum = index + 1;
        item.classList.remove('active', 'completed');
        if (stepNum < currentStep) {
            item.classList.add('completed');
        } else if (stepNum === currentStep) {
            item.classList.add('active');
        }
    });
};

const updateStepContent = () => {
    const stepContents = document.querySelectorAll('.step-content');
    stepContents.forEach(content => content.classList.add('hidden'));
    const currentContent = document.getElementById(`step-content-${currentStep}`);
    if (currentContent) {
        currentContent.classList.remove('hidden');
        currentContent.classList.add('animate-fade-in');
    }

    if (currentStep === 4) {
        renderProgramPreview();
    }
};

const changeStep = (step: number) => {
    currentStep = step;
    updateStepper();
    updateStepContent();

    const prevBtn = document.getElementById('prev-step-btn');
    const nextBtn = document.getElementById('next-step-btn');
    const finishBtn = document.getElementById('finish-program-btn');
    const aiDraftBtn = document.getElementById('ai-draft-btn');

    if (prevBtn) (prevBtn as HTMLElement).style.display = currentStep > 1 ? 'inline-flex' : 'none';
    if (nextBtn) (nextBtn as HTMLElement).style.display = currentStep < totalSteps ? 'inline-flex' : 'none';
    if (finishBtn) (finishBtn as HTMLElement).style.display = currentStep === totalSteps ? 'inline-flex' : 'none';

    if (aiDraftBtn) {
        aiDraftBtn.classList.toggle('hidden', currentStep !== 2);
    }
};

const addExerciseRow = (dayId: string, exerciseData: any | null = null) => {
    const dayContainer = document.getElementById(dayId);
    const template = document.getElementById('exercise-template') as HTMLTemplateElement;
    const exerciseDB = getExercisesDB();
    if (!dayContainer || !template) return;
    
    const clone = template.content.cloneNode(true) as DocumentFragment;
    const newRow = clone.querySelector('.exercise-row') as HTMLElement;

    if (exerciseData) {
        const muscleGroup = Object.keys(exerciseDB).find(group => exerciseDB[group].includes(exerciseData.name));
        if (muscleGroup) {
            newRow.dataset.exerciseMuscleGroup = muscleGroup;
            const muscleGroupBtn = newRow.querySelector('.muscle-group-select') as HTMLButtonElement;
            muscleGroupBtn.dataset.value = muscleGroup;
            muscleGroupBtn.querySelector('span')!.textContent = muscleGroup;
            
            const exerciseBtn = newRow.querySelector('.exercise-select') as HTMLButtonElement;
            exerciseBtn.disabled = false;
            exerciseBtn.dataset.value = exerciseData.name;
            exerciseBtn.querySelector('span')!.textContent = exerciseData.name;
        }

        (newRow.querySelector('.set-slider') as HTMLInputElement).value = exerciseData.sets;
        (newRow.querySelector('.rep-slider') as HTMLInputElement).value = exerciseData.reps;
        (newRow.querySelector('.rest-slider') as HTMLInputElement).value = exerciseData.rest;
    }
    
    const sliders = newRow.querySelectorAll('.range-slider');
    sliders.forEach(slider => {
        const s = slider as HTMLInputElement;
        const labelSpan = s.previousElementSibling?.querySelector('span');
        if (labelSpan) labelSpan.textContent = s.value;
        updateSliderTrack(s);
    });
    
    const exercisesContainer = dayContainer.querySelector('.exercises-container');
    exercisesContainer?.appendChild(newRow);
    window.lucide?.createIcons();
    calculateAndDisplayVolume();
};

const saveCurrentPlanAsTemplate = () => {
    const planData = gatherPlanData();
    if (!planData) {
        showToast("لطفا ابتدا یک برنامه بسازید.", "error");
        return;
    }
    const templateName = prompt("یک نام برای این الگو وارد کنید:");
    if (templateName) {
        saveTemplate(templateName, planData);
        showToast(`الگوی "${templateName}" با موفقیت ذخیره شد.`, "success");
        renderTemplatesTab();
    }
};

const renderTemplatesTab = () => {
    const templatesContainer = document.getElementById('templates-list-container');
    if (!templatesContainer) return;
    
    const templates = getTemplates();
    if (Object.keys(templates).length === 0) {
        templatesContainer.innerHTML = `<p class="text-text-secondary">هنوز الگویی ذخیره نشده است.</p>`;
        return;
    }
    
    templatesContainer.innerHTML = Object.keys(templates).map(name => `
        <div class="p-4 border border-border-primary rounded-lg flex justify-between items-center">
            <div>
                <p class="font-bold">${name}</p>
                <p class="text-sm text-text-secondary">${templates[name].description || `برنامه تمرینی برای ${templates[name]?.student?.clientName || 'شاگرد'}`}</p>
            </div>
            <div>
                <button class="secondary-button !p-2" data-template-name="${name}" data-action="load-template"><i data-lucide="upload" class="w-4 h-4 pointer-events-none"></i></button>
                <button class="secondary-button !p-2 text-red-accent" data-template-name="${name}" data-action="delete-template"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button>
            </div>
        </div>
    `).join('');
    window.lucide?.createIcons();
};

const _renderStudentProgram = (programData: any) => {
    if (!programData || !programData.step2 || !programData.step2.days || programData.step2.days.length === 0) {
        return `<p class="text-text-secondary text-center p-4">هنوز برنامه‌ای برای این شاگرد ثبت نشده است.</p>`;
    }
    const dayColors = ['#3b82f6', '#ef4444', '#f97316', '#10b981', '#a855f7', '#ec4899', '#f59e0b'];

    let programHtml = programData.step2.days.map((day: any, index: number) => {
        const hasExercises = day.exercises && day.exercises.length > 0;
        const dayColor = dayColors[index % dayColors.length];
        return `
        <details class="day-card card !shadow-none !border mb-2">
            <summary class="font-bold cursor-pointer flex justify-between items-center p-3 rounded-md" style="border-right: 4px solid ${dayColor}; background-color: color-mix(in srgb, ${dayColor} 10%, transparent);">
                <span>${day.name}</span>
                <i data-lucide="chevron-down" class="details-arrow"></i>
            </summary>
            ${hasExercises ? `
            <div class="p-3 border-t border-border-primary">
                <div class="space-y-2">
                    ${(day.exercises || []).map((ex: any) => `
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
            </div>
            ` : ''}
        </details>
        `;
    }).join('');

    if (programData.supplements && programData.supplements.length > 0) {
        programHtml += `
            <h4 class="font-bold text-lg mt-4 mb-2 pt-3 border-t border-border-primary">برنامه مکمل</h4>
            <div class="space-y-2">
            ${programData.supplements.map((sup: any) => `
                <div class="p-2 rounded-lg bg-bg-tertiary/50">
                    <p class="font-semibold">${sup.name}</p>
                    <p class="text-sm text-text-secondary">${sup.dosage} - ${sup.timing}</p>
                    ${sup.notes ? `<p class="text-xs italic text-text-secondary mt-1">یادداشت: ${sup.notes}</p>` : ''}
                </div>
            `).join('')}
            </div>
        `;
    }

    return programHtml;
};

const initStudentWeightChartInModal = (userData: any) => {
    const ctx = document.getElementById('student-modal-weight-chart') as HTMLCanvasElement;
    if (!ctx || !window.Chart) return;

    if (studentModalChartInstance) {
        studentModalChartInstance.destroy();
    }
    const weightHistory = userData.weightHistory || [];
    const labels = weightHistory.map((entry: any) => new Date(entry.date).toLocaleDateString('fa-IR'));
    const data = weightHistory.map((entry: any) => entry.weight);
    studentModalChartInstance = new window.Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Weight (kg)',
                data,
                borderColor: 'var(--accent)',
                backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
};

const openStudentProfileModal = (username: string) => {
    const modal = document.getElementById('student-profile-modal');
    if (!modal) return;
    
    activeStudentUsername = username;
    const userData = getUserData(username);
    const user = getUsers().find((u:any) => u.username === username);

    (modal.querySelector('#student-modal-name') as HTMLElement).textContent = userData.step1?.clientName || username;
    
    const infoSidebar = modal.querySelector('.w-full.md\\:w-1\\/3') as HTMLElement;
    const lastWeight = (userData.weightHistory?.slice(-1)[0]?.weight || userData.step1?.weight || null);
    const height = userData.step1?.height;
    const bmi = (height && lastWeight > 0) ? (lastWeight / ((height / 100) ** 2)) : null;

    if (infoSidebar) {
        infoSidebar.innerHTML = `
            <div class="p-4 h-full flex flex-col">
                <h4 class="font-bold mb-3">اطلاعات کلی</h4>
                <div class="space-y-2 text-sm flex-grow">
                    <div class="flex justify-between"><span>هدف:</span> <strong class="font-semibold">${userData.step1?.trainingGoal || 'تعیین نشده'}</strong></div>
                    <div class="flex justify-between"><span>ایمیل:</span> <strong>${user.email}</strong></div>
                    <div class="flex justify-between"><span>سن:</span> <strong>${(userData.step1?.age || 'N/A')}</strong></div>
                    <div class="flex justify-between"><span>قد (cm):</span> <strong>${(userData.step1?.height || 'N/A')}</strong></div>
                    <div class="flex justify-between"><span>وزن (kg):</span> <strong>${(lastWeight ? lastWeight.toFixed(1) : 'N/A')}</strong></div>
                    <div class="flex justify-between"><span>TDEE:</span> <strong>${(Math.round(userData.step1?.tdee) || 'N/A')}</strong></div>
                    ${bmi ? `
                        <div class="mt-4 pt-4 border-t border-border-primary">
                            <div class="flex justify-between items-center mb-1">
                                <h3 class="font-semibold text-sm">شاخص توده بدنی (BMI)</h3>
                                <span class="font-bold text-sm">${bmi.toFixed(1)}</span>
                            </div>
                            <div class="w-full bg-bg-tertiary rounded-full h-2.5 relative" title="آبی: کمبود وزن, سبز: نرمال, زرد: اضافه وزن, قرمز: چاقی">
                                <div class="absolute top-0 left-0 h-full rounded-l-full bg-blue-500" style="width: 14%;"></div>
                                <div class="absolute top-0 h-full bg-green-500" style="left: 14%; width: 26%;"></div>
                                <div class="absolute top-0 h-full bg-yellow-500" style="left: 40%; width: 20%;"></div>
                                <div class="absolute top-0 h-full rounded-r-full bg-red-500" style="left: 60%; width: 40%;"></div>
                                <div id="bmi-indicator-coach" class="absolute -top-1 w-4 h-4 rounded-full bg-white border-2 border-accent shadow-lg transition-all duration-500 ease-out" style="left: -8px;"></div>
                            </div>
                            <div class="flex justify-between text-xs text-text-secondary mt-1 px-1">
                                <span>۱۸.۵</span>
                                <span>۲۵</span>
                                <span>۳۰</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <button data-action="create-program" data-username="${username}" class="primary-button w-full mt-4 !text-sm">ویرایش / ارسال برنامه</button>
            </div>
        `;

        if (bmi) {
            const bmiIndicator = document.getElementById('bmi-indicator-coach');
            if (bmiIndicator) {
                const minBmi = 15;
                const maxBmi = 40;
                let percentage = (bmi - minBmi) / (maxBmi - minBmi) * 100;
                percentage = Math.max(0, Math.min(100, percentage));
                setTimeout(() => {
                    const offset = bmiIndicator.offsetWidth / 2;
                    bmiIndicator.style.left = `calc(${percentage}% - ${offset}px)`;
                }, 100);
            }
        }
    }


    const programWrapper = modal.querySelector('#student-program-content-wrapper') as HTMLElement;
    const history = userData.programHistory || [];

    // Backward compatibility: if history is empty but old plan exists, create one entry
    if (history.length === 0 && userData.step2) {
        history.push({
            date: userData.joinDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Use join date or fallback
            step2: userData.step2,
            supplements: userData.supplements || []
        });
    }

    if (history.length > 0) {
        programWrapper.innerHTML = history.map((p: any, index: number) => `
            <details class="day-card card !shadow-none !border mb-2" ${index === 0 ? 'open' : ''}>
                <summary class="font-bold cursor-pointer flex justify-between items-center p-3">
                    <span>برنامه تاریخ: ${new Date(p.date).toLocaleDateString('fa-IR')}</span>
                    <i data-lucide="chevron-down" class="details-arrow"></i>
                </summary>
                <div class="p-3 border-t border-border-primary">
                    ${_renderStudentProgram(p)}
                </div>
            </details>
        `).join('');
    } else {
        programWrapper.innerHTML = `<p class="text-text-secondary text-center p-4">هنوز برنامه‌ای برای این شاگرد ثبت نشده است.</p>`;
    }
    
    const progressContent = modal.querySelector('#student-progress-content');
    if (progressContent) {
        progressContent.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h4 class="font-bold mb-3">نمودار وزن</h4>
                    <div class="h-64"><canvas id="student-modal-weight-chart"></canvas></div>
                </div>
                <div>
                    <h4 class="font-bold mb-3">تایم‌لاین فعالیت‌ها</h4>
                    <div class="h-64 overflow-y-auto pr-2">
                        ${renderProgressTimeline(userData)}
                    </div>
                </div>
            </div>
        `;
        initStudentWeightChartInModal(userData);
    }


    const modalTabs = modal.querySelectorAll('.student-modal-tab');
    const modalContents = modal.querySelectorAll('.student-modal-content');
    modalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            modalTabs.forEach(t => t.classList.remove('active-tab'));
            tab.classList.add('active-tab');
            modalContents.forEach(c => c.classList.toggle('hidden', c.id !== targetId));
        });
    });
    if (modalTabs.length > 0) (modalTabs[0] as HTMLElement).click();
    
    // --- Chat Logic ---
    const chatContent = modal.querySelector('#student-chat-content');
    const messagesContainer = chatContent?.querySelector('#coach-chat-messages-container > div') as HTMLElement;
    const chatForm = chatContent?.querySelector('#coach-chat-form') as HTMLFormElement;
    const chatInput = chatContent?.querySelector('#coach-chat-input') as HTMLInputElement;

    const renderChat = () => {
        const chatUserData = getUserData(username);
        const chatHistory = (chatUserData.chatHistory || []).slice().reverse();
        messagesContainer.innerHTML = chatHistory.map((msg: any) => `
            <div class="flex ${msg.sender === 'coach' ? 'justify-end' : 'justify-start'}">
                 <div class="message-bubble ${msg.sender === 'coach' ? 'message-sent' : 'message-received'}">
                    <div class="message-content">${sanitizeHTML(msg.message)}</div>
                    <div class="message-timestamp">${timeAgo(msg.timestamp)}</div>
                 </div>
            </div>
        `).join('');
    };

    renderChat();

    if (chatForm && !chatForm.dataset.listenerAttached) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message || !activeStudentUsername) return;

            const chatUserData = getUserData(activeStudentUsername);
            if (!chatUserData.chatHistory) chatUserData.chatHistory = [];
            chatUserData.chatHistory.push({
                sender: 'coach',
                message: message,
                timestamp: new Date().toISOString()
            });
            saveUserData(activeStudentUsername, chatUserData);
            setNotification(activeStudentUsername, 'chat-content', '💬');
            chatInput.value = '';
            renderChat();
        });
        chatForm.dataset.listenerAttached = 'true';
    }


    openModal(modal);
    window.lucide?.createIcons();
};

const gatherPlanData = () => {
    if (!activeStudentUsername) return null;

    const studentData = getUserData(activeStudentUsername);
    const plan: any = {
        student: studentData.step1,
        workout: { days: [] as any[], notes: '' },
        supplements: { items: [] as any[], notes: '' },
        nutritionPlan: currentNutritionPlanObject,
    };

    // Gather workout data
    const dayCards = document.querySelectorAll('#step-content-2 .day-card');
    dayCards.forEach(card => {
        const dayName = card.querySelector('summary span')?.textContent || '';
        const exercises: any[] = [];
        card.querySelectorAll('.exercise-row').forEach(row => {
            const exerciseButton = row.querySelector('.exercise-select') as HTMLButtonElement;
            const exerciseName = exerciseButton.dataset.value;
            if (exerciseName) {
                exercises.push({
                    name: exerciseName,
                    sets: (row.querySelector('.set-slider') as HTMLInputElement).value,
                    reps: (row.querySelector('.rep-slider') as HTMLInputElement).value,
                    rest: (row.querySelector('.rest-slider') as HTMLInputElement).value,
                    is_superset: row.classList.contains('is-superset')
                });
            }
        });
        plan.workout.days.push({ name: dayName, exercises });
    });

    // Gather supplements
    document.querySelectorAll('#added-supplements-container .supplement-row').forEach(row => {
        plan.supplements.items.push({
            name: row.querySelector('.supplement-name')?.textContent || '',
            dosage: (row.querySelector('.dosage-select') as HTMLSelectElement).value,
            timing: (row.querySelector('.timing-select') as HTMLSelectElement).value,
            notes: (row.querySelector('.notes-input') as HTMLInputElement).value,
        });
    });
    
    plan.workout.notes = (document.getElementById('coach-notes-final') as HTMLTextAreaElement)?.value || '';

    return plan;
};

const renderProgramPreview = () => {
    const planData = gatherPlanData();
    const previewContainer = document.getElementById('program-preview-for-export');
    if (!previewContainer) return;
    
    if (!planData || !planData.student) {
        previewContainer.innerHTML = '<p class="p-4 text-center text-text-secondary">اطلاعاتی برای نمایش وجود ندارد. لطفا ابتدا یک شاگرد را انتخاب و مراحل را کامل کنید.</p>';
        return;
    }

    const { student, workout, supplements, nutritionPlan } = planData;
    const metrics = calculateMetricsFromData(student);
    const dayColors = ['#3b82f6', '#ef4444', '#f97316', '#10b981', '#a855f7', '#ec4899', '#f59e0b'];
    
    previewContainer.innerHTML = `
        <div class="p-4 relative">
            <div class="watermark-text-overlay">FitGym Pro</div>
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">برنامه اختصاصی FitGym Pro</h2>
                <p class="font-semibold">${new Date().toLocaleDateString('fa-IR')}</p>
            </div>

            <h3 class="preview-section-header"><i data-lucide="user-check"></i> اطلاعات شاگرد</h3>
            <div class="preview-vitals-grid">
                <div><span>نام:</span> <strong>${student.clientName || 'N/A'}</strong></div>
                <div><span>هدف:</span> <strong>${student.trainingGoal || 'N/A'}</strong></div>
                <div><span>سن:</span> <strong>${student.age || 'N/A'}</strong></div>
                <div><span>قد:</span> <strong>${student.height || 'N/A'} cm</strong></div>
                <div><span>وزن:</span> <strong>${student.weight || 'N/A'} kg</strong></div>
                <div><span>TDEE:</span> <strong>${metrics.tdee || 'N/A'} kcal</strong></div>
            </div>

            <h3 class="preview-section-header mt-6"><i data-lucide="clipboard-list"></i> برنامه تمرینی</h3>
            <div class="space-y-4">
            ${workout.days.filter((d: any) => d.exercises.length > 0).map((day: any, index: number) => `
                <div>
                    <h4 class="font-bold mb-2 p-2 rounded-md" style="border-right: 4px solid ${dayColors[index % dayColors.length]}; background-color: color-mix(in srgb, ${dayColors[index % dayColors.length]} 10%, transparent);">${day.name}</h4>
                    <table class="preview-table-pro">
                        <thead><tr><th>حرکت</th><th>ست</th><th>تکرار</th><th>استراحت</th></tr></thead>
                        <tbody>
                        ${day.exercises.map((ex: any) => `<tr class="${ex.is_superset ? 'superset-group-pro' : ''}"><td>${ex.name}</td><td>${ex.sets}</td><td>${ex.reps}</td><td>${ex.rest}s</td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            `).join('')}
            </div>
            
            ${supplements.items.length > 0 ? `
            <h3 class="preview-section-header mt-6"><i data-lucide="pill"></i> برنامه مکمل</h3>
            <table class="preview-table-pro">
                <thead><tr><th>مکمل</th><th>دوز</th><th>زمان</th><th>یادداشت</th></tr></thead>
                <tbody>
                    ${supplements.items.map((sup: any) => `<tr><td>${sup.name}</td><td>${sup.dosage}</td><td>${sup.timing}</td><td>${sup.notes || '-'}</td></tr>`).join('')}
                </tbody>
            </table>
            ` : ''}

            ${nutritionPlan && nutritionPlan.weeklyPlan ? `
            <h3 class="preview-section-header mt-6"><i data-lucide="utensils-crossed"></i> برنامه غذایی نمونه</h3>
            <div class="preview-notes-pro">
                <p>این یک برنامه غذایی نمونه برای یک هفته است که می‌توانید آن را تکرار کنید. برای تنوع بیشتر می‌توانید از گزینه‌های مختلف در هر وعده استفاده نمایید.</p>
                <ul class="list-disc pr-4 mt-2 text-sm">
                    ${(nutritionPlan.generalTips || []).slice(0, 2).map((tip: string) => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${workout.notes ? `
            <h3 class="preview-section-header mt-6"><i data-lucide="file-text"></i> یادداشت مربی</h3>
            <div class="preview-notes-pro">${workout.notes.replace(/\n/g, '<br>')}</div>
            ` : ''}
            
            <footer class="page-footer">ارائه شده توسط FitGym Pro - مربی شما: ${student.coachName || 'مربی'}</footer>
        </div>
    `;
    window.lucide.createIcons();
};

const calculateMetricsFromData = (data: any) => {
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

const renderStudentInfoForBuilder = (username: string) => {
    const selectionPrompt = document.getElementById('student-selection-prompt');
    const builderMain = document.getElementById('program-builder-main');
    const infoDisplay = document.getElementById('student-info-display');
    const builderStudentName = document.getElementById('builder-student-name');
    const aiDraftBtn = document.getElementById('ai-draft-btn') as HTMLButtonElement;

    if (!selectionPrompt || !builderMain || !infoDisplay || !builderStudentName || !aiDraftBtn) return;

    if (!username) {
        selectionPrompt.classList.remove('hidden');
        builderMain.classList.add('hidden');
        activeStudentUsername = null;
        aiDraftBtn.disabled = true;
        return;
    }
    
    selectionPrompt.classList.add('hidden');
    builderMain.classList.remove('hidden');
    builderMain.classList.add('animate-fade-in');

    activeStudentUsername = username;
    const studentData = getUserData(username);
    const { step1 } = studentData;

    if (!step1) {
        infoDisplay.innerHTML = `<p class="text-text-secondary text-center p-8">اطلاعات پروفایل این شاگرد کامل نیست.</p>`;
        infoDisplay.classList.remove('hidden');
        aiDraftBtn.disabled = true;
        return;
    }

    const metrics = calculateMetricsFromData({
        ...step1,
        weight: (studentData.weightHistory?.slice(-1)[0]?.weight || step1?.weight)
    });

    const activityLevelMap: Record < string, string > = {
        '1.2': 'نشسته',
        '1.375': 'کم',
        '1.55': 'متوسط',
        '1.725': 'زیاد',
        '1.9': 'خیلی زیاد'
    };

    const latestPurchase = getLatestPurchase(studentData);
    let purchaseHtml = `
        <div class="mt-8">
            <h4 class="font-bold text-xl border-b border-border-primary pb-2 mb-4"><i data-lucide="shopping-cart" class="inline-block w-5 h-5 -mt-1"></i> وضعیت خرید</h4>
            <p class="text-lg text-text-secondary">این شاگرد خرید فعالی ندارد.</p>
        </div>`;

    if (latestPurchase) {
         purchaseHtml = `
        <div class="mt-8">
            <div class="flex justify-between items-center p-4 bg-bg-tertiary rounded-lg">
                <div>
                    <p class="font-bold text-lg">آخرین خرید: ${latestPurchase.planName}</p>
                    <p class="text-md text-text-secondary">تاریخ: ${new Date(latestPurchase.purchaseDate).toLocaleDateString('fa-IR')}</p>
                </div>
                ${!latestPurchase.fulfilled ? '<span class="status-badge pending">در انتظار برنامه</span>' : '<span class="status-badge verified">انجام شده</span>'}
            </div>
        </div>`;
    }

    const infoRow = (label: string, value: any) => `
        <div class="flex justify-between text-lg py-2 border-b border-border-primary last:border-b-0">
            <span class="text-text-secondary">${label}:</span>
            <span class="font-bold">${value || 'N/A'}</span>
        </div>`;
        
    const gauge = (value: number, max: number, label: string, color: string, unit: string = '') => {
        const validValue = isNaN(value) ? 0 : value;
        const validMax = isNaN(max) ? 100 : max;
        const percentage = Math.min(100, (validValue / validMax) * 100);
        const circumference = 2 * Math.PI * 45;
        const dashoffset = circumference * (1 - percentage / 100);
        const displayValue = value ? value.toFixed(1) : 'N/A';
        return `
            <div class="flex flex-col items-center">
                <div class="gauge" style="width: 120px; height: 120px;">
                    <svg class="gauge-svg" viewBox="0 0 100 100">
                        <circle class="gauge-track" r="45" cx="50" cy="50" stroke-width="8"></circle>
                        <circle class="gauge-value" r="45" cx="50" cy="50" stroke-width="8" style="stroke:${color}; stroke-dasharray: ${circumference}; stroke-dashoffset: ${dashoffset};"></circle>
                    </svg>
                    <div class="gauge-text">
                        <span class="gauge-number text-2xl">${displayValue}</span>
                        <span class="gauge-label">${unit}</span>
                    </div>
                </div>
                <p class="font-bold text-md mt-2">${label}</p>
            </div>
        `;
    };

    infoDisplay.innerHTML = `
        <div class="bg-bg-secondary rounded-xl p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div class="space-y-4">
                     <h3 class="font-bold text-xl border-b border-border-primary pb-2 mb-2">اطلاعات فردی</h3>
                     ${infoRow('سن', step1.age)}
                     ${infoRow('قد', `${step1.height} cm`)}
                     ${infoRow('وزن', `${(studentData.weightHistory?.slice(-1)[0]?.weight || step1.weight)} kg`)}
                     ${infoRow('جنسیت', step1.gender)}
                     
                     <h3 class="font-bold text-xl border-b border-border-primary pb-2 mb-2 pt-4">اهداف تمرینی</h3>
                     ${infoRow('هدف اصلی', step1.trainingGoal)}
                     ${infoRow('روزهای تمرین', `${step1.trainingDays} روز در هفته`)}
                     ${infoRow('سطح فعالیت', activityLevelMap[step1.activityLevel] || step1.activityLevel)}
                </div>
                <div>
                     <h3 class="font-bold text-xl border-b border-border-primary pb-2 mb-6">متریک‌های کلیدی</h3>
                     <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
                        ${gauge(parseFloat(metrics.bmi), 40, 'BMI', 'var(--accent)')}
                        ${gauge(parseFloat(metrics.tdee), 5000, 'TDEE', 'var(--admin-accent-blue)', 'kcal')}
                        ${gauge(parseFloat(metrics.bodyFat), 50, 'درصد چربی', 'var(--admin-accent-orange)', '%')}
                     </div>
                </div>
            </div>
            ${purchaseHtml}
        </div>`;

    infoDisplay.classList.remove('hidden');

    if(builderStudentName) builderStudentName.textContent = step1?.clientName || username;
    
    aiDraftBtn.disabled = false;
    window.lucide?.createIcons();
};

const resetProgramBuilder = () => {
    changeStep(1);
    renderStudentInfoForBuilder(''); 

    const dayCards = document.querySelectorAll('#step-content-2 .day-card');
    dayCards.forEach(card => {
        const exercisesContainer = card.querySelector('.exercises-container');
        if (exercisesContainer) exercisesContainer.innerHTML = '';
    });

    const supplementsContainer = document.getElementById('added-supplements-container');
    if (supplementsContainer) {
        supplementsContainer.innerHTML = '<p class="text-text-secondary text-center p-4">مکمل‌های انتخابی در اینجا نمایش داده می‌شوند.</p>';
    }
    const supCatBtn = document.getElementById('supplement-category-select-btn');
    const supNameBtn = document.getElementById('supplement-name-select-btn');
    if (supCatBtn) {
        supCatBtn.dataset.value = "";
        (supCatBtn.querySelector('span') as HTMLElement).textContent = "دسته را انتخاب کنید";
    }
    if (supNameBtn) {
        supNameBtn.dataset.value = "";
        (supNameBtn.querySelector('span') as HTMLElement).textContent = "مکمل را انتخاب کنید";
        (supNameBtn as HTMLButtonElement).disabled = true;
    }

    const nutritionPlaceholder = document.getElementById('nutrition-plan-placeholder');
    const nutritionDisplay = document.getElementById('nutrition-plan-display');
    if (nutritionPlaceholder) nutritionPlaceholder.classList.remove('hidden');
    if (nutritionDisplay) {
        nutritionDisplay.classList.add('hidden');
        nutritionDisplay.innerHTML = '';
    }
    currentNutritionPlanObject = null;


    const notesTextarea = document.getElementById('coach-notes-final') as HTMLTextAreaElement;
    if (notesTextarea) notesTextarea.value = '';
    
    const previewContainer = document.getElementById('program-preview-for-export');
    if (previewContainer) previewContainer.innerHTML = '';
    
    calculateAndDisplayVolume();
};

const openStudentSelectionModal = (target: HTMLElement, coachUsername: string) => {
    currentSelectionTarget = target;
    const modal = document.getElementById('selection-modal');
    if (!modal) return;

    const titleEl = modal.querySelector('.selection-modal-title') as HTMLElement;
    const optionsContainer = modal.querySelector('.selection-modal-options') as HTMLElement;
    const searchInput = modal.querySelector('.selection-modal-search') as HTMLInputElement;
    const filterChipsContainer = modal.querySelector('#student-filter-chips');
    const sortSelect = modal.querySelector('#student-sort-select') as HTMLSelectElement;

    titleEl.textContent = "انتخاب شاگرد";
    searchInput.value = '';

    // Reset filters and sort
    filterChipsContainer?.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    (filterChipsContainer?.querySelector('.filter-chip[data-filter="all"]') as HTMLElement)?.classList.add('active');
    sortSelect.value = 'name';

    const allStudents = getCoachStudents(coachUsername);

    const renderOptions = () => {
        const filter = (filterChipsContainer?.querySelector('.filter-chip.active') as HTMLElement)?.dataset.filter || 'all';
        const sortBy = sortSelect.value;
        const searchTerm = searchInput.value.toLowerCase();

        const studentDataWithDetails = allStudents.map((s: any) => {
            const userData = getUserData(s.username);
            const lastActivityDate = (userData.workoutHistory && userData.workoutHistory.length > 0) 
                ? userData.workoutHistory[userData.workoutHistory.length - 1].date 
                : (userData.weightHistory && userData.weightHistory.length > 0)
                ? userData.weightHistory[userData.weightHistory.length - 1].date
                : s.joinDate;

            return {
                ...s,
                details: userData,
                name: userData.step1?.clientName || s.username,
                lastActivityTimestamp: new Date(lastActivityDate).getTime()
            };
        });

        // 1. Filtering
        let filteredStudents = studentDataWithDetails.filter(s => {
            if (searchTerm && !s.name.toLowerCase().includes(searchTerm)) {
                return false;
            }

            if (filter === 'needs_plan') {
                const latestPurchase = getLatestPurchase(s.details);
                return latestPurchase && !latestPurchase.fulfilled;
            }

            if (filter === 'inactive') {
                const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                return s.lastActivityTimestamp < oneWeekAgo;
            }
            
            return true; // 'all' filter
        });

        // 2. Sorting
        filteredStudents.sort((a, b) => {
            if (sortBy === 'activity') {
                return b.lastActivityTimestamp - a.lastActivityTimestamp;
            }
            if (sortBy === 'join_date') {
                return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
            }
            // Default: by name
            return a.name.localeCompare(b.name, 'fa');
        });

        const optionTemplate = document.getElementById('student-selection-option-template') as HTMLTemplateElement;
        if (!optionTemplate) {
            optionsContainer.innerHTML = '<p>Template not found</p>';
            return;
        }
        
        if(filteredStudents.length === 0) {
            optionsContainer.innerHTML = '<p class="text-text-secondary text-center col-span-full py-8">موردی برای نمایش یافت نشد.</p>';
            return;
        }

        optionsContainer.innerHTML = filteredStudents.map((s: any) => {
            const studentData = s.details;
            const name = s.name;
            const goal = studentData.step1?.trainingGoal || 'بدون هدف';
            const latestPurchase = getLatestPurchase(studentData);
            
            const optionNode = optionTemplate.content.cloneNode(true) as DocumentFragment;
            const button = optionNode.querySelector('.student-option-btn') as HTMLButtonElement;
            button.dataset.username = s.username;
            
            const avatar = button.querySelector('.student-avatar') as HTMLElement;
            avatar.textContent = name.substring(0, 1).toUpperCase();
            
            (button.querySelector('.student-name') as HTMLElement).textContent = name;
            const planStatusEl = button.querySelector('.student-plan-status') as HTMLElement;
             if (latestPurchase) {
                 if (latestPurchase.fulfilled === false) {
                    planStatusEl.innerHTML = `<span class="status-badge pending !text-xs !py-0.5 !px-2">در انتظار برنامه</span>`;
                    button.classList.add('needs-attention-highlight');
                } else {
                    planStatusEl.innerHTML = `<span class="status-badge verified !text-xs !py-0.5 !px-2">برنامه دارد</span>`;
                }
            }
            
            (button.querySelector('.student-goal') as HTMLElement).textContent = goal;

            const lastActivity = getLastActivity(studentData);
            (button.querySelector('.student-last-activity span') as HTMLElement).textContent = lastActivity;

            const weightChange = getWeightChange(studentData);
            const weightTrendEl = button.querySelector('.student-weight-trend') as HTMLElement;
            if (weightChange.change !== 0) {
                 const trendIcon = weightChange.trend === 'up' ? 'trending-up' : 'trending-down';
                 const trendColor = weightChange.trend === 'up' ? 'text-green-500' : 'text-red-500';
                 weightTrendEl.innerHTML = `<i data-lucide="${trendIcon}" class="w-3 h-3 ${trendColor}"></i><span class="${trendColor}">${weightChange.change > 0 ? '+' : ''}${weightChange.change} kg</span>`;
            } else {
                weightTrendEl.innerHTML = `<i data-lucide="minus" class="w-3 h-3"></i><span>بدون تغییر</span>`;
            }

            const progress = Math.abs(weightChange.change) * 20;
            (button.querySelector('.student-progress-bar-inner') as HTMLElement).style.width = `${Math.min(100, progress)}%`;

            const tempDiv = document.createElement('div');
            tempDiv.appendChild(optionNode);
            return tempDiv.innerHTML;
        }).join('');
        window.lucide.createIcons();
    };
    
    // Clear old listeners by cloning the node, then attach new ones
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode?.replaceChild(newSearchInput, searchInput);
    (newSearchInput as HTMLInputElement).addEventListener('input', renderOptions);
    
    const newSortSelect = sortSelect.cloneNode(true);
    sortSelect.parentNode?.replaceChild(newSortSelect, sortSelect);
    (newSortSelect as HTMLSelectElement).addEventListener('change', renderOptions);
    
    const newFilterChipsContainer = filterChipsContainer?.cloneNode(true) as HTMLElement | undefined;
    if (filterChipsContainer && newFilterChipsContainer) {
        filterChipsContainer.parentNode?.replaceChild(newFilterChipsContainer, filterChipsContainer);

        newFilterChipsContainer.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const chip = target.closest('.filter-chip');
            if (chip) {
                newFilterChipsContainer.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                renderOptions();
            }
        });
    }

    renderOptions();
    optionsContainer.className = "selection-modal-options p-4 pt-2 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 content-start";

    openModal(modal);
};

const openSelectionModal = (options: string[], title: string, target: HTMLElement) => {
    currentSelectionTarget = target;
    const modal = document.getElementById('selection-modal');
    if (!modal) return;

    const titleEl = modal.querySelector('.selection-modal-title') as HTMLElement;
    const optionsContainer = modal.querySelector('.selection-modal-options') as HTMLElement;
    const searchInput = modal.querySelector('.selection-modal-search') as HTMLInputElement;

    titleEl.textContent = title;
    searchInput.value = '';

    const renderOptions = (filter = '') => {
        const filteredOptions = options.filter(opt => opt.toLowerCase().includes(filter.toLowerCase()));
        const optionTemplate = document.getElementById('selection-modal-option-template') as HTMLTemplateElement;

        optionsContainer.innerHTML = filteredOptions.map(opt => {
            const optionNode = optionTemplate.content.cloneNode(true) as DocumentFragment;
            const button = optionNode.querySelector('.selection-option-btn') as HTMLButtonElement;
            button.textContent = opt;
            button.dataset.value = opt;
            return button.outerHTML;
        }).join('');
    };
    
    renderOptions();
    searchInput.oninput = () => renderOptions(searchInput.value);
    optionsContainer.className = "selection-modal-options p-4 pt-2 overflow-y-auto flex-grow grid grid-cols-2 sm:grid-cols-3 gap-2 content-start";

    openModal(modal);
};

const populateBuilderWithAI = (planData: any) => {
    const daysOfWeek = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
    const exerciseDB = getExercisesDB();
    
    // Clear existing exercises
    document.querySelectorAll('.exercises-container').forEach(c => c.innerHTML = '');

    // Populate new exercises
    planData.days.forEach((day: any, index: number) => {
        if (index >= daysOfWeek.length) return;
        const dayOfWeek = daysOfWeek[index];
        const dayCard = document.getElementById(`day-card-${dayOfWeek}`);
        if (dayCard) {
            // Update day name
            (dayCard.querySelector('summary span') as HTMLElement).textContent = day.name || dayOfWeek;
            
            // Add exercises
            (day.exercises || []).forEach((ex: any) => {
                const muscleGroup = Object.keys(exerciseDB).find(group => exerciseDB[group].includes(ex.name));
                if (muscleGroup) {
                    addExerciseRow(dayCard.id, ex);
                } else {
                    console.warn(`AI suggested exercise "${ex.name}" not found in DB. Skipping.`);
                }
            });
        }
    });

    // Populate notes
    const notesTextarea = document.getElementById('coach-notes-final') as HTMLTextAreaElement;
    if (notesTextarea && planData.notes) {
        notesTextarea.value = planData.notes;
    }
    
    showToast("پیش‌نویس برنامه با هوش مصنوعی ساخته شد!", "success");
    calculateAndDisplayVolume();
};

const getStudentsNeedingAttention = (students: any[]) => {
    return students.filter(student => {
        const studentData = getUserData(student.username);
        const latestPurchase = getLatestPurchase(studentData);
        return latestPurchase && latestPurchase.fulfilled === false;
    });
};

const getLastActivityDate = (userData: any): string => {
    const workoutDates = (userData.workoutHistory || []).map((h: any) => new Date(h.date).getTime());
    const weightDates = (userData.weightHistory || []).map((h: any) => new Date(h.date).getTime());
    const allDates = [...workoutDates, ...weightDates];
    if (allDates.length === 0) {
        return userData.joinDate || new Date(0).toISOString();
    }
    const validDates = allDates.filter(d => d && d > 0);
    if (validDates.length === 0) {
        return userData.joinDate || new Date(0).toISOString();
    }
    const lastTimestamp = Math.max(...validDates);
    return new Date(lastTimestamp).toISOString();
};
// Helper function to render the coach dashboard tab
const renderDashboardTab = (currentUser: string) => {
    const students = getCoachStudents(currentUser);
    const needsPlanStudents = getStudentsNeedingAttention(students);

    const kpiCards = [
        { title: 'شاگردان فعال', value: students.length, icon: 'users', color: 'admin-accent-blue' },
        { title: 'در انتظار برنامه', value: needsPlanStudents.length, icon: 'alert-circle', color: 'admin-accent-orange' },
        { title: 'امتیاز شما', value: '۴.۸ <span class="text-base font-normal">/ ۵</span>', icon: 'star', color: 'admin-accent-green' }
    ];

    const container = document.getElementById('dashboard-content');
    if (!container) return;

    container.innerHTML = `
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${kpiCards.map(kpi => `
                    <div class="divi-kpi-card">
                        <div class="icon-container" style="--icon-bg: var(--${kpi.color});"><i data-lucide="${kpi.icon}" class="w-6 h-6 text-white"></i></div>
                        <div>
                            <p class="kpi-value">${kpi.value}</p>
                            <p class="kpi-label">${kpi.title}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="card p-6">
                <h3 class="font-bold text-lg mb-4">شاگردان در انتظار برنامه</h3>
                <div id="dashboard-needs-attention-list" class="space-y-3">
                    ${needsPlanStudents.length > 0 ? needsPlanStudents.map(student => {
                        const studentData = getUserData(student.username);
                        const name = studentData.step1?.clientName || student.username;
                        const latestPurchase = getLatestPurchase(studentData);
                        return `
                            <div class="flex justify-between items-center p-3 bg-bg-tertiary rounded-lg">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white" style="background-color: ${getColorForName(name)};">
                                        ${name.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div>
                                        <p class="font-semibold">${name}</p>
                                        <p class="text-xs text-text-secondary">${latestPurchase?.planName || ''} - ${timeAgo(latestPurchase.purchaseDate)}</p>
                                    </div>
                                </div>
                                <button class="primary-button !py-1 !px-2 !text-xs" data-action="create-program" data-username="${student.username}">ایجاد برنامه</button>
                            </div>
                        `;
                    }).join('') : '<p class="text-text-secondary text-center">هیچ شاگردی منتظر برنامه نیست.</p>'}
                </div>
            </div>
        </div>
    `;
    window.lucide?.createIcons();
};

const renderProfileTab = (currentUser: string, userData: any) => {
    const container = document.getElementById('profile-content');
    if (!container) return;
    const { step1, profile } = userData;
    container.innerHTML = `
        <div class="card max-w-2xl mx-auto p-6">
            <h2 class="text-xl font-bold mb-4">پروفایل مربی</h2>
            <form id="coach-profile-form" class="space-y-4">
                <div class="input-group">
                    <input type="text" id="coach-profile-name" name="coach-profile-name" class="input-field w-full" value="${step1?.coachName || ''}" placeholder=" ">
                    <label for="coach-profile-name" class="input-label">نام نمایشی</label>
                </div>
                <div class="input-group">
                    <input type="text" id="coach-profile-specialization" name="coach-profile-specialization" class="input-field w-full" value="${profile?.specialization || ''}" placeholder=" ">
                    <label for="coach-profile-specialization" class="input-label">تخصص (مثلا: فیتنس، کاهش وزن)</label>
                </div>
                <div class="input-group">
                    <textarea id="coach-profile-bio" name="coach-profile-bio" class="input-field w-full min-h-[100px]" placeholder=" ">${profile?.bio || ''}</textarea>
                    <label for="coach-profile-bio" class="input-label">بیوگرافی کوتاه</label>
                </div>
                 <div class="input-group">
                    <input type="url" id="coach-profile-avatar" name="coach-profile-avatar" class="input-field w-full" value="${profile?.avatar || ''}" placeholder=" ">
                    <label for="coach-profile-avatar" class="input-label">لینک عکس پروفایل</label>
                </div>
                <button type="submit" class="primary-button w-full">ذخیره تغییرات</button>
            </form>
        </div>
    `;
};

const renderProgramBuilderTab = () => {
    const container = document.getElementById('program-builder-content');
    if (!container) return;
    const daysOfWeek = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
    container.innerHTML = `
        <div id="student-selection-prompt" class="text-center card p-8 animate-fade-in">
            <i data-lucide="users" class="w-12 h-12 mx-auto mb-4 text-accent"></i>
            <h3 class="font-bold text-xl">ابتدا یک شاگرد را انتخاب کنید</h3>
            <p class="text-text-secondary mt-2">برای شروع ساخت برنامه، لطفاً شاگرد مورد نظر خود را از لیست انتخاب کنید.</p>
            <button id="select-student-builder-btn" class="primary-button mt-6">انتخاب شاگرد</button>
        </div>
        <div id="program-builder-main" class="hidden">
            <div class="flex justify-between items-center mb-4">
                 <h2 class="text-xl font-bold">برنامه‌ساز برای: <span id="builder-student-name" class="text-accent"></span></h2>
                 <button id="reset-builder-btn" class="secondary-button !text-sm"><i data-lucide="rotate-cw" class="w-4 h-4 ml-2"></i>شروع مجدد</button>
            </div>
            <div class="card p-4 md:p-6">
                <!-- Stepper -->
                <div class="flex justify-around items-start mb-6 border-b border-border-primary pb-4">
                    ${['انتخاب شاگرد', 'برنامه تمرین', 'مکمل و تغذیه', 'بازبینی و ارسال'].map((title, index) => `
                        <div class="stepper-item flex-1" data-step="${index + 1}">
                            <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300">${index + 1}</div>
                            <span class="hidden md:inline font-semibold">${title}</span>
                        </div>
                        ${index < 3 ? '<div class="flex-grow h-px bg-border-primary mx-2 mt-4"></div>' : ''}
                    `).join('')}
                </div>

                <!-- Step Content -->
                <div id="step-content-1" class="step-content">
                    <div id="student-info-display"></div>
                </div>

                <div id="step-content-2" class="step-content hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="lg:col-span-2 space-y-4">
                             ${daysOfWeek.map(day => `
                                <details class="day-card card !shadow-none !border" id="day-card-${day}" open>
                                    <summary class="font-bold cursor-pointer flex justify-between items-center p-3">
                                        <span>${day}</span>
                                        <div class="flex items-center gap-2">
                                            <button class="add-exercise-btn secondary-button !py-1 !px-2 !text-xs" data-day-id="day-card-${day}">افزودن حرکت</button>
                                            <i data-lucide="chevron-down" class="details-arrow"></i>
                                        </div>
                                    </summary>
                                    <div class="exercises-container p-3 border-t border-border-primary space-y-2"></div>
                                </details>
                            `).join('')}
                        </div>
                        <div class="lg:col-span-1">
                             <div class="card p-4 sticky top-6">
                                <h4 class="font-bold mb-3 border-b border-border-primary pb-2">تحلیل حجم تمرین</h4>
                                <div id="volume-analysis-content" class="space-y-2 text-sm">
                                    <p class="text-text-secondary">با افزودن حرکات، حجم تمرین هفتگی برای هر گروه عضلانی در اینجا نمایش داده می‌شود.</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
                
                <div id="step-content-3" class="step-content hidden">
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 class="font-bold text-lg mb-4">برنامه مکمل</h3>
                            <div class="card p-4">
                                <div class="flex flex-col sm:flex-row items-center gap-2 mb-3">
                                    <button type="button" class="selection-button supplement-category-select-btn input-field w-full text-right justify-start" data-type="supplement-category">
                                        <span class="truncate">انتخاب دسته</span>
                                    </button>
                                    <button type="button" class="selection-button supplement-name-select-btn input-field w-full text-right justify-start" data-type="supplement-name" disabled>
                                        <span class="truncate">انتخاب مکمل</span>
                                    </button>
                                    <button id="add-supplement-btn" class="primary-button flex-shrink-0 !p-2.5"><i data-lucide="plus" class="w-5 h-5"></i></button>
                                </div>
                                <button id="ai-supplement-btn" class="secondary-button w-full !text-sm"><i data-lucide="sparkles" class="w-4 h-4 ml-2"></i>پیشنهاد مکمل با AI</button>
                                <div id="added-supplements-container" class="mt-4 space-y-3">
                                    <p class="text-text-secondary text-center p-4">مکمل‌های انتخابی در اینجا نمایش داده می‌شوند.</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg mb-4">برنامه غذایی</h3>
                            <div class="card p-4">
                                <div id="nutrition-plan-placeholder">
                                    <p class="text-text-secondary mb-4">یک برنامه غذایی نمونه و هوشمند بر اساس اطلاعات و هدف شاگرد خود ایجاد کنید.</p>
                                    <button id="ai-nutrition-btn" class="primary-button w-full"><i data-lucide="sparkles" class="w-4 h-4 ml-2"></i>تولید برنامه غذایی با AI</button>
                                </div>
                                <div id="nutrition-plan-display" class="hidden max-h-96 overflow-y-auto"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="step-content-4" class="step-content hidden">
                    <div>
                        <h3 class="font-bold text-lg mb-4">بازبینی نهایی و یادداشت مربی</h3>
                        <div class="input-group mb-6">
                            <textarea id="coach-notes-final" class="input-field w-full min-h-[100px]" placeholder=" "></textarea>
                            <label for="coach-notes-final" class="input-label">یادداشت برای شاگرد (اختیاری)</label>
                        </div>
                        <div class="program-page !max-w-full !p-0" id="program-preview-for-export"></div>
                        <div class="flex justify-center items-center gap-4 mt-6">
                            <button id="save-program-img-btn-builder" class="png-button"><i data-lucide="image" class="w-4 h-4 ml-2"></i> ذخیره عکس</button>
                            <button id="save-program-pdf-btn-builder" class="pdf-button"><i data-lucide="file-down" class="w-4 h-4 ml-2"></i> ذخیره PDF</button>
                        </div>
                    </div>
                </div>

                <!-- Navigation -->
                <div class="flex justify-between items-center mt-6 pt-4 border-t border-border-primary">
                    <button id="prev-step-btn" class="secondary-button" style="display: none;">قبلی</button>
                    <div class="flex items-center gap-2">
                         <button id="ai-draft-btn" class="secondary-button hidden"><i data-lucide="sparkles" class="w-4 h-4 ml-2"></i>ساخت پیش‌نویس با AI</button>
                         <button id="next-step-btn" class="primary-button">بعدی</button>
                         <button id="finish-program-btn" class="primary-button" style="display: none;">ثبت و ارسال برنامه</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    window.lucide?.createIcons();
};

const renderChatTab = (currentUser: string) => {
    const container = document.getElementById('chat-content');
    if (!container) return;

    container.innerHTML = `
        <div class="card h-[calc(100vh-12rem)] flex max-w-7xl mx-auto overflow-hidden">
            <!-- Students List -->
            <div class="w-1/3 border-l border-border-primary flex flex-col">
                <div class="p-4 border-b border-border-primary">
                    <h3 class="font-bold text-lg">گفتگوها</h3>
                </div>
                <div id="coach-chat-student-list" class="flex-grow overflow-y-auto">
                    <!-- Student items will be injected here -->
                </div>
            </div>
            <!-- Chat Window -->
            <div id="coach-chat-window" class="w-2/3 flex flex-col">
                <div class="p-8 text-center flex-grow flex flex-col justify-center items-center text-text-secondary">
                    <i data-lucide="messages-square" class="w-12 h-12 mb-4"></i>
                    <p>برای مشاهده گفتگو، یک شاگرد را از لیست انتخاب کنید.</p>
                </div>
            </div>
        </div>
    `;
    window.lucide?.createIcons();

    const studentListContainer = document.getElementById('coach-chat-student-list');
    const students = getCoachStudents(currentUser);

    if (students.length === 0) {
        studentListContainer!.innerHTML = `<p class="p-4 text-center text-text-secondary">شما هنوز شاگردی ندارید.</p>`;
        return;
    }

    const template = document.getElementById('coach-chat-student-template') as HTMLTemplateElement;

    studentListContainer!.innerHTML = students.map(student => {
        const studentData = getUserData(student.username);
        const name = studentData.step1?.clientName || student.username;
        const lastMessage = (studentData.chatHistory || []).slice(-1)[0];

        const clone = template.content.cloneNode(true) as DocumentFragment;
        const button = clone.querySelector('button')!;
        button.dataset.username = student.username;

        const avatar = button.querySelector('.student-avatar')!;
        avatar.textContent = name.substring(0, 1).toUpperCase();
        avatar.setAttribute('style', `background-color: ${getColorForName(name)}`);

        (button.querySelector('.student-name') as HTMLElement).textContent = name;

        if (lastMessage) {
            (button.querySelector('.last-message-time') as HTMLElement).textContent = timeAgo(lastMessage.timestamp);
            (button.querySelector('.last-message-snippet') as HTMLElement).textContent = lastMessage.message;
        } else {
            (button.querySelector('.last-message-snippet') as HTMLElement).textContent = 'گفتگویی شروع نشده است.';
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(clone);
        return tempDiv.innerHTML;
    }).join('');

    // Function to load a conversation
    const loadConversation = (studentUsername: string) => {
        const chatWindow = document.getElementById('coach-chat-window');
        if (!chatWindow) return;

        // Highlight selected student
        document.querySelectorAll('.coach-chat-student-item').forEach(item => {
            item.classList.toggle('active', (item as HTMLElement).dataset.username === studentUsername);
        });

        const studentData = getUserData(studentUsername);
        const studentUser = getUsers().find((u:any) => u.username === studentUsername);
        const name = studentData.step1?.clientName || studentUsername;
        const avatar = studentData.profile?.avatar;
        
        chatWindow.innerHTML = `
            <div class="chat-header">
                ${avatar ? 
                    `<img src="${avatar}" alt="${name}" class="chat-avatar">` :
                    `<div class="chat-avatar" style="background-color: ${getColorForName(name)}">${name.charAt(0)}</div>`
                }
                <div>
                    <h3 class="font-bold">${name}</h3>
                    <p class="text-xs text-text-secondary">${studentUser.email}</p>
                </div>
            </div>
            <div id="coach-chat-messages-container" class="p-4 flex-grow overflow-y-auto message-container flex flex-col-reverse">
                <div class="space-y-4">
                    <!-- Messages will be injected here in reverse order -->
                </div>
            </div>
            <div class="p-4 border-t border-border-primary">
                <form id="coach-chat-form-main" data-username="${studentUsername}" class="flex items-center gap-3">
                    <input id="coach-chat-input-main" type="text" class="input-field flex-grow" placeholder="پیام خود را بنویسید..." autocomplete="off">
                    <button type="submit" class="primary-button !p-3"><i data-lucide="send" class="w-5 h-5"></i></button>
                </form>
            </div>
        `;
        window.lucide?.createIcons();

        const renderMessages = () => {
            const messagesContainer = chatWindow.querySelector('#coach-chat-messages-container > div');
            if (!messagesContainer) return;
            const currentData = getUserData(studentUsername);
            const chatHistory = (currentData.chatHistory || []).slice().reverse();
            messagesContainer.innerHTML = chatHistory.map((msg: any) => `
                <div class="flex ${msg.sender === 'coach' ? 'justify-end' : 'justify-start'}">
                    <div class="message-bubble ${msg.sender === 'coach' ? 'message-sent' : 'message-received'}">
                        <div class="message-content">${sanitizeHTML(msg.message)}</div>
                        <div class="message-timestamp">${timeAgo(msg.timestamp)}</div>
                    </div>
                </div>
            `).join('');
        };

        renderMessages();

        // Attach form listener
        const chatForm = document.getElementById('coach-chat-form-main');
        chatForm?.addEventListener('submit', e => {
            e.preventDefault();
            const input = document.getElementById('coach-chat-input-main') as HTMLInputElement;
            const message = input.value.trim();
            const targetUsername = (e.currentTarget as HTMLElement).dataset.username;

            if (message && targetUsername) {
                const targetData = getUserData(targetUsername);
                if (!targetData.chatHistory) targetData.chatHistory = [];
                targetData.chatHistory.push({
                    sender: 'coach',
                    message: message,
                    timestamp: new Date().toISOString()
                });
                saveUserData(targetUsername, targetData);
                setNotification(targetUsername, 'chat-content', '💬');
                input.value = '';
                renderMessages();
                
                const studentListItem = studentListContainer?.querySelector(`[data-username="${targetUsername}"]`);
                if(studentListItem) {
                    (studentListItem.querySelector('.last-message-snippet') as HTMLElement).textContent = message;
                    (studentListItem.querySelector('.last-message-time') as HTMLElement).textContent = 'همین الان';
                }
            }
        });
    };

    // Attach listeners to student list
    studentListContainer?.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const studentItem = target.closest<HTMLButtonElement>('.coach-chat-student-item');
        if (studentItem && studentItem.dataset.username) {
            loadConversation(studentItem.dataset.username);
        }
    });
    
    if(students.length > 0) {
        loadConversation(students[0].username);
    }
};

const renderStudentCards = (students: any[], containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (students.length === 0) {
        if (containerId === 'needs-attention-grid') {
            container.innerHTML = `<p class="text-text-secondary text-center col-span-full py-8">هیچ شاگردی در حال حاضر منتظر برنامه نیست.</p>`;
        } else {
            container.innerHTML = `<p class="text-text-secondary text-center col-span-full py-8">موردی برای نمایش یافت نشد.</p>`;
        }
        return;
    }

    container.innerHTML = students.map(student => {
        const studentData = getUserData(student.username);
        const name = studentData.step1?.clientName || student.username;
        const goal = studentData.step1?.trainingGoal || 'بدون هدف';
        const latestPurchase = getLatestPurchase(studentData);

        const streak = calculateWorkoutStreak(studentData.workoutHistory);
        const weightChange = getWeightChange(studentData);
        const needsPlan = latestPurchase && latestPurchase.fulfilled === false;

        const trendIcon = weightChange.trend === 'up' ? 'trending-up' : 'trending-down';
        const trendColor = weightChange.trend === 'up' ? 'text-green-500' : 'text-red-500';

        const cardClasses = `student-card card p-6 flex flex-col gap-5 animate-fade-in ${
            needsPlan ? 'bg-accent/5 border-accent/40 needs-attention-highlight' : 'bg-bg-secondary'
        }`;
        
        let purchaseInfoHtml = `
            <div class="info-card !bg-bg-secondary !border-dashed p-3 text-center">
                 <p class="text-sm text-text-secondary">خریدی ثبت نشده است.</p>
            </div>
        `;
        if (latestPurchase) {
             purchaseInfoHtml = `
                <div class="info-card p-3 ${needsPlan ? '!bg-accent/10' : ''}">
                    <div class="flex justify-between items-center">
                         <div>
                            <p class="text-xs text-text-secondary">آخرین خرید</p>
                            <p class="font-bold text-sm">${latestPurchase.planName}</p>
                            <p class="text-xs text-text-secondary">${new Date(latestPurchase.purchaseDate).toLocaleDateString('fa-IR')}</p>
                         </div>
                         ${needsPlan 
                            ? '<span class="status-badge pending animate-pulse-accent !text-xs !py-0.5 !px-2 flex-shrink-0">در انتظار</span>' 
                            : '<span class="status-badge verified !text-xs !py-0.5 !px-2 flex-shrink-0">انجام شده</span>'
                         }
                    </div>
                </div>
            `;
        }


        return `
            <div class="${cardClasses}">
                <!-- Header -->
                <div class="flex items-start gap-4">
                    <div class="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xl text-white" style="background-color: ${getColorForName(name)};">
                        ${name.substring(0, 1).toUpperCase()}
                    </div>
                    <div class="flex-grow overflow-hidden">
                        <h3 class="font-bold text-xl truncate">${name}</h3>
                        <p class="text-sm text-text-secondary truncate">${goal}</p>
                    </div>
                </div>
                
                <!-- KPIs -->
                <div class="grid grid-cols-3 gap-4 text-center text-sm py-4 border-y border-border-primary">
                    <div>
                        <p class="font-extrabold text-2xl flex items-center justify-center gap-1.5">${streak} <i data-lucide="flame" class="w-5 h-5 text-orange-400"></i></p>
                        <p class="text-xs text-text-secondary mt-1">زنجیره تمرین</p>
                    </div>
                    <div>
                        <p class="font-extrabold text-2xl flex items-center justify-center gap-1.5 ${weightChange.change !== 0 ? trendColor : ''}">
                            ${weightChange.change !== 0 ? `<i data-lucide="${trendIcon}" class="w-5 h-5"></i>` : ''}
                            ${weightChange.change >= 0 ? '+' : ''}${weightChange.change}
                        </p>
                        <p class="text-xs text-text-secondary mt-1">تغییر وزن (kg)</p>
                    </div>
                    <div>
                        <p class="font-extrabold text-2xl">${getLastActivity(studentData).split(' ')[0]}</p>
                        <p class="text-xs text-text-secondary mt-1">آخرین فعالیت</p>
                    </div>
                </div>

                <!-- Purchase Info -->
                ${purchaseInfoHtml}
                
                <!-- Actions -->
                <div class="mt-auto flex items-center gap-3">
                    <button data-action="create-program" data-username="${student.username}" class="${needsPlan ? 'primary-button' : 'secondary-button'} !py-2.5 !px-4 !text-sm flex-grow">
                        <i data-lucide="${needsPlan ? 'plus-circle' : 'edit'}" class="w-4 h-4 mr-2"></i>
                        ${needsPlan ? 'ساخت برنامه' : 'ویرایش برنامه'}
                    </button>
                    <button data-action="view-student" data-username="${student.username}" class="secondary-button !py-2.5 !px-4 !text-sm"><i data-lucide="user" class="w-4 h-4 pointer-events-none"></i></button>
                </div>
            </div>
        `;
    }).join('');
    window.lucide?.createIcons();
};

export function initCoachDashboard(currentUser: string, handleLogout: () => void, handleGoToHome: () => void) {
    const mainContainer = document.getElementById('coach-dashboard-container');
    if (!mainContainer) return;

    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('go-to-home-btn')?.addEventListener('click', handleGoToHome);

    const pageTitles: Record<string, { title: string, subtitle: string }> = {
        'dashboard-content': { title: 'داشبورد', subtitle: 'خلاصه فعالیت‌ها و آمار شما.' },
        'students-content': { title: 'شاگردان', subtitle: 'مدیریت شاگردان و برنامه‌هایشان.' },
        'chat-content': { title: 'گفتگو', subtitle: 'با شاگردان خود در ارتباط باشید.' },
        'program-builder-content': { title: 'برنامه‌ساز', subtitle: 'ایجاد برنامه‌های تمرینی و غذایی.' },
        'templates-content': { title: 'الگوها', subtitle: 'مدیریت الگوهای برنامه‌های تمرینی.' },
        'profile-content': { title: 'پروفایل', subtitle: 'اطلاعات عمومی خود را ویرایش کنید.' }
    };
    
    const switchTab = (activeTab: HTMLElement) => {
        const targetId = activeTab.getAttribute('data-target');
        if (!targetId) return;

        mainContainer.querySelectorAll('.coach-nav-link').forEach(t => t.classList.remove('active-nav-link'));
        activeTab.classList.add('active-nav-link');
        mainContainer.querySelectorAll('.coach-tab-content').forEach(content => {
            content.classList.toggle('hidden', content.id !== targetId);
        });

        const targetData = pageTitles[targetId];
        const titleEl = document.getElementById('coach-page-title');
        const subtitleEl = document.getElementById('coach-page-subtitle');
        if (titleEl && subtitleEl && targetData) {
            titleEl.textContent = targetData.title;
            subtitleEl.textContent = targetData.subtitle;
        }

        clearNotification(currentUser, targetId);
        updateCoachNotifications(currentUser);
        
        switch (targetId) {
            case 'dashboard-content':
                renderDashboardTab(currentUser);
                break;
            case 'students-content':
                 mainContainer.querySelector('#students-content')!.innerHTML = `
                    <div id="all-students-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
                 `;
                const allStudents = getCoachStudents(currentUser);
                renderStudentCards(allStudents, 'all-students-grid');
                break;
            case 'chat-content':
                renderChatTab(currentUser);
                break;
            case 'program-builder-content':
                renderProgramBuilderTab();
                resetProgramBuilder();
                break;
            case 'templates-content':
                mainContainer.querySelector('#templates-content')!.innerHTML = `
                    <div class="card p-6">
                        <div class="flex justify-between items-center mb-4">
                             <h3 class="font-bold text-lg">الگوهای برنامه</h3>
                             <button id="save-current-as-template-btn" class="secondary-button">ذخیره برنامه فعلی به عنوان الگو</button>
                        </div>
                        <div id="templates-list-container" class="space-y-2"></div>
                    </div>
                `;
                renderTemplatesTab();
                break;
            case 'profile-content':
                renderProfileTab(currentUser, getUserData(currentUser));
                break;
        }
    };
    
    const defaultTab = mainContainer.querySelector<HTMLElement>('.coach-nav-link');
    if(defaultTab) switchTab(defaultTab);
    
    mainContainer.addEventListener('input', e => {
        if (!(e.target instanceof HTMLInputElement)) return;
        const target = e.target;
        if (target.matches('.range-slider')) {
            const labelSpan = target.previousElementSibling?.querySelector('span');
            if (labelSpan) labelSpan.textContent = target.value;
            updateSliderTrack(target);
            if (target.matches('.set-slider') || target.matches('.rep-slider')) {
                calculateAndDisplayVolume();
            }
        }
    });
    
    mainContainer.addEventListener('click', e => {
        if (!(e.target instanceof HTMLElement)) return;
        const target = e.target;
        
        const navLink = target.closest<HTMLElement>('.coach-nav-link');
        if (navLink) {
            switchTab(navLink);
            return;
        }

        const closeModalBtn = target.closest('.close-modal-btn');
        if (closeModalBtn) {
            const modal = closeModalBtn.closest('.modal');
            if (modal) closeModal(modal as HTMLElement);
            return;
        }
        
        const actionBtn = target.closest<HTMLButtonElement>('button[data-action]');
        if (actionBtn) {
            const action = actionBtn.dataset.action;
            const username = actionBtn.dataset.username;
            if (action === 'create-program') {
                const programTab = document.querySelector<HTMLElement>('.coach-nav-link[data-target="program-builder-content"]');
                if (programTab) switchTab(programTab);
                if (username) renderStudentInfoForBuilder(username);
            } else if (action === 'view-student' && username) {
                openStudentProfileModal(username);
            }
            return;
        }

        const addExerciseBtn = target.closest('.add-exercise-btn');
        if (addExerciseBtn) {
            const dayId = (addExerciseBtn as HTMLElement).dataset.dayId;
            if (dayId) addExerciseRow(dayId);
            return;
        }

        const removeExerciseBtn = target.closest('.remove-exercise-btn');
        if (removeExerciseBtn) {
            removeExerciseBtn.closest('.exercise-row')?.remove();
            calculateAndDisplayVolume();
            return;
        }

        const supersetBtn = target.closest('.superset-btn');
        if (supersetBtn) {
            supersetBtn.classList.toggle('active');
            const row = supersetBtn.closest('.exercise-row');
            if (row) row.classList.toggle('is-superset');
            return;
        }
        
        const selectionBtn = target.closest('.selection-button');
        if (selectionBtn && selectionBtn.closest('#program-builder-main')) {
            const type = (selectionBtn as HTMLElement).dataset.type;
            const exerciseDB = getExercisesDB();
            const supplementsDB = getSupplementsDB();
            if (type === 'muscle-group') {
                openSelectionModal(Object.keys(exerciseDB), 'انتخاب گروه عضلانی', selectionBtn as HTMLElement);
            } else if (type === 'exercise') {
                const row = selectionBtn.closest('.exercise-row');
                const muscleGroup = row?.querySelector<HTMLElement>('.muscle-group-select')?.dataset.value;
                if (muscleGroup && exerciseDB[muscleGroup]) {
                    openSelectionModal(exerciseDB[muscleGroup], `انتخاب حرکت برای ${muscleGroup}`, selectionBtn as HTMLElement);
                }
            } else if (type === 'supplement-category') {
                openSelectionModal(Object.keys(supplementsDB), 'انتخاب دسته مکمل', selectionBtn as HTMLElement);
            } else if (type === 'supplement-name') {
                const category = document.querySelector<HTMLElement>('.supplement-category-select-btn')?.dataset.value;
                if (category && supplementsDB[category]) {
                    openSelectionModal(supplementsDB[category].map((s: any) => s.name), 'انتخاب نام مکمل', selectionBtn as HTMLElement);
                }
            }
            return;
        }
        
        const selectionOption = target.closest('.selection-option-btn');
        if (selectionOption && currentSelectionTarget) {
            const value = (selectionOption as HTMLElement).dataset.value;
            if (value) {
                (currentSelectionTarget.querySelector('span') as HTMLElement).textContent = value;
                currentSelectionTarget.dataset.value = value;
                const type = currentSelectionTarget.dataset.type;

                if (type === 'muscle-group') {
                    const row = currentSelectionTarget.closest('.exercise-row');
                    const exerciseSelect = row?.querySelector('.exercise-select') as HTMLButtonElement;
                    if (exerciseSelect) {
                        exerciseSelect.disabled = false;
                        exerciseSelect.dataset.value = '';
                        (exerciseSelect.querySelector('span') as HTMLElement).textContent = 'انتخاب حرکت';
                    }
                    if (row) (row as HTMLElement).dataset.exerciseMuscleGroup = value;
                } else if (type === 'exercise') {
                     const row = currentSelectionTarget.closest('.exercise-row');
                     if(row) (row as HTMLElement).dataset.exerciseName = value;
                } else if (type === 'supplement-category') {
                    const nameSelect = document.querySelector('.supplement-name-select-btn') as HTMLButtonElement;
                    if (nameSelect) {
                        nameSelect.disabled = false;
                        nameSelect.dataset.value = '';
                        (nameSelect.querySelector('span') as HTMLElement).textContent = 'انتخاب مکمل';
                    }
                }
                calculateAndDisplayVolume();
            }
            closeModal(document.getElementById('selection-modal'));
            currentSelectionTarget = null;
            return;
        }

        // Program Builder: Select Student
        const selectStudentBuilderBtn = target.closest('#select-student-builder-btn');
        if (selectStudentBuilderBtn) {
            openStudentSelectionModal(selectStudentBuilderBtn as HTMLElement, currentUser);
            return;
        }
        
        const studentOptionBtn = target.closest('.student-option-btn');
        if (studentOptionBtn && studentOptionBtn.closest('#selection-modal')) {
            const username = (studentOptionBtn as HTMLElement).dataset.username;
            if(username) {
                renderStudentInfoForBuilder(username);
                closeModal(document.getElementById('selection-modal'));
                changeStep(2);
            }
            return;
        }

        // Program Builder: Stepper Navigation
        if (target.closest('#next-step-btn')) {
            if (currentStep === 1 && !activeStudentUsername) {
                showToast('لطفا ابتدا یک شاگرد را انتخاب کنید.', 'error');
                return;
            }
            if (currentStep < totalSteps) changeStep(currentStep + 1);
            return;
        }
        if (target.closest('#prev-step-btn')) {
            if (currentStep > 1) changeStep(currentStep - 1);
            return;
        }
        const stepperItem = target.closest<HTMLElement>('.stepper-item');
        if (stepperItem) {
            const step = parseInt(stepperItem.dataset.step || '1', 10);
            if (step < currentStep || (step > 1 && activeStudentUsername)) {
                changeStep(step);
            } else if (step > 1 && !activeStudentUsername) {
                 showToast('لطفا ابتدا یک شاگرد را انتخاب کنید.', 'error');
            }
        }
    });

     mainContainer.addEventListener('submit', e => {
        if (e.target && (e.target as HTMLElement).id === 'coach-profile-form') {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const freshData = getUserData(currentUser);
            if (!freshData.step1) freshData.step1 = {};
            if (!freshData.profile) freshData.profile = {};

            freshData.step1.coachName = (form.elements.namedItem('coach-profile-name') as HTMLInputElement).value;
            freshData.profile.specialization = (form.elements.namedItem('coach-profile-specialization') as HTMLInputElement).value;
            freshData.profile.bio = (form.elements.namedItem('coach-profile-bio') as HTMLTextAreaElement).value;
            freshData.profile.avatar = (form.elements.namedItem('coach-profile-avatar') as HTMLInputElement).value;

            saveUserData(currentUser, freshData);
            showToast('پروفایل با موفقیت ذخیره شد.', 'success');
            // Re-render header with new name
            const name = freshData.step1.coachName || currentUser;
            const headerNameEl = mainContainer.querySelector('.flex.items-center.gap-3.bg-bg-secondary .font-bold.text-sm');
            if (headerNameEl) headerNameEl.textContent = name;
        }
    });
}