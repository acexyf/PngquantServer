var schedule = require('node-schedule');
var fs = require('fs');

// //设置定时任务


// var rule = new schedule.RecurrenceRule();
// rule.hour = [];
// for(var i = 1;i<=24;i++){
//     rule.hour.push(i)
// }
// console.log(rule.hour)
// var job = schedule.scheduleJob(rule, function(){
//     console.log('asdasdsd')
// });



// fs.unlinkSync(__dirname+'/uploads/1505202410363.png')

fs.readdir(__dirname+'/uploads', function(err,files){
    if(!!files && !!files.length){
        files.map(function(file){
            var status = fs.statSync(__dirname+'/uploads/'+file)
            if(!status.isDirectory()){
                fs.unlinkSync(__dirname+'/uploads/'+file)
            }
        });
    }
});


