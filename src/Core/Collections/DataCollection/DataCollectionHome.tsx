import React, { ReactElement } from 'react';
import PersonalStats from './PersonalStats';
import CallToActionButtons from './CallToActionButtons';

const DataCollectionHome = (): ReactElement => (
  <>
    <PersonalStats />
    <CallToActionButtons />
  </>
);

export default DataCollectionHome;
