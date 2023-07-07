import { map } from 'lodash';
import { API_FROM_EMAIL, NKOWAOKWU_FROM_EMAIL } from 'src/backend/config';
import * as Interfaces from '../../utils/interfaces';

/* Builds the message object that will help send the email */
const constructMessage = (messageFields: Interfaces.EmailMessage): Interfaces.ConstructedMessage => ({
  from: { email: NKOWAOKWU_FROM_EMAIL, name: 'Nkọwa okwu' },
  ...messageFields,
  reply_to: { email: API_FROM_EMAIL, name: 'Igbo API' },
  personalizations: map(messageFields.to, (to) => ({ to: [{ email: to }] })),
});

export default constructMessage;
