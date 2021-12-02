var express = require('express');
var controller = require('./controllers/controller');

var app=express();

//set up template engine
app.set('view engine', 'ejs');

//static files
app.use('/public', express.static('public'));
 

// fire controllers - routing
controller(app);



app.listen(3000);

