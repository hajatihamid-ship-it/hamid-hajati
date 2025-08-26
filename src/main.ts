import { renderLandingPage, initLandingPageListeners } from './ui/landing';
import { renderAuthModal, initAuthListeners } from './ui/authModal';
import { renderCoachDashboard, initCoachDashboard, updateCoachNotifications } from './ui/coachDashboard';
import { renderUserDashboard, initUserDashboard, updateUserNotifications } from './ui/userDashboard';
import { renderAdminDashboard, initAdminDashboard } from './ui/adminDashboard';
import { getUsers, getUserData, saveUsers, saveUserData, addActivityLog, saveDiscounts, getStorePlans, saveStorePlans, seedCMSData } from './services/storage';
import { setCurrentUser, getCurrentUser } from './state';
import { sanitizeHTML } from './utils/dom';
import { STORE_PLANS } from './config';

let notificationInterval: number | null = null;

const seedInitialUsers = () => {
    if (getUsers().length === 0) {
        console.log("No users found. Seeding initial admin, coach, and user.");
        const initialUsers = [
             { username: "admin10186", email: "admin@fitgympro.com", password: "admin10186", role: "admin", status: "active", coachStatus: null, joinDate: new Date().toISOString() },
             { username: "coach10186", email: "coach@fitgympro.com", password: "coach10186", role: "coach", status: "active", coachStatus: "verified", joinDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
             { username: "coach_pending", email: "newcoach@fitgympro.com", password: "password123", role: "coach", status: "active", coachStatus: "pending", joinDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
             { username: "user_active", email: "user@fitgympro.com", password: "password123", role: "user", status: "active", coachStatus: null, joinDate: new Date().toISOString() },
             { username: "user_suspended", email: "suspended@fitgympro.com", password: "password123", role: "user", status: "suspended", coachStatus: null, joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
             { username: "user_needs_plan", email: "needsplan@fitgympro.com", password: "password123", role: "user", status: "active", coachStatus: null, joinDate: new Date().toISOString() }
        ];
        saveUsers(initialUsers);
        
        // --- Seed individual user data for ALL users ---
        saveUserData("admin10186", {
             step1: { clientName: "Admin" }
        });

        saveUserData("coach10186", {
             step1: { coachName: "Coach Verified", clientName: "Coach Verified" },
             students: 28
        });
        
        saveUserData("coach_pending", {
             step1: { coachName: "Coach Pending", clientName: "Coach Pending" }
        });
        
        saveUserData("user_suspended", {
            step1: { clientName: "User Suspended", clientEmail: "suspended@fitgympro.com" },
            joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dayBeforeYesterday = new Date();
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

        const userWorkoutData = {
            step1: {
                clientName: "User Active",
                clientEmail: "user@fitgympro.com",
                coachName: "coach10186",
                age: 28,
                height: 178,
                weight: 78,
                gender: "مرد",
                activityLevel: 1.55,
                trainingGoal: "افزایش حجم",
                trainingDays: 4,
                mobile: "09123456789",
                neck: 40,
                waist: 85,
                hip: 95
            },
            joinDate: new Date().toISOString(),
            step2: {
                days: [{
                    name: "شنبه: سینه و پشت بازو",
                    exercises: [
                        { name: "پرس سینه هالتر", sets: 4, reps: 10, rest: 60, is_superset: false },
                        { name: "پشت بازو سیم‌کش", sets: 4, reps: 12, rest: 60, is_superset: false },
                        { name: "قفسه سینه دمبل", sets: 3, reps: 12, rest: 45, is_superset: true },
                        { name: "دیپ پارالل", sets: 3, reps: 15, rest: 45, is_superset: true },
                    ]
                }, {
                    name: "یکشنبه: پشت و جلو بازو",
                     exercises: [
                        { name: "ددلیفت", sets: 4, reps: 6, rest: 120, is_superset: false },
                        { name: "بارفیکس دست باز", sets: 4, reps: 10, rest: 75, is_superset: false },
                        { name: "جلو بازو هالتر", sets: 3, reps: 12, rest: 45, is_superset: false },
                    ]
                }, {
                    name: "دوشنبه: پا",
                    exercises: [
                        { name: "اسکوات با هالتر", sets: 5, reps: 8, rest: 90, is_superset: false },
                        { name: "پرس پا", sets: 4, reps: 12, rest: 60, is_superset: false },
                        { name: "پشت پا ماشین خوابیده", sets: 4, reps: 15, rest: 45, is_superset: false },
                    ]
                }, {
                    name: "سه‌شنبه: استراحت",
                    exercises: []
                }, {
                    name: "چهارشنبه: سرشانه",
                     exercises: [
                        { name: "پرس سرشانه هالتر", sets: 4, reps: 8, rest: 75, is_superset: false },
                        { name: "نشر از جانب دمبل", sets: 4, reps: 12, rest: 60, is_superset: false },
                        { name: "فیس پول", sets: 3, reps: 15, rest: 45, is_superset: false },
                    ]
                }, {
                    name: "پنجشنبه: فول بادی (اختیاری)",
                     exercises: [
                        { name: "اسکوات گابلت", sets: 3, reps: 12, rest: 60, is_superset: false },
                        { name: "شنا سوئدی", sets: 3, reps: 15, rest: 60, is_superset: false },
                        { name: "پلانک", sets: 3, reps: 60, rest: 60, is_superset: false },
                    ]
                }, {
                    name: "جمعه: استراحت",
                    exercises: []
                }],
                notes: "قبل از هر تمرین ۵ دقیقه گرم کنید. بعد از تمرین حرکات کششی فراموش نشود. به میزان کافی آب بنوشید و روی کیفیت خواب تمرکز کنید."
            },
            chatHistory: [
                { sender: 'coach', message: 'سلام! برنامه جدیدت رو ارسال کردم. حتما بررسی کن.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
                { sender: 'user', message: 'ممنون مربی، عالیه!', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() }
            ],
            workoutHistory: [
                {
                    date: dayBeforeYesterday.toISOString(),
                    dayIndex: 1,
                    exercises: [
                        { name: 'ددلیفت', sets: [{weight: 100, reps: 6}, {weight: 100, reps: 6}, {weight: 105, reps: 5}, {weight: 105, reps: 5}] },
                        { name: 'بارفیکس دست باز', sets: [{reps: 10}, {reps: 9}, {reps: 8}, {reps: 8}] },
                        { name: 'جلو بازو هالتر', sets: [{weight: 30, reps: 12}, {weight: 30, reps: 11}, {weight: 30, reps: 10}] }
                    ]
                },
                {
                    date: yesterday.toISOString(),
                    dayIndex: 2,
                    exercises: [
                        { name: 'اسکوات با هالتر', sets: [{weight: 80, reps: 8}, {weight: 80, reps: 8}, {weight: 85, reps: 7}, {weight: 85, reps: 7}, {weight: 85, reps: 6}] },
                        { name: 'پرس پا', sets: [{weight: 150, reps: 12}, {weight: 150, reps: 12}, {weight: 160, reps: 10}, {weight: 160, reps: 10}] }
                    ]
                }
            ],
            weightHistory: [
                { date: '2024-05-01', weight: 78 }, 
                { date: '2024-05-15', weight: 79.5 }, 
                { date: '2024-06-01', weight: 79 },
                { date: '2024-06-15', weight: 80.2 },
                { date: '2024-07-01', weight: 81 }
            ]
        };
        saveUserData("user_active", userWorkoutData);

        saveUserData("user_needs_plan", {
            step1: { clientName: "User Needs Plan", clientEmail: "needsplan@fitgympro.com", coachName: "coach10186" },
            joinDate: new Date().toISOString(),
            subscriptions: [{
                planId: 'full-1m',
                planName: 'پکیج کامل ۱ ماهه',
                price: 250000,
                purchaseDate: new Date().toISOString(),
                fulfilled: false
            }]
        });

        addActivityLog("Initial users (admin, coaches, users) were created automatically.");
        saveDiscounts({ 'WELCOME10': { type: 'percentage', value: 10 }, 'SAVE50K': { type: 'fixed', value: 50000 } });
        addActivityLog("Initial discount codes created.");
    }
     // Seed plans if they don't exist
    if (getStorePlans().length === 0) {
        saveStorePlans(STORE_PLANS);
        addActivityLog("Initial store plans were created automatically.");
    }
};

const updateAllNotifications = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const user = getUsers().find((u: any) => u.username === currentUser);
    if (!user) return;

    if (user.role === 'coach') {
        updateCoachNotifications(currentUser);
    } else if (user.role === 'user') {
        updateUserNotifications(currentUser);
    }
};

export const renderApp = () => {
    const appContainer = document.getElementById('app-root');
    if (!appContainer) return;
    
    // Stop any previously running interval.
    if (notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
    }

    const lastUser = localStorage.getItem("fitgympro_last_user");
    setCurrentUser(lastUser || null);
    const currentUser = getCurrentUser();

    if (!currentUser) {
        appContainer.innerHTML = renderLandingPage() + renderAuthModal();
        initLandingPageListeners();
        initAuthListeners(handleLoginSuccess);
    } else {
        const users = getUsers();
        const currentUserData = users.find((u: any) => u.username === currentUser);
        if (!currentUserData) {
            handleLogout();
            return;
        }

        const userData = getUserData(currentUser);

        switch (currentUserData.role) {
            case 'admin':
                appContainer.innerHTML = renderAdminDashboard();
                initAdminDashboard(handleLogout, handleLoginSuccess);
                break;
            case 'coach':
                appContainer.innerHTML = renderCoachDashboard();
                initCoachDashboard(currentUser, handleLogout);
                break;
            case 'user':
                appContainer.innerHTML = renderUserDashboard(currentUser, userData);
                initUserDashboard(currentUser, userData, handleLogout);
                break;
            default:
                handleLogout();
                return;
        }
        
        updateAllNotifications();
        // Start a new interval for live notifications.
        notificationInterval = window.setInterval(updateAllNotifications, 3000);
    }
    
    // Handle impersonation banner
    const impersonatingAdmin = sessionStorage.getItem("impersonating_admin");
    if (impersonatingAdmin && currentUser && currentUser !== impersonatingAdmin) {
        const placeholder = document.getElementById('impersonation-banner-placeholder');
        if (placeholder) {
            placeholder.innerHTML = `
            <div class="bg-orange-500 text-white p-3 text-center font-semibold flex items-center justify-center gap-4 mb-6 rounded-lg shadow-md animate-fade-in-down">
                <i class="fas fa-user-secret fa-lg"></i>
                <span>شما در حال مشاهده به عنوان <span class="font-bold">${currentUser}</span> هستید.</span>
                <button id="exit-impersonation-btn" class="bg-white/20 hover:bg-white/30 text-white font-bold py-1 px-3 rounded-md text-sm border border-white/30">بازگشت به حساب ادمین</button>
            </div>
            `;
        }
    }


    window.lucide?.createIcons();
    
    setTimeout(() => {
        const mainContainer = document.querySelector('.landing-page-container, #coach-dashboard-container, #user-dashboard-container, .admin-dashboard-container');
        if (mainContainer) {
            mainContainer.classList.add('opacity-100');
        }
    }, 50);
};

export const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem("fitgympro_last_user", username);
    renderApp();
};

export const handleLogout = () => {
    // If admin is impersonating, logout should return them to admin panel
    const impersonatingAdmin = sessionStorage.getItem("impersonating_admin");
    if (impersonatingAdmin) {
        sessionStorage.removeItem("impersonating_admin");
        handleLoginSuccess(impersonatingAdmin);
        return;
    }
    setCurrentUser(null);
    localStorage.removeItem("fitgympro_last_user");
    renderApp();
};

const initTheme = () => {
    const docElement = document.documentElement;
    const themes = ['dark', 'lemon', 'light'];

    const applyTheme = (theme: string) => {
        const validTheme = themes.includes(theme) ? theme : 'lemon';
        docElement.setAttribute("data-theme", validTheme);
        localStorage.setItem("fitgympro_theme", validTheme);
        
        const themeToggleBtn = document.getElementById("theme-toggle-btn-dashboard");
        if (themeToggleBtn) {
            const icon = themeToggleBtn.querySelector("i");
            if (icon) {
                icon.setAttribute('data-lucide', validTheme === 'dark' ? 'sun' : 'moon');
            }
        }
        if (window.lucide) {
            window.lucide.createIcons();
        }
    };

    const currentTheme = localStorage.getItem("fitgympro_theme") || "lemon";
    applyTheme(currentTheme);

    document.body.addEventListener('click', (e) => {
        if (!(e.target instanceof HTMLElement)) return;
        const toggleBtn = e.target.closest('#theme-toggle-btn-dashboard');
        if (toggleBtn) {
            const currentTheme = docElement.getAttribute("data-theme") || "dark";
            const currentIndex = themes.indexOf(currentTheme);
            const nextIndex = (currentIndex + 1) % themes.length;
            const newTheme = themes[nextIndex];
            applyTheme(newTheme);
        }
    });
};

const initCommonListeners = () => {
    document.body.addEventListener('click', e => {
        if (!(e.target instanceof HTMLElement)) return;
        const target = e.target;
        const passToggle = target.closest('.password-toggle');
        if (passToggle) {
            const targetId = passToggle.getAttribute('data-target');
            if (targetId) {
                const passInput = document.getElementById(targetId) as HTMLInputElement;
                const icon = passToggle.querySelector('i');
                if (passInput && icon) {
                    if (passInput.type === 'password') {
                        passInput.type = 'text';
                        icon.setAttribute('data-lucide', 'eye-off');
                    } else {
                        passInput.type = 'password';
                        icon.setAttribute('data-lucide', 'eye');
                    }
                    window.lucide?.createIcons();
                }
            }
        }
        
        // Impersonation exit listener
        if (target.closest('#exit-impersonation-btn')) {
            const adminUsername = sessionStorage.getItem('impersonating_admin');
            if (adminUsername) {
                addActivityLog(`ادمین از حالت مشاهده حساب ${getCurrentUser()} خارج شد.`);
                sessionStorage.removeItem('impersonating_admin');
                handleLoginSuccess(adminUsername);
            }
        }
    });
};

export const initApp = () => {
    seedInitialUsers();
    seedCMSData();
    renderApp();
    initCommonListeners();
    initTheme();
    
    // Use a mutation observer to re-apply icons and theme settings after re-renders
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                initTheme(); // Re-apply theme specific icons
                window.lucide?.createIcons();
            }
        }
    });
    
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
        observer.observe(appRoot, { childList: true });
    }
};
