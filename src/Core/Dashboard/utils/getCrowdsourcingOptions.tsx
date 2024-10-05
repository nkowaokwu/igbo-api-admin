import React from 'react';
import { LuMic, LuBookOpenCheck, LuCheckCircle2 } from 'react-icons/lu';
import { RiTranslate } from 'react-icons/ri';
import {
  DataEntryFlowOption,
  DataEntryFlowGroup,
} from 'src/Core/Dashboard/components/utils/DataEntryFlowOptionInterface';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';
import Collection from 'src/shared/constants/Collection';
import ProjectType from 'src/backend/shared/constants/ProjectType';

const ProjectTypeCardMap = {
  [ProjectType.TEXT_AUDIO_ANNOTATION]: [
    {
      key: Collection.EXAMPLE_SUGGESTIONS,
      icon: (props) => <LuMic {...props} />,
      title: 'Record audio for sentences',
      subtitle: 'Read and record audio for randomly provided sentences.',
      hash: '#/soundbox',
      state: IgboSoundboxViews.RECORD,
      buttonLabel: 'Record audio',
      group: DataEntryFlowGroup.EDIT_DATA,
    },
    {
      key: Collection.EXAMPLE_SUGGESTIONS,
      icon: (props) => <LuBookOpenCheck {...props} />,
      title: 'Verify recorded audio',
      subtitle: 'Listen to recordings from other contributors and verify the recordings are correct',
      hash: '#/soundbox',
      state: IgboSoundboxViews.VERIFY,
      buttonLabel: 'Verify audio',
      group: DataEntryFlowGroup.EDIT_DATA,
    },
  ],
  [ProjectType.TRANSLATION]: [
    {
      key: Collection.EXAMPLE_SUGGESTIONS,
      icon: (props) => <RiTranslate {...props} />,
      title: 'Translate sentences',
      subtitle: 'Translate sentences to languages you speak to improve translation technology',
      hash: '#/soundbox',
      state: IgboSoundboxViews.TRANSLATE,
      buttonLabel: 'Translate sentences',
      group: DataEntryFlowGroup.EDIT_DATA,
    },
    {
      key: Collection.EXAMPLE_SUGGESTIONS,
      icon: (props) => <LuCheckCircle2 {...props} />,
      title: 'Verify sentence translations',
      subtitle: 'Approve or deny sentence translations for machine translation',
      hash: '#/soundbox',
      state: IgboSoundboxViews.TRANSLATE_VERIFY,
      buttonLabel: 'Verify translations',
      group: DataEntryFlowGroup.EDIT_DATA,
    },
  ],
};

export const getCrowdsourcingOptions = ({
  types,
}: {
  types: ProjectType[];
}): (DataEntryFlowOption & { state?: IgboSoundboxViews })[] => {
  if (!types.length) return [];

  return types.reduce((totalOptions, type) => totalOptions.concat(ProjectTypeCardMap[type]), []);
};
