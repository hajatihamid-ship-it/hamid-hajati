import { GoogleGenAI, Type } from "https://esm.run/@google/genai";
import { getGenAI } from '../state';
import { showToast } from "../utils/dom";
import { getExercisesDB, getSupplementsDB } from "./storage";

export const generateNutritionPlan = async (userData: any): Promise<any | null> => {
    const ai = getGenAI();
    const tdee = userData.step1?.tdee || 2500;
    const goal = userData.step1?.trainingGoal || "حفظ وزن";
    const name = userData.step1?.clientName || "ورزشکار";

    let calorieTarget = tdee;
    if (goal === "کاهش وزن") {
        calorieTarget = tdee * 0.8;
    } else if (goal === "افزایش حجم") {
        calorieTarget = tdee * 1.15;
    }

    const prompt = `
        برای یک ورزشکار به نام "${name}" با هدف "${goal}" و کالری هدف روزانه حدود ${Math.round(calorieTarget)} کیلوکالری، یک برنامه غذایی نمونه برای یک هفته کامل (۷ روز) طراحی کن. این برنامه برای تکرار در طول یک ماه در نظر گرفته شده است.
        برای هر روز هفته، ۵ وعده (صبحانه، میان‌وعده صبح، ناهار، میان‌وعده عصر، شام) با چند گزینه غذایی متنوع پیشنهاد بده.
        در انتها چند نکته عمومی و مهم هم اضافه کن.
        کل خروجی باید به زبان فارسی باشد.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        weeklyPlan: {
                            type: Type.ARRAY,
                            description: "آرایه‌ای از ۷ آبجکت، هر کدام برای یک روز هفته.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    dayName: { type: Type.STRING, description: "نام روز هفته (مثلا 'روز اول: شنبه')." },
                                    meals: {
                                        type: Type.ARRAY,
                                        description: "آرایه‌ای از ۵ آبجکت وعده غذایی برای این روز.",
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                mealName: { type: Type.STRING, description: "نام وعده (مثلا 'صبحانه')." },
                                                options: {
                                                    type: Type.ARRAY,
                                                    description: "چندین گزینه غذایی برای این وعده.",
                                                    items: { type: Type.STRING }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        generalTips: {
                            type: Type.ARRAY,
                            description: "لیستی از نکات عمومی و مهم.",
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("AI Nutrition Plan Error:", error);
        showToast("خطا در تولید برنامه غذایی", "error");
        return null;
    }
};


export const generateWorkoutPlan = async (studentData: any): Promise<any | null> => {
    const ai = getGenAI();
    
    const { age, gender, trainingGoal, trainingDays } = studentData;
    if (!age || !gender || !trainingGoal || !trainingDays) {
        showToast("اطلاعات شاگرد برای تولید برنامه کافی نیست.", "error");
        return null;
    }

    // Create a flat list of available exercises to guide the AI
    const exerciseDB = getExercisesDB();
    const availableExercises = Object.values(exerciseDB).flat().join(', ');

    const prompt = `
        You are an expert fitness coach. Create a personalized ${trainingDays}-day workout plan for a client with the following details:
        - Age: ${age}
        - Gender: ${gender}
        - Primary Goal: ${trainingGoal}

        Instructions:
        1. Design a weekly split appropriate for the number of training days. For example, for 4 days, you might use an Upper/Lower split or a Body Part split.
        2. For each training day, provide a clear name in Persian (e.g., "شنبه: سینه و پشت بازو").
        3. For each exercise, provide a reasonable number of sets, reps, and rest period in seconds, tailored to the client's goal.
        4. ONLY use exercises from this list: ${availableExercises}.
        5. Provide a final "notes" field in Persian with general advice like warming up and hydration.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        days: {
                            type: Type.ARRAY,
                            description: "An array of daily workout objects, one for each training day.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "The name of the workout day (e.g., 'شنبه: سینه و پشت بازو')." },
                                    exercises: {
                                        type: Type.ARRAY,
                                        description: "A list of exercises for this day.",
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                name: { type: Type.STRING, description: "The name of the exercise." },
                                                sets: { type: Type.INTEGER, description: "Number of sets." },
                                                reps: { type: Type.INTEGER, description: "Number of repetitions per set." },
                                                rest: { type: Type.INTEGER, description: "Rest time in seconds between sets." }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        notes: {
                            type: Type.STRING,
                            description: "General notes and advice for the client."
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("AI Workout Plan Error:", error);
        showToast("خطا در تولید برنامه تمرینی با AI", "error");
        return null;
    }
};

export const generateSupplementPlan = async (studentData: any, goal: string): Promise<any[] | null> => {
    const ai = getGenAI();
    const supplementsDB = getSupplementsDB();
    const availableSupplements: string[] = [];
    Object.values(supplementsDB).forEach(category => {
        category.forEach(sup => {
            availableSupplements.push(sup.name);
        });
    });

    const prompt = `
        Based on the client's primary goal of "${goal}" and their details (Age: ${studentData.age}, Gender: ${studentData.gender}), suggest a stack of 2 to 4 essential supplements.
        For each supplement, provide the most common "dosage" and "timing" based on its properties, selecting from the available options for each supplement.
        ONLY use supplements from this list: ${availableSupplements.join(', ')}.
        Do not suggest anything not on the list.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        supplements: {
                            type: Type.ARRAY,
                            description: "An array of suggested supplement objects.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "Name of the supplement." },
                                    dosage: { type: Type.STRING, description: "Suggested dosage." },
                                    timing: { type: Type.STRING, description: "Suggested timing for consumption." }
                                }
                            }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result.supplements || null;
    } catch (error) {
        console.error("AI Supplement Plan Error:", error);
        showToast("خطا در پیشنهاد مکمل با AI", "error");
        return null;
    }
};