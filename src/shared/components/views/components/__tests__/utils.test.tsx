import { sanitizeArray, sanitizeExamples, sanitizeWith } from '../utils';

describe('Word Edit Form utils', () => {
  beforeAll(() => {
    Object.defineProperty(global.document, 'querySelectorAll', {
      value: (selector) => {
        if (selector === '[data-original-example-id]') {
          return [
            {
              dataset: {
                originalExampleId: '5f90c35f49f7e863e92b8b32',
                exampleId: '5f90c35f49f7e863e92b8b31',
              },
            },
          ];
        }
        return [
          {
            dataset: {
              associatedWords: '5f90c35f49f7e863e92b8b33,5f90c35f49f7e863e92b8b34',
            },
          },
        ];
      },
      configurable: true,
    });
  });
  it('sanitizes an array', () => {
    const mockData = ['', 'real', 'data', 'here ', false, null];

    expect(sanitizeArray(mockData)).toEqual(['real', 'data', 'here']);
  });

  it('converts array of objects with an id key objects into array of ids', () => {
    const mockData = [{ id: 'first' }, { id: 'second' }, { id: 'third' }];

    expect(sanitizeWith(mockData)).toEqual(['first', 'second', 'third']);
  });

  it('converts array of objects with an id key with one null value into an array of ids', () => {
    const mockData = [{ id: 'first' }, { id: 'second' }, { id: 'third' }, null];

    expect(sanitizeWith(mockData)).toEqual(['first', 'second', 'third']);
  });

  it('converts array of objects with an text key with one null value into an array of text', () => {
    const mockData = [{ text: 'first' }, { text: 'second' }, { text: 'third' }, null];

    expect(sanitizeWith(mockData, 'text')).toEqual(['first', 'second', 'third']);
  });

  it('sanitizes an array of examples with correct example ids', () => {
    const mockData = [
      {
        exampleId: '5f90c35f49f7e863e92b8b31',
        igbo: 'igbo',
        english: 'english',
        meaning: 'meaning',
        nsibidi: 'nsibidi',
        nsibidiCharacters: [{ id: 'first' }],
        pronunciation: '',
      },
    ];

    expect(sanitizeExamples(mockData)).toEqual([{
      igbo: 'igbo',
      english: 'english',
      meaning: 'meaning',
      nsibidi: 'nsibidi',
      nsibidiCharacters: ['first'],
      pronunciation: '',
      associatedWords: [
        '5f90c35f49f7e863e92b8b33',
        '5f90c35f49f7e863e92b8b34',
      ],
      id: '5f90c35f49f7e863e92b8b31',
      originalExampleId: '5f90c35f49f7e863e92b8b32',
    }]);
  });

  it('sanitizes an array of examples with incorrect example ids by removing them', () => {
    Object.defineProperty(global.document, 'querySelectorAll', {
      value: (selector) => {
        if (selector === '[data-original-example-id]') {
          return [
            {
              dataset: {
                originalExampleId: '5f90c35f49f7e863e92b8b32',
                exampleId: '5f90c35f49f7e863e92b8b31-5f90c35f49f7e863e92b8b36',
              },
            },
          ];
        }
        return [
          {
            dataset: {
              associatedWords: '5f90c35f49f7e863e92b8b33,5f90c35f49f7e863e92b8b34',
            },
          },
        ];
      },
    });

    const mockData = [
      {
        igbo: 'igbo',
        english: 'english',
        meaning: 'meaning',
        nsibidi: 'nsibidi',
        nsibidiCharacters: [{ id: 'first' }],
        pronunciation: '',
      },
    ];

    expect(sanitizeExamples(mockData)).toEqual([{
      igbo: 'igbo',
      english: 'english',
      meaning: 'meaning',
      nsibidi: 'nsibidi',
      nsibidiCharacters: ['first'],
      pronunciation: '',
      associatedWords: [
        '5f90c35f49f7e863e92b8b33',
        '5f90c35f49f7e863e92b8b34',
      ],
      originalExampleId: '5f90c35f49f7e863e92b8b32',
    }]);
  });
});
