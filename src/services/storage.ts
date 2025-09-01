import { showToast } from "../utils/dom";
import { exerciseDB as initialExerciseDB, supplementsDB as initialSupplementsDB } from '../config';

// --- Users ---
export const getUsers = () => {
    try {
        return JSON.parse(localStorage.getItem("fitgympro_users") || "[]");
    } catch (e) {
        console.error("Error parsing users from localStorage:", e);
        return [];
    }
};

export const saveUsers = (users: any[]) => {
    try {
        localStorage.setItem("fitgympro_users", JSON.stringify(users));
    } catch (t) {
        console.error("Error saving users to localStorage:", t);
        showToast("خطا در ذخیره‌سازی اطلاعات کاربران", "error");
    }
};

// --- User Data ---
export const getUserData = (username: string) => {
    try {
        return JSON.parse(localStorage.getItem(`fitgympro_data_${username}`) || "{}");
    } catch (t) {
        console.error(`Error parsing data for user ${username}:`, t);
        return {};
    }
};

export const saveUserData = (username: string, data: any) => {
    try {
        localStorage.setItem(`fitgympro_data_${username}`, JSON.stringify(data));
    } catch (s) {
        console.error(`Error saving data for user ${username} to localStorage:`, s);
        showToast("خطا در ذخیره‌سازی اطلاعات برنامه", "error");
    }
};

// --- Activity Log ---
export const getActivityLog = () => {
    try {
        return JSON.parse(localStorage.getItem("fitgympro_activity_log") || "[]");
    } catch (e) {
        console.error("Error parsing activity log from localStorage:", e);
        return [];
    }
};

export const addActivityLog = (message: string) => {
    try {
        let log = getActivityLog();
        log.unshift({
            message: message,
            date: new Date().toISOString()
        });
        if (log.length > 50) {
            log = log.slice(0, 50);
        }
        localStorage.setItem("fitgympro_activity_log", JSON.stringify(log));
    } catch (t) {
        console.error("Error saving activity log to localStorage:", t);
    }
};

// --- Templates ---
export const getTemplates = () => {
    try {
        return JSON.parse(localStorage.getItem("fitgympro_templates") || "{}");
    } catch (e) {
        console.error("Error parsing templates from localStorage:", e);
        return {};
    }
};

const saveTemplates = (templates: any) => {
    try {
        localStorage.setItem("fitgympro_templates", JSON.stringify(templates));
    } catch (t) {
        console.error("Error saving templates to localStorage:", t);
        showToast("خطا در ذخیره‌سازی الگوها", "error");
    }
};

export const saveTemplate = (name: string, data: any) => {
    const templates = getTemplates();
    templates[name] = data;
    saveTemplates(templates);
};

export const deleteTemplate = (name: string) => {
    const templates = getTemplates();
    delete templates[name];
    saveTemplates(templates);
};


// --- CART & DISCOUNTS ---
export const getCart = (username: string) => {
    if (!username) return { items: [], discountCode: null };
    try {
        return JSON.parse(localStorage.getItem(`fitgympro_cart_${username}`) || '{"items":[], "discountCode": null}');
    } catch {
        return { items: [], discountCode: null };
    }
};

export const saveCart = (username: string, cart: any) => {
    if (!username) return;
    try {
        localStorage.setItem(`fitgympro_cart_${username}`, JSON.stringify(cart));
    } catch (e) {
        console.error("Failed to save cart to localStorage:", e);
        showToast("خطا در ذخیره‌سازی سبد خرید", "error");
    }
};

export interface Discount {
    type: string;
    value: number;
}

export const getDiscounts = (): Record<string, Discount> => JSON.parse(localStorage.getItem('fitgympro_discounts') || '{}');

export const saveDiscounts = (discounts: any) => {
    try {
        localStorage.setItem('fitgympro_discounts', JSON.stringify(discounts));
    } catch (e) {
        console.error("Failed to save discounts to localStorage:", e);
        showToast("خطا در ذخیره‌سازی تخفیف‌ها", "error");
    }
};

// --- STORE PLANS ---
export const getStorePlans = () => {
    try {
        return JSON.parse(localStorage.getItem("fitgympro_store_plans") || "[]");
    } catch (e) {
        console.error("Error parsing store plans from localStorage:", e);
        return [];
    }
};

