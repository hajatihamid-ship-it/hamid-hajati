import { exerciseDB, supplementsDB } from '../config';
import { getTemplates, saveTemplate, deleteTemplate, getUsers, getUserData, saveUserData, getNotifications, setNotification, clearNotification } from '../services/storage';
import { showToast, updateSliderTrack, openModal, closeModal, exportElement } from '../utils/dom';
import { getLatestPurchase, timeAgo } from '../utils/helpers';
import { generateWorkoutPlan } from '../services/gemini';

let currentStep = 1;
const totalSteps = 4;
let activeStudentUsername: string | null = null;
let studentModalChartInstance: any = null;
let currentSelectionTarget: HTMLElement | null = null;
let exerciseToMuscleGroupMap: Record<string, string> = {};

export const updateCoachNotifications = (currentUser: string) => {
    const notifications = getNotifications(currentUser);
    const mainContainer = document.getElementById('coach-dashboard-container');
    if (!mainContainer) return;

    mainContainer.querySelectorAll('.coach-dashboard-tab').forEach(tab => {
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
            <div class="flex justify-between items-center text-sm">
                <span class="font-semibold">${group}</span>
                <span class="text-text-secondary">${volume}</span>
            </div>
            <div class="w-full bg-bg-tertiary rounded-full h-1.5 mt-1 mb-2">
                <div class="bg-accent h-1.5 rounded-full" style="width: ${Math.min(100, (volume / maxVolume) * 100)}%"></div>
            </div>
        `).join('')}
        `;
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
};

const addExerciseRow = (dayId: string, exerciseData: any | null = null) => {
    const dayContainer = document.getElementById(dayId);
    const template = document.getElementById('exercise-template') as HTMLTemplateElement;
    if (!dayContainer || !template) return;
    
    const clone = template.content.cloneNode(true) as DocumentFragment;
    const newRow = clone.querySelector('.exercise-row') as HTMLElement;

    if (exerciseData) {
        const muscleGroup = Object.keys(exerciseDB).find(group => exerciseDB[group].includes(exerciseData.name));
        if (muscleGroup) {
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
    (modal.querySelector('#student-modal-email') as HTMLElement).textContent = user.email;
    (modal.querySelector('#student-modal-goal') as HTMLElement).textContent = userData.step1?.trainingGoal || 'تعیین نشده';
    (modal.querySelector('#student-modal-age') as HTMLElement).textContent = (userData.step1?.age || 'N/A').toString();
    (modal.querySelector('#student-modal-height') as HTMLElement).textContent = (userData.step1?.height || 'N/A').toString();
    (modal.querySelector('#student-modal-weight') as HTMLElement).textContent = (userData.weightHistory?.slice(-1)[0]?.weight || userData.step1?.weight || 'N/A').toString();
    (modal.querySelector('#student-modal-tdee') as HTMLElement).textContent = (Math.round(userData.step1?.tdee) || 'N/A').toString();

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
    
    initStudentWeightChartInModal(userData);

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
    const infoDisplay = document.getElementById('student-info-display');
    const placeholder = document.getElementById('student-info-placeholder');
    const contextHeader = document.getElementById('builder-context-header');
    const studentSelectBtn = document.getElementById('student-select-btn') as HTMLButtonElement;
    const changeStudentBtn = document.getElementById('change-student-btn') as HTMLElement;
    const aiDraftBtn = document.getElementById('ai-draft-btn') as HTMLButtonElement;


    if (!infoDisplay || !placeholder || !contextHeader || !studentSelectBtn || !changeStudentBtn) return;

    if (!username) {
        infoDisplay.classList.add('hidden');
        placeholder.classList.remove('hidden');
        contextHeader.classList.add('hidden');
        activeStudentUsername = null;
        studentSelectBtn.disabled = false;
        changeStudentBtn.classList.add('hidden');
        if(aiDraftBtn) aiDraftBtn.disabled = true;
        return;
    }

    activeStudentUsername = username;
    const studentData = getUserData(username);
    const { step1 } = studentData;

    if (!step1) {
        infoDisplay.innerHTML = `<p class="text-text-secondary text-center p-8">اطلاعات پروفایل این شاگرد کامل نیست.</p>`;
        infoDisplay.classList.remove('hidden');
        placeholder.classList.add('hidden');
        if(aiDraftBtn) aiDraftBtn.disabled = true;
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
    placeholder.classList.add('hidden');

    (contextHeader.querySelector('span') as HTMLElement).textContent = step1?.clientName || username;
    contextHeader.classList.remove('hidden');

    studentSelectBtn.disabled = true;
    changeStudentBtn.classList.remove('hidden');
    if(aiDraftBtn) aiDraftBtn.disabled = false;
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

const openStudentSelectionModal = (target: HTMLElement) => {
    currentSelectionTarget = target;
    const modal = document.getElementById('selection-modal');
    if (!modal) return;

    const titleEl = modal.querySelector('.selection-modal-title') as HTMLElement;
    const optionsContainer = modal.querySelector('.selection-modal-options') as HTMLElement;
    const searchInput = modal.querySelector('.selection-modal-search') as HTMLInputElement;

    titleEl.textContent = "انتخاب شاگرد";
    searchInput.value = '';
    
    const students = getUsers().filter((u: any) => u.role === 'user');

    const renderOptions = (filter = '') => {
        const filteredStudents = students.filter((s: any) => {
            const studentData = getUserData(s.username);
            const name = studentData.step1?.clientName || s.username;
            return name.toLowerCase().includes(filter.toLowerCase());
        });

        const optionTemplate = document.getElementById('student-selection-option-template') as HTMLTemplateElement;
        if (!optionTemplate) {
            optionsContainer.innerHTML = '<p>Template not found</p>';
            return;
        }
        
        optionsContainer.innerHTML = filteredStudents.map((s: any) => {
            const studentData = getUserData(s.username);
            const name = studentData.step1?.clientName || s.username;
            const goal = studentData.step1?.trainingGoal || 'بدون هدف';
            const trainingDays = studentData.step1?.trainingDays ? `${studentData.step1.trainingDays} روز در هفته` : '';
            const latestPurchase = getLatestPurchase(studentData);
            
            const optionNode = optionTemplate.content.cloneNode(true) as DocumentFragment;
            const button = optionNode.querySelector('.student-option-btn') as HTMLButtonElement;
            button.dataset.username = s.username;
            (button.querySelector('.student-name') as HTMLElement).textContent = name;
            
            const goalText = [goal, trainingDays].filter(Boolean).join(' - ');
            (button.querySelector('.student-goal') as HTMLElement).textContent = goalText;

            const planNameEl = button.querySelector('.student-plan') as HTMLElement;
            const planStatusEl = button.querySelector('.student-plan-status') as HTMLElement;

            if (latestPurchase) {
                planNameEl.textContent = latestPurchase.planName;
                if (latestPurchase.fulfilled === false) {
                    planStatusEl.innerHTML = `<span class="status-badge pending !text-xs !py-0.5 !px-2">در انتظار برنامه</span>`;
                } else {
                    planStatusEl.innerHTML = `<span class="status-badge verified !text-xs !py-0.5 !px-2">برنامه ارسال شده</span>`;
                }
            } else {
                planNameEl.textContent = 'بدون خرید فعال';
                planStatusEl.innerHTML = '';
            }
            
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(optionNode);
            return tempDiv.innerHTML;
        }).join('');
        window.lucide.createIcons();
    };
    
    renderOptions();
    searchInput.oninput = () => renderOptions(searchInput.value);
    optionsContainer.className = "selection-modal-options p-4 pt-2 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-2 gap-3";

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
            day.exercises.forEach((ex: any) => {
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
             container.innerHTML = `<p class="text-text-secondary text-center col-span-full">هیچ شاگردی در حال حاضر منتظر برنامه نیست.</p>`;
        } else {
             container.innerHTML = `<p class="text-text-secondary text-center col-span-full">موردی برای نمایش وجود ندارد.</p>`;
        }
        return;
    }

    container.innerHTML = students.map(student => {
        const studentData = getUserData(student.username);
        const name = studentData.step1?.clientName || student.username;
        const goal = studentData.step1?.trainingGoal || 'بدون هدف';
        const latestPurchase = getLatestPurchase(studentData);
        
        let statusHtml = '<span class="status-badge active !text-xs !py-0.5 !px-2">فعال</span>';
        if (latestPurchase && latestPurchase.fulfilled === false) {
            statusHtml = `<span class="status-badge pending !text-xs !py-0.5 !px-2">در انتظار برنامه</span>`;
        }

        return `
            <div class="card p-4 flex flex-col gap-3 animate-fade-in h-full" style="aspect-ratio: 1/1;">
                <div class="flex justify-between items-start">
                    <h3 class="font-bold">${name}</h3>
                    ${statusHtml}
                </div>
                <p class="text-sm text-text-secondary flex-grow">${goal}</p>
                <div class="mt-auto pt-3 border-t border-border-primary flex items-center gap-2">
                    <button data-action="create-program" data-username="${student.username}" class="primary-button !py-2.5 !px-3 !text-sm flex-grow">ایجاد برنامه</button>
                    <button data-action="view-student" data-username="${student.username}" class="secondary-button !py-2.5 !px-3 !text-sm">مشاهده پروفایل</button>
                </div>
            </div>
        `;
    }).join('');
    window.lucide?.createIcons();
};

export function initCoachDashboard(currentUser: string, handleLogout: () => void) {
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    const mainContainer = document.getElementById('coach-dashboard-container');
    if (!mainContainer) return;
    
    buildExerciseMap();

    // --- Student Tab Initial Render ---
    const allStudents = getUsers().filter((u: any) => u.role === 'user');
    const studentsNeedingAttention = getStudentsNeedingAttention(allStudents);
    renderStudentCards(studentsNeedingAttention, 'needs-attention-grid');
    renderStudentCards(allStudents, 'all-students-grid');
    updateCoachNotifications(currentUser);


    document.getElementById('student-search-input')?.addEventListener('input', e => {
        const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
        const filteredStudents = allStudents.filter(s => {
            const studentData = getUserData(s.username);
            const name = studentData.step1?.clientName || s.username;
            return name.toLowerCase().includes(searchTerm);
        });
        renderStudentCards(filteredStudents, 'all-students-grid');
    });

    // --- Tab Switching Logic ---
    const tabs = mainContainer.querySelectorAll('.coach-dashboard-tab');
    const tabContents = mainContainer.querySelectorAll('.coach-tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            if (!targetId) return;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(content => content.classList.toggle('hidden', content.id !== targetId));
            
            clearNotification(currentUser, targetId);
            updateCoachNotifications(currentUser);

            if (targetId === 'templates-content') renderTemplatesTab();
        });
    });

    mainContainer.addEventListener('click', async e => {
        if (!(e.target instanceof HTMLElement)) return;
        const target = e.target;
        const button = target.closest('button');
        if (!button) return;
        
        const action = button.dataset.action;
        const username = button.dataset.username;

        if (action === "view-student" && username) {
            openStudentProfileModal(username);
        }

        if (action === "create-program" && username) {
            (document.querySelector('.coach-dashboard-tab[data-target="builder-content"]') as HTMLElement).click();
            resetProgramBuilder();
            const studentSelectBtn = document.getElementById('student-select-btn') as HTMLButtonElement;
            const studentData = getUserData(username);
            studentSelectBtn.dataset.value = username;
            (studentSelectBtn.querySelector('span') as HTMLElement).textContent = studentData.step1?.clientName || username;
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
                (document.querySelector('.coach-dashboard-tab[data-target="students-content"]') as HTMLElement)?.click();
                 // Refresh student lists
                const allStudents = getUsers().filter((u: any) => u.role === 'user');
                const studentsNeedingAttention = getStudentsNeedingAttention(allStudents);
                renderStudentCards(studentsNeedingAttention, 'needs-attention-grid');
                renderStudentCards(allStudents, 'all-students-grid');
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
            if (!button) return;
            
            if (button.id === 'student-select-btn') {
                openStudentSelectionModal(button);
            }

            if (button.classList.contains('selection-button')) {
                const type = button.dataset.type;
                switch (type) {
                    case 'muscle-group':
                        openSelectionModal(Object.keys(exerciseDB), "انتخاب گروه عضلانی", button);
                        break;
                    case 'exercise':
                        const muscleGroup = (button.closest('.exercise-row')?.querySelector('.muscle-group-select') as HTMLElement).dataset.value;
                        if (muscleGroup) {
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
                         if (category) {
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
                    calculateAndDisplayVolume();
                }
            }
            closeModal(selectionModal);
            currentSelectionTarget = null;
        }

        const studentOptionBtn = target.closest('.student-option-btn');
        if (studentOptionBtn && currentSelectionTarget && currentSelectionTarget.id === 'student-select-btn') {
            const username = (studentOptionBtn as HTMLElement).dataset.username;
            const studentName = (studentOptionBtn.querySelector('.student-name') as HTMLElement).textContent;
            if (username && studentName) {
                currentSelectionTarget.dataset.value = username;
                (currentSelectionTarget.querySelector('span') as HTMLElement).textContent = studentName;
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

    renderTemplatesTab();
}

export function renderCoachDashboard() {
    const daysOfWeek = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
    
    return `
    <div id="coach-dashboard-container" class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto transition-opacity duration-500 opacity-0">
        <div id="impersonation-banner-placeholder"></div>
        <header class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div>
                <h1 class="text-3xl font-bold">داشبورد مربی</h1>
                <p class="text-text-secondary">ابزارهای خود را برای مدیریت شاگردان و ساخت برنامه‌ها مدیریت کنید.</p>
            </div>
            <div class="flex items-center gap-2">
                 <button id="theme-toggle-btn-dashboard" class="secondary-button !p-2.5 rounded-full"><i data-lucide="sun"></i></button>
                 <button id="logout-btn" class="secondary-button">خروج</button>
            </div>
        </header>

        <div class="flex items-center gap-2 border-b border-border-primary mb-6">
            <button class="coach-dashboard-tab active" data-target="students-content"><i data-lucide="users" class="w-4 h-4"></i> شاگردان <span class="notification-badge"></span></button>
            <button class="coach-dashboard-tab" data-target="builder-content"><i data-lucide="plus-circle" class="w-4 h-4"></i> ساخت برنامه جدید <span class="notification-badge"></span></button>
            <button class="coach-dashboard-tab" data-target="templates-content"><i data-lucide="layout-template" class="w-4 h-4"></i> الگوها <span class="notification-badge"></span></button>
            <button class="coach-dashboard-tab" data-target="profile-content"><i data-lucide="user-circle" class="w-4 h-4"></i> پروفایل <span class="notification-badge"></span></button>
        </div>

        <div id="students-content" class="coach-tab-content animate-fade-in-up">
            <div id="needs-attention-container" class="mb-6">
                <h2 class="text-xl font-bold mb-4">نیازمند توجه</h2>
                <div id="needs-attention-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <!-- Cards for students needing a plan will be injected here -->
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
               <div id="all-students-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" style="grid-auto-rows: 1fr;">
                    <!-- Student cards injected here -->
               </div>
            </div>
        </div>

        <div id="builder-content" class="coach-tab-content hidden">
            <div class="card p-4 md:p-6 mb-6">
                <label for="student-select-btn" class="block font-bold mb-2">۱. انتخاب شاگرد</label>
                <div class="flex items-center gap-2">
                    <button type="button" id="student-select-btn" class="selection-button input-field flex-grow text-right justify-between">
                        <span class="truncate">یک شاگرد را انتخاب کنید...</span>
                        <i data-lucide="chevron-down" class="w-4 h-4 text-text-secondary"></i>
                    </button>
                    <button id="change-student-btn" class="secondary-button hidden"><i data-lucide="rotate-cw" class="w-4 h-4"></i></button>
                </div>
            </div>

            <div id="program-builder-container" class="card p-4 md:p-6">
                <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
                    <div id="builder-context-header" class="hidden p-2 bg-bg-tertiary rounded-lg text-sm font-semibold">
                        در حال ساخت برنامه برای: <span></span>
                    </div>
                    <button id="ai-draft-btn" class="primary-button flex items-center gap-2" disabled>
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
                    <div id="student-info-placeholder"><p class="text-text-secondary text-center p-8">برای مشاهده اطلاعات، یک شاگرد را از لیست بالا انتخاب کنید.</p></div>
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
                             <h4 class="font-semibold">افزودن مکمل</h4>
                             <button type="button" id="supplement-category-select-btn" class="selection-button input-field w-full text-right justify-start" data-type="supplement-category"><span class="truncate">دسته را انتخاب کنید</span></button>
                             <button type="button" id="supplement-name-select-btn" class="selection-button input-field w-full text-right justify-start" data-type="supplement-name" disabled><span class="truncate">مکمل را انتخاب کنید</span></button>
                             <button id="add-supplement-btn" class="primary-button w-full">افزودن</button>
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
                        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 pt-4 border-t border-border-primary">
                            <div class="flex items-center gap-2">
                                <button id="export-program-img-btn" class="secondary-button !text-sm"><i data-lucide="image" class="w-4 h-4 ml-2"></i> ذخیره عکس</button>
                                <button id="export-program-pdf-btn" class="secondary-button !text-sm"><i data-lucide="file-down" class="w-4 h-4 ml-2"></i> ذخیره PDF</button>
                            </div>
                            <button id="finish-program-btn" class="primary-button w-full sm:w-auto !py-3 !text-base">پایان و ارسال برنامه</button>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-between items-center mt-6 pt-4 border-t border-border-primary">
                    <div><button id="save-as-template-btn" class="secondary-button"><i data-lucide="save" class="w-4 h-4 ml-2"></i> ذخیره به عنوان الگو</button></div>
                    <div class="flex gap-2">
                        <button id="prev-step-btn" class="secondary-button">قبلی</button>
                        <button id="next-step-btn" class="primary-button">بعدی</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="templates-content" class="coach-tab-content hidden"><div class="card p-6"><h2 class="text-xl font-bold mb-4">الگوهای برنامه</h2><div id="templates-list-container" class="space-y-2"></div></div></div>
        <div id="profile-content" class="coach-tab-content hidden"><div class="card p-6 max-w-2xl mx-auto"><h2 class="text-xl font-bold mb-4">پروفایل مربی</h2><form class="space-y-4"><div class="input-group"><input id="coach-name" type="text" value="مربی تایید شده" class="input-field w-full" placeholder=" "><label for="coach-name" class="input-label">نام نمایشی</label></div><div class="input-group"><textarea id="coach-bio" class="input-field w-full min-h-[100px]" placeholder=" ">مربی رسمی فدراسیون با ۵ سال سابقه در زمینه طراحی برنامه...</textarea><label for="coach-bio" class="input-label">بیوگرافی کوتاه</label></div><div class="input-group"><input id="coach-specialization" type="text" value="فیتنس، افزایش حجم" class="input-field w-full" placeholder=" "><label for="coach-specialization" class="input-label">تخصص‌ها (با کاما جدا کنید)</label></div><div class="input-group"><input id="coach-instagram" type="text" class="input-field w-full" placeholder=" "><label for="coach-instagram" class="input-label">آیدی اینستاگرام</label></div><button type="submit" class="primary-button w-full">ذخیره تغییرات</button></form></div></div>
    </div>
    
    <div id="student-profile-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-4xl transform scale-95 transition-transform duration-300 relative flex flex-col max-h-[90vh]">
            <div class="flex justify-between items-center p-4 border-b border-border-primary flex-shrink-0"><h3 id="student-modal-name" class="font-bold text-xl"></h3><button id="close-student-modal-btn" class="secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button></div>
            <div class="flex-grow flex flex-col md:flex-row overflow-hidden">
                <div class="w-full md:w-1/3 p-4 border-b md:border-b-0 md:border-l border-border-primary flex-shrink-0"><h4 class="font-bold mb-3">اطلاعات کلی</h4><div class="space-y-2 text-sm"><div class="flex justify-between"><span>هدف:</span> <strong id="student-modal-goal" class="font-semibold"></strong></div><div class="flex justify-between"><span>ایمیل:</span> <strong id="student-modal-email"></strong></div><div class="flex justify-between"><span>سن:</span> <strong id="student-modal-age"></strong></div><div class="flex justify-between"><span>قد (cm):</span> <strong id="student-modal-height"></strong></div><div class="flex justify-between"><span>وزن (kg):</span> <strong id="student-modal-weight"></strong></div><div class="flex justify-between"><span>TDEE:</span> <strong id="student-modal-tdee"></strong></div></div><button class="primary-button w-full mt-4 !text-sm">ارسال برنامه جدید</button></div>
                <div class="flex-grow p-4 overflow-y-auto">
                    <div class="flex items-center gap-1 bg-bg-tertiary p-1 rounded-lg mb-4"><button class="student-modal-tab admin-tab-button flex-1" data-target="student-program-content">برنامه تمرینی</button><button class="student-modal-tab admin-tab-button flex-1" data-target="student-progress-content">روند پیشرفت</button><button class="student-modal-tab admin-tab-button flex-1" data-target="student-chat-content">گفتگو</button></div>
                    <div id="student-program-content" class="student-modal-content"><div id="student-program-content-wrapper"></div></div>
                    <div id="student-progress-content" class="student-modal-content hidden"><div class="h-64"><canvas id="student-modal-weight-chart"></canvas></div></div>
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
        <div class="card w-full max-w-lg h-[70vh] transform scale-95 transition-transform duration-300 relative flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-border-primary flex-shrink-0">
                <h2 class="selection-modal-title font-bold text-xl"></h2>
                <button class="selection-modal-close-btn secondary-button !p-2 rounded-full"><i data-lucide="x"></i></button>
            </div>
            <div class="p-4 flex-shrink-0 border-b border-border-primary">
                <input type="search" class="selection-modal-search input-field w-full" placeholder="جستجو...">
            </div>
            <div class="selection-modal-options p-4 pt-2 overflow-y-auto flex-grow grid grid-cols-2 sm:grid-cols-3 gap-2 content-start">
                <!-- Options injected here -->
            </div>
        </div>
    </div>
    `;
}