// This file contains all business logic calculations for fitness metrics.

export const performMetricCalculations = (data: { age: number, height: number, weight: number, gender: string, activityLevel: number, neck?: number, waist?: number, hip?: number }) => {
    const { age, height, weight, gender, activityLevel, neck, waist, hip } = data;
    if (!age || !height || !weight || !gender) return null;

    const s = age, r = height, a = weight;
    const o = gender === "مرد";
    const d = activityLevel;
    const c = neck, g = waist, x = hip;

    const heightInMeters = r / 100;
    const bmi = a / (heightInMeters * heightInMeters);
    const bmr = o ? 10 * a + 6.25 * r - 5 * s + 5 : 10 * a + 6.25 * r - 5 * s - 161;

    let bodyFat = 0;
    if (c && g && c > 0 && g > 0) {
        if (o) {
            bodyFat = 86.01 * Math.log10(g - c) - 70.041 * Math.log10(r) + 36.76;
        } else if (x && x > 0) {
            bodyFat = 163.205 * Math.log10(g + x - c) - 97.684 * Math.log10(r) - 78.387;
        }
    }

    const metrics = {
        bmi: !isNaN(bmi) ? parseFloat(bmi.toFixed(1)) : null,
        bmr: !isNaN(bmr) ? Math.round(bmr) : null,
        tdee: null as number | null,
        idealWeight: `${(18.5 * heightInMeters * heightInMeters).toFixed(1)} - ${(24.9 * heightInMeters * heightInMeters).toFixed(1)} kg`,
        bodyFat: null as number | null,
        lbm: null as number | null,
    };

    if (!isNaN(bmr) && !isNaN(d)) {
        metrics.tdee = Math.round(bmr * d);
    }
    
    if (bodyFat > 0 && bodyFat < 100) {
        metrics.bodyFat = parseFloat(bodyFat.toFixed(1));
        metrics.lbm = parseFloat((a * (1 - bodyFat / 100)).toFixed(1));
    }

    return metrics;
};


export const calculateBodyMetrics = (container: HTMLElement) => {
    const form = container.closest('form') ?? container;
    const s = parseFloat((container.querySelector(".age-slider") as HTMLInputElement).value);
    const r = parseFloat((container.querySelector(".height-slider") as HTMLInputElement).value);
    const a = parseFloat((container.querySelector(".weight-slider") as HTMLInputElement).value);
    const n = container.querySelector('input[name^="gender"]:checked, input[name^="gender_user"]:checked') as HTMLInputElement;

    if (!n) return null;

    const o = n.value === "مرد";
    const m = container.querySelector('input[name="activity_level"]:checked, input[name="activity_level_user"]:checked') as HTMLInputElement;
    const d = m ? parseFloat(m.value) : 1.2;
    
    const neckInput = container.querySelector(".neck-input") as HTMLInputElement | null;
    const waistInput = container.querySelector(".waist-input") as HTMLInputElement | null;
    const hipInput = container.querySelector(".hip-input") as HTMLInputElement | null;
    const c = neckInput ? parseFloat(neckInput.value) : NaN;
    const g = waistInput ? parseFloat(waistInput.value) : NaN;
    const x = hipInput ? parseFloat(hipInput.value) : NaN;

    const clearMetrics = () => {
        [".bmi-input", ".bmr-input", ".tdee-input", ".bodyfat-input", ".lbm-input", ".ideal-weight-input"].forEach(selector => {
            const input = form.querySelector(selector) as HTMLElement;
            if (input) {
                if (input instanceof HTMLInputElement) {
                    input.value = "";
                } else {
                    input.textContent = "–";
                }
            }
        });
    };

    if (isNaN(r) || isNaN(a) || r <= 0 || a <= 0) {
        clearMetrics();
        return null;
    }

    const metrics = performMetricCalculations({
        age: s, height: r, weight: a, gender: n.value, activityLevel: d,
        neck: c, waist: g, hip: x
    });
    
    if (!metrics) {
        clearMetrics();
        return null;
    }

    const updateMetricDisplay = (selector: string, value: string | number | null | undefined) => {
        const element = form.querySelector(selector) as HTMLElement;
        if (element) {
            const displayValue = value?.toString();
            if (element instanceof HTMLInputElement) {
                element.value = displayValue || '';
            } else {
                element.textContent = displayValue || '–';
            }
        }
    };
    
    updateMetricDisplay(".bmi-input", metrics.bmi);
    updateMetricDisplay(".bmr-input", metrics.bmr);
    updateMetricDisplay(".tdee-input", metrics.tdee);
    updateMetricDisplay(".ideal-weight-input", metrics.idealWeight);
    updateMetricDisplay(".bodyfat-input", metrics.bodyFat);
    updateMetricDisplay(".lbm-input", metrics.lbm);
    
    return metrics;
};

export const calculateWorkoutStreak = (history: any[] = []) => {
    if (!history || history.length === 0) return 0;
    const workoutDates = history.map(log => log.date);
    const oneDay = 864e5;
    const uniqueDays = [...new Set(workoutDates.map(dateStr => new Date(dateStr).setHours(0, 0, 0, 0)))].sort((a, b) => b - a);
    if (uniqueDays.length === 0 || (new Date().setHours(0, 0, 0, 0) - uniqueDays[0]) > oneDay) {
        return 0;
    }
    let streak = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
        if ((uniqueDays[i] - uniqueDays[i + 1]) / oneDay === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
};

export const getTodayWorkoutData = (userData: any) => {
    // Find the current program plan from history, with fallback to the top-level property
    const latestProgram = (userData.programHistory && userData.programHistory.length > 0)
        ? userData.programHistory[0]
        : (userData.step2 ? { step2: userData.step2 } : null);

    if (!latestProgram || !latestProgram.step2 || !latestProgram.step2.days || latestProgram.step2.days.length === 0) return null;

    const workoutPlan = latestProgram.step2;
    
    // Match by day name, which is more robust.
    const dayNames = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
    const todayName = dayNames[new Date().getDay()];

    const todayDayIndex = workoutPlan.days.findIndex((day: any) => day.name.startsWith(todayName));

    if (todayDayIndex !== -1 && workoutPlan.days[todayDayIndex].exercises.length > 0) {
        return {
            day: workoutPlan.days[todayDayIndex],
            dayIndex: todayDayIndex
        };
    }
    
    return null;
};