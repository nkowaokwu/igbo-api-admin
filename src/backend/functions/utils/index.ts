import { Role } from 'src/shared/constants/auth-types';

/* Determines if user and groupNumber are valid */
export const canAssignEditingGroupNumber = (role: string, groupNumber: number): boolean => {
  const MAX_EDITING_GROUP_NUMBER = 3;
  const MIN_EDITING_GROUP_NUMBER = 1;
  return role === Role.EDITOR && groupNumber >= MIN_EDITING_GROUP_NUMBER && groupNumber <= MAX_EDITING_GROUP_NUMBER;
};
