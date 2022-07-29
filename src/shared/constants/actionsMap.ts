import { Record } from 'react-admin';
import { EmptyResponse } from 'src/shared/server-validation';
import { useCallable } from 'src/hooks/useCallable';
import { Role } from './auth-types';
import {
  approveDocument,
  denyDocument,
  mergeDocument,
  deleteDocument,
  combineDocument,
  assignUserToEditingGroup,
} from '../API';
import ActionTypes from './ActionTypes';
import Collections from './Collections';

const handleUpdatePermissions = useCallable<string, EmptyResponse>('updatePermissions');
const handleDeleteUser = useCallable<any, EmptyResponse>('deleteUser');
const handleRequestDeleteDocument = useCallable<any, EmptyResponse>('requestDeleteDocument');
export const handleUpdateDocument = useCallable<any, EmptyResponse>('updateDocument');

export default {
  [ActionTypes.EDIT]: (resource: string, id: string): string => `/${resource}/${id}/edit`,
  [ActionTypes.VIEW]: (resource: string, id: string): string => `/${resource}/${id}/show`,
  [ActionTypes.SUGGEST_EDIT]: (resource: string): string => `/${resource}/create`,
  [ActionTypes.APPROVE]: {
    type: 'Approve',
    title: 'Approve Document',
    content: 'Are you sure you want to approve this document?',
    executeAction: ({ record, resource } : { record: Record, resource: string }) : Promise<any> => {
      approveDocument({ resource, record });
      return handleUpdateDocument({ type: ActionTypes.APPROVE, resource, record });
    },
    successMessage: 'Document has been approved 🙌🏾',
  },
  [ActionTypes.DENY]: {
    type: 'Deny',
    title: 'Deny Document',
    content: 'Are you sure you want to deny this document?',
    executeAction: ({ record, resource }: { record: Record, resource: string }) : Promise<any> => {
      denyDocument({ resource, record });
      return handleUpdateDocument({ type: ActionTypes.DENY, resource, record });
    },
    successMessage: 'Document has been denied 🙅🏾‍♀️',
  },
  [ActionTypes.MERGE]: {
    type: 'Merge',
    title: 'Merge Document',
    content: 'Are you sure you want to merge this document?',
    executeAction: ({
      record,
      resource,
      collection,
    }: { record: Record | { id: string }, resource: Collections, collection: Collections }): Promise<any> => {
      handleUpdateDocument({ type: ActionTypes.MERGE, resource, record });
      return mergeDocument({ collection, record });
    },
    successMessage: 'Document has been merged 🎉',
    hasLink: true,
  },
  [ActionTypes.DELETE]: {
    type: 'Delete',
    title: 'Delete Document',
    content: `Are you sure you want to delete this document? 
    The original document creator will get a notification email.`,
    executeAction: ({
      record,
      resource,
    }: { record: Record | { id: string }, resource: string }): Promise<any> => (
      deleteDocument({ resource, record })
    ),
    successMessage: 'Document has been deleted 🗑',
  },
  [ActionTypes.COMBINE]: {
    type: 'Combine',
    title: 'Combine Word into Another Word',
    content: `Are you sure you want to combine this word into another?
    The original document will be deleted.`,
    executeAction: (
      { primaryWordId, resource, record }:
      { primaryWordId: string, resource: string, record: Record },
    ): Promise<any> => (
      combineDocument({ primaryWordId, resource, record })
    ),
    successMessage: 'Document has been combined into another ☄️',
    hasLink: true,
  },
  [ActionTypes.ASSIGN_EDITING_GROUP]: {
    type: 'AssignEditingGroup',
    title: 'Assign User to an Editing Group',
    content: `The GenericWords are segmented into "Editing Groups". Assign 
    a user to a designated group. Range of 1-3 inclusive.`,
    executeAction: (
      { groupNumber, record }:
      { groupNumber: string, record: Record },
    ): Promise<any> => (
      assignUserToEditingGroup({ groupNumber, record })
    ),
    successMessage: 'Editor has been assigned to a editing group 🛎',
  },
  [ActionTypes.CONVERT]: {
    type: 'Convert',
    title: 'Change User Role',
    content: 'Are you sure you want to change this user\'s role?',
    executeAction: ({
      record,
      value: role,
    }: { record: Record, value: string }): Promise<any> => {
      // @ts-ignore
      if (!Object.values(Role).includes(role)) {
        Promise.reject(new Error('Invalid user role'));
      }
      handleUpdatePermissions({ ...record, role });
      return Promise.resolve();
    },
    successMessage: 'User role has been updated 👩🏾‍💻',
  },
  [ActionTypes.REQUEST_DELETE]: {
    type: 'Send Delete Request',
    title: 'Request to Delete Document',
    content: 'Please explain why this document should be deleted. This note will be sent project admins for review.',
    executeAction: (
      { note, resource, record }:
      { note: string, resource: string, record: Record },
    ): Promise<any> => (
      handleRequestDeleteDocument({ note, resource, record })
    ),
    successMessage: 'Your deletion request has been sent to admins 📨',
  },
  [ActionTypes.DELETE_USER]: {
    type: 'DeleteUser',
    title: 'Delete the User',
    content: 'Are you sure you want to delete this user?',
    executeAction: ({
      record,
    }: { record: Record, value: string }): Promise<any> => {
      handleDeleteUser(record);
      return Promise.resolve();
    },
    successMessage: 'User role has been deleted 🗑',
  },
};
