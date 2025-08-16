

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
const motivationalQuotes = [
    { quote: "درد موقتی است، اما افتخار ابدی است.", author: "محمد علی کلی" },
    { quote: "وقتی حس می‌کنی می‌خواهی تسلیم شوی، به یاد بیار چرا شروع کردی.", author: "ناشناس" },
    { quote: "تفاوت بین کسی که هستی و کسی که می‌خواهی باشی، در کاری است که انجام می‌دهی.", author: "ناشناس" },
    { quote: "برای دیدن عضله، اول باید با درد رفیق شوی.", author: "ناشناس" },
    { quote: "قهرمانان در باشگاه ساخته می‌شوند، جایی که هیچکس آنها را نمی‌بیند.", author: "آرنولد شوارتزنگر" }
];
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
const authLoginTab = document.getElementById('auth-login-tab') as HTMLButtonElement;
const authSignupTab = document.getElementById('auth-signup-tab') as HTMLButtonElement;
const authLoginForm = document.getElementById('auth-login-form') as HTMLElement;
const authSignupForm = document.getElementById('auth-signup-form') as HTMLElement;
const authRecoveryForm = document.getElementById('auth-recovery-form') as HTMLElement;


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
    const activityMultiplier = parseFloat((container.querySelector('.activity-level:checked') as HTMLInputElement).value);
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
    if (tdeeInput) tdeeInput.value = Math.round(bmr * activityMultiplier).toString();

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
const addDayCard = (isFirst = false) => { const dayCount = (document.getElementById('workout-days-container') as HTMLElement).children.length + 1; const newDay = document.createElement('div'); newDay.className = 'card rounded-lg day-card'; newDay.innerHTML = `<div class="flex justify-between items-center p-4 bg-tertiary/30 rounded-t-lg"><div class="flex items-center gap-3"><i data-lucide="calendar-days" class="text-yellow-400"></i><input type="text" value="روز ${dayCount}: " class="day-title-input input-field font-bold text-lg bg-transparent border-0 p-1 focus:ring-0 focus:border-yellow-400 w-auto"></div> ${!isFirst ? '<button type="button" class="remove-day-btn p-1 text-secondary hover:text-red-400"><i data-lucide="x-circle" class="w-5 h-5"></i></button>' : ''}</div><div class="p-4 space-y-3"><div class="exercise-list space-y-3"></div><button type="button" class="add-exercise-btn mt-2 w-full text-sm text-yellow-400 font-semibold hover:bg-yellow-400/10 py-2.5 px-4 rounded-lg border-2 border-dashed border-yellow-400/30 transition-all flex items-center justify-center gap-2"><i data-lucide="plus"></i> افزودن حرکت</button></div><div class="p-4 border-t border-border-primary/50"><label class="font-semibold text-sm text-secondary mb-2 block">یادداشت‌های مربی</label><textarea class="day-notes-input input-field text-sm bg-tertiary/50" rows="2" placeholder="مثال: روی فرم صحیح حرکت تمرکز کنید..."></textarea></div>`; (document.getElementById('workout-days-container') as HTMLElement).appendChild(newDay); addExerciseRow(newDay.querySelector('.exercise-list') as HTMLElement); window.lucide.createIcons(); };
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
            let exercisesTable = `<table class="preview-table-pro"><thead><tr><th>حرکت (Exercise)</th><th>ست (Sets)</th><th>تکرار (Reps)</th><th>استراحت (Rest)</th></tr></thead><tbody>`;
            const exercises = Array.from(card.querySelectorAll('.exercise-row'));
            for (let i = 0; i < exercises.length; i++) {
                const ex = exercises[i];
                const isSuperset = ex.classList.contains('is-superset');
                const isFirstInGroup = isSuperset && (i === 0 || !exercises[i-1].classList.contains('is-superset'));
                exercisesTable += `<tr class="${isSuperset ? 'superset-group-pro' : ''}"><td>${isFirstInGroup ? '<span class="superset-label-pro">سوپرست</span>' : ''}${(ex.querySelector('.exercise-select') as HTMLSelectElement).value}</td><td>${ex.querySelector('.set-value')?.textContent}</td><td>${ex.querySelector('.rep-value')?.textContent}</td><td>${ex.querySelector('.rest-value')?.textContent}</td></tr>`;
            }
            exercisesTable += `</tbody></table>`;
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
        let supplementsTable = `<div class="mt-6"><h3 class="preview-section-header"><i data-lucide="pill"></i>برنامه مکمل‌ها</h3><div style="display: flex; justify-content: center;"><table class="preview-table-pro" style="width: auto; min-width: 500px; max-width: 90%; margin-top: 0;"><thead><tr><th>مکمل / ویتامین</th><th style="width: 200px;">دستور مصرف</th></tr></thead><tbody>`;
        checkedSupps.forEach(sup => {
            const dosage = sanitizeHTML((sup.closest('.supplement-item')?.querySelector('.dosage-input') as HTMLInputElement).value || 'طبق دستور');
            const supName = sanitizeHTML((sup as HTMLInputElement).value);
            supplementsTable += `<tr><td>${supName}</td><td style="text-align: center;">${dosage}</td></tr>`;
        });
        supplementsTable += `</tbody></table></div></div>`;
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
        if(activityRadio) activityRadio.checked = true;
    } else {
        (profilePanel.querySelector('.activity-level[value="1.2"]') as HTMLInputElement).checked = true;
    }
    if (s1.trainingDays) {
        const daysRadio = profilePanel.querySelector(`.training-days[value="${s1.trainingDays}"]`) as HTMLInputElement;
        if (daysRadio) daysRadio.checked = true;
    } else {
        (profilePanel.querySelector('.training-days[value="4"]') as HTMLInputElement).checked = true;
    }
    
    // Update confirm button state
    const confirmBtn = document.getElementById('confirm-info-btn') as HTMLButtonElement;
    if (infoConfirmed) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `<i data-lucide="check-check"></i><span>اطلاعات تایید شده است</span>`;
        confirmBtn.classList.remove('secondary-button');
        confirmBtn.classList.add('bg-green-600', 'text-white', 'cursor-not-allowed');
    } else {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<i data-lucide="check-circle"></i><span>تایید اطلاعات</span>`;
        confirmBtn.classList.add('secondary-button');
        confirmBtn.classList.remove('bg-green-600', 'text-white', 'cursor-not-allowed');
    }

    // Trigger UI updates
    profilePanel.querySelectorAll('.range-slider').forEach(s => {
        updateSliderBackground(s as HTMLInputElement);
        const event = new Event('input', { bubbles: true });
        s.dispatchEvent(event);
    });
    toggleHipInput(profilePanel); // This also calls calculateBodyMetrics
    
    // Render program preview
    // Temporarily populate the main form to reuse its state for rendering
    loadStateIntoApp(state);
    generateProgramPreview(document.getElementById('program-builder-form')!, '#dashboard-program-view');
    (dashboard.querySelector('#dashboard-welcome-message') as HTMLElement).textContent = `خوش آمدی، ${username}!`;
    window.lucide.createIcons();
}

function saveDashboardState() {
    if (!currentUser || currentUser === 'admin') return;

    const profilePanel = document.getElementById('dashboard-profile-panel')!;
    const fullState = getUserData(currentUser);

    // Update step1 data from the dashboard
    fullState.step1.clientName = (profilePanel.querySelector('.client-name-input') as HTMLInputElement).value;
    fullState.step1.clientEmail = (profilePanel.querySelector('.client-email-input') as HTMLInputElement).value;
    fullState.step1.profilePic = (profilePanel.querySelector('.profile-pic-preview') as HTMLImageElement).src;
    fullState.step1.trainingGoal = (profilePanel.querySelector('.training-goal:checked') as HTMLInputElement)?.value;
    fullState.step1.age = (profilePanel.querySelector('.age-slider') as HTMLInputElement).value;
    fullState.step1.height = (profilePanel.querySelector('.height-slider') as HTMLInputElement).value;
    fullState.step1.weight = (profilePanel.querySelector('.weight-slider') as HTMLInputElement).value;
    fullState.step1.neck = (profilePanel.querySelector('.neck-input') as HTMLInputElement).value;
    fullState.step1.waist = (profilePanel.querySelector('.waist-input') as HTMLInputElement).value;
    fullState.step1.hip = (profilePanel.querySelector('.hip-input') as HTMLInputElement).value;
    fullState.step1.gender = (profilePanel.querySelector('.gender:checked') as HTMLInputElement)?.value;
    fullState.step1.activityLevel = (profilePanel.querySelector('.activity-level:checked') as HTMLInputElement)?.value;
    fullState.step1.trainingDays = (profilePanel.querySelector('.training-days:checked') as HTMLInputElement)?.value;
    
    saveUserData(currentUser, fullState);
}


function loginAsUser(username: string) {
    currentUser = username;
    localStorage.setItem('fitgympro_last_user', username);
    const userData = getUserData(username);
    
    populateDashboard(username, userData);

    // Check for update notification
    if (userData.lastUpdatedByAdmin) {
        const lastUpdate = new Date(userData.lastUpdatedByAdmin);
        const lastSeen = userData.lastSeenByClient ? new Date(userData.lastSeenByClient) : new Date(0); // Treat missing as very old date

        if (lastUpdate > lastSeen) {
            // Wait a bit for the UI to settle before showing the toast
            setTimeout(() => {
                showToast('برنامه تمرینی شما به‌روزرسانی شده است!', 'success');
            }, 500); // 500ms delay after UI transition
            
            // Update last seen timestamp
            userData.lastSeenByClient = new Date().toISOString();
            saveUserData(username, userData);
        }
    }

    authScreen.classList.add('opacity-0');
    setTimeout(() => authScreen.classList.add('hidden'), 300);

    userDashboardContainer.classList.remove('hidden');
    setTimeout(() => userDashboardContainer.classList.remove('opacity-0'), 50);
}

function logout() {
    if (currentUser === 'admin') saveCurrentState(); // Save only if admin made changes
    currentUser = null;
    localStorage.removeItem('fitgympro_last_user');

    (document.getElementById('current-user-display') as HTMLElement).classList.add('hidden');
    (document.getElementById('logout-btn') as HTMLElement).classList.add('hidden');
    adminPanelBtn.classList.add('hidden');

    mainAppContainer.classList.add('opacity-0');
    userDashboardContainer.classList.add('opacity-0');
    setTimeout(() => {
        mainAppContainer.classList.add('hidden');
        userDashboardContainer.classList.add('hidden');
    }, 500);

    authScreen.classList.remove('hidden');
    setTimeout(() => authScreen.classList.remove('opacity-0'), 50);
}


function switchAuthTab(tab: 'login' | 'signup') {
    const isLogin = tab === 'login';
    
    authLoginTab.classList.toggle('active', isLogin);
    authLoginTab.classList.toggle('text-secondary', !isLogin);
    authSignupTab.classList.toggle('active', !isLogin);
    authSignupTab.classList.toggle('text-secondary', isLogin);

    const currentActive = document.querySelector('.auth-form-section.active-in') as HTMLElement;
    const nextActive = isLogin ? authLoginForm : authSignupForm;

    if (currentActive && currentActive !== nextActive) {
        currentActive.classList.add('active-out');
        currentActive.classList.remove('active-in');
        
        currentActive.addEventListener('animationend', () => {
            currentActive.classList.remove('active-out');
            nextActive.classList.add('active-in');
            if(isLogin) { (document.getElementById('login-username-input') as HTMLInputElement).focus(); } else { (document.getElementById('signup-username-input') as HTMLInputElement).focus(); }
        }, { once: true });
    } else if (!currentActive) { // Initial load
         nextActive.classList.add('active-in');
         if(isLogin) { (document.getElementById('login-username-input') as HTMLInputElement).focus(); } else { (document.getElementById('signup-username-input') as HTMLInputElement).focus(); }
    }
    
    if(authRecoveryForm.classList.contains('active-in')) {
        authRecoveryForm.classList.remove('active-in');
    }
}

function handleUserLogin() {
    const usernameInput = document.getElementById('login-username-input') as HTMLInputElement;
    const passwordInput = document.getElementById('login-password-input') as HTMLInputElement;
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const usernameError = document.getElementById('login-username-error') as HTMLElement;
    const passwordError = document.getElementById('login-password-error') as HTMLElement;
    const generalError = document.getElementById('login-error') as HTMLElement;

    // Clear previous errors
    usernameError.textContent = '';
    passwordError.textContent = '';
    generalError.textContent = '';
    usernameInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');

    let hasError = false;
    if (!username) {
        usernameInput.classList.add('input-error');
        usernameError.textContent = 'لطفا نام کاربری را وارد کنید.';
        hasError = true;
    }
    if (!password) {
        passwordInput.classList.add('input-error');
        passwordError.textContent = 'لطفا رمز عبور را وارد کنید.';
        hasError = true;
    }

    if (hasError) return;

    if (username.toLowerCase() === 'admin' && password === 'hamid@@##') {
        loginAsAdmin();
        return;
    }

    const users = getUsers();
    const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());

    if (user && user.password === password) {
        loginAsUser(user.username);
    } else {
        generalError.textContent = 'نام کاربری یا رمز عبور اشتباه است.';
        usernameInput.classList.add('input-error');
        passwordInput.classList.add('input-error');
    }
}

function handleUserSignup() {
    const usernameInput = document.getElementById('signup-username-input') as HTMLInputElement;
    const emailInput = document.getElementById('signup-email-input') as HTMLInputElement;
    const passwordInput = document.getElementById('signup-password-input') as HTMLInputElement;
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Error elements
    const usernameError = document.getElementById('signup-username-error') as HTMLElement;
    const emailError = document.getElementById('signup-email-error') as HTMLElement;
    const passwordError = document.getElementById('signup-password-error') as HTMLElement;
    const generalError = document.getElementById('signup-error') as HTMLElement;

    // Clear previous errors
    usernameError.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';
    generalError.textContent = '';
    usernameInput.classList.remove('input-error');
    emailInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');

    let hasError = false;
    if (!username) { usernameInput.classList.add('input-error'); usernameError.textContent = 'نام کاربری نمی‌تواند خالی باشد.'; hasError = true; }
    if (!email) { emailInput.classList.add('input-error'); emailError.textContent = 'ایمیل نمی‌تواند خالی باشد.'; hasError = true; }
    if (!password) { passwordInput.classList.add('input-error'); passwordError.textContent = 'رمز عبور نمی‌تواند خالی باشد.'; hasError = true; }
    if (hasError) return;

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        emailError.textContent = 'فرمت ایمیل نامعتبر است.';
        emailInput.classList.add('input-error');
        return;
    }
    
    if (username.toLowerCase() === 'admin') {
        usernameError.textContent = 'این نام کاربری رزرو شده است.';
        usernameInput.classList.add('input-error');
        return;
    }

    let users = getUsers();
    if (users.some((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
        usernameError.textContent = 'این نام کاربری قبلا استفاده شده است.';
        usernameInput.classList.add('input-error');
        return;
    }
    if (users.some((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase())) {
        emailError.textContent = 'این ایمیل قبلا استفاده شده است.';
        emailInput.classList.add('input-error');
        return;
    }

    users.push({ username, email, password });
    saveUsers(users);
    saveUserData(username, { 
        step1: { clientName: username, clientEmail: email },
        step2: { days: [] }, 
        step3: { supplements: [] }, 
        step4: {},
        hasPaid: false,
        infoConfirmed: false,
    });
    
    logActivity(`کاربر جدید: ${username} ثبت‌نام کرد`);
    loginAsUser(username);
}

function showAdminPanel() {
    adminPanelModal.classList.remove('hidden');
    setTimeout(() => adminPanelModal.classList.add('active'), 10);

    (document.getElementById('new-username-input') as HTMLInputElement).value = '';
    (document.getElementById('new-user-email-input') as HTMLInputElement).value = '';
    (document.getElementById('new-user-password-input') as HTMLInputElement).value = '';
    (document.getElementById('create-user-error') as HTMLElement).textContent = '';
    
    switchAdminView('clients');
}

function hideAdminPanel() {
    const clientDetailPanel = document.getElementById('client-detail-panel') as HTMLElement;
    if (clientDetailPanel.classList.contains('active')) {
        hideClientDetailPanel();
    }
    adminPanelModal.classList.remove('active');
    setTimeout(() => adminPanelModal.classList.add('hidden'), 300);
}

function switchAdminView(viewName: 'clients' | 'stats') {
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });
    document.querySelectorAll('.admin-panel-view').forEach(view => {
        (view as HTMLElement).classList.toggle('hidden', view.id !== `admin-view-${viewName}`);
    });

    if (viewName === 'clients') {
        renderClientManagementView();
    } else if (viewName === 'stats') {
        renderAdminDashboard();
    }
}

function renderTrainingGoalChart() {
    const users = getUsers().filter((u: any) => u.username !== 'admin');
    const totalUsers = users.length;
    const goalsCount: { [key: string]: number } = {};

    users.forEach(user => {
        const userData = getUserData(user.username);
        const goal = userData.step1?.trainingGoal || 'نامشخص';
        goalsCount[goal] = (goalsCount[goal] || 0) + 1;
    });

    const chartEl = document.getElementById('goals-pie-chart') as HTMLElement;
    const legendEl = document.getElementById('goals-chart-legend') as HTMLElement;
    
    if (totalUsers === 0) {
        chartEl.style.backgroundImage = 'conic-gradient(#E5E7EB 0% 100%)';
        legendEl.innerHTML = '<p class="text-secondary text-center col-span-2">هنوز هیچ شاگردی با هدف مشخص وجود ندارد.</p>';
        return;
    }

    const colors = ['#3B82F6', '#22C55E', '#F97316', '#EF4444', '#8B5CF6', '#EC4899'];
    let gradientString = '';
    let legendString = '';
    let currentPercentage = 0;
    
    Object.entries(goalsCount).forEach(([goal, count], index) => {
        const percentage = (count / totalUsers) * 100;
        const color = colors[index % colors.length];
        gradientString += `, ${color} ${currentPercentage}% ${currentPercentage + percentage}%`;
        legendString += `<div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full" style="background-color: ${color};"></span><span>${sanitizeHTML(goal)}</span></div><strong class="font-semibold">${count} نفر</strong></div>`;
        currentPercentage += percentage;
    });

    chartEl.style.backgroundImage = `conic-gradient(${gradientString.substring(2)})`;
    legendEl.innerHTML = legendString;
}

