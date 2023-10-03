const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

//!IMPORTANT -> to use this file as the entry remove type: module from package.json <-

//middle wires
app.use(cors());
app.use(express.json());
app.use('/users', require('./routes/users'))


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Graphql test server 1 is listening on port ${port}`)
})