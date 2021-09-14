import { useRef, useEffect } from 'react';

const useEventListener = (eventName: string, handler: (value: Event) => void, node?: Node): void => {
  const element = !node ? window : node;
  const savedHandler = useRef(null);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (isSupported) {
      const eventListener = (event) => savedHandler.current(event);
      element.addEventListener(eventName, eventListener);
      return (() => {
        element.removeEventListener(eventName, eventListener);
      });
    }
    return null;
  }, [eventName, element]);
};

export default useEventListener;
