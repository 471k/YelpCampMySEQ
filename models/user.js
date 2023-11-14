const sequelize = require("../config/connection");
const passportLocalSequelize = require("passport-local-sequelize");

const User = passportLocalSequelize.defineUser(sequelize);

User.sync();
module.exports = User;
