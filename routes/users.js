const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams: true is needed to access req.params.id in this file
// const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");
const users = require("../controllers/users");

router.route("/register").get(users.renderRegister).post(catchAsync(users.register));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    storeReturnTo, //use the storeReturnTo middleware to save the returnTo value from session to res.locals.returnTo
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }), //passport.authenticate() logs the user in and clears req.session
    users.login
  );

router.get("/logout", users.logout);

module.exports = router;
