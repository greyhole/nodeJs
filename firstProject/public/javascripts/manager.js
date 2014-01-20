var socket = io.connect('http://nvetter:3000');

    
socket.on('connecting',function(){
    console.log('client connecting');
    $('#connectAlert').show();
});

socket.on('connect',function(){
   $('#connectAlert').hide(); 
    console.log('client has connected');
});

function triggerRound(event){
    var data_todo = $(event.target).parents('ul .roundCtrl').attr('data-todo');
    var data_isgroup = $(event.target).attr('data-isgroup');
    if (data_todo == 'add'){
        round[data_isgroup]++
    }
    else{
        round[data_isgroup]--
    }
}

function send_playData(){
    socket.emit('saveData',{data: playlist},function(data){
        console.log('gesendet');
    });
}

function selector_change(event){
    var selected = parseInt($(event.target).children('option:selected').text(),10);
    var index_div = $(event.target).closest('.sec_div').attr('id');
    var col = $(event.target).closest('td').index();
    col = (col == 4) ? 3 : 0;
    var row = $(event.target).closest('tr').index();
    playlist[index_div][col][row] = selected;
    $(event.target).parent().children('span').text(selected);
}

/*function teamInput_change(event){
    var element = event.target;
    if ($(element).is(':last-child')) {
        $(element).parent().append("<input class='form-control' type='text' placeholder='Teamname' onchange='teamInput_change(event)'></input>");
        $(element).parent().find('input:last').focus();    
    }
    else{
        if (!$(element).val()) {
            $(element).remove();
        };
    }
}
*/
jQuery.extend(jQuery.expr[':'],{
    notempty: function(tmp){
        return (tmp.value.length > 0);
    }
});

function remGroupAlert_OKBtn_pressed(){                          //remAlert_OKBtn event handler function
    $('#sec1_body div:last').remove();        
    $('#remGroupAlert').hide();
}

function remGroupAlert_NOBtn_pressed(){                          //remAlert_NOBtn event handler function
    $('#remGroupAlert').hide();
}

         
function addGroupBtn_pressed(){                             //addGroupBtn event handler function
    var count = $('#sec1_body div').length;
    $('<div></div>')
        .text('Gruppe ' + String.fromCharCode( 65 + count))
        .addClass('col-xs-12')
        .addClass('col-md-3')
        .addClass('sec_div')
        .append("<input class='form-control' type='text' placeholder='Teamname' onchange='teamInput_change(event)'></input>")
        .appendTo('#sec1_body');
    $('#sec1_header').show();
}

function remGroupBtn_pressed(){                       //remGroupBtn event handler function
    if (!$.isEmptyObject($('#sec1_body').html())) {
        $('#remGroupAlert').show();
    };
}

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
var kickApp = angular.module('kickApp',[]);

kickApp.controller('listcntrl',function($scope,Db){
    $scope.selects = Db.selects;
    $scope.play = {'Gruppe A':[
        {'name1':'team1', 'punkte':'0'},
        {'name2':'team2', 'punkte':'0'},
        {'name3':'team3', 'punkte':'0'},
        {'name4':'team4', 'punkte':'0'},
        {'name5':'team5', 'punkte':'0'},
    ]};
});

kickApp.controller('groupctrl',function($scope,Db){
    $scope.group = Db.groups;

    $scope.onchange = function(key,index){
        alert(key);
        alert(index);
        alert($scope.group[key].teams[index]);
    };
});

kickApp.factory('Db', function() {
  return {
    selects : [0,1,2,3,4,5,6,7,8,9,10],

    playlist : {},
    groups : {'Gruppe A' : {'teams':[""],
                            'runde':0,
                            }},
    };
});