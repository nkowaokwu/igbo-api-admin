import { adminEmailList, prodAdminEmailList } from 'src/shared/constants/emailList';
import UserRoles from '../shared/constants/UserRoles';

export const assignUserRole = (user: { email?: string }): { role: UserRoles } => (
  {
    role: process.env.NODE_ENV === 'production' && prodAdminEmailList.includes(user.email)
      ? UserRoles.ADMIN
      : process.env.NODE_ENV === 'production' && !prodAdminEmailList.includes(user.email)
        ? UserRoles.CROWDSOURCER
        // Creates admin, merger, and editor accounts while using auth emulator
        : (
          process.env.NODE_ENV !== 'production'
          && (adminEmailList.includes(user.email) || user.email.startsWith('admin'))
        )
          ? UserRoles.ADMIN
          : process.env.NODE_ENV !== 'production' && user.email.startsWith('merge')
            ? UserRoles.MERGER
            : process.env.NODE_ENV !== 'production' && user.email.startsWith('editor')
              ? UserRoles.EDITOR
              : process.env.NODE_ENV !== 'production' && user.email.startsWith('transcriber')
                ? UserRoles.TRANSCRIBER
                : process.env.NODE_ENV !== 'production' && user.email.startsWith('user')
                  ? UserRoles.USER
                  : UserRoles.CROWDSOURCER,
  }
);
