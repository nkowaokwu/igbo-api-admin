import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { NextFunction, Request, Response } from 'express';
import TwitterApi from 'twitter-api-v2';
import Twit from 'twit';
import urlencode from 'urlencode';
import moment from 'moment';
import axios from 'axios';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import Collection from 'src/shared/constants/Collection';
import {
  TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET,
  TWITTER_APP_URL,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET,
  IGBO_API_EDITOR_PLATFORM_ROOT,
  DICTIONARY_APP_URL,
} from 'src/backend/config';
import ConstructedPollThread from '../shared/constants/ConstructedPollThread';
import { handleQueries } from './utils';

type TweetPoll = {
  created_at: string;
  slack_message_ts?: string;
  id: string;
  igboWord: string;
  text: string;
  thread: string[];
};

const db = admin.firestore();
const dbRef = db.doc('tokens/twitter');
const callbackUrl = `${IGBO_API_EDITOR_PLATFORM_ROOT}/twitter_callback`;
const twitterClient = new TwitterApi({
  clientId: TWITTER_CLIENT_ID,
  clientSecret: TWITTER_CLIENT_SECRET,
});

const getTwitterClient = async () => {
  const { refreshToken } = (await dbRef.get()).data() || {};
  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await twitterClient.refreshOAuth2Token(refreshToken);
  return { refreshedClient, accessToken, newRefreshToken };
};

/* Initiates the auto process to post tweets on behalf of @nkowaokwu */
export const onTwitterAuth = async (_: Request, res: Response): Promise<void> => {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(callbackUrl, {
    scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  });

  await dbRef.set({ codeVerifier, state });

  res.redirect(url);
};

/* Saves access and refresh token provided by Twitter */
export const onTwitterCallback = async (
  req: Interfaces.EditorRequest,
  res: Response,
): Promise<void | Response<any>> => {
  const { state, code } = req.query;

  const dbSnapshot = await dbRef.get();
  const { codeVerifier, state: storedState } = dbSnapshot.data();

  if (state !== storedState) {
    return res.status(400).send("Stored token didn't match!");
  }

  const { accessToken, refreshToken } = await twitterClient.loginWithOAuth2({
    code: code as string,
    codeVerifier,
    redirectUri: callbackUrl,
  });

  await dbRef.set({ accessToken, refreshToken });

  return res.sendStatus(200);
};

/* Deletes the specified poll */
export const onDeleteConstructedTermPoll = functions.https.onCall(async ({ pollId }: { pollId: string }) => {
  const { refreshedClient } = await getTwitterClient();
  const dbPollsRef = db.collection(Collection.POLLS);
  const doc = (await dbPollsRef.doc(pollId).get()).data() as TweetPoll;

  // Deletes all Tweets
  refreshedClient.v2.deleteTweet(doc.id);
  await Promise.all(doc.thread.map((tweetId) => refreshedClient.v2.deleteTweet(tweetId)));

  // Deletes Slack message
  if (doc.slack_message_ts) {
    axios.post(`${DICTIONARY_APP_URL}/slack-events`, {
      type: 'igbo_api_editor_platform',
      event: {
        type: 'delete_poll',
        ts: doc.slack_message_ts,
      },
      url: TWITTER_APP_URL,
    });
  }

  // Delete the Firestore document
  await dbPollsRef.doc(pollId).delete();
  return `Deleted poll with id ${pollId}`;
});

