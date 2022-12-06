import { Identifier } from 'react-admin';
import moment from 'moment';
import { CachedDocument } from 'src/backend/controllers/utils/interfaces';
import Collection from 'src/shared/constants/Collections';
import igboAPIEditorPlatformDB from './IndexedDB';
import 'src/utils/IndexedDBAPI/IndexedDB';

const INVALIDATE_CACHE_DAYS = 2;

const isInvalid = (date: number | string | Date) => (
  moment(date).diff(moment.now(), 'days') >= INVALIDATE_CACHE_DAYS
);

const deleteDocument = async ({ resource, id } : { resource: Collection, id: string }): Promise<boolean> => {
  try {
    if (window?.indexedDB) {
      await igboAPIEditorPlatformDB[resource].delete(id);
      return true;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getDocument = async ({
  resource,
  id,
} : {
  resource: Collection,
  id: string | Identifier,
}): Promise<any | null> => {
  if (window?.indexedDB) {
    const result = await igboAPIEditorPlatformDB[resource].get(id)
      .catch(() => null);
    if (isInvalid(result?.cachedAt)) {
      await deleteDocument({ resource, id });
      return null;
    }
    return result;
  }
  return null;
};

const putDocument = async ({
  resource,
  data,
} : {
  resource: Collection,
  data: CachedDocument,
}): Promise<any | null> => {
  if (window?.indexedDB && data) {
    data.cachedAt = Date.now();
    const existingDocument = await getDocument({ resource, id: data.id });
    if (existingDocument) {
      return igboAPIEditorPlatformDB[resource].update(data)
        .catch((err) => {
          console.log('Update error');
          console.log(err);
        });
    }
    return igboAPIEditorPlatformDB[resource].put(data)
      .catch((err) => {
        console.log('Put error');
        console.log(err);
      });
  }
  return null;
};

export default {
  getDocument,
  deleteDocument,
  putDocument,
};
