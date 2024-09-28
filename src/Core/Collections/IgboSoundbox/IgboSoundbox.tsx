import React, { useState, ReactElement, useEffect } from 'react';
import queryString from 'query-string';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import { Hide } from '@chakra-ui/react';
import RecordSentenceAudio from './RecordSentenceAudio';
import VerifySentenceAudio from './VerifySentenceAudio';
import TranslateSentences from './TranslateSentences';
import VerifyTranslateSentences from './VerifyTranslateSentences';
import IgboSoundboxNavbar from './components/Navbar';

const IgboSoundbox = (): ReactElement => {
  const [currentView, setCurrentView] = useState<IgboSoundboxViews>();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(false);

    if (currentView === IgboSoundboxViews.HOME) {
      window.location.href = '#/';
    }
  }, [currentView]);

  useEffect(() => {
    const queries = window.location.href.split('?')[1];
    const { soundboxView } = queryString.parse(queries) || {};
    if (typeof soundboxView === 'string') {
      setCurrentView(soundboxView as IgboSoundboxViews);
    }
  }, []);

  useBeforeWindowUnload();

  return (
    <>
      <Hide below="md">
        <IgboSoundboxNavbar currentView={currentView} setCurrentView={setCurrentView} isDirty={isDirty} />
      </Hide>
      {currentView === IgboSoundboxViews.RECORD ? <RecordSentenceAudio setIsDirty={setIsDirty} /> : null}
      {currentView === IgboSoundboxViews.VERIFY ? <VerifySentenceAudio setIsDirty={setIsDirty} /> : null}
      {currentView === IgboSoundboxViews.TRANSLATE ? <TranslateSentences setIsDirty={setIsDirty} /> : null}
      {currentView === IgboSoundboxViews.TRANSLATE_VERIFY ? <VerifyTranslateSentences setIsDirty={setIsDirty} /> : null}
    </>
  );
};

export default IgboSoundbox;
