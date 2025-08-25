// This file contains all business logic calculations for fitness metrics.

export const calculateBodyMetrics = (container: HTMLElement) => {
    const form = container.closest('form') ?? container;
    const s = parseFloat((container.querySelector(".age-slider") as HTMLInputElement).value),
        r = parseFloat((container.querySelector(".height-slider") as HTMLInputElement).value),
        a = parseFloat((container.querySelector(".weight-slider") as HTMLInputElement).value),
        n = container.querySelector('input[name^="gender"]:checked, input[name^="gender_user"]:checked') as HTMLInputElement;

    if (!n) return null;

    const o = n.value === "مرد",
        m = container.querySelector('input[name^="activity_level"]:checked, input[name^="activity_level_user"]:checked') as HTMLInputElement,
        d = m ? parseFloat(m.value) : 1.2,
        c = parseFloat((container.querySelector(".neck-input") as HTMLInputElement).value),
        g = parseFloat((container.querySelector(".waist-input") as HTMLInputElement).value),
        x = parseFloat((container.querySelector(".hip-input") as HTMLInputElement).value);

    const clearMetrics = () => {
        [".bmi-input", ".bmr-input", ".tdee-input", ".bodyfat-input", ".lbm-input", ".ideal-weight-input"].forEach(selector => {
            const input = form.querySelector(selector) as HTMLInputElement;
            if (input) input.value = "";
        });
    };

    if (isNaN(r) || isNaN(a) || r <= 0 || a <= 0) {
        clearMetrics();
        return null;
    }

    const heightInMeters = r / 100;
    const bmi = a / (heightInMeters * heightInMeters);
    const bmr = o ? 10 * a + 6.25 * r - 5 * s + 5 : 10 * a + 6.25 * r - 5 * s - 161;

    let bodyFat = 0;
    if (!isNaN(c) && !isNaN(g) && c > 0 && g > 0) {
        if (o) {
            bodyFat = 86.01 * Math.log10(g - c) - 70.041 * Math.log10(r) + 36.76;
        } else if (!isNaN(x) && x > 0) {
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

    // Update DOM input fields
    (form.querySelector(".bmi-input") as HTMLInputElement).value = metrics.bmi?.toString() || '';
    (form.querySelector(".bmr-input") as HTMLInputElement).value = metrics.bmr?.toString() || '';
    (form.querySelector(".tdee-input") as HTMLInputElement).value = metrics.tdee?.toString() || '';
    (form.querySelector(".ideal-weight-input") as HTMLInputElement).value = metrics.idealWeight;
    (form.querySelector(".bodyfat-input") as HTMLInputElement).value = metrics.bodyFat?.toString() || '';
    (form.querySelector(".lbm-input") as HTMLInputElement).value = metrics.lbm?.toString() || '';
    
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
    if (!userData.step2 || !userData.step2.days || userData.step2.days.length === 0) return null;
    const today = new Date().getDay();
    const trainingDaysCount = userData.step2.days.length;
    const dayMapping: { [key: number]: number[] } = {
        1: [3], 2: [2, 5], 3: [1, 3, 5], 4: [1, 2, 4, 5],
        5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6]
    };
    const schedule = dayMapping[trainingDaysCount] || dayMapping[4];
    const todayIndexInSchedule = schedule.indexOf(today);
    if (todayIndexInSchedule !== -1 && userData.step2.days[todayIndexInSchedule]) {
        return {
            day: userData.step2.days[todayIndexInSchedule],
            dayIndex: todayIndexInSchedule
        };
    }
    return null;
};