import UserRoles from 'src/backend/shared/constants/UserRoles';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import { cloneDeep, merge } from 'lodash';

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
    uid: 'admin-uid',
    id: 'admin-uid',
    email: 'admin@example.com',
    customClaims: { role: UserRoles.ADMIN },
  }),
);

export const defaultMergerUser = cloneDeep(
  merge(baseUser, {
    displayName: 'Merger name',
    uid: 'merger-uid',
    id: 'merger-uid',
    email: 'merger@example.com',
    customClaims: { role: UserRoles.MERGER },
  }),
);

export const defaultEditorUser = cloneDeep(
  merge(baseUser, {
    displayName: 'Editor name',
    uid: 'editor-uid',
    id: 'editor-uid',
    email: 'editor@example.com',
    customClaims: { role: UserRoles.EDITOR },
  }),
);

export const defaultCrowdsourcerUser = cloneDeep(
  merge(baseUser, {
    displayName: 'Crowdsourcer name',
    uid: 'crowdsourcer-uid',
    id: 'crowdsourcer-uid',
    email: 'crowdsourcer@example.com',
    customClaims: { role: UserRoles.CROWDSOURCER },
  }),
);
