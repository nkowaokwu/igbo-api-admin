import mongoose from 'mongoose';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import SentenceType from 'src/backend/shared/constants/SentenceType';
import { toJSONPlugin, toObjectPlugin } from './plugins';

const { Schema, Types } = mongoose;

const audioPronunciationSchema = new Schema(
  {
    audio: { type: String, default: '' },
    speaker: { type: String, default: '' },
  },
  { toObject: toObjectPlugin, timestamps: true },
);
export const exampleSchema = new Schema(
  {
    igbo: { type: String, default: '', trim: true },
    english: { type: String, default: '', trim: true },
    meaning: { type: String, default: '', trim: true },
    nsibidi: { type: String, default: '' },
    nsibidiCharacters: { type: [{ type: Types.ObjectId, ref: 'NsibidiCharacter' }], default: [] },
    type: {
      type: String,
      enum: Object.values(SentenceType),
      default: SentenceType.DEFAULT,
    },
    style: {
      type: String,
      enum: Object.values(ExampleStyleEnum),
      default: ExampleStyleEnum.NO_STYLE,
    },
    associatedWords: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
    associatedDefinitionsSchemas: { type: [{ type: Types.ObjectId }], default: [] },
    pronunciations: {
      type: [{ type: audioPronunciationSchema }],
      default: [],
    },
    archived: { type: Boolean, default: false },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(exampleSchema);

mongoose.model('Example', exampleSchema);
