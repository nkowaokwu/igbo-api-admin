import StatTypes from 'src/backend/shared/constants/StatTypes';

interface RecordedStatInfo {
  stats: Record<string, { count: number; bytes: number }>;
}

interface TranslatedStatInfo {
  stats: Record<string, number>;
}

export interface FetchedStats {
  [StatTypes.RECORDINGS]?: RecordedStatInfo;
  [StatTypes.TRANSLATIONS]?: TranslatedStatInfo;
}
