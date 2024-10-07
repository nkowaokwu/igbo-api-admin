import { customAlphabet } from 'nanoid';
import { adminEmailList } from 'src/shared/constants/emailList';
import UserRoles from '../shared/constants/UserRoles';

export const assignUserRole = (user: { email?: string }): { role: UserRoles } => {
  if (process.env.NODE_ENV === 'production') {
    return {
      role: UserRoles.CROWDSOURCER,
    };
  }

  // Creates admin, merger, nsibidi merger, editor, and crowdsourcer accounts while using auth emulator
  return {
    role:
      adminEmailList.includes(user.email) || user.email.startsWith('admin')
        ? UserRoles.ADMIN
        : user.email.startsWith('merge')
        ? UserRoles.MERGER
        : user.email.startsWith('nsibidi_merger')
        ? UserRoles.NSIBIDI_MERGER
        : user.email.startsWith('editor')
        ? UserRoles.EDITOR
        : user.email.startsWith('transcriber')
        ? UserRoles.TRANSCRIBER
        : user.email.startsWith('user')
        ? UserRoles.USER
        : UserRoles.CROWDSOURCER,
  };
};

/**
 * Generates a unique id
 * @param {string} characters string used to generate random id
 * @param {number} size generated id length
 *
 * @returns {string} unique id
 */
type GenerateId = (characters: string, size?: number) => string;

export const generateId: GenerateId = (characters: string, size = 6) => customAlphabet(characters, size)();
