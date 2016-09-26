var app = require('./server/app.js');


app.init().then(function(){
	app.start();
});