export const saveStorePlans = (plans: any[]) => {
    try {
        localStorage.setItem("fitgympro_store_plans", JSON.stringify(plans));
    } catch (t) {
        console.error("Error saving store plans to localStorage:", t);
        showToast("خطا در ذخیره‌سازی پلن‌ها", "error");
    }
};


// --- NOTIFICATIONS ---
export const getNotifications = (username: string): Record<string, string> => {
    if (!username) return {};
    try {
        return JSON.parse(localStorage.getItem(`fitgympro_notifications_${username}`) || "{}");
    } catch {
        return {};
    }
};

export const setNotification = (username: string, key: string, emoji: string) => {
    if (!username) return;
    const notifications = getNotifications(username);
    notifications[key] = emoji;
    localStorage.setItem(`fitgympro_notifications_${username}`, JSON.stringify(notifications));
};

export const clearNotification = (username: string, key: string) => {
    if (!username) return;
    const notifications = getNotifications(username);
    delete notifications[key];
    localStorage.setItem(`fitgympro_notifications_${username}`, JSON.stringify(notifications));
};

export const clearAllNotifications = (username: string) => {
    if (!username) return;
    localStorage.removeItem(`fitgympro_notifications_${username}`);
};


// --- CMS Data (Exercises & Supplements) ---
export const getExercisesDB = (): Record<string, string[]> => {
    try {
        return JSON.parse(localStorage.getItem("fitgympro_exercises") || "{}");
    } catch (e) {
        console.error("Error parsing exercises from localStorage:", e);
        return {};
    }
};

export const saveExercisesDB = (db: Record<string, string[]>) => {
    try {
        localStorage.setItem("fitgympro_exercises", JSON.stringify(db));
    } catch (t) {
        console.error("Error saving exercises to localStorage:", t);
        showToast("خطا در ذخیره‌سازی تمرینات", "error");
    }
};

export const getSupplementsDB = (): Record<string, any[]> => {
    try {
        return JSON.parse(localStorage.getItem("fitgympro_supplements") || "{}");
    } catch (e) {
        console.error("Error parsing supplements from localStorage:", e);
        return {};
    }
};

export const saveSupplementsDB = (db: Record<string, any[]>) => {
    try {
        localStorage.setItem("fitgympro_supplements", JSON.stringify(db));
    } catch (t) {
        console.error("Error saving supplements to localStorage:", t);
        showToast("خطا در ذخیره‌سازی مکمل‌ها", "error");
    }
};

// --- MAGAZINE ---
export const getMagazineArticles = (): any[] => {
    try {
        return JSON.parse(localStorage.getItem("fitgympro_magazine_articles") || "[]");
    } catch (e) {
        console.error("Error parsing magazine articles from localStorage:", e);
        return [];
    }
};

export const saveMagazineArticles = (articles: any[]) => {
    try {
        localStorage.setItem("fitgympro_magazine_articles", JSON.stringify(articles));
    } catch (t) {
        console.error("Error saving magazine articles to localStorage:", t);
        showToast("خطا در ذخیره‌سازی مقالات", "error");
    }
};


