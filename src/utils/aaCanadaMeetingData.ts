import { useCallback, useEffect, useState } from 'react';

import type { AaCanadaMeetingIndexPayload } from './meetings';

export const AA_CANADA_MEETING_INDEX_URL = '/data/aa-canada-meeting-index.json';

type AaCanadaMeetingIndexState = {
  payload: AaCanadaMeetingIndexPayload | null;
  isLoading: boolean;
  error: string;
  reload: () => void;
};

let cachedAaCanadaMeetingIndex: AaCanadaMeetingIndexPayload | null = null;
let pendingAaCanadaMeetingIndex: Promise<AaCanadaMeetingIndexPayload | null> | null = null;
let lastAaCanadaMeetingIndexError = '';

export const loadAaCanadaMeetingIndex = async (forceReload = false): Promise<AaCanadaMeetingIndexPayload | null> => {
  if (forceReload) {
    cachedAaCanadaMeetingIndex = null;
    lastAaCanadaMeetingIndexError = '';
  }
  if (cachedAaCanadaMeetingIndex) return cachedAaCanadaMeetingIndex;
  if (pendingAaCanadaMeetingIndex) return pendingAaCanadaMeetingIndex;

  pendingAaCanadaMeetingIndex = fetch(AA_CANADA_MEETING_INDEX_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`AA Canada meeting index HTTP ${response.status}`);
      return response.json() as Promise<AaCanadaMeetingIndexPayload>;
    })
    .then((payload) => {
      cachedAaCanadaMeetingIndex = payload;
      lastAaCanadaMeetingIndexError = '';
      return payload;
    })
    .catch((error: unknown) => {
      lastAaCanadaMeetingIndexError = error instanceof Error ? error.message : 'AA Canada starter data unavailable';
      return null;
    })
    .finally(() => {
      pendingAaCanadaMeetingIndex = null;
    });

  return pendingAaCanadaMeetingIndex;
};

export const useAaCanadaMeetingIndex = (): AaCanadaMeetingIndexState => {
  const [payload, setPayload] = useState<AaCanadaMeetingIndexPayload | null>(cachedAaCanadaMeetingIndex);
  const [isLoading, setIsLoading] = useState(!cachedAaCanadaMeetingIndex && !lastAaCanadaMeetingIndexError);
  const [error, setError] = useState(lastAaCanadaMeetingIndexError);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    loadAaCanadaMeetingIndex(reloadKey > 0).then((nextPayload) => {
      if (!isActive) return;
      setPayload(nextPayload);
      setError(nextPayload ? '' : lastAaCanadaMeetingIndexError || 'AA Canada starter data unavailable');
      setIsLoading(false);
    });
    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setPayload(null);
    setError('');
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  return { payload, isLoading, error, reload };
};
