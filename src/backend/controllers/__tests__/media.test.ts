import { v4 as uuidv4 } from 'uuid';
import { updateCorpusSuggestion, updateTextImage } from 'src/backend/controllers/media';
import { textImageSchema } from 'src/backend/models/TextImage';
import MediaTypes from 'src/backend/shared/constants/MediaTypes';
import { connectDatabase, disconnectDatabase } from 'src/backend/utils/database';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import { corpusSuggestionSchema } from 'src/backend/models/CorpusSuggestion';
import * as Interfaces from '../utils/interfaces';

describe('Media', () => {
  beforeEach(async () => {
    // Clear out database to start with a clean slate
    await dropMongoDBCollections();
  });

  it('updateCorpusSuggestion', async () => {
    const mongooseConnection = await connectDatabase();
    const CorpusSuggestion = mongooseConnection.model<Interfaces.CorpusSuggestion>(
      'CorpusSuggestion',
      corpusSuggestionSchema,
    );
    const corpusSuggestion = new CorpusSuggestion({ title: 'title', body: 'body' });
    const savedCorpusSuggestion = await corpusSuggestion.save();

    const payload = { id: savedCorpusSuggestion.id, fileType: MediaTypes.PNG };
    const response = await updateCorpusSuggestion({ mongooseConnection, data: payload });
    expect(response).toStrictEqual({
      signedRequest: `mock-signed-request/${savedCorpusSuggestion.id}`,
      mediaUrl: `mock-url/${savedCorpusSuggestion.id}`,
    });
    await disconnectDatabase();
  });

  it('updateTextImage', async () => {
    const mongooseConnection = await connectDatabase();
    const TextImage = mongooseConnection.model<Interfaces.TextImage>('TextImage', textImageSchema);
    const igbo = uuidv4();
    const textImage = new TextImage({ igbo });
    const savedTextImage = await textImage.save();

    const payload = { id: savedTextImage.id, fileType: MediaTypes.PNG };
    const response = await updateTextImage({ mongooseConnection, data: payload });
    expect(response).toStrictEqual({
      signedRequest: `mock-signed-request/${savedTextImage.id}`,
      mediaUrl: `mock-url/${savedTextImage.id}`,
    });
    await disconnectDatabase();
  });
});
