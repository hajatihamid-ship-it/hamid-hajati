import { openModal, closeModal, updateSliderTrack } from '../utils/dom';
import { getStorePlans, getUsers, getUserData, getSiteSettings, getMagazineArticles } from '../services/storage';
import { formatPrice } from '../utils/helpers';
import { calculateBodyMetrics } from '../utils/calculations';
import { getCurrentUser } from '../state';

let coachRotationInterval: number | null = null;

const getFeaturesHTML = () => `
    <div class="space-y-6">
        <div>
            <h3 class="font-bold text-2xl mb-3 text-accent">ابزارهایی برای موفقیت شما</h3>
            <p class="text-text-secondary max-w-3xl">FitGym Pro مجموعه‌ای کامل از ویژگی‌های پیشرفته را برای به حداکثر رساندن پتانسیل ورزشی شما و ساده‌سازی مدیریت مربیگری ارائه می‌دهد.</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
             ${[
                { icon: 'brain-circuit', title: 'برنامه‌ریزی هوشمند با AI', desc: 'با استفاده از هوش مصنوعی، برنامه‌های تمرینی و غذایی بهینه و شخصی‌سازی شده برای هر ورزشکار ایجاد کنید.' },
                { icon: 'bar-chart-3', title: 'پیگیری دقیق پیشرفت', desc: 'روند پیشرفت وزن، قدرت و سایر معیارهای کلیدی را با نمودارهای تحلیلی و گزارش‌های جامع دنبال کنید.' },
                { icon: 'users', title: 'مدیریت آسان شاگردان', desc: 'مربیان می‌توانند به راحتی پروفایل شاگردان، برنامه‌ها و ارتباطات را در یک داشبورد متمرکز مدیریت کنند.' },
                { icon: 'message-square', title: 'ارتباط مستقیم و مؤثر', desc: 'سیستم چت داخلی امکان ارتباط سریع و امن بین مربی و شاگرد را برای پشتیبانی بهتر فراهم می‌کند.' },
                { icon: 'book-open', title: 'بانک اطلاعاتی جامع', desc: 'دسترسی به پایگاه داده‌ای غنی از حرکات تمرینی و مکمل‌های ورزشی با توضیحات کامل.' },
                { icon: 'save', title: 'ذخیره و استفاده از الگوها', desc: 'برنامه‌های موفق را به عنوان الگو ذخیره کرده و برای شاگردان جدید با یک کلیک استفاده کنید.' }
            ].map((feature, index) => `
                <div class="bg-bg-tertiary p-6 rounded-2xl transition-all duration-300 hover:bg-bg-secondary hover:shadow-xl hover:-translate-y-1.5 animate-fade-in-up" style="animation-delay: ${index * 100}ms;">
                    <div class="bg-accent/10 text-accent p-3 rounded-xl inline-block mb-4">
                        <i data-lucide="${feature.icon}" class="w-8 h-8"></i>
                    </div>
                    <h4 class="font-bold text-lg mb-2 text-text-primary">${feature.title}</h4>
                    <p class="text-sm text-text-secondary leading-relaxed">${feature.desc}</p>
                </div>
            `).join('')}
        </div>
    </div>
`;

const getPricingHTML = () => {
    const plans = getStorePlans();
    return `
    <div>
        <div class="text-center mb-8">
            <h3 class="font-bold text-xl text-accent">تعرفه‌ها و پلن‌های عضویت</h3>
            <p class="text-text-secondary mt-2">پلنی را انتخاب کنید که به بهترین شکل با اهداف شما هماهنگ است.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            ${plans.map((plan: any) => `
                <div class="card p-6 flex flex-col border-2" style="border-color: ${plan.color || 'transparent'};">
                    <h4 class="text-lg font-bold text-text-primary">${plan.emoji || ''} ${plan.planName}</h4>
                    <p class="text-sm text-text-secondary mt-1 flex-grow">${plan.description}</p>
                    <div class="my-6">
                        <span class="text-3xl font-black text-white">${formatPrice(plan.price).split(' ')[0]}</span>
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
                    <button data-plan-id="${plan.planId}" class="select-plan-btn primary-button mt-auto w-full">انتخاب پلن</button>
                </div>
            `).join('')}
        </div>
    </div>
`;
};

