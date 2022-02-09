import React, { ReactElement } from 'react';
import { CommentsProps } from 'src/shared/interfaces';
import NewLineText from 'src/shared/components/NewLineText';

const Comments = ({ editorsNotes, userComments }: CommentsProps): ReactElement => (
  <div className="flex flex-col mt-5">
    <h1 className="text-xl text-gray-600 mb-3">{'Editor\'s Note'}</h1>
    <p className={editorsNotes ? 'text-gray-600' : 'text-gray-500 italic'}>
      {editorsNotes || 'No editor notes'}
    </p>
    <h1 className="text-xl text-gray-600 mb-3 mt-2">{'User\'s comments'}</h1>
    <p className={userComments ? 'text-gray-600' : 'text-gray-500 italic'}>
      {userComments ? <NewLineText text={userComments} /> : 'No user comments'}
    </p>
  </div>
);

export default Comments;
