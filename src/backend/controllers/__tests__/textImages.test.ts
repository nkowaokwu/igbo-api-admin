import { times } from 'lodash';
import { textImageSchema } from 'src/backend/models/TextImage';
import { connectDatabase, disconnectDatabase } from 'src/backend/utils/database';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import { getTextImages, postTextImage } from 'src/backend/controllers/textImages';
import {
  getTextImages as getTextImagesCommand,
  postTextImage as postTextImageCommand,
} from 'src/__tests__/shared/commands';
import * as Interfaces from '../utils/interfaces';

describe('textImages controller', () => {
  beforeEach(async () => {
    // Clear out database to start with a clean slate
    await dropMongoDBCollections();
  });
  it('getTextImages', async () => {
    const mongooseConnection = await connectDatabase();
    const TextImage = mongooseConnection.model<Interfaces.TextImage>('TextImage', textImageSchema);
    const textImage = new TextImage({ igbo: 'title' });
    const savedTextImage = await textImage.save();
    const mockReq = {
      mongooseConnection,
      query: { keyword: 'title' },
    };
    const mockRes = {
      send: jest.fn(),
      setHeader: jest.fn(),
    };

    await getTextImages(mockReq, mockRes, jest.fn());

    expect(mockRes.send).toBeCalledWith([savedTextImage.toObject()]);

    await disconnectDatabase();
  });

  it('getTextImages via route', async () => {
    const mongooseConnection = await connectDatabase();
    const TextImage = mongooseConnection.model<Interfaces.TextImage>('TextImage', textImageSchema);

    await Promise.all(
      times(5, (index) => {
        const textImage = new TextImage({ igbo: `title-${index}` });
        return textImage.save();
      }),
    );
    const res = await getTextImagesCommand({ keyword: 'title-' });
    expect(res.status).toEqual(200);
    res.body.forEach((textImage, index) => {
      expect(textImage.igbo).toEqual(`title-${index}`);
    });
  });

  it('postTextImage', async () => {
    getTextImagesCommand({ igbo: '' });
    const mongooseConnection = await connectDatabase();

    const mockReq = {
      mongooseConnection,
      body: { igbo: 'first-igbo' },
    };
    const mockRes = {
      send: jest.fn((response) => {
        expect(response.igbo).toEqual('first-igbo');
      }),
      setHeader: jest.fn(),
    };

    await postTextImage(mockReq, mockRes, jest.fn());

    await disconnectDatabase();
  });

  it('postTextImage via route', async () => {
    const res = await postTextImageCommand([{ igbo: 'first-igbo' }]);
    expect(res.status).toEqual(200);
    expect(res.body[0].igbo).toEqual('first-igbo');
  });

  it('postTextImage via route with empty igbo text', async () => {
    const res = await postTextImageCommand([{ igbo: '' }]);
    expect(res.status).toEqual(200);
    expect(res.body[0].igbo).toEqual('');
  });

  it('throws an error for postTextImage for not passing an array', async () => {
    // @ts-expect-error Invalid data shape
    const res = await postTextImageCommand({ igbo: 'first-igbo' });
    expect(res.status).toEqual(400);
  });

  it('throws an error for postTextImage for passing an empty object', async () => {
    // @ts-expect-error Invalid data shape
    const res = await postTextImageCommand({});
    expect(res.status).toEqual(400);
  });
});
