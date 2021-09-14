import mongoose from 'mongoose';
import chai from 'chai';
import chaiHttp from 'chai-http';
import * as app from '../../functions/index';
import {
  closeServer,
  createExample,
  createWord,
  getExampleSuggestions,
  getGenericWords,
  getUsers,
  getWordSuggestions,
  populateAPI,
  populateGenericWordsAPI,
} from './shared/commands';
import { AUTH_TOKEN } from './shared/constants';

const { app: server } = app;
const { expect } = chai;

chai.use(chaiHttp);

describe('Auth', () => {
  before(function (done) {
    this.timeout(60000);
    populateAPI()
      .then(() => {
        populateGenericWordsAPI()
          .end(() => setTimeout(() => {
            console.log('🏁 Seeding test database with words and genericWords completed');
            done()
          }, 10000));
      });
  });
  describe('Authorization', () => {
    it('should allow an admin to see word suggestions', (done) => {
      getWordSuggestions({}, { token: AUTH_TOKEN.ADMIN_AUTH_TOKEN })
        .end((_, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.error).to.equal(undefined);
          done();
        });
    });

    it('should allow an admin to see generic words', (done) => {
      getGenericWords({}, { token: AUTH_TOKEN.ADMIN_AUTH_TOKEN })
        .end((_, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.error).to.equal(undefined);
          done();
        });
    });

    it('should allow an admin to see example suggestions', (done) => {
      getExampleSuggestions({}, { token: AUTH_TOKEN.ADMIN_AUTH_TOKEN })
        .end((_, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.error).to.equal(undefined);
          done();
        });
    });

    it('should allow an editor to see word suggestions', (done) => {
      getWordSuggestions({}, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN })
        .end((_, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.error).to.equal(undefined);
          done();
        });
    });

    it('should allow an editor to see generic words', (done) => {
      getGenericWords({}, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN })
        .end((_, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.error).to.equal(undefined);
          done();
        });
    });

    it('should allow an editor to see example suggestions', (done) => {
      getExampleSuggestions({}, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN })
        .end((_, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.error).to.equal(undefined);
          done();
        });
    });

    it('should forbid a regular user from seeing word suggestions', (done) => {
      getWordSuggestions({}, { token: AUTH_TOKEN.USER_AUTH_TOKEN })
        .end((_, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.error).to.not.equal(undefined);
          done();
        });
    });

    it('should forbid a regular user from seeing generic words', (done) => {
      getGenericWords({}, { token: AUTH_TOKEN.USER_AUTH_TOKEN })
        .end((_, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.error).to.not.equal(undefined);
          done();
        });
    });

    it('should forbid a regular user from seeing example suggestions', (done) => {
      getExampleSuggestions({}, { token: AUTH_TOKEN.USER_AUTH_TOKEN })
        .end((_, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.error).to.not.equal(undefined);
          done();
        });
    });

    it('should forbid an editor from creating a word', (done) => {
      createWord('', {}, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN })
        .end((_, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.error).to.not.equal(undefined);
          done();
        });
    });

    it('should forbid an editor from creating an example', (done) => {
      createExample('', {}, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN })
        .end((_, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.error).to.not.equal(undefined);
          done();
        });
    });

    it('should allow an admin to get all users', (done) => {
      getUsers()
        .end((_, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });

    it('should forbid a non-admin from getting users', (done) => {
      getUsers({ token: AUTH_TOKEN.MERGER_AUTH_TOKEN })
        .end((_, res) => {
          expect(res.status).to.equal(403);
          done();
        });
    });
  });
});

after(() => {
  // server.clearDatabase();
  server.close();
  closeServer();
  console.log('📪 Closing database connection');
  setTimeout(() => {
    mongoose.connection.close();
  }, 5000);
});
