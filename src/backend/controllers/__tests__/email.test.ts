import { API_FROM_EMAIL, REPORT_USER_NOTIFICATION } from 'src/backend/config';
import { sendReportUserNotification } from 'src/backend/controllers/email';
import * as users from 'src/backend/controllers/users';
import constructMessage from 'src/backend/controllers/email/utils/constructMessage';

jest.mock('src/backend/controllers/email/utils/constructMessage');

describe('email', () => {
  it('sendReportUserNotification', async () => {
    jest.spyOn(users, 'findAdminUserEmails').mockReturnValue(Promise.resolve(['admin@example.com']));

    const body = {
      details: 'fdasfdsafdsa',
      reason: 'Inappropriate activity',
      reportedDisplayName: 'N/A',
      reporterDisplayName: 'Algae Algae',
      reporterUid: 'N3Tgs1Zav7JQyeiJas959qxY2oHN',
    };
    const mockReq = {
      body,
    };
    const mockRes = {
      send: jest.fn(),
    };
    // @ts-expect-error
    await sendReportUserNotification(mockReq, mockRes);
    expect(constructMessage).toHaveBeenCalledWith({
      from: { email: API_FROM_EMAIL, name: 'Igbo API' },
      to: ['admin@example.com'],
      templateId: REPORT_USER_NOTIFICATION,
      dynamic_template_data: body,
    });
    expect(mockRes.send).toHaveBeenCalled();
  });
});
