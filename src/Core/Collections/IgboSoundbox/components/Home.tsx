import React, { useEffect, useState, ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';
import { getTotalVerifiedExampleSuggestions, getTotalRecordedExampleSuggestions } from 'src/shared/DataCollectionAPI';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import OptionCard from './OptionCard';

const IgboSoundboxHome = ({
  setCurrentView,
}: {
  setCurrentView: React.Dispatch<React.SetStateAction<IgboSoundboxViews>>;
}): ReactElement => {
  const [totalVerifiedExampleSuggestions, setTotalVerifiedExampleSuggestions] = useState(null);
  const [totalRecordedExampleSuggestions, setTotalRecordedExampleSuggestions] = useState(null);
  const [firebaseUid, setFirebaseUid] = useState(null);
  useFirebaseUid(setFirebaseUid);

  useEffect(() => {
    (async () => {
      const { count: verifiedExampleSuggestions } = await getTotalVerifiedExampleSuggestions(firebaseUid);
      const { count: recordedExampleSuggestions } = await getTotalRecordedExampleSuggestions(firebaseUid);
      setTotalVerifiedExampleSuggestions(verifiedExampleSuggestions);
      setTotalRecordedExampleSuggestions(recordedExampleSuggestions);
    })();
  }, []);
  return (
    <Box className="gradient-background">
      <Box className="w-full h-full flex flex-col xl:flex-row justify-center items-center space-y-12 xl:space-y-0">
        <OptionCard
          title="Record your voice"
          description="Read out loud the example sentence in Igbo"
          icon="🎙"
          link={IgboSoundboxViews.RECORD}
          onButtonClick={setCurrentView}
          currentStat={totalRecordedExampleSuggestions}
          tooltipLabel={`The total number of recorded is calculated by counting the number
          of example sentences you have recorded that doesn't have two denials`}
        />
        <OptionCard
          title="Verify recorded sentences"
          description="Listen to Igbo recordings from other people and verify if the audio recordings are correct"
          icon="🔊"
          link={IgboSoundboxViews.VERIFY}
          onButtonClick={setCurrentView}
          currentStat={totalVerifiedExampleSuggestions}
          tooltipLabel="This stat counts the total number of example sentences you have approved or denied"
        />
      </Box>
    </Box>
  );
};

export default IgboSoundboxHome;
