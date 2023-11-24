import { Types } from 'mongoose';
import NsibidiCharacterAttributeEnum from 'src/backend/shared/constants/NsibidiCharacterAttributeEnum';

export interface NsibidiCharacter {
  id: Types.ObjectId | string;
  nsibidi: string;
  attributes?: { [key in NsibidiCharacterAttributeEnum]: boolean };
}
