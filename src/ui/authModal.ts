import { showToast, closeModal } from '../utils/dom';
import { getUsers, saveUsers, saveUserData, addActivityLog, getUserData } from '../services/storage';
import { performMetricCalculations } from '../utils/calculations';

const switchAuthForm = (formToShow: 'login' | 'signup' | 'forgot-password') => {
    const loginContainer = document.getElementById("login-form-container");
    const signupContainer = document.getElementById("signup-form-container");
    const forgotPasswordContainer = document.getElementById("forgot-password-form-container");
    
    loginContainer?.classList.toggle('hidden', formToShow !== 'login');
    signupContainer?.classList.toggle('hidden', formToShow !== 'signup');
    forgotPasswordContainer?.classList.toggle('hidden', formToShow !== 'forgot-password');
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

const applyCalculatorData = (username: string) => {
    const calculatorDataRaw = sessionStorage.getItem('fitgympro_calculator_data');
    if (!calculatorDataRaw) return;

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
        setTimeout(() => showToast('اطلاعات شما از محاسبه‌گر با موفقیت در پروفایل اعمال شد.', 'success'), 500);

    } catch (e) {
        console.error("Failed to apply calculator data:", e);
        sessionStorage.removeItem('fitgympro_calculator_data');
    }
}


export function initAuthListeners(handleLoginSuccess: (username: string) => void) {
    const authModal = document.getElementById('auth-modal');
    if (!authModal) return;

    // --- Modal Controls ---
    document.getElementById('close-auth-modal-btn')?.addEventListener('click', () => closeModal(authModal));
    authModal.addEventListener('click', e => {
        if ((e.target as HTMLElement).id === 'auth-modal') {
            closeModal(authModal);
        }
    });

    // --- Form Switching ---
    switchAuthForm('login');
    document.getElementById('switch-to-signup-btn')?.addEventListener('click', () => switchAuthForm('signup'));
    document.getElementById('switch-to-login-btn')?.addEventListener('click', () => switchAuthForm('login'));
    document.getElementById('switch-to-forgot-btn')?.addEventListener('click', () => switchAuthForm('forgot-password'));
    document.getElementById('switch-back-to-login-btn')?.addEventListener('click', () => switchAuthForm('login'));

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
            applyCalculatorData(username);
            handleLoginSuccess(username);
        } else {
            showToast("نام کاربری یا رمز عبور اشتباه است.", "error");
            loginForm.closest('.card')?.classList.add('shake-animation');
            setTimeout(() => loginForm.closest('.card')?.classList.remove('shake-animation'), 500);
        }
    });

    const signupForm = document.getElementById("signup-form") as HTMLFormElement;
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
        
        applyCalculatorData(username);

        showToast("ثبت نام با موفقیت انجام شد! حالا می‌توانید وارد شوید.", "success");
        addActivityLog(`${username} ثبت نام کرد.`);
        switchAuthForm("login");
        (document.getElementById("login-username") as HTMLInputElement).value = username;
    });
}

export function renderAuthModal() {
    return `
    <div id="auth-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-md transform scale-95 transition-transform duration-300 relative">
             <button id="close-auth-modal-btn" class="absolute top-3 left-3 secondary-button !p-2 rounded-full z-10"><i data-lucide="x"></i></button>
            <div class="p-8 pt-12 min-h-[420px] overflow-hidden">
                <!-- Login Form -->
                <div id="login-form-container" class="form-container">
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
                        <button type="submit" class="primary-button w-full !py-3 !text-base mt-2">ثبت نام</button>
                    </form>
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
            </div>
        </div>
    </div>
    `;
}