import UserRoles from 'src/backend/shared/constants/UserRoles';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import { cloneDeep, merge } from 'lodash';
import { AUTH_TOKEN } from 'src/__tests__/shared/constants';

const baseUser = {
  uid: 'uid',
  id: 'uid',
  photoURL: '',
  age: 18,
  dialects: [DialectEnum.ABI],
  gender: GenderEnum.FEMALE,
};

export const defaultAdminUser = cloneDeep(
  merge(baseUser, {
    displayName: 'Admin name',
    uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
    id: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
    email: 'admin@example.com',
    customClaims: { role: UserRoles.ADMIN },
  }),
);

export const defaultMergerUser = cloneDeep(
  merge(baseUser, {
    displayName: 'Merger name',
    uid: AUTH_TOKEN.MERGER_AUTH_TOKEN,
    id: AUTH_TOKEN.MERGER_AUTH_TOKEN,
    email: 'merger@example.com',
    customClaims: { role: UserRoles.MERGER },
  }),
);

export const defaultNsibidiMergerUser = cloneDeep(
  merge(baseUser, {
    displayName: 'Nsibidi merger name',
    uid: AUTH_TOKEN.NSIBIDI_MERGER_AUTH_TOKEN,
    id: AUTH_TOKEN.NSIBIDI_MERGER_AUTH_TOKEN,
    email: 'nsibidi_merger@example.com',
    customClaims: { role: UserRoles.NSIBIDI_MERGER },
  }),
);

export const defaultEditorUser = cloneDeep(
  merge(baseUser, {
    displayName: 'Editor name',
    uid: AUTH_TOKEN.EDITOR_AUTH_TOKEN,
    id: AUTH_TOKEN.EDITOR_AUTH_TOKEN,
    email: 'editor@example.com',
    customClaims: { role: UserRoles.EDITOR },
  }),
);

export const defaultCrowdsourcerUser = cloneDeep(
  merge(baseUser, {
    displayName: 'Crowdsourcer name',
    uid: AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN,
    id: AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN,
    email: 'crowdsourcer@example.com',
    customClaims: { role: UserRoles.CROWDSOURCER },
  }),
);

export const allUsers = [defaultAdminUser, defaultMergerUser, defaultEditorUser, defaultCrowdsourcerUser];
