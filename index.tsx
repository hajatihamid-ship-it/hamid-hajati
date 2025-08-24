import { GoogleGenAI, Type as R, Chat, GenerateContentResponse } from "https://esm.run/@google/genai";

// Type declarations for window properties and external libraries
declare global {
    interface Window {
        jspdf: { jsPDF: any };
        exerciseDB: Record<string, string[]>;
        lucide: {
            createIcons: () => void;
        };
        html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
        Chart: any;
    }
}


(function() {
    const t = (document.createElement("link") as HTMLLinkElement).relList;
    if (t && t.supports && t.supports("modulepreload")) return;
    for (const a of document.querySelectorAll('link[rel="modulepreload"]')) {
        r(a as HTMLLinkElement);
    }
    new MutationObserver(a => {
        for (const n of a)
            if (n.type === "childList")
                for (const o of n.addedNodes)
                    if (o instanceof HTMLLinkElement && o.rel === "modulepreload") r(o)
    }).observe(document, {
        childList: !0,
        subtree: !0
    });

    function s(a: HTMLLinkElement) {
        const n: RequestInit = {};
        return a.integrity && (n.integrity = a.integrity), a.referrerPolicy && (n.referrerPolicy as ReferrerPolicy), a.crossOrigin === "use-credentials" ? n.credentials = "include" : a.crossOrigin === "anonymous" ? n.credentials = "omit" : n.credentials = "same-origin", n
    }

    function r(a: HTMLLinkElement) {
        if ((a as any).ep) return;
        (a as any).ep = !0;
        const n = s(a);
        fetch(a.href, n)
    }
})();
const we = {
    سینه: ["پرس سینه هالتر", "پرس سینه دمبل", "پرس بالا سینه هالتر", "پرس بالا سینه دمبل", "پرس زیر سینه دستگاه", "قفسه سینه دمبل", "کراس اور از بالا", "کراس اور از پایین", "فلای دستگاه", "شنا سوئدی", "دیپ پارالل", "پرس سینه دستگاه", "قفسه بالا سینه دمبل", "پول اور هالتر", "شنا شیب مثبت", "شنا شیب منفی", "پرس سینه سیم کش", "دیپ سینه", "قفسه سیم کش", "پرس سینه لندماین"],
    پشت: ["ددلیفت", "بارفیکس دست باز", "زیربغل هالتر خم", "تی بار رو", "لت سیم‌کش از جلو", "زیربغل سیم‌کش دست برعکس", "روئینگ دستگاه", "زیربغل دمبل تک خم", "فیله کمر", "پول اور دمبل", "بارفیکس دست جمع", "لت سیم‌کش دست موازی", "روئینگ سیم‌کش", "شراگ هالتر", "هایپر اکستنشن", "شراگ با دستگاه", "زیربغل قایقی دست باز", "لت از جلو دست جمع", "رک پول"],
    سرشانه: ["پرس سرشانه هالتر", "پرس سرشانه دمبل", "نشر از جانب دمبل", "نشر از جلو دمبل", "نشر خم دمبل (دلتا خلفی)", "فیس پول", "کول هالتر دست باز", "شراگ با دمبل", "پرس آرنولدی", "نشر از جانب سیم‌کش", "نشر از جلو صفحه", "کول هالتر دست جمع", "پرس سرشانه دستگاه", "پرس سرشانه لندماین", "نشر جانب سیم کش تک دست", "شراگ دستگاه اسمیت", "کول با دمبل"],
    "جلو بازو": ["جلو بازو هالتر", "جلو بازو دمبل", "جلو بازو لاری", "جلو بازو چکشی", "جلو بازو سیم‌کش", "جلو بازو تمرکزی", "جلو بازو هالتر ای زد (EZ)", "جلو بازو دمبل روی میز شیبدار", "جلو بازو سیم‌کش از بالا (فیگوری)", "جلو بازو عنکبوتی", "جلو بازو دراگ", "جلو بازو دمبل متناوب", "جلو بازو سیم کش تک دست", "جلو بازو با صفحه", "جلو بازو اسپایدر با هالتر"],
    "پشت بازو": ["پشت بازو سیم‌کش", "دیپ پارالل", "پشت بازو هالتر خوابیده", "پشت بازو دمبل تک خم", "پشت بازو کیک بک", "دیپ روی نیمکت", "پرس سینه دست جمع", "پشت بازو دمبل جفت از پشت سر", "پشت بازو سیم‌کش طنابی", "شنا دست جمع (الماسی)", "پشت بازو دستگاه دیپ", "پشت بازو سیم کش از بالای سر", "پشت بازو با صفحه خوابیده", "پشت بازو سیم کش تک دست برعکس", "شنا پا بالا"],
    "چهارسر ران": ["اسکوات با هالتر", "پرس پا", "جلو پا ماشین", "هاک اسکوات", "لانگز با دمبل", "اسکوات گابلت", "اسکوات اسپلیت بلغاری"],
    "همسترینگ و سرینی": ["ددلیفت رومانیایی", "پشت پا ماشین خوابیده", "هیپ تراست با هالتر", "گود مورنینگ", "پل باسن با وزنه", "ددلیفت سومو", "پشت پا ماشین ایستاده", "کیک بک با سیم‌کش", "استپ آپ با دمبل", "لانگز معکوس", "ابداکتور باسن دستگاه", "ددلیفت تک پا", "لگ کرل با توپ سوئیسی", "کتل بل سوئینگ", "هیپ اکستنشن سیم کش"],
    "ساق پا": ["ساق پا ایستاده دستگاه", "ساق پا نشسته دستگاه", "ساق پا پرسی", "ساق پا با هالتر", "ساق پا الاغی", "ساق پا ایستاده با دمبل (تک پا)", "ساق پا روی پله", "ساق پا جهشی", "ساق پا در دستگاه هاک اسکوات"],
    هوازی: ["تردمیل - پیاده‌روی سریع", "تردمیل - دویدن با شدت کم", "تردمیل - دویدن با شدت متوسط", "تردمیل - اینتروال (HIIT)", "دوچرخه ثابت - شدت کم", "دوچرخه ثابت - شدت متوسط", "دوچرخه ثابت - اینتروال (HIIT)", "الپتیکال - شدت متوسط", "الپتیکال - اینتروال", "دستگاه روئینگ - ۲۰ دقیقه", "دستگاه پله - شدت متوسط", "طناب زدن - ۱۰ دقیقه", "برپی", "جامپینگ جک (پروانه)"],
    "شکم و پهلو": ["کرانچ", "کرانچ معکوس", "پلانک", "پلانک پهلو", "زیرشکم خلبانی", "چرخش روسی با وزنه", "کرانچ سیم‌کش"],
    "وزن بدن": ["شنا سوئدی (Push-up)", "اسکوات وزن بدن", "پلانک", "برپی (Burpee)", "پروانه (Jumping Jacks)", "پل باسن (Glute Bridge)", "کوهنوردی (Mountain Climber)", "کرانچ شکم", "بارفیکس", "دیپ با صندلی", "لانگز (Lunge) وزن بدن", "بالا آوردن پا درازکش"],
    "تی‌آرایکس (TRX)": ["رو TRX (زیربغل)", "پرس سینه TRX", "اسکوات TRX", "پشت پا TRX", "جلوبازو TRX", "پشت بازو TRX", "پایک TRX (شکم)", "لانگز TRX"],
    "فیتنس و فانکشنال": ["تاب دادن کتل‌بل", "پرش روی جعبه (Box Jump)", "بتل روپ (Battle Rope)", "وال بال (Wall Ball)", "راه رفتن کشاورز (Farmer's Walk)", "اسلم بال (کوبیدن توپ)", "برخاستن ترکی (Turkish Get-up)"]
}, Pe = {
    "عضله‌ساز و ریکاوری": [{
        name: "پروتئین وی",
        dosage: "۱ اسکوپ (۲۰-۳۰ گرم)",
        timing: "بعد از تمرین",
        note: "پروتئین زودجذب برای ترمیم و ساخت سریع بافت عضلانی."
    }, {
        name: "کراتین مونوهیدرات",
        dosage: "۳-۵ گرم",
        timing: "روزانه",
        note: "افزایش قدرت، توان انفاجاری و حجم عضلات در طول زمان."
    }, {
        name: "BCAA (آمینو اسید شاخه‌دار)",
        dosage: "۵-۱۰ گرم",
        timing: "حین یا بعد از تمرین",
        note: "کاهش خستگی، درد عضلانی و جلوگیری از تجزیه عضلات."
    }, {
        name: "گلوتامین",
        dosage: "۵ گرم",
        timing: "بعد از تمرین و قبل از خواب",
        note: "حمایت از سیستم ایمنی، سلامت روده و بهبود ریکاوری."
    }, {
        name: "پروتئین کازئین",
        dosage: "۱ اسکوپ (۲۰-۳۰ گرم)",
        timing: "قبل از خواب",
        note: "پروتئین دیر هضم برای تغذیه عضلات در طول شب و جلوگیری از کاتابولیسم."
    }, {
        name: "گینر (Mass Gainer)",
        dosage: "طبق دستور محصول",
        timing: "بعد تمرین / بین وعده‌ها",
        note: "ترکیب پروتئین و کربوهیدرات برای افراد دارای کمبود وزن جهت افزایش حجم."
    }, {
        name: "HMB",
        dosage: "۳ گرم",
        timing: "روزانه",
        note: "کاهش تجزیه پروتئین عضلانی، مناسب برای دوره های کات یا تمرینات شدید."
    }],
    "افزایش‌دهنده عملکرد و انرژی": [{
        name: "کافئین",
        dosage: "۲۰۰-۴۰۰ میلی‌گرم",
        timing: "۳۰-۶۰ دقیقه قبل تمرین",
        note: "افزایش هوشیاری، تمرکز، انرژی و کاهش درک خستگی."
    }, {
        name: "بتا-آلانین",
        dosage: "۳-۶ گرم",
        timing: "روزانه",
        note: "افزایش استقامت عضلانی با بافر کردن یون هیدروژن و تاخیر در خستگی."
    }, {
        name: "سیترولین مالات",
        dosage: "۶-۸ گرم",
        timing: "۳۰-۶۰ دقیقه قبل تمرین",
        note: "بهبود جریان خون (پمپ)، اکسیژن‌رسانی به عضلات و کاهش خستگی."
    }, {
        name: "آرژنین (AAKG)",
        dosage: "۳-۶ گرم",
        timing: "قبل از تمرین",
        note: "پیش‌ساز نیتریک اکساید برای افزایش پمپ عضلانی و جریان خون."
    }, {
        name: "تورین",
        dosage: "۱-۳ گرم",
        timing: "قبل از تمرین",
        note: "حمایت از هیدراتاسیون، عملکرد سلولی و کاهش گرفتگی عضلات."
    }, {
        name: "پمپ (Pre-Workout)",
        dosage: "۱ اسکوپ",
        timing: "قبل از تمرین",
        note: "ترکیبی از مواد مختلف برای افزایش انرژی، تمرکز و پمپ عضلانی."
    }],
    "مدیریت وزن و چربی‌سوزی": [{
        name: "ال-کارنیتین",
        dosage: "۱-۳ گرم",
        timing: "قبل از تمرین هوازی",
        note: "کمک به انتقال اسیدهای چرب به میتوکندری برای تولید انرژی."
    }, {
        name: "عصاره چای سبز (EGCG)",
        dosage: "۵۰۰ میلی‌گرم",
        timing: "روزانه",
        note: "افزایش متابولیسم و اکسیداسیون چربی از طریق خواص ترموژنیک."
    }, {
        name: "CLA (اسید لینولئیک کونژوگه)",
        dosage: "۳-۴ گرم",
        timing: "با وعده‌های غذایی",
        note: "کمک به کاهش توده چربی بدن و حفظ توده عضلانی."
    }, {
        name: "یوهیمبین",
        dosage: "۵-۱۵ میلی‌گرم",
        timing: "قبل از تمرین ناشتا",
        note: "چربی‌سوز قوی برای هدف قرار دادن چربی‌های مقاوم."
    }],
    "سلامت عمومی و مفاصل": [{
        name: "مولتی ویتامین",
        dosage: "۱ عدد",
        timing: "روزانه با غذا",
        note: "تامین کمبودهای احتمالی ویتامین‌ها و مواد معدنی ضروری."
    }, {
        name: "ویتامین D3",
        dosage: "۱۰۰۰-۴۰۰۰ IU",
        timing: "روزانه با غذا",
        note: "ضروری برای سلامت استخوان، سیستم ایمنی و عملکرد هورمونالی."
    }, {
        name: "اُمگا-۳ (روغن ماهی)",
        dosage: "۱-۳ گرم (EPA+DHA)",
        timing: "روزانه با غذا",
        note: "کاهش التهاب، حمایت از سلامت قلب، مغز و مفاصل."
    }, {
        name: "گلوکوزامین و کندرویتین",
        dosage: "طبق دستور محصول",
        timing: "با وعده‌های غذایی",
        note: "حمایت از سلامت مفاصل، غضروف‌ها و کاهش دردهای مفصلی."
    }, {
        name: "ویتامین C",
        dosage: "۵۰۰-۱۰۰۰ میلی‌گرم",
        timing: "روزانه",
        note: "آنتی‌اکсидан قوی، ضروری برای سلامت بافت‌ها و سیستم ایمنی."
    }, {
        name: "زینک و منیزیم (ZMA)",
        dosage: "۲-۳ عدد قرص",
        timing: "قبل از خواب",
        note: "بهبود کیفیت خواب، ریکاوری، و حمایت از سطح هورمون‌های آنابولیک."
    }, {
        name: "آشواگاندا",
        dosage: "۳۰۰-۶۰۰ میلی‌گرم",
        timing: "روزانه",
        note: "آداپتوژن برای کاهش استرس، بهبود ریکاوری و افزایش قدرت."
    }]
};
const STORE_PLANS = [
    { planId: 'workout-1m', planName: 'برنامه تمرینی ۱ ماهه', description: 'دریافت برنامه تمرینی شخصی‌سازی شده برای یک ماه.', price: 150000, planType: 'workout', features: ['آنالیز بدن', 'برنامه تمرینی اختصاصی', 'پشتیبانی آنلاین'] },
    { planId: 'nutrition-1m', planName: 'برنامه غذایی ۱ ماهه', description: 'دریافت برنامه غذایی متناسب با اهداف شما برای یک ماه.', price: 120000, planType: 'nutrition', features: ['آنالیز بدن', 'برنامه غذایی اختصاصی', 'پشتیبانی آنلاین'] },
    { planId: 'full-1m', planName: 'پکیج کامل ۱ ماهه', description: 'برنامه تمرینی و غذایی همراه با پشتیبانی کامل برای یک ماه.', price: 250000, planType: 'full', features: ['آنالیز بدن', 'برنامه تمرینی و غذایی', 'پشتیبانی ویژه', 'چکاپ هفتگی'] },
    { planId: 'full-3m', planName: 'پکیج کامل ۳ ماهه', description: 'پکیج کامل سه‌ماهه با تخفیف ویژه برای نتایج پایدار.', price: 650000, planType: 'full', features: ['همه موارد پکیج کامل', 'تخفیف ویژه سه‌ماهه', 'اولویت در پشتیبانی'] }
];
window.exerciseDB = we;
let F = 1;
const ue = 5;
let f: string | null = null,
    X: GoogleGenAI, ve: any = null,
    currentChatSession: Chat | null = null;

const A = e => {
    if (typeof e !== 'string') return '';
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML
};

const w = (e, t = "success") => {
    const s = document.getElementById("toast-container");
    if (!s) return;
    const r = document.createElement("div"),
        a = t === "success" ? "check-circle" : "alert-triangle",
        n = t === "success" ? "bg-green-500 border-green-600" : "bg-red-500 border-red-600";
    r.className = `flex items-center gap-3 ${n} text-white py-3 px-5 rounded-lg shadow-xl border-b-4 transform opacity-0 translate-x-full`, r.style.transition = "transform 0.5s ease, opacity 0.5s ease", r.innerHTML = `
    <i data-lucide="${a}" class="w-6 h-6"></i>
    <span>${A(e)}</span>
`, s.appendChild(r), window.lucide?.createIcons(), requestAnimationFrame(() => {
        r.classList.remove("opacity-0", "translate-x-full")
    }), setTimeout(() => {
        r.classList.add("opacity-0"), r.style.transform = "translateX(120%)", r.addEventListener("transitionend", () => r.remove(), {
            once: !0
        })
    }, 2e3)
};

