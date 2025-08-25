// This file manages the global state of the application in a centralized way.
import { GoogleGenAI } from "https://esm.run/@google/genai";

interface AppState {
    currentUser: string | null;
    weightChartInstance: any | null;
    genAI: GoogleGenAI | null;
}

const state: AppState = {
    currentUser: null,
    weightChartInstance: null,
    genAI: null,
};

export function getCurrentUser(): string | null {
    return state.currentUser;
}

export function setCurrentUser(username: string | null): void {
    state.currentUser = username;
}

export function getWeightChartInstance(): any | null {
    return state.weightChartInstance;
}

export function setWeightChartInstance(instance: any | null): void {
    if (state.weightChartInstance) {
        state.weightChartInstance.destroy();
    }
    state.weightChartInstance = instance;
}

export function getGenAI(): GoogleGenAI {
    if (!state.genAI) {
        state.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return state.genAI;
}
