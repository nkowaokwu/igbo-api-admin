import React from 'react';
import { LuUser } from 'react-icons/lu';
import FilterConfigType from 'src/backend/shared/constants/FilterConfigType';
import { FilterConfig } from 'src/shared/components/FiltersModal/configs/filterConfigInterfaces';

const UserFilterConfig: FilterConfig[] = [
  {
    title: 'User',
    subtitle: 'Project member information',
    icon: <LuUser />,
    sections: [
      {
        title: 'Display name',
        key: 'displayName',
        type: FilterConfigType.FREE_TEXT,
        placeholder: 'Display name',
      },
      {
        title: 'Email',
        key: 'email',
        type: FilterConfigType.FREE_TEXT,
        placeholder: 'Email',
      },
    ],
  },
];

export default UserFilterConfig;
