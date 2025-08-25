import { openModal, closeModal } from '../utils/dom';
import { STORE_PLANS } from '../config';
import { formatPrice } from '../utils/helpers';

const getFeaturesHTML = () => `
    <div class="space-y-6">
        <div>
            <h3 class="font-bold text-xl mb-3 text-accent">ویژگی‌های کلیدی FitGym Pro</h3>
            <p class="text-text-secondary">ما ابزارهای قدرتمندی را برای مربیان و ورزشکاران فراهم کرده‌ایم تا به بهترین نتایج دست یابند.</p>
        </div>
        <div class="grid md:grid-cols-2 gap-x-8 gap-y-6">
            <div class="flex items-start gap-4">
                <div class="bg-accent/10 p-2 rounded-lg"><i data-lucide="brain-circuit" class="w-6 h-6 text-accent"></i></div>
                <div>
                    <h4 class="font-semibold text-text-primary">برنامه‌ریزی هوشمند با AI</h4>
                    <p class="text-sm text-text-secondary">با استفاده از هوش مصنوعی، برنامه‌های تمرینی و غذایی بهینه و شخصی‌سازی شده برای هر ورزشکار ایجاد کنید.</p>
                </div>
            </div>
             <div class="flex items-start gap-4">
                <div class="bg-accent/10 p-2 rounded-lg"><i data-lucide="bar-chart-3" class="w-6 h-6 text-accent"></i></div>
                <div>
                    <h4 class="font-semibold text-text-primary">پیگیری دقیق پیشرفت</h4>
                    <p class="text-sm text-text-secondary">روند پیشرفت وزن، قدرت و سایر معیارهای کلیدی را با نمودارهای تحلیلی و گزارش‌های جامع دنبال کنید.</p>
                </div>
            </div>
             <div class="flex items-start gap-4">
                <div class="bg-accent/10 p-2 rounded-lg"><i data-lucide="users" class="w-6 h-6 text-accent"></i></div>
                <div>
                    <h4 class="font-semibold text-text-primary">مدیریت آسان شاگردان</h4>
                    <p class="text-sm text-text-secondary">مربیان می‌توانند به راحتی پروفایل شاگردان، برنامه‌ها و ارتباطات را در یک داشبورد متمرکز مدیریت کنند.</p>
                </div>
            </div>
             <div class="flex items-start gap-4">
                <div class="bg-accent/10 p-2 rounded-lg"><i data-lucide="message-square" class="w-6 h-6 text-accent"></i></div>
                <div>
                    <h4 class="font-semibold text-text-primary">ارتباط مستقیم و مؤثر</h4>
                    <p class="text-sm text-text-secondary">سیستم چت داخلی امکان ارتباط سریع و امن بین مربی و شاگرد را برای پشتیبانی بهتر فراهم می‌کند.</p>
                </div>
            </div>
             <div class="flex items-start gap-4">
                <div class="bg-accent/10 p-2 rounded-lg"><i data-lucide="book-open" class="w-6 h-6 text-accent"></i></div>
                <div>
                    <h4 class="font-semibold text-text-primary">بانک اطلاعاتی جامع</h4>
                    <p class="text-sm text-text-secondary">دسترسی به پایگاه داده‌ای غنی از حرکات تمرینی و مکمل‌های ورزشی با توضیحات کامل و ویدیوهای آموزشی.</p>
                </div>
            </div>
             <div class="flex items-start gap-4">
                <div class="bg-accent/10 p-2 rounded-lg"><i data-lucide="save" class="w-6 h-6 text-accent"></i></div>
                <div>
                    <h4 class="font-semibold text-text-primary">ذخیره و استفاده از الگوها</h4>
                    <p class="text-sm text-text-secondary">برنامه‌های تمرینی و غذایی موفق را به عنوان الگو ذخیره کرده و برای شاگردان جدید با یک کلیک استفاده کنید.</p>
                </div>
            </div>
        </div>
    </div>
`;

const getPricingHTML = () => `
    <div>
        <div class="text-center mb-8">
            <h3 class="font-bold text-xl text-accent">تعرفه‌ها و پلن‌های عضویت</h3>
            <p class="text-text-secondary mt-2">پلنی را انتخاب کنید که به بهترین شکل با اهداف شما هماهنگ است.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            ${STORE_PLANS.map(plan => `
                <div class="card p-6 flex flex-col border-2 ${plan.planId.includes('full-3m') ? 'border-accent' : 'border-transparent'}">
                    <h4 class="text-lg font-bold text-text-primary">${plan.planName}</h4>
                    <p class="text-sm text-text-secondary mt-1 flex-grow">${plan.description}</p>
                    <div class="my-6">
                        <span class="text-3xl font-black text-white">${formatPrice(plan.price).split(' ')[0]}</span>
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
                    <button class="primary-button mt-auto w-full">انتخاب پلن</button>
                </div>
            `).join('')}
        </div>
    </div>
`;

