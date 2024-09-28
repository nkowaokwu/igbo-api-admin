import React from 'react';
import { compact } from 'lodash';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';
import {
  DataEntryFlowOption,
  DataEntryFlowGroup,
} from 'src/Core/Dashboard/components/utils/DataEntryFlowOptionInterface';
import Collection from 'src/shared/constants/Collection';
import { LuUser } from 'react-icons/lu';

export const getUserOptions = ({
  showSelfIdentify,
}: {
  showSelfIdentify: boolean;
}): (DataEntryFlowOption & { state?: IgboSoundboxViews })[] =>
  compact([
    showSelfIdentify
      ? {
          key: Collection.USERS,
          icon: (props) => <LuUser {...props} />,
          title: 'Self identify',
          subtitle: 'Enter your self-identifying information',
          hash: '#/profile',
          buttonLabel: 'Go to profile',
          group: DataEntryFlowGroup.GET_STARTED,
        }
      : null,
  ]);
