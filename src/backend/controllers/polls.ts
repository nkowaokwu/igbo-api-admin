import { NextFunction, Request, Response } from 'express';
import admin from 'firebase-admin';
import TwitterApi from 'twitter-api-v2';
import moment from 'moment';
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, IGBO_API_EDITOR_PLATFORM_ROOT } from '../config';
import ConstructedPollThread from '../shared/constants/ConstructedPollThread';
import { handleQueries } from './utils';

const db = admin.firestore();
const dbRef = db.doc('tokens/twitter');
const callbackUrl = `${IGBO_API_EDITOR_PLATFORM_ROOT}/twitter_callback`;
const twitterClient = new TwitterApi({
  clientId: TWITTER_CLIENT_ID,
  clientSecret: TWITTER_CLIENT_SECRET,
});

/* Initiates the auto process to post tweets on behalf of @nkowaokwu */
export const onTwitterAuth = async (req: Request, res: Response): Promise<void> => {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callbackUrl,
    { scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] },
  );

  await dbRef.set({ codeVerifier, state });

  res.redirect(url);
};

/* Saves access and refresh token provided by Twitter */
export const onTwitterCallback = async (req: Request, res: Response): Promise<void | Response<any>> => {
  const { state, code } = req.query;

  const dbSnapshot = await dbRef.get();
  const { codeVerifier, state: storedState } = dbSnapshot.data();

  if (state !== storedState) {
    return res.status(400).send('Stored token didn\'t match!');
  }

  const {
    accessToken,
    refreshToken,
  } = await twitterClient.loginWithOAuth2({
    code: (code as string),
    codeVerifier,
    redirectUri: callbackUrl,
  });

  await dbRef.set({ accessToken, refreshToken });

  return res.sendStatus(200);
};

/* Posts a new constructed term poll to the @nkowaokwu Twitter account */
export const onSubmitConstructedTermPoll = async (req: Request, res: Response): Promise<any> => {
  const { refreshToken } = (await dbRef.get()).data();
  const { body } = req;
  const dbPollsRef = db.collection('polls');

  try {
    const {
      client: refreshedClient,
      accessToken,
      refreshToken: newRefreshToken,
    } = await twitterClient.refreshOAuth2Token(refreshToken);

    await dbRef.set({ accessToken, refreshToken: newRefreshToken });

    const tweetBody = { text: body.text, poll: body.poll };
    const tweets = await refreshedClient.v2.tweetThread([tweetBody, ...ConstructedPollThread.slice(1, 4)]);

    // Saves the first Poll Tweet id in Firestore to list later
    await dbPollsRef.doc(tweets[0].data.id).set({
      created_at: moment().unix(),
      id: tweets[0].data.id,
      constructedTerm: body.constructedTerm,
      englishTerm: body.englishTerm,
      definition: body.definition,
      thread: tweets.map(({ data }) => data.id).slice(1, 4),
    });

    return res.send(tweets);
  } catch (err) {
    return res.status(500).send(err);
  }
};

/* Enables paginating through all available polls */
export const getPolls = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { skip, limit } = handleQueries(req);
    const { refreshToken } = (await dbRef.get()).data();
    const dbPollsRef = db.collection('polls');
    const dbPollsWindowRef = db.collection('polls').orderBy('created_at').startAt(skip);
    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = await twitterClient.refreshOAuth2Token(refreshToken);

    await dbRef.set({ accessToken, refreshToken: newRefreshToken });

    const polls = (await dbPollsWindowRef.get()).docs.map((doc) => doc.data()).slice(0, limit);
    const totalPolls = (await dbPollsRef.get()).docs;
    res.setHeader('Content-Range', totalPolls.length);
    return res
      .status(200)
      .send(polls);
  } catch (err) {
    console.log(err);
    return next(err);
  }
};
