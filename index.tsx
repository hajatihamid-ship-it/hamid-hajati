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
        dosage: "۱ اسکوپ (۲۰-۳۰ گرم) بعد از تمرین",
        note: "پروتئین زودجذب برای ترمیم و ساخت سریع بافت عضلانی."
    }, {
        name: "کراتین مونوهیدرات",
        dosage: "روزانه ۳-۵ گرم",
        note: "افزایش قدرت، توان انفجاری و حجم عضلات در طول زمان."
    }, {
        name: "BCAA (آمینو اسید شاخه‌دار)",
        dosage: "۵-۱۰ گرم حین یا بعد از تمرین",
        note: "کاهش خستگی، درد عضلانی و جلوگیری از تجزیه عضلات."
    }, {
        name: "گلوتامین",
        dosage: "۵ گرم بعد از تمرین و قبل از خواب",
        note: "حمایت از سیستم ایمنی، سلامت روده و بهبود ریکاوری."
    }, {
        name: "پروتئین کازئین",
        dosage: "۱ اسکوپ (۲۰-۳۰ گرم) قبل از خواب",
        note: "پروتئین دیر هضم برای تغذیه عضلات در طول شب و جلوگیری از کاتابولیسم."
    }, {
        name: "گینر (Mass Gainer)",
        dosage: "طبق دستور محصول",
        note: "ترکیب پروتئین و کربوهیدرات برای افراد دارای کمبود وزن جهت افزایش حجم."
    }, {
        name: "HMB",
        dosage: "روزانه ۳ گرم",
        note: "کاهش تجزیه پروتئین عضلانی، مناسب برای دوره های کات یا تمرینات شدید."
    }],
    "افزایش‌دهنده عملکرد و انرژی": [{
        name: "کافئین",
        dosage: "۲۰۰-۴۰۰ میلی‌گرم، ۳۰-۶۰ دقیقه قبل تمرین",
        note: "افزایش هوشیاری، تمرکز، انرژی و کاهش درک خستگی."
    }, {
        name: "بتا-آلانین",
        dosage: "روزانه ۳-۶ گرم",
        note: "افزایش استقامت عضلانی با بافر کردن یون هیدروژن و تاخیر در خستگی."
    }, {
        name: "سیترولین مالات",
        dosage: "۶-۸ گرم، ۳۰-۶۰ دقیقه قبل تمرین",
        note: "بهبود جریان خون (پمپ)، اکسیژن‌رسانی به عضلات و کاهش خستگی."
    }, {
        name: "آرژنین (AAKG)",
        dosage: "۳-۶ گرم قبل از تمرین",
        note: "پیش‌ساز نیتریک اکساید برای افزایش پمپ عضلانی و جریان خون."
    }, {
        name: "تورین",
        dosage: "۱-۳ گرم قبل از تمرین",
        note: "حمایت از هیدراتاسیون، عملکرد سلولی و کاهش گرفتگی عضلات."
    }, {
        name: "پمپ (Pre-Workout)",
        dosage: "۱ اسکوپ قبل از تمرین",
        note: "ترکیبی از مواد مختلف برای افزایش انرژی، تمرکز و پمپ عضلانی."
    }],
    "مدیریت وزن و چربی‌سوزی": [{
        name: "ال-کارنیتین",
        dosage: "۱-۳ گرم قبل از تمرین هوازی",
        note: "کمک به انتقال اسیدهای چرب به میتوکندری برای تولید انرژی."
    }, {
        name: "عصاره چای سبز (EGCG)",
        dosage: "روزانه ۵۰۰ میلی‌گرم",
        note: "افزایش متابولیسم و اکسیداسیون چربی از طریق خواص ترموژنیک."
    }, {
        name: "CLA (اسید لینولئیک کونژوگه)",
        dosage: "روزانه ۳-۴ گرم",
        note: "کمک به کاهش توده چربی بدن و حفظ توده عضلانی."
    }, {
        name: "یوهیمبین",
        dosage: "۵-۱۵ میلی‌گرم قبل از تمرین ناشتا",
        note: "چربی‌سوز قوی برای هدف قرار دادن چربی‌های مقاوم."
    }],
    "سلامت عمومی و مفاصل": [{
        name: "مولتی ویتامین",
        dosage: "روزانه ۱ عدد با غذا",
        note: "تامین کمبودهای احتمالی ویتامین‌ها و مواد معدنی ضروری."
    }, {
        name: "ویتامین D3",
        dosage: "روزانه ۱۰۰۰-۴۰۰۰ IU",
        note: "ضروری برای سلامت استخوان، سیستم ایمنی و عملکرد هورمونالی."
    }, {
        name: "اُمگا-۳ (روغن ماهی)",
        dosage: "روزانه ۱-۳ گرم (EPA+DHA)",
        note: "کاهش التهاب، حمایت از سلامت قلب، مغز و مفاصل."
    }, {
        name: "گلوکوزامین و کندرویتین",
        dosage: "طبق دستور محصول",
        note: "حمایت از سلامت مفاصل، غضروف‌ها و کاهش دردهای مفصلی."
    }, {
        name: "ویتامین C",
        dosage: "روزانه ۵۰۰-۱۰۰۰ میلی‌گرم",
        note: "آنتی‌اکсидан قوی، ضروری برای سلامت بافت‌ها و سیستم ایمنی."
    }, {
        name: "زینک و منیزیم (ZMA)",
        dosage: "۲-۳ عدد قرص قبل از خواب",
        note: "بهبود کیفیت خواب، ریکاوری، و حمایت از سطح هورمون‌های آنابولیک."
    }, {
        name: "آشواگاندا",
        dosage: "روزانه ۳۰۰-۶۰۰ میلی‌گرم",
        note: "آداپتوژن برای کاهش استرس، بهبود ریکاوری و افزایش قدرت."
    }]
};
window.exerciseDB = we;
let F = 1;
const ue = 5;
let f: string | null = null,
    X: GoogleGenAI, ve: any = null, smallChartInstance: any = null,
    adminChartInstance: any = null,
    currentChatSession: Chat | null = null;
