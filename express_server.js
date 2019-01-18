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
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//homepage
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  // Cookies that have not been signed
  // console.log('Cookies: ', req.cookies);
  let templateVars = { urls: urlDatabase, user: req.cookies['users'] };
  res.render('urls_index', templateVars);
}); // loop of index

app.post('/urls', (req, res) => {
  let newCode = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[newCode] = longURL;
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { urls: urlDatabase, user: req.cookies['users'] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  console.log(shortURL, longURL, urlDatabase);
  let templateVars = {
    longURL: longURL,
    shortURL: shortURL,
    user: req.cookies['users'],
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
    res.redirect('register');
  }

  const email = req.body.email;
  const password = req.body.password;
  const new_id = generateRandomString();
  users['new_id'] = {
    id: new_id,
    email: req.body.email,
    password: req.body.password,
  }; //recieving data not defined in browser error msg

  res.cookie('password', password);
  res.cookie('email', email);
  res.cookie('id', new_id);
  res.redirect('/urls/new');

  // if email === users.email then 404
  // if email or password === "" then 404
  // else continue
}); // this will be the registration page

app.get('error', (req, res) => {
  res.render('error');
});

app.get('/login', (req, res) => {
  'IS THIS A LOGIN PAGE';
  res.render('login');
});

app.post('/login', (req, res) => {
  // console.log('hello');
  const username = req.body.new_id; //this is step.4 of compass w2d3 cookies
  res.cookie('user', user);
  res.redirect('/urls/new');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls/new');
});

// global functions

function isEmail(email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return true;
    }
  }
  return false;
}

function generateRandomString() {
  //Solution from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  let text = '';
  const possible = 'abcdef346jakjdf3246akjdlfkjlvnslk3290SKSKSKLjt90NB';
  for (let i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

//lets me know that i am successfully connected to server in terminal through NODEMON
