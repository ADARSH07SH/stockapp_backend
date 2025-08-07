const User = require("../models/user.model");

const userNameGenerator = async () => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  let username;
  let exists = true;

  while (exists) {
    const randomStr = Array.from({ length: 4 }, () =>
      letters.charAt(Math.floor(Math.random() * letters.length))
    ).join("");
    const number = Math.floor(100 + Math.random() * 900);
    username = `@${randomStr}${number}`;

    const found = await User.findOne({ username });
    if (!found) exists = false;
  }

  return username;
};

module.exports = userNameGenerator;
