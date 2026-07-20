'use client';

import { useCallback, useEffect, useState } from 'react';
import { settingsService, type UserSettings } from '@/services/settings.service';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(settingsService.getSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSettings(settingsService.getSettings());
    setLoading(false);
  }, []);

  const update = useCallback((partial: Partial<UserSettings>) => {
    const next = settingsService.updateSettings(partial);
    setSettings(next);
    return next;
  }, []);

  const toggleNotification = useCallback((key: string) => {
    const current = settingsService.getSettings();
    const next = settingsService.updateSettings({
      notifications: { ...current.notifications, [key]: !current.notifications[key] },
    });
    setSettings(next);
    return next;
  }, []);

  const togglePrivacy = useCallback((key: string) => {
    const current = settingsService.getSettings();
    const next = settingsService.updateSettings({
      privacy: { ...current.privacy, [key]: !current.privacy[key] },
    });
    setSettings(next);
    return next;
  }, []);

  const reset = useCallback(() => {
    const next = settingsService.resetSettings();
    setSettings(next);
    return next;
  }, []);

  return { settings, loading, update, toggleNotification, togglePrivacy, reset };
}
