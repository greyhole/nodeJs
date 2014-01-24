/* alle daten liegen im model
*
*/
var model = angular.module('kickApp.model', [])
    .factory('Db', function() {
        return {
            selects : [0,1,2,3,4,5,6,7,8,9,10],

            playlist : [],
            group :[{
                    'gruppe' : 'Gruppe A',
                    'teams' : [{
                                        'name':'',
                                        'spiele':0,
                                        'toreM':0,
                                        'toreP':0,
                                        'diff':0,
                                        'punkte':0
                                        }],
                    'runde' : 0    
                }],
            showAlert: false,
        };
    })

    .factory('ws',function($rootScope){
        var socket = io.connect(':3000');
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
    .controller('managerctrl',function($scope,Db,ws){
        $scope.db = Db;

        $scope.addGroupBtn_pressed = function(){
            $scope.db.group.push({  'gruppe': 'Gruppe ' + String.fromCharCode(65+$scope.db.group.length),
                                    'teams':[{
                                        'name':'',
                                        'spiele':0,
                                        'toreM':0,
                                        'toreP':0,
                                        'diff':0,
                                        'punkte':0
                                        }],
                                    'runde':0
                                   });
            };

        $scope.sendGroup = function(){
            var tmpgroup = angular.copy(Db.group);
            for (var ii in tmpgroup) {
                if (tmpgroup[ii].teams.length > 3){
                    tmpgroup[ii].teams.pop();
                } 
                else{
                   tmpgroup.splice(ii,1); 
                }
            };
            
            if (tmpgroup.length != 0){
                ws.emit('calculate_playlist',tmpgroup,function(data){
                  $scope.db.playlist = data;
                });
            }
        };
        $scope.sendData = function(){
            ws.emit('calculate_score',$scope.db.playlist);
        };

        ws.on('getScore',function(dataD){
            console.log(dataD);
        });
        
        $scope.remGroupAlert_OKBtn_pressed = function(){
            $scope.db.group.pop();
            $scope.db.showAlert = false;
        };

        $scope.onchange = function(parent_index,index){
            if (index==($scope.db.group[parent_index].teams.length-1)){
                $scope.db.group[parent_index].teams.push({
                                        'name':'',
                                        'spiele':0,
                                        'toreM':0,
                                        'toreP':0,
                                        'diff':0,
                                        'punkte':0
                                        });   
            }
        };

        $scope.onblur = function(parent_index,index){
            if (($scope.db.group[parent_index].teams[index].name == "")&&(index!=($scope.db.group[parent_index].teams.length-1))){
                $scope.db.group[parent_index].teams.splice(index,1);
            }            
        };
    })
;

/* eine zentrale instanz die alle module injeziert
 *
 */
var kickApp = angular.module('kickApp',['kickApp.model', 'kickApp.ctrl']);
