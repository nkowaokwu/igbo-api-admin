import React, { useEffect, useState, ReactElement } from 'react';
import LinearProgressCard from 'src/Core/Dashboard/components/LinearProgressCard';
import { getTotalVerifiedExampleSuggestions, getTotalRecordedExampleSuggestions } from 'src/shared/DataCollectionAPI';

const STATIC_GOAL = 6000;
const PersonalStats = ({ uid } : { uid?: string }): ReactElement => {
  const [totalVerifiedExampleSuggestions, setTotalVerifiedExampleSuggestions] = useState(null);
  const [totalRecordedExampleSuggestions, setTotalRecordedExampleSuggestions] = useState(null);
  useEffect(() => {
    (async () => {
      const { count: verifiedExampleSuggestions } = await getTotalVerifiedExampleSuggestions(uid);
      const { count: recordedExampleSuggestions } = await getTotalRecordedExampleSuggestions(uid);
      setTotalVerifiedExampleSuggestions(verifiedExampleSuggestions);
      setTotalRecordedExampleSuggestions(recordedExampleSuggestions);
    })();
  }, []);
  return (
    <>
      <LinearProgressCard
        heading="Total contributions"
        description="All your personal contributions for recording and verifying Igbo sentences"
        stats={[
          {
            totalCount: totalVerifiedExampleSuggestions,
            goal: STATIC_GOAL,
            description: 'This is the total number of example sentences you have either approved or denied',
            heading: 'Verified example suggestions',
          },
          {
            totalCount: totalRecordedExampleSuggestions,
            goal: STATIC_GOAL,
            description: 'This is the total number of example sentences you have recorded audio for',
            heading: 'Recorded example suggestions',
          },
        ]}
        isLoaded={totalRecordedExampleSuggestions !== null && totalVerifiedExampleSuggestions !== null}
      />
    </>
  );
};

export default PersonalStats;
