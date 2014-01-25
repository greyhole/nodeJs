/* alle daten liegen im model
*
*/
var model = angular.module('kickApp.model', [])
    .factory('Db', function() {
        return {
            'selects' : [0,1,2,3,4,5,6,7,8,9,10],
            'playlist' : [],
            'group' :[{'gruppe' : 'Gruppe A',
                    'teams' : [{'name':''}]
                }],
            'runden':{},
            'showAlert': false
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
                                    'teams':[{'name':''}],
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
                ws.emit('transmit_group',{'group':tmpgroup});
            }
        };

        $scope.sendData = function(){
            ws.emit('transmit_playlist',{'playlist':$scope.db.playlist});
        };

        ws.on('bucket',function(dataD){
            console.log(dataD);
            $scope.db.playlist = dataD.playlist;
            $scope.db.group = dataD.group;
            $scope.db.runden = dataD.runden;
        });
        
        $scope.remGroupAlert_OKBtn_pressed = function(){
            $scope.db.group.pop();
            $scope.db.showAlert = false;
        };

        $scope.onchange = function(parent_index,index){
            if (index==($scope.db.group[parent_index].teams.length-1)){
                $scope.db.group[parent_index].teams.push({'name':''});   
            }
        };
        $scope.addRunde = function(key){
            $scope.db.runden[key] = $scope.db.runden[key] + 1;
            ws.emit('transmit_runden',{'runden':$scope.db.runden});
        };

        $scope.remRunde = function(key){
            $scope.db.runden[key] = ($scope.db.runden[key] > 1) ? $scope.db.runden[key] - 1 : 1;
            ws.emit('transmit_runden',{'runden':$scope.db.runden});

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
