const express = require('express'); //express
const app = express(); //express
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs'); //express

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); // this is the body parse middleware

var urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
}); // this is producing an error

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase); // this renders my database of two urls
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
}); // loop of index

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:id/update', (req, res) => {
  let shortUrl = req.params.id;
  res.render('urs_show');
});

app.get('/urls', (req, res) => {
  res.render('urls_new');
}); // brings me to form

app.post('/urls', (req, res) => {
  let newCode = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[newCode] = longURL;
  console.log('req.body is: ', req.body);

  res.redirect('/urls');
});

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id };
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
  const possible = 'abcdefg';
  for (let i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
} //generates a random string