const getContactHTML = () => `
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
                    <a href="mailto:support@fitgympro.com" class="text-text-secondary hover:text-accent">support@fitgympro.com</a>
                </div>
                <div class="flex items-center gap-3">
                    <i data-lucide="phone" class="w-5 h-5 text-accent"></i>
                    <span class="text-text-secondary" dir="ltr">۰۲۱-۱۲۳۴۵۶۷۸</span>
                </div>
            </div>
             <div class="mt-8 pt-6 border-t border-border-primary">
                 <h4 class="font-semibold mb-4 text-text-primary">ما را دنبال کنید</h4>
                 <div class="flex items-center gap-5">
                    <a href="#" class="social-icon-link text-2xl"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="social-icon-link text-2xl"><i class="fab fa-telegram"></i></a>
                    <a href="#" class="social-icon-link text-2xl"><i class="fab fa-youtube"></i></a>
                 </div>
             </div>
        </div>
    </div>
`;

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

const openInfoModal = (section: string) => {
    const modal = document.getElementById('info-modal');
    const titleEl = document.getElementById('info-modal-title');
    const bodyEl = document.getElementById('info-modal-body');
    if (!modal || !titleEl || !bodyEl) return;

    const contentMap: Record<string, { title: string; content: string }> = {
        features: { title: 'ویژگی‌ها', content: getFeaturesHTML() },
        pricing: { title: 'تعرفه‌ها', content: getPricingHTML() },
        contact: { title: 'تماس با ما', content: getContactHTML() },
        coaches: { title: 'مربیان', content: getCoachesHTML() }
    };

    const sectionData = contentMap[section];
    if (!sectionData) return;

    titleEl.textContent = sectionData.title;
    bodyEl.innerHTML = sectionData.content;

    window.lucide?.createIcons();
    openModal(modal);
}

export function initLandingPageListeners() {
    document.body.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const authModalBtn = target.closest('#open-auth-modal-btn');
        const infoLink = target.closest('.landing-nav-link[data-section]');
        const coachSignupBtn = target.closest('#coach-signup-cta');

        if (authModalBtn) {
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
}

export function renderLandingPage() {
    return `
    <div class="landing-page-container bg-bg-primary text-text-primary flex flex-col transition-opacity duration-500 opacity-0">
        <div class="landing-bg"></div>
        <div class="relative z-10 flex flex-col flex-grow">
            <header class="p-4">
                <nav class="container mx-auto flex justify-between items-center glass-nav p-3 rounded-2xl">
                    <div class="flex items-center gap-2">
                        <img src="https://assets.website-files.com/63f5b734614a2ce081831035/63f5b734614a2c07a3831065_icon-256w.png" alt="FitGym Pro Logo" class="w-10 h-10">
                        <span class="text-xl font-bold text-white">FitGym Pro</span>
                    </div>
                    <div class="hidden md:flex items-center gap-6">
                        <button data-section="features" class="landing-nav-link text-white">ویژگی‌ها</button>
                        <button data-section="pricing" class="landing-nav-link text-white">تعرفه‌ها</button>
                        <button data-section="coaches" class="landing-nav-link text-white">مربیان</button>
                        <button data-section="contact" class="landing-nav-link text-white">تماس با ما</button>
                    </div>
                    <div>
                        <button id="open-auth-modal-btn" class="primary-button">ورود / ثبت نام</button>
                    </div>
                </nav>
            </header>

            <main class="flex-grow flex items-center">
                <div class="container mx-auto text-center px-4">
                    <h1 class="text-4xl md:text-6xl font-black text-white leading-tight animate-fade-in-down">
                        آینده <span class="text-accent">تناسب اندام</span> اینجاست
                    </h1>
                    <p class="mt-6 max-w-2xl mx-auto text-lg text-text-secondary animate-fade-in-up animation-delay-200">
                        برنامه‌های تمرینی و غذایی شخصی‌سازی شده با قدرت هوش مصنوعی. به اهداف خود سریع‌تر و هوشمندانه‌تر برسید.
                    </p>
                    <div class="mt-10 animate-fade-in-up animation-delay-400">
                        <button id="open-auth-modal-btn" class="hero-cta-btn primary-button !text-lg !px-10 !py-4">
                            <div class="glow-circle"></div>
                            شروع کنید
                        </button>
                    </div>

                    <div class="motivational-card animate-fade-in-up animation-delay-600">
                        <div class="stat">
                            <i class="fas fa-users fa-2x"></i>
                            <div class="stat-text text-right">
                                <p class="text-white">۱,۵۰۰+</p>
                                <p>کاربر فعال</p>
                            </div>
                        </div>
                         <div class="stat">
                            <i class="fas fa-chart-line fa-2x"></i>
                            <div class="stat-text text-right">
                                <p class="text-white">۱۰,۰۰۰+</p>
                                <p>برنامه موفق</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
             <footer class="text-center p-6 text-text-secondary text-sm">
                <div class="flex justify-center gap-6 mb-4">
                    <a href="#" class="social-icon-link"><i class="fab fa-instagram fa-lg"></i></a>
                    <a href="#" class="social-icon-link"><i class="fab fa-telegram fa-lg"></i></a>
                    <a href="#" class="social-icon-link"><i class="fab fa-youtube fa-lg"></i></a>
                </div>
                <p>&copy; 2024 FitGym Pro. تمامی حقوق محفوظ است.</p>
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