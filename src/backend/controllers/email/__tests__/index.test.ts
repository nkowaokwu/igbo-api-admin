import * as emailUtils from 'src/backend/controllers/email';

describe('Emails', () => {
  it('sends audio pronunciation deletion notification', async () => {
    const response = await emailUtils.sendAudioPronunciationDeletionNotification({
      to: 'admin@gmail.com',
      firstDenierEmail: 'first@gmail.com',
      secondDenierEmail: 'second@gmail.com',
      example: { igbo: 'Igbo' },
      deletedAudioPronunciation: 'https://audio-uri',
    });
    expect(response).toEqual(true);
  });

  it('fails to send audio pronunciation deletion notification due to missing to field', async () => {
    emailUtils
      // @ts-expect-error no to field
      .sendAudioPronunciationDeletionNotification({
        firstDenierEmail: 'first@gmail.com',
        secondDenierEmail: 'second@gmail.com',
        example: { igbo: 'Igbo' },
        deletedAudioPronunciation: 'https://audio-uri',
      })
      .catch((err) => {
        expect(err).toBeTruthy();
      });
  });
});
