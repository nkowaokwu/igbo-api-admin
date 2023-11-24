import * as Interfaces from 'src/backend/controllers/utils/interfaces';

/**
 * Determines if the current audio pronunciation is reviewed by the current user
 * @param param0 pronunciation and uid
 * @returns Boolean if the audio pronunciation is reviewed by the current user
 */
const isUserReviewedAudioPronunciation = ({
  pronunciation,
  uid,
}: {
  pronunciation: Interfaces.PronunciationData;
  uid: string;
}): boolean => pronunciation.approvals.includes(uid) || pronunciation.denials.includes(uid);

export default isUserReviewedAudioPronunciation;
