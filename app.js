var express = require("express");
var app = express();
var port = process.env.PORT || 5555;
var passport = require("passport");
var flash = require("connect-flash");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var google = require("googleapis");
var WMI = require("./app/class.js");
var wmi = new WMI();
var is = require("./src/is");
const os = require("os");
const computerName = os.hostname();

// set up our express application
app.use(morgan("dev")); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
console.log(wmi.g_auth());
app.set("view engine", "ejs"); // set up ejs for templating
app.use(express.static(__dirname));
app.locals.rmWhitespace = true;
// required for passport
app.use(
  session({
    secret: "dimxxx", // session secret
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

/**
 * template loader function
 * @param {templateOptions} options
 * @param {Express.Response} res
 */
function render_template(options, res) {
  var title = options.title;
  var description = options.description;
  var content = options.content;
  res.render("template/loader.ejs", {
    content: content,
    title: title,
    description: description,
  });
}
app.render_template = render_template;

require("./app/router.js")(app, passport);

/**
 * Run
 */
const portfinder = require("portfinder");
portfinder
  .getPortPromise()
  .then((foundport) => {
    run(foundport);
  })
  .catch((err) => {
    run(port);
  });

const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function run(port) {
  app.listen(port);
  const url = `http://127.0.0.1:${port}`;
  console.log("NodeJS server running at port " + port);
  console.log(`open on ${computerName} ${url}`);
  if (computerName == "L3n4r0x") {
    const open = require("open");
    rl.question(
      `Want to open ${url} ? ` + "\n (y/yes) to open, type any for cancel: \t",
      async function (yes) {
        if (/^(y|yes)$/s.test(yes)) {
          await open(`http://127.0.0.1:${port}`);
        }
      }
    );
    setTimeout(function () {
      rl.close();
    }, 10000);
  }
}
