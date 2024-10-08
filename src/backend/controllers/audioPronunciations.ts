import { Connection } from 'mongoose';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { audioPronunciationSchema } from 'src/backend/models/AudioPronunciation';

/**
 * Gets an AudioPronunciation by its
 * @param param0
 * @returns Single AudioPronunciation
 */
export const getAudioPronunciationByIdHelper = async ({
  mongooseConnection,
  objectId,
}: {
  mongooseConnection: Connection;
  objectId: string;
}): Promise<Interfaces.AudioPronunciation> => {
  const AudioPronunciation = mongooseConnection.model<Interfaces.AudioPronunciation>(
    'AudioPronunciation',
    audioPronunciationSchema,
  );
  return AudioPronunciation.findOne({ objectId });
};
