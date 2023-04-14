## yt2mp3 NodeJS project
- Youtube to mp3 engine : [ytdl-core](https://github.com/fent/node-ytdl-core#readme)
- Dynamic routing : [EJS](https://ejs.co/)
- [FFMPEG](https://www.npmjs.com/package/ffmpeg)
- [FFMPEG installation](http://www.ffmpeg.org/download.html)

## Decription of class
class.js – tools for standard inheritance in JavaScript

- Inspired by John Resig’s Simple Inheritance [1].
- Focus was on supporting constructor functions. Requirements:
  - Support the new operator
  - Support the instanceof operator
  - Support extending a class C via C.prototype
- For a completely new approach to JavaScript inheritance take a look at
  "prototypes as classes" [2]

1. http://ejohn.org/blog/simple-javascript-inheritance/
1. https://github.com/rauschma/proto-js

===== Code example =====
```JS
// Superclass
var Person = Class.extend({
    constructor: function (name) {
        this.name = name;
    },
    describe: function() {
        return "Person called "+this.name;
    }
});

// Subclass

var Worker = Person.extend({
    constructor: function (name, title) {
        Worker.super.constructor.call(this, name);
        this.title = title;
    },
    describe: function () {
        return Worker.super.describe.call(this)+" ("+this.title+")"; // (*)
    }
});
var jane = new Worker("Jane", "CTO");
```

## Usage Heroku Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)
