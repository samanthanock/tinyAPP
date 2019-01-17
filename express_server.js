const express = require('express'); //express
const app = express(); //express
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set('view engine', 'ejs'); //express

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); // this is the body parse middleware

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

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
}); // this is producing an error

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase); // this renders my database of two urls
});

app.post('/login', (req, res) => {
  // console.log('hello');
  const username = req.body.username; //this is step.4 of compass w2d3 cookies
  res.cookie('username', username);
  res.redirect('/urls/new');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls/new');
});

app.get('/register', (req, res) => {
  // this will post the registration form
  res.render('register');
}); //creates registration page

app.post('/register', (req, res) => {
  const username = req.body.email;
  const password = req.body.password;
  const new_id = generateRandomString();
  users["new_id"] = {id: new_id , email: req.body.email, password: req.body.password};  //recieving data not defined in browser error msg
  res.redirect('/urls/new');
}); // this will be the registration page

app.get('/urls', (req, res) => {
  // Cookies that have not been signed
  // console.log('Cookies: ', req.cookies);
  let templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render('urls_index', templateVars);
}); // loop of index

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:id/update', (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
  //this endpoint takes in an ID for short URL and modifies that ID w/ new longURL.
});

app.get('/urls/new', (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render('urls_new', templateVars);
}); // brings me to form

app.post('/urls', (req, res) => {
  let newCode = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[newCode] = longURL;

  res.redirect('/urls');
});

app.get('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  console.log(shortURL, longURL, urlDatabase);
  let templateVars = {
    longURL: longURL,
    shortURL: shortURL,
    username: req.cookies['username'],
  }; //this is the same as {longURL: lonURL}
  res.render('urls_show', templateVars);
}); // brings me to a blank page

app.post('/urls/:id', (req, res) => {
  const reqShortURL = req.params.id;
});

app.listen(PORT, () => {
  console.log(`Everything is Good ${PORT}!`);
}); //lets me know that i am successfully connected to server in terminal through NODEMON

function generateRandomString() {
  //Solution from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  let text = '';
  const possible = 'abcdef346jakjdf3246akjdlfkjlvnslk3290SKSKSKLjt90NB';
  for (let i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
