var express = require('express');
var path = require('path');
var port = 8077;
var app = express();
var fs = require('fs');
var multer = require('multer');
var exec = require('child_process').exec;
var ipaddress = getIPAdress();
var schedule = require('node-schedule');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        var changedName = (new Date().getTime())+'-'+file.originalname;

        req.changedName = changedName;
        req.originalName = file.originalname;

        console.log(req.originalName,req.changedName)

        cb(null, changedName);

        let tempIndex = req.originalName.lastIndexOf('.');
        if(req.originalName.substr(tempIndex+1) == 'png'){
            req.isPng = true;
            exec('pngquant ./uploads/'+changedName);
        } else {
            req.isPng = false;
        }

    }
})

var upload = multer({
    dest: 'uploads/',
    storage: storage
});

app.use('/output',express.static(path.resolve(__dirname,'./uploads/')));


app.post('/upload', upload.single('upload'), function(req,res){

    var changedNameArr = req.changedName.split('.png');

    if(req.isPng){
        res.json({
            code: '0000',
            filename:req.originalName,
            msg: '',
            path: 'http://'+ipaddress+':'+port+'/output/'+changedNameArr[0]+'-fs8.png'
        })
    } else {
        res.json({
            code: '0000',
            filename:req.originalName,
            msg: '文件非png格式',
            path: ''
        })
    }
});


app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, 'pngquantServer.html'));
});


let server = app.listen(port, function () {
    
    if (ipaddress) {
        console.log('please open ' + ipaddress + ':' + port + ' in browser');
    } else {
        console.log('no networking, please open ' + ipaddress + ':' + port + ' in browser')
    }

});

/**
 * 获取本机IP
 * @return {[string]} [IP地址]
 */
function getIPAdress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}


//设置定时任务
var rules = new schedule.RecurrenceRule();
var hoursArr = [12,24];
rules.hour = hoursArr;
schedule.scheduleJob(rules, function(){
    exec('cd ./uploads/ && rm -r *');
});




