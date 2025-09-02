import { showToast, closeModal } from '../utils/dom';
import { getUsers, saveUsers, saveUserData, addActivityLog, getUserData, getStorePlans, getCart, saveCart } from '../services/storage';
import { performMetricCalculations } from '../utils/calculations';

const switchAuthForm = (formToShow: 'login' | 'signup' | 'forgot-password' | 'forgot-confirmation') => {
    const containers: { [key: string]: HTMLElement | null } = {
        login: document.getElementById("login-form-container"),
        signup: document.getElementById("signup-form-container"),
        'forgot-password': document.getElementById("forgot-password-form-container"),
        'forgot-confirmation': document.getElementById("forgot-password-confirmation"),
    };

    let activeContainer: HTMLElement | null = null;

    Object.values(containers).forEach(container => {
        if (container && container.classList.contains('form-active')) {
            activeContainer = container;
        }
    });

    if (activeContainer) {
        activeContainer.classList.remove('form-active');
        activeContainer.classList.add('is-switching-out');
        activeContainer.addEventListener('transitionend', () => {
            activeContainer?.classList.add('hidden');
            activeContainer?.classList.remove('is-switching-out');
        }, { once: true });
    }

    const newContainer = containers[formToShow];
    if (newContainer) {
        setTimeout(() => {
            newContainer.classList.remove('hidden');
            // Force reflow to ensure transition is applied
            void newContainer.offsetWidth; 
            newContainer.classList.add('form-active');
        }, activeContainer ? 150 : 0);
    }
};

const showValidationError = (inputEl: HTMLInputElement, message: string) => {
    const group = inputEl.closest('.input-group');
    if (!group) return;
    inputEl.classList.add('input-error');
    const errorEl = group.querySelector('.validation-message');
    if (errorEl) errorEl.textContent = message;
};

const clearValidationError = (inputEl: HTMLInputElement) => {
    const group = inputEl.closest('.input-group');
    if (!group) return;
    inputEl.classList.remove('input-error');
    const errorEl = group.querySelector('.validation-message');
    if (errorEl) errorEl.textContent = '';
};

const applyCalculatorData = (username: string): boolean => {
    const calculatorDataRaw = sessionStorage.getItem('fitgympro_calculator_data');
    if (!calculatorDataRaw) return false;

    try {
        const calculatorData = JSON.parse(calculatorDataRaw);
        const userData = getUserData(username);
        if (!userData.step1) userData.step1 = {};

        const step1Data: any = {
            ...userData.step1,
            gender: calculatorData.gender,
            age: parseInt(calculatorData.age, 10),
            height: parseInt(calculatorData.height, 10),
            weight: parseFloat(calculatorData.weight),
            trainingGoal: calculatorData.trainingGoal,
            trainingDays: parseInt(calculatorData.trainingDays, 10),
            activityLevel: parseFloat(calculatorData.activityLevel),
        };

        const metrics = performMetricCalculations(step1Data);
        if (metrics && metrics.tdee) {
            step1Data.tdee = metrics.tdee;
        }
        
        userData.step1 = step1Data;

        saveUserData(username, userData);
        sessionStorage.removeItem('fitgympro_calculator_data');
        return true;

    } catch (e) {
        console.error("Failed to apply calculator data:", e);
        sessionStorage.removeItem('fitgympro_calculator_data');
        return false;
    }
}

const addSelectedPlanToCart = (username: string): boolean => {
    const selectedPlanId = sessionStorage.getItem('fitgympro_selected_plan');
    if (!selectedPlanId) return false;

    const plans = getStorePlans();
    const planToAdd = plans.find((p: any) => p.planId === selectedPlanId);
    
    if (planToAdd) {
        const cart = getCart(username);
        // Avoid duplicates
        if (!cart.items.some((item: any) => item.planId === selectedPlanId)) {
            cart.items.push(planToAdd);
            saveCart(username, cart);
            showToast(`${planToAdd.planName} به سبد خرید اضافه شد.`, 'success');
        }
    }
    
    sessionStorage.removeItem('fitgympro_selected_plan');
    return true;
};

