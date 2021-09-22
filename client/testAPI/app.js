const express = require('express');
const app = express();
const cors = require("cors");
const port = 9000;
const fs = require('fs');

app.use(cors())

app.get('/', (req, res) => {
  res.end('Hello World!');
});

app.get('/suggestions', (req, res) => {
  fs.readFile(__dirname + '/' + 'data.json', 'utf8', (err, data) => {
    res.end(data);
});  
})

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
  });