import { useEffect } from 'react';

/* Prompts the user are they sure they want to leave the page */
const useBeforeWindowUnload = (): void => {
  useEffect(() => {
    window.addEventListener('beforeunload', (e) => {
      e.preventDefault();
      e.returnValue = '';
    });
  }, []);
};

export default useBeforeWindowUnload;
