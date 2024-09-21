import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Annotation used in Corpora schema
 */
const AnnotationSchema = new Schema({
  from_name: { type: String },
  id: { type: String },
  meta: {
    type: {
      text: { type: [{ type: String }], default: [] },
    },
    default: {},
  },
  origin: { type: String },
  original_length: { type: Number },
  to_name: { type: String },
  type: { type: String },
  value: {
    end: { type: Number },
    labels: { type: [String] },
    text: { type: [String] },
    start: { type: Number },
  },
});

export default AnnotationSchema;
