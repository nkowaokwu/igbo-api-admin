import mongoose from 'mongoose';
import * as functions from 'firebase-functions';

const config = functions.config();
const DISCONNECTED = 0;
const CONNECTED = 1;
const db = mongoose.connection;

/* Opens a connection to MongoDB */
export const connectDatabase = async (MONGO_URI: string): Promise<void> => new Promise((resolve) => {
  if (db.readyState === DISCONNECTED) {
    /* Connects to the MongoDB Database */
    mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      poolSize: 10,
      bufferMaxEntries: 0,
      useUnifiedTopology: true,
    });

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      if (config?.runtime?.env === 'production') {
        console.log('🗄 Database is connected', process.env.CI, MONGO_URI);
        resolve();
      }
    });
  } else if (db.readyState === CONNECTED) {
    console.log('✅ The database is already connected');
    resolve();
  }
});

/* Closes current connection to MongoDB */
export const disconnectDatabase = (MONGO_URI: string): Promise<void> => new Promise((resolve) => {
  if (db.readyState !== DISCONNECTED) {
    db.close();
    db.once('close', () => {
      if (config?.runtime?.env === 'production') {
        console.log('🗃 Database is connection closed', process.env.CI, MONGO_URI);
        resolve();
      }
    });
  }
});

export const isConnected = (): boolean => mongoose.connection.readyState !== 0;
