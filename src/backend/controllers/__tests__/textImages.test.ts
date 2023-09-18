import { textImageSchema } from 'src/backend/models/TextImage';
import { connectDatabase, disconnectDatabase } from 'src/backend/utils/database';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import { getTextImages } from 'src/backend/controllers/textImages';
import * as Interfaces from '../utils/interfaces';

describe('textImages controller', () => {
  beforeEach(async () => {
    // Clear out database to start with a clean slate
    await dropMongoDBCollections();
  });
  it.skip('getTextImages', async () => {
    const mongooseConnection = await connectDatabase();
    const TextImage = mongooseConnection.model<Interfaces.TextImage>('TextImage', textImageSchema);
    const textImage = new TextImage({ igbo: 'title' });
    const savedTextImage = await textImage.save();

    const mockReq = {
      mongooseConnection,
    };
    const mockRes = {
      send: jest.fn(),
      setHeader: jest.fn(),
    };

    await getTextImages(mockReq, mockRes, jest.fn());

    expect(mockRes.send).toBeCalledWith([savedTextImage.toJSON()]);

    await disconnectDatabase();
  });
});
