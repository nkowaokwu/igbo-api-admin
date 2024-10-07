import { compact, map } from 'lodash';
import { API_FROM_EMAIL } from 'src/backend/config';
import * as Interfaces from '../../utils/interfaces';

/* Builds the message object that will help send the email */
const constructMessage = (messageFields: Interfaces.EmailMessage): Interfaces.ConstructedMessage => ({
  ...messageFields,
  from: { email: API_FROM_EMAIL, name: 'Igbo API Editor Platform' },
  to: compact(messageFields.to),
  reply_to: { email: API_FROM_EMAIL, name: 'Igbo API Editor Platform' },
  personalizations: map(messageFields.to, (to) => ({ to: [{ email: to }] })),
});

export default constructMessage;
