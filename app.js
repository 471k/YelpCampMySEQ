/**
 * Checks if the environment variable NODE_ENV is not set to production mode.
 * If it is not set to "production", it loads the configuration from .env file
 * using "dotenv" package. This allows us to store sensitive information like
 * database credetials as environment variables.
 */
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//importing required dependecies and modules
const express = require("express"); //Handles  HTTP requests, define routes and create server apps
const app = express();
const path = require("path"); //Used for concatenating paths
const methodOverride = require("method-override"); // Allows to perform actions such as PUT and DELETE HTTP requests since HTML forms only supports GET and POST
const ejsMate = require("ejs-mate");
const session = require("express-session");
const ExpressError = require("./utils/ExpressError");
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/user");
const helmet = require("helmet");
const sequelize = require("./config/connection.js");

const userRoutes = require("./routes/users.js");
const campgroundRoutes = require("./routes/campgrounds.js");
const reviewRoutes = require("./routes/reviews.js");

// Is used to set the template engine for rendering views to EJS.
// It specifies that ejsMate package should be used for rendering EJS templates.
app.engine("ejs", ejsMate);
//is used to set the view engine to "ejs" and the views directory to the views folder
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/**
 * Sets up various middleware using app.use function.
 * Middleware functions are executed in order they are declared, and they can
 * modify the request and response object, as well as invoke the next middleware in the stack
 */
//It parses the form data and make it available in the 'req.body' object
app.use(express.urlencoded({ extended: true }));
//allows us to use query strings to override the method of a request (useful for PUT and DELETE requests)
//(must be placed before the routes and after app.use(express.urlencoded({ extended: true }) middleware)
//because it needs to be parsed first)
app.use(methodOverride("_method"));
// This middleware serves static files like CSS, JavaScript, and images from the specified directory,
//in this case, the public directory.
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
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://cdn.jsdelivr.net",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://cdn.jsdelivr.net",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/drsapqw26/",
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//initializes passport
app.use(passport.initialize());
//stores user information in session
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  if (!["/login", "/"].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }

  //res.locals is an object passed to the view engine (ejs) to be used in the template  (it is available in every template)
  //(req.user is the user that is currently logged in)
  //(if no user is logged in, req.user is undefined and res.locals.currentUser is undefined as well
  //(if a user is logged in, req.user contains the user's username and id) (res.locals.currentUser is available in every template
  res.locals.currentUser = req.user;

  /**
   * req.flash("success") and req.flash("error") are used to retrieve any flash messages stored
   * under the key "success" and "error" respectively in the req.flash() object.
   * Flash messages are typically used to display temporary messages to the user, often for conveying
   * success or error messages. The value returned by req.flash("success") and req.flash("error") is an array
   * that contains all the flash messages stored under each of their coresponding keys.
   * By assigning the array of flash messages to res.locals.success and res.locals.error, these messages are made
   * available to the views or templates that will be rendered when they are needed
   */
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  //next() is called to move on to the next middleware in the stack.
  //If we don't call next(), the request will be left hanging and the page will never load.
  next();
});

/**
 * Sets up different routes by mapping routes defined in
 * userRoutes, campgroundRoutes and reviewRoutes.
 */
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// app.get("/fakeUser", async (req, res) => {
//   const user = new User({
//     email: "user2@gmail.com",
//     username: "user5",
//     password: "pass5",
//   });
//   console.log("user: ", user);

//   const newUser = await User.register(user, user.password, function (err, user) {
//     if (err) {
//       console.log("error while user register!", err);
//     }
//   });
//   // res.send(newUser);
//   console.log(newUser);
// });

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

sequelize
  .sync({ alter: true })
  .then((kot) => {
    console.log("All models were synchronized successfully.");
    app.listen(3000, () => {
      console.log("Serving on port 3000");
    });
  })
  .catch((err) => {
    console.log("ERROR");
  });
