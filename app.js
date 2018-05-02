const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const $ = jQuery = require('jquery');
require('./jquery-csv.js');

var app = express();

const port = 3000;

app.use(express.static('public'));

app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'public', '/pointing_task.html'));
});

app.get('/configuration', function(request, response) {
  fs.readFile(path.join(__dirname, 'configuration.csv'), 'utf8', function (err, data) {
    var csvObject = $.csv.toObjects(data);
    response.json(csvObject);
  });
});

app.listen(port, function() {
  console.log('Server started on port' + port);
});
