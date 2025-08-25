import { showToast } from "../utils/dom";

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