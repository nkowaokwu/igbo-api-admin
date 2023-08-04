import { nsibidiCharacterSchema } from 'src/backend/models/NsibidiCharacter';
import WordClass from 'src/backend/shared/constants/WordClass';
import { connectDatabase, disconnectDatabase } from 'src/backend/utils/database';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import {
  deleteNsibidiCharacter,
  getExampleSuggestion,
  getNsibidiCharacter,
  suggestNewExample,
} from 'src/__tests__/shared/commands';
import { exampleSuggestionData } from 'src/__tests__/__mocks__/documentData';
import * as Interfaces from '../utils/interfaces';

describe('NsibidiCharacters', () => {
  beforeEach(async () => {
    // Clear out database to start with a clean slate
    await dropMongoDBCollections();
  });

  it('deletes nsibidi character and any reference to it', async () => {
    const connection = await connectDatabase();
    const NsibidiCharacter = connection.model<Interfaces.NsibidiCharacter>('NsibidiCharacter', nsibidiCharacterSchema);
    const nsibidiCharacter = new NsibidiCharacter({
      nsibidi: 'testing',
      definitions: [{ text: 'first definition' }],
      pronunciation: 'pronunciation',
      radicals: [],
      wordClass: WordClass.ADJ.nsibidiValue,
    });
    const savedNsibidi = await nsibidiCharacter.save();

    const exampleRes = await suggestNewExample({
      ...exampleSuggestionData,
      nsibidiCharacters: [savedNsibidi.id],
    });
    expect(exampleRes.status).toEqual(200);
    expect(exampleRes.body.nsibidiCharacters).toContain(savedNsibidi.id);

    const res = await deleteNsibidiCharacter(savedNsibidi);
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ message: `Deleted Nsibidi character: ${savedNsibidi.id}` });

    const updatedExampleRes = await getExampleSuggestion(exampleRes.body.id);
    expect(updatedExampleRes.status).toEqual(200);
    expect(updatedExampleRes.body.nsibidiCharacters).not.toContain(savedNsibidi.id);

    const nonExistentNsibidiCharacterRes = await getNsibidiCharacter(savedNsibidi.id);
    expect(nonExistentNsibidiCharacterRes.status).toEqual(404);
    expect(nonExistentNsibidiCharacterRes.error).toBeTruthy();

    await disconnectDatabase();
  });
});
