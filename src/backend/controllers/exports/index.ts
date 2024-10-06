import fs from 'node:fs';
import stream from 'node:stream';
import { Connection } from 'mongoose';
import archiver from 'archiver';
import { Response, NextFunction } from 'express';
import { PubSub } from '@google-cloud/pubsub';
import parquet from 'parquetjs';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import initializeAPI from 'src/backend/controllers/utils/MediaAPIs/initializeAPI';
import { getExamplesHelper } from 'src/backend/controllers/examples';
import { connectDatabase } from 'src/backend/utils/database';
import { sendExportedDataset } from 'src/backend/controllers/email';
import PubSubTopic from 'src/backend/shared/constants/PubSubTopic';
import { exampleSchema } from 'src/backend/controllers/exports/schemas';
import { CleanedExample, cleanExample } from 'src/backend/controllers/exports/utils';
import { datasetExportSchema } from 'src/backend/models/DatasetExport';

const { bucket, s3 } = initializeAPI('audio-pronunciations');

const streamParquetFile = async ({
  archiveStream,
  projectId,
  cleanedExamples,
}: {
  archiveStream: any;
  projectId: string;
  cleanedExamples: CleanedExample[];
}) => {
  try {
    const writer = await parquet.ParquetWriter.openFile(exampleSchema, '/tmp/export.parquet');

    if (cleanedExamples.length) {
      // Adds all cleaned examples to parquet file
      await Promise.all(
        cleanedExamples.map(async (example) => {
          await writer.appendRow(example);
        }),
      );
    }

    await writer.close();

    const fileStream = fs.createReadStream('/tmp/export.parquet');
    const fileName = `${new Date().toISOString()}.parquet`;
    const s3Key = `projects/${projectId}/parquet/${fileName}`;
    const params = { Bucket: bucket, Key: s3Key, Body: fileStream };

    await s3.putObject(params).promise();
    const file = await s3.getObject({ Bucket: bucket, Key: s3Key }).promise();

    fs.unlink('/tmp/export.parquet', () => null);

    archiveStream.append(file.Body, { name: `data/${fileName}` });
  } catch (err) {
    console.log('An error occurred while writing parquet file:', err.message);
  }
};

const streamAudioPronunciations = async ({
  archiveStream,
  audioPronunciationIds,
}: {
  archiveStream: any;
  audioPronunciationIds: string[];
}) => {
  await Promise.all(
    audioPronunciationIds.map(async (pronunciationId) => {
      if (pronunciationId) {
        const params = { Bucket: bucket, Key: pronunciationId };
        try {
          const response = await s3.getObject(params).promise();

          archiveStream.append(response.Body, { name: `data/${pronunciationId}` });
        } catch (err) {
          console.log('Unable to fetch file:', err);
        }
      } else {
        console.log('Empty pronunciationId, skipping getting from AWS');
      }
    }),
  );
};

/**
 * Uploads the final .mp3 + .parquet zip file to S3
 * @param passthrough
 * @param projectId
 * @returns Bucket and Key for zip file
 */
const uploadTask = (passthrough: stream.PassThrough, projectId: string): Promise<[string, string]> =>
  new Promise((resolve) => {
    const key = `projects/${projectId}/exports/${new Date().toISOString()}.zip`;
    s3.upload(
      {
        Bucket: bucket,
        Key: key,
        Body: passthrough,
        ContentType: 'application/zip',
      },
      () => {
        console.log('Zip uploaded:', key);
        resolve([bucket, key]);
      },
    );
  });

const streamFiles = async ({
  mongooseConnection,
  projectId,
  archiveStream,
}: {
  mongooseConnection: Connection;
  projectId: string;
  archiveStream: { append: (buffer: string, path: string) => void; finalize: () => void };
}) => {
  const examples = await getExamplesHelper({ mongooseConnection, projectId });
  const cleanedExamples = examples.map(cleanExample);
  const audioPronunciationIds = cleanedExamples.flatMap((cleanedExample) => {
    const sourcePronunciations = cleanedExample.source.pronunciations.map(({ audio }) => audio);
    const translationsPronunciations = cleanedExample.translations.flatMap((translation) =>
      translation.pronunciations.map(({ audio }) => audio),
    );
    return sourcePronunciations.concat(translationsPronunciations);
  });

  // Places files into archive stream
  await streamParquetFile({ archiveStream, projectId });
  await streamAudioPronunciations({ archiveStream, audioPronunciationIds });

  archiveStream.finalize();
};

/**
 * Helper to create a new DatasetExport document
 * @param param0
 * @returns DatasetExport
 */
const postDatasetExportHelper = async ({
  mongooseConnection,
  fileName,
  projectId,
}: {
  mongooseConnection: Connection;
  fileName: string;
  projectId: string;
}) => {
  const DatasetExport = mongooseConnection.model<Interfaces.DatasetExportData>('DatasetExport', datasetExportSchema);

  const datasetExport = new DatasetExport({
    fileName,
    projectId,
  });

  const savedExport = await datasetExport.save();
  return savedExport;
};

/**
 * Triggered function from published message for exporting data.
 * @param param0
 */
export const onExportData = async ({
  projectId,
  adminEmail,
}: {
  projectId: string;
  adminEmail: string;
}): Promise<void> => {
  const mongooseConnection = await connectDatabase();
  const archiveStream = archiver('zip');
  const passthrough = new stream.PassThrough();

  // Initialize archive stream
  archiveStream.pipe(passthrough);
  archiveStream.on('error', (error) => {
    console.error('Archival encountered an error:', error);
    throw new Error(error);
  });

  // Stream all files to archive stream, upload to AWS S3, and create DatasetExport
  await streamFiles({ mongooseConnection, projectId, archiveStream });
  const [destinationBucket, exportFileKey] = await uploadTask(passthrough, projectId);
  await postDatasetExportHelper({ mongooseConnection, projectId, fileName: exportFileKey });

  // Create download Url for user to access for 24 hours
  const params = {
    Bucket: destinationBucket,
    Key: exportFileKey,
    Expires: 60 * 60 * 24, // 24 hours
  };
  const url = await s3.getSignedUrlPromise('getObject', params);

  try {
    console.log({ exportUrl: url });

    await sendExportedDataset({
      to: adminEmail,
      exportFileName: exportFileKey,
      downloadUrl: url,
    });
  } catch (err) {
    console.log('Unable to send email to admins about data export:', err.message);
  }
};

/**
 * Publishes messages to export data pubsub to start exporting process
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Success message
 */
export const postExport = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ success: boolean }> | void> => {
  try {
    const { project, user } = req;
    const pubsub = new PubSub();
    await pubsub.topic(PubSubTopic.EXPORT_DATA).publishMessage({
      json: {
        projectId: project.id,
        adminEmail: user.email,
      },
    });
    return res.send({ success: true });
  } catch (err) {
    console.log('Unable to make request to export data:', err.message);
    return next(err);
  }
};
