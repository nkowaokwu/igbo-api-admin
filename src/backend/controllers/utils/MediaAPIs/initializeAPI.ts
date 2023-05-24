import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import {
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET,
  AWS_REGION,
} from 'src/backend/config';

const bucket = AWS_BUCKET;
const region = AWS_REGION;

const baseParams = {
  Bucket: bucket,
};

const s3Config: S3ClientConfig = {
  region,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
};

const s3: S3Client = new S3Client(s3Config);

const initializeAPI = (mediaPath: string): {
  bucket: string,
  uriPath: string,
  dummyUriPath: string,
  mediaPath: string,
  baseParams: {
    [key: string]: string
  },
  s3: S3Client,
} => {
  if (!mediaPath) {
    throw new Error('Media Path is required');
  }
  const uriPath = `https://${bucket}.s3.${region}.amazonaws.com/${mediaPath}`;
  const dummyUriPath = `https://igbo-api-test-local/${mediaPath}/`;
  return {
    bucket,
    uriPath,
    dummyUriPath,
    mediaPath,
    baseParams,
    s3,
  };
};

export default initializeAPI;
