const os = require("os");
class WMI {
  google = {};
  /**
   * Class Web Management Indonesia
   */
  constructor(hostname) {
    this.google.clientID =
      "974269993480-7atd9c46sr0jaq21fauuoibrllqlqqja.apps.googleusercontent.com";
    this.google.clientSecret = "RvrAkt9Myftej6xK3t-AZGqy";

    this.os = os;
    this.hostname = os.hostname();
    if (hostname == "L3n4r0x-PC") {
      hostname = "localhost:5000";
      this.env = "development";
    } else {
      this.env = "production";
    }
    this.google.clientCallback = "http://" + hostname + "/auth/google/callback";
  }

  //---------- Inheritance API

  /**
   * Extend Class WMI
   */
  extend(properties) {
    var superProto = this.prototype || Class;
    var proto = Object.create(superProto);
    // This method will be attached to many constructor functions
    // => must refer to "Class" via its global name (and not via "this")
    Class.copyOwnTo(properties, proto);

    var constr = proto.constructor;
    if (!(constr instanceof Function)) {
      throw new Error("You must define a method 'constructor'");
    }
    // Set up the constructor
    constr.prototype = proto;
    constr.super = superProto;
    constr.extend = this.extend; // inherit class method
    return constr;
  }

  /**
   * Copy property class
   */
  copyOwnTo(source, target) {
    Object.getOwnPropertyNames(source).forEach(function (propName) {
      Object.defineProperty(
        target,
        propName,
        Object.getOwnPropertyDescriptor(source, propName)
      );
    });
    return target;
  }

  /**
   * Google Init
   */
  g_init() {
    let oauth2Client = new google.auth.OAuth2(
      this.google.clientID.trim(),
      this.google.clientSecret.trim(),
      this.google.clientCallback.trim()
    );
    this.client = oauth2Client;
    return oauth2Client;
  }

  /**
   * Authenticate google
   * @param {GoogleApis} oauth2Client
   * @param {Function} callback
   */
  g_auth(oauth2Client, callback) {
    if (!oauth2Client) {
      oauth2Client = this.gclient;
    }
    if (!oauth2Client) {
      return console.error("oauth2Client is null/empty.");
    }
    let token = {
      refresh_token,
      access_token,
    };
    oauth2Client.on("tokens", (tokens) => {
      if (tokens.refresh_token) {
        // store the refresh_token in my database!
        console.log({
          refreshToken: tokens.refresh_token,
        });
        oauth2Client.setCredentials({
          refresh_token: tokens.refresh_token,
        });
        token.refresh_token = tokens.refresh_token;
      }
      console.log({
        accessToken: tokens.access_token,
      });
      token.access_token = tokens.access_token;
    });
    if (typeof callback == "function") {
      return callback(token);
    } else {
      return token;
    }
  }
}

module.exports = WMI;
