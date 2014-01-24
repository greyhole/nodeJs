var express = require('express');
var app = express();
var path = require('path');
var group = [];
var playlist = [];

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
    //io.sockets.emit('connection',socket:' + socket.id + 'ist verbunden.');

    socket.on('calculate_playlist',function(dataD,dataU){
        group = dataD;
        var erg = planen(dataD);
        dataU(erg);
    });
    
    socket.on('calculate_score',function(dataD){
       playlist = dataD;
       score();
       io.sockets.emit('getScore',group);
    });
});

function planen(table){
    
    var tmpT = [];

    for (var ii in table){
        var tl = table[ii].teams.length;
        var tmpArray=[];
        if ( (tl % 2) == 0){
            for (var j = 0; j < (tl-1); j++){
                tmpArray.push({
                    'name1': table[ii].teams[(tl-1)].name,
                    'name2': table[ii].teams[j].name,
                    'punkte1': 0,
                    'punkte2': 0
                });
                for (var k = 1; k < (tl / 2); k++) {
                    var e1 = (j + k) % (tl - 1);
                    var e2 = (j - k + tl - 1) % (tl - 1);
                    tmpArray.push({
                        'name1': table[ii].teams[e1].name,
                        'name2': table[ii].teams[e2].name,
                        'punkte1': 0,
                        'punkte2': 0
                    });
                }
            }
        }
        else{
            for (var j = 1;j <= tl; j++){
                for(var k = 1; k < (tl / 2); k++){
                    tmpArray.push({
                        'name1': table[ii].teams[((j + k) % tl)].name,
                        'name2': table[ii].teams[((j - k + tl) % tl)].name,
                        'punkte1': 0,
                        'punkte2': 0
                    });
                }
            }
        }
        tmpT[ii] = {'liste':tmpArray,'gruppe': table[ii].gruppe};
    }
    return tmpT;
}
function score(){
    for (ii in group){
        for (jj in playlist){
            if (group[ii].gruppe == playlist[jj].gruppe){
                console.log('gewählte gruppe:',group[ii]);

                console.log('gewählte playlist:',playlist[jj]);
                for (team in group[ii].teams){
                    for (match in playlist[jj].liste){
                        if(group[ii].teams[team].name == playlist[jj].liste[match].name1){
                            if ((playlist[jj].liste[match].punkte1 > 0)||(playlist[jj].liste[match].punkte2 > 0) ){
                                group[ii].teams[team].spiele = group[ii].teams[team].spiele + 1;
                            }
                            group[ii].teams[team].toreP = group[ii].teams[team].toreP + playlist[jj].liste[match].punkte1;
                            group[ii].teams[team].toreM = group[ii].teams[team].toreM + playlist[jj].liste[match].punkte2;
                            group[ii].teams[team].punkte = group[ii].teams[team].punkte + ((playlist[jj].liste[match].punkte1 ==10) ? 3 : 0);                            
                        }

                        else if(group[ii].teams[team].name == playlist[jj].liste[match].name2){
                            if ((playlist[jj].liste[match].punkte1 > 0)||(playlist[jj].liste[match].punkte2 > 0) ){
                                group[ii].teams[team].spiele = group[ii].teams[team].spiele + 1;
                            }
                            group[ii].teams[team].toreP = group[ii].teams[team].toreP + playlist[jj].liste[match].punkte2;
                            group[ii].teams[team].toreM = group[ii].teams[team].toreM + playlist[jj].liste[match].punkte1;
                            group[ii].teams[team].punkte = group[ii].teams[team].punkte + ((playlist[jj].liste[match].punkte2 ==10) ? 3 : 0);                            
                        }
                    }
                }
            }
        }
    }
}