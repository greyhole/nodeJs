var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var db = {
    'group': [],
    'playlist':[],
    'runden':{},
    'score':[]
};

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

loadData();
app.get('/',function(req,res){res.render('index',{title: 'Choose your view'})});
app.get('/manager',function(req,res){res.render('manager',{title: 'Manager'})});
app.get('/view',function(req,res){res.render('view',{title: 'Ansicht'})});

io.sockets.on('connection', function(socket){
    sendData();

    socket.on('transmit_group',function(dataD){
        db.group = dataD.group;
        db.playlist = create_playlist(db.group);
        saveData();
        sendData();
    });
    socket.on('transmit_runden',function(dataD){
        db.runden = dataD.runden;
        saveData();
        sendData();
    });

    socket.on('transmit_playlist',function(dataD){
       db.playlist = dataD.playlist;
       db.score = createScore(db.group,db.playlist);
       console.log(db.score);
       saveData();
       sendData();
    });
});

function sendData(){
    io.sockets.emit('bucket',db);
}

/*function create_directGroup(table){
    if (table[0].teams.length < table[1].teams.length){
        table[1].teams.pop();
    }
    else if(table[0].teams.length > table[1].teams.length){
        table[0].teams.pop();
    }
    var teamsL = table[0].teams;
    var teamsR = table[1].teams;
    var arr = [];
    for (var ii in teamsL){
        arr.push({'name1':teamsL[ii].name,
                'name2':teamsR[ii].name,
                'punkte1':0,
                'punkte2':0
        });
    }
    return [{'gruppe':''}]
}
*/
function create_playlist(table){
    db.runden = {};
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
        tmpT.push({'liste':tmpArray,'gruppe': table[ii].gruppe});
        db.runden[table[ii].gruppe] = 1;
    }
    return tmpT;
}

function createScore(inputGruppen,inputPlaylist){
    var tmpGlobal = [];
    for (var ii in inputGruppen){
        var gruppenID = inputGruppen[ii].gruppe;
        var matchesData = getMatchlist(gruppenID,inputPlaylist);
        var innerObject = {'gruppe': gruppenID, 'teams':[]};

        for (var jj in inputGruppen[ii].teams){
            var teamname = inputGruppen[ii].teams[jj].name;
            innerObject['teams'].push(collectUser(teamname,matchesData));
        }
        tmpGlobal.push(innerObject);
    }
    return tmpGlobal;
}

function collectUser(username, matchlist){
    var tmpUser = {
        'name': username,
        'punkte': 0,
        'toreP': 0,
        'toreM': 0,
        'diff': 0,
        'spiele': 0
    };

    for (var jj in matchlist){
        var data = checkMatch(username,matchlist[jj]);
        if (data){
            tmpUser.punkte = tmpUser.punkte + data.punkte;
            tmpUser.toreP = tmpUser.toreP + data.toreP;
            tmpUser.toreM = tmpUser.toreM + data.toreM;
            tmpUser.diff = tmpUser.diff + data.diff;
            tmpUser.spiele++;
        }
    }
    return tmpUser;
}

function getMatchlist(gruppenname,lists){
    for (var item in lists){
        if (gruppenname == lists[item].gruppe){
            return lists[item].liste;
        }
    }
}

function checkMatch(user,item){
    var tmpObject = {};
    if (item.punkte1 > 0 || item.punkte2 > 0){
        if (item.name1 == user){
            tmpObject['toreP'] = item.punkte1;
            tmpObject['toreM'] = item.punkte2;
            tmpObject['diff']  = item.punkte1 - item.punkte2;
            tmpObject['punkte'] = (item.punkte1 == 10) ? 3 : 0;
        }
        else if (item.name2 == user){
            tmpObject['toreP'] = item.punkte2;
            tmpObject['toreM'] = item.punkte1;
            tmpObject['diff']  = item.punkte2 - item.punkte1;
            tmpObject['punkte'] = (item.punkte2 == 10) ? 3 : 0;
        }    
    }
    var output = ((Object.keys(tmpObject).length == 0) ? false : tmpObject);
    return output;
}

function saveData(){
    var data = JSON.stringify(db);

    fs.writeFile('./database.json', data, function (err) {
        if (err) {
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            return;
        }
        console.log('Configuration saved successfully.')
    });
}

function loadData(){
  try {
    var data = fs.readFileSync('./database.json');
    db = JSON.parse(data);
    console.dir(db);
  }
  catch (err) {
    console.log('Fehler beim laden der Datenbank.')
    console.log(err);
  }
}