import { openModal } from '../utils/dom';
import { getSiteSettings, getUsers, getUserData, getStorePlans, getMagazineArticles } from '../services/storage';
import { performMetricCalculations, calculateMacros } from '../utils/calculations';
import { formatPrice, timeAgo } from '../utils/helpers';

const createGauge = (id: string, label: string) => `
    <div class="gauge-container !p-2">
        <h4 class="gauge-label !mb-1 !text-sm">${label}</h4>
        <div class="gauge-svg-wrapper !w-28 !h-28 !my-0">
            <svg class="gauge-svg" viewBox="0 0 160 160">
                <circle class="gauge-track-circle" r="70" cx="80" cy="80"></circle>
                <circle id="${id}-arc" class="gauge-value-circle" r="70" cx="80" cy="80" style="stroke-dasharray: 440; stroke-dashoffset: 440;"></circle>
            </svg>
            <div class="gauge-text-content">
                <span id="${id}-value" class="gauge-value-text !text-2xl">--</span>
                <span id="${id}-unit" class="gauge-unit-text"></span>
            </div>
        </div>
        <div id="${id}-sub-info" class="gauge-sub-info !pt-1 !h-8"></div>
    </div>
`;

const renderCalculator = () => `
    <section id="fitness-calculator" class="py-16">
        <div class="container mx-auto px-4">
            <div class="calculator-wrapper !p-8">
                <div class="text-center mb-10">
                    <h2 class="text-3xl lg:text-4xl font-extrabold text-white">محاسبه‌گر پیشرفته تناسب اندام</h2>
                    <p class="mt-3 text-slate-400 max-w-2xl mx-auto">
                        اطلاعات خود را وارد کنید تا یک تحلیل کامل از وضعیت بدن و نیازهای روزانه خود دریافت کنید.
                    </p>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-5 gap-x-8 gap-y-8">

                    <!-- Right Column (on RTL): INPUTS -->
                    <div class="lg:col-span-3">
                        <div id="calculator-inputs" class="space-y-6">
                            <!-- Basic Info Section -->
                            <div class="calculator-input-section">
                                <h3 class="!mb-4"><span>۱</span>اطلاعات پایه</h3>
                                <div class="space-y-4">
                                    <div class="calculator-radio-group grid grid-cols-12 items-center gap-x-4">
                                        <p class="font-semibold text-sm text-slate-300 col-span-3">جنسیت</p>
                                        <div class="grid grid-cols-2 gap-2 col-span-9">
                                            <label class="option-card-label"><input type="radio" name="gender_calc" value="مرد" class="option-card-input" checked><span class="option-card-content !py-2">مرد</span></label>
                                            <label class="option-card-label"><input type="radio" name="gender_calc" value="زن" class="option-card-input"><span class="option-card-content !py-2">زن</span></label>
                                        </div>
                                    </div>
                                    
                                    <div class="slider-container-blue grid grid-cols-12 items-center gap-x-4">
                                        <p class="font-semibold text-sm text-slate-300 col-span-3">سن</p>
                                        <input type="range" id="age-slider" class="calculator-slider col-span-6" min="15" max="80" value="25">
                                        <input type="number" id="age-input" class="calculator-styled-input col-span-3 w-full" min="15" max="80" value="25">
                                    </div>

                                    <div class="slider-container-green grid grid-cols-12 items-center gap-x-4">
                                        <p class="font-semibold text-sm text-slate-300 col-span-3">قد (cm)</p>
                                        <input type="range" id="height-slider" class="calculator-slider col-span-6" min="140" max="220" value="175">
                                        <input type="number" id="height-input" class="calculator-styled-input col-span-3 w-full" min="140" max="220" value="175">
                                    </div>

                                    <div class="slider-container-orange grid grid-cols-12 items-center gap-x-4">
                                        <p class="font-semibold text-sm text-slate-300 col-span-3">وزن (kg)</p>
                                        <input type="range" id="weight-slider" class="calculator-slider col-span-6" min="40" max="150" step="0.5" value="75">
                                        <input type="number" id="weight-input" class="calculator-styled-input col-span-3 w-full" min="40" max="150" step="0.5" value="75.0">
                                    </div>
                                </div>
                            </div>
                            <!-- Lifestyle & Goals Section -->
                            <div class="calculator-input-section">
                                <h3 class="!mb-4"><span>۲</span>سبک زندگی و اهداف</h3>
                                <div class="space-y-4">
                                    <div class="calculator-radio-group">
                                        <p class="font-semibold text-sm mb-2 text-slate-300">هدف تمرینی</p>
                                        <div class="grid grid-cols-3 gap-2">
                                            <label class="option-card-label"><input type="radio" name="goal_calc" value="کاهش وزن" class="option-card-input"><span class="option-card-content !py-2">کاهش وزن</span></label>
                                            <label class="option-card-label"><input type="radio" name="goal_calc" value="حفظ وزن" class="option-card-input" checked><span class="option-card-content !py-2">حفظ وزن</span></label>
                                            <label class="option-card-label"><input type="radio" name="goal_calc" value="افزایش حجم" class="option-card-input"><span class="option-card-content !py-2">افزایش حجم</span></label>
                                        </div>
                                    </div>
                                    <div class="calculator-radio-group">
                                        <p class="font-semibold text-sm mb-2 text-slate-300">سطح فعالیت روزانه</p>
                                        <div class="grid grid-cols-3 gap-2">
                                            <label class="option-card-label"><input type="radio" name="activity_level_calc" value="1.2" class="option-card-input"><span class="option-card-content !py-2 !text-xs">نشسته</span></label>
                                            <label class="option-card-label"><input type="radio" name="activity_level_calc" value="1.375" class="option-card-input"><span class="option-card-content !py-2 !text-xs">کم</span></label>
                                            <label class="option-card-label"><input type="radio" name="activity_level_calc" value="1.55" class="option-card-input" checked><span class="option-card-content !py-2 !text-xs">متوسط</span></label>
                                            <label class="option-card-label"><input type="radio" name="activity_level_calc" value="1.725" class="option-card-input"><span class="option-card-content !py-2 !text-xs">زیاد</span></label>
                                            <label class="option-card-label"><input type="radio" name="activity_level_calc" value="1.9" class="option-card-input"><span class="option-card-content !py-2 !text-xs">خیلی زیاد</span></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Left Column (on RTL): RESULTS -->
                    <div class="lg:col-span-2">
                        <div id="calculator-results" class="hidden sticky top-24">
                            <div class="text-center mb-4">
                                <h3 class="text-xl font-bold text-white">نتایج تحلیل شما</h3>
                                <div class="w-16 h-1 bg-accent mx-auto mt-2 rounded-full"></div>
                            </div>
                            <div class="space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                  ${createGauge('tdee-gauge', 'کالری روزانه')}
                                  ${createGauge('bmi-gauge', 'شاخص BMI')}
                                </div>
                                <div class="result-card-small">
                                     <div class="grid grid-cols-2 gap-4 text-center">
                                         <div>
                                            <p id="bodyfat-value" class="text-xl font-bold text-slate-200">--</p>
                                            <p class="text-xs text-slate-400">درصد چربی (%)</p>
                                        </div>
                                        <div>
                                            <p id="lbm-value" class="text-xl font-bold text-slate-200">--</p>
                                            <p class="text-xs text-slate-400">توده بدون چربی (kg)</p>
                                        </div>
                                     </div>
                                     <hr class="border-slate-700 my-3">
                                     <h4 class="font-semibold text-slate-300 text-sm mb-2 text-center">ماکروهای پیشنهادی (گرم)</h4>
                                     <div class="space-y-2 text-xs">
                                        <div class="flex justify-between items-center"><span>پروتئین</span><strong id="protein-value">--</strong></div>
                                        <div class="macro-bar"><div id="protein-bar" class="macro-bar-inner bg-sky-500" style="width: 0%;"></div></div>
                                        <div class="flex justify-between items-center"><span>کربوهیدرات</span><strong id="carbs-value">--</strong></div>
                                        <div class="macro-bar"><div id="carbs-bar" class="macro-bar-inner bg-orange-500" style="width: 0%;"></div></div>
                                        <div class="flex justify-between items-center"><span>چربی</span><strong id="fat-value">--</strong></div>
                                        <div class="macro-bar"><div id="fat-bar" class="macro-bar-inner bg-yellow-500" style="width: 0%;"></div></div>
                                     </div>
                                </div>
                            </div>
                            <!-- CTA Button -->
                            <div class="text-center mt-6">
                                <button id="get-plan-from-calc-btn" class="primary-button !bg-accent !text-black !px-8 !py-2.5 !text-base !rounded-md animate-pulse-accent">دریافت برنامه شخصی‌سازی شده</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
`;

