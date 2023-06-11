const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if (rows.length > 0) {
    let user = rows[0];
    console.log(user);
    const validPassword = await helpers.matchPassword(password, user.password)

    if (username === 'root'){
      console.log("si es root")
      user.isroot = true; 
      user.test = 'TEst';
    }
    if (user.user_type == 'propietario'){
      user.isowner = true; 
    }
    if (user.user_type == 'cliente'){
      user.iscustomer = true;
    }
    console.log(user);
    const user2 = user; 
    if (validPassword) {
      done(null, user2, req.flash('success', 'Welcome ' + user.first_name));
    } else {
      done(null, false, req.flash('message', 'Incorrect Password'));
    }
  } else {
    return done(null, false, req.flash('message', 'The Username does not exists.'));
  }
}));

passport.use('local.signup', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if (rows.length <= 0) {
    const { document_type, first_name, last_name, email, identity_document, cellphone_number, user_type, birth_date } = req.body;
    let newUser = {
      document_type, 
      first_name, 
      last_name, 
      email, 
      identity_document, 
      cellphone_number, 
      user_type,
      birth_date,
      username,
      password
    }
    newUser.password = await helpers.encryptPassword(password);
    // Saving in the Database
    const result = await pool.query('INSERT INTO users SET ? ', newUser);
    newUser.id = result.insertId;
    return done(null, newUser);
  } else {
    return done(null, false, req.flash('message', 'El Username ya esta tomado.'));
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  let user = rows[0]
  if (user.username === 'root'){
    user.isroot = true; 
  }
  if (user.user_type == 'propietario'){
    user.isowner = true; 
  }
  if (user.user_type == 'cliente'){
    user.iscustomer = true;
  }
  done(null, user);
});