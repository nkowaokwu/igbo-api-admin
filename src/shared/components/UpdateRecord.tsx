import { map, compact } from 'lodash';
import { Record } from 'react-admin';

/* Changes the record's approvals and denials */
const balanceRecordApprovalsAndDenials = (record) => {
  record.approvals = map(compact(record.approvals), (approval: { uid: string }) =>
    approval.uid ? approval.uid : approval,
  );
  record.denials = map(compact(record.denials), (denial: { uid: string }) => (denial.uid ? denial.uid : denial));
};

const approveRecord = ({ uid, record }: { uid: string; record: Record }): Record => {
  if (!uid) {
    throw new Error('User uid does not exist.');
  }

  if (!record) {
    throw new Error('Record does not exist.');
  }

  balanceRecordApprovalsAndDenials(record);

  const updatedApprovals = record.approvals;
  const updatedDenials = record.denials;
  if (!updatedApprovals.includes(uid)) {
    updatedApprovals.push(uid);
  }
  if (updatedDenials.includes(uid)) {
    const indexOfId = updatedDenials.indexOf(uid);
    updatedDenials.splice(indexOfId, 1);
  }
  const updatedRecord = {
    ...record,
    approvals: updatedApprovals,
    denials: updatedDenials,
  };
  return updatedRecord;
};

const denyRecord = ({ uid, record }: { uid: string; record: Record }): Record => {
  if (!uid) {
    throw new Error('User uid does not exist.');
  }

  if (!record) {
    throw new Error('Record does not exist.');
  }

  balanceRecordApprovalsAndDenials(record);

  const updatedApprovals = record.approvals;
  const updatedDenials = record.denials;
  if (!updatedDenials.includes(uid)) {
    updatedDenials.push(uid);
  }
  if (updatedApprovals.includes(uid)) {
    const indexOfId = updatedApprovals.indexOf(uid);
    updatedApprovals.splice(indexOfId, 1);
  }
  const updatedRecord = {
    ...record,
    approvals: updatedApprovals,
    denials: updatedDenials,
  };
  return updatedRecord;
};

const mergeRecord = ({ uid, record }: { uid: string; record: Record }): Record => {
  if (!uid) {
    throw new Error('User uid does not exist.');
  }

  if (!record) {
    throw new Error('Record does not exist.');
  }

  const updatedRecord = { ...record, mergedBy: uid };
  return updatedRecord;
};

export { approveRecord, denyRecord, mergeRecord };
