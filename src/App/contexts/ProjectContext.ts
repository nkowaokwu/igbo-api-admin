import React from 'react';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import LicenseType from 'src/backend/shared/constants/LicenseType';
import VisibilityType from 'src/backend/shared/constants/VisibilityType';

export const ProjectContext = React.createContext({
  id: '',
  title: '',
  description: '',
  status: EntityStatus.UNSPECIFIED,
  visibility: VisibilityType.UNSPECIFIED,
  license: LicenseType.UNSPECIFIED,
  languages: [],
  types: [],
  triggerRefetch: () => null,
});
