export const languages: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
];

export const notificationPreferences: {
  key: string;
  title: string;
  description: string;
  defaultEnabled: boolean;
}[] = [
  { key: 'live_class', title: 'Live class reminders', description: 'Get notified before every scheduled live session.', defaultEnabled: true },
  { key: 'course_updates', title: 'Course updates', description: 'New lessons, content drops, and course announcements.', defaultEnabled: true },
  { key: 'community', title: 'Community activity', description: 'Replies to your posts and trending discussions.', defaultEnabled: false },
  { key: 'affiliate', title: 'Affiliate activity', description: 'When a referral joins or you earn a payout.', defaultEnabled: true },
  { key: 'promotions', title: 'Promotions & offers', description: 'Occasional discounts and seasonal offers.', defaultEnabled: false },
  { key: 'newsletter', title: 'Weekly newsletter', description: 'A digest of what to learn next, every Sunday.', defaultEnabled: true },
];

export const privacyPreferences: {
  key: string;
  title: string;
  description: string;
  defaultEnabled: boolean;
}[] = [
  { key: 'profile_public', title: 'Public profile', description: 'Allow other learners to view your profile and progress.', defaultEnabled: true },
  { key: 'show_progress', title: 'Show course progress', description: 'Display enrolled courses and certificates on your profile.', defaultEnabled: true },
  { key: 'show_in_leaderboard', title: 'Appear in leaderboard', description: 'Be ranked in the community leaderboard.', defaultEnabled: false },
  { key: 'analytics', title: 'Usage analytics', description: 'Help improve NextUp by sharing anonymous usage data.', defaultEnabled: true },
];
