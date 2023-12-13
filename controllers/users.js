const User = require("../models/user");
const passport = require("passport");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  const { email, username, password } = req.body;
  const user = new User({ email, username, password });
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
  const redirectUrl = res.locals.returnTo || "/campgrounds"; //if res.locals.returnTo exists, se redirectUrl to res.locals.returnTo, otherwise set redirectUrl to "/campgrounds"
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