function renderAdminDashboard() {
    const users = getUsers().filter((u: any) => u.username !== 'admin');
    const totalUsers = users.length;
    let paidUsers = 0;
    let needsAttention = 0;

    users.forEach(user => {
        const data = getUserData(user.username);
        if (data.hasPaid) {
            paidUsers++;
        }
        if (!data.infoConfirmed || !data.step2?.days || data.step2.days.length === 0) {
            needsAttention++;
        }
    });
    
    (document.getElementById('stat-total-users') as HTMLElement).textContent = totalUsers.toString();
    (document.getElementById('stat-paid-users') as HTMLElement).textContent = paidUsers.toString();
    (document.getElementById('stat-needs-attention') as HTMLElement).textContent = needsAttention.toString();
    
    const activityLog = getActivityLog().slice(0, 5);
    const activityListEl = document.getElementById('activity-log-list') as HTMLElement;
    if (activityLog.length > 0) {
        activityListEl.innerHTML = activityLog.map(log => {
            const timeAgo = new Date(log.date);
            return `<li class="flex items-start gap-3"><i data-lucide="history" class="w-5 h-5 text-secondary mt-1 flex-shrink-0"></i><div><p class="font-semibold text-sm">${sanitizeHTML(log.message)}</p><p class="text-xs text-secondary">${timeAgo.toLocaleString('fa-IR')}</p></div></li>`;
        }).join('');
    } else {
        activityListEl.innerHTML = '<p class="text-secondary text-sm text-center">هنوز فعالیتی ثبت نشده است.</p>';
    }

    renderTrainingGoalChart();
    window.lucide.createIcons();
}

