import type { CheckIn } from './storage';

export const EMERGENCY_SUPPORT_SMS = 'I need support right now. I am about to drink and staying sober for the next 10 minutes. Can you check in with me?';

const explicitLevelPattern = /(?:craving|urge|crave)\D*(10|[0-9])|\b(10|[0-9])\s*\/\s*10\b/i;

export const parseEmergencyCravingLevel = (command: string, fallback = 10) => {
  const match = command.match(explicitLevelPattern);
  const value = Number(match?.[1] || match?.[2] || fallback);
  return Math.max(0, Math.min(10, value));
};

export const isEmergencySupportCommand = (command: string) => (
  /\b(help now|need help now|support now|rescue me|panic|spiraling|spiralling|about to cave|about to drink|going to drink|gonna drink|might drink|close to drinking)\b/i.test(command)
  || (/\b(drink|relapse|craving|urge|emergency|rescue)\b/i.test(command) && /\b(now|urgent|emergency|support|safe person|contact|text|sms|call)\b/i.test(command))
);

export const wantsEmergencySupportText = (command: string) => /\b(text|message|sms)\b/i.test(command)
  && /\b(support|safe person|contact|sponsor|someone|person)\b/i.test(command);

export const wantsEmergencySupportCall = (command: string) => /\b(call|phone|ring)\b/i.test(command)
  && /\b(support|safe person|contact|sponsor|someone|person)\b/i.test(command);

export const wantsEmergencyMeetings = (command: string) => /\b(meeting|meetings|aa|na|group)\b/i.test(command);

const appendNote = (existingNote: string | undefined, next: string) => [existingNote, next].filter(Boolean).join('\n');

export const buildEmergencyCommandCheckIn = ({
  existing,
  rawCommand,
  todayKey,
  fallbackCraving = 10,
}: {
  existing?: CheckIn;
  rawCommand: string;
  todayKey: string;
  fallbackCraving?: number;
}): CheckIn => {
  const craving = Math.max(existing?.craving ?? 0, parseEmergencyCravingLevel(rawCommand, fallbackCraving));

  return {
    date: todayKey,
    sober: existing?.sober ?? true,
    mood: 'Emergency rescue',
    craving,
    habitsCompleted: Array.from(new Set([...(existing?.habitsCompleted || []), 'No alcohol', 'Emergency support chain'])),
    note: appendNote(existing?.note, `Emergency command from Talk: ${rawCommand}`),
  };
};

export const emergencyRescuePath = '/rescue?chain=1';
