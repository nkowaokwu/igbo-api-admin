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

const prepareRecord = (record) => {
  const approvals = record?.approvals || [];
  const denials = record?.denials || [];
  return {
    ...record,
    approvals: approvals.some((approval) => typeof approval === 'string')
      ? approvals.map((approval) => approval?.uid ? approval.uid : approval)
      : approvals,
    denials: denials.some((denial) => typeof denial === 'string')
      ? denials.map((denial) => denial?.uid ? denial.uid : denial)
      : denials,
  };
};

const handleUpdatePermissions = useCallable<string, EmptyResponse>('updatePermissions');
const handleRequestDeleteDocument = useCallable<any, EmptyResponse>('requestDeleteDocument');
const handleDeleteConstructedTermPoll = useCallable<any, EmptyResponse>('deleteConstructedTermPoll');
const handleDeleteUser = useCallable<any, EmptyResponse>('deleteUser');
export const handleUpdateDocument = useCallable<any, EmptyResponse>('updateDocument');

export default {
  [ActionTypes.EDIT]: (resource: string, id: string): string => `/${resource}/${id}/edit`,
  [ActionTypes.VIEW]: (resource: string, id: string): string => `/${resource}/${id}/show`,
  [ActionTypes.SUGGEST_EDIT]: (resource: string): string => `/${resource}/create`,
  [ActionTypes.APPROVE]: {
    type: 'Approve',
    title: 'Approve Document',
    content: 'Are you sure you want to approve this document?',
    executeAction: async ({ record, resource } : { record: Record, resource: string }) : Promise<any> => {
      await approveDocument({ resource, record: prepareRecord(record) });
      return handleUpdateDocument({ type: ActionTypes.APPROVE, resource, record });
    },
    successMessage: 'Document has been approved 🙌🏾',
  },
  [ActionTypes.DENY]: {
    type: 'Deny',
    title: 'Deny Document',
    content: 'Are you sure you want to deny this document?',
    executeAction: async ({ record, resource }: { record: Record, resource: string }) : Promise<any> => {
      await denyDocument({ resource, record: prepareRecord(record) });
      return handleUpdateDocument({ type: ActionTypes.DENY, resource, record });
    },
    successMessage: 'Document has been denied 🙅🏾‍♀️',
  },
  [ActionTypes.NOTIFY]: {
    type: 'Notify',
    title: 'Directly Notify Editors About Changes',
    content: 'Are you sure you want to notify editors?',
    executeAction: ({ editorsNotes, record, resource }:
    { editorsNotes: string, record: Record, resource: string }) : Promise<any> => (
      handleUpdateDocument({
        type: ActionTypes.NOTIFY,
        resource,
        record: prepareRecord({ ...record, editorsNotes }),
        includeEditors: true,
      })
    ),
    successMessage: 'Notification has been sent 📬',
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
  [ActionTypes.DELETE_POLL]: {
    type: 'Delete Poll',
    title: 'Delete Poll',
    content: 'Deleting a poll is an irreversible action that will delete the poll '
     + 'in the Igbo API Editor Platform along with associated tweets and Slack bot posts',
    executeAction: (
      { pollId }:
      { pollId: string },
    ) : Promise<any> => (
      handleDeleteConstructedTermPoll({ pollId })
    ),
    successMessage: 'You have deleted the poll',
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
