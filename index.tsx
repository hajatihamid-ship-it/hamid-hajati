

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
        return a.integrity && (n.integrity = a.integrity), a.referrerPolicy && (n.referrerPolicy = a.referrerPolicy as ReferrerPolicy), a.crossOrigin === "use-credentials" ? n.credentials = "include" : a.crossOrigin === "anonymous" ? n.credentials = "omit" : n.credentials = "same-origin", n
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
window.exerciseDB = we;
let F = 1;
const ue = 5;
let f: string | null = null,
    X: GoogleGenAI, ve: any = null,
    adminChartInstance: any = null,
    currentChatSession: Chat | null = null;
const V = document.getElementById("user-selection-screen")!,
    me = document.getElementById("main-app-container")!,
    oe = document.getElementById("user-dashboard-container")!,
    U = document.getElementById("admin-panel-modal")!,
    je = document.getElementById("admin-panel-btn")!,
    A = e => {
        if (typeof e !== 'string') return '';
        const t = document.createElement("div");
        return t.textContent = e, t.innerHTML
    },
    w = (e, t = "success") => {
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
    },
    ie = (e: HTMLInputElement) => {
        if (!e) return;
        const t = +e.min || 0,
            s = +e.max || 100,
            a = ((+e.value || 0) - t) / (s - t) * 100;
        let n = "var(--accent)";
        e.classList.contains("rep-slider") && (n = "var(--green-accent)"), e.classList.contains("rest-slider") && (n = "var(--purple-accent)"), e.classList.contains("age-slider") && (n = "var(--orange-accent)"), e.classList.contains("height-slider") && (n = "var(--pink-accent)"), e.classList.contains("weight-slider") && (n = "var(--yellow-accent)");
        const o = getComputedStyle(document.documentElement).getPropertyValue("--range-track-bg").trim();
        e.style.background = `linear-gradient(to left, ${n} ${a}%, ${o} ${a}%)`
    },
    Re = (e, t) => {
        let s = e + t;
        return s > 0 && s <= ue ? s : e
    },
    _e = () => {
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
    },
    ne = e => {
        var t;
        e > 0 && e <= ue && (F = e, _e(), (t = document.getElementById("program-builder-form")) == null || t.scrollIntoView({
            behavior: "smooth",
            block: "start"
        }))
    },
    et = e => {
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
    },
    he = e => {
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
    },
    xe = e => {
        const t = e.querySelector(".hip-input-container");
        if (!t) return;
        const s = e.querySelector('input[name^="gender"][value="مرد"]') as HTMLInputElement;
        t.classList.toggle("hidden", s?.checked ?? false), he(e)
    },
    tt = e => {
        e.innerHTML = "", Object.keys(we).forEach(t => {
            const s = document.createElement("option");
            s.value = t, s.textContent = t, e.appendChild(s)
        })
    },
    pe = (e, t) => {
        t.innerHTML = "", (we[e] || []).forEach(s => {
            const r = document.createElement("option");
            r.value = s, r.textContent = s, t.appendChild(r)
        })
    },
    ge = e => {
        const t = (document.getElementById("exercise-template") as HTMLTemplateElement).content.cloneNode(!0) as DocumentFragment,
            s = t.querySelector(".muscle-group-select") as HTMLSelectElement;
        tt(s), pe(s.value, t.querySelector(".exercise-select") as HTMLSelectElement), e.appendChild(t), e.querySelectorAll(".range-slider").forEach(r => ie(r as HTMLInputElement)), window.lucide?.createIcons()
    },
    re = (e = !1) => {
        const t = document.getElementById("workout-days-container")!.children.length + 1,
            s = document.createElement("div");
        s.className = "card day-card", s.innerHTML = `<div class="flex justify-between items-center p-4 bg-tertiary/50 rounded-t-2xl border-b border-border-secondary"><div class="flex items-center gap-3"><i data-lucide="calendar-days" class="text-yellow-400"></i><input type="text" value="روز ${t}: " class="day-title-input input-field font-bold text-lg bg-transparent border-0 p-1 focus:ring-0 focus:border-yellow-400 w-auto"></div> ${e?"":'<button type="button" class="remove-day-btn p-1 text-secondary hover:text-red-400"><i data-lucide="x-circle" class="w-5 h-5"></i></button>'}</div><div class="p-4 space-y-3"><div class="exercise-list space-y-3"></div><button type="button" class="add-exercise-btn mt-2 w-full text-sm text-yellow-400 font-semibold hover:bg-yellow-400/10 py-2.5 px-4 rounded-xl border-2 border-dashed border-yellow-400/30 transition-all flex items-center justify-center gap-2"><i data-lucide="plus"></i> افزودن حرکت</button></div><div class="p-4 border-t border-border-primary/50"><label class="font-semibold text-sm text-secondary mb-2 block">یادداشت‌های مربی</label><textarea class="day-notes-input input-field text-sm bg-tertiary/80" rows="2" placeholder="مثال: روی فرم صحیح حرکت تمرکز کنید..."></textarea></div>`, document.getElementById("workout-days-container")!.appendChild(s), ge(s.querySelector(".exercise-list") as HTMLDivElement), window.lucide?.createIcons()
    },
    st = () => {
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
    const d = `<header class="page-header flex justify-between items-start mb-6"><div class="flex items-center gap-3"><span class="font-bold text-2xl" style="color: #007AFF;">FitGym Pro</span></div><img src="${m}" alt="Profile" class="w-20 h-20 rounded-full object-cover border-4 border-gray-100"></header><div class="mb-6"><h2 class="text-3xl font-extrabold text-gray-900 mb-2">${n}</h2><p class="text-gray-500">تهیه شده در تاریخ: ${new Date().toLocaleDateString("fa-IR")}</p></div>`;
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
                ee = _.isSuperset,
                ce = ee && (j === 0 || !K[j - 1].isSuperset);
            M += `<tr class="${ee?"superset-group-pro":""}"><td>${ce?'<span class="superset-label-pro">سوپرست</span>':""}${A(_.exercise)}</td><td>${A(_.sets)}</td><td>${A(_.reps)}</td><td>${A(_.rest)}s</td></tr>`
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
    if (f === "admin") {
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
        
        const clientNameElement = document.querySelector(f === "admin" ? "#client-name-input" : "#dashboard-profile-panel .client-name-input") as HTMLInputElement;

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

    t.classList.add("is-loading");
    t.disabled = true;

    if (!window.html2canvas) {
        w("کتابخانه مورد نیاز برای ساخت تصویر بارگیری نشده‌ است.", "error");
        t.classList.remove("is-loading");
        t.disabled = false;
        return;
    }

    let s;
    if (f === "admin") {
        const previewContainerSelector = "#program-sheet-container";
        Ue(ye(), previewContainerSelector); // Ensure latest data is rendered
        s = `${previewContainerSelector} .program-page`;
    } else {
        s = "#dashboard-program-view .program-page";
    }

    const r = document.querySelector(s) as HTMLElement;
    if (!r) {
        w("محتوایی برای ساخت تصویر وجود ندارد.", "error");
        t.classList.remove("is-loading");
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

        const clientNameElement = document.querySelector(f === "admin" ? "#client-name-input" : "#dashboard-profile-panel .client-name-input") as HTMLInputElement;
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
        t.classList.remove("is-loading");
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
    Ge = e => localStorage.setItem("fitgympro_users", JSON.stringify(e)),
    D = e => {
        try {
            return JSON.parse(localStorage.getItem(`fitgympro_data_${e}`) || "{}");
        } catch (t) {
            console.error(`Error parsing data for user ${e}:`, t);
            return {};
        }
    },
    W = (e, t) => localStorage.setItem(`fitgympro_data_${e}`, JSON.stringify(t)),
    ze = () => {
        try {
            return JSON.parse(localStorage.getItem("fitgympro_activity_log") || "[]");
        } catch (e) {
            console.error("Error parsing activity log from localStorage:", e);
            return [];
        }
    },
    ae = e => {
        let t = ze();
        t.unshift({
            message: e,
            date: new Date().toISOString()
        }), t.length > 20 && (t = t.slice(0, 20)), localStorage.setItem("fitgympro_activity_log", JSON.stringify(t))
    };
const ht = () => {
        try {
            return JSON.parse(localStorage.getItem("fitgympro_templates") || "{}");
        } catch (e) {
            console.error("Error parsing templates from localStorage:", e);
            return {};
        }
    },
    xt = e => localStorage.setItem("fitgympro_templates", JSON.stringify(e)),
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
    
    let unit = "";
    if (slider.classList.contains("height-slider")) {
        unit = " cm";
    } else if (slider.classList.contains("weight-slider")) {
        unit = " kg";
    }
    
    span.textContent = slider.value + unit;
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

function Oe() {
    f = "admin", localStorage.setItem("fitgympro_last_user", "admin"), Je({
        step1: {
            coachName: "مربی فیت‌جیم‌پرو"
        },
        step2: {
            days: []
        },
        step3: {
            supplements: []
        },
        step4: {},
        step5: {}
    }), document.getElementById("current-user-name")!.textContent = "Admin";
    const e = document.getElementById("current-user-display")!;
    e.classList.remove("hidden"), e.classList.add("flex"), document.getElementById("logout-btn")!.classList.remove("hidden"), je.classList.remove("hidden"), V.classList.add("opacity-0"), setTimeout(() => V.classList.add("hidden"), 300), me.classList.remove("hidden"), setTimeout(() => me.classList.remove("opacity-0"), 50)
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
        let m = null;
        if (t === "weight-progress-chart") m = ve;
        if (t.startsWith("admin")) m = adminChartInstance;
        m && m.destroy();
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
        if (t === "weight-progress-chart") ve = L;
        if (t.startsWith("admin")) adminChartInstance = L
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
    const notice = document.getElementById('profile-completion-notice');
    if (notice) notice.classList.toggle('hidden', !!userData.infoConfirmed);
    
    const confirmBtn = document.getElementById('confirm-info-btn') as HTMLButtonElement;
    if (confirmBtn) {
        confirmBtn.disabled = !!userData.infoConfirmed;
        confirmBtn.innerHTML = userData.infoConfirmed ? '<i data-lucide="check-circle" class="w-5 h-5"></i> اطلاعات شما تایید شده است' : 'تایید و قفل کردن اطلاعات';
        if (userData.infoConfirmed) {
            confirmBtn.classList.remove('!border-blue-500/30', '!bg-blue-500/10', '!text-accent', 'hover:!bg-blue-500/20');
            confirmBtn.classList.add('!border-green-500/30', '!bg-green-500/10', '!text-green-accent', 'cursor-not-allowed');
        }
    }


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
    const subSelectionContainer = document.getElementById("subscription-selection-container"),
        hasUnfulfilledPurchase = latestPurchase && latestPurchase.fulfilled === !1;
    if (subSelectionContainer) subSelectionContainer.classList.toggle("hidden", hasUnfulfilledPurchase);
    if (hasUnfulfilledPurchase) {
        const c = document.getElementById("waiting-for-plan-notice-container")!;
        c.innerHTML = `<div class="card p-6 text-center bg-blue-500/10 text-accent rounded-2xl"><i data-lucide="info" class="w-8 h-8 mx-auto mb-3"></i><p class="font-bold">شما یک پلن در انتظار آماده‌سازی توسط مربی دارید.</p><p class="text-sm text-secondary">به محض آماده شدن به شما اطلاع‌رسانی خواهد شد.</p></div>`
    }
    window.lucide?.createIcons();


    const d = userData.step1 || {};
    const profilePanel = document.getElementById("dashboard-profile-panel")!;
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

function de(e, t) {
    document.getElementById("dashboard-welcome-message")!.textContent = `خوش آمدی، ${e}!`;
    
    renderDashboardTab(e, t);
    renderWorkoutTab(t);
    renderNutritionTab(t);
    renderChatTab(e, t);
    renderProfileTab(e, t);
    renderContactTab(e, t);
    
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

function fe(e) {
    f = e, localStorage.setItem("fitgympro_last_user", e);
    const t = D(e);
    t.step1 || (t.step1 = {
        clientName: e
    }, W(e, t)), de(e, t), document.getElementById("ai-chat-fab")?.classList.remove("hidden"), V.classList.add("opacity-0"), setTimeout(() => V.classList.add("hidden"), 300), oe.classList.remove("hidden"), setTimeout(() => oe.classList.remove("opacity-0"), 50)
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
    if (t && f !== "admin") {
        const s = D(t);
        if (e === "dashboard") {
            Xe(s.weightHistory, "weight-progress-chart", "no-chart-data");
        }
    }
};

const switchAuthForm = (formToShow: 'login' | 'signup' | 'forgot-password', isInitial: boolean = false) => {
    const loginContainer = document.getElementById("login-form-container")!;
    const signupContainer = document.getElementById("signup-form-container")!;
    const forgotPasswordContainer = document.getElementById("forgot-password-form-container")!;
    
    const loginForm = document.getElementById("login-form") as HTMLFormElement;
    const signupForm = document.getElementById("signup-form") as HTMLFormElement;
    const forgotPasswordForm = document.getElementById("forgot-password-form") as HTMLFormElement;

    const containers = [loginContainer, signupContainer, forgotPasswordContainer];
    
    containers.forEach(c => {
        if (isInitial) {
            c.style.transition = 'none';
        } else {
            c.style.transition = ''; // Re-enable transitions
        }
    });

    loginContainer.classList.toggle('is-inactive', formToShow !== 'login');
    signupContainer.classList.toggle('is-inactive', formToShow !== 'signup');
    forgotPasswordContainer.classList.toggle('is-inactive', formToShow !== 'forgot-password');

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

    if (isInitial) {
        setTimeout(() => {
            containers.forEach(c => c.style.transition = '');
        }, 50);
    }
};


function We() {
    var e, t;
    f = null, localStorage.removeItem("fitgympro_last_user"), document.getElementById("ai-chat-fab")?.classList.add("hidden"), me.classList.add("opacity-0"), oe.classList.add("opacity-0"), setTimeout(() => {
        me.classList.add("hidden"), oe.classList.add("hidden"), V.classList.remove("hidden"), setTimeout(() => {
            V.classList.remove("opacity-0")
        }, 50)
    }, 300), switchAuthForm("login", true), (e = document.getElementById("login-form")) == null || e.reset(), (t = document.getElementById("signup-form")) == null || t.reset()
}
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
    const e = document.getElementById("admin-user-list")!,
        t = (document.getElementById("admin-user-search") as HTMLInputElement).value.toLowerCase(),
        s = ((a = document.querySelector("#user-filter-btn-group .user-filter-btn.active")) == null ? void 0 : a.getAttribute("data-filter")) || "all";
    if (!e) return;
    let r = O().filter(n => n.username !== "admin");
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
    const e = O().filter(o => o.username !== "admin"),
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
    e.classList.remove("hidden");
    setTimeout(() => {
        e.classList.add("active", "opacity-100", "pointer-events-auto");
        e.querySelector('.card')?.classList.remove('scale-95');
    }, 10)
}, closeModal = e => {
    e.classList.remove("active", "opacity-100", "pointer-events-auto");
    e.querySelector('.card')?.classList.add('scale-95');
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

const switchAdminPanelTab = (tabName) => {
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.toggle('hidden', content.id !== `admin-${tabName}-content`);
    });

    const titles = {
        dashboard: 'داشبورد مدیریت',
        clients: 'مدیریت شاگردان',
        conversations: 'گفتگو با شاگردان',
        templates: 'مدیریت الگوها'
    };
    (document.getElementById('admin-title-text') as HTMLElement).textContent = titles[tabName] || 'پنل مدیریت';

    // Refresh content when tab is switched
    if (tabName === 'dashboard') be();
    if (tabName === 'clients') se();
    if (tabName === 'conversations') renderAdminConversationsList();
    if (tabName === 'templates') renderAdminTemplates();
};

const renderAdminTemplates = () => {
    const container = document.getElementById('admin-template-list')!;
    const templates = ht();
    const templateNames = Object.keys(templates);
    container.innerHTML = '';

    if (templateNames.length === 0) {
        container.innerHTML = `<p class="text-secondary text-center p-4">هیچ الگوی ذخیره شده‌ای وجود ندارد.</p>`;
        return;
    }

    templateNames.forEach(name => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center bg-tertiary/50 p-3 rounded-lg';
        div.innerHTML = `
            <span class="font-semibold">${A(name)}</span>
            <button class="delete-template-btn text-red-500 hover:bg-red-500/10 p-2 rounded-md" data-name="${A(name)}" title="حذف الگو">
                <i data-lucide="trash-2" class="w-5 h-5"></i>
            </button>
        `;
        container.appendChild(div);
    });
    window.lucide?.createIcons();
};

const renderAdminConversationsList = () => {
    const container = document.getElementById('admin-conversations-user-list')!;
    const usersWithChat = O()
        .filter(u => u.username !== 'admin')
        .map(u => ({ username: u.username, data: D(u.username) }))
        .filter(u => u.data.chatHistory && u.data.chatHistory.length > 0)
        .sort((a, b) => {
             // Prioritize users with new messages
            if (a.data.hasNewMessageForCoach && !b.data.hasNewMessageForCoach) return -1;
            if (!a.data.hasNewMessageForCoach && b.data.hasNewMessageForCoach) return 1;
            // Then sort by most recent message
            const lastMsgA = a.data.chatHistory.slice(-1)[0];
            const lastMsgB = b.data.chatHistory.slice(-1)[0];
            return new Date(lastMsgB.date).getTime() - new Date(lastMsgA.date).getTime();
        });

    container.innerHTML = '';
    if (usersWithChat.length === 0) {
        container.innerHTML = `<p class="text-secondary text-center p-4">هیچ گفتگویی یافت نشد.</p>`;
        return;
    }

    usersWithChat.forEach(({ username, data }) => {
        const lastMessage = data.chatHistory.slice(-1)[0];
        const div = document.createElement('div');
        div.className = 'conversation-item p-4 border-b border-border-primary cursor-pointer hover:bg-tertiary';
        div.dataset.username = username;
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-bold">${A(username)}</span>
                ${data.hasNewMessageForCoach ? '<span class="w-3 h-3 bg-accent rounded-full"></span>' : ''}
            </div>
            <p class="text-sm text-secondary truncate">${A(lastMessage.message)}</p>
        `;
        container.appendChild(div);
    });
};

const renderAdminConversation = (username) => {
    const container = document.getElementById('admin-conversation-details')!;
    const userData = D(username);
    
    // Clear new message flag
    if (userData.hasNewMessageForCoach) {
        delete userData.hasNewMessageForCoach;
        W(username, userData);
        renderAdminConversationsList(); // Refresh list to remove dot
    }

    container.innerHTML = `
        <header class="p-4 border-b border-border-primary flex-shrink-0">
            <h3 class="font-bold text-lg">${A(username)}</h3>
        </header>
        <div id="admin-chat-history" class="flex-1 p-4 space-y-4 overflow-y-auto flex flex-col">
            <!-- Messages will be injected here -->
        </div>
        <form id="admin-chat-form" class="p-4 border-t border-border-primary flex items-center gap-2 flex-shrink-0">
            <input id="admin-chat-input" type="text" class="input-field flex-1" placeholder="پاسخ به ${A(username)}..." required>
            <button type="submit" class="primary-button !rounded-full !p-3"><i data-lucide="send"></i></button>
        </form>
    `;
    
    const messagesContainer = document.getElementById('admin-chat-history')!;
    const chatHistory = userData.chatHistory || [];
    
    chatHistory.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${msg.sender === 'user' ? 'user-message' : 'coach-message'}`;
        messageEl.textContent = msg.message;
        messagesContainer.appendChild(messageEl);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    document.getElementById('admin-chat-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('admin-chat-input') as HTMLInputElement;
        const message = input.value.trim();
        if (!message) return;

        const allUserData = D(username);
        if (!allUserData.chatHistory) allUserData.chatHistory = [];
        
        allUserData.chatHistory.push({ sender: 'coach', message, date: new Date().toISOString() });
        allUserData.newMessageFromCoach = true; // Flag for user notification
        
        W(username, allUserData);
        input.value = '';
        renderAdminConversation(username); // Re-render the chat view
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const S = document.documentElement.getAttribute("data-theme"),
        T = document.getElementById("theme-toggle-btn-dashboard");
    localStorage.getItem("fitgympro_theme") === "dark" || !("fitgympro_theme" in localStorage) && S === "dark" ? (document.documentElement.setAttribute("data-theme", "dark"), T && (T.innerHTML = '<i data-lucide="sun"></i>')) : (document.documentElement.setAttribute("data-theme", "light"), T && (T.innerHTML = '<i data-lucide="moon"></i>'));
    window.lucide?.createIcons();
    const Y = e => {
        const t = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", t), localStorage.setItem("fitgympro_theme", t);
        const s = e.currentTarget as HTMLButtonElement;
        s.innerHTML = t === "dark" ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>', window.lucide?.createIcons();
        const r = D(f);
        t && f !== "admin" && (Xe(r.weightHistory, "weight-progress-chart", "no-chart-data"))
    };
    T?.addEventListener("click", Y);
    const Z = localStorage.getItem("fitgympro_last_user");
    Z ? Z === "admin" ? Oe() : fe(Z) : switchAuthForm("login", !0);
    const te = document.getElementById("login-form") as HTMLFormElement,
        p = document.getElementById("signup-form") as HTMLFormElement,
        H = document.getElementById("login-coach-btn");
    
    te.addEventListener("submit", e => {
        e.preventDefault();
        const form = e.target as HTMLFormElement,
            card = form.closest(".card") as HTMLElement | null,
            submitBtn = document.getElementById("login-client-btn") as HTMLButtonElement,
            username = (document.getElementById("login-username") as HTMLInputElement).value.trim(),
            password = (document.getElementById("login-password") as HTMLInputElement).value;
            
        card?.classList.remove("shake-animation");

        if (!username || !password) {
            w("نام کاربری و رمز عبور الزامی است.", "error");
            void card?.offsetWidth;
            card?.classList.add("shake-animation");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.classList.add("is-loading");
        submitBtn.textContent = "در حال ورود...";

        setTimeout(() => {
            try {
                const user = O().find(u => u.username === username && u.password === password);
                if (user) {
                    fe(username);
                } else {
                    w("نام کاربری یا رمز عبور نامعتبر است.", "error");
                    void card?.offsetWidth;
                    card?.classList.add("shake-animation");
                    submitBtn.disabled = false;
                    submitBtn.classList.remove("is-loading");
                    submitBtn.textContent = "ورود به پنل شاگرد";
                }
            } catch (err) {
                console.error("Login error:", err);
                w("خطایی در هنگام ورود رخ داد.", "error");
                submitBtn.disabled = false;
                submitBtn.classList.remove("is-loading");
                submitBtn.textContent = "ورود به پنل شاگرد";
            }
        }, 500);
    });
    
    p.addEventListener("submit", async e => {
        e.preventDefault();
        const form = e.target as HTMLFormElement,
            card = form.closest(".card") as HTMLElement | null;
        card?.classList.remove("shake-animation");

        const usernameInput = document.getElementById("signup-username") as HTMLInputElement,
            emailInput = document.getElementById("signup-email") as HTMLInputElement,
            passwordInput = document.getElementById("signup-password") as HTMLInputElement;
        
        form.querySelectorAll("input").forEach(clearValidationError);

        let hasError = false;
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (username.length < 3) {
            showValidationError(usernameInput, "نام کاربری باید حداقل ۳ کاراکتر باشد.");
            hasError = true;
        }

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            showValidationError(emailInput, "لطفاً یک ایمیل معتبر وارد کنید.");
            hasError = true;
        }

        if (password.length < 6) {
            showValidationError(passwordInput, "رمز عبور باید حداقل ۶ کاراکتر باشد.");
            hasError = true;
        }

        // Check for duplicates before showing loading state
        const users = O();
        if (users.some(u => u.username === username)) {
            showValidationError(usernameInput, "این نام کاربری قبلا استفاده شده است.");
            hasError = true;
        }
        if (users.some(u => u.email === email)) {
            showValidationError(emailInput, "این ایمیل قبلا ثبت نام کرده است.");
            hasError = true;
        }
        
        if (hasError) {
            void card?.offsetWidth;
            card?.classList.add("shake-animation");
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add("is-loading");
            submitBtn.innerHTML = "در حال بررسی...";
        }

        setTimeout(() => {
            try {
                const currentUsers = O();
                // Re-check for duplicates inside timeout to be extra safe
                if (currentUsers.some(u => u.username === username)) {
                    showValidationError(usernameInput, "این نام کاربری قبلا استفاده شده است.");
                    throw new Error("Duplicate username");
                }
                if (currentUsers.some(u => u.email === email)) {
                    showValidationError(emailInput, "این ایمیل قبلا ثبت نام کرده است.");
                    throw new Error("Duplicate email");
                }

                const newUser = { username, email, password };
                currentUsers.push(newUser);
                Ge(currentUsers); // Save users
                W(newUser.username, { // Save user data
                    joinDate: new Date().toISOString(),
                    step1: { clientName: newUser.username, clientEmail: newUser.email }
                });
                fe(newUser.username); // Log in
            } catch (err) {
                console.error("Signup failed:", err);
                 if (String(err).indexOf("Duplicate") === -1) {
                    w("ثبت نام ناموفق بود. لطفاً دوباره تلاش کنید.", "error");
                }
                void card?.offsetWidth;
                card?.classList.add("shake-animation");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove("is-loading");
                    submitBtn.innerHTML = "ثبت نام";
                }
            }
        }, 500);
    });

    H?.addEventListener("click", () => {
        const e = (document.getElementById("login-username") as HTMLInputElement).value.trim(),
            t = (document.getElementById("login-password") as HTMLInputElement).value;
        e === "admin66" && t === "adminpass" ? Oe() : w("نام کاربری یا رمز عبور مربی نامعتبر است.", "error")
    });
    document.getElementById("switch-to-signup-btn")?.addEventListener("click", () => switchAuthForm("signup"));
    document.getElementById("switch-to-login-btn")?.addEventListener("click", () => switchAuthForm("login"));
    document.getElementById("switch-to-forgot-btn")?.addEventListener("click", () => switchAuthForm("forgot-password"));
    document.getElementById("switch-back-to-login-btn")?.addEventListener("click", () => switchAuthForm("login"));
    document.getElementById("forgot-password-form")?.addEventListener("submit", e => {
        e.preventDefault();
        const t = (document.getElementById("forgot-email") as HTMLInputElement).value.trim();
        t ? (w("لینک بازیابی به ایمیل شما ارسال شد (شبیه‌سازی).", "success"), switchAuthForm("login")) : w("لطفا ایمیل خود را وارد کنید.", "error")
    });
    document.querySelectorAll(".password-toggle").forEach(e => {
        e.addEventListener("click", () => {
            const t = document.getElementById(e.getAttribute("data-target")) as HTMLInputElement,
                s = e.querySelector("i");
            t.type === "password" ? (t.type = "text", s.setAttribute("data-lucide", "eye-off")) : (t.type = "password", s.setAttribute("data-lucide", "eye")), window.lucide?.createIcons()
        })
    });
    document.getElementById("logout-btn")?.addEventListener("click", We);
    document.getElementById("logout-btn-dashboard")?.addEventListener("click", We);
    st();
    document.getElementById("add-day-btn")?.addEventListener("click", () => re());
    document.getElementById("program-builder-form")?.addEventListener("click", e => {
        const t = e.target as HTMLElement;
        if (t.closest(".add-exercise-btn")) {
            const r = t.closest(".day-card")?.querySelector(".exercise-list");
            r && ge(r as HTMLDivElement)
        }
        if (t.closest(".remove-exercise-btn")) t.closest(".exercise-row")?.remove();
        if (t.closest(".remove-day-btn")) t.closest(".day-card")?.remove();
        if (t.closest(".superset-btn")) {
            const r = t.closest(".exercise-row");
            r?.classList.toggle("is-superset"), t.closest(".superset-btn")?.classList.toggle("active")
        }
    });
    document.getElementById("program-builder-form")?.addEventListener("change", e => {
        const t = e.target as HTMLElement;
        if (t.classList.contains("muscle-group-select")) {
            const s = t.closest(".exercise-row")?.querySelector(".exercise-select");
            s && pe((t as HTMLSelectElement).value, s as HTMLSelectElement)
        }
        if (t.closest('input[type="radio"]')) {
            updateRadioCardSelection(t.closest("form")!);
        }
    });
    document.getElementById("program-builder-form")?.addEventListener("input", e => {
        const t = e.target as HTMLInputElement;
        if (t.classList.contains("range-slider")) {
            updateSliderValueDisplay(t);
        }
        if (["age-slider", "height-slider", "weight-slider", "neck-input", "waist-input", "hip-input"].some(s => t.classList.contains(s))) {
            const s = t.closest("#section-1");
            s && he(s as HTMLElement)
        }
    });
    document.getElementById("program-builder-form")?.addEventListener("change", e => {
        const t = e.target as HTMLInputElement;
        if (["gender", "activity-level"].some(s => t.classList.contains(s))) {
            const s = t.closest("#section-1");
            s && he(s as HTMLElement)
        }
        if (t.classList.contains("gender")) {
            const s = t.closest("#section-1");
            s && xe(s as HTMLElement)
        }
        if (t.closest('input[type="radio"]')) {
            updateRadioCardSelection(t.closest("form")!);
        }
    });
    document.getElementById("next-btn")?.addEventListener("click", () => ne(Re(F, 1)));
    document.getElementById("prev-btn")?.addEventListener("click", () => ne(Re(F, -1)));
    document.querySelectorAll(".stepper-item").forEach(e => {
        e.addEventListener("click", () => {
            const t = parseInt(e.getAttribute("data-step") || "1");
            ne(t)
        })
    });
    document.getElementById("save-pdf-btn")?.addEventListener("click", Fe);
    document.getElementById("save-image-btn")?.addEventListener("click", saveAsImage);
    document.getElementById("send-program-btn")?.addEventListener("click", rt);
    document.getElementById("save-changes-btn")?.addEventListener("click", at);
    document.getElementById("send-nutrition-btn")?.addEventListener("click", dt);
    document.getElementById("profile-pic-upload")?.addEventListener("change", e => {
        const t = (e.target as HTMLInputElement).files?.[0];
        if (t) {
            const s = new FileReader;
            s.onload = r => {
                const a = document.querySelector("#section-1 .profile-pic-preview") as HTMLImageElement;
                a && (a.src = r.target?.result as string)
            }, s.readAsDataURL(t)
        }
    });
    document.getElementById("generate-ai-plan-btn")?.addEventListener("click", async () => {
        const e = document.getElementById("generate-ai-plan-btn") as HTMLButtonElement;
        if (e.classList.contains("is-loading")) return;
        e.classList.add("is-loading", "secondary");
        const t = ye().step1,
            s = `بر اساس اطلاعات زیر یک برنامه تمرینی شخصی‌سازی شده ایجاد کن:
- هدف: ${t.trainingGoal || "تناسب اندام عمومی"}
- جنسیت: ${t.gender || "نامشخص"}
- سن: ${t.age || "نامشخص"}
- قد: ${t.height || "نامشخص"} سانتی‌متر
- وزن: ${t.weight || "نامشخص"} کیلوگرم
- تعداد روزهای تمرین در هفته: ${t.trainingDays || 4}
- سطح فعالیت: ${t.activityLevel ? { "1.2": "بی‌تحرک", "1.375": "فعالیت کم", "1.55": "فعالیت متوسط", "1.725": "فعالیت زیاد" }[t.activityLevel] : "فعالیت متوسط"}

خروجی باید یک شیء JSON با یک کلید اصلی "days" باشد. مقدار "days" باید یک آرایه از اشیاء باشد که هر شیء نمایانگر یک روز تمرینی است. هر شیء روز باید شامل موارد زیر باشد:
1. "title": یک رشته برای عنوان روز (مثال: "روز اول: تمرین سینه و پشت بازو").
2. "notes": یک رشته با یادداشت‌های کوتاه برای آن روز.
3. "exercises": یک آرایه از اشیاء تمرین. هر شیء تمرین باید شامل موارد زیر باشد:
   - "muscle": گروه عضلانی از لیست زیر: [${Object.keys(window.exerciseDB).join(", ")}].
   - "exercise": نام حرکت خاص از گروه عضلانی انتخاب شده.
   - "sets": یک عدد بین 1 تا 10.
   - "reps": یک عدد بین 1 تا 50.
   - "rest": یک عدد برای زمان استراحت به ثانیه (مثال: 60, 90).
   - "isSuperset": یک مقدار بولی که همیشه false باشد.

تعداد اشیاء روز در آرایه "days" باید دقیقا برابر با ${t.trainingDays || 4} باشد.
پاسخ را فقط به صورت یک شیء JSON معتبر، بدون هیچ‌گونه قالب‌بندی Markdown یا متن اضافی ارائه بده.`;
        if (!X) {
            X = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
        try {
            const result = await X.models.generateContent({
                model: "gemini-2.5-flash",
                contents: s,
                 config: {
                    responseMimeType: "application/json",
                 }
            });
            
            const jsonText = result.text.trim().replace(/```json/g, "").replace(/```/g, "");
            const generatedPlan = JSON.parse(jsonText);

            if (!generatedPlan || !generatedPlan.days) {
                throw new Error("Invalid response format from AI.");
            }

            const workoutContainer = document.getElementById("workout-days-container")!;
            workoutContainer.innerHTML = ''; 

            generatedPlan.days.forEach((dayData) => {
                re(workoutContainer.children.length === 0);
                const dayCard = workoutContainer.lastElementChild!;
                
                (dayCard.querySelector(".day-title-input") as HTMLInputElement).value = dayData.title;
                (dayCard.querySelector(".day-notes-input") as HTMLTextAreaElement).value = dayData.notes;
                
                const exerciseList = dayCard.querySelector(".exercise-list")!;
                exerciseList.innerHTML = '';

                dayData.exercises.forEach((ex) => {
                    ge(exerciseList as HTMLDivElement);
                    const exerciseRow = exerciseList.lastElementChild as HTMLElement;
                    
                    const muscleSelect = exerciseRow.querySelector(".muscle-group-select") as HTMLSelectElement;
                    const exerciseSelect = exerciseRow.querySelector(".exercise-select") as HTMLSelectElement;
                    const setSlider = exerciseRow.querySelector(".set-slider") as HTMLInputElement;
                    const repSlider = exerciseRow.querySelector(".rep-slider") as HTMLInputElement;
                    const restSlider = exerciseRow.querySelector(".rest-slider") as HTMLInputElement;
                    
                    const muscleExists = Object.keys(we).includes(ex.muscle);
                    const muscle = muscleExists ? ex.muscle : Object.keys(we)[0];
                    muscleSelect.value = muscle;
                    pe(muscle, exerciseSelect);

                    const exerciseExists = (we[muscle] || []).includes(ex.exercise);
                    exerciseSelect.value = exerciseExists ? ex.exercise : (we[muscle] || [])[0];
                    
                    setSlider.value = String(ex.sets);
                    repSlider.value = String(ex.reps);
                    restSlider.value = String(ex.rest);
                    
                    [setSlider, repSlider, restSlider].forEach(slider => {
                        const event = new Event('input', { bubbles: true });
                        slider.dispatchEvent(event);
                    });
                });
            });
            window.lucide?.createIcons();
            w("برنامه تمرینی با موفقیت توسط هوش مصنوعی تولید شد.", "success");
        } catch (error) {
            console.error("AI Plan Generation Error:", error);
            w("خطا در تولید برنامه با هوش مصنوعی. لطفاً دوباره تلاش کنید.", "error");
        } finally {
            e.classList.remove("is-loading", "secondary");
        }
    });

    document.getElementById("generate-ai-nutrition-btn")?.addEventListener("click", async () => {
        const e = document.getElementById("generate-ai-nutrition-btn") as HTMLButtonElement;
        const resultContainer = document.getElementById("ai-nutrition-result") as HTMLElement;
        if (e.classList.contains("is-loading")) return;

        e.classList.add("is-loading");
        resultContainer.classList.remove("hidden");
        resultContainer.innerHTML = '<div class="flex items-center gap-2 text-secondary"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary"></div><span>در حال تولید برنامه غذایی...</span></div>';

        const t = ye().step1;
        const s = `بر اساس اطلاعات کاربر زیر، یک برنامه غذایی نمونه و عمومی برای ${t.trainingGoal || "تناسب اندام عمومی"} ایجاد کن.
- جنسیت: ${t.gender || "نامشخص"}
- سن: ${t.age || "نامشخص"}
- قد: ${t.height || "نامشخص"} cm
- وزن: ${t.weight || "نامشخص"} kg
- TDEE (کالری مورد نیاز روزانه): ${t.tdee || 2500} kcal

برنامه باید شامل 5 وعده غذایی (صبحانه، ناهار، شام، و دو میان‌وعده) باشد. برای هر وعده، چند گزینه غذایی سالم و ساده با مقادیر تقریبی پیشنهاد بده. کالری کل روزانه باید نزدیک به TDEE کاربر باشد.
پاسخ باید به زبان فارسی و در قالب HTML با استفاده از تگ‌های h4 برای عناوین وعده‌ها، ul و li برای لیست غذاها باشد. از کلاس‌های Tailwind CSS استفاده نکن.`;

        if (!X) {
            X = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }

        try {
            const result = await X.models.generateContent({
                model: "gemini-2.5-flash",
                contents: s,
            });
            resultContainer.innerHTML = result.text.replace(/\n/g, "<br>");
        } catch (error) {
            console.error("AI Nutrition Generation Error:", error);
            w("خطا در تولید برنامه غذایی.", "error");
            resultContainer.innerHTML = "<p>خطایی رخ داد. لطفاً دوباره تلاش کنید.</p>";
        } finally {
            e.classList.remove("is-loading");
        }
    });
    
    document.getElementById("get-ai-suggestion-btn")?.addEventListener("click", async () => {
        const input = document.getElementById("ai-question-input") as HTMLInputElement;
        const query = input.value.trim();
        const btn = document.getElementById("get-ai-suggestion-btn") as HTMLButtonElement;
        const contentDiv = document.getElementById("ai-assistant-content")!;

        if (!query || btn.classList.contains("is-loading")) return;

        btn.classList.add("is-loading");
        contentDiv.innerHTML = '<div class="flex items-center gap-2 text-secondary"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary"></div><span>در حال پردازش...</span></div>';

        if (!X) {
            X = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
        
        try {
            const fullPrompt = `You are a fitness coach assistant. Answer the following question in Persian concisely: "${query}"`;
            const result = await X.models.generateContent({ model: "gemini-2.5-flash", contents: fullPrompt });
            contentDiv.innerHTML = result.text.replace(/\n/g, "<br>");
        } catch (error) {
            console.error("AI Suggestion Error:", error);
            w("خطا در دریافت پاسخ از هوش مصنوعی.", "error");
            contentDiv.innerHTML = "<p>خطایی رخ داد. دوباره تلاش کنید.</p>";
        } finally {
            btn.classList.remove("is-loading");
        }
    });

    document.querySelectorAll(".user-dashboard-tab").forEach(e => {
        e.addEventListener("click", () => {
            const t = e.getAttribute("data-tab");
            t && switchUserDashboardTab(t)
        })
    });
    
    document.getElementById("start-workout-btn")?.addEventListener("click", openWorkoutLogModal);
    document.getElementById("close-workout-log-btn")?.addEventListener("click", () => closeModal(document.getElementById("workout-log-modal")!));
    document.getElementById("finish-workout-btn")?.addEventListener("click", saveWorkoutLog);
    
    document.getElementById("ai-chat-fab")?.addEventListener("click", openChat);
    document.getElementById("close-ai-chat-btn")?.addEventListener("click", closeChat);
    document.getElementById("ai-chat-form")?.addEventListener("submit", handleAIChatSubmit);
    
    document.getElementById("add-weight-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("new-weight-input") as HTMLInputElement;
        const weight = parseFloat(input.value);
        if (!f || isNaN(weight) || weight <= 0) {
            w("لطفاً یک وزن معتبر وارد کنید.", "error");
            return;
        }

        const userData = D(f);
        userData.weightHistory = userData.weightHistory || [];
        userData.weightHistory.push({ date: new Date().toISOString(), weight: weight });
        
        // Also update profile weight
        userData.step1 = userData.step1 || {};
        userData.step1.weight = weight.toString();
        
        W(f, userData);
        w("وزن با موفقیت ثبت شد!", "success");
        input.value = "";
        
        // Re-render dashboard and profile to reflect changes
        de(f, userData);
        switchUserDashboardTab('dashboard'); // Switch to show updated chart
    });
    
    // User dashboard profile form logic
    const userProfilePanel = document.getElementById("dashboard-profile-panel");
    if (userProfilePanel) {
        userProfilePanel.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            if (target.classList.contains("range-slider")) {
                updateSliderValueDisplay(target);
            }
             if (["height-slider", "weight-slider", "age-slider", "neck-input", "waist-input", "hip-input"].some(cls => target.classList.contains(cls))) {
                he(userProfilePanel as HTMLElement);
            }
        });
        
        userProfilePanel.addEventListener("change", (e) => {
             const target = e.target as HTMLInputElement;
             if (target.closest('input[type="radio"]')) {
                 updateRadioCardSelection(userProfilePanel);
             }
             if (target.name.startsWith("gender_user")) {
                 xe(userProfilePanel);
             }
             if (target.name.startsWith("activity_level_user")) {
                he(userProfilePanel);
             }
        });
        
        userProfilePanel.querySelector(".profile-pic-input")?.addEventListener("change", e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file && f) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const newSrc = event.target?.result as string;
                    (userProfilePanel.querySelector(".profile-pic-preview") as HTMLImageElement).src = newSrc;
                    
                    const userData = D(f);
                    userData.step1 = userData.step1 || {};
                    userData.step1.profilePic = newSrc;
                    W(f, userData);
                    w("عکس پروفایل به‌روزرسانی شد.", "success");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    document.getElementById("confirm-info-btn")?.addEventListener("click", () => {
        if (!f) return;
        const userData = D(f);
        if (userData.infoConfirmed) {
            w("اطلاعات شما قبلا تایید شده است.", "error");
            return;
        }
        
        // Collect data from the user profile form
        const panel = document.getElementById("dashboard-profile-panel")!;
        userData.step1 = {
            ...userData.step1,
            clientName: (panel.querySelector(".client-name-input") as HTMLInputElement).value,
            clientEmail: (panel.querySelector(".client-email-input") as HTMLInputElement).value,
            profilePic: (panel.querySelector(".profile-pic-preview") as HTMLImageElement).src,
            height: (panel.querySelector(".height-slider") as HTMLInputElement).value,
            weight: (panel.querySelector(".weight-slider") as HTMLInputElement).value,
            age: (panel.querySelector(".age-slider") as HTMLInputElement).value,
            neck: (panel.querySelector(".neck-input") as HTMLInputElement).value,
            waist: (panel.querySelector(".waist-input") as HTMLInputElement).value,
            hip: (panel.querySelector(".hip-input") as HTMLInputElement).value,
            gender: (panel.querySelector('input[name="gender_user"]:checked') as HTMLInputElement)?.value,
            trainingGoal: (panel.querySelector('input[name="training_goal_user"]:checked') as HTMLInputElement)?.value,
            activityLevel: (panel.querySelector('input[name="activity_level_user"]:checked') as HTMLInputElement)?.value,
            trainingDays: (panel.querySelector('input[name="training_days_user"]:checked') as HTMLInputElement)?.value,
        };
        
        userData.infoConfirmed = true;
        W(f, userData);
        
        ae(`${f} اطلاعات پروفایل خود را تایید کرد.`);
        w("اطلاعات شما با موفقیت تایید و برای مربی ارسال شد.", "success");
        de(f, userData); // Re-render to lock the button
    });
    
     document.getElementById("coach-chat-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("coach-chat-input") as HTMLInputElement;
        const message = input.value.trim();
        if (!message || !f) return;

        const userData = D(f);
        if (!userData.chatHistory) userData.chatHistory = [];
        
        userData.chatHistory.push({ sender: 'user', message, date: new Date().toISOString() });
        userData.hasNewMessageForCoach = true; // Flag for admin notification
        
        W(f, userData);
        input.value = '';
        renderChatTab(f, userData);
    });

    // Admin Panel Logic
    je.addEventListener("click", () => {
        switchAdminPanelTab('dashboard');
        openModal(U);
    });
    document.getElementById("close-admin-panel-btn")?.addEventListener("click", () => closeModal(U));

    document.querySelectorAll(".admin-nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            switchAdminPanelTab(btn.getAttribute("data-tab")!);
        });
    });

    document.getElementById("admin-user-search")?.addEventListener("input", se);
    document.querySelectorAll(".user-filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".user-filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            se();
        });
    });

    document.getElementById("admin-user-list")?.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const loadBtn = target.closest(".load-user-btn");
        const removeBtn = target.closest(".remove-user-btn");
        
        if (loadBtn) {
            const username = loadBtn.getAttribute("data-username");
            if (username) {
                const userData = D(username);
                Je(userData);
                closeModal(U);
            }
        } else if (removeBtn) {
            const username = removeBtn.getAttribute("data-username");
            if (username && confirm(`آیا از حذف کاربر «${username}» مطمئن هستید؟ این عمل غیرقابل بازگشت است.`)) {
                let users = O();
                users = users.filter(u => u.username !== username);
                Ge(users);
                localStorage.removeItem(`fitgympro_data_${username}`);
                se();
                be();
                w(`کاربر «${username}» با موفقیت حذف شد.`);
            }
        }
    });
    
    document.getElementById("create-user-btn")?.addEventListener("click", () => {
        const usernameInput = document.getElementById("new-username-input") as HTMLInputElement;
        const emailInput = document.getElementById("new-user-email-input") as HTMLInputElement;
        const passwordInput = document.getElementById("new-user-password-input") as HTMLInputElement;
        const errorEl = document.getElementById("create-user-error") as HTMLElement;

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        errorEl.textContent = "";

        if (!username || !email || !password) {
            errorEl.textContent = "تمام فیلدها الزامی هستند.";
            return;
        }

        const users = O();
        if (users.some(u => u.username === username)) {
            errorEl.textContent = "این نام کاربری قبلا استفاده شده است.";
            return;
        }

        const newUser = { username, email, password };
        users.push(newUser);
        Ge(users);
        W(username, {
            joinDate: new Date().toISOString(),
            step1: { clientName: username, clientEmail: email }
        });

        w(`کاربر «${username}» با موفقیت ایجاد شد.`, "success");
        usernameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";
        se();
        be();
    });

    // Template save/load logic
    const saveTemplateModal = document.getElementById("save-template-modal")!;
    const loadTemplateModal = document.getElementById("load-template-modal")!;
    
    document.getElementById("save-template-btn")?.addEventListener("click", () => openModal(saveTemplateModal));
    document.getElementById("cancel-save-template-btn")?.addEventListener("click", () => closeModal(saveTemplateModal));
    document.getElementById("confirm-save-template-btn")?.addEventListener("click", () => {
        const nameInput = document.getElementById("template-name-input") as HTMLInputElement;
        const name = nameInput.value.trim();
        if (!name) {
            w("لطفاً یک نام برای الگو وارد کنید.", "error");
            return;
        }
        const data = ye();
        yt(name, data);
        w(`الگوی «${name}» با موفقیت ذخیره شد.`, "success");
        nameInput.value = "";
        closeModal(saveTemplateModal);
    });

    document.getElementById("load-template-btn")?.addEventListener("click", () => {
        const templates = ht();
        const container = document.getElementById("template-list-container")!;
        container.innerHTML = "";
        const names = Object.keys(templates);
        if (names.length === 0) {
            container.innerHTML = `<p class="text-secondary">هیچ الگوی ذخیره شده‌ای وجود ندارد.</p>`;
        } else {
            names.forEach(name => {
                const btn = document.createElement("button");
                btn.className = "w-full text-right p-3 hover:bg-tertiary rounded-lg";
                btn.textContent = name;
                btn.onclick = () => {
                    if (confirm(`آیا می‌خواهید الگوی «${name}» را بارگذاری کنید؟ تغییرات فعلی از بین خواهند رفت.`)) {
                        Je(templates[name]);
                        closeModal(loadTemplateModal);
                        w(`الگوی «${name}» با موفقیت بارگذاری شد.`, "success");
                    }
                };
                container.appendChild(btn);
            });
        }
        openModal(loadTemplateModal);
    });
    document.getElementById("cancel-load-template-btn")?.addEventListener("click", () => closeModal(loadTemplateModal));
    
    document.getElementById("admin-template-list")?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const deleteBtn = target.closest('.delete-template-btn');
        if (deleteBtn) {
            const name = deleteBtn.getAttribute('data-name');
            if (name && confirm(`آیا از حذف الگوی «${name}» مطمئن هستید؟`)) {
                pt(name);
                w(`الگوی «${name}» حذف شد.`);
                renderAdminTemplates();
            }
        }
    });
    
    document.getElementById('admin-conversations-user-list')?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const conversationItem = target.closest('.conversation-item');
        if (conversationItem) {
            const username = (conversationItem as HTMLElement).dataset.username;
            if (username) {
                 // Add active state to selected item
                document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('bg-tertiary'));
                conversationItem.classList.add('bg-tertiary');
                renderAdminConversation(username);
            }
        }
    });

    document.getElementById("contact-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        w("پیام شما با موفقیت ارسال شد (شبیه‌سازی).", "success");
        (document.getElementById("contact-form") as HTMLFormElement).reset();
        // Refill readonly fields
        if(f) renderContactTab(f, D(f));
    });

    document.querySelectorAll(".select-plan-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            if (!f) return;
            const target = e.currentTarget as HTMLButtonElement;
            const planType = target.dataset.planType!;
            const planName = target.dataset.planName!;
            const price = parseInt(target.dataset.price!, 10);
            
            const userData = D(f);
            userData.subscriptions = userData.subscriptions || [];
            
            // Prevent buying new plan if one is pending
            const hasUnfulfilled = userData.subscriptions.some(s => s.fulfilled === false);
            if (hasUnfulfilled) {
                w("شما یک پلن در انتظار آماده‌سازی دارید. لطفا منتظر بمانید.", "error");
                return;
            }

            userData.subscriptions.push({
                purchaseDate: new Date().toISOString(),
                planType: planType,
                planName: planName,
                price: price,
                fulfilled: false
            });
            W(f, userData);
            
            ae(`${f} پلن «${planName}» را خریداری کرد.`);
            w(`پلن «${planName}» با موفقیت به سبد خرید اضافه شد.`, "success");
            de(f, userData); // Re-render to show status
        });
    });

});
