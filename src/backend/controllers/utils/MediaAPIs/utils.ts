import { connectDatabase, disconnectDatabase } from 'src/backend/utils/database';
import AudioEventType from 'src/backend/shared/constants/AudioEventType';
import { audioPronunciationSchema } from 'src/backend/models/AudioPronunciation';
import { AudioPronunciation } from 'src/backend/controllers/utils/interfaces';

/**
 * Handles creating AudioPronunciation documents depending on the action
 * @returns
 */
export const handleAudioPronunciation = async ({
  key,
  size,
  event,
}: {
  key: string;
  size?: number;
  event: AudioEventType;
}): Promise<any> => {
  try {
    const connection = await connectDatabase();
    const AudioPronunciation = connection.model<AudioPronunciation>('AudioPronunciation', audioPronunciationSchema);
    let savedAudioPronunciation = null;
    // Handles DELETE events
    if (event === AudioEventType.DELETE) {
      await AudioPronunciation.deleteOne({ objectId: key });
    } else {
      const existingAudioPronunciation = await AudioPronunciation.findOne({ objectId: key });

      // Handles PUT and COPY events
      if (existingAudioPronunciation) {
        existingAudioPronunciation.prevSize = existingAudioPronunciation.size;
        existingAudioPronunciation.size = size;
        savedAudioPronunciation = await existingAudioPronunciation.save();
        savedAudioPronunciation = savedAudioPronunciation.toJSON();
      } else {
        // Handles POST events
        const audioPronunciation = new AudioPronunciation({
          objectId: key,
          size,
        });
        savedAudioPronunciation = await audioPronunciation.save();
        savedAudioPronunciation = savedAudioPronunciation.toJSON();
      }
    }

    await disconnectDatabase();
    return savedAudioPronunciation;
  } catch (err) {
    await disconnectDatabase();
    return null;
  }
};