const renderCoaches = async () => {
    const allUsers = await getUsers();
    const coachUsernames = ["morteza_heydari", "hamid_hajati", "coach10186"];
    const coachPromises = coachUsernames.map(async username => {
        const user = allUsers.find((u: any) => u.username === username);
        if(user && user.coachStatus === 'verified') {
            const data = await getUserData(username);
            return { user, data };
        }
        return null;
    });
    
    const coaches = (await Promise.all(coachPromises)).filter(Boolean);

    return `
    <section id="coaches" class="py-16">
        <div class="container mx-auto px-4">
            <div class="text-center mb-10">
                <h2 class="text-3xl lg:text-4xl font-extrabold text-white">با مربیان متخصص ما آشنا شوید</h2>
                <p class="mt-4 text-slate-400 max-w-2xl mx-auto">
                    تیمی از بهترین مربیان کشور که آماده‌اند تا شما را در مسیر رسیدن به اهدافتان همراهی کنند.
                </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${coaches.map((c: any) => {
                    const name = c.data.step1?.clientName || c.user.username;
                    const specialization = c.data.profile?.specialization || "مربی رسمی بدنسازی";
                    const avatar = c.data.profile?.avatar;
                    const avatarHtml = avatar
                        ? `<img src="${avatar}" alt="${name}" class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-700 object-cover">`
                        : `<div class="w-24 h-24 rounded-full mx-auto mb-4 bg-slate-700 flex items-center justify-center font-bold text-3xl">${name.charAt(0)}</div>`;

                    return `
                    <div class="coach-card-revert">
                        ${avatarHtml}
                        <h3 class="text-xl font-bold text-white">${name}</h3>
                        <p class="text-accent font-semibold text-sm mt-1">${specialization}</p>
                        <div class="flex justify-center gap-4 mt-4 text-slate-400">
                           <a href="#" class="hover:text-white"><i data-lucide="instagram" class="w-5 h-5"></i></a>
                           <a href="#" class="hover:text-white"><i data-lucide="send" class="w-5 h-5"></i></a>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
    </section>
    `;
};

