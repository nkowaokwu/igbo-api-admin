import express from 'express';
import {
  acceptMemberInvite,
  acceptMemberInviteForIgboAPI,
  inviteMemberForIgboAPI,
} from 'src/backend/controllers/invites';
import Collection from 'src/shared/constants/Collection';

const invitesRouter = express.Router();

// Invite
invitesRouter.post(`/${Collection.INVITES}/igbo-api`, inviteMemberForIgboAPI);
invitesRouter.get(`/${Collection.INVITES}/igbo-api/accept`, acceptMemberInviteForIgboAPI);
invitesRouter.get(`/${Collection.INVITES}/accept`, acceptMemberInvite);

export default invitesRouter;
