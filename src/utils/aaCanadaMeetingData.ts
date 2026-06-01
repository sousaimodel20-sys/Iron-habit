import { useEffect, useState } from 'react';

import type { AaCanadaMeetingIndexPayload } from './meetings';

export const AA_CANADA_MEETING_INDEX_URL = '/data/aa-canada-meeting-index.json';

let cachedAaCanadaMeetingIndex: AaCanadaMeetingIndexPayload | null = null;
let pendingAaCanadaMeetingIndex: Promise<AaCanadaMeetingIndexPayload | null> | null = null;

export const loadAaCanadaMeetingIndex = async (): Promise<AaCanadaMeetingIndexPayload | null> => {
  if (cachedAaCanadaMeetingIndex) return cachedAaCanadaMeetingIndex;
  if (pendingAaCanadaMeetingIndex) return pendingAaCanadaMeetingIndex;

  pendingAaCanadaMeetingIndex = fetch(AA_CANADA_MEETING_INDEX_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`AA Canada meeting index HTTP ${response.status}`);
      return response.json() as Promise<AaCanadaMeetingIndexPayload>;
    })
    .then((payload) => {
      cachedAaCanadaMeetingIndex = payload;
      return payload;
    })
    .catch(() => null)
    .finally(() => {
      pendingAaCanadaMeetingIndex = null;
    });

  return pendingAaCanadaMeetingIndex;
};

export const useAaCanadaMeetingIndex = () => {
  const [payload, setPayload] = useState<AaCanadaMeetingIndexPayload | null>(cachedAaCanadaMeetingIndex);

  useEffect(() => {
    let isActive = true;
    loadAaCanadaMeetingIndex().then((nextPayload) => {
      if (isActive) setPayload(nextPayload);
    });
    return () => {
      isActive = false;
    };
  }, []);

  return payload;
};
