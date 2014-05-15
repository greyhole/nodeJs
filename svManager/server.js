var express = require('express');
var	app = express();
	app.set('views',__dirname);
	app.set('view engine', 'jade');
	app.use(express.static(__dirname));

var	http = require('http').createServer(app),
	io = require('socket.io').listen(http);

http.listen(3000, function(){
  console.log('Express server listening on port 3000');
});

app.get('/',function(req,res){res.render('index',{title: 'Choose your view'})});

io.sockets.on('connection', function (socket) {
    
    console.log("client was connected");

    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});