/* Posts a new constructed term poll to the @nkowaokwu Twitter account */
export const onSubmitConstructedTermPoll = async (req: Interfaces.EditorRequest, res: Response): Promise<any> => {
  const { body } = req;
  const dbPollsRef = db.collection(Collection.POLLS);

  try {
    const { refreshedClient, accessToken, newRefreshToken } = await getTwitterClient();
    await dbRef.set({ accessToken, refreshToken: newRefreshToken });

    const tweetBody = { text: body.text, poll: body.poll };
    const pollThread = [...ConstructedPollThread];
    pollThread.shift();
    const tweets = await refreshedClient.v2.tweetThread([tweetBody, ...pollThread]);

    const firstTweetId = tweets[0].data.id;

    const slackRes = await axios.post(`${DICTIONARY_APP_URL}/slack-events`, {
      type: 'igbo_api_editor_platform',
      event: {
        type: 'new_poll',
      },
      url: `${TWITTER_APP_URL}/${firstTweetId}`,
    });

    // Saves the first Poll Tweet id in Firestore to list later
    await dbPollsRef.doc(firstTweetId).set({
      created_at: moment().unix(),
      slack_message_ts: slackRes.data.ts,
      id: firstTweetId,
      text: body.text,
      igboWord: body.igboWord,
      thread: tweets.map(({ data }) => data.id).slice(1, 4),
    });

    return res.send(tweets);
  } catch (err) {
    return res.status(500).send(err);
  }
};

const handleTwitResponse = (err) => {
  if (!err) {
    // console.log('Successful merged construction tweet 🐦');
    // console.log('Returned data');
    // console.log(data);
    // console.log('Returned Response');
    // console.log(response);
  } else {
    // console.log(err);
  }
};

/* Posts an update tweet about a constructed term poll getting merged to Twitter and Slack */
export const onMergeConstructedTermPoll = async (mergedWord: Interfaces.Word): Promise<any> => {
  // console.log(`Sending tweet and Slack message for ${mergedWord.word} with id ${mergedWord.id}`);
  try {
    const status = `
    We have added ${mergedWord.word} as our latest constructed term.
  You can see and even suggest edits to the word here! 👇🏾
  
  ${DICTIONARY_APP_URL}/search?word=${urlencode(mergedWord.word)}
  
  #Igbo #LearnIgbo
  `;
    const twitBot = new Twit({
      consumer_key: TWITTER_CONSUMER_KEY,
      consumer_secret: TWITTER_CONSUMER_SECRET,
      access_token: TWITTER_ACCESS_TOKEN,
      access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
    });
    // Sends the tweet on @nkowaokwu
    twitBot.post('statuses/update', { status }, handleTwitResponse);

    // Sends the message to Slack
    // const slackRes = await axios.post(`${DICTIONARY_APP_URL}/slack-events`, {
    //   type: 'igbo_api_editor_platform',
    //   event: {
    //     type: 'merged_constructed_term',
    //   },
    //   mergedWord,
    //   nkowaokwuUrl: `${DICTIONARY_APP_URL}/search?word=${urlencode(mergedWord.word)}`,
    //   editorUrl: `${IGBO_API_EDITOR_PLATFORM_ROOT}/#/words/${mergedWord.id}/show`,
    // });
    // console.log('Slack response');
    // console.log(slackRes);
  } catch (err) {
    // console.log('Unable to send tweet and Slack message', err);
  }
};

/* Enables paginating through all available polls */
export const getPolls = async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { skip, limit } = handleQueries(req);
    const { refreshToken } = (await dbRef.get()).data() || {};
    if (!refreshToken) {
      res.setHeader('Content-Range', 0);
      res.status(200).send([]);
    }
    const dbPollsRef = db.collection('polls');
    const dbPollsWindowRef = db.collection('polls').orderBy('created_at', 'desc');
    const { accessToken, refreshToken: newRefreshToken } = await twitterClient.refreshOAuth2Token(refreshToken);

    await dbRef.set({ accessToken, refreshToken: newRefreshToken });

    const polls = (await dbPollsWindowRef.get()).docs.map((doc) => doc.data()).slice(skip, skip + limit - 1);
    const totalPolls = (await dbPollsRef.get()).docs;
    res.setHeader('Content-Range', totalPolls.length);
    return res.status(200).send(polls);
  } catch (err) {
    // console.log(err);
    return next(err);
  }
};
