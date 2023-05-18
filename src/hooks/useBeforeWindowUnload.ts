import { useEffect } from 'react';
import { useBreakpointValue } from '@chakra-ui/react';

/* Prompts the user are they sure they want to leave the page */
const useBeforeWindowUnload = (): void => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const handleCheckBeforeLeaving = (e) => {
    e.preventDefault();
    e.returnValue = '';
  };
  useEffect(() => {
    if (!isMobile) {
      window.addEventListener('beforeunload', handleCheckBeforeLeaving);
      return () => {
        window.removeEventListener('beforeunload', handleCheckBeforeLeaving);
      };
    }
    return () => null;
  }, []);
};

export default useBeforeWindowUnload;
