import MediaTypes from 'src/backend/shared/constants/MediaTypes';
import Collections from 'src/shared/constants/Collection';

export type DataPayload = { id: string; file: File };
export type CorpusData = { id: string; fileType: MediaTypes };
export type TextImageData = { id: string; fileType: MediaTypes };

export type Media = {
  collection: Collections;
  data: DataPayload;
};

export type MediaSignedPayload = {
  collection: Collections;
  data: CorpusData;
};

export type SignedMediaResponse = { signedRequest: string; mediaUrl: string };
