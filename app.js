const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const ExpressError = require("./utils/ExpressError");
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/user");

const campgrounds = require("./routes/campgrounds.js");
const reviews = require("./routes/reviews.js");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//It parses the form data and make it available in the 'req.body' object
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "thisshouldbeabettersecret!", //used to sign the hash which is sent to the client to authenticate the session id (cookie) on each request (to prevent tampering)
  resave: false, //only save the session if something has changed (prevent unnecessary writes to the session store)
  saveUninitialized: true, //only save a cookie if a user is logged in (to prevent empty sessions)
  cookie: {
    httpOnly: true, //cookie cannot be accessed by client side script (to prevent cross-site scripting attacks)
    // secure: true, //cookie can only be sent over https
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //in milliseconds (1 week)
    maxAge: 1000 * 60 * 60 * 24 * 7, //in milliseconds (1 week)
  },
};
app.use(session(sessionConfig)); //session middleware must be used before flash middleware
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success"); //res.locals is an object passed to the view engine (ejs) to be used in the template (it is available in every template)
  res.locals.error = req.flash("error"); //res.locals is an object passed to the view engine (ejs) to be used in the template (it is available in every template)
  next(); //move on to the next middleware in the stack
});

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

app.get("/fakeUser", async (req, res) => {
  const user = new User({
    email: "user2@gmail.com",
    username: "user2",
  });
  const newUser = await User.register(user, "pass2");
  // res.send(newUser);
  console.log(newUser);
});

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