const ie = (e: HTMLInputElement) => {
    if (!e) return;
    const t = +e.min || 0,
        s = +e.max || 100,
        a = ((+e.value || 0) - t) / (s - t) * 100;
    let n = "var(--accent)";
    const o = getComputedStyle(document.documentElement).getPropertyValue("--range-track-bg").trim();
    e.style.background = `linear-gradient(to left, ${n} ${a}%, ${o} ${a}%)`
};
const Re = (e, t) => {
    let s = e + t;
    return s > 0 && s <= ue ? s : e
};
const _e = () => {
    document.querySelectorAll(".stepper-item").forEach((t, s) => {
        const r = s + 1;
        t.classList.toggle("active", r === F), t.classList.toggle("completed", r < F)
    });
    document.querySelectorAll(".form-section").forEach(t => t.classList.add("hidden"));
    const e = document.getElementById(`section-${F}`);
    if (e) e.classList.remove("hidden");
    if (F === 4) Ue(ye(), "#program-sheet-container");
    if (F === 5) Ue(ye(), "#program-sheet-container-step5");
    (document.getElementById("prev-btn") as HTMLButtonElement).disabled = F === 1;
    const t = document.getElementById("next-btn") as HTMLButtonElement;
    t.disabled = F === ue, t.textContent = F === ue - 1 ? "برو به تغذیه" : "بعدی";
    const s = document.getElementById("send-nutrition-btn"),
        r = document.getElementById("send-program-btn"),
        a = document.getElementById("save-changes-btn");
    if (s && r && a) {
        const n = F === 5;
        s.classList.toggle("hidden", !n), r.classList.toggle("hidden", n), a.classList.toggle("hidden", n)
    }
};
const ne = e => {
    var t;
    e > 0 && e <= ue && (F = e, _e(), (t = document.getElementById("program-builder-form")) == null || t.scrollIntoView({
        behavior: "smooth",
        block: "start"
    }))
};
const et = e => {
    var t;
    e.querySelector(".realtime-visualizers");
    const s = e.closest("#profile-tab-content") || (e.id === "section-1" ? e.closest("form")! : e);
    if (!s) return;
    const r = s.querySelector(".bmi-input") as HTMLInputElement;
    if (!r) return;
    const a = parseFloat(r.value);
    if (!isNaN(a) && a > 0) {
        let n = (a - 15) / 25 * 100;
        n = Math.max(0, Math.min(100, n));
        let o = "نرمال",
            m = "normal";
        a < 18.5 ? (o = "کمبود وزن", m = "underweight") : a >= 25 && a < 30 ? (o = "اضافه وزن", m = "overweight") : a >= 30 && (o = "چاقی", m = "obese")
    }
    let d = "";
    const c = parseFloat((e.querySelector(".weight-slider") as HTMLInputElement).value),
        g = s.querySelector(".ideal-weight-input") as HTMLInputElement;
    if (!g) {
        window.lucide?.createIcons();
        return
    }
    const x = g.value;
    if (x && x.includes(" - ")) {
        const [h, E] = x.replace(" kg", "").split(" - ").map(parseFloat);
        if (!isNaN(c) && !isNaN(h) && !isNaN(E)) {
            const q = Math.max(0, h - 15),
                k = E + 15 - q;
            let $ = (c - q) / k * 100;
            $ = Math.max(0, Math.min(100, $));
            const I = Math.max(0, (h - q) / k * 100),
                C = Math.max(0, (E - h) / k * 100);
            Math.max(0, 100 - I - C);
            let L = "ایده‌آل",
                b = "normal";
            c < h ? (L = "کمبود وزن", b = "underweight") : c > E && (L = "اضافه وزن", b = "overweight")
        }
    }
    window.lucide?.createIcons()
};
const he = e => {
    const t = e.closest("#profile-tab-content") || (e.id === "section-1" ? e.closest("form")! : e);
    if (!t) return;
    const s = parseFloat((e.querySelector(".age-slider") as HTMLInputElement).value),
        r = parseFloat((e.querySelector(".height-slider") as HTMLInputElement).value),
        a = parseFloat((e.querySelector(".weight-slider") as HTMLInputElement).value),
        n = e.querySelector('input[name^="gender"]:checked') as HTMLInputElement;
    if (!n) return;
    const o = n.value === "مرد",
        m = e.querySelector('input[name^="activity_level"]:checked') as HTMLInputElement,
        d = m ? parseFloat(m.value) : 1.2,
        c = parseFloat((e.querySelector(".neck-input") as HTMLInputElement).value),
        g = parseFloat((e.querySelector(".waist-input") as HTMLInputElement).value),
        x = parseFloat((e.querySelector(".hip-input") as HTMLInputElement).value),
        h = () => {
            [".bmi-input", ".bmr-input", ".tdee-input", ".bodyfat-input", ".lbm-input", ".ideal-weight-input"].forEach(N => {
                const G = t.querySelector(N) as HTMLInputElement;
                G && (G.value = "")
            });
            const M = e.querySelector(".realtime-visualizers");
            M && (M.innerHTML = "")
        };
    if (isNaN(r) || isNaN(a) || r <= 0 || a <= 0) {
        h();
        return
    }
    const E = r / 100,
        q = a / (E * E),
        k = t.querySelector(".bmi-input") as HTMLInputElement;
    k && (k.value = q.toFixed(1));
    const $ = o ? 10 * a + 6.25 * r - 5 * s + 5 : 10 * a + 6.25 * r - 5 * s - 161,
        I = t.querySelector(".bmr-input") as HTMLInputElement;
    I && (I.value = Math.round($).toString());
    const C = t.querySelector(".tdee-input") as HTMLInputElement;
    C && (!isNaN($) && !isNaN(d) ? C.value = Math.round($ * d).toString() : C.value = "");
    const L = t.querySelector(".ideal-weight-input") as HTMLInputElement;
    L && (L.value = `${(18.5*E*E).toFixed(1)} - ${(24.9*E*E).toFixed(1)} kg`);
    let b = 0;
    !isNaN(c) && !isNaN(g) && c > 0 && g > 0 && (o ? b = 86.01 * Math.log10(g - c) - 70.041 * Math.log10(r) + 36.76 : !isNaN(x) && x > 0 && (b = 163.205 * Math.log10(g + x - c) - 97.684 * Math.log10(r) - 78.387));
    const B = t.querySelector(".bodyfat-input") as HTMLInputElement,
        N = t.querySelector(".lbm-input") as HTMLInputElement;
    b > 0 && b < 100 ? (B && (B.value = b.toFixed(1)), N && (N.value = (a * (1 - b / 100)).toFixed(1))) : (B && (B.value = ""), N && (N.value = "")), et(e)
};
const xe = e => {
    const t = e.querySelector(".hip-input-container");
    if (!t) return;
    const s = e.querySelector('input[name^="gender"][value="مرد"]') as HTMLInputElement;
    t.classList.toggle("hidden", s?.checked ?? false), he(e)
};
const tt = e => {
    e.innerHTML = "", Object.keys(we).forEach(t => {
        const s = document.createElement("option");
        s.value = t, s.textContent = t, e.appendChild(s)
    })
};
const pe = (e, t) => {
    t.innerHTML = "", (we[e] || []).forEach(s => {
        const r = document.createElement("option");
        r.value = s, r.textContent = s, t.appendChild(r)
    })
};
const ge = e => {
    const t = (document.getElementById("exercise-template") as HTMLTemplateElement).content.cloneNode(!0) as DocumentFragment,
        s = t.querySelector(".muscle-group-select") as HTMLSelectElement;
    tt(s), pe(s.value, t.querySelector(".exercise-select") as HTMLSelectElement), e.appendChild(t), e.querySelectorAll(".range-slider").forEach(r => {
        updateSliderValueDisplay(r as HTMLInputElement);
        ie(r as HTMLInputElement);
    }), window.lucide?.createIcons()
};
const re = (e = !1) => {
    const t = document.getElementById("workout-days-container")!.children.length + 1,
        s = document.createElement("div");
    s.className = "card day-card", s.innerHTML = `<div class="flex justify-between items-center p-4 bg-tertiary rounded-t-2xl border-b border-border-secondary"><div class="flex items-center gap-3"><i data-lucide="calendar-days" class="text-yellow-400"></i><input type="text" value="روز ${t}: " class="day-title-input input-field font-bold text-lg bg-transparent border-0 p-1 focus:ring-0 focus:border-yellow-400 w-auto"></div> ${e?"":'<button type="button" class="remove-day-btn p-1 text-secondary hover:text-red-400"><i data-lucide="x-circle" class="w-5 h-5"></i></button>'}</div><div class="p-4 space-y-3"><div class="exercise-list space-y-3"></div><button type="button" class="add-exercise-btn mt-2 w-full text-sm text-yellow-400 font-semibold hover:bg-yellow-400/10 py-2.5 px-4 rounded-xl border-2 border-dashed border-yellow-400/30 transition-all flex items-center justify-center gap-2"><i data-lucide="plus"></i> افزودن حرکت</button></div><div class="p-4 border-t border-border-primary/50"><label class="font-semibold text-sm text-secondary mb-2 block">یادداشت‌های مربی</label><textarea class="day-notes-input input-field text-sm bg-tertiary/80" rows="2" placeholder="مثال: روی فرم صحیح حرکت تمرکز کنید..."></textarea></div>`, document.getElementById("workout-days-container")!.appendChild(s), ge(s.querySelector(".exercise-list") as HTMLDivElement), window.lucide?.createIcons()
};
const st = () => {
    const e = document.getElementById("supplements-container")!;
    e.innerHTML = "";
    for (const t in Pe) {
        const s = document.createElement("div");
        s.className = "supp-category-card bg-tertiary/50 rounded-2xl overflow-hidden", s.innerHTML = `<h3 class="font-bold p-4 border-b border-border-secondary text-accent">${t}</h3><div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"></div>`;
        const r = s.querySelector(".grid")!;
        Pe[t].forEach(a => {
            const n = document.createElement("div");
            n.className = "supplement-item flex items-center justify-between", n.innerHTML = `<label class="custom-checkbox-label"><input type="checkbox" value="${a.name}" data-dosage="${a.dosage}" data-timing="${a.timing}" data-note="${a.note}" class="supplement-checkbox custom-checkbox"><span>${a.name}</span></label><div class="flex items-center gap-2"><div class="tooltip"><i data-lucide="info" class="w-4 h-4 text-gray-500 cursor-pointer"></i><span class="tooltiptext">${a.note}</span></div><span class="text-xs bg-tertiary text-secondary rounded-full px-2 py-1 whitespace-nowrap">${a.timing}</span><input type="text" class="dosage-input input-field text-sm w-32" placeholder="دوز..."></div>`, r.appendChild(n)
        }), e.appendChild(s)
    }
    window.lucide?.createIcons()
};
const Ue = (e, t) => {
    const s = document.querySelector(t);
    if (!s) return;
    s.innerHTML = "";
    const r = document.createElement("div");
    r.className = "program-page";
    const a = e.step1 || {},
        n = A(a.clientName || "نامشخص"),
        o = A(a.coachName || "مربی شما"),
        m = a.profilePic || "https://placehold.co/100x100/374151/E5E7EB?text=عکس";
    const d = `<header class="page-header flex justify-between items-start mb-6"><div class="flex items-center gap-3"><span class="font-bold text-2xl" style="color: var(--accent);">FitGym Pro</span></div><img src="${m}" alt="Profile" class="w-20 h-20 rounded-full object-cover border-4 border-gray-100"></header><div class="mb-6"><h2 class="text-3xl font-extrabold text-gray-900 mb-2">${n}</h2><p class="text-gray-500">تهیه شده در تاریخ: ${new Date().toLocaleDateString("fa-IR")}</p></div>`;
    r.innerHTML = `${d}<div class="page-content"></div><footer class="page-footer"><p>این برنامه توسط <strong>${o}</strong> برای شما آماده شده است. موفق باشید!</p></footer>`, s.appendChild(r);
    const c = r.querySelector(".page-content")!,
        g = B => {
            const N = document.createElement("div");
            N.innerHTML = B;
            const G = N.firstElementChild;
            G && c.appendChild(G)
        },
        x = {
            سن: a.age || "-",
            قد: `${a.height||"-"} cm`,
            وزن: `${a.weight||"-"} kg`,
            BMI: a.bmi || "-",
            "چربی بدن": `${a.bodyFat||"-"} %`,
            BMR: `${a.bmr||"-"} kcal`,
            TDEE: `${a.tdee||"-"} kcal`,
            "توده بدون چربی": `${a.lbm||"-"} kg`
        };
    let h = Object.entries(x).map(([B, N]) => `<div><span>${B}</span><strong>${N}</strong></div>`).join("");
    g(`<div class="mb-6"><h3 class="preview-section-header"><i data-lucide="clipboard-list"></i>شاخص‌های کلیدی</h3><div class="preview-vitals-grid">${h}</div></div>`);
    const E = (e.step2 || {}).days || [],
        q = E.filter(B => B.exercises && B.exercises.length > 0);
    q.length > 0 && (g('<div class="day-separator"></div>'), g('<div class="mb-4 mt-4"><h3 class="preview-section-header"><i data-lucide="dumbbell"></i>برنامه تمرینی</h3></div>'), q.forEach((B, N) => {
        const G = A(B.title);
        let M = '<div class="overflow-x-auto rounded-lg border border-border-primary"><table class="preview-table-pro w-full"><thead><tr><th>حرکت (Exercise)</th><th>ست (Sets)</th><th>تکرار (Reps)</th><th>استراحت (Rest)</th></tr></thead><tbody>';
        const K = B.exercises || [];
        for (let j = 0; j < K.length; j++) {
            const _ = K[j],
                ee = _.isSuperset;
            M += `<tr class="${ee?"superset-group-pro":""}"><td>${A(_.exercise)}</td><td>${A(_.sets)}</td><td>${A(_.reps)}</td><td>${A(_.rest)}s</td></tr>`
        }
        M += "</tbody></table></div>";
        const le = A(B.notes),
            Ee = `<div><h4 class="font-bold text-lg text-gray-800 mb-2">${G}</h4>${M}${le?`<div class="preview-notes-pro mt-3"><strong>یادداشت:</strong> ${le}</div>`:""}</div>`;
        g(Ee), N < q.length - 1 && g('<div class="day-separator"></div>')
    }));
    const k = (e.step3 || {}).supplements || [];
    if (k.length > 0) {
        let B = '<div class="mt-6"><h3 class="preview-section-header"><i data-lucide="pill"></i>برنامه مکمل‌ها</h3><div class="overflow-x-auto rounded-lg border border-border-primary"><table class="preview-table-pro mx-auto" style="min-width: 600px;"><thead><tr><th>مکمل / ویتامین</th><th style="width: 150px;">زمان مصرف</th><th style="width: 200px;">دستور مصرف</th></tr></thead><tbody>';
        k.forEach(N => {
            const G = A(N.dosage || "طبق دستور"),
                M = A(N.name),
                le = A(N.timing || "-");
            B += `<tr><td>${M}</td><td style="text-align: center;">${le}</td><td style="text-align: center;">${G}</td></tr>`
        }), B += "</tbody></table></div></div>", g(B)
    }
    const $ = (e.step5 || {}).nutritionPlanHTML;
    $ && $.trim() !== "" && g(`<div class="day-separator"></div><div class="mt-6"><h3 class="preview-section-header"><i data-lucide="utensils-crossed"></i>راهنمای تغذیه</h3><div class="preview-notes-pro">${$}</div></div>`);
    const I = (e.step4 || {}).generalNotes;
    I && g(`<div class="mt-6"><h3 class="preview-section-header"><i data-lucide="clipboard-edit"></i>توصیه‌های کلی مربی</h3><div class="preview-notes-pro">${A(I).replace(/\n/g,"<br>")}</div></div>`), window.lucide?.createIcons()
};
const Fe = async () => {
    var n;
    if (document.querySelector(".is-loading")) return;
    const t = ((n = document.getElementById("save-pdf-btn")) == null ? void 0 : n.offsetParent) !== null ? document.getElementById("save-pdf-btn") as HTMLButtonElement : document.getElementById("dashboard-save-pdf-btn") as HTMLButtonElement;

    t.classList.add("is-loading"), t.disabled = !0;

    if (!window.jspdf || !window.html2canvas) {
        w("کتابخانه‌های مورد نیاز برای ساخت PDF بارگیری نشده‌اند.", "error");
        t.classList.remove("is-loading");
        t.disabled = false;
        return;
    }
    const { jsPDF: Qe } = window.jspdf;

    let s;
    if (f !== null && O().find(u => u.username === f)?.role === 'coach') {
        const previewContainerSelector = "#program-sheet-container";
        // In admin panel, always render fresh data to a consistent preview container.
        Ue(ye(), previewContainerSelector);
        s = `${previewContainerSelector} .program-page`;
    } else {
        // In user dashboard, the view is already rendered and correct.
        s = "#dashboard-program-view .program-page";
    }

    const r = document.querySelector(s) as HTMLElement;
        
    if (!r) {
        w("محتوایی برای ساخت PDF وجود ندارد.", "error");
        t.classList.remove("is-loading");
        t.disabled = !1;
        return;
    }

    const a = r.cloneNode(!0) as HTMLElement;
    a.style.position = "absolute", a.style.top = "0", a.style.left = "-9999px";
    // Use a fixed width to avoid issues with hidden elements' offsetWidth being 0.
    a.style.width = "800px"; 
    a.style.height = "auto", document.body.appendChild(a);
    await new Promise(o => setTimeout(o, 50));

    try {
        const o = await window.html2canvas(a, {
            scale: 2,
            useCORS: !0,
            logging: !1,
            backgroundColor: "#ffffff"
        });
        document.body.removeChild(a);
        const m = o.toDataURL("image/png"),
            d = new Qe("p", "mm", "a4"),
            c = d.internal.pageSize.getWidth(),
            g = d.internal.pageSize.getHeight(),
            x = o.height * c / o.width;
        let h = x, E = 0;
        d.addImage(m, "PNG", 0, E, c, x);
        h -= g;
        while (h > 0) {
            E -= g;
            d.addPage();
            d.addImage(m, "PNG", 0, E, c, x);
            h -= g;
        }
        
        const clientNameElement = document.querySelector(f !== null && O().find(u => u.username === f)?.role === 'coach' ? "#client-name-input" : "#dashboard-profile-panel .client-name-input") as HTMLInputElement;

        if (!clientNameElement) {
            w("خطا: فیلد نام کاربر یافت نشد.", "error");
            t.classList.remove("is-loading");
            t.disabled = false;
            return;
        }
        const q = clientNameElement.value || "FitGymPro";
        d.save(`FitGymPro-Program-${q.replace(/ /g,"_")}.pdf`)
    } catch (o) {
        console.error("Failed to generate PDF:", o), w("خطا در هنگام ساخت فایل PDF رخ داد.", "error"), document.body.contains(a) && document.body.removeChild(a)
    } finally {
        t.classList.remove("is-loading"), t.disabled = !1
    }
},
saveAsImage = async () => {
    var n;
    const t = ((n = document.getElementById("save-image-btn")) == null ? void 0 : n.offsetParent) !== null 
        ? document.getElementById("save-image-btn") as HTMLButtonElement 
        : document.getElementById("dashboard-save-image-btn") as HTMLButtonElement;

    if (!t || t.classList.contains("is-loading")) return;

    t.classList.add("is-loading", "secondary-button");
    t.disabled = true;

    if (!window.html2canvas) {
        w("کتابخانه مورد نیاز برای ساخت تصویر بارگیری نشده‌ است.", "error");
        t.classList.remove("is-loading", "secondary-button");
        t.disabled = false;
        return;
    }

    let s;
     if (f !== null && O().find(u => u.username === f)?.role === 'coach') {
        const previewContainerSelector = "#program-sheet-container";
        Ue(ye(), previewContainerSelector); // Ensure latest data is rendered
        s = `${previewContainerSelector} .program-page`;
    } else {
        s = "#dashboard-program-view .program-page";
    }

    const r = document.querySelector(s) as HTMLElement;
    if (!r) {
        w("محتوایی برای ساخت تصویر وجود ندارد.", "error");
        t.classList.remove("is-loading", "secondary-button");
        t.disabled = false;
        return;
    }
    
    const a = r.cloneNode(true) as HTMLElement;
    a.style.position = "absolute";
    a.style.top = "0";
    a.style.left = "-9999px";
    a.style.width = "800px";
    a.style.height = "auto";
    document.body.appendChild(a);
    
    await new Promise(o => setTimeout(o, 50)); // Allow render

    try {
        const o = await window.html2canvas(a, {
            scale: 2.5, // Higher scale for better quality
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff"
        });
        document.body.removeChild(a);

        const m = document.createElement("a");
        m.href = o.toDataURL("image/png");

        const clientNameElement = document.querySelector(f !== null && O().find(u => u.username === f)?.role === 'coach' ? "#client-name-input" : "#dashboard-profile-panel .client-name-input") as HTMLInputElement;
        const q = clientNameElement?.value || "FitGymPro";
        m.download = `FitGymPro-Program-${q.replace(/ /g, "_")}.png`;
        
        document.body.appendChild(m);
        m.click();
        document.body.removeChild(m);
        
        w("تصویر با موفقیت ذخیره شد!", "success");

    } catch (o) {
        console.error("Failed to generate image:", o);
        w("خطا در هنگام ساخت فایل تصویر رخ داد.", "error");
        if (document.body.contains(a)) {
            document.body.removeChild(a);
        }
    } finally {
        t.classList.remove("is-loading", "secondary-button");
        t.disabled = false;
    }
},
rt = () => {
    const e = document.getElementById("client-name-input") as HTMLInputElement,
        t = e.value.trim();
    if (!t) {
        w("لطفاً نام شاگرد را در گام اول مشخص کنید.", "error"), ne(1), e.focus(), e.classList.add("input-error"), setTimeout(() => e.classList.remove("input-error"), 3e3);
        return
    }
    if (!O().some(o => o.username === t)) {
        w(`کاربری با نام «${t}» وجود ندارد.`, "error");
        return
    }
    const s = D(t);
    if (s.subscriptions && s.subscriptions.length > 0) {
        const o = [...s.subscriptions].sort((m, d) => new Date(d.purchaseDate).getTime() - new Date(m.purchaseDate).getTime()),
            m = o.find(d => !d.fulfilled && d.planType === "workout");
        m && (m.fulfilled = !0)
    }
    const a = ye(),
        n = {
            ...s,
            ...a,
            lastUpdatedByAdmin: new Date().toISOString(),
            newProgram: !0
        };
    W(t, n), ae(`برنامه برای ${t} ارسال شد`), w(`برنامه با موفقیت برای کاربر «${t}» ارسال شد.`)
},
    at = () => {
        const e = document.getElementById("client-name-input") as HTMLInputElement,
            t = e.value.trim();
        if (!t) {
            w("لطفاً نام شاگرد را برای ذخیره کردن مشخص کنید.", "error"), ne(1), e.focus(), e.classList.add("input-error"), setTimeout(() => e.classList.remove("input-error"), 3e3);
            return
        }
        const s = D(t),
            r = ye(),
            a = {
                ...s,
                ...r,
                lastUpdatedByAdmin: new Date().toISOString()
            };
        W(t, a), ae(`تغییرات برنامه ${t} ذخیره شد`), w(`تغییرات با موفقیت برای «${t}» ذخیره شد.`)
    },
    dt = () => {
        const e = document.getElementById("client-name-input") as HTMLInputElement,
            t = e.value.trim();
        if (!t) {
            w("لطفاً نام شاگرد را در گام اول مشخص کنید.", "error"), ne(1), e.focus(), e.classList.add("input-error"), setTimeout(() => e.classList.remove("input-error"), 3e3);
            return
        }
        if (!O().some(o => o.username === t)) {
            w(`کاربری با نام «${t}» وجود ندارد.`, "error");
            return
        }
        const s = D(t),
            r = (document.getElementById("ai-nutrition-result") as HTMLElement).innerHTML;
        if (!r || !r.trim().length || r.includes("در حال تولید برنامه غذایی")) {
            w("برنامه غذایی معتبری برای ارسال وجود ندارد.", "error");
            return
        }
        if (s.subscriptions && s.subscriptions.length > 0) {
            const o = [...s.subscriptions].sort((m, d) => new Date(d.purchaseDate).getTime() - new Date(m.purchaseDate).getTime()),
                m = o.find(d => !d.fulfilled && d.planType === "nutrition");
            m && (m.fulfilled = !0)
        }
        s.step5 = s.step5 || {}, s.step5.nutritionPlanHTML = r, s.lastUpdatedByAdmin = new Date().toISOString(), s.newProgram = !0, W(t, s), ae(`برنامه غذایی برای ${t} ارسال شد`), w(`برنامه غذایی با موفقیت برای کاربر «${t}» ارسال شد.`)
    },
    O = () => {
        try {
            return JSON.parse(localStorage.getItem("fitgympro_users") || "[]");
        } catch (e) {
            console.error("Error parsing users from localStorage:", e);
            return [];
        }
    },
    Ge = e => {
        try {
            localStorage.setItem("fitgympro_users", JSON.stringify(e));
        } catch (t) {
            console.error("Error saving users to localStorage:", t);
            w("خطا در ذخیره‌سازی اطلاعات کاربران", "error");
        }
    },
    D = e => {
        try {
            return JSON.parse(localStorage.getItem(`fitgympro_data_${e}`) || "{}");
        } catch (t) {
            console.error(`Error parsing data for user ${e}:`, t);
            return {};
        }
    },
    W = (e, t) => {
        try {
            localStorage.setItem(`fitgympro_data_${e}`, JSON.stringify(t));
        } catch (s) {
            console.error(`Error saving data for user ${e} to localStorage:`, s);
            w("خطا در ذخیره‌سازی اطلاعات برنامه", "error");
        }
    },
    ze = () => {
        try {
            return JSON.parse(localStorage.getItem("fitgympro_activity_log") || "[]");
        } catch (e) {
            console.error("Error parsing activity log from localStorage:", e);
            return [];
        }
    },
    ae = e => {
        try {
            let t = ze();
            t.unshift({
                message: e,
                date: new Date().toISOString()
            });
            t.length > 50 && (t = t.slice(0, 50));
            localStorage.setItem("fitgympro_activity_log", JSON.stringify(t));
        } catch (t) {
            console.error("Error saving activity log to localStorage:", t);
        }
    };
