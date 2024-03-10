import { Types } from 'mongoose';
import NsibidiCharacterAttributeEnum from 'src/backend/shared/constants/NsibidiCharacterAttributeEnum';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';

export interface NsibidiCharacter {
  id: Types.ObjectId | string;
  nsibidi: string;
  attributes?: { [key in NsibidiCharacterAttributeEnum]: boolean };
  pronunciation: string;
  definitions: { text: string }[];
  wordClass: WordClassEnum;
}
