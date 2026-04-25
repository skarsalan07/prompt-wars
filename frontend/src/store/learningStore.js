import { create } from 'zustand'

export const useLearningStore = create((set) => ({
  currentTopic: '',
  currentLevel: 'simple',
  explanation: null,
  quiz: null,
  evaluations: [],       // array of EvaluateResponse
  isLoadingExplain: false,
  isLoadingQuiz: false,
  progress: null,
  recommendations: null,

  setTopic: (topic) => set({ currentTopic: topic }),
  setLevel: (level) => set({ currentLevel: level }),
  setExplanation: (explanation) => set({ explanation }),
  setQuiz: (quiz) => set({ quiz }),
  addEvaluation: (ev) =>
    set((state) => ({ evaluations: [...state.evaluations, ev] })),
  setLoadingExplain: (v) => set({ isLoadingExplain: v }),
  setLoadingQuiz: (v) => set({ isLoadingQuiz: v }),
  setProgress: (progress) => set({ progress }),
  setRecommendations: (recommendations) => set({ recommendations }),
  resetLearn: () =>
    set({ explanation: null, quiz: null, evaluations: [], currentTopic: '', currentLevel: 'simple' }),
}))
