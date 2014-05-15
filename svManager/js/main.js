/* alle daten liegen im model
*
*/
var model = angular.module('svManager.model', [])
    .factory('Db', function() {
        return {
                'pageSelection' : 'default',   
                'lineName'      : {},
                'lineContent'   : [] 
                };
    })

    .factory('wSocket',function($rootScope){
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
var ctrl = angular.module('svManager.ctrl', ['svManager.model'])
    .controller('managerctrl',function($scope,Db,wSocket){
        $scope.db = Db;
        
        $scope.remLine = function(){
            if (Object.keys($scope.db.lineName).length > 0){
              delete $scope.db.lineName[Object.keys($scope.db.lineName).length];
            }
        };
    
        $scope.addLine = function(){
            $scope.db.lineName[Object.keys($scope.db.lineName).length+1] = '';
        };

    })
;

/* eine zentrale instanz die alle module injeziert
 *
 */
var svManager = angular.module('svManager',['svManager.model', 'svManager.ctrl']);
