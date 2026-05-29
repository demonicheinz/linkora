"use client";

import { create } from "zustand";

export interface DesignState {
  // Theme
  theme: string;

  // Header
  headerLayout: string;
  avatarShape: string;
  bannerUrl: string | null;

  // Wallpaper
  wallpaperStyle: string;
  wallpaperColor: string;
  wallpaperGradient: string;
  gradientDirection: string;
  gradientNoise: boolean;
  wallpaperPattern: string;
  wallpaperImageUrl: string | null;
  wallpaperVideoUrl: string | null;
  videoCropX: number | null;
  videoCropY: number | null;
  videoCropWidth: number | null;
  videoCropHeight: number | null;
  wallpaperBlur: number;
  imageEffect: string;
  imageTint: number;
  videoTint: number;

  // Text
  pageFontFamily: string;
  pageTextColor: string;
  altTitleFont: boolean;
  titleFontFamily: string;
  titleColor: string;
  bioColor: string;

  // Button
  buttonStyle: string;
  buttonShadow: string;
  buttonCorner: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonShadowColor: string;

  // Footer
  hideFooter: boolean;
  customFooterText: string;
  customFooterUrl: string;

  displayName: string;
}

interface DesignStore {
  state: DesignState;
  history: DesignState[];
  historyIndex: number;
  isDirty: boolean;
  originalState: DesignState | null;

  setState: (partial: Partial<DesignState>) => void;
  initializeFromServer: (data: DesignState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  markClean: () => void;
  discardChanges: () => void;
  getSavePayload: () => Partial<DesignState>;
}

const defaultState: DesignState = {
  theme: "default",
  headerLayout: "classic",
  avatarShape: "flower",
  bannerUrl: null,
  wallpaperStyle: "fill",
  wallpaperColor: "#0A0A0A",
  wallpaperGradient: "linear-gradient(180deg,#667eea,#764ba2)",
  gradientDirection: "linear-top",
  gradientNoise: false,
  wallpaperPattern: "grid",
  wallpaperImageUrl: null,
  wallpaperVideoUrl: null,
  videoCropX: null,
  videoCropY: null,
  videoCropWidth: null,
  videoCropHeight: null,
  wallpaperBlur: 10,
  imageEffect: "none",
  imageTint: 10,
  videoTint: 10,
  pageFontFamily: "inter",
  pageTextColor: "#EAEAEA",
  altTitleFont: false,
  titleFontFamily: "inter",
  titleColor: "#FFFFFF",
  bioColor: "#AAAAAA",
  buttonStyle: "solid",
  buttonShadow: "none",
  buttonCorner: "round",
  buttonColor: "#2A2A2A",
  buttonTextColor: "#EAEAEA",
  buttonShadowColor: "#000000",
  hideFooter: false,
  customFooterText: "Buat Linkora-mu",
  customFooterUrl: "https://linkora.heinz.id",
  displayName: "",
};

export const useDesignStore = create<DesignStore>((set, get) => ({
  state: { ...defaultState },
  history: [{ ...defaultState }],
  historyIndex: 0,
  isDirty: false,
  originalState: null,

  setState: (partial) => {
    const { state, history, historyIndex } = get();
    const newState = { ...state, ...partial };
    // Truncate future history
    const newHistory = [...history.slice(0, historyIndex + 1), newState];
    set({
      state: newState,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
    });
  },

  initializeFromServer: (data) => {
    set({
      state: { ...defaultState, ...data },
      history: [{ ...defaultState, ...data }],
      historyIndex: 0,
      isDirty: false,
      originalState: { ...defaultState, ...data },
    });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        state: { ...history[newIndex] },
        historyIndex: newIndex,
        isDirty: true,
      });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        state: { ...history[newIndex] },
        historyIndex: newIndex,
        isDirty: true,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  markClean: () => {
    const { state } = get();
    set({
      isDirty: false,
      originalState: { ...state },
      history: [{ ...state }],
      historyIndex: 0,
    });
  },

  discardChanges: () => {
    const { originalState } = get();
    if (originalState) {
      set({
        state: { ...originalState },
        history: [{ ...originalState }],
        historyIndex: 0,
        isDirty: false,
      });
    }
  },

  getSavePayload: () => {
    return { ...get().state };
  },
}));