const ht = () => {
        try {
            return JSON.parse(localStorage.getItem("fitgympro_templates") || "{}");
        } catch (e) {
            console.error("Error parsing templates from localStorage:", e);
            return {};
        }
    },
    xt = e => {
        try {
            localStorage.setItem("fitgympro_templates", JSON.stringify(e));
        } catch (t) {
            console.error("Error saving templates to localStorage:", t);
            w("خطا در ذخیره‌سازی الگوها", "error");
        }
    },
    yt = (e, t) => {
        const s = ht();
        s[e] = t, xt(s)
    },
    pt = e => {
        const t = ht();
        delete t[e], xt(t)
    };

function ye() {
    var s, r, a, n;
    const e: any = {
        step1: {},
        step2: {
            days: []
        },
        step3: {
            supplements: []
        },
        step4: {},
        step5: {}
    };
    const form = document.getElementById("program-builder-form")!;
    const t = form.querySelector("#section-1")!;
    e.step1.clientName = (t.querySelector(".client-name-input") as HTMLInputElement).value;
    e.step1.clientEmail = (t.querySelector(".client-email-input") as HTMLInputElement).value;
    e.step1.coachName = (t.querySelector(".coach-name-input") as HTMLInputElement).value;
    e.step1.profilePic = (t.querySelector(".profile-pic-preview") as HTMLImageElement).src;
    e.step1.trainingGoal = (s = t.querySelector(".training-goal:checked") as HTMLInputElement) == null ? void 0 : s.value;
    e.step1.age = (t.querySelector(".age-slider") as HTMLInputElement).value;
    e.step1.height = (t.querySelector(".height-slider") as HTMLInputElement).value;
    e.step1.weight = (t.querySelector(".weight-slider") as HTMLInputElement).value;
    e.step1.neck = (t.querySelector(".neck-input") as HTMLInputElement).value;
    e.step1.waist = (t.querySelector(".waist-input") as HTMLInputElement).value;
    e.step1.hip = (t.querySelector(".hip-input") as HTMLInputElement).value;
    e.step1.gender = (r = t.querySelector(".gender:checked") as HTMLInputElement) == null ? void 0 : r.value;
    e.step1.activityLevel = (a = t.querySelector(".activity-level:checked") as HTMLInputElement) == null ? void 0 : a.value;
    e.step1.trainingDays = (n = t.querySelector(".training-days:checked") as HTMLInputElement) == null ? void 0 : n.value;
    e.step1.bmi = (form.querySelector(".bmi-input") as HTMLInputElement).value;
    e.step1.bmr = (form.querySelector(".bmr-input") as HTMLInputElement).value;
    e.step1.tdee = (form.querySelector(".tdee-input") as HTMLInputElement).value;
    e.step1.bodyFat = (form.querySelector(".bodyfat-input") as HTMLInputElement).value;
    e.step1.lbm = (form.querySelector(".lbm-input") as HTMLInputElement).value;
    e.step1.idealWeight = (form.querySelector(".ideal-weight-input") as HTMLInputElement).value;
    document.querySelectorAll("#workout-days-container .day-card").forEach(o => {
        const m: any = {
            title: (o.querySelector(".day-title-input") as HTMLInputElement).value,
            notes: (o.querySelector(".day-notes-input") as HTMLTextAreaElement).value,
            exercises: []
        };
        o.querySelectorAll(".exercise-row").forEach(d => {
            m.exercises.push({
                muscle: (d.querySelector(".muscle-group-select") as HTMLSelectElement).value,
                exercise: (d.querySelector(".exercise-select") as HTMLSelectElement).value,
                sets: (d.querySelector(".set-slider") as HTMLInputElement).value,
                reps: (d.querySelector(".rep-slider") as HTMLInputElement).value,
                rest: (d.querySelector(".rest-slider") as HTMLInputElement).value,
                isSuperset: d.classList.contains("is-superset")
            })
        }), e.step2.days.push(m)
    });
    document.querySelectorAll(".supplement-checkbox:checked").forEach(o => {
        var m;
        e.step3.supplements.push({
            name: (o as HTMLInputElement).value,
            dosage: ((m = (o as HTMLInputElement).closest(".supplement-item")) == null ? void 0 : (m.querySelector(".dosage-input") as HTMLInputElement))?.value,
            timing: (o as HTMLInputElement).dataset.timing
        })
    });
    e.step4.generalNotes = (document.getElementById("general-notes-input") as HTMLTextAreaElement).value;
    e.step5.nutritionPlanHTML = (document.getElementById("ai-nutrition-result") as HTMLElement).innerHTML;
    return e
}
const updateRadioCardSelection = (e) => {
    ["training_goal", "activity_level", "training_days", "gender", "gender_user", "training_goal_user", "activity_level_user", "training_days_user"].forEach(t => {
        e.querySelectorAll(`input[name="${t}"]`).forEach(s => {
            const r = s.closest(".card");
            r && r.classList.toggle("selected-card", (s as HTMLInputElement).checked)
        })
    })
};

const updateSliderValueDisplay = (slider: HTMLInputElement) => {
    const span = slider.previousElementSibling?.querySelector("span");
    if (!span) return;

    span.textContent = slider.value;
    ie(slider); // Update slider track background
};

function Je(e) {
    (document.getElementById("program-builder-form") as HTMLFormElement).reset(), document.getElementById("workout-days-container")!.innerHTML = "";
    const t = document.getElementById("section-1")!,
        s = e.step1 || {};
    (t.querySelector(".client-name-input") as HTMLInputElement).value = s.clientName || "", (t.querySelector(".client-email-input") as HTMLInputElement).value = s.clientEmail || "", (t.querySelector(".coach-name-input") as HTMLInputElement).value = s.coachName || "", (t.querySelector(".profile-pic-preview") as HTMLImageElement).src = s.profilePic || "https://placehold.co/100x100/374151/E5E7EB?text=عکس";
    if (s.trainingGoal) {
        const n = t.querySelector(`.training-goal[value="${s.trainingGoal}"]`) as HTMLInputElement;
        n && (n.checked = !0)
    }(t.querySelector(".age-slider") as HTMLInputElement).value = s.age || "25", (t.querySelector(".height-slider") as HTMLInputElement).value = s.height || "180", (t.querySelector(".weight-slider") as HTMLInputElement).value = s.weight || "80", (t.querySelector(".neck-input") as HTMLInputElement).value = s.neck || "", (t.querySelector(".waist-input") as HTMLInputElement).value = s.waist || "", (t.querySelector(".hip-input") as HTMLInputElement).value = s.hip || "";
    if (s.gender) {
        const n = t.querySelector(`.gender[value="${s.gender}"]`) as HTMLInputElement;
        n && (n.checked = !0)
    }
    if (s.activityLevel) {
        const n = t.querySelector(`.activity-level[value="${s.activityLevel}"]`) as HTMLInputElement;
        n && (n.checked = !0)
    }
    if (s.trainingDays) {
        const n = t.querySelector(`.training-days[value="${s.trainingDays}"]`) as HTMLInputElement;
        n && (n.checked = !0)
    }
    updateRadioCardSelection(t);
    const r = e.step2 || {
        days: []
    };
    r.days && r.days.length > 0 ? r.days.forEach((n, o) => {
        re(o === 0);
        const m = document.querySelector(`#workout-days-container .day-card:nth-child(${o+1})`)!;
        (m.querySelector(".day-title-input") as HTMLInputElement).value = n.title, (m.querySelector(".day-notes-input") as HTMLTextAreaElement).value = n.notes;
        const d = m.querySelector(".exercise-list")!;
        d.innerHTML = "", n.exercises.forEach(c => {
            var E;
            ge(d as HTMLDivElement);
            const g = d.lastElementChild!,
                x = g.querySelector(".muscle-group-select") as HTMLSelectElement,
                h = g.querySelector(".exercise-select") as HTMLSelectElement;
            x.value = c.muscle, pe(c.muscle, h), h.value = c.exercise, (g.querySelector(".set-slider") as HTMLInputElement).value = c.sets, (g.querySelector(".rep-slider") as HTMLInputElement).value = c.reps, (g.querySelector(".rest-slider") as HTMLInputElement).value = c.rest, c.isSuperset && (g.classList.add("is-superset"), (E = g.querySelector(".superset-btn")) == null || E.classList.add("active"))
        })
    }) : re(!0);
    const a = e.step3 || {
        supplements: []
    };
    document.querySelectorAll(".supplement-checkbox").forEach(n => (n as HTMLInputElement).checked = !1), a.supplements && a.supplements.forEach(n => {
        var m;
        const o = document.querySelector(`.supplement-checkbox[value="${n.name}"]`) as HTMLInputElement;
        if (o) {
            o.checked = true;
            const dosageInput = (m = o.closest(".supplement-item")) == null ? void 0 : (m.querySelector(".dosage-input") as HTMLInputElement);
            if (dosageInput) dosageInput.value = n.dosage;
        }
    }), (document.getElementById("general-notes-input") as HTMLTextAreaElement).value = (e.step4 || {}).generalNotes || "";
    const o = document.getElementById("ai-nutrition-result")!;
    e.step5 && e.step5.nutritionPlanHTML ? (o.innerHTML = e.step5.nutritionPlanHTML, o.classList.remove("hidden")) : (o.innerHTML = "", o.classList.add("hidden")), document.querySelectorAll("#program-builder-form .range-slider").forEach(n => {
        ie(n as HTMLInputElement);
        const m = new Event("input", {
            bubbles: !0
        });
        n.dispatchEvent(m)
    }), xe(t), he(t), F = 1, _e()
}

