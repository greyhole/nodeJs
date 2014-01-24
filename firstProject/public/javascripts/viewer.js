/* alle daten liegen im model
*
*/
var model = angular.module('viewApp.model', [])
    .factory('Db', function() {
        return {
            playlist : [],
            group :[{'gruppe':'','teams':[{'name':'test','punkte':0,'toreP':0,'toreM':6,'spiele':0}],'runde':0}]
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
        $scope.display_score = $scope.db.group[0];
        ws.on('getScore',function(data){
            $scope.db.group = data;
        });

        $scope.onTimeout = function(){
            console.log('aktualisiert',$scope.db.group.length);

            $scope.score_index =  (($scope.score_index < ($scope.db.group.length-1)) ? ($scope.score_index++) : 0);
            $scope.display_score = $scope.db.group[$scope.score_index];
            console.log($scope.display_score);
            myTimeout= $timeout($scope.onTimeout, 3000);
        };
        var myTimeout= $timeout($scope.onTimeout, 3000);
    })
;

/* eine zentrale instanz die alle module injeziert
 *
 */
var viewApp = angular.module('viewApp',['viewApp.model', 'viewApp.ctrl']);
