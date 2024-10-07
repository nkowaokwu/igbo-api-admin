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

  it('send invite email to member', async () => {
    const response = await emailUtils.sendMemberInvite({
      to: 'first@gmail.com',
      projectId: 'projectId',
      permissionId: 'permissionId',
      acceptUrl: 'acceptUrl',
      projectTitle: 'projectTitle',
      grantingAdmin: 'grantingAdmin',
    });
    expect(response).toEqual(true);
  });

  it('send notification to admins about member accepting invites', async () => {
    const response = await emailUtils.sendMemberAcceptedInviteAdmin({
      to: ['first@gmail.com'],
      projectId: 'projectId',
      projectTitle: 'projectTitle',
      userEmail: 'user@gmail.com',
    });
    expect(response).toEqual(true);
  });
});
