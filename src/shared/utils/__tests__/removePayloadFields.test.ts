import removePayloadFields from '../removePayloadFields';

describe('removePayloadFields', () => {
  it('removes ids from payload', () => {
    const payload = {
      definitions: [{ id: 'id' }],
      dialects: [{ id: 'id' }],
      examples: [{ pronunciations: [{ _id: '_id' }] }],
    };
    expect(removePayloadFields(payload)).toEqual({
      definitions: [{}],
      dialects: [{}],
      examples: [{
        pronunciations: [{}],
      }],
    });
  });
});