const renderPricing = async () => {
    const plans = await getStorePlans();
    if (!plans || plans.length === 0) return '';

    return `
    <section id="pricing" class="py-16">
        <div class="container mx-auto px-4">
            <div class="text-center mb-10">
                <h2 class="text-3xl lg:text-4xl font-extrabold text-white">تعرفه‌های شفاف و منعطف</h2>
                <p class="mt-4 text-slate-400 max-w-2xl mx-auto">
                    پلنی را انتخاب کنید که کاملاً با نیازها و بودجه شما مطابقت دارد.
                </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
                ${plans.map((plan: any) => `
                    <div class="pricing-card ${plan.recommended ? 'recommended' : ''}">
                        ${plan.recommended ? '<div class="recommended-badge">پیشنهادی</div>' : ''}
                        <div class="p-8">
                            <h3 class="text-xl font-bold text-white">${plan.emoji || ''} ${plan.planName}</h3>
                            <p class="text-sm text-slate-400 mt-2 h-10">${plan.description}</p>
                            <div class="my-6">
                                <span class="text-4xl font-extrabold text-white">${formatPrice(plan.price).split(' ')[0]}</span>
                                <span class="text-slate-400">/ تومان</span>
                            </div>
                            <ul class="space-y-3 text-sm text-slate-300">
                                ${(plan.features || []).map((feature: string) => `
                                    <li class="flex items-center gap-3">
                                        <i data-lucide="check" class="w-5 h-5 text-accent"></i>
                                        <span>${feature}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        <div class="p-6 pt-0">
                             <button class="select-plan-btn primary-button !bg-accent !text-black w-full !text-base !py-3 !rounded-md" data-plan-id="${plan.planId}">انتخاب پلن</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    `;
};

const renderMagazine = async () => {
    const articles = await getMagazineArticles();
    if (!articles || articles.length === 0) return '';
    const latestArticles = articles.slice(0, 2); 

    return `
    <section id="magazine" class="py-16">
        <div class="container mx-auto px-4">
            <div class="text-center mb-10">
                <h2 class="text-3xl lg:text-4xl font-extrabold text-white">آخرین مقالات مجله FitGym Pro</h2>
                <p class="mt-4 text-slate-400 max-w-2xl mx-auto">
                    دانش خود را با مقالات علمی و کاربردی در زمینه تناسب اندام، تغذیه و سبک زندگی سالم افزایش دهید.
                </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                ${latestArticles.map((article: any) => `
                    <a href="#" class="magazine-card-revert group">
                        <img src="${article.imageUrl}" alt="${article.title}" class="w-full h-56 object-cover rounded-t-xl transition-transform duration-300 group-hover:scale-105">
                        <div class="p-6">
                            <p class="text-sm font-semibold text-accent mb-2">${article.category}</p>
                            <h3 class="text-xl font-bold text-white group-hover:text-accent transition-colors">${article.title}</h3>
                            <p class="text-sm text-slate-400 mt-3 line-clamp-3">${article.content.split(' ').slice(0, 30).join(' ')}...</p>
                            <div class="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500">
                                <span>${timeAgo(article.publishDate)}</span>
                            </div>
                        </div>
                    </a>
                `).join('')}
            </div>
        </div>
    </section>
    `;
};

export const renderLandingPage = async () => {
    const settings = await getSiteSettings();
    const { siteName, contactInfo, socialMedia } = settings;

    return `
    <div class="landing-page-revert">
        <div class="hero-section-wrapper">
            <header class="landing-header absolute top-0 left-0 right-0 z-10 py-4">
                 <div class="container mx-auto px-4 flex justify-between items-center">
                    <a href="#" class="text-2xl font-black text-white">${siteName}</a>
                    <nav class="hidden lg:flex items-center gap-6 text-white/80">
                        <a href="#coaches" class="landing-nav-link">مربیان</a>
                        <a href="#pricing" class="landing-nav-link">تعرفه</a>
                        <a href="#magazine" class="landing-nav-link">مجله FitGym Pro</a>
                        <a href="#contact" class="landing-nav-link">تماس با ما</a>
                    </nav>
                    <button id="login-btn-landing" class="primary-button !bg-accent !text-black !py-2 !px-5 !rounded-md">ورود / ثبت نام</button>
                </div>
            </header>
            <main>
                <section class="hero-section text-white text-center pt-32 pb-20">
                     <div class="container mx-auto px-4">
                        <h1 class="text-4xl lg:text-6xl font-extrabold leading-tight animate-fade-in-down">
                           آینده تناسب اندام اینجاست
                        </h1>
                        <p class="mt-6 text-lg text-white/70 max-w-2xl mx-auto animate-fade-in-up">
                           برنامه‌های تمرینی و غذایی شخصی‌سازی شده با قدرت هوش مصنوعی. به اهداف خود سریع‌تر و هوشمندانه‌تر برسید.
                        </p>
                        <div class="mt-8 animate-fade-in-up animation-delay-200">
                             <a href="#fitness-calculator" class="primary-button !bg-accent !text-black !px-10 !py-3 !text-base !rounded-md">شروع کنید</a>
                        </div>
                    </div>
                </section>
            </main>
        </div>
        <div class="bg-[#0B1222]">
            ${renderCalculator()}
            ${await renderCoaches()}
            ${await renderPricing()}
            ${await renderMagazine()}
            <footer id="contact" class="bg-[#101A2E] py-12 border-t border-white/10 mt-16">
                 <div class="container mx-auto px-4 text-center text-white/50 text-sm">
                    <p class="font-bold text-lg mb-4 text-white">${siteName}</p>
                    <div class="flex justify-center gap-6 mb-6">
                        <a href="${socialMedia.instagram}" target="_blank" rel="noopener noreferrer" class="hover:text-white"><i data-lucide="instagram" class="w-5 h-5"></i></a>
                        <a href="${socialMedia.telegram}" target="_blank" rel="noopener noreferrer" class="hover:text-white"><i data-lucide="send" class="w-5 h-5"></i></a>
                        <a href="${socialMedia.youtube}" target="_blank" rel="noopener noreferrer" class="hover:text-white"><i data-lucide="youtube" class="w-5 h-5"></i></a>
                    </div>
                    <p class="mb-1">${contactInfo.address}</p>
                    <p>ایمیل: <a href="mailto:${contactInfo.email}" class="hover:text-white">${contactInfo.email}</a> | تلفن: <a href="tel:${contactInfo.phone.replace(/-/g, '')}" class="hover:text-white">${contactInfo.phone}</a></p>
                    <p class="mt-6">&copy; ${new Date().getFullYear()} ${siteName}. تمام حقوق محفوظ است.</p>
                </div>
            </footer>
        </div>
    </div>
    `;
};

const updateCalculatorResults = () => {
    const calculator = document.getElementById('fitness-calculator');
    if (!calculator) return;

    const resultsEl = document.getElementById('calculator-results');
    if (resultsEl && resultsEl.classList.contains('hidden')) {
        resultsEl.classList.remove('hidden');
        resultsEl.classList.add('animate-fade-in');
    }

    const age = parseInt((calculator.querySelector('#age-slider') as HTMLInputElement).value, 10);
    const height = parseInt((calculator.querySelector('#height-slider') as HTMLInputElement).value, 10);
    const weight = parseFloat((calculator.querySelector('#weight-slider') as HTMLInputElement).value);
    const gender = (calculator.querySelector('input[name="gender_calc"]:checked') as HTMLInputElement).value;
    const activityLevel = parseFloat((calculator.querySelector('input[name="activity_level_calc"]:checked') as HTMLInputElement).value);
    const goal = (calculator.querySelector('input[name="goal_calc"]:checked') as HTMLInputElement).value;

    const metrics = performMetricCalculations({ age, height, weight, gender, activityLevel });

    // TDEE Gauge
    const tdeeValueEl = document.getElementById('tdee-gauge-value')!;
    const tdeeUnitEl = document.getElementById('tdee-gauge-unit')!;
    const tdeeArc = document.querySelector<SVGCircleElement>('#tdee-gauge-arc')!;
    const tdeeSubInfo = document.getElementById('tdee-gauge-sub-info')!;
    if (metrics && metrics.tdee) {
        tdeeValueEl.textContent = String(Math.round(metrics.tdee));
        tdeeUnitEl.textContent = 'kcal';
        const circumference = 2 * Math.PI * 70; // r=70
        const normalizedTdee = Math.max(0, Math.min(1, (metrics.tdee - 1000) / (4000 - 1000)));
        const offset = circumference * (1 - normalizedTdee);
        tdeeArc.style.strokeDashoffset = String(offset);
        tdeeSubInfo.innerHTML = `کاهش: ~${Math.round(metrics.tdee - 400)} | افزایش: ~${Math.round(metrics.tdee + 300)}`;
    }

    // BMI Gauge
    const bmiValueEl = document.getElementById('bmi-gauge-value')!;
    const bmiUnitEl = document.getElementById('bmi-gauge-unit')!;
    const bmiArc = document.querySelector<SVGCircleElement>('#bmi-gauge-arc')!;
    const bmiSubInfo = document.getElementById('bmi-gauge-sub-info')!;
    if (metrics && metrics.bmi) {
        const bmi = metrics.bmi;
        bmiValueEl.textContent = bmi.toFixed(1);
        const circumference = 2 * Math.PI * 70;
        const normalizedBmi = Math.max(0, Math.min(1, (bmi - 15) / (40 - 15)));
        const offset = circumference * (1 - normalizedBmi);
        bmiArc.style.strokeDashoffset = String(offset);

        let category = 'نرمال';
        let color = '#22c55e'; // green
        if (bmi < 18.5) { category = 'کمبود وزن'; color = '#3b82f6'; } // blue
        else if (bmi >= 25 && bmi < 30) { category = 'اضافه وزن'; color = '#f59e0b'; } // yellow
        else if (bmi >= 30) { category = 'چاقی'; color = '#ef4444'; } // red
        bmiUnitEl.textContent = category;
        bmiUnitEl.style.color = color;
        bmiArc.style.stroke = color;
        bmiSubInfo.innerHTML = `وزن ایده‌آل: <strong>${metrics.idealWeight || '--'}</strong>`;
    }

    // Other Cards
    if (metrics) {
        const bodyFatEl = document.getElementById('bodyfat-value')!;
        const lbmEl = document.getElementById('lbm-value')!;
        if (metrics.bodyFat && metrics.lbm) {
            bodyFatEl.textContent = metrics.bodyFat.toFixed(1);
            lbmEl.textContent = metrics.lbm.toFixed(1);
        } else {
            bodyFatEl.textContent = '--';
            lbmEl.textContent = '--';
        }
        
        const macros = calculateMacros(metrics.tdee || 0, weight, goal);
        const totalMacros = macros.protein + macros.carbs + macros.fat;
        document.getElementById('protein-value')!.textContent = `${macros.protein}g`;
        document.getElementById('carbs-value')!.textContent = `${macros.carbs}g`;
        document.getElementById('fat-value')!.textContent = `${macros.fat}g`;
        (document.getElementById('protein-bar')! as HTMLElement).style.width = totalMacros > 0 ? `${(macros.protein / totalMacros) * 100}%` : '0%';
        (document.getElementById('carbs-bar')! as HTMLElement).style.width = totalMacros > 0 ? `${(macros.carbs / totalMacros) * 100}%` : '0%';
        (document.getElementById('fat-bar')! as HTMLElement).style.width = totalMacros > 0 ? `${(macros.fat / totalMacros) * 100}%` : '0%';
    }
};

export const initLandingPageListeners = () => {
    // Header scroll effect
    const header = document.querySelector('.landing-page-revert .landing-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

     // Auth modal triggers
    document.body.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('#login-btn-landing')) {
            openModal(document.getElementById('auth-modal'));
        }
        const selectPlanBtn = target.closest('.select-plan-btn');
        if (selectPlanBtn) {
            const planId = (selectPlanBtn as HTMLElement).dataset.planId;
            if (planId) {
                sessionStorage.setItem('fitgympro_selected_plan', planId);
                openModal(document.getElementById('auth-modal'));
            }
        }
    });

    // Calculator listeners
    const calculator = document.getElementById('fitness-calculator');
    if (!calculator) return;
    
    const updateLandingSliderTrack = (slider: HTMLInputElement) => {
        if (!slider) return;
        const min = +slider.min || 0;
        const max = +slider.max || 100;
        const val = +slider.value || 0;
        const percentage = ((val - min) / (max - min)) * 100;

        const parentContainer = slider.closest('[class*="slider-container-"]');
        let accentColor = 'var(--accent)';
        if (parentContainer) {
            if (parentContainer.classList.contains('slider-container-blue')) accentColor = 'var(--admin-accent-blue)';
            else if (parentContainer.classList.contains('slider-container-green')) accentColor = 'var(--admin-accent-green)';
            else if (parentContainer.classList.contains('slider-container-orange')) accentColor = 'var(--admin-accent-orange)';
        }
        const trackColor = '#334155';
        slider.style.background = `linear-gradient(to right, ${accentColor} ${percentage}%, ${trackColor} ${percentage}%)`;
    };

    // Sync sliders and number inputs
    const sliders = calculator.querySelectorAll<HTMLInputElement>('input[type="range"].calculator-slider');
    sliders.forEach(slider => {
        const inputId = slider.id.replace('-slider', '-input');
        const numberInput = calculator.querySelector<HTMLInputElement>(`#${inputId}`);

        if (numberInput) {
            // Sync slider to input
            slider.addEventListener('input', () => {
                numberInput.value = slider.step === '0.5' ? parseFloat(slider.value).toFixed(1) : slider.value;
                updateLandingSliderTrack(slider);
                updateCalculatorResults();
            });

            // Sync input to slider
            numberInput.addEventListener('input', () => {
                let value = parseFloat(numberInput.value);
                const max = parseFloat(slider.max);
                if (isNaN(value)) return;
                
                if (value > max) {
                    value = max;
                    numberInput.value = slider.step === '0.5' ? value.toFixed(1) : String(max);
                }
                
                slider.value = String(value);
                updateLandingSliderTrack(slider);
                updateCalculatorResults();
            });
            
            numberInput.addEventListener('blur', () => {
                let value = parseFloat(numberInput.value);
                const min = parseFloat(slider.min);
                if (isNaN(value) || value < min) {
                    numberInput.value = slider.step === '0.5' ? parseFloat(slider.min).toFixed(1) : slider.min;
                    slider.value = slider.min;
                    updateLandingSliderTrack(slider);
                    updateCalculatorResults();
                }
            });
        }
    });

    const radioButtons = calculator.querySelectorAll<HTMLInputElement>('.option-card-input');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', updateCalculatorResults);
    });
    
    document.getElementById('get-plan-from-calc-btn')?.addEventListener('click', () => {
        const data = {
            age: (calculator.querySelector('#age-slider') as HTMLInputElement).value,
            height: (calculator.querySelector('#height-slider') as HTMLInputElement).value,
            weight: (calculator.querySelector('#weight-slider') as HTMLInputElement).value,
            gender: (calculator.querySelector('input[name="gender_calc"]:checked') as HTMLInputElement).value,
            activityLevel: (calculator.querySelector('input[name="activity_level_calc"]:checked') as HTMLInputElement).value,
            trainingGoal: (calculator.querySelector('input[name="goal_calc"]:checked') as HTMLInputElement).value,
        };
        sessionStorage.setItem('fitgympro_calculator_data', JSON.stringify(data));
        openModal(document.getElementById('auth-modal'));
    });

    // Initial calculation and slider track coloring
    sliders.forEach(updateLandingSliderTrack);
    updateCalculatorResults();
};