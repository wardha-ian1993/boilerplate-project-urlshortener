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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});
const Url = mongoose.model('Url', urlSchema);

app.post('/api/shorturl', async (req, res) => {
  const { original_url } = req.body;
  const short_url = shortid.generate();

  await Url.create({ original_url, short_url });

  res.json({ original_url, short_url });
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const { short_url } = req.params;
  const url = await Url.findOne({ short_url });

  if (!url) {
    return res.status(404).json({ error: 'Short URL not found' });
  }
  res.redirect(url.original_url);
});
// --------------------------------------------------------------------------------

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
