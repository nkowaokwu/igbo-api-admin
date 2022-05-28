import * as functions from 'firebase-functions';

const config = functions.config();
export const { CI, NODE_ENV, PORT = 8080 } = process.env;
export const isProduction = config?.runtime?.env === 'production' || NODE_ENV === 'production';

// Igbo API
export const IGBO_API_ROOT = config?.runtime?.env !== 'cypress' && NODE_ENV === 'production'
  ? 'https://www.igboapi.com/api/v1'
  : 'http://localhost:8080/api/v1';

// Igbo API Editor Platform
export const IGBO_API_EDITOR_PLATFORM_ROOT = config?.runtime?.env !== 'cypress' && isProduction
  ? 'https://editor.igboapi.com'
  : 'http://127.0.0.1:3030';

// SendGrid API
export const SENDGRID_API_KEY = config?.sendgrid?.api_key;
export const MERGED_SUGGESTION_TEMPLATE = config?.sendgrid?.merged_suggestion_template;
export const REJECTED_SUGGESTION_TEMPLATE = config?.sendgrid?.rejected_suggestion_template;
export const MERGED_STATS_TEMPLATE = config?.sendgrid?.merged_stats_template;
export const SUGGESTIONS_REVIEW_REMINDER_TEMPLATE = config?.sendgrid?.suggestions_review_reminder_template;
export const NEW_USER_NOTIFICATION_TEMPLATE = config?.sendgrid?.new_user_notification_template;
export const UPDATED_ROLE_NOTIFICATION = config?.sendgrid?.updated_role_notification;
export const DOCUMENT_DELETION_REQUEST_NOTIFICATION = config?.sendgrid?.document_deletion_request_notification;
export const DOCUMENT_UPDATE_NOTIFICATION = config?.sendgrid?.document_update_notification;
export const API_FROM_EMAIL = config?.sendgrid?.sender_email;
export const NKOWAOKWU_FROM_EMAIL = config?.sendgrid?.sender_email;

// AWS
export const AWS_ACCESS_KEY = config?.aws?.access_key;
export const AWS_SECRET_ACCESS_KEY = config?.aws?.secret_access_key;
export const AWS_BUCKET = config?.aws?.bucket;
export const AWS_REGION = config?.aws?.region;

export const EXPRESS_PORT = 5002;

export const DICTIONARY_APP_URL = 'https://nkowaokwu.com';

// Database
const DB_NAME = 'igbo_api';
const TEST_DB_NAME = 'test_igbo_api';
export const MONGO_HOST = 'localhost'; // Connects to MongoDB Docker container
export const MONGO_ROOT = `mongodb://${MONGO_HOST}:27017`;
export const TEST_MONGO_URI = `${MONGO_ROOT}/${TEST_DB_NAME}`;
export const LOCAL_MONGO_URI = `${MONGO_ROOT}/${DB_NAME}`;
export const PROD_MONGO_URI = config?.env?.mongo_uri;

const PROD_CORS_ORIGINS = [
  /nkowaokwu.com$/,
  /\.igboapi\.com$/,
  /igbo-api-admin.web.app$/,
  /igbo-api-admin-staging.web.app$/,
];

/* Prevents non-approved cross-origin sites from accessing certain routes */
export const CORS_CONFIG = {
  origin: CI || NODE_ENV === 'development' ? true : PROD_CORS_ORIGINS,
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
};

/* Editor guides */
export const IGBO_API_VOLUNTEER_HOME_BASE = (
  'https://www.notion.so/Igbo-API-Volunteer-Home-Base-7e54a6f2603c402bbd3ed109eaf4ff58'
);
export const WORD_CHECKLIST_URL = 'https://www.notion.so/Word-Edit-Checklist-6786e201c6ef4a1ca5f46fa9b1516552';

/* This is the MAIN_KEY that grants the platform unlimited access to using the Igbo API */
export const GET_MAIN_KEY = (): string => {
  if (config?.runtime?.env === 'production') {
    return config?.env?.main_key;
  }
  return CI || config?.runtime?.env === 'cypress' || NODE_ENV !== 'production'
    ? 'main_key'
    : config?.env?.main_key;
};

// Twitter API
export const TWITTER_CLIENT_ID = config?.twitter?.client_id;
export const TWITTER_CLIENT_SECRET = config?.twitter?.client_secret;