const getLatestPurchase = userData => {
    if (!userData.subscriptions || userData.subscriptions.length === 0) return null;
    const t = [...userData.subscriptions].sort((s, r) => new Date(r.purchaseDate).getTime() - new Date(s.purchaseDate).getTime()),
        s = t.find(r => r.fulfilled === !1);
    return s || t[0]
};
const ot = (e = []) => {
    if (!e || e.length === 0) return 0;
    const t = e.map(o => o.date),
        s = 864e5,
        r = [...new Set(t.map(o => new Date(o).setHours(0, 0, 0, 0)))].sort((o, m) => m - o);
    if (r.length === 0 || new Date().setHours(0, 0, 0, 0) - r[0] > s) return 0;
    let n = 1;
    for (let o = 0; o < r.length - 1 && (r[o] - r[o + 1]) / s === 1; o++) n++;
    return n
}, it = e => {
    if (!e.step2 || !e.step2.days || e.step2.days.length === 0) return null;
    const t = new Date().getDay(),
        s = e.step2.days.length,
        r = {
            1: [3],
            2: [2, 5],
            3: [1, 3, 5],
            4: [1, 2, 4, 5],
            5: [1, 2, 3, 4, 5],
            6: [1, 2, 3, 4, 5, 6],
            7: [0, 1, 2, 3, 4, 5, 6]
        },
        n = (r[s] || r[4]).indexOf(t);
    return n !== -1 && e.step2.days[n] ? {
        day: e.step2.days[n],
        dayIndex: n
    } : null
}, Xe = (e = [], t = "weight-progress-chart", s = "no-chart-data") => {
    var a;
    if (!window.Chart) return;
    const r = (a = document.getElementById(t) as HTMLCanvasElement) == null ? void 0 : a.getContext("2d");
    if (!r) return;
    const n = document.getElementById(s),
        o = document.getElementById(t);
    if (!o) return;
    n && (!e || e.length < 2) ? (n.classList.remove("hidden"), o.classList.add("hidden")) : (n && n.classList.add("hidden"), o.classList.remove("hidden"), (() => {
        if (ve) ve.destroy();
        const c = [...e].sort((E, q) => new Date(E.date).getTime() - new Date(q.date).getTime()),
            g = c.map(E => new Date(E.date).toLocaleDateString("fa-IR", {
                month: "short",
                day: "numeric"
            })),
            x = c.map(E => E.weight),
            h = document.documentElement.getAttribute("data-theme") === "dark",
            I = h ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
            C = h ? "#e2e8f0" : "#111827",
            L = new window.Chart(r, {
                type: "line",
                data: {
                    labels: g,
                    datasets: [{
                        label: "وزن (kg)",
                        data: x,
                        borderColor: "var(--yellow-accent)",
                        backgroundColor: "color-mix(in srgb, var(--yellow-accent) 20%, transparent)",
                        fill: !0,
                        tension: .3,
                        pointBackgroundColor: "var(--yellow-accent)",
                        pointBorderColor: "#fff",
                        pointHoverRadius: 7,
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: !0,
                    maintainAspectRatio: !1,
                    plugins: {
                        legend: {
                            display: !1
                        },
                        tooltip: {
                            enabled: !0
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: !1,
                            display: !0,
                            grid: {
                                color: I
                            },
                            ticks: {
                                color: C
                            }
                        },
                        x: {
                            display: !0,
                            grid: {
                                display: !1
                            },
                            ticks: {
                                color: C
                            }
                        }
                    }
                }
            });
        ve = L
    })())
};

const renderDashboardTab = (username, userData) => {
    var g;
    const s = document.getElementById("dashboard-stats-grid")!,
        r = document.getElementById("today-focus-card")!,
        a = ot(userData.workoutHistory),
        n = ((g = userData.workoutHistory) == null ? void 0 : g.length) || 0,
        o = userData.joinDate ? new Date(userData.joinDate).toLocaleDateString("fa-IR") : "نامشخص";
    
    s.className = "grid grid-cols-2 md:grid-cols-4 gap-6";
    s.innerHTML = `
        <div class="card p-5 flex items-center gap-4">
            <div class="bg-orange-500/20 p-3 rounded-xl"><i data-lucide="flame" class="w-6 h-6 text-orange-400"></i></div>
            <div><p class="text-sm font-semibold text-secondary">روند تمرینی</p><p class="text-3xl font-bold">${a} <span class="text-base font-medium">روز</span></p></div>
        </div>
        <div class="card p-5 flex items-center gap-4">
            <div class="bg-green-500/20 p-3 rounded-xl"><i data-lucide="swords" class="w-6 h-6 text-green-400"></i></div>
            <div><p class="text-sm font-semibold text-secondary">کل تمرینات</p><p class="text-3xl font-bold">${n}</p></div>
        </div>
        <div class="card p-5 flex items-center gap-4">
            <div class="bg-indigo-500/20 p-3 rounded-xl"><i data-lucide="calendar-plus" class="w-6 h-6 text-indigo-400"></i></div>
            <div><p class="text-sm font-semibold text-secondary">عضویت از</p><p class="text-xl font-bold pt-2">${o}</p></div>
        </div>
    `;

    const latestPurchase = getLatestPurchase(userData);
    const subCard = document.createElement("div");
    if (latestPurchase) {
        if (latestPurchase.fulfilled === !1) subCard.className = "card p-5 flex items-center gap-4", subCard.innerHTML = `
                <div class="bg-blue-500/20 p-3 rounded-xl"><i data-lucide="loader" class="w-6 h-6 text-blue-400 animate-spin"></i></div>
                <div>
                    <p class="text-sm font-semibold text-secondary">وضعیت پلن</p>
                    <p class="text-xl font-bold pt-2">در انتظار آماده‌سازی</p>
                </div>
            `;
        else subCard.className = "card p-5 flex items-center gap-4", subCard.innerHTML = `
                <div class="bg-teal-500/20 p-3 rounded-xl"><i data-lucide="star" class="w-6 h-6 text-teal-400"></i></div>
                <div>
                    <p class="text-sm font-semibold text-secondary">آخرین پلن فعال</p>
                    <p class="text-xl font-bold pt-2">${A(latestPurchase.planName)}</p>
                </div>
            `
    } else subCard.className = "card p-5 flex items-center gap-4", subCard.innerHTML = `
            <div class="bg-gray-500/20 p-3 rounded-xl"><i data-lucide="shopping-cart" class="w-6 h-6 text-gray-400"></i></div>
            <div>
                <p class="text-sm font-semibold text-secondary">وضعیت پلن</p>
                <p class="text-xl font-bold pt-2">بدون پلن فعال</p>
            </div>
        `;
    s.appendChild(subCard);


    const m = document.getElementById("coach-message-card")!,
        d = document.getElementById("coach-message-content")!;
    const lastCoachMessage = (userData.chatHistory || []).filter(msg => msg.sender === 'coach').pop();
    if (lastCoachMessage) {
        d.innerHTML = `<p class="border-r-2 border-yellow-accent pr-2">${A(lastCoachMessage.message)}</p><button id="view-full-chat-btn" class="text-sm text-yellow-accent font-semibold mt-2 hover:underline">مشاهده کامل گفتگو</button>`;
        m.classList.remove("hidden");
        document.getElementById("view-full-chat-btn")?.addEventListener('click', () => switchUserDashboardTab('chat'));
    } else {
        m.classList.add("hidden");
    }
    const c = it(userData);
    let x = `<div class="flex justify-between items-center mb-4"><h3 class="font-bold text-lg flex items-center gap-2 text-accent"><i data-lucide="target"></i>تمرکز امروز</h3><span class="text-sm font-semibold text-secondary">${new Date().toLocaleDateString("fa-IR",{weekday:"long",day:"numeric",month:"long"})}</span></div>`;
    if (c) {
        const h = new Date().toISOString().split("T")[0],
            E = (userData.workoutHistory || []).some(q => q.date.startsWith(h));
        x += `
            <div class="bg-tertiary/50 rounded-2xl p-4">
                <h4 class="font-bold text-xl mb-3">${A(c.day.title)}</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
                    ${c.day.exercises.slice(0,4).map(q=>`<div class="bg-secondary/50 p-2 rounded-lg text-xs font-semibold">${A(q.exercise)}</div>`).join("")}
                    ${c.day.exercises.length>4?`<div class="bg-secondary/50 p-2 rounded-lg text-xs font-semibold">+ ${c.day.exercises.length-4} حرکت دیگر</div>`:""}
                </div>
                 <button id="start-workout-btn" class="primary-button w-full font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 ${E?"bg-green-500 hover:bg-green-600":""}">
                    <i data-lucide="${E?"check-check":"clipboard-list"}"></i>
                    <span>${E?"تمرین امروز ثبت شد":"شروع و ثبت جزئیات تمرین"}</span>
                </button>
            </div>
            <p class="text-xs text-secondary text-center italic mt-4">نکته روز: "قدرت از چیزی که فکر می‌کنی می‌توانی انجام دهی، یک قدم فراتر است."</p>
        `
    } else x += '<div class="text-center bg-tertiary/50 rounded-2xl p-8"><i data-lucide="coffee" class="w-10 h-10 mx-auto text-green-400 mb-3"></i><h4 class="font-bold">امروز روز استراحت است!</h4><p class="text-sm text-secondary mt-1">از ریکاوری لذت ببر و برای جلسه بعدی آماده شو.</p></div>';
    r.innerHTML = x;
    Xe(userData.weightHistory, 'weight-progress-chart', 'no-chart-data');
    
    const historyContainer = document.getElementById('workout-history-container');
    if (historyContainer) {
        const history = (userData.workoutHistory || []).slice().reverse();
        if (history.length > 0) {
            historyContainer.innerHTML = history.map(log => `
                <details class="bg-tertiary/50 rounded-xl">
                    <summary class="p-3 cursor-pointer font-semibold flex justify-between items-center">
                        <span>تمرین ${new Date(log.date).toLocaleDateString("fa-IR", { day: 'numeric', month: 'long' })}</span>
                        <i data-lucide="chevron-down" class="w-5 h-5 transition-transform details-arrow"></i>
                    </summary>
                    <div class="p-3 border-t border-border-primary text-sm">
                        ${log.workoutData.map(ex => `
                            <div class="mb-2">
                                <p class="font-bold">${A(ex.exerciseName)}</p>
                                <div class="flex flex-wrap gap-2 text-xs mt-1">
                                    ${ex.sets.map((set, i) => `<span class="bg-secondary/80 rounded-full px-2 py-0.5">${i+1}: ${set.reps} تکرار @ ${set.weight || '-'}kg</span>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </details>
            `).join('');
        } else {
            historyContainer.innerHTML = '<p class="text-secondary text-center p-4">هیچ تمرینی برای نمایش وجود ندارد.</p>';
        }
    }

    const subHistoryContainer = document.getElementById('subscription-history-container');
    if (subHistoryContainer) {
        const subs = (userData.subscriptions || []).slice().reverse();
        if (subs.length > 0) {
            subHistoryContainer.innerHTML = subs.map(sub => `
                <div class="bg-tertiary/50 p-3 rounded-xl text-sm">
                    <div class="flex justify-between items-center font-bold">
                        <span>${A(sub.planName)}</span>
                        <span class="text-xs ${sub.fulfilled ? 'text-green-400' : 'text-blue-400'}">${sub.fulfilled ? 'انجام شده' : 'در انتظار'}</span>
                    </div>
                    <div class="flex justify-between items-center text-xs text-secondary mt-1">
                         <span>خرید: ${new Date(sub.purchaseDate).toLocaleDateString('fa-IR')}</span>
                         <span>${sub.price.toLocaleString('fa-IR')} تومان</span>
                    </div>
                </div>
            `).join('');
        } else {
            subHistoryContainer.innerHTML = '<p class="text-secondary text-center text-sm p-4">هیچ پلنی خریداری نشده است.</p>';
        }
    }
}

const renderWorkoutTab = (userData) => {
    const weeklyViewContainer = document.getElementById('program-weekly-view');
    if (!weeklyViewContainer) return;
    
    const programDays = (userData.step2 || {}).days || [];
    const trainingDaysCount = programDays.length;
    const dayMapping = {
        1: [3], 2: [2, 5], 3: [1, 3, 5], 4: [1, 2, 4, 5],
        5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6]
    };
    const schedule = dayMapping[trainingDaysCount] || dayMapping[4];
    const weekDays = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"];
    
    let programDayIndex = 0;
    weeklyViewContainer.innerHTML = weekDays.map((dayName, index) => {
        if (schedule.includes(index) && programDayIndex < programDays.length) {
            const dayData = programDays[programDayIndex++];
            return `
                <div class="card p-4 border-l-4 border-yellow-accent">
                    <p class="font-bold text-lg">${dayName}</p>
                    <p class="text-sm text-secondary truncate">${A(dayData.title)}</p>
                    <p class="text-xs mt-2 font-semibold bg-tertiary/80 rounded-full px-2 py-1 inline-block">${dayData.exercises.length} حرکت</p>
                </div>
            `;
        } else {
            return `
                <div class="card p-4 bg-tertiary/50">
                    <p class="font-bold text-lg">${dayName}</p>
                    <p class="text-sm text-secondary">استراحت</p>
                </div>
            `;
        }
    }).join('');

    Ue(userData, "#dashboard-program-view");
}

const renderNutritionTab = (userData) => {
    const container = document.getElementById('dashboard-nutrition-view');
    if (!container) return;
    
    const nutritionHTML = (userData.step5 || {}).nutritionPlanHTML;
    if (nutritionHTML && nutritionHTML.trim() !== '' && !nutritionHTML.includes("در حال تولید برنامه غذایی")) {
        container.innerHTML = nutritionHTML;
    } else {
        container.innerHTML = `
            <div class="text-center text-secondary p-8">
                <i data-lucide="utensils-crossed" class="w-12 h-12 mx-auto mb-4"></i>
                <p class="font-bold">هنوز برنامه تغذیه‌ای برای شما ثبت نشده است.</p>
                <p class="text-sm">مربی شما به زودی آن را آماده و ارسال خواهد کرد.</p>
            </div>
        `;
        window.lucide?.createIcons();
    }
}

const renderChatTab = (username, userData) => {
    const messagesContainer = document.getElementById('coach-chat-messages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = "";
    const chatHistory = userData.chatHistory || [];

    if (chatHistory.length === 0) {
        messagesContainer.innerHTML = `<div class="message coach-message">سلام! اینجا می‌توانید با مربی خود در ارتباط باشید. سوالات خود را بپرسید و بازخورد دریافت کنید.</div>`;
        return;
    }
    
    chatHistory.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${msg.sender === 'user' ? 'user-message' : 'coach-message'}`;
        messageEl.textContent = msg.message;
        messagesContainer.appendChild(messageEl);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

const renderProfileTab = (username, userData) => {
    const profilePanel = document.getElementById("dashboard-profile-panel")!;
    const isConfirmed = !!userData.infoConfirmed;
    
    const notice = document.getElementById('profile-completion-notice');
    if (notice) notice.classList.toggle('hidden', isConfirmed);
    
    const confirmBtn = document.getElementById('confirm-info-btn') as HTMLButtonElement;
    if (confirmBtn) {
        confirmBtn.disabled = isConfirmed;
        confirmBtn.innerHTML = isConfirmed ? '<i data-lucide="check-circle" class="w-5 h-5"></i> اطلاعات شما تایید شده است' : 'تایید و قفل کردن اطلاعات';
        if (isConfirmed) {
            confirmBtn.classList.remove('!border-blue-500/30', '!bg-blue-500/10', '!text-accent', 'hover:!bg-blue-500/20');
            confirmBtn.classList.add('!border-green-500/30', '!bg-green-500/10', '!text-green-accent', 'cursor-not-allowed');
        }
    }
    
    profilePanel.querySelectorAll('input, select').forEach(el => {
        const input = el as HTMLInputElement | HTMLSelectElement;
        if (!input.classList.contains('client-name-input')) { // Keep name readonly
             input.disabled = isConfirmed;
        }
    });
    profilePanel.querySelector('.profile-pic-input')?.closest('label')?.classList.toggle('pointer-events-none', isConfirmed);

    document.getElementById("waiting-for-plan-notice-container")!.innerHTML = "";
    const r = document.getElementById("dashboard-status-container")!;
    r.innerHTML = "";
    const latestPurchase = getLatestPurchase(userData);
    const n = userData.infoConfirmed ?? !1;
    const subStatusEl = document.createElement("div");
    if (latestPurchase) {
        if (latestPurchase.fulfilled === !1) subStatusEl.className = "flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 text-accent", subStatusEl.innerHTML = `<i data-lucide="loader" class="w-6 h-6 animate-spin"></i><div><p class="font-bold">پلن در انتظار آماده‌سازی</p><p class="text-sm">${A(latestPurchase.planName)}</p></div>`;
        else subStatusEl.className = "flex items-center gap-3 p-3 rounded-xl bg-green-500/10 text-green-accent", subStatusEl.innerHTML = `<i data-lucide="check-circle" class="w-6 h-6"></i><div><p class="font-bold">آخرین پلن دریافتی</p><p class="text-sm">${A(latestPurchase.planName)}</p></div>`
    } else subStatusEl.className = "flex items-center gap-3 p-3 rounded-xl bg-gray-500/10 text-gray-400", subStatusEl.innerHTML = `<i data-lucide="alert-circle" class="w-6 h-6"></i><div><p class="font-bold">وضعیت پلن</p><p class="text-sm">بدون پلن فعال</p></div>`;
    r.appendChild(subStatusEl);
    const infoStatusEl = document.createElement("div");
    infoStatusEl.className = `flex items-center gap-3 p-3 rounded-xl ${n?"bg-green-500/10 text-green-accent":"bg-yellow-500/10 text-yellow-accent"}`, infoStatusEl.innerHTML = `<i data-lucide="${n?"user-check":"user-cog"}" class="w-6 h-6"></i><div><p class="font-bold">وضعیت اطلاعات</p><p class="text-sm">${n?"تایید شده":"نیاز به تایید"}</p></div>`, r.appendChild(infoStatusEl);
    
    window.lucide?.createIcons();


    const d = userData.step1 || {};
    (profilePanel.querySelector(".client-name-input") as HTMLInputElement).value = username, (profilePanel.querySelector(".client-email-input") as HTMLInputElement).value = d.clientEmail || "", (profilePanel.querySelector(".profile-pic-preview") as HTMLImageElement).src = d.profilePic || "https://placehold.co/100x100/374151/E5E7EB?text=عکس";
    
    (profilePanel.querySelector(".height-slider") as HTMLInputElement).value = d.height || "180";
    (profilePanel.querySelector(".weight-slider") as HTMLInputElement).value = d.weight || "80";
    (profilePanel.querySelector(".age-slider") as HTMLInputElement).value = d.age || "25";
    (profilePanel.querySelector(".neck-input") as HTMLInputElement).value = d.neck || "";
    (profilePanel.querySelector(".waist-input") as HTMLInputElement).value = d.waist || "";
    (profilePanel.querySelector(".hip-input") as HTMLInputElement).value = d.hip || "";

    if (d.gender) {
        const c = profilePanel.querySelector(`input[name="gender_user"][value="${d.gender}"]`) as HTMLInputElement;
        if (c) c.checked = true;
    } else {
        const c = profilePanel.querySelector('input[name="gender_user"][value="مرد"]') as HTMLInputElement;
        if (c) c.checked = true;
    }

    if (d.trainingGoal) {
        const c = profilePanel.querySelector(`input[name="training_goal_user"][value="${d.trainingGoal}"]`) as HTMLInputElement;
        if (c) c.checked = true;
    }
    if (d.activityLevel) {
        const c = profilePanel.querySelector(`input[name="activity_level_user"][value="${d.activityLevel}"]`) as HTMLInputElement;
        if (c) c.checked = true;
    }
    if (d.trainingDays) {
        const c = profilePanel.querySelector(`input[name="training_days_user"][value="${d.trainingDays}"]`) as HTMLInputElement;
        if (c) c.checked = true;
    }
    
    updateRadioCardSelection(profilePanel);
    profilePanel.querySelectorAll(".range-slider").forEach(c => {
        ie(c as HTMLInputElement);
        const g = new Event("input", {
            bubbles: !0
        });
        c.dispatchEvent(g)
    });
    
    xe(profilePanel);
    he(profilePanel);
}

const renderContactTab = (username, userData) => {
    const nameInput = document.getElementById('contact-name') as HTMLInputElement;
    const emailInput = document.getElementById('contact-email') as HTMLInputElement;

    if (nameInput) nameInput.value = username;
    if (emailInput) emailInput.value = (userData.step1 || {}).clientEmail || '';
};

const renderStorePlans = () => {
    const container = document.getElementById('store-plans-container');
    if (!container) return;

    container.innerHTML = STORE_PLANS.map(plan => `
        <div class="card p-6 flex flex-col items-center text-center border-t-4 border-transparent hover:border-accent transition-colors duration-300">
            <div class="bg-accent/10 p-4 rounded-full mb-4">
                <i data-lucide="${plan.planType === 'workout' ? 'dumbbell' : plan.planType === 'nutrition' ? 'utensils-crossed' : 'sparkles'}" class="w-8 h-8 text-accent"></i>
            </div>
            <h3 class="font-bold text-xl">${A(plan.planName)}</h3>
            <p class="text-secondary text-sm my-3 h-10">${A(plan.description)}</p>
            <p class="text-3xl font-extrabold my-4">${formatPrice(plan.price)}</p>
            <ul class="space-y-2 text-sm text-right mb-6">
                ${plan.features.map(feature => `<li class="flex items-center gap-2"><i data-lucide="check-circle" class="w-4 h-4 text-green-accent"></i>${A(feature)}</li>`).join('')}
            </ul>
            <button class="add-to-cart-btn primary-button w-full mt-auto" data-plan-id="${A(plan.planId)}">افزودن به سبد خرید</button>
        </div>
    `).join('');
    
    window.lucide?.createIcons();
};

function de(e, t) {
    document.getElementById("dashboard-welcome-message")!.textContent = `خوش آمدی، ${e}!`;
    
    renderDashboardTab(e, t);
    renderWorkoutTab(t);
    renderNutritionTab(t);
    renderChatTab(e, t);
    renderProfileTab(e, t);
    renderStorePlans();
    updateCartIcon();
    
    const c = document.getElementById("notification-bell-container")!;
    if (t.newProgram) {
        c.innerHTML = `
            <button id="notification-bell-btn" class="secondary-button !px-3 !py-2" title="برنامه جدیدی از مربی دریافت کرده‌اید">
                <i data-lucide="bell"></i>
                <span class="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-secondary"></span>
            </button>
        `;
        document.getElementById("notification-bell-btn")?.addEventListener("click", () => {
            w("مربی شما یک برنامه جدید ارسال کرده است.");
            const g = D(e);
            delete g.newProgram;
            W(e, g);
            c.innerHTML = "";
            switchUserDashboardTab('workout');
        }, {
            once: !0
        });
    } else if (t.newMessageFromCoach) {
        c.innerHTML = `
            <button id="notification-bell-btn" class="secondary-button !px-3 !py-2" title="پیام جدیدی از مربی دریافت کرده‌اید">
                <i data-lucide="message-square"></i>
                <span class="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-secondary"></span>
            </button>
        `;
        document.getElementById("notification-bell-btn")?.addEventListener("click", () => {
            w("مربی شما یک پیام جدید ارسال کرده است.");
            const g = D(e);
            delete g.newMessageFromCoach;
            W(e, g);
            c.innerHTML = "";
            switchUserDashboardTab('chat');
        }, { once: true });
    } else {
        c.innerHTML = "";
    }
    window.lucide?.createIcons();
    const initialTab = t.infoConfirmed ? 'dashboard' : 'profile';
    setTimeout(() => switchUserDashboardTab(initialTab), 50);
    if (!t.infoConfirmed) {
        setTimeout(() => {
            w('خوش آمدید! لطفا پروفایل خود را تکمیل کنید.');
        }, 500);
    }
}

const switchUserDashboardTab = (e) => {
    const tabsContainer = document.getElementById("user-dashboard-tabs")!;
    const indicator = document.getElementById("tab-indicator") as HTMLElement;
    let activeTab: HTMLElement | null = null;

    document.querySelectorAll(".user-dashboard-tab").forEach(s => {
        const tab = s as HTMLElement;
        const r = tab.getAttribute("data-tab") === e;
        tab.classList.toggle("active-spring-tab", r);
        if (r) {
            activeTab = tab;
        }
    });
    
    if (activeTab && indicator && tabsContainer) {
        const containerRect = tabsContainer.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        indicator.style.width = `${tabRect.width}px`;
        indicator.style.left = `${tabRect.left - containerRect.left}px`;
    }

    document.querySelectorAll(".user-dashboard-tab-content").forEach(s => {
        s.classList.toggle("hidden", s.id !== `${e}-tab-content`)
    });

    const t = localStorage.getItem("fitgympro_last_user");
    if (t && O().find(u => u.username === t)?.role === 'user') {
        const s = D(t);
        if (e === "dashboard") {
            Xe(s.weightHistory, "weight-progress-chart", "no-chart-data");
        }
        if (e === 'store') {
            const latestPurchase = getLatestPurchase(s);
            const subSelectionContainer = document.getElementById("store-plans-container")?.parentElement;
            const hasUnfulfilledPurchase = latestPurchase && latestPurchase.fulfilled === false;
            
            if (subSelectionContainer) subSelectionContainer.classList.toggle("hidden", hasUnfulfilledPurchase);
    
            const noticeContainer = document.getElementById("waiting-for-plan-notice-container-store")!;
            if (hasUnfulfilledPurchase) {
                noticeContainer.innerHTML = `<div class="card p-6 text-center bg-blue-500/10 text-accent rounded-2xl"><i data-lucide="info" class="w-8 h-8 mx-auto mb-3"></i><p class="font-bold">شما یک پلن در انتظار آماده‌سازی توسط مربی دارید.</p><p class="text-sm text-secondary">به محض آماده شدن به شما اطلاع‌رسانی خواهد شد.</p></div>`;
                window.lucide?.createIcons();
            } else {
                 noticeContainer.innerHTML = '';
            }
        }
    }
};

const switchAuthForm = (formToShow: 'login' | 'signup' | 'forgot-password') => {
    const loginContainer = document.getElementById("login-form-container")!;
    const signupContainer = document.getElementById("signup-form-container")!;
    const forgotPasswordContainer = document.getElementById("forgot-password-form-container")!;
    
    const loginForm = document.getElementById("login-form") as HTMLFormElement;
    const signupForm = document.getElementById("signup-form") as HTMLFormElement;
    const forgotPasswordForm = document.getElementById("forgot-password-form") as HTMLFormElement;

    loginContainer?.classList.toggle('hidden', formToShow !== 'login');
    signupContainer?.classList.toggle('hidden', formToShow !== 'signup');
    forgotPasswordContainer?.classList.toggle('hidden', formToShow !== 'forgot-password');

    if (formToShow === 'login') {
        signupForm?.reset();
        forgotPasswordForm?.reset();
    } else if (formToShow === 'signup') {
        loginForm?.reset();
        forgotPasswordForm?.reset();
    } else { // forgot-password
        loginForm?.reset();
        signupForm?.reset();
    }
};

const renderSparkline = (e, t) => {
    if (!window.Chart) return;
    const s = document.getElementById(e) as HTMLCanvasElement;
    if (!s || !t || t.length < 2) return;
    const r = [...t].sort((c, g) => new Date(c.date).getTime() - new Date(g.date).getTime()).slice(-30),
        a = r.map(c => new Date(c.date).toLocaleDateString("fa-IR")),
        n = r.map(c => c.weight),
        o = n[n.length - 1] > n[0] ? "var(--green-accent)" : "var(--red-accent)",
        m = document.documentElement.getAttribute("data-theme") === "dark",
        d = m ? "#e2e8f0" : "#111827";
    new window.Chart(s.getContext("2d"), {
        type: "line",
        data: {
            labels: a,
            datasets: [{
                data: n,
                borderColor: o,
                borderWidth: 2,
                pointRadius: 0,
                tension: .4
            }]
        },
        options: {
            responsive: !0,
            maintainAspectRatio: !1,
            animation: !1,
            plugins: {
                legend: {
                    display: !1
                },
                tooltip: {
                    enabled: !1
                }
            },
            scales: {
                x: {
                    display: !1
                },
                y: {
                    display: !1
                }
            }
        }
    })
}, getUserStatus = e => {
    if (!e.workoutHistory || e.workoutHistory.length === 0) return {
        text: "جدید",
        className: "bg-blue-500/20 text-accent"
    };
    const t = e.workoutHistory.sort((r, a) => new Date(a.date).getTime() - new Date(r.date).getTime())[0].date,
        s = (new Date().getTime() - new Date(t).getTime()) / 864e5;
    return s > 7 ? {
        text: "نیاز به توجه",
        className: "bg-red-500/20 text-red-accent"
    } : {
        text: "در مسیر پیشرفت",
        className: "bg-green-500/20 text-green-accent"
    }
}, se = () => {
    var a;
    const e = document.getElementById("admin-user-list")!;
    const t = (document.getElementById("admin-user-search") as HTMLInputElement).value.toLowerCase(),
        s = ((a = document.querySelector("#user-filter-btn-group .user-filter-btn.active")) == null ? void 0 : a.getAttribute("data-filter")) || "all";
    if (!e) return;
    let r = O().filter(n => n.role === 'user');
    if (s !== "all" && (r = r.filter(n => {
        const o = D(n.username);
        switch (s) {
            case "awaiting-plan":
                return o.subscriptions && o.subscriptions.some(c => c.fulfilled === !1);
            case "unconfirmed":
                return !o.infoConfirmed;
            case "inactive":
                {
                    if (!o.workoutHistory || o.workoutHistory.length === 0) return !0;
                    const m = o.workoutHistory.sort((c, g) => new Date(g.date).getTime() - new Date(c.date).getTime())[0].date;
                    return (new Date().getTime() - new Date(m).getTime()) / 864e5 > 7
                }
            default:
                return !0
        }
    })), t && (r = r.filter(n => n.username.toLowerCase().includes(t) || n.email.toLowerCase().includes(t))), e.innerHTML = "", r.length === 0) {
        e.innerHTML = '<p class="text-secondary text-center col-span-full">هیچ شاگردی با این مشخصات یافت نشد.</p>';
        return
    }
    r.forEach(n => {
        var m;
        const o = document.createElement("div");
        const d = D(n.username);
        const c = getUserStatus(d);
        o.className = "card p-4 space-y-4 flex flex-col";
        o.dataset.username = n.username;
        o.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-4">
                    <img src="${((m=d.step1)==null?void 0:m.profilePic)||"https://placehold.co/56x56/374151/E5E7EB?text=?"}" class="w-14 h-14 rounded-full object-cover border-2 border-border-primary">
                    <div>
                        <p class="font-bold text-lg">${A(n.username)}</p>
                        <p class="text-sm text-secondary">${A(n.email)}</p>
                    </div>
                </div>
                <span class="text-xs font-bold px-2 py-1 rounded-full ${c.className} flex-shrink-0">${c.text}</span>
            </div>
            <div class="flex-1 h-12 w-full"><canvas id="spark-${n.username}"></canvas></div>
            <div class="flex items-center gap-2 pt-3 border-t border-border-primary">
                <button class="load-user-btn secondary-button !font-bold !py-2 !px-4 rounded-lg flex-1" data-username="${A(n.username)}">بارگذاری</button>
                <button class="remove-user-btn text-red-accent hover:bg-red-500/10 p-3 rounded-lg" data-username="${A(n.username)}" title="حذف کاربر"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
            </div>
        `;
        e.appendChild(o);
        renderSparkline(`spark-${n.username}`, d.weightHistory);
    }), window.lucide?.createIcons()
}, lt = e => {
    const t = new Date(e),
        r = Math.round((new Date().getTime() - t.getTime()) / 1e3),
        a = Math.round(r / 60),
        n = Math.round(a / 60),
        o = Math.round(n / 24);
    return r < 60 ? "همین الان" : a < 60 ? `${a} دقیقه پیش` : n < 24 ? `${n} ساعت پیش` : `${o} روز پیش`
}, be = () => {
    const e = O().filter(o => o.role === 'user'),
        t = e.length;
    let s = 0,
        r = 0,
        l = 0;
    e.forEach(o => {
        const m = D(o.username);
        m.subscriptions && m.subscriptions.some(c => c.fulfilled === !1) && s++, m.infoConfirmed || r++;
        const status = getUserStatus(m);
        if (status.text === 'در مسیر پیشرفت') l++;
    }), 
    document.getElementById("total-users-stat")!.textContent = t.toString(), 
    document.getElementById("awaiting-plan-users-stat")!.textContent = s.toString(), 
    document.getElementById("unconfirmed-users-stat")!.textContent = r.toString();
    document.getElementById("active-users-stat")!.textContent = l.toString();

    const a = ze(),
        n = document.getElementById("admin-activity-log")!;
    if (n.innerHTML = "", a.length === 0) {
        n.innerHTML = '<p class="text-secondary text-center p-4">فعالیتی برای نمایش وجود ندارد.</p>';
        return
    }
    a.forEach(o => {
        const m = document.createElement("div");
        m.className = "flex items-center justify-between p-3 rounded-xl bg-tertiary/50 text-sm", m.innerHTML = `
            <p>${A(o.message)}</p>
            <p class="text-secondary flex-shrink-0">${lt(o.date)}</p>
        `, n.appendChild(m)
    })
};

const openModal = e => {
    if (!e) return;
    e.classList.remove("hidden");
    setTimeout(() => {
        e.classList.add("active", "opacity-100", "pointer-events-auto");
        e.querySelector('.card, form, .modal-content')?.classList.remove('scale-95');
    }, 10)
}, closeModal = e => {
    if (!e) return;
    e.classList.remove("active", "opacity-100", "pointer-events-auto");
    e.querySelector('.card, form, .modal-content')?.classList.add('scale-95');
    setTimeout(() => {
        e.classList.add("hidden");
    }, 300);
}, openWorkoutLogModal = () => {
    if (!f) return;
    const e = D(f),
        t = it(e);
    if (!t) {
        w("امروز برنامه تمرینی ندارید.", "error");
        return
    }
    const s = document.getElementById("workout-log-modal")!,
        r = document.getElementById("workout-log-title")!,
        a = document.getElementById("workout-log-exercises-container")!,
        n = document.getElementById("exercise-log-template") as HTMLTemplateElement,
        o = document.getElementById("set-log-row-template") as HTMLTemplateElement;
    r.textContent = t.day.title, a.innerHTML = "", t.day.exercises.forEach(m => {
        const d = n.content.cloneNode(!0) as DocumentFragment,
            c = d.querySelector(".exercise-log-item")! as HTMLElement,
            g = d.querySelector("h4")!;
        g.textContent = m.exercise, c.dataset.exerciseName = m.exercise;
        const x = d.querySelector(".sets-log-container")!;
        for (let h = 1; h <= +m.sets; h++) {
            const E = o.content.cloneNode(!0) as DocumentFragment,
                q = E.querySelector("span")!,
                k = E.querySelector(".reps-log-input")!,
                $ = E.querySelector(".add-set-btn")!;
            q.textContent = `ست ${h}`, k.setAttribute("placeholder", m.reps), h < +m.sets ? $.remove() : $.addEventListener("click", () => {
                const I = x.querySelectorAll(".set-log-row").length + 1,
                    C = o.content.cloneNode(!0) as DocumentFragment,
                    L = C.querySelector("span")!,
                    b = C.querySelector(".reps-log-input")!,
                    B = C.querySelector(".add-set-btn")!;
                L.textContent = `ست ${I}`, b.setAttribute("placeholder", m.reps), B.remove(), x.appendChild(C)
            }), x.appendChild(E)
        }
        a.appendChild(d)
    }), window.lucide?.createIcons(), openModal(s)
}, saveWorkoutLog = () => {
    if (!f) return;
    const e = document.getElementById("workout-log-modal")!,
        t = {
            date: (new Date).toISOString(),
            workoutData: [] as any[]
        };
    e.querySelectorAll(".exercise-log-item").forEach(a => {
        const n = {
            exerciseName: (a as HTMLElement).dataset.exerciseName,
            sets: [] as any[]
        };
        a.querySelectorAll(".set-log-row").forEach(o => {
            const m = (o.querySelector(".weight-log-input") as HTMLInputElement).value,
                d = (o.querySelector(".reps-log-input") as HTMLInputElement).value;
            (m || d) && n.sets.push({
                weight: m,
                reps: d
            })
        }), n.sets.length > 0 && t.workoutData.push(n)
    });
    const s = D(f);
    s.workoutHistory || (s.workoutHistory = []), s.workoutHistory.push(t), W(f, s), w("تمرین با موفقیت ثبت شد!", "success"), de(f, s), closeModal(e)
}, openChat = () => {
    const e = document.getElementById("ai-chat-modal")!;
    openModal(e), currentChatSession || (X || (X = new GoogleGenAI({
        apiKey: process.env.API_KEY
    })), currentChatSession = X.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: "You are FitBot, a friendly and motivating AI fitness assistant for the FitGym Pro app. Your responses should be in Persian. You are an expert in fitness, nutrition, and exercise science. Provide helpful, safe, and encouraging advice. Keep answers concise and easy to understand. Do not give medical advice. Start your first message with a friendly greeting."
        }
    }))
};
const closeChat = () => {
    closeModal(document.getElementById("ai-chat-modal")!)
};
const handleAIChatSubmit = async (e) => {
    e.preventDefault();
    if (!currentChatSession) return;
    const form = e.target as HTMLFormElement;
    const input = form.querySelector("#ai-chat-input") as HTMLInputElement;
    const messagesContainer = document.getElementById("ai-chat-messages")!;
    const prompt = input.value.trim();
    if (!prompt) return;

    input.value = "";

    const userMessageEl = document.createElement("div");
    userMessageEl.className = "message user-message";
    userMessageEl.textContent = prompt;
    messagesContainer.appendChild(userMessageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const aiMessageEl = document.createElement("div");
    aiMessageEl.className = "message ai-message";
    const cursor = document.createElement("span");
    cursor.className = "blinking-cursor";
    aiMessageEl.appendChild(cursor);
    messagesContainer.appendChild(aiMessageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const responseStream = await currentChatSession.sendMessageStream({ message: prompt });
        let fullResponse = "";
        aiMessageEl.innerHTML = "";
        for await (const chunk of responseStream) {
            fullResponse += chunk.text;
            aiMessageEl.innerHTML = fullResponse.replace(/\n/g, '<br>');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    } catch (error) {
        console.error("AI Chat Error:", error);
        aiMessageEl.textContent = "متاسفانه مشکلی پیش آمد. لطفا دوباره تلاش کنید.";
        w("خطا در ارتباط با دستیار هوشمند", "error");
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

// --- CART MANAGEMENT ---
const getCart = () => {
    if (!f) return { items: [], discountCode: null };
    try {
        return JSON.parse(localStorage.getItem(`fitgympro_cart_${f}`) || '{"items":[], "discountCode": null}');
    } catch {
        return { items: [], discountCode: null };
    }
};

const saveCart = (cart) => {
    if (!f) return;
    try {
        localStorage.setItem(`fitgympro_cart_${f}`, JSON.stringify(cart));
    } catch (e) {
        console.error("Failed to save cart to localStorage:", e);
        w("خطا در ذخیره‌سازی سبد خرید", "error");
    }
    updateCartIcon();
    renderCartModal();
};

interface Discount {
    type: string;
    value: number;
}

const getDiscounts = (): Record<string, Discount> => JSON.parse(localStorage.getItem('fitgympro_discounts') || '{}');

const saveDiscounts = (discounts) => {
    try {
        localStorage.setItem('fitgympro_discounts', JSON.stringify(discounts));
    } catch (e) {
        console.error("Failed to save discounts to localStorage:", e);
        w("خطا در ذخیره‌سازی تخفیف‌ها", "error");
    }
};


const calculateTotals = (cart) => {
    const subtotal = cart.items.reduce((acc, item) => acc + item.price, 0);
    let discountAmount = 0;
    const DISCOUNTS = getDiscounts();
    if (cart.discountCode && DISCOUNTS[cart.discountCode]) {
        const discount = DISCOUNTS[cart.discountCode];
        if (discount.type === 'percentage') {
            discountAmount = subtotal * (discount.value / 100);
        } else { // Fixed amount
            discountAmount = Math.min(subtotal, discount.value);
        }
    }
    const total = Math.max(0, subtotal - discountAmount);
    return { subtotal, discountAmount, total };
}

const addToCart = (planDetails) => {
    if (!f) return;
    const cart = getCart();
    const userData = D(f);
    if (userData.subscriptions?.some(s => s.fulfilled === false)) {
        w("شما یک پلن در انتظار آماده‌سازی دارید. لطفا منتظر بمانید.", "error");
        return;
    }
    if (cart.items.some(item => item.planId === planDetails.planId)) {
        w("این پلن قبلاً به سبد خرید اضافه شده است.", "error");
        openCartModal();
        return;
    }
    cart.items.push(planDetails);
    saveCart(cart);
    w(`«${planDetails.planName}» به سبد خرید اضافه شد.`, "success");
    openCartModal();
};

const removeFromCart = (planId) => {
    let cart = getCart();
    cart.items = cart.items.filter(item => item.planId !== planId);
    saveCart(cart);
};

const applyDiscount = (code) => {
    let cart = getCart();
    const DISCOUNTS = getDiscounts();
    if (DISCOUNTS[code]) {
        cart.discountCode = code;
        w("کد تخفیف با موفقیت اعمال شد.", "success");
    } else {
        cart.discountCode = null;
        w("کد تخفیف نامعتبر است.", "error");
    }
    saveCart(cart);
}

const updateCartIcon = () => {
    const cart = getCart();
    const count = cart.items.length;
    const countEl = document.getElementById('cart-item-count') as HTMLSpanElement;
    if (countEl) {
        if (count > 0) {
            countEl.textContent = String(count);
            countEl.classList.remove('hidden');
        } else {
            countEl.classList.add('hidden');
        }
    }
};

const formatPrice = (price) => {
    return `${price.toLocaleString('fa-IR')} تومان`;
}

const renderCartModal = () => {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const checkoutBtn = document.getElementById('checkout-btn') as HTMLButtonElement;
    if (!container || !checkoutBtn) return;

    if (cart.items.length === 0) {
        container.innerHTML = `<div class="text-center text-secondary p-8 flex flex-col items-center justify-center h-full">
            <i data-lucide="shopping-cart" class="w-16 h-16 mb-4"></i>
            <p class="font-bold">سبد خرید شما خالی است.</p>
        </div>`;
        window.lucide?.createIcons();
    } else {
        container.innerHTML = cart.items.map(item => `
            <div class="flex items-center gap-4 py-3 border-b border-border-primary">
                <div class="flex-1">
                    <p class="font-bold">${A(item.planName)}</p>
                    <p class="text-secondary text-sm">${formatPrice(item.price)}</p>
                </div>
                <button class="remove-from-cart-btn text-red-accent hover:bg-red-500/10 p-2 rounded-lg" data-plan-id="${A(item.planId)}" title="حذف">
                    <i data-lucide="trash-2" class="w-5 h-5 pointer-events-none"></i>
                </button>
            </div>
        `).join('');
        window.lucide?.createIcons();
    }

    const { subtotal, discountAmount, total } = calculateTotals(cart);
    (document.getElementById('cart-subtotal') as HTMLElement).textContent = formatPrice(subtotal);
    (document.getElementById('cart-discount') as HTMLElement).textContent = `- ${formatPrice(discountAmount)}`;
    (document.getElementById('cart-total') as HTMLElement).textContent = formatPrice(total);
    (document.getElementById('discount-code-input') as HTMLInputElement).value = cart.discountCode || '';
    checkoutBtn.disabled = cart.items.length === 0;
};

const openCartModal = () => {
    renderCartModal();
    openModal(document.getElementById('shopping-cart-modal'));
};
const closeCartModal = () => closeModal(document.getElementById('shopping-cart-modal'));

const handleCheckout = async () => {
    if (!f) return;
    const cart = getCart();
    if (cart.items.length === 0) return;

    const checkoutBtn = document.getElementById('checkout-btn') as HTMLButtonElement;
    checkoutBtn.classList.add('is-loading');
    checkoutBtn.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 1500));

    const userData = D(f);
    userData.subscriptions = userData.subscriptions || [];

    const { total } = calculateTotals(cart);

    cart.items.forEach(item => {
        userData.subscriptions.push({
            purchaseDate: new Date().toISOString(),
            planType: item.planType,
            planName: item.planName,
            price: total, // Log the final price paid
            fulfilled: false
        });
        ae(`${f} پلن «${item.planName}» را خریداری کرد.`);
    });
    
    W(f, userData);
    saveCart({ items: [], discountCode: null }); // Clear cart

    checkoutBtn.classList.remove('is-loading');

    closeCartModal();
    w(`خرید شما با موفقیت انجام شد. مربی به زودی پلن شما را آماده خواهد کرد.`, "success");
    de(f, D(f)); // Re-render dashboard to show status
};

const seedInitialUsers = () => {
    if (O().length === 0) {
        console.log("No users found. Seeding initial admin, coach, and user.");
        const initialUsers = [
             {
                username: "admin",
                email: "admin@fitgympro.com",
                password: "password123",
                role: "admin",
                status: "active",
                coachStatus: null,
                joinDate: new Date().toISOString()
            },
            {
                username: "coach_verified",
                email: "coach@fitgympro.com",
                password: "password123",
                role: "coach",
                status: "active",
                coachStatus: "verified",
                joinDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
            },
            {
                username: "coach_pending",
                email: "newcoach@fitgympro.com",
                password: "password123",
                role: "coach",
                status: "active",
                coachStatus: "pending",
                joinDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
            },
            {
                username: "user_active",
                email: "user@fitgympro.com",
                password: "password123",
                role: "user",
                status: "active",
                coachStatus: null,
                joinDate: new Date().toISOString()
            },
             {
                username: "user_suspended",
                email: "suspended@fitgympro.com",
                password: "password123",
                role: "user",
                status: "suspended",
                coachStatus: null,
                joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        Ge(initialUsers);

        W("coach_verified", {
            step1: { coachName: "Coach Verified" },
        });

        W("user_active", {
            step1: { clientName: "User Active", clientEmail: "user@fitgympro.com", coachName: "coach_verified" },
            joinDate: new Date().toISOString()
        });
        
        ae("Initial users (admin, coaches, users) were created automatically.");
        
        saveDiscounts({
            'WELCOME10': { type: 'percentage', value: 10 },
            'SAVE50K': { type: 'fixed', value: 50000 }
        });
        ae("Initial discount codes created.");

        setTimeout(() => {
            w("کاربران پیش‌فرض (admin, coaches, users) با رمز عبور 'password123' ساخته شدند.", "success");
        }, 1500);
    }
};

const getAdminHTML = () => `
<div class="admin-dashboard-container flex h-screen bg-secondary text-text-primary opacity-0 transition-opacity duration-500">
    <!-- Sidebar -->
    <aside class="w-64 bg-primary flex flex-col p-4 border-l border-border-secondary">
        <div class="flex items-center gap-3 mb-8">
            <i data-lucide="shield-ellipsis" class="w-8 h-8 text-accent"></i>
            <h1 class="text-xl font-bold">پنل مدیریت</h1>
        </div>
        <nav class="flex flex-col space-y-2">
            <a href="#dashboard" class="nav-link active-link flex items-center gap-3 px-4 py-2.5 rounded-lg">
                <i class="fas fa-tachometer-alt"></i>
                <span>داشبورد</span>
            </a>
            <a href="#users" class="nav-link inactive-link flex items-center gap-3 px-4 py-2.5 rounded-lg">
                <i class="fas fa-users"></i>
                <span>کاربران</span>
            </a>
            <a href="#coaches" class="nav-link inactive-link flex items-center gap-3 px-4 py-2.5 rounded-lg">
                <i class="fas fa-user-tie"></i>
                <span>مربیان</span>
            </a>
            <a href="#discounts" class="nav-link inactive-link flex items-center gap-3 px-4 py-2.5 rounded-lg">
                <i class="fas fa-tags"></i>
                <span>کدهای تخفیف</span>
            </a>
        </nav>
        <div class="mt-auto">
            <button id="admin-logout-btn" class="secondary-button w-full flex items-center justify-center gap-2">
                <i data-lucide="log-out"></i>
                <span>خروج</span>
            </button>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-y-auto">
        <header class="bg-primary/50 sticky top-0 z-10 px-8 py-4 border-b border-border-primary">
            <h2 id="page-title" class="text-2xl font-bold">داشبورد</h2>
        </header>

        <div class="p-8">
            <!-- Dashboard Page -->
            <div id="dashboard-page" class="page">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="card p-5">
                        <h4 class="text-secondary font-semibold mb-2">کاربران جدید (هفته)</h4>
                        <p id="admin-kpi-new-users" class="text-4xl font-bold">0</p>
                    </div>
                    <div class="card p-5">
                        <h4 class="text-secondary font-semibold mb-2">مربیان فعال</h4>
                        <p id="admin-kpi-active-coaches" class="text-4xl font-bold">0</p>
                    </div>
                     <div class="card p-5">
                        <h4 class="text-secondary font-semibold mb-2">پلن‌های فروش رفته</h4>
                        <p id="admin-kpi-plans-sold" class="text-4xl font-bold">175</p>
                    </div>
                     <div class="card p-5">
                        <h4 class="text-secondary font-semibold mb-2">درآمد کل</h4>
                        <p id="admin-kpi-total-revenue" class="text-4xl font-bold">۳۲M</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="card p-5"><h3 class="font-bold mb-4">نمودار درآمد</h3><canvas id="revenueChart" class="h-64"></canvas></div>
                    <div class="card p-5"><h3 class="font-bold mb-4">فروش پلن‌ها</h3><canvas id="plansChart" class="h-64"></canvas></div>
                </div>
            </div>

            <!-- Users Page -->
            <div id="users-page" class="page hidden">
                <div class="card overflow-x-auto">
                    <table class="w-full text-sm text-right">
                        <thead class="text-xs text-secondary uppercase bg-tertiary">
                            <tr>
                                <th scope="col" class="px-6 py-3">نام کاربری</th>
                                <th scope="col" class="px-6 py-3">ایمیل</th>
                                <th scope="col" class="px-6 py-3">تاریخ عضویت</th>
                                <th scope="col" class="px-6 py-3">وضعیت</th>
                                <th scope="col" class="px-6 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody id="user-table-body">
                           <!-- Rows will be injected here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Coaches Page -->
            <div id="coaches-page" class="page hidden">
                 <div class="card overflow-x-auto">
                    <table class="w-full text-sm text-right">
                        <thead class="text-xs text-secondary uppercase bg-tertiary">
                            <tr>
                                <th scope="col" class="px-6 py-3">نام مربی</th>
                                <th scope="col" class="px-6 py-3">تعداد شاگردان</th>
                                <th scope="col" class="px-6 py-3">تاریخ عضویت</th>
                                <th scope="col" class="px-6 py-3">وضعیت همکاری</th>
                                <th scope="col" class="px-6 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody id="coach-table-body">
                           <!-- Rows will be injected here -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Discounts Page -->
            <div id="discounts-page" class="page hidden">
                <div class="flex justify-end mb-4">
                    <button id="add-discount-btn" class="primary-button flex items-center gap-2">
                        <i class="fas fa-plus"></i>
                        <span>ایجاد کد تخفیف</span>
                    </button>
                </div>
                <div class="card overflow-x-auto">
                    <table class="w-full text-sm text-right">
                        <thead class="text-xs text-secondary uppercase bg-tertiary">
                            <tr>
                                <th scope="col" class="px-6 py-3">کد</th>
                                <th scope="col" class="px-6 py-3">نوع</th>
                                <th scope="col" class="px-6 py-3">مقدار</th>
                                <th scope="col" class="px-6 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody id="discount-table-body">
                           <!-- Rows will be injected here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>

    <!-- Add Discount Modal -->
    <div id="add-discount-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <form id="add-discount-form" class="card w-full max-w-lg p-6 space-y-4 transform scale-95 transition-transform duration-300 relative">
            <h3 class="text-xl font-bold">افزودن کد تخفیف جدید</h3>
            <div class="input-group">
                <input id="discount-code" type="text" class="input-field w-full" placeholder=" " required>
                <label for="discount-code" class="input-label">کد تخفیف (مثلا: WELCOME10)</label>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="input-group">
                    <select id="discount-type" class="input-field w-full">
                        <option value="percentage">درصدی</option>
                        <option value="fixed">مبلغ ثابت</option>
                    </select>
                </div>
                <div class="input-group">
                    <input id="discount-value" type="number" class="input-field w-full" placeholder=" " required>
                    <label for="discount-value" class="input-label">مقدار</label>
                </div>
            </div>
            <div class="flex justify-end gap-3 pt-4">
                <button type="button" class="secondary-button close-modal">لغو</button>
                <button type="submit" class="primary-button">ذخیره</button>
            </div>
        </form>
    </div>
</div>
`;

const renderApp = () => {
    const appContainer = document.getElementById('app-root');
    if (!appContainer) return;

    // Check for logged-in user from localStorage
    const lastUser = localStorage.getItem("fitgympro_last_user");
    f = lastUser || null;

    if (!f) {
        // No user logged in, show landing page
        appContainer.innerHTML = getLandingPageHTML() + getAuthModalHTML();
        initLandingPageListeners();
        document.body.classList.remove('dashboard-bg'); // Ensure correct background
    } else {
        const users = O();
        const currentUser = users.find(u => u.username === f);
        if (!currentUser) {
            // User not found, clear login state and show landing
            handleLogout();
            return;
        }

        const userData = D(f);
        document.body.classList.add('dashboard-bg'); // Ensure correct background for logged-in state

        switch (currentUser.role) {
            case 'admin':
                appContainer.innerHTML = getAdminHTML();
                initAdminDashboard(f);
                break;
            case 'coach':
                appContainer.innerHTML = getCoachHTML();
                initCoachDashboard(f);
                break;
            case 'user':
                appContainer.innerHTML = getUserHTML();
                initUserDashboard(f, userData);
                break;
            default:
                // Fallback to landing page if role is unknown
                handleLogout();
                return;
        }
    }

    // Common tasks for all views after render
    window.lucide?.createIcons();
    
    // Animate in the new view
    setTimeout(() => {
        const mainContainer = document.getElementById('main-app-container') || document.getElementById('user-dashboard-container') || document.querySelector('.landing-page-container') || document.querySelector('.admin-dashboard-container');
        if (mainContainer) {
            mainContainer.classList.add('opacity-100');
        }
    }, 50);
};

// --- APP ROUTING & RENDERING ---
const handleLoginSuccess = (username) => {
    f = username;
    localStorage.setItem("fitgympro_last_user", username);
    renderApp();
};

const handleLogout = () => {
    f = null;
    localStorage.removeItem("fitgympro_last_user");
    renderApp();
};


const initCommonListeners = () => {
    document.body.addEventListener('click', e => {
        const target = e.target as HTMLElement;

        // Password toggle
        const passToggle = target.closest('.password-toggle');
        if (passToggle) {
            const targetId = passToggle.getAttribute('data-target');
            if (targetId) {
                const passInput = document.getElementById(targetId) as HTMLInputElement;
                const icon = passToggle.querySelector('i');
                if (passInput.type === 'password') {
                    passInput.type = 'text';
                    icon?.setAttribute('data-lucide', 'eye-off');
                } else {
                    passInput.type = 'password';
                    icon?.setAttribute('data-lucide', 'eye');
                }
                window.lucide?.createIcons();
            }
        }
    });
};

const aboutUsContent = `
    <h3>ماموریت ما</h3>
    <p>در فیت‌جیم‌پرو، ماموریت ما توانمندسازی مربیان برای ارائه بهترین خدمات ممکن و کمک به ورزشکاران برای رسیدن به اهدافشان با برنامه‌های علمی و شخصی‌سازی شده است. ما معتقدیم که تکنولوژی می‌تواند پلی قدرتمند بین دانش مربی و انگیزه ورزشکار باشد.</p>
    
    <h3>چرا فیت‌جیم‌پرو؟</h3>
    <ul>
        <li><i data-lucide="target" class="w-5 h-5"></i><div><strong>برنامه‌ریزی دقیق و هوشمند:</strong> با ابزارهای پیشرفته و پیشنهادهای هوش مصنوعی، برنامه‌هایی بی‌نقص طراحی کنید که دقیقاً متناسب با نیازهای هر شاگرد باشد.</div></li>
        <li><i data-lucide="line-chart" class="w-5 h-5"></i><div><strong>پیگیری پیشرفت بی‌دردسر:</strong> تمام داده‌های مهم شاگردان، از وزن و شاخص‌های بدنی گرفته تا تاریخچه تمرینات، در یک داشبورد جامع و بصری در دسترس شماست.</div></li>
        <li><i data-lucide="message-square" class="w-5 h-5"></i><div><strong>ارتباط موثر با شاگردان:</strong> با سیستم گفتگوی داخلی، به راحتی با شاگردان خود در ارتباط باشید، به سوالاتشان پاسخ دهید و انگیزه‌شان را حفظ کنید.</div></li>
    </ul>
    
    <div class="mt-8 pt-6 border-t border-border-primary">
        <h3>تماس با ما</h3>
        <p>برای هرگونه سوال، پیشنهاد یا همکاری، می‌توانید از طریق ایمیل زیر با ما در ارتباط باشید:</p>
        <div class="mt-2 font-bold text-accent text-lg tracking-wider">
             <a href="mailto:fitgympro2025@gmail.com" class="hover:underline">fitgympro2025@gmail.com</a>
        </div>
    </div>
`;

const coachesContent = `
    <p>تیم مربیان ما متشکل از متخصصان برجسته و با تجربه‌ای است که اشتیاق خود را برای کمک به شما در مسیر تندرستی به کار می‌گیرند. هر یک از مربیان ما دارای گواهینامه‌های معتبر بین‌المللی هستند و در زمینه‌های مختلفی از جمله بدنسازی، تغذیه ورزشی، و تمرینات فانکشنال تخصص دارند.</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div class="flex items-center gap-4 bg-tertiary/50 p-4 rounded-xl">
            <img src="https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=200&auto=format&fit=crop&ixlib=rb-4.0.3" class="w-20 h-20 rounded-full object-cover">
            <div>
                <h4 class="font-bold">آرش آریایی</h4>
                <p class="text-sm text-secondary">متخصص هایپرتروفی و افزایش قدرت</p>
            </div>
        </div>
        <div class="flex items-center gap-4 bg-tertiary/50 p-4 rounded-xl">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop&ixlib=rb-4.0.3" class="w-20 h-20 rounded-full object-cover">
            <div>
                <h4 class="font-bold">سارا مرادی</h4>
                <p class="text-sm text-secondary">متخصص فیتنس و کاهش وزن بانوان</p>
            </div>
        </div>
        <div class="flex items-center gap-4 bg-tertiary/50 p-4 rounded-xl">
            <img src="https://img.freepik.com/free-photo/a-man-with-a-beard-and-a-beard-is-holding-a-dumbbell_1340-39434.jpg?w=200" class="w-20 h-20 rounded-full object-cover">
            <div>
                <h4 class="font-bold">حمید حاجتی</h4>
                <p class="text-sm text-secondary">متخصص بدنسازی کلاسیک و تغذیه</p>
            </div>
        </div>
    </div>
`;

const plansContent = `
    <p>ما می‌دانیم که هر بدنی منحصر به فرد است و یک برنامه برای همه مناسب نیست. به همین دلیل، تمام برنامه‌های ما به صورت اختصاصی برای شما و بر اساس اهداف، سطح آمادگی، و سبک زندگی‌تان طراحی می‌شوند.</p>
    
    <h3>ویژگی‌های برنامه‌های ما</h3>
     <ul>
        <li><i data-lucide="user-check" class="w-5 h-5"></i><div><strong>کاملا شخصی‌سازی شده:</strong> برنامه‌ها بر اساس اطلاعاتی که در پروفایل خود وارد می‌کنید (سن، وزن، قد، سطح فعالیت، هدف و...) توسط مربی شما طراحی می‌شود.</div></li>
        <li><i data-lucide="refresh-cw" class="w-5 h-5"></i><div><strong>قابلیت تطبیق و پیشرفت:</strong> برنامه‌ها به گونه‌ای طراحی شده‌اند که با پیشرفت شما، چالش‌برانگیز باقی بمانند و شما را به طور مداوم به سمت جلو هدایت کنند.</div></li>
        <li><i data-lucide="book-open" class="w-5 h-5"></i><div><strong>توضیحات کامل و جامع:</strong> هر برنامه شامل جزئیات دقیق در مورد حرکات، تعداد ست و تکرار، زمان استراحت، و نکات کلیدی برای اجرای صحیح است.</div></li>
    </ul>
`;


const initLandingPageListeners = () => {
    const authModal = document.getElementById('auth-modal');
    if (!authModal) return;

    const openAuthModal = (form: 'login' | 'signup') => {
        openModal(authModal);
        switchAuthForm(form);
    };

    document.getElementById('header-login-btn')?.addEventListener('click', () => openAuthModal('login'));
    document.getElementById('header-signup-btn')?.addEventListener('click', () => openAuthModal('signup'));
    document.getElementById('hero-cta-btn')?.addEventListener('click', () => openAuthModal('signup'));

    document.getElementById('close-auth-modal-btn')?.addEventListener('click', () => closeModal(authModal));
    authModal.addEventListener('click', e => {
        if ((e.target as HTMLElement).id === 'auth-modal') {
            closeModal(authModal);
        }
    });

    const infoModal = document.getElementById('info-modal');
    const infoModalTitle = document.getElementById('info-modal-title');
    const infoModalContent = document.getElementById('info-modal-content');

    const openInfoModal = (title: string, content: string) => {
        if (infoModal && infoModalTitle && infoModalContent) {
            infoModalTitle.textContent = title;
            infoModalContent.innerHTML = content;
            window.lucide?.createIcons();
            openModal(infoModal);
        }
    }

    document.getElementById('open-about-modal-btn')?.addEventListener('click', () => openInfoModal('درباره فیت‌جیم‌پرو', aboutUsContent));
    document.getElementById('open-coaches-modal-btn')?.addEventListener('click', () => openInfoModal('مربیان متخصص ما', coachesContent));
    document.getElementById('open-plans-modal-btn')?.addEventListener('click', () => openInfoModal('برنامه‌های تمرینی', plansContent));

    document.getElementById('close-info-modal-btn')?.addEventListener('click', () => closeModal(infoModal));
    infoModal?.addEventListener('click', e => {
        if ((e.target as HTMLElement).id === 'info-modal') {
            closeModal(infoModal);
        }
    });

    initAuthScreen();
};

const initAuthScreen = () => {
    switchAuthForm('login');

    document.getElementById('switch-to-signup-btn')?.addEventListener('click', () => switchAuthForm('signup'));
    document.getElementById('switch-to-login-btn')?.addEventListener('click', () => switchAuthForm('login'));
    document.getElementById('switch-to-forgot-btn')?.addEventListener('click', () => switchAuthForm('forgot-password'));
    document.getElementById('switch-back-to-login-btn')?.addEventListener('click', () => switchAuthForm('login'));
    
    const loginForm = document.getElementById("login-form") as HTMLFormElement;
    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const usernameInput = document.getElementById("login-username") as HTMLInputElement;
        const passwordInput = document.getElementById("login-password") as HTMLInputElement;
        const t = usernameInput.value.trim();
        const s = passwordInput.value;
        if (!t || !s) {
            w("نام کاربری و رمز عبور الزامی است.", "error");
            loginForm.closest('.card')?.classList.add('shake-animation');
            setTimeout(() => loginForm.closest('.card')?.classList.remove('shake-animation'), 500);
            return;
        }
        const user = O().find(a => a.username === t);
        if (user && user.password === s) {
            if (user.status === 'suspended') {
                w("حساب کاربری شما مسدود شده است.", "error");
                return;
            }
             if (user.role === 'coach' && user.coachStatus !== 'verified') {
                 w("حساب مربیگری شما در انتظار تایید مدیر است.", "error");
                 return;
             }
            handleLoginSuccess(t);
        } else {
            w("نام کاربری یا رمز عبور اشتباه است.", "error");
            loginForm.closest('.card')?.classList.add('shake-animation');
            setTimeout(() => loginForm.closest('.card')?.classList.remove('shake-animation'), 500);
        }
    });

    const signupForm = document.getElementById("signup-form") as HTMLFormElement;
    signupForm.addEventListener("submit", e => {
        e.preventDefault();
        const usernameInput = document.getElementById("signup-username") as HTMLInputElement;
        const emailInput = document.getElementById("signup-email") as HTMLInputElement;
        const passwordInput = document.getElementById("signup-password") as HTMLInputElement;
        
        clearValidationError(usernameInput);
        clearValidationError(emailInput);
        clearValidationError(passwordInput);

        const t = usernameInput.value.trim();
        const s = emailInput.value.trim();
        const r = passwordInput.value;

        let hasError = false;
        if (t.length < 3) {
            showValidationError(usernameInput, 'نام کاربری باید حداقل ۳ کاراکتر باشد.');
            hasError = true;
        }
        if (O().some(n => n.username === t)) {
            showValidationError(usernameInput, 'این نام کاربری قبلا استفاده شده است.');
            hasError = true;
        }
        if (!/^\S+@\S+\.\S+$/.test(s)) {
            showValidationError(emailInput, 'لطفا یک ایمیل معتبر وارد کنید.');
            hasError = true;
        }
        if (r.length < 6) {
            showValidationError(passwordInput, 'رمز عبور باید حداقل ۶ کاراکتر باشد.');
            hasError = true;
        }

        if (hasError) return;
        
        const a = O();
        a.push({
            username: t,
            email: s,
            password: r,
            role: 'user', // Default role
            status: 'active',
            coachStatus: null,
            joinDate: new Date().toISOString()
        });
        Ge(a);
        W(t, {
            step1: { clientName: t, clientEmail: s },
            joinDate: new Date().toISOString()
        });
        w("ثبت نام با موفقیت انجام شد! حالا می‌توانید وارد شوید.", "success");
        ae(`${t} ثبت نام کرد.`);
        switchAuthForm("login");
        (document.getElementById("login-username") as HTMLInputElement).value = t;
    });
};

const initCoachDashboard = (coachUsername) => {
    document.getElementById("logout-btn")?.addEventListener("click", handleLogout);

    // Coach panel specific listeners
    const form = document.getElementById("program-builder-form")!;
    form.addEventListener("click", e => {
        const target = e.target as HTMLElement;
        if (target.closest(".add-day-btn")) re();
        if (target.closest(".add-exercise-btn")) ge(target.closest(".day-card")!.querySelector(".exercise-list")!);
        if (target.closest(".remove-day-btn")) target.closest(".day-card")?.remove();
        if (target.closest(".remove-exercise-btn")) target.closest(".exercise-row")?.remove();
        if (target.closest(".superset-btn")) {
            const btn = target.closest(".superset-btn")!;
            btn.classList.toggle('active');
            btn.closest('.exercise-row')?.classList.toggle('is-superset');
        }
    });
    form.addEventListener("input", e => {
        const target = e.target as HTMLInputElement;
        if (target.classList.contains("range-slider")) updateSliderValueDisplay(target);
        if (target.classList.contains("muscle-group-select")) {
            pe(target.value, target.closest(".exercise-row")!.querySelector(".exercise-select") as HTMLSelectElement);
        }
        if(target.closest('#section-1')){
             if (target.name?.startsWith('gender') || ['age-slider', 'height-slider', 'weight-slider', 'neck-input', 'waist-input', 'hip-input'].some(cls => target.classList.contains(cls))) {
                const section1 = document.getElementById('section-1')!;
                if(target.name?.startsWith('gender')) xe(section1);
                he(section1);
            }
        }
    });
    form.addEventListener("change", e => {
        const target = e.target as HTMLInputElement;
        if (target.classList.contains("profile-pic-input") && target.files && target.files[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                (target.closest('label')?.querySelector('.profile-pic-preview') as HTMLImageElement).src = reader.result as string;
            };
            reader.readAsDataURL(target.files[0]);
        }
        if (target.type === 'radio') {
            updateRadioCardSelection(form);
        }
    });
    
    document.getElementById("prev-btn")?.addEventListener("click", () => ne(F-1));
    document.getElementById("next-btn")?.addEventListener("click", () => ne(F+1));
    document.querySelectorAll(".stepper-item").forEach(el => el.addEventListener("click", () => ne(+(el.getAttribute('data-step')!))));
    
    document.getElementById("save-pdf-btn")?.addEventListener("click", Fe);
    document.getElementById("save-image-btn")?.addEventListener("click", saveAsImage);
    document.getElementById("send-program-btn")?.addEventListener("click", rt);
    document.getElementById("save-changes-btn")?.addEventListener("click", at);
    document.getElementById("send-nutrition-btn")?.addEventListener("click", dt);

    // Load initial data for coach
    document.getElementById("current-user-name")!.textContent = coachUsername;
    Je({
        step1: { coachName: coachUsername },
        step2: { days: [] },
        step3: { supplements: [] },
        step4: {},
        step5: {}
    });
    st(); // Populate supplements
};

const initUserDashboardListeners = (username: string) => {
    const dashboardContainer = document.getElementById('user-dashboard-container');
    if (!dashboardContainer) return;

    // Use event delegation for dynamically added elements
    dashboardContainer.addEventListener('click', e => {
        const target = e.target as HTMLElement;

        if (target.closest('#start-workout-btn')) openWorkoutLogModal();
        if (target.closest('#save-workout-log-btn')) saveWorkoutLog();
        if (target.closest('#close-workout-log-btn')) closeModal(document.getElementById('workout-log-modal'));
        if (target.closest('#cart-icon-btn')) openCartModal();
        if (target.closest('#close-cart-btn')) closeCartModal();
        if (target.closest('#checkout-btn')) handleCheckout();
        if (target.closest('#open-ai-chat-btn')) openChat();
        if (target.closest('#close-ai-chat-btn')) closeChat();

        const addToCartBtn = target.closest('.add-to-cart-btn');
        if (addToCartBtn) {
            const planId = addToCartBtn.getAttribute('data-plan-id');
            const planDetails = STORE_PLANS.find(p => p.planId === planId);
            if (planDetails) addToCart(planDetails);
        }

        const removeFromCartBtn = target.closest('.remove-from-cart-btn');
        if (removeFromCartBtn) {
            const planId = removeFromCartBtn.getAttribute('data-plan-id');
            if (planId) removeFromCart(planId);
        }

        if (target.closest('#confirm-info-btn')) {
            const btn = target.closest('#confirm-info-btn') as HTMLButtonElement;
            if (btn.disabled) return;
            const currentUserData = D(username);
            currentUserData.infoConfirmed = true;
            W(username, currentUserData);
            ae(`${username} اطلاعات پروفایل خود را تایید کرد.`);
            w('اطلاعات شما با موفقیت تایید شد.', 'success');
            renderProfileTab(username, currentUserData);
        }
    });

    dashboardContainer.addEventListener('submit', e => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;

        if (form.id === 'add-weight-form') {
            const input = form.querySelector('#new-weight-input') as HTMLInputElement;
            const weight = parseFloat(input.value);
            if (!isNaN(weight) && weight > 0) {
                const currentUserData = D(username);
                if (!currentUserData.weightHistory) currentUserData.weightHistory = [];
                currentUserData.weightHistory.push({ date: new Date().toISOString(), weight: weight });
                W(username, currentUserData);
                input.value = '';
                w('وزن با موفقیت ثبت شد.', 'success');
                Xe(currentUserData.weightHistory, 'weight-progress-chart', 'no-chart-data');
            } else {
                w('لطفا وزن معتبری وارد کنید.', 'error');
            }
        }

        if (form.id === 'coach-chat-form') {
            const input = form.querySelector('#coach-chat-input') as HTMLInputElement;
            const message = input.value.trim();
            if (message) {
                const currentUserData = D(username);
                if (!currentUserData.chatHistory) currentUserData.chatHistory = [];
                currentUserData.chatHistory.push({ sender: 'user', message, date: new Date().toISOString() });
                currentUserData.hasNewMessageForCoach = true;
                W(username, currentUserData);
                input.value = '';
                renderChatTab(username, currentUserData);
                ae(`پیام جدید از ${username}`);
            }
        }
        
        if (form.id === 'ai-chat-form') {
            handleAIChatSubmit(e);
        }

        if (form.id === 'discount-form') {
            const input = form.querySelector('#discount-code-input') as HTMLInputElement;
            const code = input.value.trim();
            if (code) applyDiscount(code);
        }
    });

    const profilePanel = document.getElementById('dashboard-profile-panel');
    if (profilePanel) {
        const handleProfileChange = () => {
             const currentUserData = D(username);
             if (currentUserData.infoConfirmed) return;
             
             const step1Data = {
                 clientEmail: (profilePanel.querySelector(".client-email-input") as HTMLInputElement).value,
                 profilePic: (profilePanel.querySelector(".profile-pic-preview") as HTMLImageElement).src,
                 height: (profilePanel.querySelector(".height-slider") as HTMLInputElement).value,
                 weight: (profilePanel.querySelector(".weight-slider") as HTMLInputElement).value,
                 age: (profilePanel.querySelector(".age-slider") as HTMLInputElement).value,
                 neck: (profilePanel.querySelector(".neck-input") as HTMLInputElement).value,
                 waist: (profilePanel.querySelector(".waist-input") as HTMLInputElement).value,
                 hip: (profilePanel.querySelector(".hip-input") as HTMLInputElement).value,
                 gender: (profilePanel.querySelector('input[name="gender_user"]:checked') as HTMLInputElement)?.value,
                 trainingGoal: (profilePanel.querySelector('input[name="training_goal_user"]:checked') as HTMLInputElement)?.value,
                 activityLevel: (profilePanel.querySelector('input[name="activity_level_user"]:checked') as HTMLInputElement)?.value,
                 trainingDays: (profilePanel.querySelector('input[name="training_days_user"]:checked') as HTMLInputElement)?.value,
             };
             currentUserData.step1 = { ...(currentUserData.step1 || {}), ...step1Data };
             W(username, currentUserData);
             he(profilePanel);
        };
        
        let debounceTimer;
        profilePanel.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            if (D(username).infoConfirmed) return;
            if (target.classList.contains("range-slider")) updateSliderValueDisplay(target);
            if(target.name?.startsWith('gender_user')) xe(profilePanel);
            he(profilePanel);
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(handleProfileChange, 1000);
        });

        profilePanel.addEventListener('change', e => {
             const target = e.target as HTMLInputElement;
             if (D(username).infoConfirmed) return;
             if (target.classList.contains("profile-pic-input") && target.files && target.files[0]) {
                const reader = new FileReader();
                reader.onload = () => {
                    (target.closest('label')?.querySelector('.profile-pic-preview') as HTMLImageElement).src = reader.result as string;
                    handleProfileChange();
                };
                reader.readAsDataURL(target.files[0]);
             } else if (target.type === 'radio') {
                 updateRadioCardSelection(profilePanel);
                 handleProfileChange();
             }
        });
    }
    
    document.getElementById('user-dashboard-tabs')?.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const tabBtn = target.closest('.user-dashboard-tab');
        if (tabBtn) {
            const tabName = tabBtn.getAttribute('data-tab');
            if (tabName) switchUserDashboardTab(tabName);
        }
    });
};

