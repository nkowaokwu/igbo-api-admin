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
  BULK_DELETE = 'BulkDelete',
  COMBINE = 'Combine',
  CONVERT = 'Convert',
  REQUEST_DELETE = 'Send Delete Request',
  DELETE_POLL = 'Delete Poll',
  DELETE_USER = 'DeleteUser',
  BULK_UPLOAD_EXAMPLES = 'BulkUploadExamples',
}

export default ActionTypes;
