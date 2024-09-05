import React, { useState, ReactElement, useEffect } from 'react';
import queryString from 'query-string';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import { Hide } from '@chakra-ui/react';
import RecordSentenceAudio from './RecordSentenceAudio';
import VerifySentenceAudio from './VerifySentenceAudio';
import IgboSoundboxNavbar from './components/Navbar';

const IgboSoundbox = (): ReactElement => {
  const [currentView, setCurrentView] = useState<IgboSoundboxViews>();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(false);

    if (currentView === IgboSoundboxViews.HOME) {
      window.location.hash = '#/';
    }
  }, [currentView]);

  useEffect(() => {
    const { igboSoundboxView } = queryString.parse(window.location.search) || {};
    if (typeof igboSoundboxView === 'string') {
      // @ts-expect-error
      setCurrentView(igboSoundboxView);
    } else {
      setCurrentView(IgboSoundboxViews.HOME);
    }
  }, []);

  useBeforeWindowUnload();

  return currentView !== IgboSoundboxViews.HOME ? (
    <>
      <Hide below="md">
        <IgboSoundboxNavbar currentView={currentView} setCurrentView={setCurrentView} isDirty={isDirty} />
      </Hide>
      {currentView === IgboSoundboxViews.RECORD ? <RecordSentenceAudio setIsDirty={setIsDirty} /> : null}
      {currentView === IgboSoundboxViews.VERIFY ? <VerifySentenceAudio setIsDirty={setIsDirty} /> : null}
    </>
  ) : null;
};

export default IgboSoundbox;
