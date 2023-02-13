import React, { useState, ReactElement, useEffect } from 'react';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import RecordSentenceAudio from './RecordSentenceAudio';
import VerifySentenceAudio from './VerifySentenceAudio';
import IgboSoundboxHome from './components/Home';
import IgboSoundboxNavbar from './components/Navbar';

const IgboSoundbox = (): ReactElement => {
  const [currentView, setCurrentView] = useState(IgboSoundboxViews.HOME);
  const [isDirty, setIsDirty] = useState(false);

  const goHome = () => {
    setCurrentView(IgboSoundboxViews.HOME);
  };

  useEffect(() => {
    setIsDirty(false);
  }, [currentView]);

  useBeforeWindowUnload();

  return (
    <>
      <IgboSoundboxNavbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isDirty={isDirty}
      />
      {currentView === IgboSoundboxViews.HOME ? <IgboSoundboxHome setCurrentView={setCurrentView} /> : null}
      {currentView === IgboSoundboxViews.RECORD ? (
        <RecordSentenceAudio setIsDirty={setIsDirty} goHome={goHome} />
      ) : null}
      {currentView === IgboSoundboxViews.VERIFY ? (
        <VerifySentenceAudio setIsDirty={setIsDirty} goHome={goHome} />
      ) : null}
    </>
  );
};

export default IgboSoundbox;
