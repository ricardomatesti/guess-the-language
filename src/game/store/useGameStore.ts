import { create } from "zustand";
import { persist } from "zustand/middleware";
import { languages } from "../languages";
import useIsMobile from "../hooks/useIsMobile";

export type statusType = "correct" | "skipped" | "incorrect" | "current" | "locked";
export type GameStatusType = "notStarted" | "loading" | "started" | "won" | "lost";

export type Step = {
    id: number;
    status: statusType;
    name: string;
};

export type Guess = {
    language: string;
    mistake: boolean;
};

interface GameState {
    gameStatus: GameStatusType;
    currentShowingStep: number;
    currentPlayingStep: number;
    steps: Step[];
    guesses: Guess[];
    formError: string | undefined;
    guessingData: any; // TODO: Define type
    streak: number;
    record: number;
    tries: number;
    isMobile: boolean;
    setMobile: (isMobile: boolean) => void;
    setFormError: (error: string | undefined) => void;
    startGame: () => Promise<void>;
    checkGuess: (guess: string, setFormText: (text: string) => void) => void;
    skipLevel: () => void;
    moveToLevel: (type: "up" | "down") => void;
    goToLevel: (level: number) => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            gameStatus: "notStarted",
            currentShowingStep: 1,
            currentPlayingStep: 0,
            steps: [
                { id: 1, status: "current", name: "No. of speakers" },
                { id: 2, status: "locked", name: "Word" },
                { id: 3, status: "locked", name: "Audio" },
                { id: 4, status: "locked", name: "Sentence" },
                { id: 5, status: "locked", name: "Country" },
            ],
            guesses: [],
            formError: undefined,
            guessingData: undefined,
            streak: 0,
            record: 0,
            tries: 0,
            isMobile: false,

            setMobile: (isMobile) => set({ isMobile }),
            setFormError: (formError) => set({ formError }),

            startGame: async () => {
                set({
                    gameStatus: "loading",
                    steps: [
                        { id: 1, status: "current", name: "No. of speakers" },
                        { id: 2, status: "locked", name: "Word" },
                        { id: 3, status: "locked", name: "Audio" },
                        { id: 4, status: "locked", name: "Sentence" },
                        { id: 5, status: "locked", name: "Country" },
                    ],
                    guesses: [],
                    currentShowingStep: 1,
                    currentPlayingStep: 0,
                    tries: 0,
                });

                try {
                    const response = await fetch("/data/data.json");
                    const data = await response.json();
                    const langs = data["languages"];
                    const randomIndex = Math.floor(langs.length * Math.random());
                    set({ guessingData: langs[randomIndex], gameStatus: "started" });
                } catch (error) {
                    console.error("Error loading JSON:", error);
                    set({ gameStatus: "notStarted" });
                }
            },

            checkGuess: (guess, setFormText) => {
                const trimmedGuess = guess.trim();
                const { currentPlayingStep, guessingData, streak, record } = get();

                if (trimmedGuess === "") {
                    set({ formError: "You must write something" });
                    return;
                }

                if (!languages.includes(trimmedGuess)) {
                    set({ formError: "Select a language from the list" });
                    return;
                }

                set((state) => ({ tries: state.tries + 1 }));

                const isWin = trimmedGuess.toLowerCase() === guessingData["name"].toLowerCase();

                if (isWin) {
                    const nextStreak = streak + 1;
                    const nextRecord = Math.max(nextStreak, record);
                    set({ gameStatus: "won", streak: nextStreak, record: nextRecord });
                    return;
                }

                if (currentPlayingStep === 4) {
                    set({ gameStatus: "lost", streak: 0 });
                    return;
                }

                set((state) => {
                    const newSteps = [...state.steps];
                    newSteps[currentPlayingStep] = { ...newSteps[currentPlayingStep], status: "incorrect" };
                    newSteps[currentPlayingStep + 1] = { ...newSteps[currentPlayingStep + 1], status: "current" };

                    return {
                        steps: newSteps,
                        guesses: [...state.guesses, { language: guess, mistake: true }],
                        currentShowingStep: currentPlayingStep + 2,
                        currentPlayingStep: currentPlayingStep + 1,
                    };
                });
                setFormText("");
            },

            skipLevel: () => {
                const { currentPlayingStep } = get();
                set((state) => {
                    const newSteps = [...state.steps];
                    newSteps[currentPlayingStep] = { ...newSteps[currentPlayingStep], status: "skipped" };
                    newSteps[currentPlayingStep + 1] = { ...newSteps[currentPlayingStep + 1], status: "current" };

                    return {
                        steps: newSteps,
                        currentShowingStep: currentPlayingStep + 2,
                        currentPlayingStep: currentPlayingStep + 1,
                    };
                });
            },

            moveToLevel: (type) => {
                set((state) => ({
                    currentShowingStep: type === "up" ? state.currentShowingStep + 1 : state.currentShowingStep - 1
                }));
            },

            goToLevel: (level) => {
                const { steps } = get();
                if (steps[level - 1].status !== "locked") {
                    set({ currentShowingStep: level });
                }
            },
        }),
        {
            name: "game-storage",
            partialize: (state) => ({ streak: state.streak, record: state.record }),
        }
    )
);
