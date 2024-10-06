const AWS_AUDIO_PRONUNCIATIONS_DELIMITER = '/audio-pronunciations/';

/**
 * Parses out the document Id (typically the ExampleSuggestion) from the AWS Key.
 * (i.e. audio-pronunciations/<audioId>.mp3)
 * @param awsId AWS Key
 * @returns Audio Id
 */
export const parseAWSIdFromKey = (awsId: string): string => awsId.split('.')[0].split('/')[1];

/**
 * Parses out the document Key (typically the ExampleSuggestion + file extension) used by AWS to save the file.
 * @param awsUri AWS URI
 * @returns AWS Key of file
 */
export const parseAWSKeyFromUri = (awsUri: string): string => awsUri.split(AWS_AUDIO_PRONUNCIATIONS_DELIMITER)[1];

/**
 * Parses out the document Id (typically the ExampleSuggestion from the AWS URI).
 * (i.e. https://igbo-api.s3.us-east-2.amazonaws.com/audio-pronunciations/<audioId>.mp3)
 * @param awsUri AWS URI
 * @returns Audio Id
 */
export const parseAWSIdFromUri = (awsUri: string): string =>
  awsUri.split(AWS_AUDIO_PRONUNCIATIONS_DELIMITER)[1].split('.')[0];

/**
 * Parses out the document path to the file (typically the path + ExampleSuggestion Id + file extension) in
 * AWS S3.
 * @param awsUri AWS URI
 * @returns AWS Key of file
 */
export const parseAWSFilePathFromUri = (awsUri: string): string => awsUri.split(/https:.{0,}\.com\//)[1];