const checkPasswordStrength = (password: string) => {
    const meter = document.getElementById('password-strength-meter');
    const text = document.getElementById('password-strength-text');
    const bar = meter?.querySelector('.strength-bar') as HTMLElement;
    if (!meter || !text || !bar) return;

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    bar.className = 'strength-bar'; // Reset classes
    text.className = ''; // Reset classes

    if (password.length === 0) {
        text.textContent = '';
        return;
    }

    switch (score) {
        case 0:
        case 1:
            bar.classList.add('strength-weak');
            text.textContent = 'ضعیف';
            text.classList.add('text-weak');
            break;
        case 2:
        case 3:
            bar.classList.add('strength-medium');
            text.textContent = 'متوسط';
            text.classList.add('text-medium');
            break;
        case 4:
            bar.classList.add('strength-strong');
            text.textContent = 'قوی';
            text.classList.add('text-strong');
            break;
    }
}


export function initAuthListeners(handleLoginSuccess: (username: string) => void) {
    const authModal = document.getElementById('auth-modal');
    if (!authModal) return;

    const handleLoginActions = (username: string) => {
        const calculatorDataApplied = applyCalculatorData(username);
        const planAdded = addSelectedPlanToCart(username);
        if (calculatorDataApplied || planAdded) {
            sessionStorage.setItem('fitgympro_redirect_to_tab', 'store-content');
            if (planAdded) sessionStorage.setItem('fitgympro_open_cart', 'true');
            if (calculatorDataApplied) sessionStorage.setItem('fromProfileSave', 'true');
        }
        handleLoginSuccess(username);
    };

    // --- Modal Controls ---
    document.getElementById('close-auth-modal-btn')?.addEventListener('click', () => closeModal(authModal));
    authModal.addEventListener('click', e => {
        if ((e.target as HTMLElement).id === 'auth-modal') {
            closeModal(authModal);
        }
    });

    // --- Form Switching ---
    document.getElementById('switch-to-signup-btn')?.addEventListener('click', () => switchAuthForm('signup'));
    document.getElementById('switch-to-login-btn')?.addEventListener('click', () => switchAuthForm('login'));
    document.getElementById('switch-to-forgot-btn')?.addEventListener('click', () => switchAuthForm('forgot-password'));
    document.getElementById('switch-back-to-login-btn')?.addEventListener('click', () => switchAuthForm('login'));
    document.getElementById('switch-back-to-login-btn-2')?.addEventListener('click', () => switchAuthForm('login'));


    // --- Google Auth ---
    const handleGoogleAuth = () => {
        const googleUsername = 'user_google';
        const googleEmail = 'user.google@fitgympro.com';
        let allUsers = getUsers();
        let googleUser = allUsers.find((u: any) => u.username === googleUsername);

        if (!googleUser) {
            googleUser = {
                username: googleUsername,
                email: googleEmail,
                password: `gl_${Date.now()}`, // Dummy password
                role: 'user',
                status: 'active',
                coachStatus: null,
                joinDate: new Date().toISOString()
            };
            allUsers.push(googleUser);
            saveUsers(allUsers);
            saveUserData(googleUsername, {
                step1: { clientName: 'کاربر گوگل', clientEmail: googleEmail },
                joinDate: new Date().toISOString()
            });
            addActivityLog(`${googleUsername} signed up via Google.`);
        }
        
        handleLoginActions(googleUsername);
    };

    document.getElementById('google-login-btn')?.addEventListener('click', handleGoogleAuth);
    document.getElementById('google-signup-btn')?.addEventListener('click', handleGoogleAuth);

    // --- Form Submissions ---
    const loginForm = document.getElementById("login-form") as HTMLFormElement;
    loginForm?.addEventListener("submit", e => {
        e.preventDefault();
        const usernameInput = document.getElementById("login-username") as HTMLInputElement;
        const passwordInput = document.getElementById("login-password") as HTMLInputElement;
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username || !password) {
            showToast("نام کاربری و رمز عبور الزامی است.", "error");
            return;
        }

        const user = getUsers().find((u: any) => u.username === username);

        if (user && user.password === password) {
             if (user.status === 'suspended') {
                showToast("حساب کاربری شما مسدود شده است.", "error");
                return;
            }
             if (user.role === 'coach' && user.coachStatus !== 'verified') {
                 showToast("حساب مربیگری شما در انتظار تایید مدیر است.", "error");
                 return;
             }
            handleLoginActions(username);
        } else {
            showToast("نام کاربری یا رمز عبور اشتباه است.", "error");
            loginForm.closest('.card')?.classList.add('shake-animation');
            setTimeout(() => loginForm.closest('.card')?.classList.remove('shake-animation'), 500);
        }
    });

    const signupForm = document.getElementById("signup-form") as HTMLFormElement;
    const signupPasswordInput = document.getElementById("signup-password") as HTMLInputElement;
    signupPasswordInput?.addEventListener('input', () => checkPasswordStrength(signupPasswordInput.value));

    signupForm?.addEventListener("submit", e => {
        e.preventDefault();
        const usernameInput = document.getElementById("signup-username") as HTMLInputElement;
        const emailInput = document.getElementById("signup-email") as HTMLInputElement;
        const passwordInput = document.getElementById("signup-password") as HTMLInputElement;
        
        clearValidationError(usernameInput);
        clearValidationError(emailInput);
        clearValidationError(passwordInput);

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        let hasError = false;
        if (username.length < 3) {
            showValidationError(usernameInput, 'نام کاربری باید حداقل ۳ کاراکتر باشد.');
            hasError = true;
        }
        if (getUsers().some((u: any) => u.username === username)) {
            showValidationError(usernameInput, 'این نام کاربری قبلا استفاده شده است.');
            hasError = true;
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            showValidationError(emailInput, 'لطفا یک ایمیل معتبر وارد کنید.');
            hasError = true;
        }
        if (password.length < 6) {
            showValidationError(passwordInput, 'رمز عبور باید حداقل ۶ کاراکتر باشد.');
            hasError = true;
        }

        if (hasError) return;
        
        const allUsers = getUsers();
        allUsers.push({
            username: username,
            email: email,
            password: password,
            role: 'user',
            status: 'active',
            coachStatus: null,
            joinDate: new Date().toISOString()
        });
        saveUsers(allUsers);
        saveUserData(username, {
            step1: { clientName: username, clientEmail: email },
            joinDate: new Date().toISOString()
        });
        
        showToast("ثبت نام با موفقیت انجام شد! در حال ورود...", "success");
        addActivityLog(`${username} ثبت نام کرد.`);
        handleLoginActions(username);
    });

    const forgotPasswordForm = document.getElementById("forgot-password-form") as HTMLFormElement;
    forgotPasswordForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('forgot-email') as HTMLInputElement;
        const email = emailInput.value.trim();

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            showToast('لطفا یک ایمیل معتبر وارد کنید.', 'error');
            return;
        }

        const userExists = getUsers().some((u: any) => u.email === email);

        if (userExists) {
            // Simulate sending email
            switchAuthForm('forgot-confirmation');
        } else {
            showToast('کاربری با این ایمیل یافت نشد.', 'error');
        }
    });
}