const getContactHTML = () => {
    const settings = getSiteSettings();
    const { email, phone } = settings.contactInfo;
    const { instagram, telegram, youtube } = settings.socialMedia;
    return `
    <div class="grid md:grid-cols-2 gap-8">
        <div>
            <h3 class="font-bold text-xl text-accent">با ما در ارتباط باشید</h3>
            <p class="text-text-secondary mt-2 mb-6">سوال یا پیشنهادی دارید؟ تیم ما آماده پاسخگویی به شماست.</p>
            <form class="space-y-4">
                <div class="input-group">
                    <input type="text" id="contact-name" class="input-field w-full" placeholder=" ">
                    <label for="contact-name" class="input-label">نام شما</label>
                </div>
                <div class="input-group">
                    <input type="email" id="contact-email" class="input-field w-full" placeholder=" ">
                    <label for="contact-email" class="input-label">ایمیل شما</label>
                </div>
                <div class="input-group">
                    <textarea id="contact-message" class="input-field w-full min-h-[120px]" placeholder=" "></textarea>
                    <label for="contact-message" class="input-label">پیام شما</label>
                </div>
                <button type="submit" class="primary-button w-full">ارسال پیام</button>
            </form>
        </div>
        <div class="bg-bg-tertiary p-6 rounded-xl">
            <h4 class="font-semibold mb-4 text-text-primary">اطلاعات تماس</h4>
            <div class="space-y-4">
                <div class="flex items-center gap-3">
                    <i data-lucide="mail" class="w-5 h-5 text-accent"></i>
                    <a href="mailto:${email}" class="text-text-secondary hover:text-accent">${email}</a>
                </div>
                <div class="flex items-center gap-3">
                    <i data-lucide="phone" class="w-5 h-5 text-accent"></i>
                    <span class="text-text-secondary" dir="ltr">${phone}</span>
                </div>
            </div>
             <div class="mt-8 pt-6 border-t border-border-primary">
                 <h4 class="font-semibold mb-4 text-text-primary">ما را دنبال کنید</h4>
                 <div class="flex items-center gap-5">
                    <a href="${instagram}" target="_blank" rel="noopener" class="social-icon-link text-2xl"><i class="fab fa-instagram"></i></a>
                    <a href="${telegram}" target="_blank" rel="noopener" class="social-icon-link text-2xl"><i class="fab fa-telegram"></i></a>
                    <a href="${youtube}" target="_blank" rel="noopener" class="social-icon-link text-2xl"><i class="fab fa-youtube"></i></a>
                 </div>
             </div>
        </div>
    </div>
`;
};

const getCoachesHTML = () => `
<div>
    <div class="text-center mb-8">
        <h3 class="font-bold text-2xl text-accent">به جمع مربیان حرفه‌ای ما بپیوندید</h3>
        <p class="text-text-secondary mt-3 max-w-2xl mx-auto">ابزارهای قدرتمند FitGym Pro را برای ارتقاء کسب و کار مربیگری خود و دستیابی به نتایج بهتر برای شاگردانتان به کار بگیرید.</p>
    </div>

    <div class="grid md:grid-cols-2 gap-8 mb-12 items-center">
        <div class="space-y-6">
            <div class="flex items-start gap-4">
                <div class="bg-accent/10 p-2 rounded-lg"><i data-lucide="users-round" class="w-6 h-6 text-accent"></i></div>
                <div>
                    <h4 class="font-semibold text-text-primary">مدیریت متمرکز شاگردان</h4>
                    <p class="text-sm text-text-secondary">تمام شاگردان، برنامه‌ها و پیشرفت آن‌ها را در یک داشبورد جامع به راحتی مدیریت کنید.</p>
                </div>
            </div>
            <div class="flex items-start gap-4">
                <div class="bg-accent/10 p-2 rounded-lg"><i data-lucide="clock" class="w-6 h-6 text-accent"></i></div>
                <div>
                    <h4 class="font-semibold text-text-primary">صرفه‌جویی در زمان</h4>
                    <p class="text-sm text-text-secondary">با الگوهای آماده و ابزارهای هوشمند، برنامه‌های تمرینی و غذایی را در چند دقیقه ایجاد کنید.</p>
                </div>
            </div>
            <div class="flex items-start gap-4">
                <div class="bg-accent/10 p-2 rounded-lg"><i data-lucide="gem" class="w-6 h-6 text-accent"></i></div>
                <div>
                    <h4 class="font-semibold text-text-primary">برندسازی شخصی</h4>
                    <p class="text-sm text-text-secondary">یک پروفایل حرفه‌ای برای خود بسازید و خدمات خود را به جامعه بزرگ ورزشکاران ما معرفی کنید.</p>
                </div>
            </div>
        </div>
        <div class="bg-bg-tertiary p-6 rounded-2xl flex flex-col justify-center items-center text-center">
            <img src="https://i.pravatar.cc/150?u=coach10186" alt="Featured Coach" class="w-24 h-24 rounded-full mb-4 border-4 border-accent/50">
            <p class="text-text-secondary italic">"FitGym Pro مدیریت شاگردانم را متحول کرده است. حالا می‌توانم زمان بیشتری را صرف کیفیت برنامه‌ها کنم و نتایج بهتری بگیرم."</p>
            <p class="font-bold text-text-primary mt-4">- مربی تایید شده</p>
        </div>
    </div>
    
    <div class="bg-bg-tertiary p-6 rounded-2xl text-center">
        <h4 class="font-bold text-lg text-text-primary mb-2">آماده‌اید تا مربیگری خود را به سطح بالاتری ببرید؟</h4>
        <p class="text-text-secondary mb-4 text-sm">برای شروع، ابتدا یک حساب کاربری ایجاد کنید. پس از ثبت نام، می‌توانید درخواست مربیگری خود را از داخل پنل ارسال نمایید.</p>
        <button id="coach-signup-cta" class="primary-button !px-8 !py-3">همین حالا ثبت نام کنید</button>
    </div>
</div>
`;

