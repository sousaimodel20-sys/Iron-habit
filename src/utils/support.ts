import type { Profile } from './storage';

export const cleanSupportPhone = (value: string) => value.trim().replace(/[^\d+]/g, '');

export const hasSupportContact = (profile: Profile) => Boolean(cleanSupportPhone(profile.supportPhone));

export const getSupportContactLabel = (profile: Profile) => profile.supportName.trim() || 'safe person';

export const getSupportLocation = (profile: Profile) => profile.supportLocation.trim();

export const buildMeetingsPath = (profile: Profile) => {
  const location = getSupportLocation(profile);
  return location ? `/meetings?q=${encodeURIComponent(location)}` : '/meetings';
};

export const getMeetingsCtaLabel = (profile: Profile) => {
  const location = getSupportLocation(profile);
  return location ? `Find meetings near ${location}` : 'Find meetings near me';
};

export const buildSupportSmsHref = (profile: Profile, message: string) => {
  const phone = cleanSupportPhone(profile.supportPhone);
  const body = encodeURIComponent(message);
  return phone ? `sms:${phone}?&body=${body}` : `sms:?body=${body}`;
};

export const buildSupportTelHref = (profile: Profile) => {
  const phone = cleanSupportPhone(profile.supportPhone);
  return phone ? `tel:${phone}` : '';
};