const initUserDashboard = (username, userData) => {
    document.getElementById("logout-btn-dashboard")?.addEventListener("click", handleLogout);
    de(username, userData);
    initUserDashboardListeners(username);
};

const initAdminDashboard = (adminUsername) => {
    document.getElementById('admin-logout-btn')?.addEventListener('click', handleLogout);

    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const pageTitle = document.getElementById('page-title');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1) + '-page';
            navLinks.forEach(nav => {
                nav.classList.remove('active-link');
                nav.classList.add('inactive-link');
            });
            link.classList.add('active-link');
            link.classList.remove('inactive-link');
            pages.forEach(page => page.classList.toggle('hidden', page.id !== targetId));
            if(pageTitle && link.textContent) pageTitle.textContent = link.textContent.trim();
        });
    });

    // --- Data Rendering ---
    const renderAdminDashboardData = () => {
        const users = O();
        const newUserCount = users.filter(u => new Date(u.joinDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
        const activeCoachesCount = users.filter(u => u.role === 'coach' && u.coachStatus === 'verified').length;
        
        document.getElementById('admin-kpi-new-users').textContent = String(newUserCount);
        document.getElementById('admin-kpi-active-coaches').textContent = String(activeCoachesCount);

        const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
        if (revenueCtx) {
            new window.Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
                    datasets: [{
                        label: 'درآمد',
                        data: [12, 19, 3, 5, 2, 3].map(v => v * 100000),
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { callback: (value) => `${Number(value) / 1000000}M` } } }, plugins: { legend: { display: false } } }
            });
        }

        const plansCtx = document.getElementById('plansChart') as HTMLCanvasElement;
        if (plansCtx) {
            new window.Chart(plansCtx, {
                type: 'bar',
                data: {
                    labels: STORE_PLANS.map(p => p.planName.split(' ')[2]),
                    datasets: [{
                        label: 'فروش پلن‌ها',
                        data: [55, 30, 80, 45],
                        backgroundColor: ['#0ea5e9', '#f97316', '#ec4899', '#8b5cf6'],
                        borderRadius: 4,
                    }]
                },
                options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } }
            });
        }
    };

    const renderAdminUserTable = () => {
        const userTableBody = document.getElementById('user-table-body');
        if (!userTableBody) return;
        const users = O().filter(u => u.role === 'user');
        userTableBody.innerHTML = users.map(user => `
            <tr class="border-b">
                <td class="px-6 py-4">${A(user.username)}</td>
                <td class="px-6 py-4">${A(user.email)}</td>
                <td class="px-6 py-4">${new Date(user.joinDate).toLocaleDateString('fa-IR')}</td>
                <td class="px-6 py-4">
                    <span class="text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${user.status === 'active' ? 'فعال' : 'مسدود'}
                    </span>
                </td>
                <td class="px-6 py-4 space-x-2 space-x-reverse">
                    <button class="text-gray-400 hover:text-sky-500" title="مشاهده"><i class="far fa-eye"></i></button>
                    <button class="text-gray-400 hover:text-red-500" title="مسدود کردن"><i class="fas fa-ban"></i></button>
                </td>
            </tr>
        `).join('');
    };
    
    const renderAdminCoachTable = () => {
        const coachTableBody = document.getElementById('coach-table-body');
        if (!coachTableBody) return;
        const coaches = O().filter(u => u.role === 'coach');
        coachTableBody.innerHTML = coaches.map(coach => {
            let statusBadge = '';
            let actions = '';
            switch(coach.coachStatus) {
                case 'verified':
                    statusBadge = `<span class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">تایید شده</span>`;
                    actions = `<button class="cancel-collaboration-btn text-gray-400 hover:text-red-500" title="لغو همکاری" data-username="${coach.username}"><i class="fas fa-user-slash"></i></button>`;
                    break;
                case 'pending':
                    statusBadge = `<span class="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">در انتظار تایید</span>`;
                    actions = `<button class="approve-coach-btn text-gray-400 hover:text-green-500" title="تایید کردن" data-username="${coach.username}"><i class="far fa-check-circle"></i></button>
                               <button class="reject-coach-btn text-gray-400 hover:text-red-500" title="رد کردن" data-username="${coach.username}"><i class="far fa-times-circle"></i></button>`;
                    break;
                case 'cancelled':
                     statusBadge = `<span class="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">همکاری لغو شد</span>`;
                     actions = `<button class="reapprove-coach-btn text-gray-400 hover:text-emerald-500" title="تایید مجدد" data-username="${coach.username}"><i class="fas fa-user-check"></i></button>`;
                    break;
                default:
                     statusBadge = `<span class="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">نامشخص</span>`;
            }
            const studentCount = O().filter(u => u.role === 'user' && D(u.username)?.step1?.coachName === coach.username).length;
            return `<tr>
                        <td class="px-6 py-4">${A(coach.username)}</td>
                        <td class="px-6 py-4">${studentCount}</td>
                        <td class="px-6 py-4">${new Date(coach.joinDate).toLocaleDateString('fa-IR')}</td>
                        <td class="px-6 py-4 status-cell">${statusBadge}</td>
                        <td class="px-6 py-4 space-x-2 space-x-reverse action-cell">${actions}</td>
                    </tr>`;
        }).join('');
    };

    const renderDiscountTable = () => {
        const tableBody = document.getElementById('discount-table-body');
        if (!tableBody) return;
        const discounts = getDiscounts();
        tableBody.innerHTML = Object.entries(discounts).map(([code, details]) => `
             <tr>
                <td class="px-6 py-4 font-mono">${A(code)}</td>
                <td class="px-6 py-4">${details.type === 'percentage' ? 'درصدی' : 'مبلغ ثابت'}</td>
                <td class="px-6 py-4">${details.type === 'percentage' ? `${details.value}%` : formatPrice(details.value)}</td>
                <td class="px-6 py-4">
                    <button class="delete-discount-btn text-gray-400 hover:text-red-500" title="حذف کد" data-code="${A(code)}"><i class="far fa-trash-alt"></i></button>
                </td>
            </tr>
        `).join('');
    };

    // --- Event Listeners ---
    const updateCoachStatus = (coachUsername, newStatus) => {
        const users = O();
        const userIndex = users.findIndex(u => u.username === coachUsername);
        if (userIndex !== -1) {
            users[userIndex].coachStatus = newStatus;
            Ge(users);
            ae(`Admin updated coach ${coachUsername} status to ${newStatus}`);
            renderAdminCoachTable();
        }
    };
    
    document.getElementById('coaches-page')?.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const button = target.closest('button');
        if (!button) return;
        const coachUsername = button.dataset.username;
        if (!coachUsername) return;

        if (button.matches('.approve-coach-btn, .reapprove-coach-btn')) {
            updateCoachStatus(coachUsername, 'verified');
        } else if (button.matches('.cancel-collaboration-btn')) {
            updateCoachStatus(coachUsername, 'cancelled');
        } else if (button.matches('.reject-coach-btn')) {
             let users = O().filter(u => u.username !== coachUsername);
             Ge(users);
             ae(`Admin rejected and removed coach ${coachUsername}`);
             renderAdminCoachTable();
        }
    });

    const discountModal = document.getElementById('add-discount-modal');
    document.getElementById('add-discount-btn')?.addEventListener('click', () => openModal(discountModal));
    discountModal?.querySelector('.close-modal')?.addEventListener('click', () => closeModal(discountModal));
    
    document.getElementById('add-discount-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const code = (document.getElementById('discount-code') as HTMLInputElement).value.toUpperCase();
        const type = (document.getElementById('discount-type') as HTMLSelectElement).value;
        const value = parseFloat((document.getElementById('discount-value') as HTMLInputElement).value);

        if (code && !isNaN(value)) {
            const discounts = getDiscounts();
            discounts[code] = { type, value };
            saveDiscounts(discounts);
            ae(`Admin created discount code: ${code}`);
            renderDiscountTable();
            (e.target as HTMLFormElement).reset();
            closeModal(discountModal);
        }
    });
    
    document.getElementById('discounts-page')?.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const deleteBtn = target.closest('.delete-discount-btn');
        if (deleteBtn) {
            const code = deleteBtn.getAttribute('data-code');
            if (code) {
                const discounts = getDiscounts();
                delete discounts[code];
                saveDiscounts(discounts);
                ae(`Admin deleted discount code: ${code}`);
                renderDiscountTable();
            }
        }
    });

    // Initial Render
    renderAdminDashboardData();
    renderAdminUserTable();
    renderAdminCoachTable();
    renderDiscountTable();
};


