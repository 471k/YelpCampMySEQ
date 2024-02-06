const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  const { email, username, password } = req.body;
  //creating a new user instance
  const user = new User({ email, username, password });

  //handle the registration process
  await User.register(user, password, function (err, user) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("/register");
    } else {
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to Yelp Camp!");
        res.redirect("/campgrounds");
      });
    }
  });
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");

  //if res.locals.returnTo exists, set redirectUrl to res.locals.returnTo, 
  //otherwise set redirectUrl to "/campgrounds"
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });

  //   req.logout();

  //   req.flash("success", "Goodbye!");
  //   res.redirect("/campgrounds");
};
