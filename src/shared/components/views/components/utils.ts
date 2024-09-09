import { get, compact, trim } from 'lodash';
import { ExampleClientData } from 'src/backend/controllers/utils/interfaces';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import View from 'src/shared/constants/Views';

/* Removes white space from arrays that contains spaces */
export const sanitizeArray = (items = []): string[] => compact(items).map((item) => trim(item));

export const onCancel = ({ view, resource, history }: { view: string; resource: string; history: any }): any => {
  localStorage.removeItem('igbo-api-admin-form');
  return view === View.CREATE ? history.push(`/${resource}`) : history.push(View.SHOW);
};

/* Transforms objects with the id or custom key to be an array of just id strings */
export const sanitizeWith = (idObjects: { [key: string]: string }[], sanitizeKey = 'id'): string[] =>
  compact(
    idObjects.map((idObject) => {
      if (idObject?.[sanitizeKey]) {
        const value = idObject[sanitizeKey];
        return typeof value === 'string' ? trim(value) : value;
      }
      return null;
    }),
  );

/* Gets the original example id and associated words to prepare to send to the API */
export const sanitizeExamples = (examples = []): ExampleClientData[] => {
  const originalExamplesFromIds: NodeListOf<HTMLElement> = document.querySelectorAll('[data-original-example-id]');
  const examplesFromAssociatedWords: NodeListOf<HTMLElement> = document.querySelectorAll('[data-associated-words]');

  // @ts-expect-error
  return examples
    .map(({ source, translations, meaning, nsibidi, nsibidiCharacters, pronunciations, exampleId }, index) => {
      const { originalExampleId } = originalExamplesFromIds[index]?.dataset || {};
      return {
        source: {
          language: get(source, 'language') || LanguageEnum.UNSPECIFIED,
          text: get(source, 'text') || '',
        },
        translations: (translations || []).map(({ language = LanguageEnum.UNSPECIFIED, text = '' }) => ({
          language,
          text,
        })),
        nsibidi,
        pronunciations: (pronunciations || []).filter(({ audio }) => audio),
        meaning,
        ...(originalExampleId ? { originalExampleId } : {}),
        ...(exampleId ? { id: exampleId } : {}),
        associatedWords: compact(examplesFromAssociatedWords[index]?.dataset?.associatedWords.split(',')),
        nsibidiCharacters: sanitizeWith(nsibidiCharacters || []),
      };
    })
    .filter((example) => get(example, 'source.text') && get(example, 'translations.0.text'));
};
