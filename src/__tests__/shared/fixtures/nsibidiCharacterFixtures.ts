import { cloneDeep } from 'lodash';
import { NsibidiCharacter } from 'src/backend/controllers/utils/interfaces';
import NsibidiCharacterAttributeEnum from 'src/backend/shared/constants/NsibidiCharacterAttributeEnum';

export const nsibidiCharacterFixture = (data?: Partial<NsibidiCharacter>): NsibidiCharacter => ({
  id: '',
  nsibidi: '',
  attributes: Object.values(NsibidiCharacterAttributeEnum).reduce(
    (finalAttributes, attribute) => ({ ...finalAttributes, [attribute]: false }),
    {} as { [key in NsibidiCharacterAttributeEnum]: boolean },
  ),
  radicals: [],
  ...cloneDeep(data),
});
