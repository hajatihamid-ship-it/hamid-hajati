
import { GoogleGenAI, Type } from 'https://esm.run/@google/genai';

declare global {
  interface Window {
    jspdf: { jsPDF: any };
    lucide: {
      createIcons: () => void;
    };
    html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
    exerciseDB: any;
  }
}

const { jsPDF } = window.jspdf;

// --- DATABASES ---
const exerciseDB = {
    "سینه": ["پرس سینه هالتر", "پرس سینه دمبل", "پرس بالا سینه هالتر", "پرس بالا سینه دمبل", "پرس زیر سینه دستگاه", "قفسه سینه دمبل", "کراس اور از بالا", "کراس اور از پایین", "فلای دستگاه", "شنا سوئدی", "دیپ پارالل", "پرس سینه دستگاه", "قفسه بالا سینه دمبل", "پول اور هالتر", "شنا شیب مثبت", "شنا شیب منفی", "پرس سینه سیم کش", "دیپ سینه", "قفسه سیم کش", "پرس سینه لندماین"],
    "پشت": ["ددلیفت", "بارفیکس دست باز", "زیربغل هالتر خم", "تی بار رو", "لت سیم‌کش از جلو", "زیربغل سیم‌کش دست برعکس", "روئینگ دستگاه", "زیربغل دمبل تک خم", "فیله کمر", "پول اور دمبل", "بارفیکس دست جمع", "لت سیم‌کش دست موازی", "روئینگ سیم‌کش", "شراگ هالتر", "هایپر اکستنشن", "شراگ با دستگاه", "زیربغل قایقی دست باز", "لت از جلو دست جمع", "رک پول"],
    "سرشانه": ["پرس سرشانه هالتر", "پرس سرشانه دمبل", "نشر از جانب دمبل", "نشر از جلو دمبل", "نشر خم دمبل (دلتا خلفی)", "فیس پول", "کول هالتر دست باز", "شراگ با دمبل", "پرس آرنولدی", "نشر از جانب سیم‌کش", "نشر از جلو صفحه", "کول هالتر دست جمع", "پرس سرشانه دستگاه", "پرس سرشانه لندماین", "نشر جانب سیم کش تک دست", "شراگ دستگاه اسمیت", "کول با دمبل"],
    "جلو بازو": ["جلو بازو هالتر", "جلو بازو دمبل", "جلو بازو لاری", "جلو بازو چکشی", "جلو بازو سیم‌کش", "جلو بازو تمرکزی", "جلو بازو هالتر ای زد (EZ)", "جلو بازو دمبل روی میز شیبدار", "جلو بازو سیم‌کش از بالا (فیگوری)", "جلو بازو عنکبوتی", "جلو بازو دراگ", "جلو بازو دمبل متناوب", "جلو بازو سیم کش تک دست", "جلو بازو با صفحه", "جلو بازو اسپایدر با هالتر"],
    "پشت بازو": ["پشت بازو سیم‌کش", "دیپ پارالل", "پشت بازو هالتر خوابیده", "پشت بازو دمبل تک خم", "پشت بازو کیک بک", "دیپ روی نیمکت", "پرس سینه دست جمع", "پشت بازو دمبل جفت از پشت سر", "پشت بازو سیم‌کش طنابی", "شنا دست جمع (الماسی)", "پشت بازو دستگاه دیپ", "پشت بازو سیم کش از بالای سر", "پشت بازو با صفحه خوابیده", "پشت بازو سیم کش تک دست برعکس", "شنا پا بالا"],
    "چهارسر ران": ["اسکوات با هالتر", "پرس پا", "جلو پا ماشین", "هاک اسکوات", "لانگز با دمبل", "اسکوات گابلت", "اسکوات اسپلیت بلغاری"],
    "همسترینگ و سرینی": ["ددلیفت رومانیایی", "پشت پا ماشین خوابیده", "هیپ تراست با هالتر", "گود مورنینگ", "پل باسن با وزنه", "ددلیفت سومو", "پشت پا ماشین ایستاده", "کیک بک با سیم‌کش", "استپ آپ با دمبل", "لانگز معکوس", "ابداکتور باسن دستگاه", "ددلیفت تک پا", "لگ کرل با توپ سوئیسی", "کتل بل سوئینگ", "هیپ اکستنشن سیم کش"],
    "ساق پا": ["ساق پا ایستاده دستگاه", "ساق پا نشسته دستگاه", "ساق پا پرسی", "ساق پا با هالتر", "ساق پا الاغی", "ساق پا ایستاده با دمبل (تک پا)", "ساق پا روی پله", "ساق پا جهشی", "ساق پا در دستگاه هاک اسکوات"],
    "هوازی": ["تردمیل - پیاده‌روی سریع", "تردمیل - دویدن با شدت کم", "تردمیل - دویدن با شدت متوسط", "تردمیل - اینتروال (HIIT)", "دوچرخه ثابت - شدت کم", "دوچرخه ثابت - شدت متوسط", "دوچرخه ثابت - اینتروال (HIIT)", "الپتیکال - شدت متوسط", "الپتیکال - اینتروال", "دستگاه روئینگ - ۲۰ دقیقه", "دستگاه پله - شدت متوسط", "طناب زدن - ۱۰ دقیقه", "برپی", "جامپینگ جک (پروانه)"],
    "شکم و پهلو": ["کرانچ", "کرانچ معکوس", "پلانک", "پلانک پهلو", "زیرشکم خلبانی", "چرخش روسی با وزنه", "کرانچ سیم‌کش"],
    "وزن بدن": ["شنا سوئدی (Push-up)", "اسکوات وزن بدن", "پلانک", "برپی (Burpee)", "پروانه (Jumping Jacks)", "پل باسن (Glute Bridge)", "کوهنوردی (Mountain Climber)", "کرانچ شکم", "بارفیکس", "دیپ با صندلی", "لانگز (Lunge) وزن بدن", "بالا آوردن پا درازکش"],
    "تی‌آرایکس (TRX)": ["رو TRX (زیربغل)", "پرس سینه TRX", "اسکوات TRX", "پشت پا TRX", "جلوبازو TRX", "پشت بازو TRX", "پایک TRX (شکم)", "لانگز TRX"],
    "فیتنس و فانکشنال": ["تاب دادن کتل‌بل", "پرش روی جعبه (Box Jump)", "بتل روپ (Battle Rope)", "وال بال (Wall Ball)", "راه رفتن کشاورز (Farmer's Walk)", "اسلم بال (کوبیدن توپ)", "برخاستن ترکی (Turkish Get-up)"]
};
const supplementDB = {
    'عضله‌ساز و ریکاوری': [{ name: 'پروتئین وی', dosage: '۱ اسکوپ (معادل ۲۰-۳۰ گرم) بعد از تمرین', note: 'کمک به ترمیم و ساخت بافت عضلانی.' }, { name: 'کراتین مونوهیدرات', dosage: 'روزانه ۱ پیمانه کوچک (معادل ۳-۵ گرم)', note: 'افزایش قدرت، توان و حجم عضلات.' }, { name: 'BCAA', dosage: '۱-۲ اسکوپ (معادل ۵-۱۰ گرم) حین تمرین', note: 'کاهش خستگی و درد عضلانی.' }, { name: 'گلوتامین', dosage: '۱ اسکوپ (معادل ۵ گرم) بعد از تمرین و قبل از خواب', note: 'حمایت از سیستم ایمنی و ریکاوری.' }, { name: 'پروتئین کازئین', dosage: '۱ اسکوپ (معادل ۲۰-۳۰ گرم) قبل از خواب', note: 'پروتئین دیر هضم برای ریکاوری شبانه.' }, { name: 'گینر (Mass Gainer)', dosage: 'طبق دستور محصول (معمولا ۱-۲ اسکوپ)', note: 'برای افزایش وزن و حجم عضلانی.' }, { name: 'HMB', dosage: 'روزانه ۲-۳ عدد قرص (معادل ۳ گرم)', note: 'کاهش تجزیه عضلات و کمک به ریکاوری.' }, ],
    'افزایش‌دهنده عملکرد و انرژی': [{ name: 'کافئین', dosage: '۱-۲ عدد قرص (معادل ۲۰۰-۴۰۰ میلی‌گرم)، ۳۰-۶۰ دقیقه قبل تمرین', note: 'افزایش هوشیاری، تمرکز و انرژی.' }, { name: 'بتا-آلانین', dosage: 'روزانه نصف تا یک اسکوپ (معادل ۳-۶ گرم)', note: 'افزایش استقامت عضلانی و تاخیر در خستگی.' }, { name: 'سیترولین مالات', dosage: '۱ اسکوپ (معادل ۶-۸ گرم)، ۳۰-۶۰ دقیقه قبل تمرین', note: 'بهبود جریان خون (پمپ) و کاهش خستگی.' }, { name: 'آرژنین (AAKG)', dosage: '۳-۶ عدد قرص یا ۱ اسکوپ قبل از تمرین', note: 'افزایش تولید نیتریک اکساید و پمپ عضلانی.' }, { name: 'تورین', dosage: '۱-۳ عدد قرص یا نصف اسکوپ قبل از تمرین', note: 'حمایت از هیدراتاسیون و عملکرد سلولی.' }, ],
    'مدیریت وزن و چربی‌سوزی': [{ name: 'ال-کارنیتین', dosage: '۱-۳ عدد قرص یا ۱ قاشق مایع قبل از تمرین', note: 'کمک به انتقال اسیدهای چرب برای تولید انرژی.' }, { name: 'عصاره چای سبز', dosage: 'روزانه ۱-۲ عدد قرص (معادل ۵۰۰ میلی‌گرم)', note: 'افزایش متابولیسم و اکسیداسیون چربی.' }, { name: 'CLA', dosage: 'روزانه ۳-۴ عدد قرص سافت‌ژل', note: 'کمک به کاهش توده چربی بدن.' }, ],
    'سلامت عمومی و مفاصل': [{ name: 'مولتی ویتامین', dosage: 'روزانه ۱ عدد قرص با غذا', note: 'تامین کمبودهای ویتامین‌ها و مواد معدنی.' }, { name: 'ویتامین D3', dosage: 'روزانه ۱ عدد قرص (معادل ۱۰۰۰-۴۰۰۰ IU)', note: 'ضروری برای سلامت استخوان و سیستم ایمنی.' }, { name: 'اُمگا-۳ (روغن ماهی)', dosage: 'روزانه ۱-۳ عدد قرص سافت‌ژل (معادل ۱-۳ گرم)', note: 'کاهش التهاب، حمایت از سلامت قلب و مفاصل.' }, { name: 'گلوکوزامین و کندرویتین', dosage: 'طبق دستور محصول (معمولا ۲-۳ قرص)', note: 'حمایت از سلامت مفاصل و غضروف‌ها.' }, { name: 'ویتامین C', dosage: 'روزانه ۱-۲ عدد قرص (معادل ۵۰۰-۱۰۰۰ میلی‌گرم)', note: 'آنتی‌اکسیدان قوی و ضروری برای سلامت بافت‌ها.' }, { name: 'زینک و منیزیم (ZMA)', dosage: '۲-۳ عدد قرص قبل از خواب', note: 'بهبود کیفیت خواب، ریکاوری و سطح هورمون‌ها.' }, ]
};
window.exerciseDB = exerciseDB; // Make it globally accessible

