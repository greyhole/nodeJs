/* alle daten liegen im model
*
*/
var model = angular.module('viewApp.model', [])
    .factory('Db', function() {
        return {
            'naming':['aktuell','Nächste','...'],
            'order': ['punkte','diff'],
            'playlist' : [],
            'score' :[{'gruppe':'','teams':[{'name':'test','punkte':0,'toreP':0,'toreM':6,'spiele':0}]}],
            'runden':{}
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
var ctrl = angular.module('viewApp.ctrl', ['viewApp.model'])
    .controller('viewctrl',function($scope,Db,ws,$timeout){
        $scope.db = Db;        
        $scope.score_index = 0;
        $scope.display_score = $scope.db.score[0];
        $scope.display_playlist = $scope.db.playlist[0];
        $scope.hide = false;
        ws.on('bucket',function(dataD){
            $scope.db.score = dataD.score;
            $scope.db.playlist = dataD.playlist;          
            $scope.db.runden = dataD.runden;
        });
        $scope.onTimeout = function(){
            console.log('aaaaa');
            $scope.hide = true;
            fadeTimeout= $timeout(function(){
                $scope.score_index = ($scope.score_index < $scope.db.score.length-1) ? ($scope.score_index + 1) : 0;
                $scope.display_score = $scope.db.score[$scope.score_index];
                $scope.display_playlist = $scope.db.playlist[$scope.score_index];
                $scope.hide = false;

            }, 600);            
            myTimeout= $timeout($scope.onTimeout, 10000);
        };
        var myTimeout= $timeout($scope.onTimeout, 10000);
    })
;

/* eine zentrale instanz die alle module injeziert
 *
 */
var viewApp = angular.module('viewApp',['viewApp.model', 'viewApp.ctrl']);
