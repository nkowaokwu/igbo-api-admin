import moment from 'moment';
import { Connection } from 'mongoose';
import { getAudioPronunciationByIdHelper } from 'src/backend/controllers/audioPronunciations';
import leanPronunciation from 'src/backend/controllers/exampleSuggestions/helpers/leanPronunciation';
import isEligibleAudioPronunciation from 'src/backend/controllers/exampleSuggestions/helpers/validation/isEligibleAudioPronunciation';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { parseAWSFilePathFromUri } from 'src/utils/parseAWS';

const TIMESTAMP_FORMAT = 'MMM, YYYY';

const handleSentenceRecordingCount = async ({
  pronunciation: dbPronunciation,
  uid,
  final,
  mongooseConnection,
}: {
  pronunciation: Interfaces.PronunciationSchema;
  uid: string;
  final: { [key: string]: { count: number; bytes: number } };
  mongooseConnection: Connection;
}): Promise<void> => {
  const pronunciationMonth = moment(dbPronunciation.updatedAt).startOf('month').format(TIMESTAMP_FORMAT);
  const pronunciation = leanPronunciation(dbPronunciation);
  const isEligible = isEligibleAudioPronunciation({ pronunciation, uid });
  const FilePath = parseAWSFilePathFromUri(pronunciation.audio);
  const audioPronunciation = await getAudioPronunciationByIdHelper({ mongooseConnection, objectId: FilePath });
  if (!final[pronunciationMonth]) {
    final[pronunciationMonth] = { count: 0, bytes: 0 };
  }
  final[pronunciationMonth].count += Number(isEligible);

  if (audioPronunciation) {
    final[pronunciationMonth].bytes += audioPronunciation.toJSON().size || 0;
  }
};

export default handleSentenceRecordingCount;
