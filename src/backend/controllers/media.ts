import * as functions from 'firebase-functions/v1';
import { Connection } from 'mongoose';
import {
  CorpusData,
  TextImageData,
  MediaSignedPayload,
  SignedMediaResponse,
} from 'src/backend/controllers/utils/types/mediaTypes';
import Collection from 'src/shared/constants/Collection';
import { CorpusSuggestion, TextImage } from 'src/backend/controllers/utils/interfaces';
import { textImageSchema } from 'src/backend/models/TextImage';
import { corpusSuggestionSchema } from 'src/backend/models/CorpusSuggestion';
import { getTextMediaUploadSignature } from 'src/backend/controllers/utils/MediaAPIs/TextImageMediaAPI';
import { getCorpusUploadSignature } from './utils/MediaAPIs/CorpusMediaAPI';
import { connectDatabase } from '../utils/database';

/* Attaches the Corpus Suggestion media with the uploaded media */
export const updateCorpusSuggestion = async ({
  mongooseConnection,
  data: { id, fileType },
}: {
  mongooseConnection: Connection;
  data: CorpusData;
}): Promise<SignedMediaResponse> => {
  const CorpusSuggestion = mongooseConnection.model<CorpusSuggestion>('CorpusSuggestion', corpusSuggestionSchema);
  const corpusSuggestion = await CorpusSuggestion.findById(id);
  if (!corpusSuggestion) {
    throw new functions.https.HttpsError('not-found', '', "The corpus suggestion doesn't exist");
  }
  const response = await getCorpusUploadSignature({ id, fileType });
  if (!response.signedRequest) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      '',
      'The request to get the signed url was not successful',
    );
  }
  corpusSuggestion.media = response.mediaUrl;
  corpusSuggestion.markModified('media');
  await corpusSuggestion.save();
  return response;
};

/* Attaches the Text Image media with the uploaded media */
export const updateTextImage = async ({
  mongooseConnection,
  data: { id, fileType },
}: {
  mongooseConnection: Connection;
  data: TextImageData;
}): Promise<SignedMediaResponse> => {
  const TextImage = mongooseConnection.model<TextImage>('TextImage', textImageSchema);
  const textImage = await TextImage.findById(id);
  if (!textImage) {
    throw new functions.https.HttpsError('not-found', '', "The text image doesn't exist");
  }
  const response = await getTextMediaUploadSignature({ id, fileType });
  if (!response.signedRequest) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      '',
      'The request to get the signed url was not successful',
    );
  }
  textImage.media = response.mediaUrl;
  textImage.markModified('media');
  await textImage.save();
  return response;
};

export const onMediaSignedRequest = functions.https.onCall(
  async ({ collection, data }: MediaSignedPayload): Promise<Error | SignedMediaResponse> => {
    const mongooseConnection = await connectDatabase();
    switch (collection) {
      case Collection.CORPUS_SUGGESTIONS:
        return updateCorpusSuggestion({ mongooseConnection, data });
      case Collection.TEXT_IMAGES:
        return updateTextImage({ mongooseConnection, data });
      default:
        return null;
    }
  },
);
