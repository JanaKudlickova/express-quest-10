const connection = require('../db-config');
const Joi = require('joi');
const argon2 = require('argon2');

const db = connection.promise();

const validate = (data) => {
    return  Joi.object({
    email: Joi.string().email().max(255).required(),
    password:Joi.string().min(8).max(50).required(),
    firstname: Joi.string().max(255).required(),
    lastname: Joi.string().max(255).required(),
    city: Joi.string().allow(null, '').max(255),
    language: Joi.string().allow(null, '').max(255),
    }).validate(data, { abortEarly: false }).error;}

const findAllUsers = ({ filters: { language } }) => {
    let sql = 'SELECT * FROM users';
    const sqlValues = [];
    if (language) {
      sql += ' WHERE language = ?';
      sqlValues.push(language);
    }
   return db.query(sql, sqlValues).then(([results]) => results);
};

const findOneUserById = (id) => {
    let sql = 'SELECT * FROM users WHERE id = ?';
    const sqlValues = [id];
    return db.query(sql, sqlValues).then(([results]) => results);
}

const findByEmail = (email) => {
  return db
    .query('SELECT * FROM users WHERE email = ?', [email])
    .then(([results]) => results[0]);
};

const findByEmailWithDifferentId = (email, id) => {
  return db
    .query('SELECT * FROM users WHERE email = ? AND id <> ?', [email, id])
    .then(([results]) => results);
};


const addNewUser = ({ firstname, lastname, city, language, email, password }) => {
  return hashPassword(password).then((hashedPassword) => {
    return db
      .query('INSERT INTO users SET ?', {
        firstname,
        lastname,
        city,
        language,
        email,
        hashedPassword,
      })
      .then(([result]) => {
        const id = result.insertId;
        return { firstname, lastname, city, language, email, id };
      });
  });
};

const updateUser = (id, newAttributes) => {
    return db.query('UPDATE users SET ? WHERE id = ?', [newAttributes, id]);
  };
  
const deleteUser = (id) => {
    return db
      .query('DELETE FROM users WHERE id = ?', [id])
      .then(([result]) => result.affectedRows !== 0);
  };

  const hashingOptions = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 5,
    parallelism: 1
  };
  
  const hashPassword = (plainPassword) => {
    return argon2.hash(plainPassword, hashingOptions);
  };
  
  const verifyPassword = (plainPassword, hashedPassword) => {
    return argon2.verify(hashedPassword, plainPassword, hashingOptions);
  };
  


module.exports = {
  findAllUsers,
  findOneUserById,
  validate,
  addNewUser,
  updateUser,
  deleteUser,
  hashPassword,
  verifyPassword,
  findByEmail,
  findByEmailWithDifferentId
}