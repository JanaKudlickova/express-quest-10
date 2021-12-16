const connection = require('../db-config');
const Joi = require('joi');

const db = connection.promise();

const validate = (data) => {
    return  Joi.object({
    email: Joi.string().email().max(255).required(),
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


const addNewUser = ({email, firstname, lastname, city, language}) => {
    return db
    .query(
        'INSERT INTO users (email, firstname, lastname, city, language) VALUES (?, ?, ?, ?, ?)',
        [email, firstname, lastname, city, language]
    )
    .then(([result]) => {
        const id = result.insertId;
        return { id, email, firstname, lastname, city, language }
    })
}

const updateUser = (id, newAttributes) => {
    return db.query('UPDATE users SET ? WHERE id = ?', [newAttributes, id]);
  };
  
const deleteUser = (id) => {
    return db
      .query('DELETE FROM users WHERE id = ?', [id])
      .then(([result]) => result.affectedRows !== 0);
  };
  


module.exports = {
  findAllUsers,
  findOneUserById,
  validate,
  addNewUser,
  updateUser,
  deleteUser
}