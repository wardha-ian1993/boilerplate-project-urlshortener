require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortid = require('shortid');
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
  original_url: String,
  short_url: String
});
const Url = mongoose.model('Url', urlSchema);

const isValidUrl = (str) => {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!pattern.test(str);
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/api/shorturl', async (req, res) => {
  const { original_url } = req.body;

  if (!isValidUrl(original_url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const short_url = shortid.generate();
  
  await Url.create({ original_url, short_url });

  res.json({
    "original_url": original_url,
    "short_url": short_url
  });
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const { short_url } = req.params;
  const url = await Url.findOne({ short_url });

  if (!url) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({ original_url: url.original_url });
});
// --------------------------------------------------------------------------------

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