const getCalculatorHTML = () => {
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
    <section id="calculator-widget" class="py-16">
        <div class="calculator-card max-w-6xl mx-auto p-6 md:p-8 animate-fade-in-up animation-delay-800">
            <div class="text-center mb-8">
                <h3 class="font-bold text-2xl text-yellow-400">محاسبه‌گر هوشمند تناسب اندام</h3>
                <p class="text-yellow-400 mt-2 max-w-3xl mx-auto">اطلاعات خود را وارد کنید تا تمام معیارهای کلیدی بدن خود را مشاهده کرده و یک دید کلی از وضعیت فعلی خود به دست آورید.</p>
            </div>
            <form id="landing-page-calculator" class="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8">
                <!-- Inputs -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <div class="sm:col-span-2 flex items-center gap-4">
                        <span class="font-semibold w-16 text-yellow-400 shrink-0">جنسیت:</span>
                        <div class="flex-grow grid grid-cols-2 gap-2">
                             <label class="option-card-label">
                                <input type="radio" name="gender" value="مرد" class="option-card-input" checked>
                                <span class="option-card-content !py-2">مرد</span>
                            </label>
                             <label class="option-card-label">
                                <input type="radio" name="gender" value="زن" class="option-card-input">
                                <span class="option-card-content !py-2">زن</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="font-semibold text-sm text-yellow-400">سن: <span class="font-bold text-accent">25</span></label>
                        <input type="range" name="age" min="15" max="80" value="25" class="range-slider age-slider w-full mt-1">
                    </div>
                    <div>
                        <label class="font-semibold text-sm text-yellow-400">قد (cm): <span class="font-bold text-accent">175</span></label>
                        <input type="range" name="height" min="140" max="220" value="175" class="range-slider height-slider w-full mt-1">
                    </div>
                    <div class="sm:col-span-2">
                        <label class="font-semibold text-sm text-yellow-400">وزن (kg): <span class="font-bold text-accent">75</span></label>
                        <input type="range" name="weight" min="40" max="150" value="75" step="0.5" class="range-slider weight-slider w-full mt-1">
                    </div>
                    
                    <div class="sm:col-span-2">
                        <h4 class="font-semibold text-sm mb-2 text-yellow-400">هدف تمرینی</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            ${trainingGoals.map((goal, index) => `
                                <label class="option-card-label">
                                    <input type="radio" name="training_goal_user" value="${goal.value}" class="option-card-input" ${index === 1 ? 'checked' : ''}>
                                    <span class="option-card-content !py-2">${goal.label}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="sm:col-span-2">
                        <h4 class="font-semibold text-sm mb-2 text-yellow-400">روزهای تمرین در هفته</h4>
                        <div class="grid grid-cols-4 gap-2 text-xs">
                            ${[3, 4, 5, 6].map((day, index) => `
                                <label class="option-card-label">
                                    <input type="radio" name="training_days_user" value="${day}" class="option-card-input" ${index === 1 ? 'checked' : ''}>
                                    <span class="option-card-content !py-2">${day} روز</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <div class="sm:col-span-2">
                        <h4 class="font-semibold text-sm mb-2 text-yellow-400">سطح فعالیت روزانه</h4>
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
                            ${activityLevels.map((level, index) => `
                                <label class="option-card-label">
                                    <input type="radio" name="activity_level" value="${level.value}" class="option-card-input" ${index === 2 ? 'checked' : ''}>
                                    <span class="option-card-content !py-2">${level.label}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Outputs -->
                <div class="flex flex-col items-center justify-between bg-bg-tertiary/80 p-6 rounded-2xl">
                     <div>
                        <div class="flex justify-between items-center mb-1 w-full">
                            <h3 class="font-semibold text-sm text-yellow-400">شاخص توده بدنی (BMI)</h3>
                             <div class="flex items-center gap-2">
                                <span class="font-bold text-lg text-white bmi-output">24.5</span>
                                <span class="bmi-status hidden"></span>
                            </div>
                        </div>
                        <div class="w-full bg-bg-tertiary rounded-full h-2.5 relative" title="آبی: کمبود وزن, سبز: نرمال, زرد: اضافه وزن, قرمز: چاقی">
                            <div class="absolute top-0 left-0 h-full rounded-l-full bg-blue-500" style="width: 14%;"></div>
                            <div class="absolute top-0 h-full bg-green-500" style="left: 14%; width: 26%;"></div>
                            <div class="absolute top-0 h-full bg-yellow-500" style="left: 40%; width: 20%;"></div>
                            <div class="absolute top-0 h-full rounded-r-full bg-red-500" style="left: 60%; width: 40%;"></div>
                            <div id="landing-bmi-indicator" class="absolute -top-1 w-5 h-5 rounded-full bg-white border-2 border-accent shadow-lg transition-all duration-500 ease-out" style="left: -10px;">
                                 <div class="w-full h-full rounded-full bg-accent/30"></div>
                            </div>
                        </div>
                        <div class="flex justify-between text-xs text-text-secondary mt-1 px-1">
                            <span>۱۸.۵</span>
                            <span>۲۵</span>
                            <span>۳۰</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-x-4 gap-y-5 my-6 w-full text-center">
                        <div class="result-display bg-bg-secondary p-3 rounded-lg">
                            <p class="text-sm text-yellow-400">کالری روزانه (TDEE)</p>
                            <p class="font-black text-3xl text-white my-1"><span class="tdee-output">2450</span></p>
                            <p class="text-xs text-white">کیلوکالری</p>
                        </div>
                         <div class="result-display bg-bg-secondary p-3 rounded-lg">
                            <p class="text-sm text-yellow-400">درصد چربی بدن</p>
                            <p class="font-black text-3xl text-white my-1"><span class="bodyfat-output">–</span></p>
                            <p class="text-xs text-white">(تخمینی)</p>
                        </div>
                         <div class="result-display bg-bg-secondary p-3 rounded-lg">
                            <p class="text-sm text-yellow-400">توده بدون چربی (LBM)</p>
                            <p class="font-black text-3xl text-white my-1"><span class="lbm-output">–</span></p>
                             <p class="text-xs text-white">کیلوگرم</p>
                        </div>
                         <div class="result-display bg-bg-secondary p-3 rounded-lg">
                            <p class="text-sm text-yellow-400">محدوده وزن ایده‌آل</p>
                            <p class="font-black text-xl text-white my-1"><span class="ideal-weight-output">...</span></p>
                             <p class="text-xs text-white">کیلوگرم</p>
                        </div>
                    </div>
                    
                    <button type="button" id="calculator-cta-btn" class="primary-button w-full !py-3">دریافت برنامه شخصی‌سازی شده</button>
                </div>
            </form>
        </div>
    </section>
    `;
}

const renderCoachCardHTML = (coach: any): string => {
    const coachData = getUserData(coach.username);
    const name = coachData.step1?.clientName || coach.username;
    const specialty = coachData.profile?.specialization || 'مربی رسمی بدنسازی';
    const avatar = coachData.profile?.avatar;

    const avatarHtml = avatar 
        ? `<img src="${avatar}" alt="${name}" class="w-full h-full object-cover">`
        : `<span class="text-5xl font-bold text-text-secondary">${name.charAt(0)}</span>`;

    return `
    <div class="coach-card text-center group">
        <div class="relative inline-block">
            <div class="w-32 h-32 rounded-full mx-auto border-4 border-bg-secondary shadow-lg bg-bg-tertiary flex items-center justify-center overflow-hidden">
               ${avatarHtml}
            </div>
            <span class="absolute bottom-2 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-bg-secondary"><i data-lucide="check" class="w-4 h-4"></i></span>
        </div>
        <h4 class="font-bold text-lg mt-4 text-yellow-400">${name}</h4>
        <p class="text-yellow-400 text-sm">${specialty}</p>
        <div class="flex justify-center gap-4 mt-4">
            <a href="#" class="social-icon-link"><i class="fab fa-instagram"></i></a>
            <a href="#" class="social-icon-link"><i class="fab fa-telegram"></i></a>
        </div>
    </div>
    `;
}

const getCoachesShowcaseHTML = () => {
    const allUsers = getUsers();
    const verifiedCoaches = allUsers.filter((u: any) => u.role === 'coach' && u.coachStatus === 'verified');

    if (verifiedCoaches.length === 0) {
        return `
        <section class="py-16">
            <div class="text-center mb-12">
                <h3 class="font-bold text-2xl text-yellow-400">مربیان متخصص ما به زودی به ما ملحق می‌شوند</h3>
                <p class="text-yellow-400 mt-2 max-w-2xl mx-auto">ما در حال همکاری با بهترین مربیان کشور هستیم تا بهترین تجربه را برای شما فراهم کنیم.</p>
            </div>
        </section>
        `;
    }
    
    const initialCoaches = verifiedCoaches.slice(0, 3);

    return `
    <section class="py-16">
        <div class="text-center mb-12">
            <h3 class="font-bold text-2xl text-yellow-400">با مربیان متخصص ما آشنا شوید</h3>
            <p class="text-yellow-400 mt-2 max-w-2xl mx-auto">تیمی از بهترین مربیان کشور که آماده‌اند تا شما را در مسیر رسیدن به اهدافتان همراهی کنند.</p>
        </div>
        <div id="coaches-showcase-grid" class="grid grid-cols-1 md:grid-cols-3 gap-8 transition-opacity duration-300">
            ${initialCoaches.map(coach => renderCoachCardHTML(coach)).join('')}
        </div>
    </section>
    `;
};

const getMagazineHTML = () => {
    const articles = getMagazineArticles().sort((a,b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

    if (articles.length === 0) {
        return `<div class="text-center py-12 text-text-secondary">
            <i data-lucide="newspaper" class="w-12 h-12 mx-auto mb-4"></i>
            <p>محتوای مجله به زودی در اینجا قرار خواهد گرفت.</p>
        </div>`;
    }

    return `
        <div class="space-y-8">
            ${articles.map((article, index) => `
                <div class="grid md:grid-cols-3 gap-6 items-center animate-fade-in-up" style="animation-delay: ${index * 150}ms;">
                    <div class="md:col-span-1">
                        <img src="${article.imageUrl || 'https://via.placeholder.com/400x300'}" alt="${article.title}" class="rounded-lg w-full h-48 object-cover">
                    </div>
                    <div class="md:col-span-2">
                        <p class="text-sm font-semibold text-accent">${article.category}</p>
                        <h3 class="font-bold text-xl my-2 text-text-primary">${article.title}</h3>
                        <p class="text-sm text-text-secondary line-clamp-3">${article.content}</p>
                        <a href="#" class="text-accent font-semibold text-sm mt-3 inline-block">ادامه مطلب...</a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

const openInfoModal = (section: string) => {
    const modal = document.getElementById('info-modal');
    const titleEl = document.getElementById('info-modal-title');
    const bodyEl = document.getElementById('info-modal-body');
    if (!modal || !titleEl || !bodyEl) return;

    const contentMap: Record<string, { title: string; content: string }> = {
        features: { title: 'ویژگی‌ها', content: getFeaturesHTML() },
        pricing: { title: 'تعرفه‌ها', content: getPricingHTML() },
        contact: { title: 'تماس با ما', content: getContactHTML() },
        coaches: { title: 'مربیان', content: getCoachesHTML() },
        magazine: { title: 'مجله FitGymPro', content: getMagazineHTML() }
    };

    const sectionData = contentMap[section];
    if (!sectionData) return;

    titleEl.textContent = sectionData.title;
    bodyEl.innerHTML = sectionData.content;

    window.lucide?.createIcons();
    openModal(modal);
}

const initCoachRotation = () => {
    if (coachRotationInterval) {
        clearInterval(coachRotationInterval);
    }

    const coachesGrid = document.getElementById('coaches-showcase-grid');
    if (!coachesGrid) return;

    const allVerifiedCoaches = getUsers().filter((u: any) => u.role === 'coach' && u.coachStatus === 'verified');
    if (allVerifiedCoaches.length <= 3) return;

    let currentIndex = 0;

    const rotateCoaches = () => {
        currentIndex = (currentIndex + 3);
        if (currentIndex >= allVerifiedCoaches.length) {
            currentIndex = 0;
        }

        let nextCoaches = allVerifiedCoaches.slice(currentIndex, currentIndex + 3);
        if (nextCoaches.length < 3) {
            const remaining = 3 - nextCoaches.length;
            nextCoaches = [...nextCoaches, ...allVerifiedCoaches.slice(0, remaining)];
        }
        
        coachesGrid.classList.add('opacity-0');

        setTimeout(() => {
            coachesGrid.innerHTML = nextCoaches.map(coach => renderCoachCardHTML(coach)).join('');
            window.lucide?.createIcons();
            coachesGrid.classList.remove('opacity-0');
        }, 300);
    };

    coachRotationInterval = window.setInterval(rotateCoaches, 5000);
}


export function initLandingPageListeners(onGoToDashboard?: () => void) {
    document.body.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        
        const goToDashboardBtn = target.closest('#go-to-dashboard-btn');
        if (goToDashboardBtn && onGoToDashboard) {
            onGoToDashboard();
            return;
        }

        const authModalBtn = target.closest('#open-auth-modal-btn');
        const calculatorCtaBtn = target.closest('#calculator-cta-btn');
        const infoLink = target.closest('.landing-nav-link[data-section]');
        const coachSignupBtn = target.closest('#coach-signup-cta');
        const adminEditBtn = target.closest('.admin-edit-btn');
        const selectPlanBtn = target.closest('.select-plan-btn');

        if (selectPlanBtn) {
            const planId = selectPlanBtn.getAttribute('data-plan-id');
            if (planId) {
                sessionStorage.setItem('fitgympro_selected_plan', planId);
            }
            const infoModal = document.getElementById('info-modal');
            const authModal = document.getElementById('auth-modal');
            if(infoModal) closeModal(infoModal);
            if(authModal) openModal(authModal);
            return;
        }

        if (adminEditBtn) {
            const authModal = document.getElementById('auth-modal');
            openModal(authModal);
            return;
        }

        if (authModalBtn || calculatorCtaBtn) {
            if (calculatorCtaBtn) {
                const calculator = document.getElementById('landing-page-calculator');
                if (calculator) {
                    const formData = new FormData(calculator as HTMLFormElement);
                    const data = {
                        gender: formData.get('gender'),
                        age: formData.get('age'),
                        height: formData.get('height'),
                        weight: formData.get('weight'),
                        trainingGoal: formData.get('training_goal_user'),
                        trainingDays: formData.get('training_days_user'),
                        activityLevel: formData.get('activity_level'),
                    };
                    sessionStorage.setItem('fitgympro_calculator_data', JSON.stringify(data));
                }
            }
            const authModal = document.getElementById('auth-modal');
            openModal(authModal);
        } else if (infoLink) {
            const section = infoLink.getAttribute('data-section');
            if (section) {
                openInfoModal(section);
            }
        } else if (coachSignupBtn) {
            const infoModal = document.getElementById('info-modal');
            const authModal = document.getElementById('auth-modal');
            if (infoModal) closeModal(infoModal);
            if (authModal) openModal(authModal);
        }
    });
    
    const infoModal = document.getElementById('info-modal');
    if (infoModal) {
        infoModal.addEventListener('click', e => {
            if ((e.target as HTMLElement).id === 'info-modal') {
                closeModal(infoModal);
            }
        });
        document.getElementById('close-info-modal-btn')?.addEventListener('click', () => closeModal(infoModal));
    }
    
    // Calculator widget logic
    const calculator = document.getElementById('landing-page-calculator');
    if (calculator) {
        const updateCalculatorResults = () => {
            const metrics = calculateBodyMetrics(calculator);
            
            const tdeeOutput = calculator.querySelector('.tdee-output');
            const bmiOutput = calculator.querySelector('.bmi-output');
            const bodyfatOutput = calculator.querySelector('.bodyfat-output');
            const lbmOutput = calculator.querySelector('.lbm-output');
            const idealWeightOutput = calculator.querySelector('.ideal-weight-output');
            const bmiIndicator = calculator.querySelector('#landing-bmi-indicator');
            const bmiStatusEl = calculator.querySelector('.bmi-status');

            const clearOutputs = () => {
                if(tdeeOutput) tdeeOutput.textContent = '–';
                if(bmiOutput) bmiOutput.textContent = '–';
                if(bodyfatOutput) bodyfatOutput.textContent = '–';
                if(lbmOutput) lbmOutput.textContent = '–';
                if(idealWeightOutput) idealWeightOutput.textContent = '–';
                if(bmiIndicator) (bmiIndicator as HTMLElement).style.left = '-10px';
                if(bmiStatusEl) bmiStatusEl.classList.add('hidden');
            };

            if (metrics) {
                if (tdeeOutput) tdeeOutput.textContent = metrics.tdee ? String(Math.round(metrics.tdee)) : '–';
                if (bmiOutput) bmiOutput.textContent = metrics.bmi ? String(metrics.bmi) : '–';
                if (bodyfatOutput) bodyfatOutput.textContent = metrics.bodyFat ? `${metrics.bodyFat}%` : '–';
                if (lbmOutput) lbmOutput.textContent = metrics.lbm ? `${metrics.lbm} kg` : '–';
                if (idealWeightOutput) idealWeightOutput.textContent = metrics.idealWeight || '–';

                if (bmiStatusEl && metrics.bmi) {
                    const bmi = metrics.bmi;
                    let statusText = '';
                    let statusColorClass = '';
                    if (bmi < 18.5) {
                        statusText = 'کمبود وزن';
                        statusColorClass = 'bg-blue-500 text-white';
                    } else if (bmi < 25) {
                        statusText = 'نرمال';
                        statusColorClass = 'bg-green-500 text-white';
                    } else if (bmi < 30) {
                        statusText = 'اضافه وزن';
                        statusColorClass = 'bg-yellow-500 text-black';
                    } else {
                        statusText = 'چاق';
                        statusColorClass = 'bg-red-500 text-white';
                    }
                    (bmiStatusEl as HTMLElement).textContent = statusText;
                    bmiStatusEl.className = `bmi-status text-xs font-semibold px-2 py-0.5 rounded-full ${statusColorClass}`;
                    bmiStatusEl.classList.remove('hidden');
                } else if (bmiStatusEl) {
                    bmiStatusEl.classList.add('hidden');
                }

                if (bmiIndicator && metrics.bmi) {
                    const bmi = metrics.bmi;
                    const minBmi = 15;
                    const maxBmi = 40;
                    let percentage = (bmi - minBmi) / (maxBmi - minBmi) * 100;
                    percentage = Math.max(0, Math.min(100, percentage));
                    setTimeout(() => {
                        (bmiIndicator as HTMLElement).style.left = `calc(${percentage}% - 10px)`;
                    }, 100);
                } else if (bmiIndicator) {
                     (bmiIndicator as HTMLElement).style.left = '-10px';
                }
            } else {
                clearOutputs();
            }
        };

        calculator.addEventListener('input', e => {
            const target = e.target as HTMLInputElement;
            if (target.matches('.range-slider')) {
                const labelSpan = target.previousElementSibling?.querySelector('span');
                if (labelSpan) labelSpan.textContent = target.value;
                updateSliderTrack(target);
            }
             updateCalculatorResults();
        });
        
        const genderRadios = calculator.querySelectorAll('input[name="gender"]');
        genderRadios.forEach(radio => radio.addEventListener('change', () => {
             updateCalculatorResults();
        }));
        
        calculator.addEventListener('change', e => {
            const target = e.target as HTMLInputElement;
            if (target.matches('input[type="radio"]') && target.name !== 'gender') {
                updateCalculatorResults();
            }
        });
        
        updateCalculatorResults();
    }
    
    initCoachRotation();
}

export function renderLandingPage() {
    const currentUser = getCurrentUser();
    const settings = getSiteSettings();
    const socialLinks = settings.socialMedia || {};

    const socialIcons = [
        { name: 'instagram', link: socialLinks.instagram, icon: 'fa-instagram' },
        { name: 'telegram', link: socialLinks.telegram, icon: 'fa-telegram' },
        { name: 'youtube', link: socialLinks.youtube, icon: 'fa-youtube' }
    ];

    const headerButtonHtml = currentUser
        ? `<button id="go-to-dashboard-btn" class="primary-button">داشبورد</button>`
        : `<button id="open-auth-modal-btn" class="primary-button">ورود / ثبت نام</button>`;
    
    const heroButtonHtml = currentUser
        ? `<button id="go-to-dashboard-btn" class="hero-cta-btn primary-button !text-lg !px-10 !py-4">
                <div class="glow-circle"></div>
                بازگشت به داشبورد
           </button>`
        : `<button id="open-auth-modal-btn" class="hero-cta-btn primary-button !text-lg !px-10 !py-4">
                <div class="glow-circle"></div>
                شروع کنید
           </button>`;

    return `
    <div class="landing-page-container bg-bg-primary text-text-primary flex flex-col transition-opacity duration-500 opacity-0">
        <div class="landing-bg"></div>
        <div class="relative z-10 flex flex-col flex-grow">
            <header class="p-4">
                <nav class="container mx-auto flex justify-between items-center glass-nav p-3 rounded-2xl">
                    <div class="flex items-center">
                        <span class="text-yellow-400 font-bold text-2xl tracking-wider">${settings.siteName}</span>
                    </div>
                    <div class="hidden md:flex items-center gap-6">
                        <button data-section="features" class="landing-nav-link">ویژگی‌ها</button>
                        <button data-section="pricing" class="landing-nav-link">تعرفه‌ها</button>
                        <button data-section="coaches" class="landing-nav-link">مربیان</button>
                        <button data-section="magazine" class="landing-nav-link">مجله FitGymPro</button>
                        <button data-section="contact" class="landing-nav-link">تماس با ما</button>
                    </div>
                    <div>
                        ${headerButtonHtml}
                    </div>
                </nav>
            </header>

            <main class="flex-grow flex items-center">
                <div class="container mx-auto text-center px-4 py-16">
                    <h1 class="text-4xl md:text-6xl font-black text-white leading-tight animate-fade-in-down">
                        آینده <span class="text-accent">تناسب اندام</span> اینجاست
                    </h1>
                    <p class="mt-6 max-w-2xl mx-auto text-lg text-yellow-400 animate-fade-in-up animation-delay-200">
                        برنامه‌های تمرینی و غذایی شخصی‌سازی شده با قدرت هوش مصنوعی. به اهداف خود سریع‌تر و هوشمندانه‌تر برسید.
                    </p>
                    <div class="mt-10 animate-fade-in-up animation-delay-400">
                        ${heroButtonHtml}
                    </div>
                </div>
            </main>
             <div class="bg-bg-primary pb-8">
                <div class="container mx-auto px-4">
                    ${getCalculatorHTML()}
                    ${getCoachesShowcaseHTML()}
                </div>
            </div>
             <footer class="text-center p-6 text-text-secondary text-sm bg-bg-primary">
                <div class="flex justify-center gap-6 mb-4">
                     ${socialIcons.map(social => 
                        (social.link && social.link.trim() !== '') 
                        ? `<a href="${social.link}" target="_blank" rel="noopener noreferrer" class="social-icon-link"><i class="fab ${social.icon} fa-lg"></i></a>` 
                        : ''
                    ).join('')}
                </div>
                <p class="text-white">&copy; 2024 ${settings.siteName}. تمامی حقوق محفوظ است.</p>
            </footer>
        </div>
    </div>
    
    <div id="info-modal" class="modal fixed inset-0 bg-black/70 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="modal-content card w-full max-w-4xl h-[90vh] transform scale-95 transition-transform duration-300 relative flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-border-primary flex-shrink-0">
                <h2 id="info-modal-title" class="font-bold text-xl"></h2>
                <button id="close-info-modal-btn" class="secondary-button !p-2 rounded-full z-10"><i data-lucide="x"></i></button>
            </div>
            <div id="info-modal-body" class="p-6 md:p-8 overflow-y-auto">
                <!-- Content will be injected here -->
            </div>
        </div>
    </div>
    `;
}