// --- STATE & TYPES ---
interface ExerciseState { muscle: string; exercise: string; sets: string; reps: string; rest: string; isSuperset: boolean; }
interface DayState { title: string; notes: string; exercises: ExerciseState[]; }
interface SupplementState { name: string; dosage: string; }
interface AppState {
    step1: { clientName?: string; clientEmail?: string; coachName?: string; profilePic?: string; trainingGoal?: string; age?: string; height?: string; weight?: string; neck?: string; waist?: string; hip?: string; gender?: string; activityLevel?: string; trainingDays?: string; };
    step2: { days: DayState[]; };
    step3: { supplements: SupplementState[]; };
    step4: { generalNotes?: string; };
    lastUpdatedByAdmin?: string;
    lastSeenByClient?: string;
    hasPaid?: boolean;
    infoConfirmed?: boolean;
}

let currentStep = 1;
const totalSteps = 4;
let currentUser: string | null = null;
let ai: GoogleGenAI;


// --- DOM ELEMENTS ---
const authScreen = document.getElementById('user-selection-screen') as HTMLElement;
const mainAppContainer = document.getElementById('main-app-container') as HTMLElement;
const userDashboardContainer = document.getElementById('user-dashboard-container') as HTMLElement;
const adminPanelModal = document.getElementById('admin-panel-modal') as HTMLElement;
const adminPanelBtn = document.getElementById('admin-panel-btn') as HTMLButtonElement;


// --- FUNCTIONS ---

const sanitizeHTML = (str: string): string => {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const icon = type === 'success' ? 'check-circle' : 'alert-triangle';
    const colors = type === 'success' 
        ? 'bg-green-500 border-green-600' 
        : 'bg-red-500 border-red-600';

    toast.className = `flex items-center gap-3 ${colors} text-white py-3 px-5 rounded-lg shadow-xl border-b-4 transform opacity-0 translate-x-full`;
    toast.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    toast.innerHTML = `
        <i data-lucide="${icon}" class="w-6 h-6"></i>
        <span>${sanitizeHTML(message)}</span>
    `;

    container.appendChild(toast);
    window.lucide.createIcons();

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-x-full');
    });

    // Animate out and remove
    setTimeout(() => {
        toast.classList.add('opacity-0');
        toast.style.transform = 'translateX(120%)';
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 2000);
};

const updateSliderBackground = (slider: HTMLInputElement | null) => { 
    if (!slider) return; 
    const min = +slider.min || 0; 
    const max = +slider.max || 100; 
    const value = +slider.value || 0; 
    const percentage = ((value - min) / (max - min)) * 100; 
    let color = '#3B82F6'; 
    if (slider.classList.contains('rep-slider')) color = '#22C55E'; 
    if (slider.classList.contains('rest-slider')) color = '#A78BFA'; 
    if (slider.classList.contains('age-slider')) color = '#F97316'; 
    if (slider.classList.contains('height-slider')) color = '#EC4899'; 
    if (slider.classList.contains('weight-slider')) color = '#FBBF24';
    const trackColor = getComputedStyle(document.documentElement).getPropertyValue('--range-track-bg').trim();
    slider.style.background = `linear-gradient(to left, ${color} ${percentage}%, ${trackColor} ${percentage}%)`; 
};

const findNextEnabledStep = (start: number, direction: number) => { let next = start + direction; return (next > 0 && next <= totalSteps) ? next : start; };

const updateUI = () => {
    if (currentStep === 4) generateProgramPreview(document.getElementById('program-builder-form') as HTMLElement, '#program-sheet-container');
    document.querySelectorAll('.stepper-item').forEach((item, i) => { const step = i + 1; item.classList.toggle('active', step === currentStep); item.classList.toggle('completed', step < currentStep); });
    document.querySelectorAll('.form-section').forEach((section, i) => section.classList.toggle('active', (i + 1) === currentStep));
    (document.getElementById('prev-btn') as HTMLButtonElement).disabled = currentStep === 1;
    const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
    nextBtn.disabled = currentStep === totalSteps;
    nextBtn.textContent = (currentStep === totalSteps - 1) ? 'مشاهده پیش‌نمایش' : 'بعدی';
};

