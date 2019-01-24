//required
const express = require('express'); //express
const app = express(); //express
const PORT = 8080; // default port 8080
// var cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
app.set('view engine', 'ejs'); //express
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

app.listen(PORT, () => {
  console.log(`Everything is Good ${PORT}!`);
}); // server

//middleware
// app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['123']
    // cookie options
  })
);

//databases
var urlDatabase = {
  BnfXle: {
    longURL: 'http://www.facebook.com',
    userID: 'userRandomID'
  },
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'user3RandomID'
  }
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('123', 10)
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('234', 10)
  },
  user3RandomID: {
    id: 'user3RandomID',
    email: 'a@a.com',
    password: bcrypt.hashSync('abc', 10)
  }
};

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//homepage
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  // lets grab user id from the cookies
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect('/register');
  }
  console.log(userID);
  console.log(`the user_id: ${userID}`);
  // grab user email
  const userEmail = users[userID].email;
  console.log(users[userID].email);
  // lets grab urls for that user
  // put urls and user id into templateVars

  let templateVars = {
    urls: urlDatabase,
    user_id: userID,
    user_email: userEmail
  };
  res.render('urls_index', templateVars);
}); // loop of index

app.post('/urls', (req, res) => {
  // get userId from cookies
  let userID = req.session.user_id;
  // make new short code
  let newCode = generateRandomString();
  // get url from req
  let longURL = req.body.longURL;

  // stick longurl in database at newCode key
  urlDatabase[newCode] = {
    longURL: longURL,
    userID: userID
  };

  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let url = urlDatabase[shortURL];
  console.log(url);
  res.redirect(url.longURL);
});

app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    return res.redirect('/login');
  }
  // grab user email
  const userEmail = users[userID].email;

  // lets grab urls for that user
  // put urls and user id into templateVars
  const templateVars = {
    // urls: urlDatabase,
    user_id: userID,
    user_email: userEmail
  };

  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.send('Error!!');
  }
  let shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const userEmail = users[userID].email;

  let templateVars = {
    longURL: longURL,
    shortURL: shortURL,
    user_id: userID,
    user_email: userEmail
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  // console.log(req.params.user_id);
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// client registration and login

app.get('/register', (req, res) => {
  res.render('register');
}); //creates registration page

app.post('/register', (req, res) => {
  if (
    req.body.email === '' ||
    isEmail(req.body.email) ||
    req.body.password === ''
  ) {
    return res
      .status(400)
      .send('Registration error, check email and password.');
  }

  const email = req.body.email;
  const password = req.body.password;
  const hashPassword = bcrypt.hashSync(password, 10);
  const user_id = generateRandomString();
  users[user_id] = {
    id: user_id,
    email: email,
    password: hashPassword
    // password: req.body.password
  };

  // req.session.password = hashPassword;
  // req.session.email = email;
  req.session.user_id = user_id;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect('/urls');
  } else {
    res.render('login');
  }
  //if logged in redirect to urls
  //if not render login
});

app.post('/login', (req, res) => {
  // grab user email from the request
  const userEmail = req.body.email;
  // grab user password from the request
  const userPassword = req.body.password;
  // console.log(userPassword);
  // get user that has the email entered
  const user = getUserByEmail(userEmail);
  console.log(user);

  // console.log(user);
  // check if user exists
  if (user) {
    // loop thru users object to grab password from each user
    // for (const user in users) {
    let password = user.password;
    //check if entered password = hashed password in database
    if (bcrypt.compareSync(userPassword, password)) {
      // then set the cookies
      // req.session.password = password;
      // req.session.email = user.email;
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      //   // if no user is found, 403 error sent to client
      res.status(403).send('Password error: no user found.');
    }
  } else {
    //   // if no user is found, 403 error sent to client
    res.status(403).send('Login error: no user found.');
  }
});

app.post('/logout', (req, res) => {
  // clears cookies at logout
  req.session.user_id = '';
  res.redirect('/login');
});

// global functions

function isEmail(email) {
  //this part loops through keys in user object
  for (const userId in users) {
    //this takes a single user out of the users object
    const user = users[userId];
    // if we found a user with an email that equals the input email, return true
    if (user.email === email) {
      return true;
    }
  }
  return false;
}

function getUserByEmail(email) {
  //this part loops through keys in user object
  for (let userId in users) {
    //this takes a single user out of the users object
    const user = users[userId];
    // if we found a user with an email that equals the input email, return true
    if (user.email === email) {
      return user;
    }
  }
  // didn't find user, returning null
  return null;
}

function generateRandomString() {
  //Solution from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  let text = '';
  const possible = 'abcdef346jakjdf3246akjdlfkjlvnslk3290SKSKSKLjt90NB';
  for (let i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
