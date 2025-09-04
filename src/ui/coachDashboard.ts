import { getTemplates, saveTemplate, deleteTemplate, getUsers, getUserData, saveUserData, getNotifications, setNotification, clearNotification, getExercisesDB, getSupplementsDB } from '../services/storage';
import { showToast, updateSliderTrack, openModal, closeModal, exportElement, sanitizeHTML, hexToRgba } from '../utils/dom';
import { getLatestPurchase, timeAgo, getLastActivity } from '../utils/helpers';
import { generateWorkoutPlan, generateSupplementPlan, generateNutritionPlan, generateFoodReplacements } from '../services/gemini';
import { calculateWorkoutStreak, performMetricCalculations, getWeightChange } from '../utils/calculations';

let currentStep = 1;
const totalSteps = 4;
let activeStudentUsername: string | null = null;
let studentModalChartInstance: any = null;
let currentSelectionTarget: HTMLElement | null = null;
let exerciseToMuscleGroupMap: Record<string, string> = {};
let currentNutritionPlanObject: any | null = null;
let isEditingRecentProgram = false;
let activeReplacementTarget: HTMLLIElement | null = null;

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
    <div id="coach-dashboard-container" class="lg:flex h-screen bg-bg-primary transition-opacity duration-500 opacity-0">
        <aside class="fixed inset-y-0 right-0 z-40 w-64 bg-bg-secondary p-4 flex flex-col flex-shrink-0 border-l border-border-primary transform translate-x-full transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0">
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
                <div class="flex items-center gap-2">
                    <button id="sidebar-toggle" class="lg:hidden p-2 -mr-2 text-text-secondary hover:text-text-primary">
                        <i data-lucide="menu" class="w-6 h-6"></i>
                    </button>
                    <div>
                        <h1 id="coach-page-title" class="text-3xl font-bold">داشبورد</h1>
                        <p id="coach-page-subtitle" class="text-text-secondary">خلاصه فعالیت‌ها و آمار شما.</p>
                    </div>
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
                                 <div id="coach-chat-messages-container" class="p-2 flex-grow overflow-y-auto message-container flex flex-col">
                                    <div class="space-y-4"></div>
                                </div>
                                <div class="p-2 border-t border-border-primary">
                                    <div id="coach-quick-replies" class="flex items-center gap-2 mb-2 flex-wrap"></div>
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
     <div id="local-client-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <form id="local-client-form" class="card w-full max-w-lg transform scale-95 transition-transform duration-300 relative">
             <div class="flex justify-between items-center p-4 border-b border-border-primary">
                <h2 id="local-client-modal-title" class="font-bold text-xl">افزودن شاگرد حضوری</h2>
                <button type="button" class="close-modal-btn secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button>
            </div>
            <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                    <h3 class="font-bold text-md mb-3 border-b border-border-primary pb-2 text-accent">اطلاعات پایه</h3>
                    <div class="space-y-4 pt-2">
                        <div class="input-group"><input type="text" name="clientName" class="input-field w-full" placeholder=" " required><label class="input-label">نام و نام خانوادگی *</label></div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="input-group"><input type="number" name="age" class="input-field w-full" placeholder=" "><label class="input-label">سن</label></div>
                            <div class="input-group"><input type="number" name="height" class="input-field w-full" placeholder=" "><label class="input-label">قد (cm)</label></div>
                        </div>
                        <div class="input-group"><input type="number" step="0.5" name="weight" class="input-field w-full" placeholder=" "><label class="input-label">وزن (kg)</label></div>
                        <div>
                            <p class="text-sm font-semibold mb-2">جنسیت</p>
                            <div class="grid grid-cols-2 gap-2">
                                <label class="option-card-label"><input type="radio" name="gender" value="مرد" class="option-card-input" checked><span class="option-card-content">مرد</span></label>
                                <label class="option-card-label"><input type="radio" name="gender" value="زن" class="option-card-input"><span class="option-card-content">زن</span></label>
                            </div>
                        </div>
                         <div class="input-group"><input type="text" name="contact" class="input-field w-full" placeholder=" "><label class="input-label">اطلاعات تماس (اختیاری)</label></div>
                    </div>
                </div>

                 <div>
                    <h3 class="font-bold text-md mb-3 border-b border-border-primary pb-2 text-accent">جزئیات تمرینی</h3>
                    <div class="space-y-4 pt-2">
                        <div class="input-group"><input type="text" name="trainingGoal" class="input-field w-full" placeholder="مثلا: کاهش وزن، افزایش حجم"><label class="input-label">هدف تمرینی</label></div>
                        <div class="input-group"><input type="number" name="trainingDays" class="input-field w-full" placeholder=" "><label class="input-label">روزهای تمرین در هفته</label></div>
                        <div>
                            <p class="text-sm font-semibold mb-2">سطح فعالیت روزانه</p>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                                <label class="option-card-label"><input type="radio" name="activityLevel" value="1.2" class="option-card-input"><span class="option-card-content">نشسته</span></label>
                                <label class="option-card-label"><input type="radio" name="activityLevel" value="1.375" class="option-card-input"><span class="option-card-content">کم</span></label>
                                <label class="option-card-label"><input type="radio" name="activityLevel" value="1.55" class="option-card-input" checked><span class="option-card-content">متوسط</span></label>
                                <label class="option-card-label"><input type="radio" name="activityLevel" value="1.725" class="option-card-input"><span class="option-card-content">زیاد</span></label>
                                <label class="option-card-label"><input type="radio" name="activityLevel" value="1.9" class="option-card-input"><span class="option-card-content">خیلی زیاد</span></label>
                            </div>
                        </div>
                        <div>
                            <p class="text-sm font-semibold mb-2">سطح تجربه</p>
                            <div class="grid grid-cols-3 gap-2">
                                <label class="option-card-label"><input type="radio" name="experienceLevel" value="مبتدی" class="option-card-input" checked><span class="option-card-content">مبتدی</span></label>
                                <label class="option-card-label"><input type="radio" name="experienceLevel" value="متوسط" class="option-card-input"><span class="option-card-content">متوسط</span></label>
                                <label class="option-card-label"><input type="radio" name="experienceLevel" value="پیشرفته" class="option-card-input"><span class="option-card-content">پیشرفته</span></label>
                            </div>
                        </div>
                        <div class="input-group"><textarea name="limitations" class="input-field w-full min-h-[80px]" placeholder=" "></textarea><label class="input-label">آسیب دیدگی یا محدودیت‌ها</label></div>
                    </div>
                </div>

                <div>
                    <h3 class="font-bold text-md mb-3 border-b border-border-primary pb-2 text-accent">سایر اطلاعات</h3>
                    <div class="space-y-4 pt-2">
                        <div class="input-group"><textarea name="coachNotes" class="input-field w-full min-h-[80px]" placeholder=" "></textarea><label class="input-label">یادداشت‌های مربی (محرمانه)</label></div>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-border-primary"><button type="submit" class="primary-button w-full">ذخیره شاگرد</button></div>
        </form>
    </div>
    <div id="replacement-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-lg transform scale-95 transition-transform duration-300 relative">
            <div class="flex justify-between items-center p-4 border-b border-border-primary">
                <h2 id="replacement-modal-title" class="font-bold text-xl">جایگزینی برای: <span class="text-accent"></span></h2>
                <button class="close-modal-btn secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button>
            </div>
            <div id="replacement-modal-body" class="p-6 min-h-[150px]">
                <!-- Loading or suggestions here -->
            </div>
            <div class="p-4 border-t border-border-primary flex justify-end">
                <button id="just-delete-btn" class="secondary-button !text-red-accent">فقط حذف کن</button>
            </div>
        </div>
    </div>
    `;
}

const getCoachAllStudents = (coachUsername: string) => {
    // 1. Get registered students
    const registeredStudents = getUsers()
        .filter((u: any) => {
            if (u.role !== 'user') return false;
            const studentData = getUserData(u.username);
            return studentData.step1?.coachName === coachUsername;
        })
        .map((u: any) => ({ ...u, isLocal: false, id: u.username }));

    // 2. Get local students from coach's data
    const coachData = getUserData(coachUsername);
    const localStudents = (coachData.localStudents || []).map((s: any) => ({
        ...s, // Contains id and step1
        username: s.id, // Use ID as the unique identifier
        isLocal: true,
        joinDate: s.joinDate || new Date().toISOString(), // Fallback join date
    }));

    return [...registeredStudents, ...localStudents];
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
            <summary class="font-bold cursor-pointer flex justify-between items-center p-3 rounded-md" style="border-right: 4px solid ${dayColor}; background-color: ${hexToRgba(dayColor, 0.1)};">
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

const openStudentProfileModal = (studentId: string, coachUsername: string) => {
    const modal = document.getElementById('student-profile-modal');
    if (!modal) return;
    
    activeStudentUsername = studentId;
    const isLocal = studentId.startsWith('local_');
    let userData: any;
    let user: any;

    if (isLocal) {
        const coachData = getUserData(coachUsername);
        userData = (coachData.localStudents || []).find((s: any) => s.id === studentId);
        if (!userData) return;
        user = { email: userData.step1?.contact || 'شاگرد حضوری', ...userData };
    } else {
        userData = getUserData(studentId);
        user = getUsers().find((u:any) => u.username === studentId);
    }


    (modal.querySelector('#student-modal-name') as HTMLElement).textContent = userData.step1?.clientName || studentId;
    
    const infoSidebar = modal.querySelector('.w-full.md\\:w-1\\/3') as HTMLElement;
    const lastWeight = (userData.weightHistory?.slice(-1)[0]?.weight || userData.step1?.weight || null);
    const height = userData.step1?.height;
    const bmi = (height && lastWeight > 0) ? (lastWeight / ((height / 100) ** 2)) : null;

    if (infoSidebar) {
        const latestProgram = (userData.programHistory && userData.programHistory.length > 0) ? userData.programHistory[0] : null;
        const isEditable = !isLocal && latestProgram && (Date.now() - new Date(latestProgram.date).getTime()) < 48 * 60 * 60 * 1000;
        let buttonHtml = `<button data-action="create-program" data-username="${studentId}" class="primary-button w-full mt-4 !text-sm">ارسال برنامه جدید</button>`;
        if (isEditable) {
            const hoursLeft = Math.round(48 - (Date.now() - new Date(latestProgram.date).getTime()) / (1000*60*60));
            buttonHtml = `<button data-action="edit-recent-program" data-username="${studentId}" class="primary-button w-full mt-4 !text-sm !bg-yellow-500 hover:!bg-yellow-600">ویرایش آخرین برنامه (${hoursLeft} ساعت مانده)</button>`;
        }

        infoSidebar.innerHTML = `
            <div class="p-4 h-full flex flex-col">
                <div class="flex-grow">
                    <h4 class="font-bold mb-3">اطلاعات کلی</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between"><span>هدف:</span> <strong class="font-semibold">${userData.step1?.trainingGoal || 'تعیین نشده'}</strong></div>
                        <div class="flex justify-between"><span>ایمیل/تماس:</span> <strong>${user.email}</strong></div>
                        <div class="flex justify-between"><span>سن:</span> <strong>${(userData.step1?.age || 'N/A')}</strong></div>
                        <div class="flex justify-between"><span>قد (cm):</span> <strong>${(userData.step1?.height || 'N/A')}</strong></div>
                        <div class="flex justify-between"><span>وزن (kg):</span> <strong>${(lastWeight ? lastWeight.toFixed(1) : 'N/A')}</strong></div>
                        <div class="flex justify-between"><span>سطح تجربه:</span> <strong class="font-semibold">${userData.step1?.experienceLevel || 'تعیین نشده'}</strong></div>
                        <div class="flex justify-between"><span>TDEE:</span> <strong>${(Math.round(userData.step1?.tdee) || 'N/A')}</strong></div>
                    </div>
                    ${userData.step1?.limitations ? `
                    <div class="mt-4 pt-4 border-t border-border-primary">
                        <h5 class="font-semibold text-sm mb-1">محدودیت‌ها</h5>
                        <p class="text-xs text-text-secondary whitespace-pre-wrap">${sanitizeHTML(userData.step1.limitations)}</p>
                    </div>` : ''}
                    ${userData.step1?.coachNotes ? `
                    <div class="mt-4 pt-4 border-t border-border-primary">
                        <h5 class="font-semibold text-sm mb-1">یادداشت‌های شما</h5>
                        <p class="text-xs text-text-secondary whitespace-pre-wrap">${sanitizeHTML(userData.step1.coachNotes)}</p>
                    </div>` : ''}
                </div>
                ${buttonHtml}
            </div>
        `;
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

    const chatTab = modal.querySelector('.student-modal-tab[data-target="student-chat-content"]') as HTMLButtonElement;
    const chatContent = modal.querySelector('#student-chat-content');

    if (isLocal) {
        chatTab.style.display = 'none';
        chatContent.innerHTML = '';
    } else {
        chatTab.style.display = 'block';
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
    const renderChat = () => {
        const chatUserData = getUserData(studentId);
        const messagesContainer = chatContent?.querySelector('#coach-chat-messages-container');
        const messagesInnerContainer = messagesContainer?.querySelector('div');

        if (!messagesContainer || !messagesInnerContainer) return;
        
        const chatHistory = (chatUserData.chatHistory || []);
        messagesInnerContainer.innerHTML = chatHistory.map((msg: any) => `
            <div class="flex ${msg.sender === 'coach' ? 'justify-end' : 'justify-start'}">
                 <div class="message-bubble ${msg.sender === 'coach' ? 'message-sent' : 'message-received'}">
                    <div class="message-content">${sanitizeHTML(msg.message)}</div>
                    <div class="message-timestamp">${timeAgo(msg.timestamp)}</div>
                 </div>
            </div>
        `).join('');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    if (!isLocal) {
        renderChat();

        const chatForm = chatContent?.querySelector('#coach-chat-form') as HTMLFormElement;
        const chatInput = chatContent?.querySelector('#coach-chat-input') as HTMLInputElement;

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
    }


    openModal(modal);
    window.lucide?.createIcons();
};

const gatherPlanData = () => {
    if (!activeStudentUsername) return null;
    
    const isLocal = activeStudentUsername.startsWith('local_');
    let studentData: any;
    
    const coachUsername = document.querySelector<HTMLElement>('#coach-dashboard-container')?.id.replace('coach-dashboard-container', '') || '';
    if (isLocal) {
        const coachData = getUserData(coachUsername);
        studentData = (coachData.localStudents || []).find((s: any) => s.id === activeStudentUsername);
    } else {
        studentData = getUserData(activeStudentUsername);
    }

    if (!studentData) return null;

    const plan: any = {
        student: studentData.step1,
        workout: { days: [] as any[], notes: '' },
        supplements: { items: [] as any[], notes: '' },
        nutritionPlan: null,
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

    // Gather nutrition data from the manual builder since it's now the primary editor
    const manualNutritionBuilder = document.getElementById('manual-nutrition-builder');
    if (manualNutritionBuilder && !manualNutritionBuilder.classList.contains('hidden')) {
        const meals: any[] = [];
        manualNutritionBuilder.querySelectorAll('.meal-card').forEach(card => {
            const mealName = (card as HTMLElement).dataset.mealName || '';
            const options = Array.from(card.querySelectorAll('.food-item-text')).map(span => span.textContent || '');
            if (options.length > 0) {
                meals.push({ mealName, options });
            }
        });

        const generalTips = (manualNutritionBuilder.querySelector('#manual-nutrition-tips') as HTMLTextAreaElement).value.split('\n').filter(Boolean);
        
        if(meals.length > 0) {
            // Reconstruct the plan object to match the AI's structure for consistency
            plan.nutritionPlan = {
                weeklyPlan: [{
                    dayName: "برنامه غذایی روزانه",
                    meals
                }],
                generalTips
            };
        }
    } else {
        // If AI was used but not edited, the object is already stored
        plan.nutritionPlan = currentNutritionPlanObject;
    }

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
                    <h4 class="font-bold mb-2 p-2 rounded-md" style="border-right: 4px solid ${dayColors[index % dayColors.length]}; background-color: ${hexToRgba(dayColors[index % dayColors.length], 0.1)};">${day.name}</h4>
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
            <h3 class="preview-section-header mt-6"><i data-lucide="utensils-crossed"></i> برنامه غذایی</h3>
            ${nutritionPlan.weeklyPlan.map((day: any) => `
                <div class="mb-4">
                    <h4 class="font-bold mb-2">${day.dayName}</h4>
                    ${day.meals.map((meal: any) => `
                        <div class="mb-2">
                            <strong>${meal.mealName}:</strong>
                            <ul class="list-disc pr-5 text-sm text-text-secondary">
                                ${meal.options.map((opt: string) => `<li>${opt}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
            ${nutritionPlan.generalTips && nutritionPlan.generalTips.length > 0 ? `
                <div class="preview-notes-pro mt-4">
                    <h4 class="font-semibold mb-2">نکات عمومی</h4>
                    <ul class="list-disc pr-4 text-sm">
                        ${nutritionPlan.generalTips.map((tip: string) => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
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

const renderStudentInfoForBuilder = (studentId: string, coachUsername: string) => {
    const selectionPrompt = document.getElementById('student-selection-prompt');
    const builderMain = document.getElementById('program-builder-main');
    const infoDisplay = document.getElementById('student-info-display');
    const builderStudentName = document.getElementById('builder-student-name');
    const aiDraftBtn = document.getElementById('ai-draft-btn') as HTMLButtonElement;

    if (!selectionPrompt || !builderMain || !infoDisplay || !builderStudentName || !aiDraftBtn) return;

    if (!studentId) {
        selectionPrompt.classList.remove('hidden');
        builderMain.classList.add('hidden');
        activeStudentUsername = null;
        aiDraftBtn.disabled = true;
        return;
    }
    
    selectionPrompt.classList.add('hidden');
    builderMain.classList.remove('hidden');
    builderMain.classList.add('animate-fade-in');

    activeStudentUsername = studentId;
    
    const isLocal = studentId.startsWith('local_');
    let studentData: any;
    if (isLocal) {
        const coachData = getUserData(coachUsername);
        studentData = (coachData.localStudents || []).find((s:any) => s.id === studentId);
    } else {
        studentData = getUserData(studentId);
    }

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
    let purchaseHtml = isLocal ? '' : `
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

    if(builderStudentName) builderStudentName.textContent = step1?.clientName || studentId;
    
    aiDraftBtn.disabled = false;
    window.lucide?.createIcons();
};

const resetProgramBuilder = () => {
    isEditingRecentProgram = false;
    changeStep(1);
    renderStudentInfoForBuilder('', ''); 

    const dayCards = document.querySelectorAll('#step-content-2 .day-card');
    dayCards.forEach(card => {
        const exercisesContainer = card.querySelector('.exercises-container');
        if (exercisesContainer) exercisesContainer.innerHTML = '';
    });

    const supplementsContainer = document.getElementById('added-supplements-container');
    if (supplementsContainer) {
        supplementsContainer.innerHTML = '<p id="supplement-placeholder" class="text-text-secondary text-center p-4">مکمل‌های انتخابی در اینجا نمایش داده می‌شوند.</p>';
    }
    const supCatBtn = document.getElementById('supplement-category-select-btn');
    const supNameBtn = document.getElementById('supplement-name-select-btn');
    if (supCatBtn) {
        supCatBtn.dataset.value = "";
        (supCatBtn.querySelector('span') as HTMLElement).textContent = "انتخاب دسته";
    }
    if (supNameBtn) {
        supNameBtn.dataset.value = "";
        (supNameBtn.querySelector('span') as HTMLElement).textContent = "مکمل را انتخاب کنید";
        (supNameBtn as HTMLButtonElement).disabled = true;
    }

    // Reset Nutrition section
    const nutritionChoiceAI = document.getElementById('nutrition-choice-ai') as HTMLInputElement;
    if (nutritionChoiceAI) nutritionChoiceAI.checked = true;
    
    const aiContainer = document.getElementById('ai-nutrition-container');
    const manualContainer = document.getElementById('manual-nutrition-builder');
    if (aiContainer) aiContainer.classList.remove('hidden');
    if (manualContainer) {
        manualContainer.classList.add('hidden');
        // Clear manual inputs
        manualContainer.querySelectorAll('input[type="text"]').forEach(input => (input as HTMLInputElement).value = '');
        manualContainer.querySelectorAll('.food-item-list').forEach(list => list.innerHTML = '');
        (manualContainer.querySelector('#manual-nutrition-tips') as HTMLTextAreaElement).value = '';
    }

    currentNutritionPlanObject = null;
    const nutritionDisplay = document.getElementById('nutrition-plan-display');
    if(nutritionDisplay) {
        nutritionDisplay.classList.add('hidden');
        nutritionDisplay.innerHTML = '';
    }


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
    const filterChipsContainer = modal.querySelector('#student-filter-chips') as HTMLElement;
    const sortSelect = modal.querySelector('#student-sort-select') as HTMLElement;

    titleEl.textContent = "انتخاب شاگرد";
    searchInput.value = '';
    
    // Show student-specific elements
    if (filterChipsContainer) filterChipsContainer.style.display = 'flex';
    if (sortSelect) sortSelect.style.display = 'block';

    // Reset filters and sort
    filterChipsContainer?.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    (filterChipsContainer?.querySelector('.filter-chip[data-filter="all"]') as HTMLElement)?.classList.add('active');
    (sortSelect as HTMLSelectElement).value = 'name';

    const allStudents = getCoachAllStudents(coachUsername);

    const renderOptions = () => {
        const filter = (filterChipsContainer?.querySelector('.filter-chip.active') as HTMLElement)?.dataset.filter || 'all';
        const sortBy = (sortSelect as HTMLSelectElement).value;
        const searchTerm = searchInput.value.toLowerCase();

        const studentDataWithDetails = allStudents.map((s: any) => {
            const userData = s.isLocal ? s : getUserData(s.username);
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
                if (s.isLocal) return false;
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
            const avatarUrl = studentData.profile?.avatar;
            
            const optionNode = optionTemplate.content.cloneNode(true) as DocumentFragment;
            const button = optionNode.querySelector('.student-option-btn') as HTMLButtonElement;
            button.dataset.username = s.id;
            
            const avatarContainer = button.querySelector('.student-avatar') as HTMLElement;
            if (avatarUrl) {
                avatarContainer.innerHTML = `<img src="${avatarUrl}" alt="${name}" class="w-full h-full object-cover rounded-full">`;
                avatarContainer.classList.remove('bg-accent');
                avatarContainer.textContent = '';
            } else {
                avatarContainer.innerHTML = '';
                avatarContainer.textContent = name.substring(0, 1).toUpperCase();
                avatarContainer.classList.add('bg-accent');
            }
            
            (button.querySelector('.student-name') as HTMLElement).textContent = name;
            const planStatusEl = button.querySelector('.student-plan-status') as HTMLElement;
             if (s.isLocal) {
                planStatusEl.innerHTML = `<span class="status-badge !bg-blue-500/20 !text-blue-500 !text-xs !py-0.5 !px-2">حضوری</span>`;
             } else if (latestPurchase) {
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

    // Hide student-specific elements for generic selection
    const studentFilters = modal.querySelector('#student-filter-chips') as HTMLElement;
    const studentSorter = modal.querySelector('#student-sort-select') as HTMLElement;
    if (studentFilters) studentFilters.style.display = 'none';
    if (studentSorter) studentSorter.style.display = 'none';

    const titleEl = modal.querySelector('.selection-modal-title') as HTMLElement;
    const optionsContainer = modal.querySelector('.selection-modal-options') as HTMLElement;
    const searchInput = modal.querySelector('.selection-modal-search') as HTMLInputElement;

    titleEl.textContent = title;
    searchInput.value = '';

    const renderOptions = (filter = '') => {
        const filteredOptions = options.filter(opt => opt.toLowerCase().includes(filter.toLowerCase()));
        const optionTemplate = document.getElementById('selection-modal-option-template') as HTMLTemplateElement;

        if (!optionTemplate) {
            optionsContainer.innerHTML = '<p>Template not found.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        filteredOptions.forEach(opt => {
            const optionNode = optionTemplate.content.cloneNode(true) as DocumentFragment;
            const button = optionNode.querySelector('.selection-option-btn') as HTMLButtonElement;
            if (button) {
                button.textContent = opt;
                button.dataset.value = opt;
                fragment.appendChild(button);
            }
        });
        optionsContainer.innerHTML = ''; // Clear existing
        optionsContainer.appendChild(fragment);
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
        if (student.isLocal) return false;
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
    const students = getCoachAllStudents(currentUser);
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
                    <div class="stat-card">
                        <div class="icon-container" style="--icon-bg: var(--${kpi.color});"><i data-lucide="${kpi.icon}" class="w-6 h-6 text-white"></i></div>
                        <div>
                            <p class="stat-value">${kpi.value}</p>
                            <p class="stat-label">${kpi.title}</p>
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
                        const avatarUrl = studentData.profile?.avatar;
                        const avatarHtml = avatarUrl
                            ? `<img src="${avatarUrl}" alt="${name}" class="w-10 h-10 rounded-full object-cover">`
                            : `<div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white" style="background-color: ${getColorForName(name)};">
                                ${name.substring(0, 1).toUpperCase()}
                               </div>`;

                        return `
                            <div class="flex justify-between items-center p-3 bg-bg-tertiary rounded-lg">
                                <div class="flex items-center gap-3">
                                    ${avatarHtml}
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
    const name = step1?.coachName || currentUser;
    const avatarUrl = profile?.avatar;
    const initials = (name || '?').charAt(0).toUpperCase();

    container.innerHTML = `
        <div class="card max-w-2xl mx-auto p-6">
            <h2 class="text-xl font-bold mb-6">پروفایل مربی</h2>
            <form id="coach-profile-form" class="space-y-6">
                 <div class="flex items-center gap-4">
                    <label for="coach-profile-avatar-input" class="profile-avatar-upload block">
                        ${avatarUrl ?
                            `<img id="coach-profile-avatar-preview" src="${avatarUrl}" alt="${name}" class="avatar-preview-img">` :
                            `<div id="coach-profile-avatar-initials" class="avatar-initials bg-accent text-bg-secondary flex items-center justify-center text-4xl font-bold">${initials}</div>`
                        }
                        <div class="upload-overlay"><i data-lucide="camera" class="w-8 h-8"></i></div>
                    </label>
                    <input type="file" id="coach-profile-avatar-input" class="hidden" accept="image/*">
                    <p class="text-sm text-text-secondary">برای نمایش بهتر در لیست مربیان، یک عکس پروفایل بارگذاری کنید.</p>
                </div>

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
                <button type="submit" class="primary-button w-full">ذخیره تغییرات</button>
            </form>
        </div>
    `;
};

const renderProgramBuilderTab = () => {
    const container = document.getElementById('program-builder-content');
    if (!container) return;
    const daysOfWeek = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
    const mealNames = ["صبحانه", "میان‌وعده صبح", "ناهار", "میان‌وعده عصر", "شام"];

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
                                    <p id="supplement-placeholder" class="text-text-secondary text-center p-4">مکمل‌های انتخابی در اینجا نمایش داده می‌شوند.</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg mb-4">برنامه غذایی</h3>
                            <div class="card p-4 space-y-4">
                                <div class="grid grid-cols-2 gap-2">
                                    <label class="option-card-label">
                                        <input type="radio" id="nutrition-choice-ai" name="nutrition_choice" value="ai" class="option-card-input" checked>
                                        <span class="option-card-content !py-2"><i data-lucide="sparkles" class="w-4 h-4 inline-block ml-1"></i> تولید با AI</span>
                                    </label>
                                    <label class="option-card-label">
                                        <input type="radio" id="nutrition-choice-manual" name="nutrition_choice" value="manual" class="option-card-input">
                                        <span class="option-card-content !py-2"><i data-lucide="pencil" class="w-4 h-4 inline-block ml-1"></i> طراحی دستی</span>
                                    </label>
                                </div>
                                <div id="ai-nutrition-container">
                                    <p class="text-text-secondary mb-4 text-sm">یک برنامه غذایی نمونه و هوشمند بر اساس اطلاعات و هدف شاگرد خود ایجاد کنید.</p>
                                    <button id="ai-nutrition-btn" class="primary-button w-full"><i data-lucide="sparkles" class="w-4 h-4 ml-2"></i>تولید برنامه غذایی با AI</button>
                                </div>
                                <div id="manual-nutrition-builder" class="hidden space-y-3">
                                    ${mealNames.map(meal => `
                                    <div class="meal-card card !shadow-none !border p-3" data-meal-name="${meal}">
                                        <p class="font-semibold text-md mb-2">${meal}</p>
                                        <ul class="food-item-list space-y-1 text-sm mb-2"></ul>
                                        <div class="flex items-center gap-2">
                                            <input type="text" class="input-field !text-sm flex-grow" placeholder="افزودن آیتم غذایی...">
                                            <button type="button" class="add-food-item-btn primary-button !p-2"><i data-lucide="plus" class="w-4 h-4"></i></button>
                                        </div>
                                    </div>
                                    `).join('')}
                                     <div class="input-group pt-2">
                                        <textarea id="manual-nutrition-tips" class="input-field w-full min-h-[80px]" placeholder=" "></textarea>
                                        <label for="manual-nutrition-tips" class="input-label">نکات عمومی تغذیه</label>
                                    </div>
                                </div>
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
                         <button id="finish-program-btn" class="green-button" style="display: none;">ثبت و ارسال برنامه</button>
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
    if (!studentListContainer) return;

    const students = getCoachAllStudents(currentUser).filter(s => !s.isLocal);

    if (students.length === 0) {
        studentListContainer.innerHTML = `<p class="p-4 text-center text-text-secondary">شما هنوز شاگرد آنلاینی ندارید.</p>`;
        return;
    }

    const template = document.getElementById('coach-chat-student-template') as HTMLTemplateElement;

    studentListContainer.innerHTML = students.map(student => {
        const studentData = getUserData(student.username);
        const name = studentData.step1?.clientName || student.username;
        const lastMessage = (studentData.chatHistory || []).slice(-1)[0];
        const avatarUrl = studentData.profile?.avatar;

        const clone = template.content.cloneNode(true) as DocumentFragment;
        const button = clone.querySelector('button')!;
        button.dataset.username = student.username;

        const avatarContainer = button.querySelector('.student-avatar')!;
        if (avatarUrl) {
            avatarContainer.innerHTML = `<img src="${avatarUrl}" alt="${name}" class="w-full h-full object-cover rounded-full">`;
        } else {
            avatarContainer.textContent = name.substring(0, 1).toUpperCase();
            avatarContainer.setAttribute('style', `background-color: ${getColorForName(name)}`);
        }
        
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

    const loadConversation = (studentUsername: string) => {
        const chatWindow = document.getElementById('coach-chat-window');
        if (!chatWindow) return;

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
            <div id="coach-chat-messages-container" class="p-4 flex-grow overflow-y-auto message-container flex flex-col">
                <div class="space-y-4"></div>
            </div>
            <div class="p-4 border-t border-border-primary">
                <div id="coach-quick-replies" class="flex items-center gap-2 mb-2 flex-wrap"></div>
                <form id="coach-chat-form-main" data-username="${studentUsername}" class="flex items-center gap-3">
                    <input id="coach-chat-input-main" type="text" class="input-field flex-grow" placeholder="پیام خود را بنویسید..." autocomplete="off">
                    <button type="submit" class="primary-button !p-3"><i data-lucide="send" class="w-5 h-5"></i></button>
                </form>
            </div>
        `;
        window.lucide?.createIcons();

        const renderMessages = () => {
            const messagesContainer = chatWindow.querySelector('#coach-chat-messages-container');
            const messagesInnerContainer = messagesContainer?.querySelector('div');
            if (!messagesContainer || !messagesInnerContainer) return;

            const currentData = getUserData(studentUsername);
            const chatHistory = (currentData.chatHistory || []);
            messagesInnerContainer.innerHTML = chatHistory.map((msg: any) => `
                <div class="flex ${msg.sender === 'coach' ? 'justify-end' : 'justify-start'}">
                    <div class="message-bubble ${msg.sender === 'coach' ? 'message-sent' : 'message-received'}">
                        <div class="message-content">${sanitizeHTML(msg.message)}</div>
                        <div class="message-timestamp">${timeAgo(msg.timestamp)}</div>
                    </div>
                </div>
            `).join('');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        };

        renderMessages();

        const quickRepliesContainer = chatWindow.querySelector('#coach-quick-replies');
        if (quickRepliesContainer) {
            const replies = ['برنامه شما در حال آماده سازی است.', 'چطور پیش میره؟', 'عالیه! ادامه بده.'];
            quickRepliesContainer.innerHTML = replies.map(reply => `<button class="quick-reply-btn secondary-button !text-xs !py-1 !px-3">${reply}</button>`).join('');
        }
    };

    studentListContainer.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const studentItem = target.closest<HTMLButtonElement>('.coach-chat-student-item');
        if (studentItem && studentItem.dataset.username) {
            loadConversation(studentItem.dataset.username);
        }
    });

    const chatWindow = document.getElementById('coach-chat-window');
    if (chatWindow && !chatWindow.dataset.listenersAttached) {
        chatWindow.dataset.listenersAttached = 'true';
        
        chatWindow.addEventListener('click', e => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('quick-reply-btn')) {
                const input = document.getElementById('coach-chat-input-main') as HTMLInputElement;
                if (input) {
                    input.value = target.textContent || '';
                    input.focus();
                }
            }
        });

        chatWindow.addEventListener('submit', e => {
            const form = e.target as HTMLElement;
            if (form.id === 'coach-chat-form-main') {
                e.preventDefault();
                const input = document.getElementById('coach-chat-input-main') as HTMLInputElement;
                const message = input.value.trim();
                const targetUsername = form.dataset.username;

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
                    
                    const messagesContainer = chatWindow.querySelector('#coach-chat-messages-container');
                    const messagesInnerContainer = messagesContainer?.querySelector('div');
                    if(messagesContainer && messagesInnerContainer){
                         messagesInnerContainer.innerHTML += `
                            <div class="flex justify-end">
                                <div class="message-bubble message-sent">
                                    <div class="message-content">${sanitizeHTML(message)}</div>
                                    <div class="message-timestamp">همین الان</div>
                                </div>
                            </div>
                         `;
                         messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }
                    
                    const studentListItem = studentListContainer.querySelector(`[data-username="${targetUsername}"]`);
                    if (studentListItem) {
                        (studentListItem.querySelector('.last-message-snippet') as HTMLElement).textContent = message;
                        (studentListItem.querySelector('.last-message-time') as HTMLElement).textContent = 'همین الان';
                    }
                }
            }
        });
    }

    if (students.length > 0) {
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
        const studentData = student.isLocal ? student : getUserData(student.username);
        const name = studentData.step1?.clientName || student.username;
        const goal = studentData.step1?.trainingGoal || 'بدون هدف';
        const latestPurchase = student.isLocal ? null : getLatestPurchase(studentData);
        const avatarUrl = studentData.profile?.avatar;

        const streak = calculateWorkoutStreak(studentData.workoutHistory);
        const weightChange = getWeightChange(studentData);
        const needsPlan = !student.isLocal && latestPurchase && latestPurchase.fulfilled === false;

        const trendIcon = weightChange.trend === 'up' ? 'trending-up' : 'trending-down';
        const trendColor = weightChange.trend === 'up' ? 'text-green-500' : 'text-red-500';

        const cardClasses = `student-card card p-6 flex flex-col gap-5 animate-fade-in ${
            needsPlan ? 'bg-accent/30 border-accent/50 needs-attention-highlight' : 'bg-bg-secondary'
        }`;
        
        let purchaseInfoHtml = ``;
        if (student.isLocal) {
            purchaseInfoHtml = `
                <div class="info-card !bg-blue-500/10 !border-dashed p-3 text-center">
                    <p class="text-sm text-blue-500 font-semibold">شاگرد حضوری</p>
                </div>`;
        } else if (latestPurchase) {
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
        } else {
            purchaseInfoHtml = `
            <div class="info-card !bg-bg-secondary !border-dashed p-3 text-center">
                 <p class="text-sm text-text-secondary">خریدی ثبت نشده است.</p>
            </div>`;
        }
        
        const avatarHtml = avatarUrl
            ? `<img src="${avatarUrl}" alt="${name}" class="w-14 h-14 rounded-full object-cover">`
            : `<div class="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xl text-white" style="background-color: ${getColorForName(name)};">${name.substring(0, 1).toUpperCase()}</div>`;


        return `
            <div class="${cardClasses}">
                <!-- Header -->
                <div class="flex items-start gap-4">
                    ${avatarHtml}
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
                    <button data-action="create-program" data-username="${student.id}" class="${needsPlan ? 'primary-button' : 'secondary-button'} !py-2.5 !px-4 !text-sm flex-grow">
                        <i data-lucide="${needsPlan ? 'plus-circle' : 'edit'}" class="w-4 h-4 mr-2"></i>
                        ${needsPlan ? 'ساخت برنامه' : 'ویرایش برنامه'}
                    </button>
                    <button data-action="view-student" data-username="${student.id}" class="secondary-button !py-2.5 !px-4 !text-sm"><i data-lucide="user" class="w-4 h-4 pointer-events-none"></i></button>
                </div>
            </div>
        `;
    }).join('');
    window.lucide?.createIcons();
};

