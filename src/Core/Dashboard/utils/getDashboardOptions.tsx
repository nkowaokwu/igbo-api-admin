import React from 'react';
import { compact } from 'lodash';
import { ProjectContext } from 'src/App/contexts/ProjectContext';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { DataEntryFlowOption } from 'src/Core/Dashboard/components/utils/DataEntryFlowOptionInterface';
import { getEditingOptions } from 'src/Core/Dashboard/utils/getEditingOptions';
import { getCrowdsourcingOptions } from 'src/Core/Dashboard/utils/getCrowdsourcingOptions';
import { getUserOptions } from 'src/Core/Dashboard/utils/getUserOptions';

export const getDashboardOptions = ({
  permissions,
  isIgboAPIProject,
  showSelfIdentify,
}: {
  permissions: { permissions?: { role: UserRoles } };
  isIgboAPIProject: boolean;
  showSelfIdentify: boolean;
}): DataEntryFlowOption[] => {
  if (!permissions.permissions?.role) return [];
  const project = React.useContext(ProjectContext);

  const options = getUserOptions({ showSelfIdentify });

  switch (permissions.permissions.role) {
    case UserRoles.ADMIN:
    case UserRoles.MERGER:
    case UserRoles.EDITOR:
      return compact(getEditingOptions({ isIgboAPIProject }));
    default:
      return compact(options.concat(getCrowdsourcingOptions({ types: project.types || [] })));
  }
};
