import { UserProjectPermission } from 'src/backend/controllers/utils/interfaces';
import { IGBO_API_PROJECT_ID } from 'src/Core/constants';
import Collection from 'src/shared/constants/Collection';
import { request } from 'src/shared/utils/request';

export const postMemberInvite = async ({ email }: { email: string }): Promise<{ success: boolean }> => {
  const { data: result } = await request<{ success: boolean }>({
    method: 'POST',
    url: `${Collection.INVITES}/`,
    data: { email },
  });
  return result;
};

export const acceptIgboAPIRequest = async (): Promise<UserProjectPermission> => {
  const { data: result } = await request<{ userProjectPermission: UserProjectPermission }>({
    method: 'POST',
    url: `${Collection.INVITES}/igbo-api/accept?invitingProjectId=${IGBO_API_PROJECT_ID}`,
  });
  return result.userProjectPermission;
};