export function initCoachDashboard(currentUser: string, handleLogout: () => void, handleGoToHome: () => void) {
    const mainContainer = document.getElementById('coach-dashboard-container');
    if (!mainContainer) return;
    
    const findSupplementInDB = (name: string) => {
        const supplementsDB = getSupplementsDB();
        for (const category in supplementsDB) {
            const supplement = supplementsDB[category].find(s => s.name === name);
            if (supplement) return supplement;
        }
        return null;
    };
    
    const openReplacementModalFor = (targetLi: HTMLLIElement) => {
        activeReplacementTarget = targetLi;
        const modal = document.getElementById('replacement-modal');
        const titleSpan = document.querySelector('#replacement-modal-title span');
        const body = document.getElementById('replacement-modal-body');
    
        if (!modal || !titleSpan || !body) return;
    
        const foodToReplace = targetLi.querySelector('.food-item-text')?.textContent?.trim();
        const mealName = targetLi.closest('.meal-card')?.getAttribute('data-meal-name');
    
        if (!foodToReplace || !mealName) {
            showToast('خطا در شناسایی آیتم غذایی.', 'error');
            return;
        }
    
        titleSpan.textContent = foodToReplace;
        body.innerHTML = `<div class="flex justify-center items-center h-full"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div> <p class="ml-2">در حال دریافت پیشنهاد از AI...</p></div>`;
        openModal(modal);
    
        if (!activeStudentUsername) {
            body.innerHTML = `<p class="text-text-secondary text-center">ابتدا یک شاگرد را انتخاب کنید.</p>`;
            return;
        }
    
        const isLocal = activeStudentUsername.startsWith('local_');
        let studentData: any;
        if (isLocal) {
            const coachData = getUserData(currentUser);
            studentData = (coachData.localStudents || []).find((s:any) => s.id === activeStudentUsername);
        } else {
            studentData = getUserData(activeStudentUsername);
        }
    
        if (!studentData?.step1) {
            body.innerHTML = `<p class="text-text-secondary text-center">اطلاعات شاگرد برای دریافت پیشنهاد کامل نیست.</p>`;
            return;
        }
    
        generateFoodReplacements(studentData.step1, mealName, foodToReplace)
            .then(suggestions => {
                if (suggestions && suggestions.length > 0) {
                    body.innerHTML = `
                        <p class="text-sm text-text-secondary mb-3">پیشنهادهای جایگزین:</p>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            ${suggestions.map(s => `<button class="suggestion-btn secondary-button">${s}</button>`).join('')}
                        </div>
                    `;
                } else {
                    body.innerHTML = `<p class="text-text-secondary text-center">پیشنهاد جایگزینی یافت نشد.</p>`;
                }
            })
            .catch(() => {
                body.innerHTML = `<p class="text-text-secondary text-center">خطا در ارتباط با هوش مصنوعی.</p>`;
            });
    };
    // Helper functions for AI features
    const addSupplementRow = (supData: any) => {
        const container = document.getElementById('added-supplements-container');
        const template = document.getElementById('supplement-row-template') as HTMLTemplateElement;
        if (!container || !template) return;

        const placeholder = container.querySelector('#supplement-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        const clone = template.content.cloneNode(true) as DocumentFragment;
        const newRow = clone.querySelector('.supplement-row') as HTMLElement;

        (newRow.querySelector('.supplement-name') as HTMLElement).textContent = supData.name;
        (newRow.querySelector('.supplement-note') as HTMLElement).textContent = supData.note;
        
        const dosageSelect = newRow.querySelector('.dosage-select') as HTMLSelectElement;
        const timingSelect = newRow.querySelector('.timing-select') as HTMLSelectElement;

        supData.dosageOptions.forEach((opt: string) => {
            const option = new Option(opt, opt);
            dosageSelect.add(option);
        });

        supData.timingOptions.forEach((opt: string) => {
            const option = new Option(opt, opt);
            timingSelect.add(option);
        });
        
        if (supData.selectedDosage && supData.dosageOptions.includes(supData.selectedDosage)) {
            dosageSelect.value = supData.selectedDosage;
        }
        if (supData.selectedTiming && supData.timingOptions.includes(supData.selectedTiming)) {
            timingSelect.value = supData.selectedTiming;
        }
        if (supData.notes) {
            (newRow.querySelector('.notes-input') as HTMLInputElement).value = supData.notes;
        }

        container.appendChild(newRow);
        window.lucide?.createIcons();
    };


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
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-bold text-lg">لیست شاگردان</h3>
                        <button id="add-local-client-btn" class="primary-button flex items-center gap-2"><i data-lucide="user-plus"></i>افزودن شاگرد حضوری</button>
                    </div>
                    <div id="all-students-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
                 `;
                const allStudents = getCoachAllStudents(currentUser);
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
    
    const loadProgramIntoBuilder = (programData: any, studentUsername: string) => {
        resetProgramBuilder();
        isEditingRecentProgram = true;
    
        const programTab = document.querySelector<HTMLElement>('.coach-nav-link[data-target="program-builder-content"]');
        if (programTab) switchTab(programTab);
        renderStudentInfoForBuilder(studentUsername, currentUser);
    
        changeStep(2);
    
        (programData.workout.days || []).forEach((day: any) => {
            const dayCard = Array.from(document.querySelectorAll('#step-content-2 .day-card')).find(card => (card.querySelector('summary span') as HTMLElement).textContent?.trim() === day.name.split(':')[0].trim());
            if (dayCard) {
                (dayCard.querySelector('summary span') as HTMLElement).textContent = day.name;
                day.exercises.forEach((ex: any) => addExerciseRow(dayCard.id, ex));
            }
        });
    
        (programData.supplements.items || []).forEach((sup: any) => {
            const dbEntry = findSupplementInDB(sup.name);
            if (dbEntry) {
                addSupplementRow({ ...dbEntry, selectedDosage: sup.dosage, selectedTiming: sup.timing, notes: sup.notes });
            }
        });
    
        if (programData.nutritionPlan) {
             const aiNutritionBtn = document.getElementById('ai-nutrition-btn') as HTMLButtonElement;
             if(aiNutritionBtn) aiNutritionBtn.click(); // This is a trick to trigger the rendering logic
             setTimeout(() => { // Wait for the click to process
                currentNutritionPlanObject = programData.nutritionPlan;
                // Manually trigger re-render of the nutrition plan in the UI based on `currentNutritionPlanObject`
                const display = document.getElementById('nutrition-plan-display');
                if(display) display.dispatchEvent(new CustomEvent('renderPlan'));
             }, 100);
        }
    
        (document.getElementById('coach-notes-final') as HTMLTextAreaElement).value = programData.workout.notes || '';
        showToast("برنامه قبلی برای ویرایش بارگذاری شد.", "success");
    };

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
                if (username) renderStudentInfoForBuilder(username, currentUser);
            } else if (action === 'view-student' && username) {
                openStudentProfileModal(username, currentUser);
            } else if (action === 'edit-recent-program' && username) {
                const studentData = getUserData(username);
                const latestProgram = studentData.programHistory[0];
                const programToLoad = {
                    workout: latestProgram.step2,
                    supplements: { items: latestProgram.supplements || [] },
                    nutritionPlan: latestProgram.nutritionPlan,
                    student: studentData.step1
                };
                loadProgramIntoBuilder(programToLoad, username);
                closeModal(document.getElementById('student-profile-modal'));
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
        
        const addSupplementBtn = target.closest('#add-supplement-btn');
        if (addSupplementBtn) {
            const card = addSupplementBtn.closest('.card');
            if (!card) {
                console.error('Could not find parent card for supplement controls.');
                return;
            }
            const nameSelectBtn = card.querySelector('.supplement-name-select-btn') as HTMLElement;
            const supplementName = nameSelectBtn?.dataset.value;

            if (!supplementName) {
                showToast('لطفا ابتدا یک مکمل را انتخاب کنید.', 'error');
                return;
            }

            const supplementData = findSupplementInDB(supplementName);

            if (supplementData) {
                addSupplementRow(supplementData);
                
                const catSelectBtn = card.querySelector('.supplement-category-select-btn') as HTMLElement;
                if(catSelectBtn) {
                    catSelectBtn.dataset.value = '';
                    catSelectBtn.querySelector('span')!.textContent = 'انتخاب دسته';
                }
                nameSelectBtn.dataset.value = '';
                nameSelectBtn.querySelector('span')!.textContent = 'انتخاب مکمل';
                (nameSelectBtn as HTMLButtonElement).disabled = true;

            } else {
                showToast('خطا: اطلاعات مکمل یافت نشد.', 'error');
            }
            return;
        }

        const removeSupplementBtn = target.closest('.remove-supplement-btn');
        if (removeSupplementBtn) {
            removeSupplementBtn.closest('.supplement-row')?.remove();
            const container = document.getElementById('added-supplements-container');
            if (container && !container.querySelector('.supplement-row')) {
                container.innerHTML = '<p id="supplement-placeholder" class="text-text-secondary text-center p-4">مکمل‌های انتخابی در اینجا نمایش داده می‌شوند.</p>';
            }
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
        
        // Program Builder: Select Student
        const selectStudentBuilderBtn = target.closest('#select-student-builder-btn');
        if (selectStudentBuilderBtn) {
            openStudentSelectionModal(selectStudentBuilderBtn as HTMLElement, currentUser);
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
            if (currentStep > 1) changeStep(currentStep - 1); // Fix: go to previous step
            return;
        }

        const finishBtn = target.closest<HTMLButtonElement>('#finish-program-btn');
        if (finishBtn) {
            if (!activeStudentUsername) {
                showToast("خطا: شاگردی انتخاب نشده است.", "error");
                return;
            }
        
            const planData = gatherPlanData();
            if (!planData || !planData.workout || planData.workout.days.every((d: any) => d.exercises.length === 0)) {
                showToast("برنامه تمرینی خالی است. لطفا حداقل یک حرکت اضافه کنید.", "error");
                return;
            }
        
            finishBtn.classList.add('is-loading');
            finishBtn.disabled = true;
        
            setTimeout(() => {
                const newProgram = {
                    date: new Date().toISOString(),
                    step2: { days: planData.workout.days, notes: planData.workout.notes },
                    supplements: planData.supplements.items,
                    nutritionPlan: planData.nutritionPlan
                };
        
                const isLocal = activeStudentUsername!.startsWith('local_');
                if (isLocal) {
                    const coachData = getUserData(currentUser);
                    const studentIndex = (coachData.localStudents || []).findIndex((s: any) => s.id === activeStudentUsername);
                    if (studentIndex > -1) {
                        if (!coachData.localStudents[studentIndex].programHistory) {
                            coachData.localStudents[studentIndex].programHistory = [];
                        }
                        coachData.localStudents[studentIndex].programHistory.unshift(newProgram);
                        saveUserData(currentUser, coachData);
                        showToast(`برنامه با موفقیت برای شاگرد حضوری ${planData.student.clientName} ذخیره شد.`, 'success');
                    }
                } else {
                    const studentData = getUserData(activeStudentUsername!);
                    if (!studentData.programHistory) studentData.programHistory = [];
                    if (isEditingRecentProgram) {
                        studentData.programHistory[0] = newProgram;
                    } else {
                        studentData.programHistory.unshift(newProgram);
                    }
        
                    const latestPurchase = getLatestPurchase(studentData);
                    if (latestPurchase && !latestPurchase.fulfilled) {
                        if (studentData.subscriptions && studentData.subscriptions.length > 0) {
                            const subIndex = studentData.subscriptions.findIndex((s: any) => s.purchaseDate === latestPurchase.purchaseDate);
                            if (subIndex > -1) studentData.subscriptions[subIndex].fulfilled = true;
                        }
                    }
        
                    if (!studentData.chatHistory) studentData.chatHistory = [];
                    studentData.chatHistory.push({
                        sender: 'coach',
                        message: 'سلام! برنامه جدید شما آماده است. می‌توانید از بخش "برنامه من" آن را مشاهده کنید.',
                        timestamp: new Date().toISOString()
                    });
        
                    saveUserData(activeStudentUsername!, studentData);
                    setNotification(activeStudentUsername!, 'program-content', '✨');
                    setNotification(activeStudentUsername!, 'chat-content', '💬');
                    showToast(`برنامه با موفقیت برای ${planData.student.clientName} ارسال شد.`, 'success');
                }
        
                finishBtn.classList.remove('is-loading');
                finishBtn.disabled = false;
                resetProgramBuilder();
                const studentsTab = document.querySelector<HTMLElement>('.coach-nav-link[data-target="students-content"]');
                if (studentsTab) switchTab(studentsTab);
            }, 500);
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
            return;
        }
        
        // AI Buttons
        const aiDraftBtn = target.closest<HTMLButtonElement>('#ai-draft-btn');
        if (aiDraftBtn) {
            if (!activeStudentUsername) {
                showToast('لطفا ابتدا یک شاگرد را انتخاب کنید.', 'error');
                return;
            }
             const isLocal = activeStudentUsername.startsWith('local_');
            let studentData: any;
            if (isLocal) {
                const coachData = getUserData(currentUser);
                studentData = (coachData.localStudents || []).find((s:any) => s.id === activeStudentUsername);
            } else {
                studentData = getUserData(activeStudentUsername);
            }

            if (!studentData.step1) {
                showToast('اطلاعات پروفایل این شاگرد کامل نیست.', 'error');
                return;
            }
            aiDraftBtn.classList.add('is-loading');
            aiDraftBtn.disabled = true;
            generateWorkoutPlan(studentData.step1)
                .then(planData => { if (planData) { populateBuilderWithAI(planData); } })
                .catch(error => { console.error("AI Draft Error:", error); showToast("خطا در ارتباط با هوش مصنوعی.", 'error'); })
                .finally(() => { aiDraftBtn.classList.remove('is-loading'); aiDraftBtn.disabled = false; });
            return;
        }

        const aiSupplementBtn = target.closest<HTMLButtonElement>('#ai-supplement-btn');
        if (aiSupplementBtn) {
            if (!activeStudentUsername) {
                showToast('لطفا ابتدا یک شاگرد را انتخاب کنید.', 'error');
                return;
            }
            const isLocal = activeStudentUsername.startsWith('local_');
            let studentStep1: any;
            if (isLocal) {
                const coachData = getUserData(currentUser);
                const localStudent = (coachData.localStudents || []).find((s:any) => s.id === activeStudentUsername);
                studentStep1 = localStudent?.step1;
            } else {
                studentStep1 = getUserData(activeStudentUsername).step1;
            }
            
            const goal = studentStep1?.trainingGoal;
            if (!studentStep1 || !goal) {
                showToast('هدف تمرینی شاگرد برای پیشنهاد مکمل مشخص نیست.', 'error');
                return;
            }
            aiSupplementBtn.classList.add('is-loading');
            aiSupplementBtn.disabled = true;
            generateSupplementPlan(studentStep1, goal)
                .then(supplements => {
                    if (supplements) {
                        const container = document.getElementById('added-supplements-container');
                        const placeholder = container?.querySelector('p');
                        if (placeholder) placeholder.remove();

                        supplements.forEach(sup => {
                            const dbEntry = findSupplementInDB(sup.name);
                            if (dbEntry) {
                                addSupplementRow({ ...dbEntry, selectedDosage: sup.dosage, selectedTiming: sup.timing });
                            }
                        });
                        showToast('پیشنهاد مکمل با موفقیت به لیست اضافه شد.', 'success');
                    }
                })
                .finally(() => { aiSupplementBtn.classList.remove('is-loading'); aiSupplementBtn.disabled = false; });
            return;
        }

        const aiNutritionBtn = target.closest<HTMLButtonElement>('#ai-nutrition-btn');
        if (aiNutritionBtn) {
            if (!activeStudentUsername) {
                showToast('لطفا ابتدا یک شاگرد را انتخاب کنید.', 'error');
                return;
            }
            const isLocal = activeStudentUsername.startsWith('local_');
            let userData: any;
            if (isLocal) {
                 const coachData = getUserData(currentUser);
                 userData = (coachData.localStudents || []).find((s:any) => s.id === activeStudentUsername);
            } else {
                 userData = getUserData(activeStudentUsername);
            }
             if (!userData.step1 || !userData.step1.tdee) {
                showToast('اطلاعات شاگرد (مخصوصا TDEE) برای تولید برنامه غذایی کامل نیست.', 'error');
                return;
            }
            aiNutritionBtn.classList.add('is-loading');
            aiNutritionBtn.disabled = true;
            generateNutritionPlan(userData)
                .then(plan => {
                    if (plan) {
                        currentNutritionPlanObject = plan;
                        // Instead of showing a static preview, populate the manual builder
                        const manualBuilder = document.getElementById('manual-nutrition-builder');
                        const aiContainer = document.getElementById('ai-nutrition-container');
                        const manualRadio = document.getElementById('nutrition-choice-manual') as HTMLInputElement;

                        if (manualBuilder && aiContainer && manualRadio) {
                            // Clear previous manual entries
                            manualBuilder.querySelectorAll('.food-item-list').forEach(list => list.innerHTML = '');

                            // Populate with AI data
                            (plan.weeklyPlan[0].meals || []).forEach((meal: any) => {
                                const mealCard = manualBuilder.querySelector(`.meal-card[data-meal-name="${meal.mealName}"]`);
                                const list = mealCard?.querySelector('.food-item-list');
                                if (list) {
                                    (meal.options || []).forEach((opt: string) => {
                                        const li = document.createElement('li');
                                        li.className = 'flex justify-between items-center bg-bg-secondary p-1.5 rounded';
                                        li.innerHTML = `
                                            <span class="food-item-text">${sanitizeHTML(opt)}</span>
                                            <button type="button" class="replace-food-item-btn text-blue-500/70 hover:text-blue-500" title="ویرایش/جایگزینی"><i data-lucide="refresh-cw" class="w-4 h-4 pointer-events-none"></i></button>
                                        `;
                                        list.appendChild(li);
                                    });
                                }
                            });
                            (manualBuilder.querySelector('#manual-nutrition-tips') as HTMLTextAreaElement).value = (plan.generalTips || []).join('\n');
                            
                            // Switch view to manual builder
                            aiContainer.classList.add('hidden');
                            manualBuilder.classList.remove('hidden');
                            manualRadio.checked = true;
                            window.lucide.createIcons();
                        }
                        showToast('برنامه غذایی با موفقیت ایجاد و آماده ویرایش است.', 'success');
                    }
                })
                .finally(() => { aiNutritionBtn.classList.remove('is-loading'); aiNutritionBtn.disabled = false; });
            return;
        }

        const savePdfBtnBuilder = target.closest('#save-program-pdf-btn-builder');
        if (savePdfBtnBuilder) {
            exportElement('#program-preview-for-export', 'pdf', 'FitGymPro-Program.pdf', savePdfBtnBuilder as HTMLButtonElement);
            return;
        }

        const saveImgBtnBuilder = target.closest('#save-program-img-btn-builder');
        if (saveImgBtnBuilder) {
            exportElement('#program-preview-for-export', 'png', 'FitGymPro-Program.png', saveImgBtnBuilder as HTMLButtonElement);
            return;
        }

        if (target.closest('#add-local-client-btn')) {
            const modal = document.getElementById('local-client-modal');
            const form = document.getElementById('local-client-form') as HTMLFormElement;
            form.reset();
            form.removeAttribute('data-editing-id');
            (modal.querySelector('#local-client-modal-title') as HTMLElement).textContent = 'افزودن شاگرد حضوری';
            openModal(modal);
        }

        const nutritionChoice = target.closest('input[name="nutrition_choice"]');
        if (nutritionChoice) {
            const choice = (nutritionChoice as HTMLInputElement).value;
            const aiContainer = document.getElementById('ai-nutrition-container');
            const manualContainer = document.getElementById('manual-nutrition-builder');
            if (aiContainer && manualContainer) {
                aiContainer.classList.toggle('hidden', choice !== 'ai');
                manualContainer.classList.toggle('hidden', choice !== 'manual');
            }
            return;
        }

        const addFoodItemBtn = target.closest('.add-food-item-btn');
        if (addFoodItemBtn) {
            const input = addFoodItemBtn.previousElementSibling as HTMLInputElement;
            const foodText = input.value.trim();
            if (foodText) {
                const list = addFoodItemBtn.closest('.meal-card')?.querySelector('.food-item-list');
                if (list) {
                    const li = document.createElement('li');
                    li.className = 'flex justify-between items-center bg-bg-secondary p-1.5 rounded';
                    li.innerHTML = `
                        <span class="food-item-text">${sanitizeHTML(foodText)}</span>
                        <button type="button" class="replace-food-item-btn text-blue-500/70 hover:text-blue-500" title="ویرایش/جایگزینی"><i data-lucide="refresh-cw" class="w-4 h-4 pointer-events-none"></i></button>
                    `;
                    list.appendChild(li);
                    input.value = '';
                    window.lucide.createIcons();
                }
            }
            return;
        }

        const replaceFoodItemBtn = target.closest('.replace-food-item-btn');
        if (replaceFoodItemBtn) {
            const targetLi = replaceFoodItemBtn.closest('li');
            if(targetLi) {
                openReplacementModalFor(targetLi as HTMLLIElement);
            }
            return;
        }

    });

    const selectionModal = document.getElementById('selection-modal');
    selectionModal?.addEventListener('click', e => {
        if (!(e.target instanceof HTMLElement)) return;
        const target = e.target;
        
        const studentOptionBtn = target.closest('.student-option-btn');
        if (studentOptionBtn) {
            const username = (studentOptionBtn as HTMLElement).dataset.username;
            if (username) {
                renderStudentInfoForBuilder(username, currentUser);
                closeModal(selectionModal);
                changeStep(2);
            }
            return;
        }

        const selectionOptionBtn = target.closest('.selection-option-btn');
        if (selectionOptionBtn && currentSelectionTarget) {
            const value = (selectionOptionBtn as HTMLElement).dataset.value;
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
            closeModal(selectionModal);
            currentSelectionTarget = null;
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

            const avatarPreview = document.getElementById('coach-profile-avatar-preview') as HTMLImageElement;
            if (avatarPreview && avatarPreview.dataset.isNew === 'true' && avatarPreview.src.startsWith('data:image/')) {
                freshData.profile.avatar = avatarPreview.src;
            }

            saveUserData(currentUser, freshData);
            showToast('پروفایل با موفقیت ذخیره شد.', 'success');
            const name = freshData.step1.coachName || currentUser;
            const headerNameEl = mainContainer.querySelector('.flex.items-center.gap-3.bg-bg-secondary .font-bold.text-sm');
            if (headerNameEl) headerNameEl.textContent = name;
        }
         if (e.target && (e.target as HTMLElement).id === 'local-client-form') {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const clientData: any = {
                clientName: formData.get('clientName') as string,
                age: parseInt(formData.get('age') as string, 10),
                height: parseInt(formData.get('height') as string, 10),
                weight: parseFloat(formData.get('weight') as string),
                gender: formData.get('gender') as string,
                contact: formData.get('contact') as string,
                trainingGoal: formData.get('trainingGoal') as string,
                trainingDays: parseInt(formData.get('trainingDays') as string, 10),
                activityLevel: parseFloat(formData.get('activityLevel') as string),
                experienceLevel: formData.get('experienceLevel') as string,
                limitations: formData.get('limitations') as string,
                coachNotes: formData.get('coachNotes') as string,
            };

            if (!clientData.clientName) {
                showToast('نام شاگرد الزامی است.', 'error');
                return;
            }

            const metrics = performMetricCalculations(clientData);
            if (metrics && metrics.tdee) {
                clientData.tdee = metrics.tdee;
            }

            const coachData = getUserData(currentUser);
            if (!coachData.localStudents) coachData.localStudents = [];
            
            const newClient = { id: `local_${Date.now()}`, joinDate: new Date().toISOString(), step1: clientData };
            coachData.localStudents.push(newClient);
            saveUserData(currentUser, coachData);
            
            showToast(`شاگرد حضوری "${clientData.clientName}" با موفقیت اضافه شد.`, 'success');
            closeModal(document.getElementById('local-client-modal'));
            
            const studentsTab = document.querySelector<HTMLElement>('.coach-nav-link[data-target="students-content"]');
            if(studentsTab) switchTab(studentsTab);
        }
    });

    const replacementModal = document.getElementById('replacement-modal');
    if (replacementModal && !replacementModal.dataset.listenerAttached) {
        replacementModal.dataset.listenerAttached = 'true';
        replacementModal.addEventListener('click', e => {
            const target = e.target as HTMLElement;
            const suggestionBtn = target.closest('.suggestion-btn');
            const justDeleteBtn = target.closest('#just-delete-btn');

            if (suggestionBtn && activeReplacementTarget) {
                const newText = suggestionBtn.textContent || '';
                const span = activeReplacementTarget.querySelector('.food-item-text');
                if (span) span.textContent = newText;
                closeModal(replacementModal);
                activeReplacementTarget = null;
            } else if (justDeleteBtn && activeReplacementTarget) {
                activeReplacementTarget.remove();
                closeModal(replacementModal);
                activeReplacementTarget = null;
            }
        });
    }

    const coachProfileForm = document.getElementById('coach-profile-form');
    if (coachProfileForm) {
        const avatarInput = document.getElementById('coach-profile-avatar-input');
        if(avatarInput) {
            avatarInput.addEventListener('change', e => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = () => {
                    const base64String = reader.result as string;
                    const wrapper = document.querySelector('.profile-avatar-upload');
                    if (wrapper) {
                        const initialsDiv = document.getElementById('coach-profile-avatar-initials');
                        if (initialsDiv) initialsDiv.style.display = 'none';

                        let previewImg = document.getElementById('coach-profile-avatar-preview') as HTMLImageElement;
                        if (!previewImg) {
                            previewImg = document.createElement('img');
                            previewImg.id = 'coach-profile-avatar-preview';
                            previewImg.alt = "Avatar Preview";
                            previewImg.className = 'avatar-preview-img';
                            wrapper.insertBefore(previewImg, wrapper.firstChild);
                        }
                        previewImg.src = base64String;
                        previewImg.dataset.isNew = 'true';
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    }
}