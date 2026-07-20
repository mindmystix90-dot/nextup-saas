export const config = {
  appName: 'NextUp',
  storageKeys: {
    settings: 'nextup_settings',
  },
  defaultPlan: 'Pro' as const,
};

export const STORAGE_KEYS = config.storageKeys;
