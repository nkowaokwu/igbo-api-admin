import last from 'lodash/last';
import compact from 'lodash/compact';

export const isPronunciationMp3 = (url = ''): boolean => url.includes('.mp3');

export const getPronunciationId = (url: string): string => (
  last(compact(url.split(/.mp3|.webm/).join('').split('/')))
);
