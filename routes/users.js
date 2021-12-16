// Create the router object that will manage all operations on users
const usersRouter = require('express').Router();
// Import the users model that we'll need in controller functions
const Users = require('../models/users');

// GET /api/users/
usersRouter.get('/', (req, res) => {
  const { language } = req.query;
  Users.findAllUsers({ filters: { language } })
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error retrieving users from database');
    });
});


usersRouter.get('/:id', (req, res) => {
    const { id } = req.params
    Users.findOneUserById(id)
      .then((users) => {
        res.json(users);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send('Error retrieving a user from database');
      });
  });

  usersRouter.post('/', (req, res) => {
    const { email } = req.body;
    let validationErrors = null;
    Users.findByEmail(email)
      .then((existingUserWithEmail) => {
        if (existingUserWithEmail) return Promise.reject('DUPLICATE_EMAIL');
        validationErrors = Users.validate(req.body);
        if (validationErrors) return Promise.reject('INVALID_DATA');
        return Users.addNewUser(req.body);
      })
      .then((createdUser) => {
        res.status(201).json(createdUser);
      })
      .catch((err) => {
        console.error(err);
        if (err === 'DUPLICATE_EMAIL')
          res.status(409).json({ message: 'This email is already used' });
        else if (err === 'INVALID_DATA')
          res.status(422).json({ validationErrors });
        else res.status(500).send('Error saving the user');
      });
  });

/*
usersRouter.put('/:id', (req, res) => {
    let existingUser = null;
    let validationErrors = null;
    Users.updateUser(req.params.id)
      .then((user) => {
        existingUser = user;
        if (!existingUser) return Promise.reject('RECORD_NOT_FOUND');
        validationErrors = Users.validate(req.body, false);
        if (validationErrors) return Promise.reject('INVALID_DATA');
        return Users.updateUser(req.params.id, req.body);
      })
      .then(() => {
        res.status(200).json({ ...existingUser, ...req.body });
      })
      .catch((err) => {
        console.error(err);
        if (err === 'RECORD_NOT_FOUND')
          res.status(404).send(`User with id ${req.params.id} not found.`);
        else if (err === 'INVALID_DATA')
          res.status(422).json({ validationErrors: validationErrors.details });
        else res.status(500).send('Error updating a user.');
      });
  });
  */
  
  usersRouter.delete('/:id', (req, res) => {
    Users.deleteUser(req.params.id)
      .then((deletedUser) => {
        if (deletedUser) res.status(200).send('🎉 User deleted!');
        else res.status(404).send('User not found');
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send('Error deleting a user');
      });
  });


module.exports = usersRouter;