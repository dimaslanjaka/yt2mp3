var express=require("express"),app=express(),port=process.env.PORT||5e3,passport=require("passport"),flash=require("connect-flash"),morgan=require("morgan"),cookieParser=require("cookie-parser"),bodyParser=require("body-parser"),session=require("express-session"),WMI=require("./app/class.js"),wmi=new WMI;const os=require("os"),computerName=os.hostname();var cookieSession=require("cookie-session");function render_template(e,r){var s=e.title,o=e.description,p=e.content;r.render("template/loader.ejs",{content:p,title:s,description:o})}app.use(morgan("dev")),app.use(cookieParser()),app.use(bodyParser.json()),app.use(bodyParser.urlencoded({extended:!0})),app.set("view engine","ejs"),app.use(express.static(__dirname)),app.locals.rmWhitespace=!0,app.set("trust proxy",1),app.use(cookieSession({name:"session",keys:["session"],maxAge:864e5})),app.use(passport.initialize()),app.use(passport.session()),app.use(flash()),app.render_template=render_template,require("./app/router.js")(app,passport);const portfinder=require("portfinder");function run(e){app.listen(e);const r="http://127.0.0.1:"+e;console.log("NodeJS server running at port "+e),console.log(`open on ${computerName} ${r}`),"L3n4r0x"==computerName&&require("./openbrowser")(e)}"L3n4r0x"==computerName?portfinder.getPortPromise().then(e=>{run(e)}).catch(e=>{run(port)}):run(port);