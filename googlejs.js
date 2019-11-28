'use strict';

/**
 * This is used by several samples to easily provide an oauth2 workflow.
 */

const {
  google
} = require('googleapis');
const http = require('http');
const url = require('url');
const opn = require('open');
const destroyer = require('server-destroy');
const fs = require('fs');
const path = require('path');

class gclient {
  constructor() {
    //google init
    let client = new google.auth.OAuth2(
      '439429450847-2r1oa7oj8r0hghopmaasi1brdbc3f2vj.apps.googleusercontent.com'.trim(),
      'mk0QC76LGxW5G7JNe-oQUXW2'.trim(),
      'http://127.0.0.1:5000/callback'.trim()
    );

    // generate a url that asks permissions for Blogger and Google Calendar scopes
    let scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/youtube'
    ];

    let url_redirect = client.generateAuthUrl({
      'access_type': 'offline',
      'prompt': 'consent',
      'scope': scopes
    });
    this.oAuth2Client = client;
    this.url_redirect = url_redirect;
  }
}

class SampleClient {
  constructor(options) {
    this.scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/youtube'
    ];

    // create an oAuth client to authorize the API call
    this.oAuth2Client = new google.auth.OAuth2(
      '439429450847-2r1oa7oj8r0hghopmaasi1brdbc3f2vj.apps.googleusercontent.com'.trim(),
      'mk0QC76LGxW5G7JNe-oQUXW2'.trim(),
      'http://127.0.0.1:5000/callback'.trim()
    );
    this.url_redirect = this.oAuth2Client.generateAuthUrl({
      'access_type': 'offline',
      'prompt': 'consent',
      'scope': this.scopes
    });
  }

  client(){
    return this.oAuth2Client;
  }

  // Open an http server to accept the oauth callback. In this
  // simple example, the only request to our webserver is to
  // /oauth2callback?code=<code>
  async authenticate(scopes) {
    return new Promise((resolve, reject) => {
      // grab the url that will be used for authorization
      this.authorizeUrl = this.oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: this.scopes.join(' '),
      });
      const server = http.createServer(async (req, res) => {
        try {
          if (req.url.indexOf('/callback') > -1) {
            const qs = new url.URL(req.url, 'http://localhost:5000').searchParams;
            res.end(
              'Authentication successful! Please return to the console.'
            );
            server.destroy();
            const {
              tokens
            } = await this.oAuth2Client.getToken(qs.get('code'));
            this.oAuth2Client.credentials = tokens;
            resolve(this.oAuth2Client);
          }
        } catch (e) {
          reject(e);
        }
      })
        .listen(3000, () => {
          // open the browser to the authorize url to start the workflow
          opn(this.authorizeUrl, {
            wait: false
          }).then(cp => cp.unref());
        });
      destroyer(server);
    });
  }
}

module.exports = new SampleClient();