const connection = require('../db-config');
const Joi = require('joi');

const db = connection.promise();

const validateForPosting = (data) => {
    return  Joi.object({
    title: Joi.string().max(255).required(),
    director: Joi.string().max(255).required(),
    year: Joi.number().integer().min(1888).required(),
    color: Joi.boolean().required(),
    duration: Joi.number().integer().min(1).required(),
  }).validate(data,
    { abortEarly: false }
  ).error;
};

const findMany = ({ filters: { color, max_duration } }) => {
  let sql = 'SELECT * FROM movies';
  const sqlValues = [];
  if (color) {
    sql += ' WHERE color = ?';
    sqlValues.push(color);
  }
  if (max_duration) {
    if (color) sql += ' AND duration <= ? ;';
    else sql += ' WHERE duration <= ?';
    sqlValues.push(max_duration);
  }
  return db.query(sql, sqlValues).then(([results]) => results);
};


const findOneMovieById = (id) => {
    let sql = 'SELECT * FROM movies WHERE id = ?';
    const sqlValues = [id];
    return db.query(sql, sqlValues).then(([results]) => results);
}

const addNewMovie = ({title, director, year, color, duration}) => {
    return db
    .query(
        'INSERT INTO movies (title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)',
        [title, director, year, color, duration]
    )
    .then(([result]) => {
        const id = result.insertId;
        return { id, title, director, year, color, duration }
    })
}

const updateMovie = (id, newAttributes) => {
    return db.query('UPDATE movies SET ? WHERE id = ?', [newAttributes, id]);
  };
  
const deleteMovie = (id) => {
    return db
      .query('DELETE FROM movies WHERE id = ?', [id])
      .then(([result]) => result.affectedRows !== 0);
  };


module.exports = {
  findMany,
  findOneMovieById,
  validateForPosting,
  addNewMovie,
  updateMovie,
  deleteMovie
}