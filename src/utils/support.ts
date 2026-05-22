import type { Profile } from './storage';

const cleanPhone = (value: string) => value.trim().replace(/[^\d+]/g, '');

export const hasSupportContact = (profile: Profile) => Boolean(cleanPhone(profile.supportPhone));

export const getSupportContactLabel = (profile: Profile) => profile.supportName.trim() || 'safe person';

export const buildSupportSmsHref = (profile: Profile, message: string) => {
  const phone = cleanPhone(profile.supportPhone);
  const body = encodeURIComponent(message);
  return phone ? `sms:${phone}?&body=${body}` : `sms:?body=${body}`;
};
