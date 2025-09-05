import { openModal } from '../utils/dom';
import { getSiteSettings, getUsers, getUserData, getStorePlans, getMagazineArticles } from '../services/storage';
import { performMetricCalculations, calculateMacros } from '../utils/calculations';
import { formatPrice, timeAgo } from '../utils/helpers';

const renderCalculator = () => `
    <section id="fitness-calculator" class="py-16">
        <div class="container mx-auto px-4">
            <div class="calculator-wrapper">
                <div class="text-center mb-10">
                    <h2 class="text-3xl lg:text-4xl font-extrabold text-white">محاسبه‌گر پیشرفته تناسب اندام</h2>
                    <p class="mt-4 text-slate-400 max-w-2xl mx-auto">
                        اطلاعات خود را وارد کنید تا یک تحلیل کامل از وضعیت بدن و نیازهای روزانه خود دریافت کنید.
                    </p>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Inputs -->
                    <div class="calculator-input-section space-y-6">
                        <div>
                            <h3><span>۱</span>اطلاعات پایه</h3>
                            <div class="space-y-4 pt-4">
                                <div class="calculator-radio-group">
                                    <p class="font-semibold text-sm mb-2 text-slate-300">جنسیت</p>
                                    <div class="grid grid-cols-2 gap-2">
                                        <label class="option-card-label"><input type="radio" name="gender_calc" value="مرد" class="option-card-input" checked><span class="option-card-content !py-3">مرد</span></label>
                                        <label class="option-card-label"><input type="radio" name="gender_calc" value="زن" class="option-card-input"><span class="option-card-content !py-3">زن</span></label>
                                    </div>
                                </div>
                                <div>
                                    <div class="calculator-slider-label"><span>سن</span><span class="value" id="age-value">25</span></div>
                                    <input type="range" id="age-slider" class="calculator-slider" min="15" max="80" value="25">
                                </div>
                                <div>
                                    <div class="calculator-slider-label"><span>قد (cm)</span><span class="value" id="height-value">175</span></div>
                                    <input type="range" id="height-slider" class="calculator-slider" min="140" max="220" value="175">
                                </div>
                                <div>
                                    <div class="calculator-slider-label"><span>وزن (kg)</span><span class="value" id="weight-value">75.0</span></div>
                                    <input type="range" id="weight-slider" class="calculator-slider" min="40" max="150" step="0.5" value="75">
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3><span>۲</span>سبک زندگی و اهداف</h3>
                            <div class="space-y-4 pt-4">
                               <div class="calculator-radio-group">
                                    <p class="font-semibold text-sm mb-2 text-slate-300">هدف تمرینی</p>
                                    <div class="grid grid-cols-3 gap-2">
                                         <label class="option-card-label"><input type="radio" name="goal_calc" value="کاهش وزن" class="option-card-input"><span class="option-card-content">کاهش وزن</span></label>
                                         <label class="option-card-label"><input type="radio" name="goal_calc" value="حفظ وزن" class="option-card-input" checked><span class="option-card-content">حفظ وزن</span></label>
                                         <label class="option-card-label"><input type="radio" name="goal_calc" value="افزایش حجم" class="option-card-input"><span class="option-card-content">افزایش حجم</span></label>
                                    </div>
                                </div>
                                <div class="calculator-radio-group">
                                    <p class="font-semibold text-sm mb-2 text-slate-300">سطح فعالیت روزانه</p>
                                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                                         <label class="option-card-label"><input type="radio" name="activity_level_calc" value="1.2" class="option-card-input"><span class="option-card-content !text-xs">نشسته</span></label>
                                         <label class="option-card-label"><input type="radio" name="activity_level_calc" value="1.375" class="option-card-input"><span class="option-card-content !text-xs">کم</span></label>
                                         <label class="option-card-label"><input type="radio" name="activity_level_calc" value="1.55" class="option-card-input" checked><span class="option-card-content !text-xs">متوسط</span></label>
                                         <label class="option-card-label"><input type="radio" name="activity_level_calc" value="1.725" class="option-card-input"><span class="option-card-content !text-xs">زیاد</span></label>
                                         <label class="option-card-label"><input type="radio" name="activity_level_calc" value="1.9" class="option-card-input"><span class="option-card-content !text-xs">خیلی زیاد</span></label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Results -->
                    <div class="space-y-6">
                        <div class="results-card">
                            <h4 class="text-sm font-bold text-slate-400 mb-2">کالری مورد نیاز شما (TDEE)</h4>
                            <p class="value" id="tdee-value">--</p>
                            <p class="text-slate-300">kcal / روز</p>
                            <div class="mt-auto pt-4 border-t border-slate-700 text-xs text-slate-400 space-y-1">
                                <p>برای کاهش وزن: <span id="tdee-loss" class="font-semibold text-slate-300">-- kcal</span></p>
                                <p>برای افزایش حجم: <span id="tdee-gain" class="font-semibold text-slate-300">-- kcal</span></p>
                            </div>
                        </div>
                        <div class="results-card">
                             <h4 class="text-sm font-bold text-slate-400 mb-2">شاخص توده بدنی (BMI)</h4>
                             <p class="value" id="bmi-value">--</p>
                             <div class="mt-4">
                                <div class="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>کمبود وزن</span>
                                    <span>نرمال</span>
                                    <span>اضافه وزن</span>
                                    <span>چاقی</span>
                                </div>
                                <div class="bmi-progress-bar">
                                    <div id="bmi-progress-inner" class="bmi-progress-bar-inner"></div>
                                </div>
                                <p id="bmi-category" class="text-center text-sm font-bold mt-2 text-slate-300"></p>
                             </div>
                        </div>
                         <div class="results-card">
                             <h4 class="text-sm font-bold text-slate-400 mb-2">ماکرونوتریت‌های پیشنهادی (روزانه)</h4>
                             <div class="grid grid-cols-3 gap-4 text-center mt-4 flex-grow">
                                <div>
                                    <p id="protein-value" class="text-2xl font-bold text-slate-200">--</p>
                                    <p class="text-xs text-slate-400">پروتئین (g)</p>
                                </div>
                                <div>
                                    <p id="carbs-value" class="text-2xl font-bold text-slate-200">--</p>
                                    <p class="text-xs text-slate-400">کربوهیدرات (g)</p>
                                </div>
                                <div>
                                    <p id="fat-value" class="text-2xl font-bold text-slate-200">--</p>
                                    <p class="text-xs text-slate-400">چربی (g)</p>
                                </div>
                             </div>
                        </div>
                        <button id="get-plan-from-calc-btn" class="primary-button !bg-accent !text-black w-full !text-base !py-3 !rounded-md">دریافت برنامه شخصی‌سازی شده</button>
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

    // Get input values
    const age = parseInt((calculator.querySelector('#age-slider') as HTMLInputElement).value, 10);
    const height = parseInt((calculator.querySelector('#height-slider') as HTMLInputElement).value, 10);
    const weight = parseFloat((calculator.querySelector('#weight-slider') as HTMLInputElement).value);
    const gender = (calculator.querySelector('input[name="gender_calc"]:checked') as HTMLInputElement).value;
    const activityLevel = parseFloat((calculator.querySelector('input[name="activity_level_calc"]:checked') as HTMLInputElement).value);
    const goal = (calculator.querySelector('input[name="goal_calc"]:checked') as HTMLInputElement).value;

    const metrics = performMetricCalculations({ age, height, weight, gender, activityLevel });

    if(metrics && metrics.tdee) {
        document.getElementById('tdee-value')!.textContent = String(Math.round(metrics.tdee));
        document.getElementById('tdee-loss')!.textContent = `${Math.round(metrics.tdee - 400)} kcal`;
        document.getElementById('tdee-gain')!.textContent = `${Math.round(metrics.tdee + 300)} kcal`;
        
        const macros = calculateMacros(metrics.tdee, weight, goal);
        document.getElementById('protein-value')!.textContent = String(macros.protein);
        document.getElementById('carbs-value')!.textContent = String(macros.carbs);
        document.getElementById('fat-value')!.textContent = String(macros.fat);
    }

    if(metrics && metrics.bmi) {
        const bmi = metrics.bmi;
        document.getElementById('bmi-value')!.textContent = bmi.toFixed(1);

        let category = 'نرمال';
        let color = 'var(--accent)';
        if (bmi < 18.5) { category = 'کمبود وزن'; color = '#3b82f6'; }
        else if (bmi >= 25 && bmi < 30) { category = 'اضافه وزن'; color = '#f59e0b'; }
        else if (bmi >= 30) { category = 'چاقی'; color = '#ef4444'; }
        document.getElementById('bmi-category')!.textContent = category;

        const progressEl = document.getElementById('bmi-progress-inner')!;
        progressEl.style.backgroundColor = color;
        const normalizedBmi = Math.max(0, Math.min(1, (bmi - 15) / (25))); // Normalize up to 40
        progressEl.style.width = `${normalizedBmi * 100}%`;
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

    const sliders = calculator.querySelectorAll<HTMLInputElement>('.calculator-slider');
    sliders.forEach(slider => {
        const valueEl = document.getElementById(`${slider.id.replace('-slider', '')}-value`);
        if (valueEl) {
            slider.addEventListener('input', () => {
                valueEl.textContent = parseFloat(slider.value).toFixed(slider.step === '0.5' ? 1 : 0);
                updateCalculatorResults();
            });
        }
    });

    const radios = calculator.querySelectorAll<HTMLInputElement>('.option-card-input');
    radios.forEach(radio => {
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

    // Initial calculation
    updateCalculatorResults();
};