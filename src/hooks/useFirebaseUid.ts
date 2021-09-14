import { useEffect } from 'react';

const LOCAL_STORAGE_UID = 'igbo-api-admin-uid';

const useFirebaseUid = (callback: (value: string) => void): void => {
  useEffect(() => {
    callback(localStorage.getItem(LOCAL_STORAGE_UID));
  }, []);
};

export default useFirebaseUid;
