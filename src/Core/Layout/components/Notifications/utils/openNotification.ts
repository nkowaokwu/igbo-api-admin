import { doc, setDoc, getFirestore } from 'firebase/firestore';
import Collections from 'src/shared/constants/Collection';

const db = getFirestore();
const openNotification = async ({
  id,
  recipient,
  link,
  toast,
}: {
  id: string;
  recipient: string;
  link: string;
  toast?: (value: any) => void;
}): void => {
  try {
    const dbNotificationRef = doc(db, `${Collections.USERS}/${recipient}/${Collections.NOTIFICATIONS}`, id);
    await setDoc(dbNotificationRef, { opened: true }, { merge: true });
    window.location.hash = link;
  } catch (err) {
    if (toast) {
      toast({
        title: 'An error occurred',
        description: 'Unable to read the notification.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  }
};

export default openNotification;