const getLandingPageHTML = () => `
<div class="landing-page-container">
    <div class="landing-bg"></div>
    <header id="landing-header" class="fixed top-0 left-0 right-0 z-50 p-4 animate-fade-in-down">
        <div class="container mx-auto flex justify-between items-center p-3 rounded-2xl glass-nav">
            <div class="flex items-center gap-3">
                <i data-lucide="dumbbell" class="w-8 h-8 text-accent"></i>
                <h1 class="text-xl font-bold">فیت‌جیم‌پرو</h1>
            </div>
            <nav class="hidden md:flex items-center gap-6 text-sm font-semibold">
                <a href="#" class="landing-nav-link">خانه</a>
                <button id="open-about-modal-btn" type="button" class="landing-nav-link">درباره ما</button>
                <button id="open-coaches-modal-btn" type="button" class="landing-nav-link">مربیان</button>
                <button id="open-plans-modal-btn" type="button" class="landing-nav-link">برنامه‌های تمرینی</button>
            </nav>
            <div class="flex items-center gap-2">
                <button id="header-login-btn" class="secondary-button !py-2 !px-5 !text-sm !bg-transparent !border-0 !text-text-primary hover:!bg-white/10">ورود</button>
                <button id="header-signup-btn" class="primary-button !py-2 !px-5 !text-sm">ثبت نام</button>
            </div>
        </div>
    </header>
    <main class="relative h-screen flex items-center justify-center text-center p-4">
        <div class="z-10">
            <div class="animate-fade-in-up">
                <h1 class="text-5xl md:text-7xl font-black tracking-tighter">
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-400">آینده</span>
                    مربیگری، امروز.
                </h1>
                <p class="max-w-2xl mx-auto mt-6 text-lg text-secondary animate-fade-in-up animation-delay-200">
                    با پلتفرم هوشمند فیت‌جیم‌پرو، برنامه‌های تمرینی و غذایی شخصی‌سازی شده برای شاگردان خود طراحی کنید، پیشرفتشان را دنبال کنید و کسب‌وکار مربیگری خود را متحول سازید.
                </p>
                <button id="hero-cta-btn" class="primary-button !py-3.5 !px-8 !text-lg mt-8 hero-cta-btn animate-fade-in-up animation-delay-400">
                    <span class="glow-circle"></span>
                    همین حالا شروع کنید
                </button>
                <div class="mt-8 flex justify-center gap-6 animate-fade-in-up animation-delay-800">
                    <a href="#" class="social-icon-link" title="Instagram"><i data-lucide="instagram" class="w-6 h-6"></i></a>
                    <a href="#" class="social-icon-link" title="Telegram"><i data-lucide="send" class="w-6 h-6"></i></a>
                    <a href="#" class="social-icon-link" title="Website"><i data-lucide="globe" class="w-6 h-6"></i></a>
                </div>
            </div>
            <div class="motivational-card animate-fade-in-up animation-delay-600">
                <div class="stat">
                    <i data-lucide="trending-up" class="w-10 h-10"></i>
                    <div class="stat-text text-right">
                        <p class="text-accent text-lg">مسیر شما</p>
                        <p class="text-base">به سوی تناسب اندام</p>
                    </div>
                </div>
                <div class="w-px h-12 bg-border-primary/50"></div>
                <div class="stat">
                     <i data-lucide="users" class="w-10 h-10"></i>
                    <div class="stat-text text-right">
                        <p class="text-accent text-lg">+5k</p>
                        <p class="text-base">عضو راضی</p>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <div id="info-modal" class="modal fixed inset-0 bg-black/60 z-[100] hidden opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="card w-full max-w-3xl transform scale-95 transition-transform duration-300 relative max-h-[90vh] flex flex-col">
            <header class="p-4 border-b border-border-primary flex justify-between items-center flex-shrink-0">
                <h2 id="info-modal-title" class="text-xl font-bold text-accent"></h2>
                <button id="close-info-modal-btn" type="button" class="secondary-button !p-2 rounded-full z-10"><i data-lucide="x"></i></button>
            </header>
            <div id="info-modal-content" class="p-6 overflow-y-auto">
                <!-- Content will be injected here -->
            </div>
        </div>
    </div>
</div>
`;

