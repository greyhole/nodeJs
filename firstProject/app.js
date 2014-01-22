var express = require('express');
var app = express();
var path = require('path');
var group = {};
var playlist = [[[[]]]];

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var http = require('http').createServer(app);
var io   = require('socket.io').listen(http); 


http.listen(3000, function(){
  console.log('Express server listening on port 3000');
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.get('/',function(req,res){res.render('index',{title: 'Choose your view'})});
app.get('/manager',function(req,res){res.render('manager',{title: 'Manager'})});
app.get('/view',function(req,res){res.render('view',{title: 'Ansicht'})});

io.sockets.on('connection', function(socket){
    io.sockets.emit('this',{will: 'be reci'});

    socket.on('beginCalc',function(dataD,dataU){
         group =  dataD.data;

        var erg = planen(groupArray);
        dataU(erg);
    });
    socket.on('testdata',function(dataD,dataU){
        dataU(dataD.data);
        console.log(dataD.data);
    });
    
    socket.on('saveData',function(dataD,dataU){
        playlist = dataD.data;
        console.log(playlist);
    });
});

function planen(table){
    
    var tmpT = [];

    for (var i = 0; i < table.length; i++){
        var tl = table[i].length;
        var tmpTable=[[],[],[],[]];
        if ( (tl % 2) == 0){
            var z = 0;
            for (var j = 0; j < (tl-1); j++){
                tmpTable[0].push(0);
                tmpTable[1].push(table[i][(tl-1)]);
                tmpTable[2].push(table[i][j]);
                tmpTable[3].push(0);
                z = z + 1;
                for (var k = 1; k < (tl / 2); k++) {
                    var e1 = (j + k) % (tl - 1);
                    var e2 = (j - k + tl - 1) % (tl - 1);
                    tmpTable[0].push(0);
                    tmpTable[1].push(table[i][e1]);
                    tmpTable[2].push(table[i][e2]);
                    tmpTable[3].push(0);
                    z = z + 1;
                }
            }
        }
        else{
            var z = 0;
            for (var j = 1;j <= tl; j++){
                for(var k = 1; k < (tl / 2); k++){
                    tmpTable[0].push(0);
                    tmpTable[3].push(0);
                    tmpTable[1].push(table[i][((j + k) % tl)]);
                    tmpTable[2].push(table[i][((j - k + tl) % tl)]);
                    z = z + 1;
                }
            }
        }
        tmpT.push(tmpTable);
    }
    return tmpT;
}