function renderClientManagementView(filter = 'all', searchTerm = '') {
    const users = getUsers();
    const container = document.getElementById('admin-user-list') as HTMLElement;
    if (!container) return;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const filteredUsers = users
        .filter((u: any) => u.username !== 'admin')
        .filter((u: any) => {
            if (!searchTerm) return true;
            return u.username.toLowerCase().includes(lowerCaseSearchTerm) || (u.email && u.email.toLowerCase().includes(lowerCaseSearchTerm));
        })
        .filter((u: any) => {
            if (filter === 'all') return true;
            const data = getUserData(u.username);
            switch (filter) {
                case 'paid': return data.hasPaid;
                case 'unpaid': return !data.hasPaid;
                case 'needs_attention': return !data.infoConfirmed || !data.step2?.days || data.step2.days.length === 0;
                case 'no_plan': return !data.step2?.days || data.step2.days.length === 0;
                default: return true;
            }
        });

    container.innerHTML = '';
    if (filteredUsers.length === 0) {
        container.innerHTML = '<p class="text-center text-secondary p-4 col-span-full">هیچ کاربری با این مشخصات یافت نشد.</p>';
        return;
    }

    filteredUsers.forEach((user: any) => {
        const userData = getUserData(user.username);
        const hasPlan = userData.step2?.days && userData.step2.days.length > 0;
        const profilePic = userData.step1?.profilePic || 'https://placehold.co/100x100/374151/E5E7EB?text=...';

        let tagsHtml = '';
        if(userData.hasPaid) {
            tagsHtml += `<span class="status-tag tag-green">پرداخت شده</span>`;
        } else {
            tagsHtml += `<span class="status-tag tag-red">پرداخت نشده</span>`;
        }
        if (userData.infoConfirmed) {
            tagsHtml += `<span class="status-tag tag-blue">تایید شده</span>`;
        } else {
            tagsHtml += `<span class="status-tag tag-yellow">نیاز به تایید</span>`;
        }
        if (hasPlan) {
            tagsHtml += `<span class="status-tag tag-gray">برنامه فعال</span>`;
        } else {
             tagsHtml += `<span class="status-tag tag-yellow">بدون برنامه</span>`;
        }
        
        const card = document.createElement('div');
        card.className = 'client-card card rounded-lg p-4 flex flex-col gap-4';
        card.dataset.username = user.username;
        card.innerHTML = `
            <div class="flex items-center gap-4">
                <img src="${profilePic}" alt="Profile" class="w-12 h-12 rounded-full object-cover">
                <div class="flex-grow overflow-hidden">
                    <h4 class="font-bold truncate">${sanitizeHTML(user.username)}</h4>
                    <p class="text-xs text-secondary truncate">${sanitizeHTML(user.email)}</p>
                </div>
                 <button data-username="${user.username}" class="toggle-payment-btn p-2 text-secondary ${userData.hasPaid ? 'hover:text-red-500' : 'hover:text-green-500'}" title="${userData.hasPaid ? 'علامت‌گذاری به عنوان پرداخت نشده' : 'علامت‌گذاری به عنوان پرداخت شده'}">
                    <i data-lucide="dollar-sign" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="flex items-center gap-2 flex-wrap">${tagsHtml}</div>
            <div class="mt-auto pt-4 border-t border-border-primary flex items-center gap-2">
                <button data-username="${user.username}" class="view-client-btn secondary-button flex-grow font-semibold py-2 px-3 rounded-md text-sm flex items-center justify-center gap-2">
                    <i data-lucide="eye" class="w-4 h-4"></i> مشاهده پروفایل
                </button>
                <button data-username="${user.username}" class="load-user-btn secondary-button p-2 text-secondary hover:text-blue-500" title="بارگذاری و ویرایش برنامه کاربر">
                    <i data-lucide="edit" class="w-5 h-5"></i>
                </button>
                <button data-username="${user.username}" class="delete-user-btn p-2 text-secondary hover:text-red-500" title="حذف کاربر">
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
    window.lucide.createIcons();
}

function renderClientDetailHTML(username: string): string {
    const userData = getUserData(username);
    if (!userData) return '<p>اطلاعات کاربر یافت نشد.</p>';

    const s1 = userData.step1 || {};
    let infoHtml = `<div class="client-detail-section mb-6">
        <h4><i data-lucide="user-circle" class="w-5 h-5 text-yellow-500"></i>اطلاعات فردی</h4>
        <div class="space-y-2 text-sm">
            <p><strong>نام:</strong> ${sanitizeHTML(s1.clientName || 'نامشخص')}</p>
            <p><strong>ایمیل:</strong> ${sanitizeHTML(s1.clientEmail || 'نامشخص')}</p>
            <p><strong>سن:</strong> ${s1.age || '-'} | <strong>قد:</strong> ${s1.height || '-'} cm | <strong>وزن:</strong> ${s1.weight || '-'} kg</p>
            <p><strong>جنسیت:</strong> ${s1.gender || 'نامشخص'}</p>
            <p><strong>هدف تمرینی:</strong> ${s1.trainingGoal || 'نامشخص'}</p>
        </div>
    </div>`;

    let planHtml = '<div class="client-detail-section mb-6"><h4><i data-lucide="dumbbell" class="w-5 h-5 text-yellow-500"></i>خلاصه برنامه تمرینی</h4>';
    const days = userData.step2?.days || [];
    if (days.length > 0 && days.some(d => d.exercises?.length > 0)) {
        planHtml += '<div class="space-y-3">';
        days.forEach(day => {
            if (day.exercises?.length > 0) {
                 planHtml += `<div class="text-sm p-2 bg-tertiary rounded-md">
                    <p class="font-bold">${sanitizeHTML(day.title)}</p>
                    <p class="text-xs text-secondary">${day.exercises.length} حرکت</p>
                 </div>`;
            }
        });
        planHtml += '</div>';
    } else {
        planHtml += '<p class="text-sm text-secondary">هنوز برنامه تمرینی برای این کاربر تعریف نشده است.</p>';
    }
    planHtml += '</div>';

    let suppHtml = '<div class="client-detail-section"><h4><i data-lucide="pill" class="w-5 h-5 text-yellow-500"></i>مکمل‌ها</h4>';
    const supps = userData.step3?.supplements || [];
    if (supps.length > 0) {
        suppHtml += '<ul class="space-y-1 text-sm list-disc pr-4">';
        supps.forEach(s => {
            suppHtml += `<li>${sanitizeHTML(s.name)}</li>`;
        });
        suppHtml += '</ul>';
    } else {
        suppHtml += '<p class="text-sm text-secondary">هیچ مکملی انتخاب نشده است.</p>';
    }
    suppHtml += '</div>';

    return infoHtml + planHtml + suppHtml;
}

function showClientDetailPanel(username: string) {
    const panel = document.getElementById('client-detail-panel') as HTMLElement;
    const content = document.getElementById('client-detail-content') as HTMLElement;
    const nameEl = document.getElementById('client-detail-name') as HTMLElement;
    const editBtn = document.getElementById('load-client-for-edit-btn') as HTMLButtonElement;
    
    nameEl.textContent = `پروفایل ${username}`;
    content.innerHTML = renderClientDetailHTML(username);
    editBtn.dataset.username = username;
    
    panel.classList.add('active');
    window.lucide.createIcons();
}

function hideClientDetailPanel() {
    const panel = document.getElementById('client-detail-panel') as HTMLElement;
    panel.classList.remove('active');
}

function createUser() {
    const usernameInput = document.getElementById('new-username-input') as HTMLInputElement;
    const emailInput = document.getElementById('new-user-email-input') as HTMLInputElement;
    const passwordInput = document.getElementById('new-user-password-input') as HTMLInputElement;
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const errorEl = document.getElementById('create-user-error') as HTMLElement;

    if (!username || !password || !email) {
        errorEl.textContent = 'نام کاربری، ایمیل و رمز عبور نمی‌توانند خالی باشند.';
        return;
    }
    
    let users = getUsers();
    if (users.some((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
        errorEl.textContent = 'این نام کاربری قبلا استفاده شده است.';
        return;
    }
    if (users.some((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase())) {
        errorEl.textContent = 'این ایمیل قبلا استفاده شده است.';
        return;
    }

    users.push({ username, email, password });
    saveUsers(users);
    saveUserData(username, { 
        step1: { clientName: username, clientEmail: email }, 
        step2: { days: [] }, 
        step3: { supplements: [] }, 
        step4: {},
        hasPaid: false,
        infoConfirmed: false,
    });
    
    logActivity(`کاربر ${username} توسط مربی ایجاد شد`);
    usernameInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';
    errorEl.textContent = '';
    renderClientManagementView();
    showToast(`کاربر ${username} با موفقیت ایجاد شد.`);
}

function deleteUser(username: string) {
    if (confirm(`آیا از حذف کاربر «${username}» مطمئن هستید؟ تمام داده‌های این کاربر پاک خواهد شد.`)) {
        let users = getUsers();
        users = users.filter((u: any) => u.username !== username);
        saveUsers(users);
        localStorage.removeItem(`fitgympro_data_${username}`);
        logActivity(`کاربر ${username} توسط مربی حذف شد`);
        renderClientManagementView();
    }
}

function loadUserForEditing(username: string) {
    const userData = getUserData(username);
    loadStateIntoApp(userData);
    hideAdminPanel();
    (document.getElementById('client-name-input') as HTMLInputElement).scrollIntoView({ behavior: 'smooth' });
    showToast(`برنامه کاربر «${username}» بارگذاری شد.`);
}

// --- AI LOGIC ---
function initializeAI() {
    const aiButton = document.getElementById('get-ai-suggestion-btn') as HTMLButtonElement;
    const aiContent = document.getElementById('ai-assistant-content') as HTMLElement;
    const aiQuestionInput = document.getElementById('ai-question-input') as HTMLInputElement;
    const generatePlanBtn = document.getElementById('generate-ai-plan-btn') as HTMLButtonElement;
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        aiButton.disabled = aiQuestionInput.value.trim() === '';
    } catch (error) {
        aiContent.innerHTML = `<p class="text-red-500 text-xs font-semibold">خطا در مقداردهی اولیه</p><p class="text-secondary text-xs mt-1">امکان اتصال به دستیار هوش مصنوعی وجود ندارد. این مشکل معمولاً به دلیل عدم تنظیم متغیر محیطی <code>API_KEY</code> رخ می‌دهد.</p>`;
        aiButton.disabled = true;
        aiQuestionInput.disabled = true;
        if (generatePlanBtn) generatePlanBtn.disabled = true;
        console.error("AI Library Initialization Error:", error);
    }
}

async function getAISuggestion() {
    const aiButton = document.getElementById('get-ai-suggestion-btn') as HTMLButtonElement;
    const aiContent = document.getElementById('ai-assistant-content') as HTMLElement;
    const aiQuestionInput = document.getElementById('ai-question-input') as HTMLInputElement;
    const aiIcon = document.getElementById('ai-assistant-icon') as HTMLElement;

    const userQuestion = aiQuestionInput.value.trim();
    if (!userQuestion || !ai) return;
    
    aiButton.classList.add('is-loading'); aiButton.disabled = true;
    aiQuestionInput.disabled = true; aiIcon.classList.add('animate-spin');
    aiContent.innerHTML = '<p class="text-secondary animate-pulse">در حال پردازش...</p>';

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userQuestion,
            config: { systemInstruction: "شما یک دستیار متخصص برای مربیان بدنسازی و تناسب اندام هستید. به سوالات با ارائه نکات دقیق، کاربردی و ایمن پاسخ دهید. پاسخ شما باید به زبان فارسی و با فرمت Markdown باشد." }
        });
        let formattedText = response.text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\* (.*$)/gm, '<li class="mb-1">$1</li>');
        if (formattedText.includes('<li')) {
            if (!formattedText.trim().startsWith('<ul>')) formattedText = `<ul class="list-disc pr-5 space-y-2">${formattedText}</ul>`;
        } else {
            formattedText = formattedText.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
        }
        aiContent.innerHTML = formattedText;
    } catch (error: any) {
        aiContent.innerHTML = `<p class="text-red-400">خطا در ارتباط با هوش مصنوعی. لطفاً دوباره تلاش کنید.</p><p class="text-xs text-secondary mt-2">${error.message || ''}</p>`;
        console.error('Gemini API Error:', error);
    } finally {
        aiButton.classList.remove('is-loading');
        aiButton.disabled = aiQuestionInput.value.trim() === '';
        aiQuestionInput.disabled = false;
        aiIcon.classList.remove('animate-spin');
    }
}

async function generateAIPlan() {
    const generatePlanBtn = document.getElementById('generate-ai-plan-btn') as HTMLButtonElement;
    if (!generatePlanBtn || !ai) return;
    
    const s1Container = document.getElementById('section-1')!;
    const trainingGoalRadio = s1Container.querySelector('.training-goal:checked') as HTMLInputElement;
    const trainingGoal = trainingGoalRadio ? trainingGoalRadio.value : '';
    if (!trainingGoal) {
        navigateToStep(1);
        const goalContainer = s1Container.querySelector('.training-goal-container');
        if (goalContainer) {
            goalContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            goalContainer.classList.add('p-2', 'rounded-lg', 'border-2', 'border-red-500', 'ring-2', 'ring-red-300/50', 'transition-all');
            setTimeout(() => goalContainer.classList.remove('p-2', 'rounded-lg', 'border-2', 'border-red-500', 'ring-2', 'ring-red-300/50'), 3000);
        }
        return;
    }
    generatePlanBtn.classList.add('is-loading'); generatePlanBtn.disabled = true;
    try {
        const clientName = (s1Container.querySelector('.client-name-input') as HTMLInputElement).value || 'شاگرد';
        const age = (s1Container.querySelector('.age-slider') as HTMLInputElement).value;
        const heightCm = (s1Container.querySelector('.height-slider') as HTMLInputElement).value;
        const weightKg = (s1Container.querySelector('.weight-slider') as HTMLInputElement).value;
        const genderRadio = s1Container.querySelector('.gender:checked') as HTMLInputElement;
        const gender = genderRadio ? (genderRadio.value === 'مرد' ? 'مرد' : 'زن') : 'نامشخص';
        const activityRadio = s1Container.querySelector('.activity-level:checked') as HTMLInputElement;
        const activityText = activityRadio ? activityRadio.nextElementSibling?.textContent : 'نامشخص';
        const trainingDays = (s1Container.querySelector('.training-days:checked') as HTMLInputElement).value;
        const allExercises = Object.entries(exerciseDB).map(([group, exercises]) => `گروه "${group}":\n${exercises.join('، ')}`).join('\n\n');
        const prompt = `شما یک مربی حرفه‌ای بدنسازی هستید که برای یک شاگرد برنامه تمرینی طراحی می‌کنید. اطلاعات شاگرد: - نام: ${clientName} - سن: ${age} - جنسیت: ${gender} - قد: ${heightCm} سانتی‌متر - وزن: ${weightKg} کیلوگرم - سطح فعالیت روزانه: ${activityText} - هدف اصلی: ${trainingGoal} - تعداد روزهای تمرین در هفته: ${trainingDays}. وظیفه شما: یک برنامه تمرینی هفتگی ساختاریافته بر اساس هدف و اطلاعات شاگرد ایجاد کنید. دستورالعمل‌ها: ۱. یک برنامه تمرینی با دقیقا ${trainingDays} روز تمرین در هفته طراحی کنید. روزهای استراحت را در نظر بگیرید (برای روزهای استراحت کارت تمرین ایجاد نکنید). ۲. یک تقسیم‌بندی منطقی برای روزهای تمرین ایجاد کنید (مانند Push/Pull/Legs، بالا تنه/پایین تنه، یا فول بادی). ۳. برای هر حرکت، شما باید نام گروه عضلانی و نام حرکت را **دقیقا** از لیست زیر انتخاب کنید. از خودتان حرکت جدیدی نسازید. ۴. تعداد ست، تکرار و زمان استراحت (به ثانیه) معقول و مناسب با هدف شاگرد برای هر حرکت تعیین کنید. ۵. برای هر روز تمرین یک یادداشت کوتاه و انگیزشی بنویسید. لیست حرکات مجاز: ${allExercises}. خروجی شما باید **فقط و فقط** یک آبجکت JSON باشد که به طور کامل از اسکیمای ارائه‌شده پیروی کند. هیچ متن یا فرمت Markdown قبل یا بعد از آبجکت JSON قرار ندهید.`;
        const schema = { type: Type.OBJECT, properties: { plan: { type: Type.ARRAY, description: 'آرایه‌ای از آبجکت‌های مربوط به روزهای تمرین.', items: { type: Type.OBJECT, properties: { dayTitle: { type: Type.STRING, description: 'عنوان روز تمرین، مثال: "روز اول: سینه و پشت بازو"' }, exercises: { type: Type.ARRAY, description: 'لیستی از حرکات برای این روز.', items: { type: Type.OBJECT, properties: { muscleGroup: { type: Type.STRING, description: 'گروه عضلانی حرکت از لیست ارائه شده.' }, exerciseName: { type: Type.STRING, description: 'نام حرکت از لیست ارائه شده.' }, sets: { type: Type.INTEGER, description: 'تعداد ست، معمولا بین ۳ تا ۵.' }, reps: { type: Type.INTEGER, description: 'تعداد تکرار هدف، مثال: 10.' }, rest: { type: Type.INTEGER, description: 'زمان استراحت به ثانیه، مثال: 60.' } }, required: ['muscleGroup', 'exerciseName', 'sets', 'reps', 'rest'] } }, notes: { type: Type.STRING, description: 'یادداشت‌های اختیاری برای این روز.' } }, required: ['dayTitle', 'exercises'] } } } };
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
        const planData = JSON.parse(response.text);
        populatePlanFromAI(planData);
    } catch (error) {
        showToast('خطایی در ایجاد برنامه با هوش مصنوعی رخ داد.', 'error');
        console.error('AI Plan Generation Error:', error);
    } finally {
        generatePlanBtn.classList.remove('is-loading'); generatePlanBtn.disabled = false;
    }
}

function populatePlanFromAI(planData: any) {
    const container = document.getElementById('workout-days-container') as HTMLElement;
    if (!container || !planData || !planData.plan) { console.error('Invalid data or container for populating AI plan.'); return; }
    container.innerHTML = '';
    planData.plan.forEach((day: any, index: number) => {
        addDayCard(index === 0);
        const newDayCard = container.children[container.children.length - 1] as HTMLElement;
        (newDayCard.querySelector('.day-title-input') as HTMLInputElement).value = day.dayTitle;
        (newDayCard.querySelector('.day-notes-input') as HTMLTextAreaElement).value = day.notes || '';
        const exerciseList = newDayCard.querySelector('.exercise-list') as HTMLElement;
        exerciseList.innerHTML = ''; 
        day.exercises.forEach((ex: any) => {
            addExerciseRow(exerciseList);
            const newExerciseRow = exerciseList.children[exerciseList.children.length - 1] as HTMLElement;
            const muscleSelect = newExerciseRow.querySelector('.muscle-group-select') as HTMLSelectElement;
            const exerciseSelect = newExerciseRow.querySelector('.exercise-select') as HTMLSelectElement;
            let foundMuscleGroup = ex.muscleGroup;
            if (!exerciseDB[foundMuscleGroup] || !exerciseDB[foundMuscleGroup].includes(ex.exerciseName)) foundMuscleGroup = Object.keys(exerciseDB).find(group => exerciseDB[group].includes(ex.exerciseName));
            if (foundMuscleGroup) { muscleSelect.value = foundMuscleGroup; populateExercises(foundMuscleGroup, exerciseSelect); exerciseSelect.value = ex.exerciseName; } 
            else { const defaultGroup = Object.keys(exerciseDB)[0]; muscleSelect.value = defaultGroup; populateExercises(defaultGroup, exerciseSelect); const newOpt = document.createElement('option'); newOpt.value = ex.exerciseName; newOpt.textContent = ex.exerciseName; newOpt.selected = true; exerciseSelect.appendChild(newOpt); }
            const setSlider = newExerciseRow.querySelector('.set-slider') as HTMLInputElement;
            const repSlider = newExerciseRow.querySelector('.rep-slider') as HTMLInputElement;
            const restSlider = newExerciseRow.querySelector('.rest-slider') as HTMLInputElement;
            setSlider.value = ex.sets; (newExerciseRow.querySelector('.set-value') as HTMLElement).textContent = ex.sets;
            repSlider.value = ex.reps; (newExerciseRow.querySelector('.rep-value') as HTMLElement).textContent = ex.reps;
            restSlider.value = ex.rest; (newExerciseRow.querySelector('.rest-value') as HTMLElement).textContent = `${ex.rest}s`;
            [setSlider, repSlider, restSlider].forEach(slider => updateSliderBackground(slider));
        });
    });
    window.lucide.createIcons();
    saveCurrentState();
}

const updatePasswordStrength = (password: string) => {
    const strengthText = document.getElementById('password-strength-text') as HTMLElement;
    const strengthBar = document.getElementById('strength-bar') as HTMLElement;
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    strengthBar.className = 'h-full rounded-full transition-all duration-300';

    if (password.length === 0) {
        strengthText.textContent = '';
        strengthBar.style.width = '0%';
        return;
    }

    if (score <= 1 || password.length < 6) {
        strengthText.textContent = 'ضعیف';
        strengthText.style.color = '#ef4444'; // red-500
        strengthBar.classList.add('strength-weak');
        strengthBar.style.width = '33%';
    } else if (score <= 3) {
        strengthText.textContent = 'متوسط';
        strengthText.style.color = '#f97316'; // orange-500
        strengthBar.classList.add('strength-medium');
        strengthBar.style.width = '66%';
    } else {
        strengthText.textContent = 'قوی';
        strengthText.style.color = '#22c55e'; // green-500
        strengthBar.classList.add('strength-strong');
        strengthBar.style.width = '100%';
    }
};

const validateEmail = (email: string) => {
    const emailValidIcon = document.getElementById('email-valid-icon') as HTMLElement;
    const emailInput = document.getElementById('signup-email-input') as HTMLInputElement;
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (emailRegex.test(email)) {
        emailValidIcon.classList.remove('hidden');
        emailInput.classList.remove('input-error');
        emailInput.classList.add('input-success');
    } else {
        emailValidIcon.classList.add('hidden');
        emailInput.classList.remove('input-success');
    }
};

const setupAuthScreen = () => {
    // Motivational Quote
    const quoteContainer = document.getElementById('motivational-quote-container');
    if (quoteContainer) {
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        quoteContainer.innerHTML = `
            <h1 class="text-4xl font-extrabold" style="text-shadow: 2px 2px 8px rgba(0,0,0,0.7);">${randomQuote.quote}</h1>
            <p class="mt-2 text-lg text-gray-200" style="text-shadow: 1px 1px 4px rgba(0,0,0,0.7);">${randomQuote.author}</p>
        `;
    }

    // Welcome back message
    const lastUser = localStorage.getItem('fitgympro_last_user');
    const welcomeContainer = document.getElementById('welcome-back-container');
    const defaultHeader = document.getElementById('login-default-header');
    if (lastUser && welcomeContainer && defaultHeader) {
        (document.getElementById('welcome-back-username') as HTMLElement).textContent = lastUser;
        (document.getElementById('login-username-input') as HTMLInputElement).value = lastUser;
        welcomeContainer.classList.remove('hidden');
        defaultHeader.classList.add('hidden');
    }
};

const debounce = (func: Function, delay: number) => {
    let timeout: number;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => func(...args), delay);
    };
};

const checkUsername = async () => {
    const usernameInput = document.getElementById('signup-username-input') as HTMLInputElement;
    const username = usernameInput.value.trim();
    const iconContainer = document.getElementById('username-valid-icon-container') as HTMLElement;
    const errorEl = document.getElementById('signup-username-error') as HTMLElement;

    if (username.length < 3) {
        iconContainer.innerHTML = '';
        usernameInput.classList.remove('input-error', 'input-success');
        errorEl.textContent = '';
        return;
    }
    
    iconContainer.innerHTML = `<i data-lucide="loader-circle" class="w-5 h-5 text-secondary animate-spin"></i>`;
    window.lucide.createIcons();

    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getUsers();
    const isTaken = users.some((u: any) => u.username.toLowerCase() === username.toLowerCase());
    const isReserved = username.toLowerCase() === 'admin';

    if (isTaken || isReserved) {
        iconContainer.innerHTML = `<i data-lucide="x-circle" class="w-5 h-5 text-red-500"></i>`;
        usernameInput.classList.add('input-error');
        usernameInput.classList.remove('input-success');
        errorEl.textContent = isReserved ? 'این نام کاربری رزرو شده است.' : 'این نام کاربری قبلا استفاده شده است.';
    } else {
        iconContainer.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5 text-green-500"></i>`;
        usernameInput.classList.remove('input-error');
        usernameInput.classList.add('input-success');
        errorEl.textContent = '';
    }
    window.lucide.createIcons();
};

const togglePasswordVisibility = (button: HTMLButtonElement) => {
    const input = button.previousElementSibling as HTMLInputElement;
    const icon = button.querySelector('i') as HTMLElement;
    if (input.type === "password") {
        input.type = "text";
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        input.type = "password";
        icon.setAttribute('data-lucide', 'eye');
    }
    window.lucide.createIcons();
};


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Initial Setup ---
    const lastUser = localStorage.getItem('fitgympro_last_user');
    if (lastUser) {
        if (lastUser === 'admin') {
            loginAsAdmin();
        } else {
            loginAsUser(lastUser);
        }
    } else {
       setupAuthScreen();
       switchAuthTab('login');
    }

    populateSupplements();
    addDayCard(true); // Add the first day card for the admin panel
    updateUI();
    initializeAI();
    window.lucide.createIcons();
    
    // --- Event Listeners ---
    
    // Theme Toggler
    const themeToggler = () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('fitgympro_theme', newTheme);
    };
    
    // Check for saved theme
    const savedTheme = localStorage.getItem('fitgympro_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    document.getElementById('theme-toggle-btn')?.addEventListener('click', themeToggler);
    document.getElementById('theme-toggle-btn-dashboard')?.addEventListener('click', themeToggler);
    
    // Auth Screen Listeners
    authLoginTab.addEventListener('click', () => switchAuthTab('login'));
    authSignupTab.addEventListener('click', () => switchAuthTab('signup'));
    
    document.getElementById('submit-login-btn')?.addEventListener('click', handleUserLogin);
    document.getElementById('login-password-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserLogin(); });
    
    document.getElementById('submit-signup-btn')?.addEventListener('click', handleUserSignup);
    document.getElementById('signup-password-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserSignup(); });
    
    document.getElementById('forgot-password-link')?.addEventListener('click', () => {
        authLoginForm.classList.remove('active-in');
        authSignupForm.classList.remove('active-in');
        authRecoveryForm.classList.add('active-in');
        (document.getElementById('recovery-email-input') as HTMLInputElement).focus();
    });

    const goBackToLogin = () => {
        authRecoveryForm.classList.remove('active-in');
        switchAuthTab('login');
        (document.getElementById('recovery-success-message') as HTMLElement).classList.add('hidden');
        (document.getElementById('recovery-form-content') as HTMLElement).classList.remove('hidden');
    };
    document.getElementById('back-to-login-btn')?.addEventListener('click', goBackToLogin);
    document.getElementById('recovery-back-to-login-btn')?.addEventListener('click', goBackToLogin);

    document.getElementById('submit-recovery-btn')?.addEventListener('click', () => {
        const email = (document.getElementById('recovery-email-input') as HTMLInputElement).value;
        if (email) {
            (document.getElementById('recovery-form-content') as HTMLElement).classList.add('hidden');
            (document.getElementById('recovery-success-message') as HTMLElement).classList.remove('hidden');
        } else {
            (document.getElementById('recovery-email-error') as HTMLElement).textContent = 'لطفا ایمیل را وارد کنید.';
        }
    });
    
    document.getElementById('signup-password-input')?.addEventListener('input', (e) => updatePasswordStrength((e.target as HTMLInputElement).value));
    document.getElementById('signup-email-input')?.addEventListener('input', (e) => validateEmail((e.target as HTMLInputElement).value));
    
    const debouncedCheckUsername = debounce(checkUsername, 500);
    document.getElementById('signup-username-input')?.addEventListener('input', debouncedCheckUsername);
    
    document.body.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const button = target.closest('.password-toggle-btn') as HTMLButtonElement;
        if (button) {
            togglePasswordVisibility(button);
        }
    });

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('logout-btn-dashboard')?.addEventListener('click', logout);

    // Admin Panel
    adminPanelBtn.addEventListener('click', showAdminPanel);
    document.getElementById('close-admin-panel-btn')?.addEventListener('click', hideAdminPanel);
    document.getElementById('close-client-detail-btn')?.addEventListener('click', hideClientDetailPanel);
    adminPanelModal.addEventListener('click', (e) => { if (e.target === adminPanelModal) hideAdminPanel(); });

    document.getElementById('admin-main-nav')?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const btn = target.closest('.admin-nav-btn');
        if (btn) {
            const view = btn.getAttribute('data-view') as 'clients' | 'stats';
            if (view) switchAdminView(view);
        }
    });
    document.getElementById('create-user-btn')?.addEventListener('click', createUser);
    
    const filterAndSearchClients = () => {
        const filter = (document.querySelector('#admin-user-filters .active') as HTMLElement)?.dataset.filter || 'all';
        const searchTerm = (document.getElementById('admin-user-search') as HTMLInputElement).value;
        renderClientManagementView(filter, searchTerm);
    };
    
    document.getElementById('admin-user-filters')?.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const btn = target.closest('.admin-filter-btn') as HTMLButtonElement;
        if (btn) {
            document.querySelectorAll('#admin-user-filters .admin-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterAndSearchClients();
        }
    });

    const debouncedSearch = debounce(filterAndSearchClients, 300);
    document.getElementById('admin-user-search')?.addEventListener('input', debouncedSearch);

    document.getElementById('admin-user-list')?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const username = (target.closest('[data-username]') as HTMLElement)?.dataset.username;
        if (!username) return;

        if (target.closest('.delete-user-btn')) deleteUser(username);
        else if (target.closest('.load-user-btn')) loadUserForEditing(username);
        else if (target.closest('.view-client-btn')) showClientDetailPanel(username);
        else if (target.closest('.toggle-payment-btn')) {
            const userData = getUserData(username);
            userData.hasPaid = !userData.hasPaid;
            saveUserData(username, userData);
            filterAndSearchClients();
        }
    });

    document.getElementById('load-client-for-edit-btn')?.addEventListener('click', (e) => {
        const username = (e.currentTarget as HTMLButtonElement).dataset.username;
        if (username) loadUserForEditing(username);
    });

    // Stepper Navigation
    document.getElementById('prev-btn')?.addEventListener('click', () => navigateToStep(findNextEnabledStep(currentStep, -1)));
    document.getElementById('next-btn')?.addEventListener('click', () => navigateToStep(findNextEnabledStep(currentStep, 1)));
    document.querySelectorAll('.stepper-item').forEach((item, i) => {
        item.addEventListener('click', () => { if (!item.classList.contains('disabled')) navigateToStep(i + 1); });
    });

    // Section 1: Body Metrics Calculation
    const s1 = document.getElementById('section-1') as HTMLElement;
    s1.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.classList.contains('range-slider') || target.classList.contains('neck-input') || target.classList.contains('waist-input') || target.classList.contains('hip-input')) {
            calculateBodyMetrics(s1);
        }
    });
    s1.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.classList.contains('gender') || target.classList.contains('activity-level')) {
            if (target.classList.contains('gender')) toggleHipInput(s1);
            calculateBodyMetrics(s1);
        }
        saveCurrentState();
    });
     s1.addEventListener('blur', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.classList.contains('input-field')) {
           saveCurrentState();
        }
    }, true);
    
    // User Dashboard Listeners
    const dashboardPanel = document.getElementById('dashboard-profile-panel') as HTMLElement;
    if (dashboardPanel) {
        dashboardPanel.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.classList.contains('range-slider') || target.classList.contains('neck-input') || target.classList.contains('waist-input') || target.classList.contains('hip-input')) {
                calculateBodyMetrics(dashboardPanel);
            }
        });
        
        const saveAndRecalculateDashboard = () => {
            calculateBodyMetrics(dashboardPanel);
            saveDashboardState();
            // regenerate preview
            loadStateIntoApp(getUserData(currentUser!));
            generateProgramPreview(document.getElementById('program-builder-form')!, '#dashboard-program-view');
        };
        
        dashboardPanel.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.classList.contains('gender') || target.classList.contains('activity-level') || target.classList.contains('training-goal') || target.classList.contains('training-days')) {
                if (target.classList.contains('gender')) toggleHipInput(dashboardPanel);
                saveAndRecalculateDashboard();
            }
        });
        
        const debouncedSaveDashboard = debounce(saveAndRecalculateDashboard, 1000);
        dashboardPanel.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            if (!target.classList.contains('range-slider')) {
                debouncedSaveDashboard();
            }
        });
    }

    document.getElementById('confirm-info-btn')?.addEventListener('click', (e) => {
        if (!currentUser) return;
        const userData = getUserData(currentUser);
        userData.infoConfirmed = true;
        saveUserData(currentUser, userData);
        populateDashboard(currentUser, userData);
        showToast('اطلاعات شما با موفقیت تایید شد.', 'success');
    });

    document.getElementById('pay-program-btn')?.addEventListener('click', () => {
        showToast('درگاه پرداخت در حال آماده‌سازی است...', 'success');
    });


    // Section 2: Day & Exercise Management (using event delegation)
    const form = document.getElementById('program-builder-form')!;
    form.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.add-day-btn')) addDayCard();
        if (target.closest('.remove-day-btn')) target.closest('.day-card')?.remove();
        if (target.closest('.add-exercise-btn')) addExerciseRow(target.closest('.day-card')!.querySelector('.exercise-list')!);
        if (target.closest('.remove-exercise-btn')) target.closest('.exercise-row')?.remove();
        if (target.closest('.superset-btn')) {
            const btn = target.closest('.superset-btn')!;
            btn.classList.toggle('active');
            btn.closest('.exercise-row')?.classList.toggle('is-superset');
        }
    });

    form.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        if (target.classList.contains('muscle-group-select')) {
            const exerciseSelect = target.closest('.exercise-row')!.querySelector('.exercise-select') as HTMLSelectElement;
            populateExercises(target.value, exerciseSelect);
        }
        saveCurrentState();
    });

    form.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.classList.contains('range-slider')) {
            updateSliderBackground(target);
            const valueSpan = target.parentElement?.querySelector('span');
            if (valueSpan) {
                let suffix = '';
                if (target.classList.contains('rest-slider')) suffix = 's';
                else if (target.classList.contains('height-slider')) suffix = ' cm';
                else if (target.classList.contains('weight-slider')) suffix = ' kg';
                valueSpan.textContent = target.value + suffix;
            }
        }
    });
    
    // For range sliders that are outside the form
    document.body.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.classList.contains('range-slider') && !form.contains(target)) {
            updateSliderBackground(target);
            const valueSpan = target.parentElement?.querySelector('span');
             if (valueSpan) {
                let suffix = '';
                if (target.classList.contains('rest-slider')) suffix = 's';
                else if (target.classList.contains('height-slider')) suffix = ' cm';
                else if (target.classList.contains('weight-slider')) suffix = ' kg';
                valueSpan.textContent = target.value + suffix;
            }
        }
    });

    // Profile Pic Upload
    document.body.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.classList.contains('profile-pic-input')) {
            const file = target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const previews = document.querySelectorAll(`.${target.id}-preview, .${target.classList[0]}-preview`);
                    previews.forEach(p => (p as HTMLImageElement).src = event.target?.result as string);
                    if (currentUser === 'admin') saveCurrentState();
                    else saveDashboardState();
                };
                reader.readAsDataURL(file);
            }
        }
    });

    // AI Buttons
    document.getElementById('get-ai-suggestion-btn')?.addEventListener('click', getAISuggestion);
    document.getElementById('ai-question-input')?.addEventListener('input', (e) => {
        const input = e.target as HTMLInputElement;
        (document.getElementById('get-ai-suggestion-btn') as HTMLButtonElement).disabled = input.value.trim() === '';
    });
    document.getElementById('ai-question-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') getAISuggestion(); });

    document.getElementById('generate-ai-plan-btn')?.addEventListener('click', generateAIPlan);

    // Section 4: Actions
    document.getElementById('save-pdf-btn')?.addEventListener('click', saveAsPdf);
    document.getElementById('dashboard-save-pdf-btn')?.addEventListener('click', saveAsPdf);
    document.getElementById('save-word-btn')?.addEventListener('click', saveAsWord);
    document.getElementById('send-program-btn')?.addEventListener('click', sendProgramToUser);
    document.getElementById('save-changes-btn')?.addEventListener('click', saveProgramChanges);
    
    // Auto-save on form element blur for admin
    form.addEventListener('blur', (e) => {
        const target = e.target as HTMLElement;
        if (target.matches('input, textarea, select')) {
            saveCurrentState();
        }
    }, true);
    
    // Supplement search
    document.getElementById('supplement-search')?.addEventListener('input', (e) => {
        const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
        document.querySelectorAll('.supplement-item').forEach(item => {
            const label = item.querySelector('span')?.textContent?.toLowerCase() || '';
            const shouldShow = label.includes(searchTerm);
            (item as HTMLElement).style.display = shouldShow ? 'flex' : 'none';
        });
    });
});
