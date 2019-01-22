//required
const express = require('express'); //express
const app = express(); //express
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');
app.set('view engine', 'ejs'); //express

app.listen(PORT, () => {
  console.log(`Everything is Good ${PORT}!`);
}); // server

//middleware
app.use(cookieParser());
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

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
    password: '123'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: '234'
  },
  user3RandomID: {
    id: 'user3RandomID',
    email: 'a@a.com',
    password: 'abc'
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
  const userID = req.cookies['id'];
  // grab user email
  const userEmail = req.cookies['email'];
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
  let userID = req.cookies['id'];
  // make new short code
  let newCode = generateRandomString();
  // get url from req
  let longURL = req.body.longURL;
  console.log(`short code: ${newCode} longurl: ${longURL}`);
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
  const userID = req.cookies['id'];

  // grab user email
  const userEmail = req.cookies['email'];

  // lets grab urls for that user
  // put urls and user id into templateVars
  const templateVars = {
    urls: urlDatabase,
    user_id: userID,
    user_email: userEmail
  };
  if (!userID) {
    res.send('Error! looks like you are not logged in, bro!');
  }
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  console.log(shortURL, longURL, urlDatabase);
  let templateVars = {
    longURL: longURL,
    shortURL: shortURL,
    user_id: req.cookies['id'],
    user_email: req.cookies['email']
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const reqShortURL = req.params.id;
});

app.post('/urls/:id/update', (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
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
    res.status(400).send('Registration error, check email and password.');
  }

  const email = req.body.email;
  const password = req.body.password;
  const user_id = generateRandomString();
  users[user_id] = {
    id: user_id,
    email: req.body.email,
    password: req.body.password
  };

  res.cookie('password', password);
  res.cookie('email', email);
  res.cookie('id', user_id);
  res.redirect('/urls/new');
});

app.get('/login', (req, res) => {
  'IS THIS A LOGIN PAGE';
  res.render('login');
});

app.post('/login', (req, res) => {
  // grab user email from the request
  const userEmail = req.body.email;
  console.log(userEmail);
  // grab user password from the request
  const userPassword = req.body.password;
  console.log(userPassword);
  // get user that has the email entered
  const user = getUserByEmail(userEmail);
  console.log(user);
  // check if user exists
  if (user) {
    // then set the cookies
    res.cookie('password', user.password);
    res.cookie('email', user.email);
    res.cookie('id', user.id);
    res.redirect('/urls');
  } else {
    // if no user is found, 403 error sent to client
    res.status(403).send('Login error: no user found.');
  }
});

app.post('/logout', (req, res) => {
  // clears cookies at logout
  res.clearCookie('id');
  res.clearCookie('password');
  res.clearCookie('email');
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
  for (const userId in users) {
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
