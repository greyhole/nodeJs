
function send_playData(){
    socket.emit('saveData',{data: playlist},function(data){
        console.log('gesendet');
    });
}

jQuery.extend(jQuery.expr[':'],{
    notempty: function(tmp){
        return (tmp.value.length > 0);
    }
});

function createPlaylistBtn_pressed(){                 //createPlaylistBtn event handler function
    var tmp = [];
    $('.roundCtrl li:not(:first-child)').remove();
    
    if (!$.isEmptyObject($('#sec1_body div'))){
        $('#sec1_body div').each(function(index){
            var groupName = 'Gruppe ' + String.fromCharCode(65+index);
            group[groupName] = {'teams'  :[],
                                'runde' :0
                                };

            $(this).children('input:notempty').each(function(){
                group[groupName]['teams'].push($(this).val());
            });

            if ($.isEmptyObject(group[groupName]['teams'])){return true;};
                        
            var dummy = $('#dummyRound').children().clone();
            $(dummy).children('a').text(groupName);
            $(dummy).appendTo('.roundCtrl');
            group[groupName]['round'] = 0;
        });
        if(!groupObj[groupName]){return false;};

        socket.emit('beginCalc',{data: group},function(dataD){
            playlist = dataD;

            $('#sec2').empty();
            $(dataD).each(function(index,element){
                $("<div></div>")
                    .addClass('col-xs-6')
                    .addClass('col-md-4')
                    .addClass('sec_div')
                    .attr('id',index)
                    .text('Gruppe ' + String.fromCharCode(65+index))
                    .append(buildPlayTable(element))
                    .appendTo('#sec2');
            });
        });
    }
}



function buildPlayTable(enemys){
    var table = $('#dummyTable').clone().removeAttr('id').show();
    var row = $(table).children();
    $(table).empty();

    $(enemys[1]).each(function(index,element){
        $(row).find('td.leftEnemy').text(element);
        $(row).find('td.rightEnemy').text(enemys[2][index])
        $(row).appendTo(table);
    });
    return table;        
}



/* alle daten liegen im model
*
*/
var model = angular.module('kickApp.model', [])
    .factory('Db', function() {
        return {
            selects : [0,1,2,3,4,5,6,7,8,9,10],

            playlist : {},
            group : {
                'Gruppe A' : {
                    'teams' : [{'name': ''}],
                    'runde' : 0,    }
                },
            showAlert: false,
        };
    })

    .factory('ws',function($rootScope){
        var socket = io.connect();
        return {
            on: function(eventName, callback){
                socket.on(eventName,function(){
                    var args = arguments;
                    $rootScope.$apply(function(){
                        callback.apply(socket,args);
                    });
                });
            },

            emit: function(eventName, data, callback){
                if (typeof data == 'function') {
                    callback = data;
                    data={};
                };
                socket.emit(eventName,data,function(){
                    var args = arguments;
                    $rootScope.$apply(function(){
                        if (callback) {
                            callback.apply(socket,args);
                        }     
                    });
                });
            }
        };
    })
;

/* alles an logik liegt in controller und directives
*
*/
var ctrl = angular.module('kickApp.ctrl', ['kickApp.model'])
    .controller('groupctrl',function($scope,Db){
        $scope.db = Db;

        $scope.addGroupBtn_pressed = function(){
            $scope.db.group['Gruppe ' + String.fromCharCode(65+Object.keys($scope.db.group).length)] =
                                                                                            {'teams':[{'name':''}],
                                                                                             'runde':0,
                                                                                            };
        };

        $scope.remGroupBtn_pressed = function(){
            console.log('pressed');
            $scope.db.showAlert = true;
        };

        $scope.onchange = function(key,index){
            if (index==($scope.db.group[key].teams.length-1)){
                $scope.db.group[key].teams.push({'name':''});   
                console.log($scope.db.group);
            }
        };
        $scope.onblur = function(key,index){
            if (($scope.db.group[key].teams[index].name == "")&&(index!=($scope.db.group[key].teams.length-1))){
                $scope.db.group[key].teams.splice(index,1);
            }            
        };
    })
    .controller('listcntrl',function($scope,Db){
        $scope.selects = Db.selects;
        $scope.play = {'Gruppe A':[
            {'name1':'team1', 'punkte':'0'},
            {'name2':'team2', 'punkte':'0'},
            {'name3':'team3', 'punkte':'0'},
            {'name4':'team4', 'punkte':'0'},
            {'name5':'team5', 'punkte':'0'},
        ]};
    })
    .controller('socketctrl',function($scope,ws,Db){
        $scope.connected = false;
        $scope.db = Db;

        $scope.sendGroup = function(){
            ws.emit()
        };
    })
;

/* eine zentrale instanz die alle module injeziert
 *
 */
var kickApp = angular.module('kickApp',['kickApp.model', 'kickApp.ctrl']);


