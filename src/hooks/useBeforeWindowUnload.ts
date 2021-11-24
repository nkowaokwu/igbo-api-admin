import { useEffect } from 'react';

/* Prompts the user are they sure they want to leave the page */
const useBeforeWindowUnload = (): void => {
  const handleCheckBeforeLeaving = (e) => {
    e.preventDefault();
    e.returnValue = '';
  };
  useEffect(() => {
    window.addEventListener('beforeunload', handleCheckBeforeLeaving);
    return () => {
      window.removeEventListener('beforeunload', handleCheckBeforeLeaving);
    };
  }, []);
};

export default useBeforeWindowUnload;
