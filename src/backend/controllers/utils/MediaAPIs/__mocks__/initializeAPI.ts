import AWS from 'aws-sdk';

const bucket = 'AWS_BUCKET';
const region = 'AWS_REGION';

const baseParams = {
  Bucket: bucket,
};

const s3 = (() => {
  AWS.config.update({
    accessKeyId: 'AWS_ACCESS_KEY',
    secretAccessKey: 'AWS_SECRET_ACCESS_KEY',
    region,
  });

  return new AWS.S3();
})();

const initializeAPI = (
  mediaPath: string,
): {
  bucket: string;
  uriPath: string;
  dummyUriPath: string;
  mediaPath: string;
  baseParams: {
    Bucket: string;
    [key: string]: string;
  };
  s3: AWS.S3;
} => {
  if (!mediaPath) {
    throw new Error('Media Path is required');
  }
  const uriPath = `https://${bucket}.s3.${region}.amazonaws.com/${mediaPath}`;
  const dummyUriPath = `https://igbo-api-test-local.com/${mediaPath}/`;
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