const V = document.getElementById("user-selection-screen")!,
    me = document.getElementById("main-app-container")!,
    oe = document.getElementById("user-dashboard-container")!,
    U = document.getElementById("admin-panel-modal")!,
    je = document.getElementById("admin-panel-btn")!,
    A = e => {
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
        let n = "#3B82F6";
        e.classList.contains("rep-slider") && (n = "#22C55E"), e.classList.contains("rest-slider") && (n = "#A78BFA"), e.classList.contains("age-slider") && (n = "#F97316"), e.classList.contains("height-slider") && (n = "#EC4899"), e.classList.contains("weight-slider") && (n = "#FBBF24");
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
        const s = e.querySelector(".realtime-visualizers");
        if (!s) return;
        const r = e.id === "section-1" ? e.closest("form")! : e,
            a = r.querySelector(".bmi-input") as HTMLInputElement;
        if (!a) return;
        const n = parseFloat(a.value);
        let o = "";
        if (!isNaN(n) && n > 0) {
            let h = (n - 15) / 25 * 100;
            h = Math.max(0, Math.min(100, h));
            let E = "نرمال",
                q = "normal";
            n < 18.5 ? (E = "کمبود وزن", q = "underweight") : n >= 25 && n < 30 ? (E = "اضافه وزن", q = "overweight") : n >= 30 && (E = "چاقی", q = "obese");
            const k = (18.5 - 15) / 25 * 100,
                $ = (25 - 18.5) / 25 * 100,
                I = 5 / 25 * 100,
                C = 100 - k - $ - I;
            o = `<div class="p-4 rounded-xl"><h3 class="font-bold text-lg mb-3 border-b border-border-primary pb-2 flex items-center gap-2"><i data-lucide="activity" class="text-purple-400"></i>شاخص توده بدنی (BMI)</h3><div class="bmi-visualizer"><div class="bmi-scale"><div class="bmi-segment" style="--color: #3b82f6; width: ${k}%;"></div><div class="bmi-segment" style="--color: #22c55e; width: ${$}%;"></div><div class="bmi-segment" style="--color: #f97316; width: ${I}%;"></div><div class="bmi-segment" style="--color: #ef4444; width: ${C}%;"></div><div class="bmi-needle" style="--position: ${h}%;"><div class="bmi-value-box">${n.toFixed(1)}</div></div></div><div class="bmi-labels"><span>کمبود</span><span>نرمال</span><span>اضافه</span><span>چاقی</span></div><p class="bmi-status-text">وضعیت: <strong class="bmi-status-${q}">${E}</strong></p></div></div>`
        }
        let m = "";
        const d = parseFloat((e.querySelector(".weight-slider") as HTMLInputElement).value),
            c = r.querySelector(".ideal-weight-input") as HTMLInputElement;
        if (!c) {
            s.innerHTML = o, window.lucide?.createIcons();
            return
        }
        const g = c.value;
        if (g && g.includes(" - ")) {
            const [x, h] = g.replace(" kg", "").split(" - ").map(parseFloat);
            if (!isNaN(d) && !isNaN(x) && !isNaN(h)) {
                const q = Math.max(0, x - 15),
                    k = h + 15 - q;
                let $ = (d - q) / k * 100;
                $ = Math.max(0, Math.min(100, $));
                const I = Math.max(0, (x - q) / k * 100),
                    C = Math.max(0, (h - x) / k * 100),
                    L = Math.max(0, 100 - I - C);
                let b = "ایده‌آل",
                    B = "normal";
                d < x ? (b = "کمبود وزن", B = "underweight") : d > h && (b = "اضافه وزن", B = "overweight"), m = `<div class="p-4 rounded-xl"><h3 class="font-bold text-lg mb-3 border-b border-border-primary pb-2 flex items-center gap-2"><i data-lucide="scale" class="text-teal-400"></i>محدوده وزن ایده‌آل</h3><div class="weight-visualizer"><div class="weight-scale"><div class="weight-segment" style="--color: #3b82f6; width: ${I}%;"></div><div class="weight-segment" style="--color: #22c55e; width: ${C}%;"></div><div class="weight-segment" style="--color: #f97316; width: ${L}%;"></div><div class="weight-needle" style="--position: ${$}%;"><div class="weight-value-box">${d.toFixed(1)} kg</div></div></div><div class="weight-labels"><span>${x.toFixed(1)}kg</span><span class="font-bold">ایده‌آل</span><span>${h.toFixed(1)}kg</span></div><p class="weight-status-text">وضعیت: <strong class="weight-status-${B}">${b}</strong></p></div></div>`
            }
        }
        s.innerHTML = o + m, window.lucide?.createIcons()
    },
    he = e => {
        const t = e.id === "section-1" ? e.closest("form")! : e,
            s = parseFloat((e.querySelector(".age-slider") as HTMLInputElement).value),
            r = parseFloat((e.querySelector(".height-slider") as HTMLInputElement).value),
            a = parseFloat((e.querySelector(".weight-slider") as HTMLInputElement).value),
            n = e.querySelector(".gender:checked") as HTMLInputElement;
        if (!n) return;
        const o = n.value === "مرد",
            m = e.querySelector(".activity-level:checked") as HTMLInputElement,
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
        const s = e.querySelector('.gender[value="مرد"]') as HTMLInputElement;
        t.classList.toggle("hidden", s.checked), he(e)
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
        s.className = "card rounded-lg day-card", s.innerHTML = `<div class="flex justify-between items-center p-4 bg-tertiary/50 rounded-t-lg border-b border-border-secondary"><div class="flex items-center gap-3"><i data-lucide="calendar-days" class="text-yellow-400"></i><input type="text" value="روز ${t}: " class="day-title-input input-field font-bold text-lg bg-transparent border-0 p-1 focus:ring-0 focus:border-yellow-400 w-auto"></div> ${e?"":'<button type="button" class="remove-day-btn p-1 text-secondary hover:text-red-400"><i data-lucide="x-circle" class="w-5 h-5"></i></button>'}</div><div class="p-4 space-y-3"><div class="exercise-list space-y-3"></div><button type="button" class="add-exercise-btn mt-2 w-full text-sm text-yellow-400 font-semibold hover:bg-yellow-400/10 py-2.5 px-4 rounded-lg border-2 border-dashed border-yellow-400/30 transition-all flex items-center justify-center gap-2"><i data-lucide="plus"></i> افزودن حرکت</button></div><div class="p-4 border-t border-border-primary/50"><label class="font-semibold text-sm text-secondary mb-2 block">یادداشت‌های مربی</label><textarea class="day-notes-input input-field text-sm bg-tertiary/50" rows="2" placeholder="مثال: روی فرم صحیح حرکت تمرکز کنید..."></textarea></div>`, document.getElementById("workout-days-container")!.appendChild(s), ge(s.querySelector(".exercise-list") as HTMLDivElement), window.lucide?.createIcons()
    },
    st = () => {
        const e = document.getElementById("supplements-container")!;
        e.innerHTML = "";
        for (const t in Pe) {
            const s = document.createElement("div");
            s.className = "supp-category-card bg-tertiary/50 rounded-lg overflow-hidden", s.innerHTML = `<h3 class="font-bold p-4 border-b border-border-secondary text-blue-400">${t}</h3><div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"></div>`;
            const r = s.querySelector(".grid")!;
            Pe[t].forEach(a => {
                const n = document.createElement("div");
                n.className = "supplement-item flex items-center justify-between", n.innerHTML = `<label class="custom-checkbox-label"><input type="checkbox" value="${a.name}" data-dosage="${a.dosage}" data-note="${a.note}" class="supplement-checkbox custom-checkbox"><span>${a.name}</span></label><div class="flex items-center gap-2"><div class="tooltip"><i data-lucide="info" class="w-4 h-4 text-gray-500 cursor-pointer"></i><span class="tooltiptext">${a.note}</span></div><i data-lucide="pill" class="w-5 h-5 text-gray-400 flex-shrink-0"></i><input type="text" class="dosage-input input-field text-sm w-32" placeholder="دوز..."></div>`, r.appendChild(n)
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
    const d = `<header class="page-header flex justify-between items-start mb-6"><div class="flex items-center gap-3"><span class="font-bold text-2xl text-amber-500">FitGym Pro</span></div><img src="${m}" alt="Profile" class="w-20 h-20 rounded-full object-cover border-4 border-gray-100"></header><div class="mb-6"><h2 class="text-3xl font-extrabold text-gray-900 mb-2">${n}</h2><p class="text-gray-500">تهیه شده در تاریخ: ${new Date().toLocaleDateString("fa-IR")}</p></div>`;
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
            M += `<tr class="${ee?"superset-group-pro":""}"><td>${ce?'<span class="superset-label-pro">سوپرست</span>':""}${_.exercise}</td><td>${_.sets}</td><td>${_.reps}</td><td>${_.rest}s</td></tr>`
        }
        M += "</tbody></table></div>";
        const le = A(B.notes),
            Ee = `<div><h4 class="font-bold text-lg text-gray-800 mb-2">${G}</h4>${M}${le?`<div class="preview-notes-pro mt-3"><strong>یادداشت:</strong> ${le}</div>`:""}</div>`;
        g(Ee), N < q.length - 1 && g('<div class="day-separator"></div>')
    }));
    const k = (e.step3 || {}).supplements || [];
    if (k.length > 0) {
        let B = '<div class="mt-6"><h3 class="preview-section-header"><i data-lucide="pill"></i>برنامه مکمل‌ها</h3><div class="overflow-x-auto rounded-lg border border-border-primary"><table class="preview-table-pro mx-auto" style="min-width: 500px;"><thead><tr><th>مکمل / ویتامین</th><th style="width: 200px;">دستور مصرف</th></tr></thead><tbody>';
        k.forEach(N => {
            const G = A(N.dosage || "طبق دستور"),
                M = A(N.name);
            B += `<tr><td>${M}</td><td style="text-align: center;">${G}</td></tr>`
        }), B += "</tbody></table></div>", g(B)
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
nt = () => {
    // Always render the latest program data to the main preview container before saving.
    const e = "#program-sheet-container";
    Ue(ye(), e);
    
    const t = document.querySelector(`${e} .program-page`);
    if (!t) {
        w("محتوایی برای ذخیره وجود ندارد.", "error");
        return
    }
    const s = t.innerHTML,
        a = `${((document.getElementById("client-name-input") as HTMLInputElement).value||"FitGymPro-Program").replace(/ /g,"_")}.doc`,
        n = `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>Program</title><style>body{font-family: Arial, sans-serif; direction: rtl; text-align: right; margin: 2cm;} table{width: 100%; border-collapse: collapse; margin-bottom: 1rem;} th, td{border: 1px solid #ddd; padding: 8px;} th{background-color: #f2f2f2;} .page-footer p { page-break-before: always; } </style></head><body>${s}</body></html>`,
        o = new Blob(["\uFEFF", n], {
            type: "application/msword"
        }),
        m = document.createElement("a");
    m.href = URL.createObjectURL(o), m.download = a, document.body.appendChild(m), m.click(), document.body.removeChild(m)
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
    const r = D(t),
        a = ye(),
        n = {
            ...r,
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
            dosage: ((m = (o as HTMLInputElement).closest(".supplement-item")) == null ? void 0 : (m.querySelector(".dosage-input") as HTMLInputElement)).value
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
        o && (o.checked = !0, ((m = o.closest(".supplement-item")) == null ? void 0 : (m.querySelector(".dosage-input") as HTMLInputElement)).value = n.dosage)
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
}, Xe = (e = [], t = "weight-progress-chart", s = "no-chart-data", smallChart = false) => {
    var a;
    if (!window.Chart) return;
    const r = (a = document.getElementById(t) as HTMLCanvasElement) == null ? void 0 : a.getContext("2d");
    if (!r) return;
    const n = document.getElementById(s),
        o = document.getElementById(t);
    if (!o) return;
    n && !e || e.length < 2 ? (n.classList.remove("hidden"), o.classList.add("hidden")) : (n && n.classList.add("hidden"), o.classList.remove("hidden"), (() => {
        let m = null;
        if(t === "weight-progress-chart") m = ve;
        if(t === "weight-progress-chart-small") m = smallChartInstance;
        if(t.startsWith("admin")) m = adminChartInstance;
        
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
                        borderColor: "#FBBF24",
                        backgroundColor: "rgba(251, 191, 36, 0.2)",
                        fill: !0,
                        tension: .3,
                        pointBackgroundColor: "#FBBF24",
                        pointBorderColor: "#fff",
                        pointHoverRadius: 7,
                        pointRadius: smallChart ? 0 : 5
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
                            enabled: !smallChart
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: !1,
                            display: !smallChart,
                            grid: {
                                color: I
                            },
                            ticks: {
                                color: C
                            }
                        },
                        x: {
                             display: !smallChart,
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
        if(t === "weight-progress-chart") ve = L;
        if(t === "weight-progress-chart-small") smallChartInstance = L;
        if(t.startsWith("admin")) adminChartInstance = L;

    })())
};

const renderDashboardTab = (username, userData) => {
    var g;
    const s = document.getElementById("dashboard-stats-grid")!,
        r = document.getElementById("today-focus-card")!,
        a = ot(userData.workoutHistory),
        n = ((g = userData.workoutHistory) == null ? void 0 : g.length) || 0,
        o = userData.joinDate ? new Date(userData.joinDate).toLocaleDateString("fa-IR") : "نامشخص";
    s.innerHTML = `
        <div class="card p-4 rounded-lg flex items-start gap-4 bg-orange-500/10 border-orange-500/20">
            <div class="bg-orange-500/20 p-3 rounded-lg"><i data-lucide="flame" class="w-6 h-6 text-orange-400"></i></div>
            <div><p class="text-sm font-semibold text-secondary">روند تمرینی</p><p class="text-3xl font-bold">${a} <span class="text-base font-medium">روز</span></p></div>
        </div>
        <div class="card p-4 rounded-lg flex items-start gap-4 bg-green-500/10 border-green-500/20">
            <div class="bg-green-500/20 p-3 rounded-lg"><i data-lucide="swords" class="w-6 h-6 text-green-400"></i></div>
            <div><p class="text-sm font-semibold text-secondary">کل تمرینات</p><p class="text-3xl font-bold">${n}</p></div>
        </div>
        <div class="card p-4 rounded-lg flex items-start gap-4 bg-indigo-500/10 border-indigo-500/20">
            <div class="bg-indigo-500/20 p-3 rounded-lg"><i data-lucide="calendar-plus" class="w-6 h-6 text-indigo-400"></i></div>
            <div><p class="text-sm font-semibold text-secondary">عضویت از</p><p class="text-xl font-bold pt-2">${o}</p></div>
        </div>
    `;
    const m = document.getElementById("coach-message-card")!,
        d = document.getElementById("coach-message-content")!;
    const lastCoachMessage = (userData.chatHistory || []).filter(msg => msg.sender === 'coach').pop();
    if (lastCoachMessage) {
        d.innerHTML = `<p class="border-r-2 border-amber-500 pr-2">${A(lastCoachMessage.message)}</p><button id="view-full-chat-btn" class="text-sm text-amber-500 font-semibold mt-2 hover:underline">مشاهده کامل گفتگو</button>`;
        m.classList.remove("hidden");
        document.getElementById("view-full-chat-btn")?.addEventListener('click', () => switchUserDashboardTab('chat'));
    } else {
        m.classList.add("hidden");
    }
    const c = it(userData);
    let x = `<div class="flex justify-between items-center mb-4"><h3 class="font-bold text-lg flex items-center gap-2"><i data-lucide="target" class="text-blue-400"></i>تمرکز امروز</h3><span class="text-sm font-semibold text-secondary">${new Date().toLocaleDateString("fa-IR",{weekday:"long",day:"numeric",month:"long"})}</span></div>`;
    if (c) {
        const h = new Date().toISOString().split("T")[0],
            E = (userData.workoutHistory || []).some(q => q.date.startsWith(h));
        x += `
            <div class="bg-tertiary/50 rounded-lg p-4">
                <h4 class="font-bold text-xl mb-3">${A(c.day.title)}</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
                    ${c.day.exercises.slice(0,4).map(q=>`<div class="bg-secondary/50 p-2 rounded-md text-xs font-semibold">${A(q.exercise)}</div>`).join("")}
                    ${c.day.exercises.length>4?`<div class="bg-secondary/50 p-2 rounded-md text-xs font-semibold">+ ${c.day.exercises.length-4} حرکت دیگر</div>`:""}
                </div>
                 <button id="start-workout-btn" class="primary-button w-full font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 ${E?"bg-green-500 hover:bg-green-600":""}">
                    <i data-lucide="${E?"check-check":"clipboard-list"}"></i>
                    <span>${E?"تمرین امروز ثبت شد":"شروع و ثبت جزئیات تمرین"}</span>
                </button>
            </div>
            <p class="text-xs text-secondary text-center italic mt-4">نکته روز: "قدرت از چیزی که فکر می‌کنی می‌توانی انجام دهی، یک قدم فراتر است."</p>
        `
    } else x += '<div class="text-center bg-tertiary/50 rounded-lg p-8"><i data-lucide="coffee" class="w-10 h-10 mx-auto text-green-400 mb-3"></i><h4 class="font-bold">امروز روز استراحت است!</h4><p class="text-sm text-secondary mt-1">از ریکاوری لذت ببر و برای جلسه بعدی آماده شو.</p></div>';
    r.innerHTML = x;
    Xe(userData.weightHistory, 'weight-progress-chart-small', 'no-chart-data', true);
    Xe(userData.weightHistory, 'weight-progress-chart', 'no-chart-data');
    
    const historyContainer = document.getElementById('workout-history-container');
    if (historyContainer) {
        const history = (userData.workoutHistory || []).slice().reverse();
        if (history.length > 0) {
            historyContainer.innerHTML = history.map(log => `
                <details class="bg-tertiary/50 rounded-lg">
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
                <div class="card rounded-lg p-4 border-l-4 border-amber-400">
                    <p class="font-bold text-lg">${dayName}</p>
                    <p class="text-sm text-secondary truncate">${A(dayData.title)}</p>
                    <p class="text-xs mt-2 font-semibold bg-tertiary/80 rounded-full px-2 py-1 inline-block">${dayData.exercises.length} حرکت</p>
                </div>
            `;
        } else {
            return `
                <div class="card rounded-lg p-4 bg-tertiary/50">
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
    const s = document.getElementById("profile-tab-content")!,
        r = document.getElementById("dashboard-status-container")!;
    const notice = document.getElementById('profile-completion-notice');
    if (notice) {
        notice.classList.toggle('hidden', !!userData.infoConfirmed);
        window.lucide?.createIcons();
    }
    r.innerHTML = "";
    const a = userData.hasPaid ?? !1,
        n = userData.infoConfirmed ?? !1,
        o = document.createElement("div");
    o.className = `flex items-center gap-3 p-3 rounded-lg ${a?"bg-green-500/10 text-green-400":"bg-red-500/10 text-red-400"}`, o.innerHTML = `<i data-lucide="${a?"check-circle":"alert-circle"}" class="w-6 h-6"></i><div><p class="font-bold">وضعیت پرداخت</p><p class="text-sm">${a?"پرداخت شده":"پرداخت نشده"}</p></div>`, r.appendChild(o);
    const m = document.createElement("div");
    m.className = `flex items-center gap-3 p-3 rounded-lg ${n?"bg-blue-500/10 text-blue-400":"bg-yellow-500/10 text-yellow-400"}`, m.innerHTML = `<i data-lucide="${n?"user-check":"user-cog"}" class="w-6 h-6"></i><div><p class="font-bold">وضعیت اطلاعات</p><p class="text-sm">${n?"تایید شده":"نیاز به تایید"}</p></div>`, r.appendChild(m);

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
    switchUserDashboardTab(initialTab);
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
    document.querySelectorAll(".user-dashboard-tab").forEach(s => {
        const r = s.getAttribute("data-tab") === e;
        s.classList.toggle("active-spring-tab", r), s.classList.toggle("text-secondary", !r), s.classList.toggle("border-transparent", !r)
    });
    document.querySelectorAll(".user-dashboard-tab-content").forEach(s => {
        s.classList.toggle("hidden", s.id !== `${e}-tab-content`)
    });
    const t = localStorage.getItem("fitgympro_last_user");
    if (t && f !== "admin") {
        const s = D(t);
        if (e === "dashboard") {
            Xe(s.weightHistory, 'weight-progress-chart-small', 'no-chart-data', true);
            Xe(s.weightHistory, "weight-progress-chart", "no-chart-data");
        }
    }
};

function switchAuthTab(e, t = !1) {
    const s = document.getElementById("login-tab-btn"),
        r = document.getElementById("signup-tab-btn"),
        a = document.getElementById("tab-underline"),
        n = document.getElementById("login-form-container"),
        o = document.getElementById("signup-form-container"),
        m = document.getElementById("signup-form") as HTMLFormElement,
        d = document.getElementById("login-form") as HTMLFormElement;
    if (!s || !r || !a || !n || !o) return;
    const c = e === "login" ? s : r,
        g = e === "login";
    a.style.transition = t ? "none" : "left 0.3s ease, width 0.3s ease", s.classList.toggle("active", g), r.classList.toggle("active", !g), n.classList.toggle("hidden", !g), o.classList.toggle("hidden", g), g ? (m == null || m.reset(), o.querySelectorAll(".validation-message").forEach(h => h.textContent = "")) : d == null || d.reset(), a.style.left = `${c.offsetLeft}px`, a.style.width = `${c.offsetWidth}px`, t && setTimeout(() => {
        a.style.transition = "left 0.3s ease, width 0.3s ease"
    }, 50)
}

function We() {
    var e, t;
    f = null, localStorage.removeItem("fitgympro_last_user"), document.getElementById("ai-chat-fab")?.classList.add("hidden"), me.classList.add("opacity-0"), oe.classList.add("opacity-0"), setTimeout(() => {
        me.classList.add("hidden"), oe.classList.add("hidden"), V.classList.remove("hidden"), setTimeout(() => {
            V.classList.remove("opacity-0")
        }, 50)
    }, 300), switchAuthTab("login", !0), (e = document.getElementById("login-form")) == null || e.reset(), (t = document.getElementById("signup-form")) == null || t.reset()
}
const renderSparkline = (e, t) => {
    if (!window.Chart) return;
    const s = document.getElementById(e) as HTMLCanvasElement;
    if (!s || !t || t.length < 2) return;
    const r = [...t].sort((c, g) => new Date(c.date).getTime() - new Date(g.date).getTime()).slice(-30),
        a = r.map(c => new Date(c.date).toLocaleDateString("fa-IR")),
        n = r.map(c => c.weight),
        o = n[n.length - 1] > n[0] ? "#22c55e" : "#ef4444",
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
        className: "bg-blue-500/20 text-blue-400"
    };
    const t = e.workoutHistory.sort((r, a) => new Date(a.date).getTime() - new Date(r.date).getTime())[0].date,
        s = (new Date().getTime() - new Date(t).getTime()) / 864e5;
    return s > 7 ? {
        text: "نیاز به توجه",
        className: "bg-red-500/20 text-red-400"
    } : {
        text: "در مسیر پیشرفت",
        className: "bg-green-500/20 text-green-400"
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
            case "unpaid":
                return !o.hasPaid;
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
        o.className = "card p-4 rounded-xl space-y-4 flex flex-col";
        o.dataset.username = n.username;
        o.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-4">
                    <img src="${((m=d.step1)==null?void 0:m.profilePic)||"https://placehold.co/56x56/374151/E5E7EB?text=?"}" class="w-14 h-14 rounded-full object-cover border-2 border-border-primary">
                    <div>
                        <p class="font-bold text-lg">${n.username}</p>
                        <p class="text-sm text-secondary">${n.email}</p>
                    </div>
                </div>
                <span class="text-xs font-bold px-2 py-1 rounded-full ${c.className} flex-shrink-0">${c.text}</span>
            </div>
            <div class="flex-1 h-12 w-full"><canvas id="spark-${n.username}"></canvas></div>
            <div class="flex items-center gap-2 pt-3 border-t border-border-primary">
                <button class="load-user-btn secondary-button !font-bold !py-2 !px-4 rounded-lg flex-1" data-username="${n.username}">بارگذاری</button>
                <button class="remove-user-btn text-red-500 hover:bg-red-500/10 p-3 rounded-lg" data-username="${n.username}" title="حذف کاربر"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
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
        m.hasPaid || s++;
        m.infoConfirmed || r++;
        const status = getUserStatus(m);
        if (status.text === 'در مسیر پیشرفت') l++;
    }), 
    document.getElementById("total-users-stat")!.textContent = t.toString(), 
    document.getElementById("unpaid-users-stat")!.textContent = s.toString(), 
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
        m.className = "flex items-center justify-between p-3 rounded-lg bg-tertiary/50 text-sm", m.innerHTML = `
            <p>${A(o.message)}</p>
            <p class="text-secondary flex-shrink-0">${lt(o.date)}</p>
        `, n.appendChild(m)
    })
};
const openModal = e => {
    e.classList.remove("hidden");
    setTimeout(() => {
        e.classList.add("active", "opacity-100", "pointer-events-auto");
    }, 10)
}, closeModal = e => {
    e.classList.remove("active", "opacity-100", "pointer-events-auto");
    setTimeout(() => {
        e.classList.add("hidden");
    }, 500);
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
            systemInstruction: "You are a friendly, expert-level fitness and nutrition coach named FitBot. Provide safe, encouraging, and concise advice in Persian. Use markdown for formatting."
        }
    }))
}, sendMessageToAiChat = async () => {
    const e = document.getElementById("ai-chat-input") as HTMLInputElement,
        t = e.value.trim();
    if (!t || !currentChatSession) return;
    const s = document.getElementById("ai-chat-messages")!,
        r = document.getElementById("ai-chat-form") as HTMLFormElement,
        a = document.createElement("div");
    a.className = "message user-message", a.textContent = t, s.appendChild(a), e.value = "", r.disabled = !0, s.scrollTop = s.scrollHeight;
    const n = document.createElement("div");
    n.className = "message ai-message", n.innerHTML = '<span class="blinking-cursor"></span>', s.appendChild(n), s.scrollTop = s.scrollHeight;
    try {
        const o = await currentChatSession.sendMessageStream({
            message: t
        });
        let m = "";
        for await (const d of o) m += d.text, n.innerHTML = m.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/\n/g, "<br>"), s.scrollTop = s.scrollHeight;
        n.querySelector(".blinking-cursor")?.remove()
    } catch (o) {
        n.innerHTML = "متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید."
    } finally {
        r.disabled = !1
    }
};
const sendMessageToCoach = async () => {
    if (!f || f === 'admin') return;
    const input = document.getElementById("coach-chat-input") as HTMLInputElement;
    const message = input.value.trim();
    if (!message) return;

    const userData = D(f);
    if (!userData.chatHistory) {
        userData.chatHistory = [];
    }
    
    userData.chatHistory.push({
        sender: 'user',
        message: message,
        timestamp: new Date().toISOString()
    });
    
    W(f, userData);
    
    renderChatTab(f, userData);
    input.value = '';

    ae(`پیام جدیدی از ${f} دریافت شد.`);
};
document.addEventListener("DOMContentLoaded", () => {
    var N, G, M, K, le, Y, Z, Q, j, _, ee, ce, Ee, Se, Le, Ie, qe, ke, Be, $e, Ce, Te, De, Ne, Me, ut, ft, gt, mt, bt, wt, Ct, Tt, Dt, Lt, zt, Ut, Vt;
    window.lucide?.createIcons();
    const e = localStorage.getItem("fitgympro_theme") || "dark";
    document.documentElement.setAttribute("data-theme", e);
    const t = localStorage.getItem("fitgympro_last_user");
    t && (t === "admin" ? Oe() : O().some(l => l.username === t) && fe(t));
    const s = document.getElementById("login-tab-btn"),
        r = document.getElementById("signup-tab-btn");
    s == null || s.addEventListener("click", () => switchAuthTab("login")), r == null || r.addEventListener("click", () => switchAuthTab("signup")), switchAuthTab("login", !0);

    const loginAndRoute = (event) => {
        event.preventDefault();
        const i = (document.getElementById("login-username") as HTMLInputElement).value.trim(),
            u = (document.getElementById("login-password") as HTMLInputElement).value;
        if (!i || !u) {
            w("لطفا نام کاربری و رمز عبور را وارد کنید.", "error");
            return;
        }
        
        // Check for admin credentials first. This will work on Enter press or any button click.
        if (i.toLowerCase() === "admin" && u === "adminpass") {
            Oe();
            return;
        }
        
        // If not admin, proceed with client login.
        const y = O().find(p => p.username.toLowerCase() === i.toLowerCase());
        if (y && y.password === u) {
            fe(y.username);
        } else {
            // If the login fails, give a specific error if they tried to log in as admin.
            if (i.toLowerCase() === "admin") {
                 w("نام کاربری یا رمز عبور مربی اشتباه است.", "error");
            } else {
                 w("نام کاربری یا رمز عبور اشتباه است.", "error");
            }
        }
    };

    (document.getElementById("login-form") as HTMLFormElement).addEventListener("submit", loginAndRoute);
    (document.getElementById("login-coach-btn") as HTMLButtonElement).addEventListener("click", loginAndRoute);


    (G = document.getElementById("signup-form")) == null || G.addEventListener("submit", l => {
        l.preventDefault();
        const i = (document.getElementById("signup-username") as HTMLInputElement).value.trim(),
            u = (document.getElementById("signup-email") as HTMLInputElement).value.trim(),
            v = (document.getElementById("signup-password") as HTMLInputElement).value;
        if (!i || !u || !v) {
            w("لطفا تمام فیلدها را پر کنید.", "error");
            return
        }
        if (i.length < 3) {
            w("نام کاربری باید حداقل ۳ حرف باشد.", "error");
            return
        }
        if (v.length < 6) {
            w("رمز عبور باید حداقل ۶ کاراکتر باشد.", "error");
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u)) {
            w("فرمت ایمیل نامعتبر است.", "error");
            return
        }
        if (O().some(T => T.username.toLowerCase() === i.toLowerCase())) {
            w("این نام کاربری قبلا استفاده شده است.", "error");
            return
        }
        const p = O();
        p.push({
            username: i,
            email: u,
            password: v
        }), Ge(p);
        const S = {
            step1: {
                clientName: i,
                clientEmail: u
            },
            step2: {
                days: []
            },
            step3: {
                supplements: []
            },
            step4: {},
            joinDate: new Date().toISOString(),
            workoutHistory: [],
            weightHistory: [],
            chatHistory: []
        };
        W(i, S), ae(`کاربر جدید ${i} ثبت نام کرد.`), w(`خوش آمدی، ${i}! ثبت نام با موفقیت انجام شد.`, "success"), fe(i)
    });
    document.querySelectorAll(".password-toggle").forEach(l => {
        l.addEventListener("click", () => {
            const i = (l as HTMLElement).dataset.target;
            if (!i) return;
            const u = document.getElementById(i) as HTMLInputElement;
            if (!u) return;
            const v = l.querySelector("i");
            u.type === "password" ? (u.type = "text", v == null || v.setAttribute("data-lucide", "eye-off")) : (u.type = "password", v == null || v.setAttribute("data-lucide", "eye")), window.lucide?.createIcons()
        })
    });
    const c = (l, i) => {
            if (l.validity.valueMissing) i.textContent = "این فیلد الزامی است.";
            else if (l.validity.tooShort) i.textContent = `حداقل باید ${l.minLength} کاراکتر باشد.`;
            else if (l.validity.typeMismatch) i.textContent = "فرمت وارد شده صحیح نیست.";
            else i.textContent = ""
        },
        o = document.getElementById("signup-username"),
        m = document.getElementById("signup-email"),
        d = document.getElementById("signup-password");
    [o, m, d].forEach(l => {
        if (l) {
            const i = l.parentElement.querySelector(".validation-message");
            i && (l.addEventListener("blur", () => c(l, i)), l.addEventListener("input", () => c(l, i)))
        }
    });
    const g = () => {
        const i = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        if (document.documentElement.setAttribute("data-theme", i), localStorage.setItem("fitgympro_theme", i), f && f !== "admin") {
            const u = D(f);
            Xe(u.weightHistory, 'weight-progress-chart-small', 'no-chart-data', true);
            Xe(u.weightHistory, 'weight-progress-chart', 'no-chart-data');
        }
    };
    (M = document.getElementById("theme-toggle-btn-dashboard")) == null || M.addEventListener("click", g), (K = document.getElementById("theme-toggle-btn-dashboard")) == null || K.addEventListener("click", g), (le = document.getElementById("next-btn")) == null || le.addEventListener("click", () => ne(Re(F, 1))), (Y = document.getElementById("prev-btn")) == null || Y.addEventListener("click", () => ne(Re(F, -1))), document.querySelectorAll(".stepper-item").forEach((l, i) => {
        l.addEventListener("click", () => {
            (l.classList.contains("completed") || l.classList.contains("active")) && ne(i + 1)
        })
    });
    const x = document.getElementById("program-builder-form")!;
    x.addEventListener("input", l => {
        var u, v, y;
        const i = l.target as HTMLElement;
        if (i.matches(".range-slider")) {
            ie(i as HTMLInputElement);
            const S = Array.from(i.classList).reverse().find(P => P.includes("-slider"));
            if (S) {
                const T = `.${S.replace("-slider","-value")}`;
                const P = (u = i.parentElement) == null ? void 0 : u.querySelector(T);
                if (P) {
                    let H = "";
                    i.classList.contains("height-slider") && (H = " cm"), i.classList.contains("weight-slider") && (H = " kg"), i.classList.contains("rest-slider") && (H = "s"), i.classList.contains("age-slider") || (P.textContent = (i as HTMLInputElement).value + H)
                }
            }
        }
        if (i.matches(".gender, .age-slider, .height-slider, .weight-slider, .activity-level, .neck-input, .waist-input, .hip-input")) {
            he(i.closest("#section-1, #dashboard-profile-panel")!)
        }
        if (i.matches(".gender")) {
            xe(i.closest("#section-1, #dashboard-profile-panel")!)
        }
        if (i.matches('.training-goal, .activity-level, .training-days, .gender')) {
            const container = i.closest('.form-section, #dashboard-profile-panel');
            if (container) {
                updateRadioCardSelection(container);
            }
        }
        if (i.matches(".muscle-group-select")) {
            pe((i as HTMLSelectElement).value, (v = i.parentElement) == null ? void 0 : v.querySelector(".exercise-select") as HTMLSelectElement)
        }
        if (i.matches(".supplement-checkbox")) {
            const p = (y = i.closest(".supplement-item")) == null ? void 0 : y.querySelector(".dosage-input") as HTMLInputElement;
            p && (p.value = (i as HTMLInputElement).checked && (i as HTMLInputElement).dataset.dosage || "")
        }
        if (f === "admin" && i.closest("#program-builder-form")) {
            if (F === 4) {
                Ue(ye(), "#program-sheet-container");
            } else if (F === 5) {
                Ue(ye(), "#program-sheet-container-step5");
            }
        }
    }), x.addEventListener("click", l => {
        var v, y, p;
        const i = l.target as HTMLElement,
            u = i.closest(".add-exercise-btn");
        if (u) {
            ge(u.previousElementSibling as HTMLDivElement)
        }
        if (i.closest(".remove-exercise-btn")) {
            (v = i.closest(".exercise-row")) == null || v.remove()
        }
        if (i.closest(".superset-btn")) {
            const S = i.closest(".superset-btn")!;
            S.classList.toggle("active"), (y = S.closest(".exercise-row")) == null || y.classList.toggle("is-superset")
        }
        if (i.closest(".remove-day-btn")) {
            (p = i.closest(".day-card")) == null || p.remove()
        }
    }), (Z = document.getElementById("add-day-btn")) == null || Z.addEventListener("click", () => re()), document.body.addEventListener("change", l => {
        var u;
        const i = l.target;
        if (i instanceof HTMLInputElement && i.matches(".profile-pic-input")) {
            const v = (u = i.files) == null ? void 0 : u[0];
            if (v) {
                const y = new FileReader;
                y.onload = p => {
                    var T, P, H;
                    const S = (T = p.target) == null ? void 0 : T.result;
                    (H = (P = i.closest("label")) == null ? void 0 : P.parentElement) == null || H.querySelectorAll(".profile-pic-preview").forEach(te => (te as HTMLImageElement).src = S as string)
                }, y.readAsDataURL(v)
            }
        }
    }), (Q = document.getElementById("supplement-search")) == null || Q.addEventListener("input", l => {
        const i = (l.target as HTMLInputElement).value.toLowerCase();
        document.querySelectorAll(".supplement-item").forEach(u => {
            var p, S;
            const y = (((S = (p = u.querySelector("span")) == null ? void 0 : p.textContent) == null ? void 0 : S.toLowerCase()) || "").includes(i);
            u.classList.toggle("hidden", !y)
        }), document.querySelectorAll(".supp-category-card").forEach(u => {
            const v = u.querySelectorAll(".supplement-item:not(.hidden)").length;
            u.classList.toggle("hidden", v === 0)
        })
    });
    const h = document.getElementById("get-ai-suggestion-btn") as HTMLButtonElement,
        E = document.getElementById("ai-question-input") as HTMLInputElement,
        q = document.getElementById("ai-assistant-content")!,
        k = async () => {
            const l = E.value.trim();
            if (!l) {
                q.innerHTML = '<p class="text-secondary">لطفا سوال خود را وارد کنید.</p>';
                return
            }
            h == null || h.classList.add("is-loading"), E.disabled = !0, q.innerHTML = '<p class="text-secondary">در حال دریافت پاسخ...</p>';
            try {
                X || (X = new GoogleGenAI({
                    apiKey: process.env.API_KEY
                }));
                const i = ye().step1,
                    v = `${`You are a world-class fitness and nutrition coach. A user is creating a plan for a client with these details: Goal=${i.trainingGoal}, Age=${i.age}, Gender=${i.gender}, Height=${i.height}cm, Weight=${i.weight}kg. Please answer the following question concisely in Persian, using Markdown for formatting.`}

Question: ${l}`,
                    y = await X.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents: v
                    });
                let p = A(y.text).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/(\n\r?){2,}/g, "</p><p>").replace(/\n- (.*)/g, "<ul><li>$1</li></ul>").replace(/<\/ul><ul>/g, "");
                q.innerHTML = `<p>${p}</p>`
            } catch (i) {
                console.error("AI Suggestion Error:", i), q.innerHTML = '<p class="text-red-400">متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.</p>'
            } finally {
                h == null || h.classList.remove("is-loading"), E.disabled = !1
            }
        };
    h == null || h.addEventListener("click", k), E == null || E.addEventListener("keyup", l => {
        l.key === "Enter" && k()
    });
    (j = document.getElementById("generate-ai-plan-btn")) == null || j.addEventListener("click", async () => {
        const l = document.getElementById("generate-ai-plan-btn") as HTMLButtonElement;
        l.classList.add("is-loading"), l.disabled = !0;
        try {
            X || (X = new GoogleGenAI({
                apiKey: process.env.API_KEY
            }));
            const i = ye().step1,
                u = parseInt(i.trainingDays || "4"),
                v = `Based on the following user data, create a ${u}-day workout plan in Persian.
                User Data:
                - Goal: ${i.trainingGoal}
                - Age: ${i.age}
                - Gender: ${i.gender}
                - Experience Level: Assume intermediate
                - Training Days Per Week: ${u}

                Instructions:
                1.  Use ONLY the exercises from this database: ${JSON.stringify(window.exerciseDB)}. Do not invent new exercises. Match the names exactly.
                2.  Provide a JSON array where each object represents a training day.
                3.  Each day object must have a "title" (e.g., "روز اول: سینه و پشت بازو"), a "notes" string (a short motivational or instructional tip), and an "exercises" array.
                4.  Each exercise object in the array must have "muscle" (from DB keys), "exercise" (from DB values), "sets" (3-5), "reps" (6-15), and "rest" (in seconds, 30-90).
                5.  Structure the plan logically (e.g., push/pull/legs split or similar).
                6.  Do not include any supersets for now.
            `,
                y = await X.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: v,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: R.ARRAY,
                            items: {
                                type: R.OBJECT,
                                properties: {
                                    title: {
                                        type: R.STRING
                                    },
                                    notes: {
                                        type: R.STRING
                                    },
                                    exercises: {
                                        type: R.ARRAY,
                                        items: {
                                            type: R.OBJECT,
                                            properties: {
                                                muscle: {
                                                    type: R.STRING
                                                },
                                                exercise: {
                                                    type: R.STRING
                                                },
                                                sets: {
                                                    type: R.INTEGER
                                                },
                                                reps: {
                                                    type: R.INTEGER
                                                },
                                                rest: {
                                                    type: R.INTEGER
                                                }
                                            },
                                            required: ["muscle", "exercise", "sets", "reps", "rest"]
                                        }
                                    }
                                },
                                required: ["title", "notes", "exercises"]
                            }
                        }
                    }
                }),
                p = JSON.parse(y.text.trim()),
                S = document.getElementById("workout-days-container")!;
            S.innerHTML = "", p.forEach((T, P) => {
                re(P === 0);
                const H = S.lastElementChild as HTMLElement;
                if (H) {
                    (H.querySelector(".day-title-input") as HTMLInputElement).value = T.title, (H.querySelector(".day-notes-input") as HTMLTextAreaElement).value = T.notes;
                    const te = H.querySelector(".exercise-list")!;
                    te.innerHTML = "", T.exercises.forEach(z => {
                        ge(te as HTMLDivElement);
                        const J = te.lastElementChild as HTMLElement;
                        if (J) {
                            const Ke = J.querySelector(".muscle-group-select") as HTMLSelectElement,
                                He = J.querySelector(".exercise-select") as HTMLSelectElement;
                            Ke.value = z.muscle, pe(z.muscle, He), He.value = z.exercise, (J.querySelector(".set-slider") as HTMLInputElement).value = z.sets.toString(), (J.querySelector(".rep-slider") as HTMLInputElement).value = z.reps.toString(), (J.querySelector(".rest-slider") as HTMLInputElement).value = z.rest.toString()
                        }
                    })
                }
            }), document.querySelectorAll("#program-builder-form .range-slider").forEach(T => {
                ie(T as HTMLInputElement), T.dispatchEvent(new Event("input"))
            }), w("برنامه تمرینی هوشمند با موفقیت ایجاد شد!", "success")
        } catch (i) {
            console.error("AI Plan Generation Error:", i), w("خطا در ایجاد برنامه با هوش مصنوعی.", "error")
        } finally {
            l.classList.remove("is-loading"), l.disabled = !1
        }
    });

    const generateNutritionBtn = document.getElementById("generate-ai-nutrition-btn");
    generateNutritionBtn?.addEventListener("click", async () => {
        generateNutritionBtn.classList.add("is-loading");
        (generateNutritionBtn as HTMLButtonElement).disabled = true;
        const resultContainer = document.getElementById("ai-nutrition-result")!;
        resultContainer.classList.remove("hidden");
        resultContainer.innerHTML = `<div class="flex items-center justify-center gap-2 text-secondary p-4"><div class="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary"></div><span>در حال تولید برنامه غذایی...</span></div>`;

        try {
            if (!X) {
                X = new GoogleGenAI({ apiKey: process.env.API_KEY });
            }
            const clientData = ye().step1;
            const prompt = `You are an expert nutritionist. Create a sample one-day meal plan in Persian for a client with the following details. The plan should be simple, practical, and based on common foods available in Iran. Provide 3 main meals (breakfast, lunch, dinner) and 2 snacks. For each meal, suggest food items and approximate portion sizes. The final output must be formatted in simple HTML, using <h4> for meal titles and <ul><li> for food items. Do not include any other HTML tags like <html>, <body>, or <head>. Your response must be only the HTML content.

Client Details:
- Goal: ${clientData.trainingGoal || 'General Fitness'}
- Gender: ${clientData.gender || 'Not specified'}
- Age: ${clientData.age || '25'}
- Weight: ${clientData.weight || '75'} kg
- Height: ${clientData.height || '180'} cm
- Estimated Daily Calorie Needs (TDEE): ${clientData.tdee || '2500'} kcal`;

            const response = await X.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });
            
            resultContainer.innerHTML = response.text;

        } catch (error) {
            console.error("AI Nutrition Generation Error:", error);
            resultContainer.innerHTML = `<p class="text-red-400 text-center">متاسفانه خطایی در تولید برنامه غذایی رخ داد. لطفاً دوباره تلاش کنید.</p>`;
            w("خطا در ارتباط با هوش مصنوعی.", "error");
        } finally {
            generateNutritionBtn.classList.remove("is-loading");
            (generateNutritionBtn as HTMLButtonElement).disabled = false;
        }
    });

    const $ = () => closeModal(U);
    je.addEventListener("click", () => {
        be();
        se();
        openModal(U);
    });
    (_ = document.getElementById("close-admin-panel-btn")) == null || _.addEventListener("click", $), U.addEventListener("click", l => {
        l.target === U && $()
    });
    U.addEventListener("click", l => {
        const i = l.target as HTMLElement,
            u = i.closest(".load-user-btn");
        if (u) {
            const y = (u as HTMLElement).dataset.username;
            if (y) {
                const p = D(y);
                Je(p), $(), w(`اطلاعات ${y} برای ویرایش بارگذاری شد.`, "success")
            }
        }
        const v = i.closest(".remove-user-btn");
        if (v) {
            const y = (v as HTMLElement).dataset.username;
            if (y && confirm(`آیا از حذف کاربر «${y}» مطمئن هستید؟ این عمل غیرقابل بازگشت است.`)) {
                let p = O();
                p = p.filter(S => S.username !== y), Ge(p), localStorage.removeItem(`fitgympro_data_${y}`), ae(`کاربر ${y} حذف شد.`), se(), be(), w(`کاربر ${y} با موفقیت حذف شد.`, "success")
            }
        }
    });
    (ee = document.getElementById("admin-user-search")) == null || ee.addEventListener("input", se), (ce = document.getElementById("user-filter-btn-group")) == null || ce.addEventListener("click", l => {
        const u = (l.target as HTMLElement).closest(".user-filter-btn");
        u && (document.querySelectorAll("#user-filter-btn-group .user-filter-btn").forEach(v => v.classList.remove("active")), u.classList.add("active"), se())
    }), (Ee = document.getElementById("create-user-btn")) == null || Ee.addEventListener("click", () => {
        const l = document.getElementById("new-username-input") as HTMLInputElement,
            i = document.getElementById("new-user-email-input") as HTMLInputElement,
            u = document.getElementById("new-user-password-input") as HTMLInputElement,
            v = document.getElementById("create-user-error")!,
            y = l.value.trim(),
            p = i.value.trim(),
            S = u.value.trim();
        if (v.textContent = "", !y || !p || !S) {
            v.textContent = "تمام فیلدها الزامی هستند.";
            return
        }
        if (O().some(P => P.username.toLowerCase() === y.toLowerCase())) {
            v.textContent = "این نام کاربری قبلا استفاده شده.";
            return
        }
        const users = O();
        users.push({
            username: y,
            email: p,
            password: S
        });
        Ge(users);
        W(y, {
            step1: {
                clientName: y,
                clientEmail: p
            },
            step2: {
                days: []
            },
            step3: {
                supplements: []
            },
            step4: {}
        }), ae(`کاربر ${y} توسط مدیر ایجاد شد.`), w(`کاربر ${y} با موفقیت ایجاد شد.`, "success"), se(), be(), l.value = "", i.value = "", u.value = ""
    });
    let B;
    (Se = document.getElementById("dashboard-profile-panel")) == null || Se.addEventListener("input", l => {
        const i = l.target as HTMLElement;
        i && i.matches('input[type="radio"]') && updateRadioCardSelection(document.getElementById("dashboard-profile-panel")!), clearTimeout(B), B = window.setTimeout(() => {
            var v, y, p, S, T;
            if (f && f !== "admin") {
                const H = D(f),
                    te = document.getElementById("dashboard-profile-panel")!,
                    z: any = {
                        clientName: (te.querySelector(".client-name-input") as HTMLInputElement).value,
                        clientEmail: (te.querySelector(".client-email-input") as HTMLInputElement).value,
                        profilePic: (te.querySelector(".profile-pic-preview") as HTMLImageElement).src,
                        height: (te.querySelector(".height-slider") as HTMLInputElement).value,
                        weight: (te.querySelector(".weight-slider") as HTMLInputElement).value,
                        age: (te.querySelector(".age-slider") as HTMLInputElement).value,
                        neck: (te.querySelector(".neck-input") as HTMLInputElement).value,
                        waist: (te.querySelector(".waist-input") as HTMLInputElement).value,
                        hip: (te.querySelector(".hip-input") as HTMLInputElement).value,
                        gender: (y = te.querySelector('input[name="gender_user"]:checked') as HTMLInputElement) == null ? void 0 : y.value,
                        trainingGoal: (p = te.querySelector('input[name="training_goal_user"]:checked') as HTMLInputElement) == null ? void 0 : p.value,
                        activityLevel: (S = te.querySelector('input[name="activity_level_user"]:checked') as HTMLInputElement) == null ? void 0 : S.value,
                        trainingDays: (T = te.querySelector('input[name="training_days_user"]:checked') as HTMLInputElement) == null ? void 0 : T.value
                    };
                H.step1 = { ...H.step1,
                    ...z
                };
                 W(f, H);
                 he(te);
                 w("تغییرات شما ذخیره شد.", "success");
            }
        }, 1500)
    });
    
    (Le = document.getElementById("confirm-info-btn")) == null || Le.addEventListener("click", () => {
        if (f && f !== "admin") {
            const l = D(f);
            l.infoConfirmed = !0, W(f, l), de(f, l), w("اطلاعات شما با موفقیت تایید شد.", "success")
        }
    }), (Ie = document.getElementById("pay-program-btn")) == null || Ie.addEventListener("click", () => {
        if (f && f !== "admin") {
            const l = D(f);
            l.hasPaid = !0, W(f, l), de(f, l), w("پرداخت با موفقیت انجام شد (شبیه‌سازی).", "success")
        }
    }), oe.addEventListener("click", l => {
        const i = l.target as HTMLElement;
        i.closest("#start-workout-btn") && f && f !== "admin" && openWorkoutLogModal();
    }), (qe = document.getElementById("add-weight-form")) == null || qe.addEventListener("submit", l => {
        if (l.preventDefault(), f && f !== "admin") {
            const i = document.getElementById("new-weight-input") as HTMLInputElement,
                u = parseFloat(i.value);
            if (isNaN(u) || u <= 0) {
                w("لطفا یک وزن معتبر وارد کنید.", "error");
                return
            }
            const v = D(f);
            v.weightHistory || (v.weightHistory = []), v.weightHistory.push({
                date: new Date().toISOString(),
                weight: u
            });
            v.step1 && (v.step1.weight = u.toString()), W(f, v), de(f, v), w("وزن جدید با موفقیت ثبت شد.", "success"), i.value = ""
        }
    });

    (document.getElementById("user-dashboard-tabs") as HTMLElement)?.addEventListener("click", (l) => {
        const i = (l.target as HTMLElement).closest(".user-dashboard-tab");
        if(i) {
            const tabName = i.getAttribute('data-tab');
            if(tabName) switchUserDashboardTab(tabName);
        }
    });

    (ke = document.getElementById("logout-btn")) == null || ke.addEventListener("click", We), (Be = document.getElementById("logout-btn-dashboard")) == null || Be.addEventListener("click", We), ($e = document.getElementById("save-pdf-btn")) == null || $e.addEventListener("click", Fe), (Ce = document.getElementById("save-word-btn")) == null || Ce.addEventListener("click", nt), (Te = document.getElementById("send-program-btn")) == null || Te.addEventListener("click", rt), (De = document.getElementById("save-changes-btn")) == null || De.addEventListener("click", at), (Ne = document.getElementById("send-nutrition-btn")) == null || Ne.addEventListener("click", dt), (Me = document.getElementById("dashboard-save-pdf-btn")) == null || Me.addEventListener("click", Fe), (ut = document.getElementById("ai-chat-fab")) == null || ut.addEventListener("click", openChat), (ft = document.getElementById("close-ai-chat-btn")) == null || ft.addEventListener("click", () => closeModal(document.getElementById("ai-chat-modal")!)), (gt = document.getElementById("ai-chat-form")) == null || gt.addEventListener("submit", l => {
        l.preventDefault(), sendMessageToAiChat()
    }), (mt = document.getElementById("close-workout-log-btn")) == null || mt.addEventListener("click", () => closeModal(document.getElementById("workout-log-modal")!)), (bt = document.getElementById("finish-workout-btn")) == null || bt.addEventListener("click", saveWorkoutLog), (document.getElementById("coach-chat-form") as HTMLFormElement)?.addEventListener('submit', (e) => { e.preventDefault(); sendMessageToCoach(); }), st(), ((wt = document.getElementById("workout-days-container")) == null ? void 0 : wt.children.length) === 0 && re(!0), (Tt = document.getElementById("save-template-btn")) == null || Tt.addEventListener("click", () => {
        openModal(document.getElementById("save-template-modal")!)
    }), (Dt = document.getElementById("cancel-save-template-btn")) == null || Dt.addEventListener("click", () => {
        closeModal(document.getElementById("save-template-modal")!)
    }), (Lt = document.getElementById("confirm-save-template-btn")) == null || Lt.addEventListener("click", () => {
        const l = document.getElementById("template-name-input") as HTMLInputElement,
            i = l.value.trim();
        i ? (yt(i, ye()), w(`الگوی «${i}» با موفقیت ذخیره شد.`), l.value = "", closeModal(document.getElementById("save-template-modal")!)) : w("لطفا یک نام برای الگو وارد کنید.", "error")
    }), (zt = document.getElementById("load-template-btn")) == null || zt.addEventListener("click", () => {
        const l = document.getElementById("template-list-container")!,
            i = ht();
        l.innerHTML = "", Object.keys(i).length === 0 ? l.innerHTML = '<p class="text-secondary text-center">هیچ الگوی ذخیره شده‌ای وجود ندارد.</p>' : Object.keys(i).forEach(u => {
            const v = document.createElement("button");
            v.className = "secondary-button w-full text-right", v.textContent = u, v.onclick = () => {
                Je(i[u]), w(`الگوی «${u}» با موفقیت بارگذاری شد.`), closeModal(document.getElementById("load-template-modal")!)
            }, l.appendChild(v)
        }), openModal(document.getElementById("load-template-modal")!)
    }), (Ut = document.getElementById("cancel-load-template-btn")) == null || Ut.addEventListener("click", () => {
        closeModal(document.getElementById("load-template-modal")!)
    });
    
    // Admin Panel New Logic
    document.getElementById("admin-drawer-nav")?.addEventListener("click", (l) => {
        const i = (l.target as HTMLElement).closest(".admin-nav-btn");
        if(i) {
            const tabName = i.getAttribute("data-tab");
            if (!tabName) return;

            document.querySelectorAll("#admin-drawer-nav .admin-nav-btn").forEach(btn => {
                 btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
            });
            document.querySelectorAll("#admin-panel-modal .admin-tab-content").forEach(content => {
                content.classList.toggle("hidden", content.id !== `admin-${tabName}-content`);
            });

            const titleText = document.getElementById('admin-title-text')!;
            if (tabName === 'dashboard') titleText.textContent = 'داشبورد مدیریت';
            if (tabName === 'clients') {
                titleText.textContent = 'مدیریت شاگردان';
                se();
            }
            if (tabName === 'conversations') {
                titleText.textContent = 'گفتگو با شاگردان';
                renderAdminConversations();
            }
            if (tabName === 'templates') {
                titleText.textContent = 'مدیریت الگوها';
                renderAdminTemplates();
            }
        }
    });

    const renderAdminTemplates = () => {
        const l = document.getElementById("admin-template-list")!,
            i = ht();
        l.innerHTML = "", Object.keys(i).length === 0 ? l.innerHTML = '<p class="text-secondary text-center">هیچ الگوی ذخیره شده‌ای وجود ندارد.</p>' : Object.keys(i).forEach(u => {
            const v = document.createElement("div");
            v.className = "flex justify-between items-center p-3 bg-tertiary/50 rounded-lg", v.innerHTML = `<span>${A(u)}</span><button data-name="${A(u)}" class="remove-template-btn text-red-500 hover:bg-red-500/10 p-2 rounded-md"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`, l.appendChild(v)
        }), window.lucide?.createIcons()
    }
    
    document.getElementById("admin-template-list")?.addEventListener("click", l => {
        const i = (l.target as HTMLElement).closest(".remove-template-btn");
        if (i) {
            const u = (i as HTMLElement).dataset.name;
            if (u && confirm(`آیا از حذف الگوی «${u}» مطمئن هستید؟`)) {
                pt(u);
                w(`الگوی «${u}» حذف شد.`);
                renderAdminTemplates();
            }
        }
    });

    const renderAdminConversations = () => {
        const userListContainer = document.getElementById("admin-conversations-user-list")!;
        userListContainer.innerHTML = '';
        const users = O().filter(u => u.username !== 'admin');
        users.forEach(u => {
            const item = document.createElement('div');
            item.className = 'p-3 border-b border-border-primary cursor-pointer hover:bg-tertiary/50 flex items-center gap-3';
            item.dataset.username = u.username;
            const userData = D(u.username);
            const profilePic = (userData.step1 || {}).profilePic || "https://placehold.co/40x40/374151/E5E7EB?text=?";
            item.innerHTML = `<img src="${profilePic}" class="w-10 h-10 rounded-full object-cover">
                              <div>
                                <p class="font-bold">${u.username}</p>
                                <p class="text-xs text-secondary">${u.email}</p>
                              </div>`;
            userListContainer.appendChild(item);
        });
    };

    document.getElementById("admin-conversations-user-list")?.addEventListener('click', e => {
        const userItem = (e.target as HTMLElement).closest('[data-username]') as HTMLElement;
        if (!userItem) return;

        document.querySelectorAll('#admin-conversations-user-list > div').forEach(el => el.classList.remove('bg-tertiary'));
        userItem.classList.add('bg-tertiary');

        const username = userItem.dataset.username!;
        const userData = D(username);
        const chatHistory = userData.chatHistory || [];
        const detailsContainer = document.getElementById('admin-conversation-details')!;
        
        detailsContainer.innerHTML = `
            <div class="p-4 border-b border-border-primary font-bold text-lg">${username}</div>
            <div id="admin-chat-history" class="flex-1 p-4 space-y-4 overflow-y-auto flex flex-col">
                ${chatHistory.length === 0 ? '<p class="text-secondary text-center m-auto">هنوز پیامی رد و بدل نشده است.</p>' :
                chatHistory.map(msg => `
                    <div class="message ${msg.sender === 'user' ? 'user-message' : 'coach-message'}">
                        ${A(msg.message)}
                    </div>
                `).join('')
            }
            </div>
            <form id="send-coach-message-form" class="p-4 border-t border-border-primary flex items-center gap-2 bg-secondary">
                <input type="text" id="coach-message-input" data-username="${username}" class="input-field flex-1" placeholder="پاسخ شما..." required>
                <button type="submit" class="primary-button !rounded-full !p-3"><i data-lucide="send"></i></button>
            </form>
        `;
        const chatHistoryEl = document.getElementById("admin-chat-history")!;
        chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
        window.lucide?.createIcons();
    });

    document.getElementById("admin-conversation-details")?.addEventListener("submit", (p) => {
        p.preventDefault();
        const inputEl = document.getElementById("coach-message-input") as HTMLInputElement;
        const username = inputEl?.dataset.username;
        const message = inputEl?.value.trim();

        if (!username || !message || !inputEl) return;

        const userData = D(username);
        userData.chatHistory = userData.chatHistory || [];
        userData.chatHistory.push({
            sender: 'coach',
            message: message,
            timestamp: new Date().toISOString()
        });
        userData.newMessageFromCoach = true;
        W(username, userData);

        // Update UI
        const chatHistoryContainer = document.getElementById("admin-chat-history");
        if (chatHistoryContainer) {
            const placeholder = chatHistoryContainer.querySelector('p.text-secondary');
            if (placeholder) placeholder.remove();

            const messageEl = document.createElement('div');
            messageEl.className = 'message coach-message';
            messageEl.textContent = message;
            chatHistoryContainer.appendChild(messageEl);
            chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
        }

        inputEl.value = '';
        ae(`پیام برای ${username} ارسال شد.`);
    });
});