export const seedCMSData = () => {
    if (!localStorage.getItem("fitgympro_exercises")) {
        saveExercisesDB(initialExerciseDB);
        addActivityLog("Initial exercise database was seeded.");
    }
    if (!localStorage.getItem("fitgympro_supplements")) {
        saveSupplementsDB(initialSupplementsDB);
        addActivityLog("Initial supplement database was seeded.");
    }
    if (getMagazineArticles().length === 0) {
        const seedArticles = [
            {
                id: `article_${Date.now()}_1`,
                title: "۵ نکته کلیدی برای افزایش حجم عضلانی",
                category: "تغذیه و عضله‌سازی",
                imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop",
                content: "برای عضله‌سازی موثر، باید روی چند اصل کلیدی تمرکز کنید. اول، دریافت پروتئین کافی. پروتئین واحد سازنده عضلات است و باید روزانه حدود ۱.۶ تا ۲.۲ گرم به ازای هر کیلوگرم وزن بدن مصرف کنید. دوم، مازاد کالری کنترل شده. برای ساخت عضله به انرژی نیاز دارید، اما مازاد بیش از حد منجر به افزایش چربی می‌شود. حدود ۳۰۰-۵۰۰ کالری بیشتر از کالری نگهداری روزانه خود هدف‌گذاری کنید...",
                publishDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: `article_${Date.now()}_2`,
                title: "چگونه بهترین برنامه کاردیو را برای چربی‌سوزی انتخاب کنیم؟",
                category: "هوازی و کاهش وزن",
                imageUrl: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=2070&auto=format&fit=crop",
                content: "تمرینات هوازی یا کاردیو بخش مهمی از هر برنامه کاهش وزن هستند. اما کدام نوع بهتر است؟ تمرینات اینتروال با شدت بالا (HIIT) مانند دویدن‌های سرعتی کوتاه، در زمان کمتر کالری بیشتری می‌سوزانند و متابولیسم را تا ساعت‌ها بالا نگه می‌دارند. از طرف دیگر، تمرینات با شدت یکنواخت و طولانی (LISS) مانند پیاده‌روی سریع یا دوچرخه‌سواری، فشار کمتری به مفاصل وارد کرده و برای ریکاوری بهتر هستند. بهترین رویکرد، ترکیبی از هر دو است.",
                publishDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        saveMagazineArticles(seedArticles);
        addActivityLog("Initial magazine articles were seeded.");
    }
};


// --- Site Settings ---
export const getSiteSettings = () => {
    const defaults = {
        siteName: 'FitGym Pro',
        logoUrl: '',
        accentColor: '#a3e635',
        maintenanceMode: false,
        allowCoachRegistration: true,
        socialMedia: {
            instagram: 'https://instagram.com/fitgympro',
            telegram: 'https://t.me/fitgympro',
            youtube: 'https://youtube.com/fitgympro'
        },
        contactInfo: {
            email: 'support@fitgympro.com',
            phone: '021-12345678',
            address: 'تهران، خیابان آزادی، پلاک ۱۰۱'
        },
        financial: {
            commissionRate: 30, // As a percentage
            activeGateway: 'zarinpal'
        },
        content: {
            terms: 'لطفا قوانین و مقررات را در اینجا وارد کنید.',
            privacyPolicy: 'لطفا سیاست حریم خصوصی را در اینجا وارد کنید.'
        },
        integrations: {
            paymentGateways: {
                zarinpal: '',
                idpay: ''
            },
            webhooks: []
        },
        monetization: {
            affiliateSystem: {
                enabled: false,
                commissionRate: 15
            }
        }
    };
    try {
        const settings = JSON.parse(localStorage.getItem("fitgympro_site_settings") || "{}");
        // Deep merge to ensure new settings properties are added and defaults are kept
        return {
            ...defaults,
            ...settings,
            socialMedia: {
                ...defaults.socialMedia,
                ...(settings.socialMedia || {})
            },
            contactInfo: {
                ...defaults.contactInfo,
                ...(settings.contactInfo || {})
            },
            financial: {
                ...defaults.financial,
                ...(settings.financial || {})
            },
            content: {
                ...defaults.content,
                ...(settings.content || {})
            },
            integrations: {
                ...defaults.integrations,
                ...(settings.integrations || {}),
                paymentGateways: {
                    ...defaults.integrations.paymentGateways,
                    ...((settings.integrations || {}).paymentGateways || {})
                }
            },
            monetization: {
                ...defaults.monetization,
                ...(settings.monetization || {}),
                affiliateSystem: {
                     ...defaults.monetization.affiliateSystem,
                    ...((settings.monetization || {}).affiliateSystem || {})
                }
            }
        };
    } catch (e) {
        console.error("Error parsing site settings from localStorage:", e);
        return defaults;
    }
};

export const saveSiteSettings = (settings: any) => {
    try {
        localStorage.setItem("fitgympro_site_settings", JSON.stringify(settings));
    } catch (t) {
        console.error("Error saving site settings to localStorage:", t);
        showToast("خطا در ذخیره‌سازی تنظیمات سایت", "error");
    }
};