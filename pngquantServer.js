var express = require('express');
var path = require('path');
var port = 8077;
var app = express();
var fs = require('fs');
var multer = require('multer');
var exec = require('child_process').exec;
var ipaddress = getIPAdress();
var schedule = require('node-schedule');
var bodyParser = require('body-parser');
var logObj = require('./logObj');

var upload = multer({
    limits: {
        //在multipart表单中, 文件最大数量
        files: 4,
        //在multipart表单中, 文件最大长度 (字节单位)
        fileSize: 1000*1000*5
    },
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/')
        },
        filename: function (req, file, cb) {

            var range = req.param('range') || '100';

            //设置文件名
            var timeStamp = new Date().getTime();

            var changedName = timeStamp + '.png',
                downloadName = timeStamp + '-fs8.png';
            //保存的名字
            file.changedName = changedName;
            //下载的名字
            file.downloadName = downloadName;

            cb(null, changedName);

            exec('pngquant ./uploads/'+changedName+' --quality='+range);

            logObj.write(`${getNowTime()} ${req.connection.remoteAddress.substr(7)} 上传 ${file.originalname}`);

        },
        fileFilter: function(req, file, cb){
            //过滤图片，非png不保存
            if(file.mimetype == 'image/png'){
                cb(null, true)
            } else {
                cb(null, false)
            }
        }
    })
});

//静态资源下载
app.use('/output',express.static(path.resolve(__dirname,'./uploads/')));


let arrayUpload = upload.array('upload');
//上传图片
app.post('/upload', function(req,res){
    
    arrayUpload(req,res, function(err){

        if(err){
            res.json({
                code: '1000',
                msg: err.message,
                data: []
            })
            return;
        }

        var fileData = [];
    
        req.files.map(function(elem){
            var item = {
                originalName: elem.originalname,
                downloadName: elem.downloadName,
                path: 'http://'+ipaddress+':'+port+'/output/'+elem.downloadName
            }
            fileData.push(item);
        });
    
        res.json({
            code: '0000',
            msg: '',
            data: fileData
        })
    });


});

//本地图片转base64
app.post('/getBase',bodyParser.urlencoded({ extended: false }), function(req,res){
    var filename = req.param('filename');
    console.log(filename,'filename');

    if(!!filename){
        fs.stat('./uploads/'+filename, function(err, stats){
            if(err){
                res.json({
                    code: '1000',
                    msg: '文件不存在',
                    data: ''
                });
                return;
            } else {
    
                var imgBuf = fs.readFileSync('./uploads/'+filename);
    
                res.json({
                    code: '0000',
                    msg: '',
                    data: 'data:image/jpeg;base64,'+imgBuf.toString('base64')
                })
            }
        });
    } else {
        res.json({
            code: '2000',
            msg: '文件名错误',
            data: ''
        });
    }

});

app.get('/', function (req, res) {

    logObj.write(`${getNowTime()} ${req.connection.remoteAddress.substr(7)} 访问/`);

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

rules.hour = [];

for(var i = 22;i<=23;i++){
    rules.hour.push(i);
    rules.minute = 0;
}

schedule.scheduleJob(rules, function(){
    let nowDate = new Date();
    // console.log(`${nowDate.getFullYear()}/${nowDate.getMonth()+1}/${nowDate.getDate()} ${nowDate.getHours()}:${nowDate.getMinutes()}:${nowDate.getSeconds()} 删除uploads下的图片`)
    logObj.write(`${getNowTime()} 删除uploads下的图片`);
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
});

function getNowTime(){
    let nowDate = new Date();
    return `${nowDate.getFullYear()}/${nowDate.getMonth()+1}/${nowDate.getDate()} ${nowDate.getHours()}:${nowDate.getMinutes()}:${nowDate.getSeconds()} `;
}


