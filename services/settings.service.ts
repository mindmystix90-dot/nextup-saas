'use client';

import { STORAGE_KEYS } from '@/config';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: Record<string, boolean>;
  privacy: Record<string, boolean>;
}

export const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'en',
  notifications: {
    live_class: true,
    course_updates: true,
    community: false,
    affiliate: true,
    promotions: false,
    newsletter: true,
  },
  privacy: {
    profile_public: true,
    show_progress: true,
    show_in_leaderboard: false,
    analytics: true,
  },
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export const settingsService = {
  getSettings(): UserSettings {
    if (!isBrowser()) return defaultSettings;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.settings);
      return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },

  saveSettings(settings: UserSettings): void {
    if (!isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  },

  updateSettings(partial: Partial<UserSettings>): UserSettings {
    const next = { ...this.getSettings(), ...partial };
    this.saveSettings(next);
    return next;
  },

  resetSettings(): UserSettings {
    this.saveSettings(defaultSettings);
    return defaultSettings;
  },
};