const getAuthModalHTML = () => `
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

const getCoachHTML = () => `
<div id="main-app-container" class="opacity-0 transition-opacity duration-500 animate-fade-in">
    <header class="bg-secondary sticky top-0 z-40 border-b border-border-primary">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <i data-lucide="dumbbell" class="w-8 h-8 text-accent"></i>
                <h1 class="text-xl font-bold">FitGym Pro <span class="text-sm font-normal text-secondary">(پنل مربی)</span></h1>
            </div>
            <div class="flex items-center gap-2">
                <div id="current-user-display" class="flex items-center gap-2">
                     <i data-lucide="shield-check" class="text-green-accent"></i>
                     <span id="current-user-name" class="font-bold"></span>
                </div>
                <button id="logout-btn" class="secondary-button !px-3 !py-2" title="خروج"><i data-lucide="log-out"></i></button>
            </div>
        </div>
    </header>
    
    <main class="container mx-auto p-4 lg:p-6">
        <form id="program-builder-form" class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div class="lg:col-span-2 space-y-6">
                <div class="card p-4">
                    <div class="flex justify-between items-center">
                        <div class="stepper-item active" data-step="1"><div class="w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold">1</div><span class="hidden md:inline">اطلاعات</span></div>
                        <div class="flex-1 h-0.5 bg-border-primary mx-4"></div>
                        <div class="stepper-item" data-step="2"><div class="w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold">2</div><span class="hidden md:inline">تمرین</span></div>
                         <div class="flex-1 h-0.5 bg-border-primary mx-4"></div>
                        <div class="stepper-item" data-step="3"><div class="w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold">3</div><span class="hidden md:inline">مکمل‌ها</span></div>
                        <div class="flex-1 h-0.5 bg-border-primary mx-4"></div>
                        <div class="stepper-item" data-step="4"><div class="w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold">4</div><span class="hidden md:inline">بازبینی</span></div>
                        <div class="flex-1 h-0.5 bg-border-primary mx-4"></div>
                        <div class="stepper-item" data-step="5"><div class="w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold">5</div><span class="hidden md:inline">تغذیه</span></div>
                    </div>
                </div>
                
                <div id="section-1" class="form-section active card p-6">
                    <h2 class="text-2xl font-bold mb-6 border-b border-border-primary pb-4">گام اول: اطلاعات شاگرد</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <label for="profile-pic-upload" class="flex flex-col items-center gap-2 cursor-pointer"><img class="profile-pic-preview w-24 h-24 rounded-full object-cover border-4 border-border-primary" src="https://placehold.co/100x100/374151/E5E7EB?text=عکس" alt="Profile"><span class="text-xs font-semibold text-secondary">تغییر عکس</span><input type="file" id="profile-pic-upload" class="profile-pic-input hidden" accept="image/*"></label>
                            <div class="sm:col-span-2 space-y-4">
                                <input type="text" id="client-name-input" class="client-name-input input-field w-full text-lg" placeholder="نام و نام خانوادگی شاگرد">
                                <input type="email" class="client-email-input input-field w-full" placeholder="ایمیل شاگرد (اختیاری)">
                                <input type="text" id="coach-name-input" class="coach-name-input input-field w-full" placeholder="نام مربی">
                            </div>
                        </div>
                        <div class="space-y-4"><label class="font-semibold">سن: <span class="age-value font-bold text-accent">25</span></label><input type="range" min="15" max="80" value="25" class="range-slider age-slider"></div>
                        <div class="space-y-4"><label class="font-semibold">قد (cm): <span class="height-value font-bold text-accent">180</span></label><input type="range" min="140" max="220" value="180" class="range-slider height-slider"></div>
                         <div class="space-y-4"><label class="font-semibold">وزن (kg): <span class="weight-value font-bold text-accent">80</span></label><input type="range" min="40" max="150" value="80" step="0.5" class="range-slider weight-slider"></div>
                        <div class="space-y-2"><h3 class="font-bold text-lg">جنسیت</h3><div class="grid grid-cols-2 gap-3 text-base"><label class="card text-center p-3 rounded-xl cursor-pointer transition-all card-gender-male"><input type="radio" name="gender" value="مرد" class="gender sr-only" checked>مرد</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all card-gender-female"><input type="radio" name="gender" value="زن" class="gender sr-only">زن</label></div></div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:col-span-2"><input type="number" class="neck-input input-field" placeholder="دور گردن (cm)"><input type="number" class="waist-input input-field" placeholder="دور کمر (cm)"><div class="hip-input-container hidden"><input type="number" class="hip-input input-field w-full" placeholder="دور باسن (cm)"></div></div>
                        <div class="md:col-span-2 space-y-3"><h3 class="font-bold text-lg">سطح فعالیت روزانه</h3><div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-base"><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="activity_level" class="activity-level sr-only" value="1.2">بدون فعالیت</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="activity_level" class="activity-level sr-only" value="1.375">کم (۱-۳ روز)</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="activity_level" class="activity-level sr-only" value="1.55" checked>متوسط (۳-۵ روز)</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="activity_level" class="activity-level sr-only" value="1.725">زیاد (۶-۷ روز)</label></div></div>
                        <div class="md:col-span-2 space-y-3"><h3 class="font-bold text-lg">هدف تمرینی</h3><div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-base"><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_goal" class="training-goal sr-only" value="افزایش حجم">افزایش حجم</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_goal" class="training-goal sr-only" value="کاهش وزن">کاهش وزن</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_goal" class="training-goal sr-only" value="فیتنس">فیتنس</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_goal" class="training-goal sr-only" value="قدرت">قدرت</label></div></div>
                        <div class="md:col-span-2 space-y-3"><h3 class="font-bold text-lg">تعداد روزهای تمرین در هفته</h3><div class="grid grid-cols-3 md:grid-cols-6 gap-3 text-base"><label class="card text-center py-2 px-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_days" class="training-days sr-only" value="1">۱</label><label class="card text-center py-2 px-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_days" class="training-days sr-only" value="2">۲</label><label class="card text-center py-2 px-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_days" class="training-days sr-only" value="3">۳</label><label class="card text-center py-2 px-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_days" class="training-days sr-only" value="4" checked>۴</label><label class="card text-center py-2 px-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_days" class="training-days sr-only" value="5">۵</label><label class="card text-center py-2 px-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_days" class="training-days sr-only" value="6">۶</label></div></div>
                    </div>
                </div>
                
                <div id="section-2" class="form-section hidden card p-6">
                    <div class="flex flex-wrap gap-4 justify-between items-center mb-6 border-b border-border-primary pb-4"><h2 class="text-2xl font-bold">گام دوم: برنامه تمرینی</h2><button id="generate-ai-plan-btn" type="button" class="primary-button flex items-center gap-2"><i data-lucide="sparkles"></i>تولید برنامه با AI</button></div>
                    <div id="workout-days-container" class="space-y-6"></div>
                    <button id="add-day-btn" type="button" class="mt-6 w-full text-lg secondary-button font-bold flex items-center justify-center gap-2"><i data-lucide="plus-circle"></i> افزودن روز تمرینی</button>
                </div>
                <div id="section-3" class="form-section hidden card p-6">
                    <h2 class="text-2xl font-bold mb-2">گام سوم: برنامه مکمل‌ها</h2><p class="text-secondary mb-6">مکمل‌های پیشنهادی را برای شاگرد انتخاب کنید.</p>
                    <input type="search" id="supplement-search" placeholder="جستجوی مکمل..." class="input-field w-full mb-6">
                    <div id="supplements-container" class="space-y-6"></div>
                </div>
                <div id="section-4" class="form-section hidden card p-6">
                    <h2 class="text-2xl font-bold mb-6">گام چهارم: بازبینی و توصیه‌های نهایی</h2>
                    <div><label for="general-notes-input" class="font-bold mb-2 block">توصیه‌های کلی مربی</label><textarea id="general-notes-input" rows="6" class="input-field w-full" placeholder="مثال: حتما قبل از تمرین بدن خود را گرم کنید..."></textarea></div>
                    <div class="mt-8"><h3 class="text-xl font-bold mb-4">پیش‌نمایش برنامه</h3><div id="program-sheet-container" class="bg-primary p-2 rounded-2xl"></div></div>
                </div>
                <div id="section-5" class="form-section hidden card p-6">
                    <h2 class="text-2xl font-bold mb-6">گام پنجم: برنامه تغذیه (با هوش مصنوعی)</h2>
                    <div class="bg-tertiary p-4 rounded-xl"><p class="text-secondary text-sm">با استفاده از هوش مصنوعی یک برنامه غذایی نمونه بر اساس اطلاعات شاگرد (مانند TDEE محاسبه شده) تولید کنید. می‌توانید این برنامه را ویرایش و شخصی‌سازی کنید.</p><button id="generate-ai-nutrition-btn" type="button" class="primary-button mt-4 w-full md:w-auto flex items-center gap-2 justify-center"><i data-lucide="sparkles"></i> تولید برنامه غذایی نمونه</button></div>
                    <div id="ai-nutrition-result" class="mt-6 prose prose-sm max-w-none prose-p:my-2 prose-h4:my-3 prose-table:my-2 hidden" contenteditable="true"></div>
                    <div class="mt-8"><h3 class="text-xl font-bold mb-4">پیش‌نمایش نهایی برنامه (با تغذیه)</h3><div id="program-sheet-container-step5" class="bg-primary p-2 rounded-2xl"></div></div>
                </div>
            </div>
            
            <div class="lg:col-span-1 space-y-6 sticky top-24">
                <div class="card p-6">
                    <h3 class="text-xl font-bold mb-4 flex items-center gap-2"><i data-lucide="zap" class="text-accent"></i>عملیات</h3>
                    <div class="space-y-3">
                        <div class="grid grid-cols-3 gap-2"><button id="save-pdf-btn" type="button" class="secondary-button w-full !text-sm !px-2">ذخیره PDF</button><button id="save-image-btn" type="button" class="secondary-button w-full !text-sm !px-2">ذخیره عکس</button><button id="save-changes-btn" type="button" class="secondary-button w-full !text-sm !px-2">ذخیره تغییرات</button></div>
                        <button id="send-program-btn" type="button" class="primary-button w-full">ارسال برنامه به شاگرد</button>
                        <button id="send-nutrition-btn" type="button" class="green-button w-full hidden">ارسال تغذیه به شاگرد</button>
                    </div>
                </div>
                <div class="card p-6">
                    <h3 class="text-xl font-bold mb-4 flex items-center gap-2"><i data-lucide="bar-chart-3" class="text-accent"></i>شاخص‌های کلیدی</h3>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between items-center"><span>شاخص توده بدنی (BMI)</span><input readonly class="bmi-input input-field !p-1 !text-center w-20 font-mono"></div>
                        <div class="flex justify-between items-center"><span>متابولیسم پایه (BMR)</span><input readonly class="bmr-input input-field !p-1 !text-center w-20 font-mono"></div>
                        <div class="flex justify-between items-center"><span>کالری مصرفی روزانه (TDEE)</span><input readonly class="tdee-input input-field !p-1 !text-center w-20 font-mono"></div>
                        <div class="flex justify-between items-center"><span>درصد چربی بدن</span><input readonly class="bodyfat-input input-field !p-1 !text-center w-20 font-mono"></div>
                        <div class="flex justify-between items-center"><span>توده بدون چربی (LBM)</span><input readonly class="lbm-input input-field !p-1 !text-center w-20 font-mono"></div>
                        <div class="flex justify-between items-center"><span>وزن ایده‌آل</span><input readonly class="ideal-weight-input input-field !p-1 !text-center w-32 font-mono"></div>
                    </div>
                </div>
                 <div class="card p-6">
                    <h3 class="text-xl font-bold mb-4 flex items-center gap-2"><i data-lucide="save" class="text-accent"></i>الگوها</h3>
                    <div class="grid grid-cols-2 gap-3"><button id="save-template-btn" type="button" class="secondary-button w-full">ذخیره الگو</button><button id="load-template-btn" type="button" class="secondary-button w-full">بارگذاری الگو</button></div>
                </div>
            </div>

            <div class="lg:col-span-2 flex justify-between items-center mt-6">
                <button id="prev-btn" type="button" class="secondary-button" disabled>قبلی</button>
                <button id="next-btn" type="button" class="primary-button">بعدی</button>
            </div>
        </form>
    </main>