export function renderAuthModal() {
    return `
    <div id="auth-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-md transform scale-95 transition-transform duration-300 relative">
             <button id="close-auth-modal-btn" class="absolute top-3 left-3 secondary-button !p-2 rounded-full z-10"><i data-lucide="x"></i></button>
            <div class="p-8 pt-12 min-h-[520px] overflow-hidden relative">
                <!-- Login Form -->
                <div id="login-form-container" class="form-container form-active">
                    <h2 class="font-bold text-2xl text-center mb-6">خوش آمدید!</h2>
                    <form id="login-form" class="space-y-4" novalidate>
                        <div class="input-group">
                            <input id="login-username" type="text" class="input-field w-full" placeholder=" " required>
                            <label for="login-username" class="input-label">نام کاربری</label>
                        </div>
                        <div class="input-group relative">
                            <input id="login-password" type="password" class="input-field w-full" placeholder=" " required>
                            <label for="login-password" class="input-label">رمز عبور</label>
                            <button type="button" class="password-toggle" data-target="login-password"><i data-lucide="eye" class="w-5 h-5"></i></button>
                        </div>
                        <div class="pt-2">
                            <button type="submit" class="primary-button w-full !py-3 !text-base">ورود</button>
                        </div>
                    </form>
                     <div class="form-divider text-xs">یا</div>
                     <button type="button" id="google-login-btn" class="google-btn">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo">
                        ورود با حساب گوگل
                    </button>
                    <div class="text-center mt-6">
                        <p class="text-sm text-secondary">
                            حساب کاربری ندارید؟
                            <button id="switch-to-signup-btn" type="button" class="font-bold text-accent hover:underline">ثبت نام کنید</button>
                        </p>
                        <p class="text-sm text-secondary mt-2">
                             <button id="switch-to-forgot-btn" type="button" class="hover:underline">فراموشی رمز عبور؟</button>
                        </p>
                    </div>
                </div>
                
                <!-- Signup Form -->
                <div id="signup-form-container" class="form-container hidden">
                    <h2 class="font-bold text-2xl text-center mb-6">ایجاد حساب کاربری</h2>
                    <form id="signup-form" class="space-y-2" novalidate>
                        <div class="input-group">
                            <input id="signup-username" type="text" class="input-field w-full" placeholder=" " required minlength="3">
                            <label for="signup-username" class="input-label">نام کاربری</label>
                            <div class="validation-message"></div>
                        </div>
                        <div class="input-group">
                            <input id="signup-email" type="email" class="input-field w-full" placeholder=" " required>
                            <label for="signup-email" class="input-label">ایمیل</label>
                            <div class="validation-message"></div>
                        </div>
                        <div class="input-group relative">
                            <input id="signup-password" type="password" class="input-field w-full" placeholder=" " required minlength="6">
                            <label for="signup-password" class="input-label">رمز عبور</label>
                            <button type="button" class="password-toggle" data-target="signup-password"><i data-lucide="eye" class="w-5 h-5"></i></button>
                            <div class="validation-message"></div>
                        </div>
                        <div id="password-strength-container">
                            <div id="password-strength-meter">
                                <div class="strength-bar"></div>
                            </div>
                            <p id="password-strength-text" class="text-right"></p>
                        </div>
                        <button type="submit" class="primary-button w-full !py-3 !text-base mt-2">ثبت نام</button>
                    </form>
                    <div class="form-divider text-xs">یا</div>
                     <button type="button" id="google-signup-btn" class="google-btn">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo">
                        ثبت نام با حساب گوگل
                    </button>
                    <p class="text-center text-sm text-secondary mt-6">
                        قبلا ثبت نام کرده‌اید؟
                        <button id="switch-to-login-btn" type="button" class="font-bold text-accent hover:underline">وارد شوید</button>
                    </p>
                </div>

                <!-- Forgot Password Form -->
                <div id="forgot-password-form-container" class="form-container hidden">
                    <h2 class="font-bold text-2xl text-center mb-6">بازیابی رمز عبور</h2>
                    <p class="text-center text-sm text-secondary mb-6">ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برایتان ارسال شود.</p>
                    <form id="forgot-password-form" class="space-y-4" novalidate>
                        <div class="input-group">
                            <input id="forgot-email" type="email" class="input-field w-full" placeholder=" " required>
                            <label for="forgot-email" class="input-label">ایمیل</label>
                        </div>
                        <button type="submit" class="primary-button w-full !py-3 !text-base">ارسال لینک بازیابی</button>
                    </form>
                    <p class="text-center text-sm text-secondary mt-6">
                        <button id="switch-back-to-login-btn" type="button" class="font-bold text-accent hover:underline">بازگشت به صفحه ورود</button>
                    </p>
                </div>
                
                <!-- Forgot Password Confirmation -->
                <div id="forgot-password-confirmation" class="form-container hidden text-center">
                    <div class="icon-container">
                        <i data-lucide="mail-check" class="w-8 h-8"></i>
                    </div>
                    <h2 class="font-bold text-xl text-center mb-2">ایمیل ارسال شد!</h2>
                    <p class="text-center text-sm text-secondary mb-6">اگر حساب کاربری با این ایمیل وجود داشته باشد، لینک بازیابی برایتان ارسال شد. لطفاً صندوق ورودی و اسپم خود را بررسی کنید.</p>
                    <button id="switch-back-to-login-btn-2" type="button" class="primary-button w-full">بازگشت به ورود</button>
                </div>
            </div>
        </div>
    </div>
    `;
}