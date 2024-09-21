import express from 'express';
import {
  acceptMemberInvite,
  acceptMemberInviteForIgboAPI,
  inviteMemberForIgboAPI,
} from 'src/backend/controllers/invites';
import authentication from 'src/backend/middleware/authentication';
import Collection from 'src/shared/constants/Collection';

const invitesRouter = express.Router();

// Invite
invitesRouter.get(`/${Collection.INVITES}/igbo-api`, inviteMemberForIgboAPI);
invitesRouter.post(`/${Collection.INVITES}/igbo-api/accept`, authentication, acceptMemberInviteForIgboAPI);
invitesRouter.get(`/${Collection.INVITES}/accept`, acceptMemberInvite);

export default invitesRouter;
