import * as functions from 'firebase-functions';
import MediaTypes from '../shared/constants/MediaTypes';
import CorpusSuggestion from '../models/CorpusSuggestion';
import { getUploadSignature } from './utils/MediaAPIs/CorpusMediaAPI';
import { CorpusSuggestion as CorpusSuggestionType } from './utils/interfaces';

export const onMediaSignedRequest = functions.https.onCall(async (
  { id, fileType }:
  { id: string, fileType: MediaTypes },
): Promise<Error | {
  corpusSuggestion: CorpusSuggestionType,
  response: { signedRequest: string, mediaUrl: string },
}> => {
  const corpusSuggestion = await CorpusSuggestion.findById(id);
  if (!corpusSuggestion) {
    throw new functions.https.HttpsError(
      'not-found',
      '',
      'The corpus suggestion doesn\'t exist',
    );
  }
  const response = await getUploadSignature({ id, fileType });
  if (!response.signedRequest) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      '',
      'The request to get the signed url was not successful',
    );
  }
  corpusSuggestion.media = response.mediaUrl;
  corpusSuggestion.markModified('media');
  const savedSuggestion = await corpusSuggestion.save();
  return {
    corpusSuggestion: savedSuggestion.toJSON(),
    response,
  };
});
