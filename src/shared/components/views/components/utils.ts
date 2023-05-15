import { compact, trim } from 'lodash';
import { ExampleClientData } from 'src/backend/controllers/utils/interfaces';
import View from 'src/shared/constants/Views';

/* Removes white space from arrays that contains spaces */
export const sanitizeArray = (items = []) : string[] => compact(items).map((item) => trim(item));

export const onCancel = ({ view, resource, history }: { view: string, resource: string, history: any }): any => {
  localStorage.removeItem('igbo-api-admin-form');
  return view === View.CREATE ? history.push(`/${resource}`) : history.push(View.SHOW);
};

/* Transforms objects with the id or custom key to be an array of just id strings */
export const sanitizeWith = (idObjects: { [key: string]: string }[], sanitizeKey = 'id'): string[] => (
  compact(idObjects.map((idObject) => {
    if (idObject?.[sanitizeKey]) {
      return idObject[sanitizeKey];
    }
    return null;
  }))
);

/* Gets the original example id and associated words to prepare to send to the API */
export const sanitizeExamples = (examples = []): ExampleClientData[] => {
  const examplesFromIds: NodeListOf<HTMLElement> = document.querySelectorAll('[data-example-id]');
  const originalExamplesFromIds: NodeListOf<HTMLElement> = document.querySelectorAll('[data-original-example-id]');
  const examplesFromAssociatedWords: NodeListOf<HTMLElement> = document.querySelectorAll('[data-associated-words]');
  return examples
    .map(({
      igbo,
      english,
      meaning,
      nsibidi,
      nsibidiCharacters,
      pronunciation,
    }, index) => (
      {
        igbo,
        english,
        nsibidi,
        pronunciation,
        meaning,
        ...(originalExamplesFromIds[index]?.dataset?.originalExampleId
          ? { originalExampleId: originalExamplesFromIds[index]?.dataset?.originalExampleId }
          : {}
        ),
        ...(examplesFromIds[index]?.dataset?.exampleId
          ? { id: examplesFromIds[index]?.dataset?.exampleId }
          : {}
        ),
        associatedWords: examplesFromAssociatedWords[index]?.dataset?.associatedWords.split(','),
        nsibidiCharacters: sanitizeWith(nsibidiCharacters || []),
      }
    ))
    .filter((example) => example.igbo && example.english);
};
