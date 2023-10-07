import { Connection, Types } from 'mongoose';
import { wordSchema } from 'src/backend/models/Word';
import { wordSuggestionSchema } from 'src/backend/models/WordSuggestion';
import { exampleSchema } from 'src/backend/models/Example';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import * as Interfaces from './utils/interfaces';

export const connectNsibidiCharactersToDocuments = async ({
  mongooseConnection,
  nsibidiCharacters,
}: {
  mongooseConnection: Connection;
  nsibidiCharacters: Interfaces.NsibidiCharacter[];
}): Promise<void> => {
  const Word = mongooseConnection.model<Interfaces.Word>('Word', wordSchema);
  const WordSuggestion = mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
  const Example = mongooseConnection.model<Interfaces.Example>('Example', exampleSchema);
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );

  await Promise.all(
    // Steps through all Nsibidi Characters from the database
    nsibidiCharacters.map(async ({ nsibidi, id }) => {
      const objectId = Types.ObjectId(id.toString());
      await Promise.all(
        // Performs the following logic for each Model
        [
          // Finds all the documents in the current model that has the current Nsibidi character, but it's not attached
          // as an nsibidiCharacter
          await Word.updateMany(
            { nsibidi: { $regex: nsibidi }, 'definitions.$.nsibidiCharacters': { $nin: [objectId] } },
            { $push: { nsibidiCharacters: id } },
          ).catch(() => console.log('Unable to update Word document while attaching Nsibidi Character')),
          await WordSuggestion.updateMany(
            { nsibidi: { $regex: nsibidi }, 'definitions.$.nsibidiCharacters': { $nin: [objectId] } },
            { $push: { nsibidiCharacters: id } },
          ).catch(() => console.log('Unable to update WordSuggestion document while attaching Nsibidi Character')),
          await Example.updateMany(
            { nsibidi: { $regex: nsibidi }, nsibidiCharacters: { $nin: [objectId] } },
            { $push: { nsibidiCharacters: id } },
          ).catch(() => console.log('Unable to update Example document while attaching Nsibidi Character')),
          await ExampleSuggestion.updateMany(
            { nsibidi: { $regex: nsibidi }, nsibidiCharacters: { $nin: [objectId] } },
            { $push: { nsibidiCharacters: id } },
          ).catch(() => console.log('Unable to update ExampleSuggestion document while attaching Nsibidi Character')),
        ],
      );
    }),
  );
};
