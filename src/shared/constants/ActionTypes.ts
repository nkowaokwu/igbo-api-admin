/**
 * Action Types that are available within document down downs that get
 * conditionally rendered depending on:
 *
 * 1. The document type and
 * 2. The user permission level
 */
enum ActionTypes {
  EDIT = 'Edit',
  VIEW = 'View',
  SUGGEST_EDIT = 'SuggestionEdit',
  APPROVE = 'Approve',
  DENY = 'Deny',
  NOTIFY = 'Notify',
  MERGE = 'Merge',
  DELETE = 'Delete',
  COMBINE = 'Combine',
  ASSIGN_EDITING_GROUP = 'AssignEditingGroup',
  CONVERT = 'Convert',
  REQUEST_DELETE = 'Send Delete Request',
  DELETE_USER = 'DeleteUser',
};

export default ActionTypes;
