import MediaTypes from 'src/backend/shared/constants/MediaTypes';
import Collections from 'src/shared/constants/Collection';

export type CorpusPayload = { id: string; fileType: MediaTypes };

export type MediaSignedPayload = {
  collection: Collections;
  data: CorpusPayload;
};

export type SignedMediaResponse = { response: { signedRequest: string; mediaUrl: string } };
