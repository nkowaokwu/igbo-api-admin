import { API_FROM_EMAIL, NKOWAOKWU_FROM_EMAIL } from 'src/backend/config';
import constructMessage from 'src/backend/controllers/email/utils/constructMessage';

describe('Construct Message', () => {
  it('constructs a new message', () => {
    const payload = {
      from: { email: 'test@gmail.com', name: 'Display Name' },
      to: ['first@gmail.com', 'second@gmail.com'],
      templateId: 'd-template-id',
      dynamic_template_data: { first: 'first', second: 'second ' },
    };
    const message = constructMessage(payload);
    expect(message).toEqual({
      from: { email: NKOWAOKWU_FROM_EMAIL, name: 'Nkọwa okwu' },
      ...payload,
      reply_to: { email: API_FROM_EMAIL, name: 'Igbo API' },
      personalizations: [{ to: [{ email: 'first@gmail.com' }] }, { to: [{ email: 'second@gmail.com' }] }],
    });
  });
});
