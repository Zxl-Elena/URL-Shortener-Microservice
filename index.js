require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const { URL } = require('url');

var shorturlcounts = 0;
let shorturlmap = {};

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(express.json());
app.use(express.urlencoded( { extended: true }));

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// post 和 get
app.post('/api/shorturl', (req, res) => {
  let url = req.body.url;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let hostname;
  try {
    const parseUrl = new URL(url);
    hostname = parseUrl.hostname;
  } catch (err) {
    return res.json({ error: 'invalid url hostname'})
  }

  // 使用 DNS 验证主机名
  dns.lookup(hostname, (err) => {
    if (err) {
      console.error('DNS Lookup Error:', err); // 输出错误日志
      return res.json({ error: 'invalid url' });
    } else {
      shorturlcounts++;
      res.json({ original_url: url, short_url: shorturlcounts });
      shorturlmap[shorturlcounts] = url;
    }
  });
})

app.get('/api/shorturl/:id', (req, res) => {
  const shortUrl = req.params.id;
  const original_url = shorturlmap[shortUrl];

  if(original_url) {
    res.redirect(original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