</div>
`;

const getUserHTML = () => `
<div id="user-dashboard-container" class="opacity-0 transition-opacity duration-500 animate-fade-in">
    <header class="bg-secondary sticky top-0 z-40 border-b border-border-primary">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <div class="flex items-center gap-3"><i data-lucide="dumbbell" class="w-8 h-8 text-accent"></i><h1 class="text-xl font-bold">FitGym Pro</h1></div>
            <div class="flex items-center gap-2 relative">
                <button id="cart-icon-btn" class="secondary-button !px-3 !py-2 relative" title="سبد خرید"><i data-lucide="shopping-cart"></i><span id="cart-item-count" class="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs rounded-full bg-red-500 text-white hidden">0</span></button>
                <div id="notification-bell-container"></div>
                <button id="theme-toggle-btn-dashboard" class="secondary-button !px-3 !py-2" title="تغییر تم"><i data-lucide="moon"></i></button>
                <button id="logout-btn-dashboard" class="secondary-button !px-3 !py-2" title="خروج"><i data-lucide="log-out"></i></button>
            </div>
        </div>
    </header>

    <main class="container mx-auto p-4 lg:p-6">
        <h1 id="dashboard-welcome-message" class="text-3xl font-bold mb-6">خوش آمدی!</h1>
        <div class="mb-6">
            <nav id="user-dashboard-tabs" class="relative flex items-center gap-2 sm:gap-4 text-sm font-semibold border-b-2 border-border-secondary">
                 <div id="tab-indicator" class="absolute bottom-[-2px] h-0.5 bg-accent transition-all duration-300 ease-out"></div>
                 <button class="user-dashboard-tab" data-tab="dashboard">
                    <i data-lucide="layout-grid"></i><span>داشبورد</span>
                 </button>
                 <button class="user-dashboard-tab" data-tab="workout">
                    <i data-lucide="clipboard-list"></i><span>برنامه من</span>
                 </button>
                 <button class="user-dashboard-tab" data-tab="nutrition">
                    <i data-lucide="utensils-crossed"></i><span>تغذیه</span>
                 </button>
                 <button class="user-dashboard-tab" data-tab="chat">
                    <i data-lucide="messages-square"></i><span>گفتگو با مربی</span>
                 </button>
                 <button class="user-dashboard-tab" data-tab="profile">
                    <i data-lucide="user-circle"></i><span>پروفایل</span>
                 </button>
                  <button class="user-dashboard-tab" data-tab="store">
                    <i data-lucide="store"></i><span>فروشگاه</span>
                 </button>
            </nav>
        </div>

        <!-- Dashboard Tab -->
        <div id="dashboard-tab-content" class="user-dashboard-tab-content">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-6">
                    <div id="dashboard-stats-grid"></div>
                    <div id="coach-message-card" class="card p-5 hidden">
                         <h3 class="font-bold text-lg flex items-center gap-2 mb-3"><i data-lucide="message-circle" class="text-accent"></i>آخرین پیام مربی</h3>
                         <div id="coach-message-content"></div>
                    </div>
                    <div id="today-focus-card" class="card p-5"></div>
                </div>
                <div class="lg:col-span-1 space-y-6">
                    <div class="card p-5">
                        <h3 class="font-bold text-lg flex items-center gap-2 mb-3"><i data-lucide="weight" class="text-accent"></i>پیگیری وزن</h3>
                        <div class="h-48 relative"><canvas id="weight-progress-chart"></canvas><p id="no-chart-data" class="absolute inset-0 flex items-center justify-center text-secondary text-sm hidden">داده کافی برای نمایش نمودار وجود ندارد.</p></div>
                        <form id="add-weight-form" class="flex gap-2 mt-4"><input id="new-weight-input" type="number" step="0.1" class="input-field flex-1" placeholder="وزن امروز (kg)"><button type="submit" class="primary-button">ثبت</button></form>
                    </div>
                    <div class="card p-5">
                         <h3 class="font-bold text-lg flex items-center gap-2 mb-3"><i data-lucide="history" class="text-accent"></i>تاریخچه تمرینات</h3>
                         <div id="workout-history-container" class="space-y-2 max-h-60 overflow-y-auto pr-1"></div>
                    </div>
                     <div class="card p-5">
                         <h3 class="font-bold text-lg flex items-center gap-2 mb-3"><i data-lucide="receipt" class="text-accent"></i>تاریخچه خرید پلن</h3>
                         <div id="subscription-history-container" class="space-y-2 max-h-40 overflow-y-auto pr-1"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Workout Tab -->
        <div id="workout-tab-content" class="user-dashboard-tab-content hidden">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div class="lg:col-span-1 space-y-6">
                     <div class="card p-5">
                         <h3 class="font-bold text-lg flex items-center gap-2 mb-3"><i data-lucide="calendar-days" class="text-accent"></i>برنامه هفتگی</h3>
                         <div id="program-weekly-view" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3"></div>
                     </div>
                     <div class="card p-5 flex flex-col items-center justify-center gap-4 text-center">
                         <h3 class="font-bold text-lg">صادرات برنامه</h3>
                         <p class="text-sm text-secondary">برنامه تمرینی خود را به صورت فایل PDF یا عکس ذخیره کنید.</p>
                         <div class="flex gap-3">
                            <button id="dashboard-save-pdf-btn" class="secondary-button flex items-center gap-2"><i data-lucide="file-down"></i>PDF</button>
                            <button id="dashboard-save-image-btn" class="secondary-button flex items-center gap-2"><i data-lucide="image"></i>عکس</button>
                         </div>
                     </div>
                 </div>
                 <div class="lg:col-span-2">
                    <div id="dashboard-program-view" class="bg-white text-gray-800 p-2 rounded-2xl"></div>
                 </div>
            </div>
        </div>

        <!-- Nutrition Tab -->
        <div id="nutrition-tab-content" class="user-dashboard-tab-content hidden">
             <div id="dashboard-nutrition-view" class="prose prose-sm max-w-none prose-p:my-2 prose-h4:my-3 prose-table:my-2 bg-white text-gray-800 p-6 rounded-2xl"></div>
        </div>

        <!-- Chat Tab -->
        <div id="chat-tab-content" class="user-dashboard-tab-content hidden">
             <div class="card max-w-3xl mx-auto flex flex-col h-[70vh]">
                 <div id="coach-chat-messages" class="flex-1 p-4 space-y-4 overflow-y-auto"></div>
                 <form id="coach-chat-form" class="p-4 border-t border-border-primary flex items-center gap-3">
                    <input id="coach-chat-input" class="input-field flex-1" placeholder="پیام خود را بنویسید...">
                    <button type="submit" class="primary-button !py-2.5 !px-5"><i data-lucide="send"></i></button>
                 </form>
             </div>
        </div>
        
        <!-- Profile Tab -->
        <div id="profile-tab-content" class="user-dashboard-tab-content hidden">
            <div id="profile-completion-notice" class="mb-6 p-4 rounded-xl bg-yellow-500/10 text-yellow-accent flex items-start gap-3">
                 <i data-lucide="alert-triangle" class="w-8 h-8 flex-shrink-0"></i>
                 <div>
                    <h3 class="font-bold">پروفایل شما نیاز به تکمیل و تایید دارد!</h3>
                    <p class="text-sm">لطفا اطلاعات زیر را با دقت بررسی کرده و در صورت نیاز ویرایش کنید. پس از اطمینان از صحت اطلاعات، دکمه "تایید" را بزنید. تا زمانی که اطلاعات خود را تایید نکنید، مربی قادر به طراحی برنامه برای شما نخواهد بود.</p>
                 </div>
            </div>
             <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                 <div class="lg:col-span-2 card p-6" id="dashboard-profile-panel">
                     <h2 class="text-2xl font-bold mb-6">اطلاعات شما</h2>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <label class="relative group cursor-pointer"><img class="profile-pic-preview w-24 h-24 rounded-full object-cover border-4 border-border-primary"><div class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><i data-lucide="camera" class="w-8 h-8 text-white"></i></div><input type="file" class="profile-pic-input hidden" accept="image/*"></label>
                            <div class="sm:col-span-2 space-y-4">
                                <input type="text" readonly class="client-name-input input-field w-full text-lg !bg-tertiary cursor-not-allowed" placeholder="نام و نام خانوادگی">
                                <input type="email" class="client-email-input input-field w-full" placeholder="ایمیل شما">
                            </div>
                        </div>
                        <div class="space-y-4"><label class="font-semibold">قد (cm): <span>180</span></label><input type="range" min="140" max="220" value="180" class="range-slider height-slider"></div>
                        <div class="space-y-4"><label class="font-semibold">وزن (kg): <span>80</span></label><input type="range" min="40" max="150" value="80" step="0.5" class="range-slider weight-slider"></div>
                         <div class="space-y-4"><label class="font-semibold">سن: <span>25</span></label><input type="range" min="15" max="80" value="25" class="range-slider age-slider"></div>
                        <div class="space-y-2"><h3 class="font-bold text-lg">جنسیت</h3><div class="grid grid-cols-2 gap-3 text-base"><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="gender_user" value="مرد" class="gender sr-only">مرد</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="gender_user" value="زن" class="gender sr-only">زن</label></div></div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:col-span-2"><input type="number" class="neck-input input-field" placeholder="دور گردن (cm)"><input type="number" class="waist-input input-field" placeholder="دور کمر (cm)"><div class="hip-input-container"><input type="number" class="hip-input input-field" placeholder="دور باسن (cm)"></div></div>
                        <div class="md:col-span-2 space-y-3"><h3 class="font-bold text-lg">هدف تمرینی</h3><div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-base"><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_goal_user" class="training-goal sr-only" value="افزایش حجم">افزایش حجم</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_goal_user" class="training-goal sr-only" value="کاهش وزن">کاهش وزن</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_goal_user" class="training-goal sr-only" value="فیتنس">فیتنس</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_goal_user" class="training-goal sr-only" value="قدرت">قدرت</label></div></div>
                        <div class="md:col-span-2 space-y-3"><h3 class="font-bold text-lg">سطح فعالیت روزانه</h3><div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-base"><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="activity_level_user" class="activity-level sr-only" value="1.2">بدون فعالیت</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="activity_level_user" class="activity-level sr-only" value="1.375">کم</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="activity_level_user" class="activity-level sr-only" value="1.55">متوسط</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="activity_level_user" class="activity-level sr-only" value="1.725">زیاد</label></div></div>
                        <div class="md:col-span-2 space-y-3"><h3 class="font-bold text-lg">تعداد روزهای تمرین</h3><div class="grid grid-cols-3 md:grid-cols-6 gap-3 text-base"><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_days_user" class="training-days sr-only" value="2">۲</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_days_user" class="training-days sr-only" value="3">۳</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_days_user" class="training-days sr-only" value="4">۴</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_days_user" class="training-days sr-only" value="5">۵</label><label class="card text-center p-3 rounded-xl cursor-pointer transition-all"><input type="radio" name="training_days_user" class="training-days sr-only" value="6">۶</label></div></div>
                        <div class="md:col-span-2"><button id="confirm-info-btn" type="button" class="w-full mt-4 font-bold text-lg flex items-center justify-center gap-2 border-2 !border-blue-500/30 !bg-blue-500/10 !text-accent hover:!bg-blue-500/20 transition-colors py-3 rounded-xl">تایید و قفل کردن اطلاعات</button></div>
                     </div>
                 </div>
                 <div class="lg:col-span-1 space-y-6">
                    <div class="card p-6">
                        <h3 class="text-xl font-bold mb-4">وضعیت شما</h3>
                        <div id="dashboard-status-container" class="space-y-3"></div>
                    </div>
                     <div class="card p-6">
                        <h3 class="text-xl font-bold mb-4">شاخص‌های بدنی</h3>
                         <div class="space-y-3 text-sm">
                            <div class="flex justify-between items-center"><span>BMI</span><input readonly class="bmi-input input-field !p-1 !text-center w-20 font-mono"></div>
                            <div class="flex justify-between items-center"><span>BMR</span><input readonly class="bmr-input input-field !p-1 !text-center w-20 font-mono"></div>
                            <div class="flex justify-between items-center"><span>TDEE</span><input readonly class="tdee-input input-field !p-1 !text-center w-20 font-mono"></div>
                            <div class="flex justify-between items-center"><span>Body Fat %</span><input readonly class="bodyfat-input input-field !p-1 !text-center w-20 font-mono"></div>
                            <div class="flex justify-between items-center"><span>وزن ایده‌آل</span><input readonly class="ideal-weight-input input-field !p-1 !text-center w-32 font-mono"></div>
                        </div>
                     </div>
                 </div>
            </div>
        </div>

         <!-- Store Tab -->
        <div id="store-tab-content" class="user-dashboard-tab-content hidden">
            <div id="waiting-for-plan-notice-container-store"></div>
            <div class="space-y-6">
                <h2 class="text-3xl font-bold">پلن‌های تمرینی و غذایی</h2>
                <p class="text-secondary max-w-2xl">با انتخاب یکی از پلن‌های زیر، اولین قدم را برای رسیدن به اهداف خود بردارید. مربیان ما بر اساس اطلاعات پروفایل شما، بهترین برنامه را طراحی خواهند کرد.</p>
                <div id="store-plans-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Plans will be rendered here -->
                </div>
            </div>
        </div>
    </main>

     <!-- Floating Action Button for AI Chat -->
    <button id="open-ai-chat-btn" class="fixed bottom-6 left-6 primary-button !rounded-full !p-4 shadow-lg animate-bounce" title="دستیار هوشمند فیت‌بات">
        <i data-lucide="bot" class="w-8 h-8"></i>
    </button>
</div>
`;

document.addEventListener("DOMContentLoaded", () => {
    seedInitialUsers();
    renderApp();
    initCommonListeners();

    // Theme toggling logic
    const themeToggleBtnDashboard = document.getElementById('theme-toggle-btn-dashboard');
    const updateThemeIcon = (theme) => {
        const icon = themeToggleBtnDashboard?.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
            window.lucide?.createIcons();
        }
    };

    if (themeToggleBtnDashboard) {
        updateThemeIcon(localStorage.getItem('fitgympro_theme') || 'dark');
        themeToggleBtnDashboard.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('fitgympro_theme', newTheme);
            updateThemeIcon(newTheme);
            // Re-render chart if visible
            if (f && D(f).weightHistory && document.getElementById('dashboard-tab-content')?.offsetParent) {
                 Xe(D(f).weightHistory, "weight-progress-chart", "no-chart-data");
            }
        });
    }
});
