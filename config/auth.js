// config/auth.js
var os = require('os');
var hostname = os.hostname();
if (hostname == 'L3n4r0x-PC') {
  hostname = 'localhost:5000';
}
// expose our config directly to our application using module.exports
module.exports = {
  facebookAuth: {
    clientID: 'your-secret-clientID-here', // your App ID
    clientSecret: 'your-client-secret-here', // your App Secret
    callbackURL: 'http://localhost:8080/auth/facebook/callback',
    profileURL: 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
    profileFields: ['id', 'email', 'name'] // For requesting permissions from Facebook API
  },

  twitterAuth: {
    consumerKey: 'your-consumer-key-here',
    consumerSecret: 'your-client-secret-here',
    callbackURL: 'http://localhost:8080/auth/twitter/callback'
  },

  googleAuth: {
    clientID: '974269993480-7atd9c46sr0jaq21fauuoibrllqlqqja.apps.googleusercontent.com',
    clientSecret: 'RvrAkt9Myftej6xK3t-AZGqy',
    callbackURL: 'http://' + hostname + '/auth/google/callback'
  }
};
