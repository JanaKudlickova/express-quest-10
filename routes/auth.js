const authRouter = require('express').Router();
const Users = require('../models/users');

authRouter.post('/checkCredentials', (req, res) => {
  const { email, password } = req.body;
  Users.findByEmail(email).then((user) => {
    if (!user) res.status(401).send('Invalid credentials');
    else {
      Users.verifyPassword(password, user.hashedPassword).then(
        (passwordIsCorrect) => {
          if (passwordIsCorrect) res.send('Your credentials are valid !');
          else res.status(401).send('Invalid credentials');
        }
      );
    }
  });
});

module.exports = authRouter;