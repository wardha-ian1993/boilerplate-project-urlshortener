require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const urlParser = require('url');
const shortid = require('shortid');
const dns = require('dns');

const mongoose = require('mongoose');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// --------------------------------------------------------------------------------
mongoose.connect("mongodb+srv://favianwardhana1993:2NE1uGidwJEYyUsS@fcc-moongose-tutorial.pr5sbrf.mongodb.net/?retryWrites=true&w=majority&appName=fcc-moongose-tutorial", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const urlSchema = new mongoose.Schema({
  url: String,
  short_url: String
});
const Url = mongoose.model('Url', urlSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;
  const short_url = shortid.generate();

  const isValidUrl = dns.lookup(urlParser.parse(url).hostname, (err, address) => {
    if (!address) {
      res.json({ error: "Invalid URL" })
    } else {
      Url.create({ url: url, short_url: short_url });
      res.json({ "original_url": url, "short_url": short_url });
    }
  })
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const { short_url } = req.params;
  const url = await Url.findOne({ short_url: short_url });

  if (!url) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(url.url);
});
// --------------------------------------------------------------------------------

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