const navigateToStep = (step: number) => {
    if (step > 0 && step <= totalSteps) {
        currentStep = step;
        updateUI();
        document.getElementById('program-builder-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

const updateRealtimeVisualizers = (container: HTMLElement) => {
    const visualizersContainer = container.querySelector('.realtime-visualizers');
    if (!visualizersContainer) return;
    const bmiValueEl = container.querySelector('.bmi-input') as HTMLInputElement;
    if (!bmiValueEl) return;
    const bmiValue = parseFloat(bmiValueEl.value);
    let bmiHtml = '';
    if (!isNaN(bmiValue) && bmiValue > 0) {
        const minBmi = 15;
        const maxBmi = 40;
        let bmiPercentage = ((bmiValue - minBmi) / (maxBmi - minBmi)) * 100;
        bmiPercentage = Math.max(0, Math.min(100, bmiPercentage));
        let bmiCategory = 'نرمال', bmiCategoryClass = 'normal';
        if (bmiValue < 18.5) { bmiCategory = 'کمبود وزن'; bmiCategoryClass = 'underweight'; } 
        else if (bmiValue >= 25 && bmiValue < 30) { bmiCategory = 'اضافه وزن'; bmiCategoryClass = 'overweight'; } 
        else if (bmiValue >= 30) { bmiCategory = 'چاقی'; bmiCategoryClass = 'obese'; }
        const underweightWidth = ((18.5 - minBmi) / (maxBmi - minBmi)) * 100;
        const normalWidth = ((25 - 18.5) / (maxBmi - minBmi)) * 100;
        const overweightWidth = ((30 - 25) / (maxBmi - minBmi)) * 100;
        const obeseWidth = 100 - underweightWidth - normalWidth - overweightWidth;
        bmiHtml = `<div class="p-4 rounded-xl"><h3 class="font-bold text-lg mb-3 border-b border-border-primary pb-2 flex items-center gap-2"><i data-lucide="activity" class="text-purple-400"></i>شاخص توده بدنی (BMI)</h3><div class="bmi-visualizer"><div class="bmi-scale"><div class="bmi-segment" style="--color: #3b82f6; width: ${underweightWidth}%;"></div><div class="bmi-segment" style="--color: #22c55e; width: ${normalWidth}%;"></div><div class="bmi-segment" style="--color: #f97316; width: ${overweightWidth}%;"></div><div class="bmi-segment" style="--color: #ef4444; width: ${obeseWidth}%;"></div><div class="bmi-needle" style="--position: ${bmiPercentage}%;"><div class="bmi-value-box">${bmiValue.toFixed(1)}</div></div></div><div class="bmi-labels"><span>کمبود</span><span>نرمال</span><span>اضافه</span><span>چاقی</span></div><p class="bmi-status-text">وضعیت: <strong class="bmi-status-${bmiCategoryClass}">${bmiCategory}</strong></p></div></div>`;
    }

    let weightVisualizerHtml = '';
    const currentWeight = parseFloat((container.querySelector('.weight-slider') as HTMLInputElement).value);
    const idealWeightRangeEl = container.querySelector('.ideal-weight-input') as HTMLInputElement;
    if (!idealWeightRangeEl) {
        visualizersContainer.innerHTML = bmiHtml;
        window.lucide.createIcons();
        return;
    };
    const idealWeightRangeText = idealWeightRangeEl.value;
    if (idealWeightRangeText && idealWeightRangeText.includes(' - ')) {
        const [minIdeal, maxIdeal] = idealWeightRangeText.replace(' kg', '').split(' - ').map(parseFloat);
        if (!isNaN(currentWeight) && !isNaN(minIdeal) && !isNaN(maxIdeal)) {
            const scalePadding = 15;
            const scaleMin = Math.max(0, minIdeal - scalePadding);
            const scaleMax = maxIdeal + scalePadding;
            const scaleRange = scaleMax - scaleMin;
            let weightPercentage = ((currentWeight - scaleMin) / scaleRange) * 100;
            weightPercentage = Math.max(0, Math.min(100, weightPercentage));
            const underweightWidth = Math.max(0, ((minIdeal - scaleMin) / scaleRange) * 100);
            const idealWidth = Math.max(0, ((maxIdeal - minIdeal) / scaleRange) * 100);
            const overweightWidth = Math.max(0, 100 - underweightWidth - idealWidth);
            let weightCategory = 'ایده‌آل', weightCategoryClass = 'normal';
            if (currentWeight < minIdeal) { weightCategory = 'کمبود وزن'; weightCategoryClass = 'underweight'; }
            else if (currentWeight > maxIdeal) { weightCategory = 'اضافه وزن'; weightCategoryClass = 'overweight'; }
            weightVisualizerHtml = `<div class="p-4 rounded-xl"><h3 class="font-bold text-lg mb-3 border-b border-border-primary pb-2 flex items-center gap-2"><i data-lucide="scale" class="text-teal-400"></i>محدوده وزن ایده‌آل</h3><div class="weight-visualizer"><div class="weight-scale"><div class="weight-segment" style="--color: #3b82f6; width: ${underweightWidth}%;"></div><div class="weight-segment" style="--color: #22c55e; width: ${idealWidth}%;"></div><div class="weight-segment" style="--color: #f97316; width: ${overweightWidth}%;"></div><div class="weight-needle" style="--position: ${weightPercentage}%;"><div class="weight-value-box">${currentWeight.toFixed(1)} kg</div></div></div><div class="weight-labels"><span>${minIdeal.toFixed(1)}kg</span><span class="font-bold">ایده‌آل</span><span>${maxIdeal.toFixed(1)}kg</span></div><p class="weight-status-text">وضعیت: <strong class="weight-status-${weightCategoryClass}">${weightCategory}</strong></p></div></div>`;
        }
    }
    visualizersContainer.innerHTML = bmiHtml + weightVisualizerHtml;
    window.lucide.createIcons();
};

const calculateBodyMetrics = (container: HTMLElement) => {
    const age = parseFloat((container.querySelector('.age-slider') as HTMLInputElement).value);
    const heightCm = parseFloat((container.querySelector('.height-slider') as HTMLInputElement).value);
    const weightKg = parseFloat((container.querySelector('.weight-slider') as HTMLInputElement).value);
    const genderRadio = container.querySelector('.gender:checked') as HTMLInputElement;
    if (!genderRadio) return;
    const isMale = genderRadio.value === 'مرد';
    
    const activityRadioChecked = container.querySelector('.activity-level:checked') as HTMLInputElement;
    const activityMultiplier = activityRadioChecked ? parseFloat(activityRadioChecked.value) : 1.2; // Default to sedentary
    
    const neckCm = parseFloat((container.querySelector('.neck-input') as HTMLInputElement).value);
    const waistCm = parseFloat((container.querySelector('.waist-input') as HTMLInputElement).value);
    const hipCm = parseFloat((container.querySelector('.hip-input') as HTMLInputElement).value);

    const clearFields = () => {
        ['.bmi-input', '.bmr-input', '.tdee-input', '.bodyfat-input', '.lbm-input', '.ideal-weight-input'].forEach(cls => {
            const el = container.querySelector(cls) as HTMLInputElement;
            if (el) el.value = '';
        });
        const viz = container.querySelector('.realtime-visualizers') as HTMLElement;
        if (viz) viz.innerHTML = '';
    }

    if (isNaN(heightCm) || isNaN(weightKg) || heightCm <= 0 || weightKg <= 0) { clearFields(); return; }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const bmiInput = container.querySelector('.bmi-input') as HTMLInputElement;
    if (bmiInput) bmiInput.value = bmi.toFixed(1);

    const bmr = isMale ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5 : (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    const bmrInput = container.querySelector('.bmr-input') as HTMLInputElement;
    if (bmrInput) bmrInput.value = Math.round(bmr).toString();

    const tdeeInput = container.querySelector('.tdee-input') as HTMLInputElement;
    if (tdeeInput) {
        if (!isNaN(bmr) && !isNaN(activityMultiplier)) {
            tdeeInput.value = Math.round(bmr * activityMultiplier).toString();
        } else {
            tdeeInput.value = '';
        }
    }

    const idealWeightInput = container.querySelector('.ideal-weight-input') as HTMLInputElement;
    if (idealWeightInput) idealWeightInput.value = `${(18.5 * heightM * heightM).toFixed(1)} - ${(24.9 * heightM * heightM).toFixed(1)} kg`;

    let bodyFatPercentage = 0;
    if (!isNaN(neckCm) && !isNaN(waistCm) && neckCm > 0 && waistCm > 0) {
        if (isMale) bodyFatPercentage = 86.010 * Math.log10(waistCm - neckCm) - 70.041 * Math.log10(heightCm) + 36.76;
        else if (!isNaN(hipCm) && hipCm > 0) bodyFatPercentage = 163.205 * Math.log10(waistCm + hipCm - neckCm) - 97.684 * Math.log10(heightCm) - 78.387;
    }

    const bodyfatInput = container.querySelector('.bodyfat-input') as HTMLInputElement;
    const lbmInput = container.querySelector('.lbm-input') as HTMLInputElement;

    if (bodyFatPercentage > 0 && bodyFatPercentage < 100) {
        if (bodyfatInput) bodyfatInput.value = bodyFatPercentage.toFixed(1);
        if (lbmInput) lbmInput.value = (weightKg * (1 - bodyFatPercentage / 100)).toFixed(1);
    } else {
        if (bodyfatInput) bodyfatInput.value = '';
        if (lbmInput) lbmInput.value = '';
    }

    updateRealtimeVisualizers(container);
};


const toggleHipInput = (container: HTMLElement) => {
    const hipInput = container.querySelector('.hip-input-container') as HTMLElement;
    if (!hipInput) return;
    const maleRadio = container.querySelector('.gender[value="مرد"]') as HTMLInputElement;
    hipInput.classList.toggle('hidden', maleRadio.checked);
    calculateBodyMetrics(container);
};
const populateMuscleGroups = (select: HTMLSelectElement) => { select.innerHTML = ''; Object.keys(exerciseDB).forEach(group => { const option = document.createElement('option'); option.value = group; option.textContent = group; select.appendChild(option); }); };
const populateExercises = (group: string, select: HTMLSelectElement) => { select.innerHTML = ''; (exerciseDB[group] || []).forEach(name => { const option = document.createElement('option'); option.value = name; option.textContent = name; select.appendChild(option); }); };
const addExerciseRow = (list: HTMLElement) => { const newRow = (document.getElementById('exercise-template') as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment; const muscleSelect = newRow.querySelector('.muscle-group-select') as HTMLSelectElement; populateMuscleGroups(muscleSelect); populateExercises(muscleSelect.value, newRow.querySelector('.exercise-select') as HTMLSelectElement); list.appendChild(newRow); list.querySelectorAll('.range-slider').forEach(slider => updateSliderBackground(slider as HTMLInputElement)); window.lucide.createIcons(); };
const addDayCard = (isFirst = false) => { const dayCount = (document.getElementById('workout-days-container') as HTMLElement).children.length + 1; const newDay = document.createElement('div'); newDay.className = 'card rounded-lg day-card'; newDay.innerHTML = `<div class="flex justify-between items-center p-4 bg-tertiary/50 rounded-t-lg border-b border-border-secondary"><div class="flex items-center gap-3"><i data-lucide="calendar-days" class="text-yellow-400"></i><input type="text" value="روز ${dayCount}: " class="day-title-input input-field font-bold text-lg bg-transparent border-0 p-1 focus:ring-0 focus:border-yellow-400 w-auto"></div> ${!isFirst ? '<button type="button" class="remove-day-btn p-1 text-secondary hover:text-red-400"><i data-lucide="x-circle" class="w-5 h-5"></i></button>' : ''}</div><div class="p-4 space-y-3"><div class="exercise-list space-y-3"></div><button type="button" class="add-exercise-btn mt-2 w-full text-sm text-yellow-400 font-semibold hover:bg-yellow-400/10 py-2.5 px-4 rounded-lg border-2 border-dashed border-yellow-400/30 transition-all flex items-center justify-center gap-2"><i data-lucide="plus"></i> افزودن حرکت</button></div><div class="p-4 border-t border-border-primary/50"><label class="font-semibold text-sm text-secondary mb-2 block">یادداشت‌های مربی</label><textarea class="day-notes-input input-field text-sm bg-tertiary/50" rows="2" placeholder="مثال: روی فرم صحیح حرکت تمرکز کنید..."></textarea></div>`; (document.getElementById('workout-days-container') as HTMLElement).appendChild(newDay); addExerciseRow(newDay.querySelector('.exercise-list') as HTMLElement); window.lucide.createIcons(); };
const populateSupplements = () => { const container = document.getElementById('supplements-container') as HTMLElement; container.innerHTML = '';  for (const category in supplementDB) { const card = document.createElement('div'); card.className = 'supp-category-card bg-tertiary/50 rounded-lg overflow-hidden'; card.innerHTML = `<h3 class="font-bold p-4 border-b border-border-secondary text-blue-400">${category}</h3><div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"></div>`; const listContainer = card.querySelector('.grid') as HTMLElement; supplementDB[category].forEach(item => { const wrapper = document.createElement('div'); wrapper.className = "supplement-item flex items-center justify-between"; wrapper.innerHTML = `<label class="custom-checkbox-label"><input type="checkbox" value="${item.name}" data-dosage="${item.dosage}" data-note="${item.note}" class="supplement-checkbox custom-checkbox"><span>${item.name}</span></label><div class="flex items-center gap-2"><div class="tooltip"><i data-lucide="info" class="w-4 h-4 text-gray-500 cursor-pointer"></i><span class="tooltiptext">${item.note}</span></div><i data-lucide="pill" class="w-5 h-5 text-gray-400 flex-shrink-0"></i><input type="text" class="dosage-input input-field text-sm w-32" placeholder="دوز..."></div>`; listContainer.appendChild(wrapper); }); container.appendChild(card); } window.lucide.createIcons(); };

const generateProgramPreview = (dataSourceContainer: HTMLElement, targetContainerSelector: string) => {
    const container = document.querySelector(targetContainerSelector) as HTMLElement;
    if (!container) return;
    container.innerHTML = '';
    const pageElement = document.createElement('div');
    pageElement.className = 'program-page';
    
    const s1Container = dataSourceContainer.id === 'program-builder-form' ? document.getElementById('section-1')! : dataSourceContainer;
    
    const clientName = sanitizeHTML((s1Container.querySelector('.client-name-input') as HTMLInputElement).value || 'نامشخص');
    const coachName = sanitizeHTML((document.getElementById('coach-name-input') as HTMLInputElement)?.value || 'مربی شما');
    const profileSrc = (s1Container.querySelector('.profile-pic-preview') as HTMLImageElement).src;
    const headerHtml = `<header class="page-header flex justify-between items-start mb-6"><div class="flex items-center gap-3"><span class="font-bold text-2xl text-amber-500">FitGym Pro</span></div><img src="${profileSrc}" alt="Profile" class="w-20 h-20 rounded-full object-cover border-4 border-gray-100"></header><div class="mb-6"><h2 class="text-3xl font-extrabold text-gray-900 mb-2">${clientName}</h2><p class="text-gray-500">تهیه شده در تاریخ: ${new Date().toLocaleDateString('fa-IR')}</p></div>`;
    pageElement.innerHTML = `${headerHtml}<div class="page-content"></div><footer class="page-footer"><p>این برنامه توسط <strong>${coachName}</strong> برای شما آماده شده است. موفق باشید!</p></footer>`;
    container.appendChild(pageElement);
    const currentPage = pageElement.querySelector('.page-content') as HTMLElement;
    const appendContent = (html: string) => { const tempDiv = document.createElement('div'); tempDiv.innerHTML = html; const element = tempDiv.firstElementChild; if (element) currentPage.appendChild(element); };
    const vitals = { 'سن': `${(s1Container.querySelector('.age-slider') as HTMLInputElement).value}`, 'قد': `${(s1Container.querySelector('.height-slider') as HTMLInputElement).value} cm`, 'وزن': `${(s1Container.querySelector('.weight-slider') as HTMLInputElement).value} kg`, 'BMI': (s1Container.querySelector('.bmi-input') as HTMLInputElement).value || '-', 'چربی بدن': `${(s1Container.querySelector('.bodyfat-input') as HTMLInputElement).value || '-'} %`, 'BMR': `${(s1Container.querySelector('.bmr-input') as HTMLInputElement).value || '-'} kcal`, 'TDEE': `${(s1Container.querySelector('.tdee-input') as HTMLInputElement).value || '-'} kcal`, 'توده بدون چربی': `${(s1Container.querySelector('.lbm-input') as HTMLInputElement)?.value || '-'} kg` };
    let vitalsHtml = Object.entries(vitals).map(([key, value]) => `<div><span>${key}</span><strong>${value}</strong></div>`).join('');
    appendContent(`<div class="mb-6"><h3 class="preview-section-header"><i data-lucide="clipboard-list"></i>شاخص‌های کلیدی</h3><div class="preview-vitals-grid">${vitalsHtml}</div></div>`);
    const visualizersContainer = (s1Container.querySelector('.realtime-visualizers') as HTMLElement).cloneNode(true) as HTMLElement;
    visualizersContainer.querySelectorAll('.card').forEach(c => c.classList.remove('card'));
    if (visualizersContainer.innerHTML.trim() !== "") appendContent(`<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-6">${visualizersContainer.innerHTML}</div>`);
    
    const dayCards = document.querySelectorAll('#workout-days-container .day-card');
    const daysWithExercises = Array.from(dayCards).filter(d => d.querySelector('.exercise-row'));
    if (daysWithExercises.length > 0) {
        appendContent('<div class="day-separator"></div>');
        appendContent(`<div class="mb-4 mt-4"><h3 class="preview-section-header"><i data-lucide="dumbbell"></i>برنامه تمرینی</h3></div>`);
        daysWithExercises.forEach((card, index) => {
            const dayTitle = sanitizeHTML((card.querySelector('.day-title-input') as HTMLInputElement).value);
            let exercisesTable = `<div class="overflow-x-auto rounded-lg border border-border-primary"><table class="preview-table-pro w-full"><thead><tr><th>حرکت (Exercise)</th><th>ست (Sets)</th><th>تکرار (Reps)</th><th>استراحت (Rest)</th></tr></thead><tbody>`;
            const exercises = Array.from(card.querySelectorAll('.exercise-row'));
            for (let i = 0; i < exercises.length; i++) {
                const ex = exercises[i];
                const isSuperset = ex.classList.contains('is-superset');
                const isFirstInGroup = isSuperset && (i === 0 || !exercises[i-1].classList.contains('is-superset'));
                exercisesTable += `<tr class="${isSuperset ? 'superset-group-pro' : ''}"><td>${isFirstInGroup ? '<span class="superset-label-pro">سوپرست</span>' : ''}${(ex.querySelector('.exercise-select') as HTMLSelectElement).value}</td><td>${ex.querySelector('.set-value')?.textContent}</td><td>${ex.querySelector('.rep-value')?.textContent}</td><td>${ex.querySelector('.rest-value')?.textContent}</td></tr>`;
            }
            exercisesTable += `</tbody></table></div>`;
            const notes = sanitizeHTML((card.querySelector('.day-notes-input') as HTMLTextAreaElement).value);
            const dayHtml = `<div><h4 class="font-bold text-lg text-gray-800 mb-2">${dayTitle}</h4>${exercisesTable}${notes ? `<div class="preview-notes-pro mt-3"><strong>یادداشت:</strong> ${notes}</div>` : ''}</div>`;
            appendContent(dayHtml);
            if (index < daysWithExercises.length - 1) appendContent('<div class="day-separator"></div>');
        });
    }
    const generalNotes = (document.getElementById('general-notes-input') as HTMLTextAreaElement).value;
    if (generalNotes) appendContent(`<div class="mt-6"><h3 class="preview-section-header"><i data-lucide="clipboard-edit"></i>توصیه‌های کلی مربی</h3><div class="preview-notes-pro">${sanitizeHTML(generalNotes).replace(/\n/g, '<br>')}</div></div>`);
    const checkedSupps = document.querySelectorAll('.supplement-checkbox:checked');
    if (checkedSupps.length > 0) {
        let supplementsTable = `<div class="mt-6"><h3 class="preview-section-header"><i data-lucide="pill"></i>برنامه مکمل‌ها</h3><div class="overflow-x-auto rounded-lg border border-border-primary"><table class="preview-table-pro mx-auto" style="min-width: 500px;"><thead><tr><th>مکمل / ویتامین</th><th style="width: 200px;">دستور مصرف</th></tr></thead><tbody>`;
        checkedSupps.forEach(sup => {
            const dosage = sanitizeHTML((sup.closest('.supplement-item')?.querySelector('.dosage-input') as HTMLInputElement).value || 'طبق دستور');
            const supName = sanitizeHTML((sup as HTMLInputElement).value);
            supplementsTable += `<tr><td>${supName}</td><td style="text-align: center;">${dosage}</td></tr>`;
        });
        supplementsTable += `</tbody></table></div>`;
        appendContent(supplementsTable);
    }
    window.lucide.createIcons();
};


const saveAsPdf = async () => {
    const pdfBtn = document.querySelector('.is-loading');
    if (pdfBtn) return;
    
    const activePdfBtn = (document.getElementById('save-pdf-btn')?.offsetParent !== null)
        ? document.getElementById('save-pdf-btn') as HTMLButtonElement
        : document.getElementById('dashboard-save-pdf-btn') as HTMLButtonElement;
    
    activePdfBtn.classList.add('is-loading');
    activePdfBtn.disabled = true;

    const pageSelector = currentUser === 'admin' ? '#program-sheet-container .program-page' : '#dashboard-program-view .program-page';
    const originalPage = document.querySelector(pageSelector) as HTMLElement;

    if (!originalPage) {
        showToast('محتوایی برای ساخت PDF وجود ندارد.', 'error');
        activePdfBtn.classList.remove('is-loading');
        activePdfBtn.disabled = false;
        return;
    }

    const clone = originalPage.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute'; clone.style.top = '0'; clone.style.left = '-9999px'; clone.style.width = originalPage.offsetWidth + 'px'; clone.style.height = 'auto';
    document.body.appendChild(clone);
    await new Promise(resolve => setTimeout(resolve, 50));
    try {
        const canvas = await window.html2canvas(clone, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
        document.body.removeChild(clone);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfPageWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = canvas.height * pdfPageWidth / canvas.width;
        let heightLeft = imgHeight, position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, imgHeight); heightLeft -= pdfPageHeight;
        while (heightLeft > 0) { position -= pdfPageHeight; pdf.addPage(); pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, imgHeight); heightLeft -= pdfPageHeight; }
        const clientName = (document.querySelector(currentUser === 'admin' ? '#client-name-input' : '.client-name-input') as HTMLInputElement).value || 'FitGymPro';
        pdf.save(`FitGymPro-Program-${clientName.replace(/ /g, '_')}.pdf`);
    } catch(error) {
        console.error("Failed to generate PDF:", error);
        showToast("خطا در هنگام ساخت فایل PDF رخ داد.", "error");
        if (document.body.contains(clone)) document.body.removeChild(clone);
    } finally {
        activePdfBtn.classList.remove('is-loading');
        activePdfBtn.disabled = false;
    }
};

const saveAsWord = () => {
    const pageContent = document.querySelector('.program-page') as HTMLElement;
    if (!pageContent) { showToast('محتوایی برای ذخیره وجود ندارد.', 'error'); return; }
    const fullHtmlContent = pageContent.innerHTML;
    const clientName = (document.getElementById('client-name-input') as HTMLInputElement).value || 'FitGymPro-Program';
    const filename = `${clientName.replace(/ /g, '_')}.doc`;
    const fullHtml = `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>Program</title><style>body{font-family: Arial, sans-serif; direction: rtl; text-align: right; margin: 2cm;} table{width: 100%; border-collapse: collapse; margin-bottom: 1rem;} th, td{border: 1px solid #ddd; padding: 8px;} th{background-color: #f2f2f2;} .page-footer p { page-break-before: always; } </style></head><body>${fullHtmlContent}</body></html>`;
    const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename; document.body.appendChild(link);
    link.click(); document.body.removeChild(link);
};

const sendProgramToUser = () => {
    const clientNameInput = document.getElementById('client-name-input') as HTMLInputElement;
    const clientName = clientNameInput.value.trim();

    if (!clientName) {
        showToast('لطفاً نام شاگرد را در گام اول مشخص کنید.', 'error');
        navigateToStep(1);
        clientNameInput.focus();
        clientNameInput.classList.add('input-error');
        setTimeout(() => clientNameInput.classList.remove('input-error'), 3000);
        return;
    }

    const users = getUsers();
    if (!users.some((u: any) => u.username === clientName)) {
        showToast(`کاربری با نام «${clientName}» وجود ندارد.`, 'error');
        return;
    }
    
    const existingData = getUserData(clientName);
    const newProgramState = getAppState();
    
    const finalState = {
        ...existingData,
        ...newProgramState,
        lastUpdatedByAdmin: new Date().toISOString(),
    };

    saveUserData(clientName, finalState);
    logActivity(`برنامه برای ${clientName} ارسال شد`);
    showToast(`برنامه با موفقیت برای کاربر «${clientName}» ارسال شد.`);
};

const saveProgramChanges = () => {
    const clientNameInput = document.getElementById('client-name-input') as HTMLInputElement;
    const clientName = clientNameInput.value.trim();

    if (!clientName) {
        showToast('لطفاً نام شاگرد را برای ذخیره کردن مشخص کنید.', 'error');
        navigateToStep(1);
        clientNameInput.focus();
        clientNameInput.classList.add('input-error');
        setTimeout(() => clientNameInput.classList.remove('input-error'), 3000);
        return;
    }
    
    const existingData = getUserData(clientName);
    const newProgramState = getAppState();

    const finalState = {
        ...existingData,
        ...newProgramState,
        lastUpdatedByAdmin: new Date().toISOString()
    };
    saveUserData(clientName, finalState);
    logActivity(`تغییرات برنامه ${clientName} ذخیره شد`);
    showToast(`تغییرات با موفقیت برای «${clientName}» ذخیره شد.`);
};

// --- User Management & Data Persistence ---

const getUsers = () => JSON.parse(localStorage.getItem('fitgympro_users') || '[]');
const saveUsers = (users: any[]) => localStorage.setItem('fitgympro_users', JSON.stringify(users));
const getUserData = (username: string): AppState => JSON.parse(localStorage.getItem(`fitgympro_data_${username}`) || '{}');
const saveUserData = (username: string, data: AppState) => localStorage.setItem(`fitgympro_data_${username}`, JSON.stringify(data));
const getActivityLog = () => JSON.parse(localStorage.getItem('fitgympro_activity_log') || '[]');
const logActivity = (message: string) => { 
    let log = getActivityLog(); 
    log.unshift({ message, date: new Date().toISOString() }); 
    if (log.length > 20) log = log.slice(0, 20); 
    localStorage.setItem('fitgympro_activity_log', JSON.stringify(log));
};

function getAppState(): AppState {
    const appState: AppState = {
        step1: {},
        step2: { days: [] },
        step3: { supplements: [] },
        step4: {}
    };
    
    const s1Container = document.getElementById('section-1')!;

    // Step 1 data
    appState.step1.clientName = (s1Container.querySelector('.client-name-input') as HTMLInputElement).value;
    appState.step1.clientEmail = (s1Container.querySelector('.client-email-input') as HTMLInputElement).value;
    appState.step1.coachName = (s1Container.querySelector('.coach-name-input') as HTMLInputElement).value;
    appState.step1.profilePic = (s1Container.querySelector('.profile-pic-preview') as HTMLImageElement).src;
    appState.step1.trainingGoal = (s1Container.querySelector('.training-goal:checked') as HTMLInputElement)?.value;
    appState.step1.age = (s1Container.querySelector('.age-slider') as HTMLInputElement).value;
    appState.step1.height = (s1Container.querySelector('.height-slider') as HTMLInputElement).value;
    appState.step1.weight = (s1Container.querySelector('.weight-slider') as HTMLInputElement).value;
    appState.step1.neck = (s1Container.querySelector('.neck-input') as HTMLInputElement).value;
    appState.step1.waist = (s1Container.querySelector('.waist-input') as HTMLInputElement).value;
    appState.step1.hip = (s1Container.querySelector('.hip-input') as HTMLInputElement).value;
    appState.step1.gender = (s1Container.querySelector('.gender:checked') as HTMLInputElement)?.value;
    appState.step1.activityLevel = (s1Container.querySelector('.activity-level:checked') as HTMLInputElement)?.value;
    appState.step1.trainingDays = (s1Container.querySelector('.training-days:checked') as HTMLInputElement)?.value;

    // Step 2 data
    document.querySelectorAll('#workout-days-container .day-card').forEach(dayCard => {
        const dayData: DayState = {
            title: (dayCard.querySelector('.day-title-input') as HTMLInputElement).value,
            notes: (dayCard.querySelector('.day-notes-input') as HTMLTextAreaElement).value,
            exercises: []
        };
        dayCard.querySelectorAll('.exercise-row').forEach(exRow => {
            dayData.exercises.push({
                muscle: (exRow.querySelector('.muscle-group-select') as HTMLSelectElement).value,
                exercise: (exRow.querySelector('.exercise-select') as HTMLSelectElement).value,
                sets: (exRow.querySelector('.set-slider') as HTMLInputElement).value,
                reps: (exRow.querySelector('.rep-slider') as HTMLInputElement).value,
                rest: (exRow.querySelector('.rest-slider') as HTMLInputElement).value,
                isSuperset: exRow.classList.contains('is-superset')
            });
        });
        appState.step2.days.push(dayData);
    });

    // Step 3 data
    document.querySelectorAll('.supplement-checkbox:checked').forEach(cb => {
        appState.step3.supplements.push({
            name: (cb as HTMLInputElement).value,
            dosage: (cb.closest('.supplement-item')?.querySelector('.dosage-input') as HTMLInputElement).value
        });
    });
    
    // Step 4 data
    appState.step4.generalNotes = (document.getElementById('general-notes-input') as HTMLTextAreaElement).value;

    return appState;
}

function loadStateIntoApp(state: AppState) {
    // Reset form first
    (document.getElementById('program-builder-form') as HTMLFormElement).reset();
    (document.getElementById('workout-days-container') as HTMLElement).innerHTML = '';
    
    const s1Container = document.getElementById('section-1')!;

    // Step 1
    const s1 = state.step1 || {};
    (s1Container.querySelector('.client-name-input') as HTMLInputElement).value = s1.clientName || '';
    (s1Container.querySelector('.client-email-input') as HTMLInputElement).value = s1.clientEmail || '';
    (s1Container.querySelector('.coach-name-input') as HTMLInputElement).value = s1.coachName || '';
    (s1Container.querySelector('.profile-pic-preview') as HTMLImageElement).src = s1.profilePic || 'https://placehold.co/100x100/374151/E5E7EB?text=عکس';
    if (s1.trainingGoal) {
        const goalRadio = s1Container.querySelector(`.training-goal[value="${s1.trainingGoal}"]`) as HTMLInputElement;
        if(goalRadio) goalRadio.checked = true;
    }
    (s1Container.querySelector('.age-slider') as HTMLInputElement).value = s1.age || '25';
    (s1Container.querySelector('.height-slider') as HTMLInputElement).value = s1.height || '180';
    (s1Container.querySelector('.weight-slider') as HTMLInputElement).value = s1.weight || '80';
    (s1Container.querySelector('.neck-input') as HTMLInputElement).value = s1.neck || '';
    (s1Container.querySelector('.waist-input') as HTMLInputElement).value = s1.waist || '';
    (s1Container.querySelector('.hip-input') as HTMLInputElement).value = s1.hip || '';
    if (s1.gender) {
        const genderRadio = s1Container.querySelector(`.gender[value="${s1.gender}"]`) as HTMLInputElement;
        if(genderRadio) genderRadio.checked = true;
    }
    if (s1.activityLevel) {
        const activityRadio = s1Container.querySelector(`.activity-level[value="${s1.activityLevel}"]`) as HTMLInputElement;
        if (activityRadio) activityRadio.checked = true;
    }
    if (s1.trainingDays) {
        const daysRadio = s1Container.querySelector(`.training-days[value="${s1.trainingDays}"]`) as HTMLInputElement;
        if (daysRadio) daysRadio.checked = true;
    }

    // Step 2
    const s2 = state.step2 || { days: [] };
    if (s2.days && s2.days.length > 0) {
        s2.days.forEach((day, dayIndex) => {
            addDayCard(dayIndex === 0);
            const dayCard = document.querySelector(`#workout-days-container .day-card:nth-child(${dayIndex + 1})`) as HTMLElement;
            (dayCard.querySelector('.day-title-input') as HTMLInputElement).value = day.title;
            (dayCard.querySelector('.day-notes-input') as HTMLTextAreaElement).value = day.notes;
            const exList = dayCard.querySelector('.exercise-list') as HTMLElement;
            exList.innerHTML = '';
            day.exercises.forEach(ex => {
                addExerciseRow(exList);
                const exRow = exList.lastElementChild as HTMLElement;
                const muscleSelect = exRow.querySelector('.muscle-group-select') as HTMLSelectElement;
                const exerciseSelect = exRow.querySelector('.exercise-select') as HTMLSelectElement;
                muscleSelect.value = ex.muscle;
                populateExercises(ex.muscle, exerciseSelect);
                exerciseSelect.value = ex.exercise;
                (exRow.querySelector('.set-slider') as HTMLInputElement).value = ex.sets;
                (exRow.querySelector('.rep-slider') as HTMLInputElement).value = ex.reps;
                (exRow.querySelector('.rest-slider') as HTMLInputElement).value = ex.rest;
                if (ex.isSuperset) {
                    exRow.classList.add('is-superset');
                    exRow.querySelector('.superset-btn')?.classList.add('active');
                }
            });
        });
    } else {
        addDayCard(true); // Add one default day if none exist
    }

    // Step 3
    const s3 = state.step3 || { supplements: [] };
    document.querySelectorAll('.supplement-checkbox').forEach(cb => (cb as HTMLInputElement).checked = false);
    if(s3.supplements) {
        s3.supplements.forEach(sup => {
            const checkbox = document.querySelector(`.supplement-checkbox[value="${sup.name}"]`) as HTMLInputElement;
            if (checkbox) {
                checkbox.checked = true;
                (checkbox.closest('.supplement-item')?.querySelector('.dosage-input') as HTMLInputElement).value = sup.dosage;
            }
        });
    }

    // Step 4
    (document.getElementById('general-notes-input') as HTMLTextAreaElement).value = (state.step4 || {}).generalNotes || '';

    // Final UI updates for Admin form
    document.querySelectorAll('#program-builder-form .range-slider').forEach(s => {
        updateSliderBackground(s as HTMLInputElement);
        const event = new Event('input', { bubbles: true });
        s.dispatchEvent(event);
    });
    toggleHipInput(s1Container);
    calculateBodyMetrics(s1Container);
    currentStep = 1;
    updateUI();
}

function saveCurrentState() {
    if (currentUser && currentUser === 'admin') {
        const clientName = (document.getElementById('client-name-input') as HTMLInputElement).value;
        if (clientName) {
            const existingData = getUserData(clientName);
            const newProgramData = getAppState();
            const mergedState = { ...existingData, ...newProgramData };
            saveUserData(clientName, mergedState);
        }
    }
}

function loginAsAdmin() {
    currentUser = 'admin';
    localStorage.setItem('fitgympro_last_user', 'admin');
    loadStateIntoApp({ step1: { coachName: "مربی فیت‌جیم‌پرو" }, step2: { days: [] }, step3: { supplements: [] }, step4: {} });

    (document.getElementById('current-user-name') as HTMLElement).textContent = "Admin";
    const currentUserDisplay = document.getElementById('current-user-display') as HTMLElement;
    currentUserDisplay.classList.remove('hidden');
    currentUserDisplay.classList.add('flex');
    (document.getElementById('logout-btn') as HTMLElement).classList.remove('hidden');
    adminPanelBtn.classList.remove('hidden');

    authScreen.classList.add('opacity-0');
    setTimeout(() => authScreen.classList.add('hidden'), 300);

    mainAppContainer.classList.remove('hidden');
    setTimeout(() => mainAppContainer.classList.remove('opacity-0'), 50);
}

function populateDashboard(username: string, state: AppState) {
    const dashboard = document.getElementById('user-dashboard-container')!;
    const profilePanel = document.getElementById('dashboard-profile-panel')!;
    const statusContainer = document.getElementById('dashboard-status-container') as HTMLElement;
    
    // Populate status
    statusContainer.innerHTML = '';
    const hasPaid = state.hasPaid ?? false;
    const infoConfirmed = state.infoConfirmed ?? false;
    
    const paymentStatusEl = document.createElement('div');
    paymentStatusEl.className = `flex items-center gap-3 p-3 rounded-lg ${hasPaid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`;
    paymentStatusEl.innerHTML = `<i data-lucide="${hasPaid ? 'check-circle' : 'alert-circle'}" class="w-6 h-6"></i><div><p class="font-bold">وضعیت پرداخت</p><p class="text-sm">${hasPaid ? 'پرداخت شده' : 'پرداخت نشده'}</p></div>`;
    statusContainer.appendChild(paymentStatusEl);

    const infoStatusEl = document.createElement('div');
    infoStatusEl.className = `flex items-center gap-3 p-3 rounded-lg ${infoConfirmed ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`;
    infoStatusEl.innerHTML = `<i data-lucide="${infoConfirmed ? 'user-check' : 'user-cog'}" class="w-6 h-6"></i><div><p class="font-bold">وضعیت اطلاعات</p><p class="text-sm">${infoConfirmed ? 'تایید شده' : 'نیاز به تایید'}</p></div>`;
    statusContainer.appendChild(infoStatusEl);
    
    // Populate profile panel with user data
    const s1 = state.step1 || {};
    (profilePanel.querySelector('.client-name-input') as HTMLInputElement).value = username;
    (profilePanel.querySelector('.client-email-input') as HTMLInputElement).value = s1.clientEmail || '';
    (profilePanel.querySelector('.profile-pic-preview') as HTMLImageElement).src = s1.profilePic || 'https://placehold.co/100x100/374151/E5E7EB?text=عکس';
    if (s1.trainingGoal) {
        const goalRadio = profilePanel.querySelector(`.training-goal[value="${s1.trainingGoal}"]`) as HTMLInputElement;
        if (goalRadio) goalRadio.checked = true;
    }
    (profilePanel.querySelector('.age-slider') as HTMLInputElement).value = s1.age || '25';
    (profilePanel.querySelector('.height-slider') as HTMLInputElement).value = s1.height || '180';
    (profilePanel.querySelector('.weight-slider') as HTMLInputElement).value = s1.weight || '80';
    (profilePanel.querySelector('.neck-input') as HTMLInputElement).value = s1.neck || '';
    (profilePanel.querySelector('.waist-input') as HTMLInputElement).value = s1.waist || '';
    (profilePanel.querySelector('.hip-input') as HTMLInputElement).value = s1.hip || '';
    if (s1.gender) {
        const genderRadio = profilePanel.querySelector(`.gender[value="${s1.gender}"]`) as HTMLInputElement;
        if (genderRadio) genderRadio.checked = true;
    } else { // Default to male if nothing is set
        (profilePanel.querySelector('.gender[value="مرد"]') as HTMLInputElement).checked = true;
    }
    if (s1.activityLevel) {
        const activityRadio = profilePanel.querySelector(`.activity-level[value="${s1.activityLevel}"]`) as HTMLInputElement;
        if (activityRadio) activityRadio.checked = true;
    }
    if (s1.trainingDays) {
        const daysRadio = profilePanel.querySelector(`.training-days[value="${s1.trainingDays}"]`) as HTMLInputElement;
        if (daysRadio) daysRadio.checked = true;
    }

    // Trigger updates
    profilePanel.querySelectorAll('.range-slider').forEach(s => {
        updateSliderBackground(s as HTMLInputElement);
        const event = new Event('input', { bubbles: true });
        s.dispatchEvent(event);
    });
    toggleHipInput(profilePanel);
    calculateBodyMetrics(profilePanel);

    // Generate and display the program preview for the user
    generateProgramPreview(profilePanel, '#dashboard-program-view');
    
    (document.getElementById('dashboard-welcome-message') as HTMLElement).textContent = `خوش آمدی، ${username}!`;
    window.lucide.createIcons();
}


function loginAsUser(username: string) {
    currentUser = username;
    localStorage.setItem('fitgympro_last_user', username);

    const userData = getUserData(username);
    if(!userData.step1) {
        userData.step1 = { clientName: username };
        saveUserData(username, userData);
    }
    
    populateDashboard(username, userData);

    authScreen.classList.add('opacity-0');
    setTimeout(() => authScreen.classList.add('hidden'), 300);
    
    userDashboardContainer.classList.remove('hidden');
    setTimeout(() => userDashboardContainer.classList.remove('opacity-0'), 50);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('fitgympro_last_user');
    
    mainAppContainer.classList.add('opacity-0');
    userDashboardContainer.classList.add('opacity-0');
    
    setTimeout(() => {
        mainAppContainer.classList.add('hidden');
        userDashboardContainer.classList.add('hidden');
        
        authScreen.classList.remove('hidden');
        setTimeout(() => {
            authScreen.classList.remove('opacity-0');
        }, 50);
    }, 300);

    // Reset auth screen to default state
    document.getElementById('login-tab-btn')?.classList.add('active');
    document.getElementById('signup-tab-btn')?.classList.remove('active');
    document.getElementById('login-form-container')?.classList.remove('hidden');
    document.getElementById('signup-form-container')?.classList.add('hidden');
    (document.getElementById('login-form') as HTMLFormElement)?.reset();
    (document.getElementById('signup-form') as HTMLFormElement)?.reset();
}

const populateAdminUserList = () => {
    const userListContainer = document.getElementById('admin-user-list') as HTMLElement;
    if (!userListContainer) return;
    const users = getUsers().filter((u: any) => u.username !== 'admin');
    
    userListContainer.innerHTML = '';
    if (users.length === 0) {
        userListContainer.innerHTML = `<p class="text-secondary text-center col-span-full">هنوز هیچ شاگردی ثبت‌نام نکرده است.</p>`;
        return;
    }
    
    users.forEach((user: any) => {
        const card = document.createElement('div');
        card.className = 'flex items-center justify-between p-3 rounded-lg hover:bg-tertiary/50 transition-colors';
        card.dataset.username = user.username;

        card.innerHTML = `
            <div class="flex items-center gap-3">
                <img src="${getUserData(user.username).step1?.profilePic || 'https://placehold.co/40x40/374151/E5E7EB?text=?'}" class="w-10 h-10 rounded-full object-cover">
                <div>
                    <p class="font-bold">${user.username}</p>
                    <p class="text-xs text-secondary">${user.email}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button class="load-user-btn secondary-button text-xs font-bold py-1 px-3 rounded-md" data-username="${user.username}">بارگذاری</button>
                <button class="remove-user-btn text-red-500 hover:bg-red-500/10 p-2 rounded-md" data-username="${user.username}" title="حذف کاربر"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        `;
        userListContainer.appendChild(card);
    });
    window.lucide.createIcons();
};

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial setup
    window.lucide.createIcons();
    const theme = localStorage.getItem('fitgympro_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    
    // Check for last logged-in user
    const lastUser = localStorage.getItem('fitgympro_last_user');
    if (lastUser) {
        if (lastUser === 'admin') {
            loginAsAdmin();
        } else if (getUsers().some((u: any) => u.username === lastUser)) {
            loginAsUser(lastUser);
        }
    }
    
    // --- Auth Screen Tab Switcher ---
    const loginTabBtn = document.getElementById('login-tab-btn');
    const signupTabBtn = document.getElementById('signup-tab-btn');
    const loginFormContainer = document.getElementById('login-form-container');
    const signupFormContainer = document.getElementById('signup-form-container');
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const signupForm = document.getElementById('signup-form') as HTMLFormElement;

    const switchToLogin = () => {
        loginTabBtn?.classList.add('active');
        signupTabBtn?.classList.remove('active');
        loginFormContainer?.classList.remove('hidden');
        signupFormContainer?.classList.add('hidden');
        if (signupForm) signupForm.reset();
    };

    const switchToSignup = () => {
        loginTabBtn?.classList.remove('active');
        signupTabBtn?.classList.add('active');
        loginFormContainer?.classList.add('hidden');
        signupFormContainer?.classList.remove('hidden');
        if (loginForm) loginForm.reset();
    };

    loginTabBtn?.addEventListener('click', switchToLogin);
    signupTabBtn?.addEventListener('click', switchToSignup);

    // --- Authentication Form Handlers ---
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = (document.getElementById('login-username') as HTMLInputElement).value.trim();
        const password = (document.getElementById('login-password') as HTMLInputElement).value;
        
        if (!username || !password) {
            showToast('لطفا نام کاربری و رمز عبور را وارد کنید.', 'error');
            return;
        }
        
        if (username.toLowerCase() === 'admin' && password === 'hamid@@##') {
            loginAsAdmin();
            return;
        }
        
        const users = getUsers();
        const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
        
        if (user && user.password === password) {
            loginAsUser(user.username);
        } else {
            showToast('نام کاربری یا رمز عبور اشتباه است.', 'error');
        }
    });

    document.getElementById('signup-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = (document.getElementById('signup-username') as HTMLInputElement).value.trim();
        const email = (document.getElementById('signup-email') as HTMLInputElement).value.trim();
        const password = (document.getElementById('signup-password') as HTMLInputElement).value;
        
        if (!username || !email || !password) {
            showToast('لطفا تمام فیلدها را پر کنید.', 'error');
            return;
        }
        if (username.length < 3) {
            showToast('نام کاربری باید حداقل ۳ حرف باشد.', 'error');
            return;
        }
        if (password.length < 6) {
            showToast('رمز عبور باید حداقل ۶ کاراکتر باشد.', 'error');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
             showToast('فرمت ایمیل نامعتبر است.', 'error');
             return;
        }
        if (getUsers().some((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
            showToast('این نام کاربری قبلا استفاده شده است.', 'error');
            return;
        }

        const users = getUsers();
        users.push({ username, email, password });
        saveUsers(users);
        saveUserData(username, {
            step1: { clientName: username, clientEmail: email },
            step2: { days: [] },
            step3: { supplements: [] },
            step4: {}
        });
        
        logActivity(`کاربر جدید ${username} ثبت نام کرد.`);
        showToast(`خوش آمدی، ${username}! ثبت نام با موفقیت انجام شد.`, 'success');
        loginAsUser(username);
    });

    // --- Theme Toggler ---
    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('fitgympro_theme', newTheme);
    };
    document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);
    document.getElementById('theme-toggle-btn-dashboard')?.addEventListener('click', toggleTheme);
    
    // --- Navigation ---
    document.getElementById('next-btn')?.addEventListener('click', () => navigateToStep(findNextEnabledStep(currentStep, 1)));
    document.getElementById('prev-btn')?.addEventListener('click', () => navigateToStep(findNextEnabledStep(currentStep, -1)));
    document.querySelectorAll('.stepper-item').forEach((item, i) => {
        item.addEventListener('click', () => { if (item.classList.contains('completed') || item.classList.contains('active')) navigateToStep(i + 1); });
    });

    // --- Form Interactions ---
    const form = document.getElementById('program-builder-form') as HTMLElement;
    form.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        
        if (target.matches('.range-slider')) {
            updateSliderBackground(target);
        
            const sliderClass = target.className.split(' ').find(c => c.includes('-slider'));
            const classSelector = sliderClass ? `.${sliderClass.replace('-slider', '-value')}` : null;
            const idSelector = target.id ? `.${target.id.replace('-slider', '-value')}` : null;
            
            const finalSelector = [idSelector, classSelector].filter(Boolean).join(', ');
        
            if (finalSelector) {
                const valueDisplay = target.previousElementSibling?.querySelector(finalSelector) || target.parentElement?.querySelector(finalSelector);
                if (valueDisplay) {
                    let suffix = '';
                    if (target.classList.contains('height-slider')) suffix = ' cm';
                    if (target.classList.contains('weight-slider')) suffix = ' kg';
                    if (target.classList.contains('rest-slider')) suffix = 's';
                    valueDisplay.textContent = target.value + suffix;
                }
            }
        }
        
        if (target.matches('.gender, .age-slider, .height-slider, .weight-slider, .activity-level, .neck-input, .waist-input, .hip-input')) {
            calculateBodyMetrics(target.closest('#section-1, #dashboard-profile-panel') as HTMLElement);
        }
        if (target.matches('.gender')) {
            toggleHipInput(target.closest('#section-1, #dashboard-profile-panel') as HTMLElement);
        }
        
        if (target.matches('.muscle-group-select')) {
            populateExercises(target.value, target.parentElement?.querySelector('.exercise-select') as HTMLSelectElement);
        }

        if (target.matches('.supplement-checkbox')) {
            const dosageInput = target.closest('.supplement-item')?.querySelector('.dosage-input') as HTMLInputElement;
            if (dosageInput) {
                dosageInput.value = target.checked ? (target.dataset.dosage || '') : '';
            }
        }

        if(currentUser === 'admin' && target.closest('#program-builder-form')) {
            // Debounced save
            // clearTimeout(saveTimeout);
            // saveTimeout = setTimeout(saveCurrentState, 1000);
        }
    });

    // --- Dynamic Row/Card Addition/Removal ---
    form.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const addExerciseBtn = target.closest('.add-exercise-btn');
        if (addExerciseBtn) { addExerciseRow(addExerciseBtn.previousElementSibling as HTMLElement); }
        if (target.closest('.remove-exercise-btn')) { target.closest('.exercise-row')?.remove(); }
        if (target.closest('.superset-btn')) { 
            const btn = target.closest('.superset-btn') as HTMLElement;
            btn.classList.toggle('active');
            btn.closest('.exercise-row')?.classList.toggle('is-superset');
        }
        if (target.closest('.remove-day-btn')) { target.closest('.day-card')?.remove(); }
    });
    document.getElementById('add-day-btn')?.addEventListener('click', () => addDayCard());
    
    // --- Profile Picture ---
    document.body.addEventListener('change', e => {
        const target = e.target as HTMLInputElement;
        if(target.matches('.profile-pic-input')) {
            const file = target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const src = event.target?.result as string;
                    target.closest('label')?.parentElement?.querySelectorAll('.profile-pic-preview').forEach(img => (img as HTMLImageElement).src = src);
                };
                reader.readAsDataURL(file);
            }
        }
    });
    
    // --- Supplement Search ---
    document.getElementById('supplement-search')?.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase();
        document.querySelectorAll('.supplement-item').forEach(item => {
            const name = item.querySelector('span')?.textContent?.toLowerCase() || '';
            const isVisible = name.includes(query);
            item.classList.toggle('hidden', !isVisible);
        });
        document.querySelectorAll('.supp-category-card').forEach(card => {
            const visibleItems = card.querySelectorAll('.supplement-item:not(.hidden)').length;
            card.classList.toggle('hidden', visibleItems === 0);
        });
    });

    // --- AI Assistant ---
    const getAISuggestionBtn = document.getElementById('get-ai-suggestion-btn');
    const aiQuestionInput = document.getElementById('ai-question-input') as HTMLInputElement;
    const aiContent = document.getElementById('ai-assistant-content') as HTMLElement;
    
    const getAISuggestion = async () => {
        const question = aiQuestionInput.value.trim();
        if (!question) {
            aiContent.innerHTML = '<p class="text-secondary">لطفا سوال خود را وارد کنید.</p>';
            return;
        }

        getAISuggestionBtn?.classList.add('is-loading');
        aiQuestionInput.disabled = true;
        aiContent.innerHTML = '<p class="text-secondary">در حال دریافت پاسخ...</p>';

        try {
            if (!ai) {
                ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            }
            const s1 = getAppState().step1;
            const context = `You are a world-class fitness and nutrition coach. A user is creating a plan for a client with these details: Goal=${s1.trainingGoal}, Age=${s1.age}, Gender=${s1.gender}, Height=${s1.height}cm, Weight=${s1.weight}kg. Please answer the following question concisely in Persian, using Markdown for formatting.`;
            const fullPrompt = `${context}\n\nQuestion: ${question}`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt
            });
            
            // A basic markdown to HTML converter
            let htmlResponse = sanitizeHTML(response.text)
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                .replace(/\*(.*?)\*/g, '<em>$1</em>')       // Italic
                .replace(/(\n\r?){2,}/g, '</p><p>')          // Paragraphs
                .replace(/\n- (.*)/g, '<ul><li>$1</li></ul>') // Basic lists
                .replace(/<\/ul><ul>/g, '');               // Combine adjacent lists
            aiContent.innerHTML = `<p>${htmlResponse}</p>`;

        } catch (error) {
            console.error('AI Suggestion Error:', error);
            aiContent.innerHTML = '<p class="text-red-400">متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.</p>';
        } finally {
            getAISuggestionBtn?.classList.remove('is-loading');
            aiQuestionInput.disabled = false;
        }
    };
    getAISuggestionBtn?.addEventListener('click', getAISuggestion);
    aiQuestionInput?.addEventListener('keyup', (e) => { if(e.key === 'Enter') getAISuggestion(); });

    // --- AI Plan Generation ---
    document.getElementById('generate-ai-plan-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('generate-ai-plan-btn')! as HTMLButtonElement;
        btn.classList.add('is-loading');
        btn.disabled = true;

        try {
            if (!ai) ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const s1 = getAppState().step1;
            const numDays = parseInt(s1.trainingDays || '4');
            const prompt = `Based on the following user data, create a ${numDays}-day workout plan in Persian.
                User Data:
                - Goal: ${s1.trainingGoal}
                - Age: ${s1.age}
                - Gender: ${s1.gender}
                - Experience Level: Assume intermediate
                - Training Days Per Week: ${numDays}

                Instructions:
                1.  Use ONLY the exercises from this database: ${JSON.stringify(window.exerciseDB)}. Do not invent new exercises. Match the names exactly.
                2.  Provide a JSON array where each object represents a training day.
                3.  Each day object must have a "title" (e.g., "روز اول: سینه و پشت بازو"), a "notes" string (a short motivational or instructional tip), and an "exercises" array.
                4.  Each exercise object in the array must have "muscle" (from DB keys), "exercise" (from DB values), "sets" (3-5), "reps" (6-15), and "rest" (in seconds, 30-90).
                5.  Structure the plan logically (e.g., push/pull/legs split or similar).
                6.  Do not include any supersets for now.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                notes: { type: Type.STRING },
                                exercises: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            muscle: { type: Type.STRING },
                                            exercise: { type: Type.STRING },
                                            sets: { type: Type.INTEGER },
                                            reps: { type: Type.INTEGER },
                                            rest: { type: Type.INTEGER }
                                        },
                                        required: ["muscle", "exercise", "sets", "reps", "rest"]
                                    }
                                }
                            },
                            required: ["title", "notes", "exercises"]
                        }
                    }
                }
            });

            const plan = JSON.parse(response.text.trim());
            const workoutContainer = document.getElementById('workout-days-container')!;
            workoutContainer.innerHTML = '';
            
            plan.forEach((day: any, dayIndex: number) => {
                addDayCard(dayIndex === 0);
                const dayCard = workoutContainer.lastElementChild as HTMLElement;
                if(dayCard) {
                    (dayCard.querySelector('.day-title-input') as HTMLInputElement).value = day.title;
                    (dayCard.querySelector('.day-notes-input') as HTMLTextAreaElement).value = day.notes;
                    const exList = dayCard.querySelector('.exercise-list')!;
                    exList.innerHTML = '';
                    day.exercises.forEach((ex: any) => {
                        addExerciseRow(exList as HTMLElement);
                        const exRow = exList.lastElementChild as HTMLElement;
                        if(exRow) {
                             const muscleSelect = exRow.querySelector('.muscle-group-select') as HTMLSelectElement;
                             const exerciseSelect = exRow.querySelector('.exercise-select') as HTMLSelectElement;
                             muscleSelect.value = ex.muscle;
                             populateExercises(ex.muscle, exerciseSelect);
                             exerciseSelect.value = ex.exercise;
                             (exRow.querySelector('.set-slider') as HTMLInputElement).value = ex.sets.toString();
                             (exRow.querySelector('.rep-slider') as HTMLInputElement).value = ex.reps.toString();
                             (exRow.querySelector('.rest-slider') as HTMLInputElement).value = ex.rest.toString();
                        }
                    });
                }
            });
            document.querySelectorAll('#program-builder-form .range-slider').forEach(s => {
                updateSliderBackground(s as HTMLInputElement);
                s.dispatchEvent(new Event('input'));
            });
             showToast('برنامه تمرینی هوشمند با موفقیت ایجاد شد!', 'success');

        } catch (error) {
            console.error('AI Plan Generation Error:', error);
            showToast('خطا در ایجاد برنامه با هوش مصنوعی.', 'error');
        } finally {
            btn.classList.remove('is-loading');
            btn.disabled = false;
        }
    });

    // --- Admin Panel ---
    const closeAdminPanel = () => {
        adminPanelModal.classList.remove('active');
        setTimeout(() => adminPanelModal.classList.add('hidden'), 300);
    };

    adminPanelBtn.addEventListener('click', () => {
        populateAdminUserList();
        adminPanelModal.classList.remove('hidden');
        setTimeout(() => {
            adminPanelModal.classList.add('active');
        }, 10);
    });

    document.getElementById('close-admin-panel-btn')?.addEventListener('click', closeAdminPanel);
    adminPanelModal.addEventListener('click', (e) => {
        if (e.target === adminPanelModal) closeAdminPanel();
    });

    adminPanelModal.addEventListener('click', e => {
        const target = e.target as HTMLElement;

        const loadBtn = target.closest('.load-user-btn');
        if (loadBtn) {
            const username = (loadBtn as HTMLElement).dataset.username;
            if (username) {
                const userData = getUserData(username);
                loadStateIntoApp(userData);
                closeAdminPanel();
                showToast(`اطلاعات ${username} برای ویرایش بارگذاری شد.`, 'success');
            }
        }

        const removeBtn = target.closest('.remove-user-btn');
        if (removeBtn) {
            const username = (removeBtn as HTMLElement).dataset.username;
            if (username && confirm(`آیا از حذف کاربر «${username}» مطمئن هستید؟ این عمل غیرقابل بازگشت است.`)) {
                let users = getUsers();
                users = users.filter((u: any) => u.username !== username);
                saveUsers(users);
                localStorage.removeItem(`fitgympro_data_${username}`);
                logActivity(`کاربر ${username} حذف شد.`);
                populateAdminUserList();
                showToast(`کاربر ${username} با موفقیت حذف شد.`, 'success');
            }
        }
    });

    document.getElementById('create-user-btn')?.addEventListener('click', () => {
        const userInput = document.getElementById('new-username-input') as HTMLInputElement;
        const emailInput = document.getElementById('new-user-email-input') as HTMLInputElement;
        const passInput = document.getElementById('new-user-password-input') as HTMLInputElement;
        const errorEl = document.getElementById('create-user-error') as HTMLElement;

        const username = userInput.value.trim();
        const email = emailInput.value.trim();
        const password = passInput.value.trim();
        errorEl.textContent = '';

        if (!username || !email || !password) {
            errorEl.textContent = 'تمام فیلدها الزامی هستند.';
            return;
        }
        if (getUsers().some((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
            errorEl.textContent = 'این نام کاربری قبلا استفاده شده.';
            return;
        }

        const users = getUsers();
        users.push({ username, email, password });
        saveUsers(users);
        saveUserData(username, {
            step1: { clientName: username, clientEmail: email },
            step2: { days: [] }, step3: { supplements: [] }, step4: {}
        });
        logActivity(`کاربر ${username} توسط مدیر ایجاد شد.`);
        showToast(`کاربر ${username} با موفقیت ایجاد شد.`, 'success');
        populateAdminUserList();
        userInput.value = ''; emailInput.value = ''; passInput.value = '';
    });
    
    // --- User Dashboard Functionality ---
    let saveDashboardTimeout: number;
    document.getElementById('dashboard-profile-panel')?.addEventListener('input', () => {
        clearTimeout(saveDashboardTimeout);
        saveDashboardTimeout = window.setTimeout(() => {
            if (currentUser && currentUser !== 'admin') {
                const currentState = getUserData(currentUser);
                const dashboardPanel = document.getElementById('dashboard-profile-panel')!;
                
                const dashboardStep1Data = {
                    clientName: (dashboardPanel.querySelector('.client-name-input') as HTMLInputElement).value,
                    clientEmail: (dashboardPanel.querySelector('.client-email-input') as HTMLInputElement).value,
                    profilePic: (dashboardPanel.querySelector('.profile-pic-preview') as HTMLImageElement).src,
                    trainingGoal: (dashboardPanel.querySelector('.training-goal:checked') as HTMLInputElement)?.value,
                    age: (dashboardPanel.querySelector('.age-slider') as HTMLInputElement).value,
                    height: (dashboardPanel.querySelector('.height-slider') as HTMLInputElement).value,
                    weight: (dashboardPanel.querySelector('.weight-slider') as HTMLInputElement).value,
                    neck: (dashboardPanel.querySelector('.neck-input') as HTMLInputElement).value,
                    waist: (dashboardPanel.querySelector('.waist-input') as HTMLInputElement).value,
                    hip: (dashboardPanel.querySelector('.hip-input') as HTMLInputElement).value,
                    gender: (dashboardPanel.querySelector('.gender:checked') as HTMLInputElement)?.value,
                    activityLevel: (dashboardPanel.querySelector('.activity-level:checked') as HTMLInputElement)?.value,
                    trainingDays: (dashboardPanel.querySelector('.training-days:checked') as HTMLInputElement)?.value,
                };

                currentState.step1 = { ...currentState.step1, ...dashboardStep1Data };
                saveUserData(currentUser, currentState);
                showToast('تغییرات شما ذخیره شد.', 'success');
            }
        }, 1500);
    });

    document.getElementById('confirm-info-btn')?.addEventListener('click', () => {
        if (currentUser && currentUser !== 'admin') {
            const data = getUserData(currentUser);
            data.infoConfirmed = true;
            saveUserData(currentUser, data);
            populateDashboard(currentUser, data);
            showToast('اطلاعات شما با موفقیت تایید شد.', 'success');
        }
    });

    document.getElementById('pay-program-btn')?.addEventListener('click', () => {
        if (currentUser && currentUser !== 'admin') {
            const data = getUserData(currentUser);
            data.hasPaid = true;
            saveUserData(currentUser, data);
            populateDashboard(currentUser, data);
            showToast('پرداخت با موفقیت انجام شد (شبیه‌سازی).', 'success');
        }
    });


    // --- Logout ---
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('logout-btn-dashboard')?.addEventListener('click', logout);

    // --- Action Buttons ---
    document.getElementById('save-pdf-btn')?.addEventListener('click', saveAsPdf);
    document.getElementById('save-word-btn')?.addEventListener('click', saveAsWord);
    document.getElementById('send-program-btn')?.addEventListener('click', sendProgramToUser);
    document.getElementById('save-changes-btn')?.addEventListener('click', saveProgramChanges);
    document.getElementById('dashboard-save-pdf-btn')?.addEventListener('click', saveAsPdf);
    
    // Initial population for components
    populateSupplements();
    if(document.getElementById('workout-days-container')?.children.length === 0) {
        addDayCard(true);
    }
});