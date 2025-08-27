import { getTemplates, saveTemplate, deleteTemplate, getUsers, getUserData, saveUserData, getNotifications, setNotification, clearNotification, getExercisesDB, getSupplementsDB } from '../services/storage';
import { showToast, updateSliderTrack, openModal, closeModal, exportElement } from '../utils/dom';
import { getLatestPurchase, timeAgo, getLastActivity } from '../utils/helpers';
import { generateWorkoutPlan, generateSupplementPlan } from '../services/gemini';
import { calculateWorkoutStreak } from '../utils/calculations';

let currentStep = 1;
const totalSteps = 4;
let activeStudentUsername: string | null = null;
let studentModalChartInstance: any = null;
let currentSelectionTarget: HTMLElement | null = null;
let exerciseToMuscleGroupMap: Record<string, string> = {};

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

    let programHtml = programData.step2.days.map((day: any) => {
        const hasExercises = day.exercises && day.exercises.length > 0;
        return `
        <details class="day-card card !shadow-none !border mb-2">
            <summary class="font-bold cursor-pointer flex justify-between items-center p-3">
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
                <button class="primary-button w-full mt-4 !text-sm">ارسال برنامه جدید</button>
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
    const messagesContainer = chatContent?.querySelector('#coach-chat-messages-container') as HTMLElement;
    const chatForm = chatContent?.querySelector('#coach-chat-form') as HTMLFormElement;
    const chatInput = chatContent?.querySelector('#coach-chat-input') as HTMLInputElement;

    const renderChat = () => {
        const chatUserData = getUserData(username);
        const chatHistory = chatUserData.chatHistory || [];
        messagesContainer.innerHTML = chatHistory.map((msg: any) => `
            <div class="message ${msg.sender === 'coach' ? 'coach-message' : 'user-message'}">${msg.message}</div>
        `).join('');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
        supplements: { items: [] as any[], notes: '' }
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

    const { student, workout, supplements } = planData;
    const metrics = calculateMetricsFromData(student);
    
    previewContainer.innerHTML = `
        <div class="p-4">
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
            ${workout.days.filter((d: any) => d.exercises.length > 0).map((day: any) => `
                <div>
                    <h4 class="font-bold mb-2">${day.name}</h4>
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
            <h3 class="preview-section-header mt-6"><i data-lucide="pilcrow"></i> برنامه مکمل</h3>
            <table class="preview-table-pro">
                <thead><tr><th>مکمل</th><th>دوز</th><th>زمان</th><th>یادداشت</th></tr></thead>
                <tbody>
                    ${supplements.items.map((sup: any) => `<tr><td>${sup.name}</td><td>${sup.dosage}</td><td>${sup.timing}</td><td>${sup.notes || '-'}</td></tr>`).join('')}
                </tbody>
            </table>
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

        const cardClasses = `student-card card p-6 flex flex-col gap-5 animate-fade-in transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
            needsPlan ? 'bg-accent/5 border-accent/40' : 'bg-bg-secondary'
        }`;
        
        // --- Purchase Info HTML ---
        let purchaseInfoHtml = `
            <div class="info-card !bg-bg-secondary !border-dashed p-3 text-center">
                 <p class="text-sm text-text-secondary">خریدی ثبت نشده است.</p>
            </div>
        `;
        if (latestPurchase) {
             purchaseInfoHtml = `
                <div class="info-card p-3">
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

const getLastActivityDate = (userData: any): string => {
    const workoutDates = (userData.workoutHistory || []).map((h: any) => new Date(h.date).getTime());
    const weightDates = (userData.weightHistory || []).map((h: any) => new Date(h.date).getTime());
    const allDates = [...workoutDates, ...weightDates];
    if (allDates.length === 0) {
        return userData.joinDate || new Date(0).toISOString();
    }
    const lastTimestamp = Math.max(...allDates);
    return new Date(lastTimestamp).toISOString();
};


export function initCoachDashboard(currentUser: string, handleLogout: () => void, handleGoToHome: () => void) {
    const mainContainer = document.getElementById('coach-dashboard-container');
    if (!mainContainer) return;

    buildExerciseMap();

    // --- Tab Switching Logic ---
    const pageTitles: Record<string, {title: string, subtitle: string}> = {
        'students-content': { title: 'شاگردان', subtitle: 'نمای کلی شاگردان و نیازمندی‌ها.' },
        'builder-content': { title: 'ساخت برنامه جدید', subtitle: 'برنامه تمرینی و مکمل را برای شاگردان طراحی کنید.' },
        'templates-content': { title: 'الگوها', subtitle: 'الگوهای برنامه خود را برای استفاده مجدد مدیریت کنید.' },
        'profile-content': { title: 'پروفایل مربی', subtitle: 'اطلاعات حرفه‌ای خود را ویرایش کنید.' }
    };

    const switchTab = (activeTab: Element) => {
        const targetId = activeTab.getAttribute('data-target');
        if (!targetId) return;

        mainContainer.querySelectorAll('.coach-nav-link').forEach(t => t.classList.remove('active-nav-link'));
        activeTab.classList.add('active-nav-link');
        // Fix: Use classList.toggle instead of toggle
        mainContainer.querySelectorAll('.coach-tab-content').forEach(content => content.classList.toggle('hidden', content.id !== targetId));
        
        const targetData = pageTitles[targetId];
        const titleEl = document.getElementById('coach-page-title');
        const subtitleEl = document.getElementById('coach-page-subtitle');
        if (titleEl && subtitleEl && targetData) {
            titleEl.textContent = targetData.title;
            subtitleEl.textContent = targetData.subtitle;
        }

        clearNotification(currentUser, targetId);
        updateCoachNotifications(currentUser);

        if (targetId === 'templates-content') renderTemplatesTab();
        if (targetId === 'students-content') {
            const myStudents = getCoachStudents(currentUser);
            const studentsNeedingAttention = getStudentsNeedingAttention(myStudents);
            renderStudentCards(studentsNeedingAttention, 'needs-attention-grid');
            renderStudentCards(myStudents, 'all-students-grid');
        }
    };

    // --- Student Tab Initial Render ---
    const myStudents = getCoachStudents(currentUser);
    const studentsNeedingAttention = getStudentsNeedingAttention(myStudents);
    renderStudentCards(studentsNeedingAttention, 'needs-attention-grid');
    renderStudentCards(myStudents, 'all-students-grid');
    updateCoachNotifications(currentUser);


    document.getElementById('student-search-input')?.addEventListener('input', e => {
        const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
        const filteredStudents = myStudents.filter(s => {
            const studentData = getUserData(s.username);
            const name = studentData.step1?.clientName || s.username;
            return name.toLowerCase().includes(searchTerm);
        });
        renderStudentCards(filteredStudents, 'all-students-grid');
    });

    // --- Initial Tab Setup ---
    (document.querySelector('.coach-nav-link[data-target="students-content"]') as HTMLElement)?.classList.add('active-nav-link');
    (document.getElementById('students-content') as HTMLElement)?.classList.remove('hidden');

    // --- Main Event Delegation for the entire dashboard ---
    mainContainer.addEventListener('click', async e => {
        if (!(e.target instanceof HTMLElement)) return;
        const target = e.target;

        // --- Handle Sidebar Navigation, Logout, and Theme Toggle ---
        const navLink = target.closest('.coach-nav-link');
        if (navLink) {
            switchTab(navLink);
            return;
        }
        if (target.closest('#logout-btn')) {
            handleLogout();
            return;
        }
        if (target.closest('#go-to-home-btn')) {
            handleGoToHome();
            return;
        }

        // --- Universal Button Logic ---
        const button = target.closest('button');
        if (!button) return;
        
        const action = button.dataset.action;
        const username = button.dataset.username;

        if (action === "view-student" && username) {
            openStudentProfileModal(username);
        }

        if (action === "create-program" && username) {
            const builderTab = document.querySelector('.coach-nav-link[data-target="builder-content"]');
            if (builderTab) switchTab(builderTab);
            resetProgramBuilder();
            renderStudentInfoForBuilder(username);
        }

        if (button.id === 'ai-draft-btn') {
            if (!activeStudentUsername) {
                showToast("لطفا ابتدا یک شاگرد را انتخاب کنید.", "error");
                return;
            }
            const studentData = getUserData(activeStudentUsername);
            if (!studentData.step1) {
                showToast("اطلاعات پروفایل این شاگرد کامل نیست.", "error");
                return;
            }
            button.classList.add('is-loading');
            button.disabled = true;
            const aiPlan = await generateWorkoutPlan(studentData.step1);
            if (aiPlan) {
                changeStep(2);
                populateBuilderWithAI(aiPlan);
            }
            button.classList.remove('is-loading');
            button.disabled = false;
        }

        if (button.id === 'ai-suggest-supplements-btn') {
            if (!activeStudentUsername) {
                showToast("لطفا ابتدا یک شاگرد را انتخاب کنید.", "error");
                return;
            }
            const studentData = getUserData(activeStudentUsername);
            if (!studentData.step1) {
                showToast("اطلاعات پروفایل این شاگرد کامل نیست.", "error");
                return;
            }
            const goal = (document.getElementById('ai-supplement-goal') as HTMLSelectElement).value;
    
            button.classList.add('is-loading');
            button.disabled = true;
    
            const suggestions = await generateSupplementPlan(studentData.step1, goal);
    
            if (suggestions) {
                const container = document.getElementById('added-supplements-container');
                if (container) {
                     const placeholder = container.querySelector('p');
                     if(placeholder) placeholder.remove();
                }
    
                suggestions.forEach(sup => {
                    const supplementsDB = getSupplementsDB();
                    let category = '';
                    let fullSupData: any = null;
    
                    for (const cat in supplementsDB) {
                        const found = supplementsDB[cat].find(s => s.name === sup.name);
                        if (found) {
                            category = cat;
                            fullSupData = found;
                            break;
                        }
                    }
                    if (!fullSupData) {
                        console.warn(`AI suggested supplement "${sup.name}" not found in DB.`);
                        return;
                    }
    
                    const iconMap: Record<string, string> = { "عضله‌ساز و ریکاوری": "dumbbell", "افزایش‌دهنده عملکرد و انرژی": "zap", "مدیریت وزن و چربی‌سوزی": "flame", "سلامت عمومی و مفاصل": "heart-pulse" };
                    const iconName = iconMap[category] || 'package';
    
                    const template = document.getElementById('supplement-row-template') as HTMLTemplateElement;
                    const clone = template.content.cloneNode(true) as DocumentFragment;
                    (clone.querySelector('.supplement-name') as HTMLElement).textContent = fullSupData.name;
                    (clone.querySelector('.supplement-note') as HTMLElement).textContent = fullSupData.note;
                    (clone.querySelector('.supplement-icon-container i') as HTMLElement).setAttribute('data-lucide', iconName);
    
                    const dosageSelect = clone.querySelector('.dosage-select') as HTMLSelectElement;
                    fullSupData.dosageOptions.forEach((d: string) => dosageSelect.add(new Option(d, d)));
                    if (fullSupData.dosageOptions.includes(sup.dosage)) {
                        dosageSelect.value = sup.dosage;
                    }
    
                    const timingSelect = clone.querySelector('.timing-select') as HTMLSelectElement;
                    fullSupData.timingOptions.forEach((t: string) => timingSelect.add(new Option(t, t)));
                    if (fullSupData.timingOptions.includes(sup.timing)) {
                        timingSelect.value = sup.timing;
                    }
    
                    container?.appendChild(clone);
                });
                window.lucide?.createIcons();
                showToast('مکمل‌های پیشنهادی اضافه شدند.', 'success');
            }
    
            button.classList.remove('is-loading');
            button.disabled = false;
        }

        if (button.id === 'export-program-pdf-btn') {
            renderProgramPreview();
            setTimeout(() => exportElement('#program-preview-for-export', 'pdf', 'برنامه-تمرینی.pdf', button), 100);
        }
        
        if (button.id === 'export-program-img-btn') {
            renderProgramPreview();
            setTimeout(() => exportElement('#program-preview-for-export', 'png', 'برنامه-تمرینی.png', button), 100);
        }

        if (button.id === 'finish-program-btn') {
            const finalPlanData = gatherPlanData();
            if (!finalPlanData || !activeStudentUsername) {
                showToast('خطا: شاگرد یا اطلاعات برنامه موجود نیست.', 'error');
                return;
            }
            
            const studentUserData = getUserData(activeStudentUsername);
            
            studentUserData.step2 = {
                days: finalPlanData.workout.days,
                notes: finalPlanData.workout.notes
            };
            studentUserData.supplements = finalPlanData.supplements.items;

            if (!studentUserData.programHistory) {
                studentUserData.programHistory = [];
            }
            studentUserData.programHistory.unshift({
                date: new Date().toISOString(),
                step2: studentUserData.step2,
                supplements: studentUserData.supplements
            });

            const latestPurchase = getLatestPurchase(studentUserData);
            if (latestPurchase && !latestPurchase.fulfilled) {
                const subIndex = studentUserData.subscriptions.findIndex((s:any) => s.purchaseDate === latestPurchase.purchaseDate);
                if(subIndex > -1) studentUserData.subscriptions[subIndex].fulfilled = true;
            }
            
            saveUserData(activeStudentUsername, studentUserData);
            setNotification(activeStudentUsername, 'program-content', '✨');

            button.classList.add('is-loading');
            setTimeout(() => {
                button.classList.remove('is-loading');
                showToast(`برنامه با موفقیت برای ${activeStudentUsername} ارسال شد.`, 'success');
                resetProgramBuilder();
                const studentTab = document.querySelector('.coach-nav-link[data-target="students-content"]')
                if (studentTab) switchTab(studentTab);
            }, 1000);
        }
    });

    const studentModal = document.getElementById('student-profile-modal');
    studentModal?.addEventListener('click', e => {
        if ((e.target as HTMLElement).id === 'student-profile-modal') closeModal(studentModal);
    });
    document.getElementById('close-student-modal-btn')?.addEventListener('click', () => {
        if (studentModalChartInstance) {
            studentModalChartInstance.destroy();
            studentModalChartInstance = null;
        }
        closeModal(studentModal);
        activeStudentUsername = null;
    });

    // --- Program Builder Logic ---
    const builderContentTab = document.getElementById('builder-content');
    if (builderContentTab) {
        changeStep(1); 

        builderContentTab.addEventListener('click', e => {
            if (!(e.target instanceof HTMLElement)) return;
            const target = e.target;
            const button = target.closest('button');
            const exerciseDB = getExercisesDB();
            const supplementsDB = getSupplementsDB();
            if (!button) return;
            
            if (button.id === 'student-select-btn') {
                openStudentSelectionModal(button, currentUser);
            }

            if (button.classList.contains('selection-button')) {
                const type = button.dataset.type;
                switch (type) {
                    case 'muscle-group':
                        openSelectionModal(Object.keys(exerciseDB), "انتخاب گروه عضلانی", button);
                        break;
                    case 'exercise':
                        const muscleGroup = (button.closest('.exercise-row')?.querySelector('.muscle-group-select') as HTMLElement).dataset.value;
                        if (muscleGroup && exerciseDB[muscleGroup]) {
                            openSelectionModal(exerciseDB[muscleGroup], "انتخاب حرکت", button);
                        } else {
                            showToast('ابتدا گروه عضلانی را انتخاب کنید', 'error');
                        }
                        break;
                    case 'supplement-category':
                        openSelectionModal(Object.keys(supplementsDB), "انتخاب دسته مکمل", button);
                        break;
                    case 'supplement-name':
                        const category = (document.getElementById('supplement-category-select-btn') as HTMLElement).dataset.value;
                         if (category && supplementsDB[category]) {
                            const supNames = supplementsDB[category].map(s => s.name);
                            openSelectionModal(supNames, "انتخاب مکمل", button);
                        } else {
                            showToast('ابتدا دسته مکمل را انتخاب کنید', 'error');
                        }
                        break;
                }
            }


            const stepperItem = button.closest('.stepper-item');
            if (stepperItem) {
                const step = parseInt(stepperItem.getAttribute('data-step')!, 10);
                if (step > 1 && !activeStudentUsername) {
                    showToast("لطفاً ابتدا یک شاگرد را انتخاب کنید.", "error");
                    return;
                }
                if (!isNaN(step)) changeStep(step);
            }
            if (button.id === 'next-step-btn') {
                 if (currentStep === 1 && !activeStudentUsername) {
                    showToast("لطفاً ابتدا یک شاگرد را انتخاب کنید.", "error");
                    return;
                }
                if (currentStep < totalSteps) changeStep(currentStep + 1);
            }
            if (button.id === 'prev-step-btn' && currentStep > 1) changeStep(currentStep - 1);
            
            if (button.id === 'change-student-btn') {
                resetProgramBuilder();
                showToast("شاگرد جدیدی را انتخاب کنید.", "success");
            }

            if (button.classList.contains('add-exercise-btn')) {
                const dayCard = button.closest('.day-card');
                if (dayCard) addExerciseRow(dayCard.id);
            }
            if (button.classList.contains('remove-exercise-btn')) {
                 button.closest('.exercise-row')?.remove();
                 calculateAndDisplayVolume();
            }
            if (button.classList.contains('superset-btn')) {
                button.classList.toggle('active');
                button.closest('.exercise-row')?.classList.toggle('is-superset');
            }
            if (button.id === 'save-as-template-btn') saveCurrentPlanAsTemplate();

            if (button.id === 'add-supplement-btn') {
                const name = (document.getElementById('supplement-name-select-btn') as HTMLElement).dataset.value;
                if (!name) return;
                const category = (document.getElementById('supplement-category-select-btn') as HTMLElement).dataset.value;
                if (!category) return;
                const supData = supplementsDB[category]?.find(s => s.name === name);
                if (!supData) return;
                
                const iconMap: Record<string, string> = { "عضله‌ساز و ریکاوری": "dumbbell", "افزایش‌دهنده عملکرد و انرژی": "zap", "مدیریت وزن و چربی‌سوزی": "flame", "سلامت عمومی و مفاصل": "heart-pulse" };
                const iconName = iconMap[category] || 'package';
                
                const template = document.getElementById('supplement-row-template') as HTMLTemplateElement;
                const clone = template.content.cloneNode(true) as DocumentFragment;
                (clone.querySelector('.supplement-name') as HTMLElement).textContent = supData.name;
                (clone.querySelector('.supplement-note') as HTMLElement).textContent = supData.note;
                (clone.querySelector('.supplement-icon-container i') as HTMLElement).setAttribute('data-lucide', iconName);

                const dosageSelect = clone.querySelector('.dosage-select') as HTMLSelectElement;
                supData.dosageOptions.forEach((d: string) => dosageSelect.add(new Option(d, d)));
                const timingSelect = clone.querySelector('.timing-select') as HTMLSelectElement;
                supData.timingOptions.forEach((t: string) => timingSelect.add(new Option(t, t)));
                
                const container = document.getElementById('added-supplements-container');
                const placeholder = container?.querySelector('p');
                if (placeholder) placeholder.remove();
                container?.appendChild(clone);
                window.lucide.createIcons();
            }
            if (button.classList.contains('remove-supplement-btn')) {
                const row = button.closest('.supplement-row');
                const container = row?.parentElement;
                row?.remove();
                if (container && container.children.length === 0) {
                     container.innerHTML = '<p class="text-text-secondary text-center p-4">مکمل‌های انتخابی در اینجا نمایش داده می‌شوند.</p>';
                }
            }
        });
        
        builderContentTab.addEventListener('input', e => {
             const target = e.target as HTMLInputElement;
             if(target.classList.contains('range-slider')) {
                const labelSpan = target.previousElementSibling?.querySelector('span');
                if(labelSpan) labelSpan.textContent = target.value;
                updateSliderTrack(target);
                calculateAndDisplayVolume();
             }
             if (target.id === 'coach-notes-final') {
                renderProgramPreview();
             }
        });
    }
    
    // Selection Modal Logic
    const selectionModal = document.getElementById('selection-modal');
    selectionModal?.addEventListener('click', e => {
        if (!(e.target instanceof HTMLElement)) return;
        const target = e.target;
        if (target.closest('.selection-modal-close-btn') || target.id === 'selection-modal') {
            closeModal(selectionModal);
            currentSelectionTarget = null;
        }
        
        const optionBtn = target.closest('.selection-option-btn');
        if (optionBtn && currentSelectionTarget) {
            const value = (optionBtn as HTMLElement).dataset.value;
            if (value) {
                currentSelectionTarget.dataset.value = value;
                (currentSelectionTarget.querySelector('span') as HTMLElement).textContent = value;
                const type = currentSelectionTarget.dataset.type;
                if (type === 'muscle-group') {
                    const exerciseButton = currentSelectionTarget.closest('.exercise-row')?.querySelector('.exercise-select') as HTMLButtonElement;
                    if (exerciseButton) {
                        exerciseButton.disabled = false;
                        exerciseButton.dataset.value = "";
                        (exerciseButton.querySelector('span') as HTMLElement).textContent = "انتخاب حرکت";
                    }
                } else if (type === 'supplement-category') {
                     const nameButton = document.getElementById('supplement-name-select-btn') as HTMLButtonElement;
                     if(nameButton) {
                         nameButton.disabled = false;
                         nameButton.dataset.value = "";
                         (nameButton.querySelector('span') as HTMLElement).textContent = "مکمل را انتخاب کنید";
                     }
                } else if (type === 'exercise') {
                    const row = currentSelectionTarget.closest('.exercise-row') as HTMLElement;
                    const muscleGroup = (row.querySelector('.muscle-group-select') as HTMLElement).dataset.value;
                    if(row && muscleGroup) {
                        row.dataset.exerciseMuscleGroup = muscleGroup;
                    }
                    calculateAndDisplayVolume();
                }
            }
            closeModal(selectionModal);
            currentSelectionTarget = null;
        }

        const studentOptionBtn = target.closest('.student-option-btn');
        if (studentOptionBtn && currentSelectionTarget) {
            const username = (studentOptionBtn as HTMLElement).dataset.username;
            if (username) {
                renderStudentInfoForBuilder(username);
            }
            closeModal(selectionModal);
            currentSelectionTarget = null;
        }
    });


    // --- Templates Tab Logic ---
    const templatesContainer = document.getElementById('templates-list-container');
    if (templatesContainer) {
        templatesContainer.addEventListener('click', e => {
            if (!(e.target instanceof HTMLElement)) return;
            const targetBtn = e.target.closest('button');
            if (!targetBtn) return;

            const templateName = targetBtn.dataset.templateName;
            const action = targetBtn.dataset.action;

            if (action === 'delete-template' && templateName) {
                if (confirm(`آیا از حذف الگوی "${templateName}" مطمئن هستید؟`)) {
                    deleteTemplate(templateName);
                    showToast(`الگوی "${templateName}" حذف شد.`, 'success');
                    renderTemplatesTab();
                }
            } else if (action === 'load-template' && templateName) {
                 showToast(`بارگذاری الگوی "${templateName}" هنوز پیاده‌سازی نشده است.`, 'error');
            }
        });
    }
    
    // --- Profile Form Logic ---
    const profileForm = document.getElementById('coach-profile-form') as HTMLFormElement;
    if (profileForm) {
        const changeAvatarBtn = document.getElementById('change-avatar-btn');
        const avatarInput = document.getElementById('coach-avatar-input') as HTMLInputElement;
        changeAvatarBtn?.addEventListener('click', () => avatarInput?.click());

        avatarInput?.addEventListener('change', () => {
            if (avatarInput.files && avatarInput.files[0]) {
                const file = avatarInput.files[0];
                if (file.size > 2 * 1024 * 1024) { // 2MB limit
                    showToast('حجم عکس باید کمتر از ۲ مگابایت باشد.', 'error');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.getElementById('coach-avatar-preview') as HTMLImageElement;
                    const hiddenInput = document.getElementById('coach-avatar-base64') as HTMLInputElement;
                    if (preview && hiddenInput && e.target?.result) {
                        preview.src = e.target.result as string;
                        hiddenInput.value = e.target.result as string;
                    }
                };
                reader.readAsDataURL(file);
            }
        });


        profileForm.addEventListener('submit', e => {
            e.preventDefault();
            const formData = new FormData(profileForm);
            const coachData = getUserData(currentUser);
            if (!coachData.profile) coachData.profile = {};
            
            coachData.profile.bio = formData.get('coach-bio') as string;
            coachData.profile.specialization = formData.get('coach-specialization') as string;
            coachData.profile.instagram = formData.get('coach-instagram') as string;

            const avatarBase64 = (formData.get('coach-avatar-base64') as string);
            if (avatarBase64) {
                coachData.profile.avatar = avatarBase64;
            }
            
            if (coachData.step1) {
                coachData.step1.clientName = formData.get('coach-name') as string;
            } else {
                coachData.step1 = { clientName: formData.get('coach-name') as string };
            }
            
            saveUserData(currentUser, coachData);
            
            const headerAvatar = document.getElementById('coach-header-avatar') as HTMLImageElement;
            if (headerAvatar && coachData.profile.avatar) {
                headerAvatar.src = coachData.profile.avatar;
            }
            
            showToast('پروفایل با موفقیت به‌روزرسانی شد.', 'success');
        });
    }

    renderTemplatesTab();
    if(document.body) (document.body.querySelector('.coach-nav-link') as HTMLElement)?.click();
}

export function renderCoachDashboard(currentUser: string, userData: any) {
    const daysOfWeek = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
    const myStudents = getCoachStudents(currentUser);
    const studentsNeedingPlan = getStudentsNeedingAttention(myStudents).length;
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const activeStudents = myStudents.filter(s => {
        const studentData = getUserData(s.username);
        const lastActivityTimestamp = new Date(getLastActivityDate(studentData)).getTime();
        return lastActivityTimestamp > oneWeekAgo;
    }).length;
    const activeRate = myStudents.length > 0 ? Math.round((activeStudents / myStudents.length) * 100) : 0;
    
    const coachKpisHtml = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="info-card flex items-center p-5 gap-4">
            <div class="bg-blue-500/10 text-blue-500 p-3 rounded-full"><i data-lucide="users" class="w-7 h-7"></i></div>
            <div>
                <p class="text-3xl font-bold">${myStudents.length}</p>
                <p class="text-text-secondary">کل شاگردان</p>
            </div>
        </div>
        <div class="info-card flex items-center p-5 gap-4">
            <div class="bg-orange-500/10 text-orange-500 p-3 rounded-full"><i data-lucide="alert-circle" class="w-7 h-7"></i></div>
            <div>
                <p class="text-3xl font-bold">${studentsNeedingPlan}</p>
                <p class="text-text-secondary">در انتظار برنامه</p>
            </div>
        </div>
        <div class="info-card flex items-center p-5 gap-4">
            <div class="bg-green-500/10 text-green-500 p-3 rounded-full"><i data-lucide="activity" class="w-7 h-7"></i></div>
            <div>
                <p class="text-3xl font-bold">${activeRate}%</p>
                <p class="text-text-secondary">نرخ فعالیت (۷ روز)</p>
            </div>
        </div>
    </div>
    `;

    const navItems = [
        { target: 'students-content', icon: 'users', label: 'شاگردان' },
        { target: 'builder-content', icon: 'plus-circle', label: 'ساخت برنامه' },
        { target: 'templates-content', icon: 'layout-template', label: 'الگوها' },
        { target: 'profile-content', icon: 'user-circle', label: 'پروفایل' }
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
                    <button class="coach-nav-link w-full flex items-center gap-3 px-4 py-3 rounded-lg text-md" data-target="${item.target}">
                        <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                        <span>${item.label}</span>
                        <span class="notification-badge mr-auto"></span>
                    </button>
                `).join('')}
            </nav>
            <div class="space-y-2">
                 <button id="go-to-home-btn" class="secondary-button w-full !justify-start !gap-3 !px-4 !py-3"><i data-lucide="home" class="w-5 h-5"></i><span>صفحه اصلی</span></button>
                 <button id="theme-toggle-btn-dashboard" class="secondary-button w-full !justify-start !gap-3 !px-4 !py-3"><i data-lucide="sun" class="w-5 h-5"></i><span>تغییر پوسته</span></button>
                 <button id="logout-btn" class="secondary-button w-full !justify-start !gap-3 !px-4 !py-3"><i data-lucide="log-out" class="w-5 h-5"></i><span>خروج</span></button>
            </div>
        </aside>

        <main class="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div id="impersonation-banner-placeholder"></div>
            <header class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div id="coach-page-title-container">
                    <h1 id="coach-page-title" class="text-3xl font-bold">شاگردان</h1>
                    <p id="coach-page-subtitle" class="text-text-secondary">نمای کلی شاگردان و نیازمندی‌ها.</p>
                </div>
                 <div class="flex items-center gap-3 bg-bg-secondary p-2 rounded-lg">
                    <img id="coach-header-avatar" src="${userData.profile?.avatar || `https://i.pravatar.cc/150?u=${currentUser}`}" alt="Coach Avatar" class="w-10 h-10 rounded-full object-cover">
                    <div>
                        <p class="font-bold text-sm">${userData.step1?.clientName || currentUser}</p>
                        <p class="text-xs text-text-secondary">مربی</p>
                    </div>
                </div>
            </header>

            <div id="students-content" class="coach-tab-content hidden animate-fade-in-up">
                ${coachKpisHtml}
                <div id="needs-attention-container" class="mb-8">
                    <h2 class="text-xl font-bold mb-4">نیازمند توجه</h2>
                    <div class="p-4 rounded-xl bg-accent/10">
                        <div id="needs-attention-grid" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            <!-- Cards for students needing a plan will be injected here -->
                        </div>
                    </div>
                </div>
                <div class="card p-4 sm:p-6">
                    <div class="flex justify-between items-center mb-4">
                       <h2 class="text-xl font-bold">لیست همه شاگردان</h2>
                       <div class="relative w-48">
                           <i data-lucide="search" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"></i>
                           <input type="text" id="student-search-input" class="input-field w-full !pr-10 !text-sm" placeholder="جستجوی شاگرد...">
                       </div>
                   </div>
                   <div id="all-students-grid" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        <!-- Student cards injected here -->
                   </div>
                </div>
            </div>

            <div id="builder-content" class="coach-tab-content hidden">
                <div id="builder-wrapper">
                    <div id="student-selection-prompt">
                        <div class="card text-center p-8 md:p-12 animate-fade-in">
                            <div class="w-20 h-20 bg-accent/10 text-accent rounded-full mx-auto flex items-center justify-center mb-6">
                                <i data-lucide="user-plus" class="w-10 h-10"></i>
                            </div>
                            <h2 class="text-2xl font-bold mb-2">ساخت برنامه جدید</h2>
                            <p class="text-text-secondary max-w-md mx-auto mb-8">برای شروع، ابتدا یک شاگرد را از لیست انتخاب کنید تا بتوانید برنامه تمرینی و غذایی شخصی‌سازی شده برای او ایجاد کنید.</p>
                            <button type="button" id="student-select-btn" class="primary-button !text-lg !px-8 !py-3">
                                <i data-lucide="users" class="w-5 h-5 ml-2"></i>
                                انتخاب از لیست شاگردان
                            </button>
                        </div>
                    </div>

                    <div id="program-builder-main" class="hidden">
                         <div class="card p-4 md:p-6 mb-6">
                             <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div id="builder-context-header" class="p-2 bg-bg-tertiary rounded-lg text-sm font-semibold flex items-center gap-2">
                                    <i data-lucide="user-check" class="w-4 h-4 text-accent"></i>
                                    <span>در حال ساخت برنامه برای: </span>
                                    <strong id="builder-student-name"></strong>
                                </div>
                                 <button id="change-student-btn" class="secondary-button !text-sm"><i data-lucide="users" class="w-4 h-4 mr-2"></i> تغییر شاگرد</button>
                             </div>
                        </div>
                        <div id="program-builder-steps-container" class="card p-4 md:p-6">
                            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
                                <h3 class="text-lg font-bold">مراحل ساخت برنامه</h3>
                                <button id="ai-draft-btn" class="primary-button flex items-center gap-2 hidden" disabled>
                                    <i data-lucide="sparkles" class="w-4 h-4"></i> ایجاد پیش‌نویس با AI
                                </button>
                            </div>

                            <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
                                ${[ "اطلاعات شاگرد", "برنامه تمرینی", "برنامه مکمل", "بازبینی و ارسال"].map((title, i) => `
                                    <div class="stepper-item" data-step="${i+1}">
                                       <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm">${i+1}</div>
                                       <span class="hidden md:inline">${title}</span>
                                    </div>
                                    ${i < 3 ? `<div class="flex-grow h-0.5 bg-border-primary mx-2"></div>` : ''}
                                `).join('')}
                            </div>

                            <div id="step-content-1" class="step-content">
                                <div id="student-info-display" class="hidden"></div>
                            </div>
                            <div id="step-content-2" class="step-content hidden">
                                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div class="lg:col-span-2 space-y-4">
                                        <h3 class="text-lg font-bold">۲. طراحی برنامه تمرینی</h3>
                                        <div class="space-y-4">
                                            ${daysOfWeek.map(day => `<details id="day-card-${day}" class="day-card card !shadow-none !border p-3"><summary class="font-bold cursor-pointer flex justify-between items-center"><span>${day}</span><i data-lucide="chevron-down" class="details-arrow"></i></summary><div class="exercises-container space-y-2 mt-4"></div><button class="add-exercise-btn secondary-button mt-4 !text-sm !py-2"><i data-lucide="plus" class="w-4 h-4"></i> افزودن حرکت</button></details>`).join('')}
                                        </div>
                                    </div>
                                    <div class="lg:col-span-1">
                                        <div id="volume-analysis-container" class="card !shadow-none !border p-4 sticky top-6">
                                            <h4 class="font-bold mb-3">تحلیل حجم تمرین</h4>
                                            <div id="volume-analysis-content" class="space-y-2 text-sm">
                                                <p class="text-text-secondary">با افزودن حرکات، حجم تمرین هفتگی برای هر گروه عضلانی در اینجا نمایش داده می‌شود.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="step-content-3" class="step-content hidden">
                                <h3 class="text-lg font-bold mb-4">۳. طراحی برنامه مکمل</h3>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div class="md:col-span-1 space-y-4">
                                        <div class="flex items-center justify-between">
                                            <h4 class="font-semibold">افزودن مکمل</h4>
                                            <div class="flex items-center gap-2">
                                                <select id="ai-supplement-goal" class="input-field !text-sm !py-1.5 !px-3 !bg-bg-tertiary">
                                                    <option value="افزایش حجم">افزایش حجم</option>
                                                    <option value="کاهش وزن">کاهش وزن</option>
                                                    <option value="افزایش قدرت">افزایش قدرت</option>
                                                    <option value="تناسب اندام عمومی">تناسب اندام عمومی</option>
                                                </select>
                                                <button id="ai-suggest-supplements-btn" class="secondary-button !py-1.5 !px-2.5 !text-sm flex items-center gap-1">
                                                    <i data-lucide="sparkles" class="w-4 h-4"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="p-3 bg-bg-tertiary rounded-lg">
                                            <p class="text-xs text-text-secondary mb-2">افزودن دستی:</p>
                                            <div class="space-y-2">
                                                <button type="button" id="supplement-category-select-btn" class="selection-button input-field !bg-bg-secondary w-full text-right justify-start" data-type="supplement-category"><span class="truncate">انتخاب دسته</span></button>
                                                <button type="button" id="supplement-name-select-btn" class="selection-button input-field !bg-bg-secondary w-full text-right justify-start" data-type="supplement-name" disabled><span class="truncate">انتخاب مکمل</span></button>
                                                <button id="add-supplement-btn" class="primary-button w-full">افزودن</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="added-supplements-container" class="md:col-span-2 space-y-2">
                                        <p class="text-text-secondary text-center p-4">مکمل‌های انتخابی در اینجا نمایش داده می‌شوند.</p>
                                    </div>
                                </div>
                            </div>
                            <div id="step-content-4" class="step-content hidden">
                                <h3 class="text-lg font-bold mb-4">۴. بازبینی و ارسال</h3>
                                <div class="space-y-4">
                                    <div>
                                       <label for="coach-notes-final" class="font-semibold text-sm mb-2 block">یادداشت نهایی برای شاگرد</label>
                                       <textarea id="coach-notes-final" class="input-field w-full min-h-[100px]" placeholder="مثلا: قبل از تمرین حتما گرم کنید..."></textarea>
                                    </div>
                                    <div id="program-preview-for-export" class="border border-border-primary rounded-lg"></div>
                                    <div class="flex justify-start items-center gap-3 mt-4 pt-4 border-t border-border-primary">
                                        <button id="export-program-img-btn" class="png-button"><i data-lucide="image" class="w-4 h-4 mr-2"></i> ذخیره عکس</button>
                                        <button id="export-program-pdf-btn" class="pdf-button"><i data-lucide="file-down" class="w-4 h-4 mr-2"></i> ذخیره PDF</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex justify-between items-center mt-6 pt-4 border-t border-border-primary">
                                <div><button id="save-as-template-btn" class="secondary-button"><i data-lucide="save" class="w-4 h-4 ml-2"></i> ذخیره به عنوان الگو</button></div>
                                <div class="flex gap-2">
                                    <button id="prev-step-btn" class="secondary-button">قبلی</button>
                                    <button id="next-step-btn" class="primary-button">بعدی</button>
                                    <button id="finish-program-btn" class="primary-button hidden">پایان و ارسال برنامه</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="templates-content" class="coach-tab-content hidden"><div class="card p-6"><h2 class="text-xl font-bold mb-4">الگوهای برنامه</h2><div id="templates-list-container" class="space-y-2"></div></div></div>
            <div id="profile-content" class="coach-tab-content hidden">
                <div class="card p-6 max-w-2xl mx-auto">
                    <h2 class="text-xl font-bold mb-6 text-center">پروفایل مربی</h2>
                    <form id="coach-profile-form" class="space-y-4">
                         <div class="flex flex-col items-center mb-6">
                            <img id="coach-avatar-preview" src="${userData.profile?.avatar || `https://i.pravatar.cc/150?u=${currentUser}`}" alt="Avatar Preview" class="w-24 h-24 rounded-full mb-4 border-4 border-accent/50 object-cover shadow-lg">
                            <input type="file" id="coach-avatar-input" class="hidden" accept="image/jpeg, image/png, image/webp">
                            <input type="hidden" id="coach-avatar-base64" name="coach-avatar-base64">
                            <button type="button" id="change-avatar-btn" class="secondary-button !text-sm">تغییر عکس</button>
                        </div>
                        <div class="input-group">
                            <input id="coach-name" name="coach-name" type="text" value="${userData.step1?.clientName || currentUser}" class="input-field w-full" placeholder=" ">
                            <label for="coach-name" class="input-label">نام نمایشی</label>
                        </div>
                        <div class="input-group">
                            <textarea id="coach-bio" name="coach-bio" class="input-field w-full min-h-[100px]" placeholder=" ">${userData.profile?.bio || 'مربی رسمی فدراسیون با ۵ سال سابقه در زمینه طراحی برنامه...'}</textarea>
                            <label for="coach-bio" class="input-label">بیوگرافی کوتاه</label>
                        </div>
                        <div class="input-group">
                            <input id="coach-specialization" name="coach-specialization" type="text" value="${userData.profile?.specialization || 'فیتنس، افزایش حجم'}" class="input-field w-full" placeholder=" ">
                            <label for="coach-specialization" class="input-label">تخصص‌ها (با کاما جدا کنید)</label>
                        </div>
                        <div class="input-group">
                            <input id="coach-instagram" name="coach-instagram" type="text" value="${userData.profile?.instagram || ''}" class="input-field w-full" placeholder=" ">
                            <label for="coach-instagram" class="input-label">آیدی اینستاگرام</label>
                        </div>
                        <button type="submit" class="primary-button w-full">ذخیره تغییرات</button>
                    </form>
                </div>
            </div>
        </main>
    </div>
    
    <div id="student-profile-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-4xl transform scale-95 transition-transform duration-300 relative flex flex-col max-h-[90vh]">
            <div class="flex justify-between items-center p-4 border-b border-border-primary flex-shrink-0"><h3 id="student-modal-name" class="font-bold text-xl"></h3><button id="close-student-modal-btn" class="secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button></div>
            <div class="flex-grow flex flex-col md:flex-row overflow-hidden">
                <div class="w-full md:w-1/3 border-b md:border-b-0 md:border-l border-border-primary flex-shrink-0"></div>
                <div class="flex-grow p-4 overflow-y-auto">
                    <div class="flex items-center gap-1 bg-bg-tertiary p-1 rounded-lg mb-4"><button class="student-modal-tab admin-tab-button flex-1" data-target="student-program-content">برنامه تمرینی</button><button class="student-modal-tab admin-tab-button flex-1" data-target="student-progress-content">روند پیشرفت</button><button class="student-modal-tab admin-tab-button flex-1" data-target="student-chat-content">گفتگو</button></div>
                    <div id="student-program-content" class="student-modal-content"><div id="student-program-content-wrapper"></div></div>
                    <div id="student-progress-content" class="student-modal-content hidden"></div>
                    <div id="student-chat-content" class="student-modal-content hidden">
                        <div class="flex flex-col h-96">
                            <div id="coach-chat-messages-container" class="flex-grow p-1 space-y-4 overflow-y-auto flex flex-col">
                                <!-- Messages injected by JS -->
                            </div>
                            <form id="coach-chat-form" class="pt-2 flex items-center gap-2">
                                <input type="text" id="coach-chat-input" class="input-field flex-grow" placeholder="پیام خود را بنویسید...">
                                <button type="submit" class="primary-button !p-3"><i data-lucide="send" class="w-5 h-5"></i></button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Selection Modal -->
    <div id="selection-modal" class="modal fixed inset-0 bg-black/60 z-[101] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-4xl h-[80vh] transform scale-95 transition-transform duration-300 relative flex flex-col">
            <div class="selection-modal-header p-4 border-b border-border-primary flex-shrink-0">
                <div class="flex justify-between items-center mb-3">
                    <h2 class="selection-modal-title font-bold text-xl"></h2>
                    <button class="selection-modal-close-btn secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button>
                </div>
                <input type="search" class="selection-modal-search input-field w-full" placeholder="جستجو...">
                <div class="flex flex-wrap items-center gap-2 mt-3">
                    <div id="student-filter-chips" class="flex items-center gap-2">
                        <button class="filter-chip active" data-filter="all">همه</button>
                        <button class="filter-chip" data-filter="needs_plan">در انتظار برنامه</button>
                        <button class="filter-chip" data-filter="inactive">غیرفعال</button>
                    </div>
                    <div class="flex-grow"></div>
                    <select id="student-sort-select" class="input-field !text-sm !py-1 !px-2">
                        <option value="name">مرتب‌سازی بر اساس نام</option>
                        <option value="activity">مرتب‌سازی بر اساس آخرین فعالیت</option>
                        <option value="join_date">مرتب‌سازی بر اساس تاریخ عضویت</option>
                    </select>
                </div>
            </div>
            <div class="selection-modal-options p-4 pt-2 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
                <!-- Options injected here -->
            </div>
        </div>
    </div>
    `;
}