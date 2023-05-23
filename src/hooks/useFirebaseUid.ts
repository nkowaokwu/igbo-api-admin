import { useEffect } from 'react';

const LOCAL_STORAGE_UID = 'igbo-api-admin-uid';

const useFirebaseUid = (callback?: (value: string) => void): any => {
  useEffect(() => {
    if (callback) {
      callback(localStorage.getItem(LOCAL_STORAGE_UID));
    }
  }, []);
  return localStorage.getItem(LOCAL_STORAGE_UID);
};

export default useFirebaseUid;
