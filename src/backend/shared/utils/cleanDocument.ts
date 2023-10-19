import { omit } from 'lodash';

export default <T>(document: T): Partial<T> => omit(document, ['__v', '_id', 'createdAt', 'updatedAt']);
