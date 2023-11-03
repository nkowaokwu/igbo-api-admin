import { useEffect, useRef } from 'react';
import { FormattedUser } from 'src/backend/controllers/utils/interfaces';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { getUserProfile } from 'src/shared/UserAPI';

const useFetchSpeakers = ({
  permissions,
  setIsLoading,
  speakerIds,
}: {
  permissions: { permissions?: { role?: UserRoles } };
  setIsLoading: (value: boolean) => void;
  speakerIds: string[];
}): FormattedUser[] => {
  const isAdmin = permissions?.permissions?.role === UserRoles.ADMIN;
  const speakersRef = useRef<FormattedUser[]>([]);

  useEffect(() => {
    (async () => {
      if (isAdmin) {
        setIsLoading(true);
        try {
          const speakerProfiles = await Promise.all(speakerIds.map(getUserProfile));
          speakersRef.current = speakerProfiles;
        } catch (err) {
          speakersRef.current = [];
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [permissions]);
  return speakersRef.current;
};

export default useFetchSpeakers;
