var fs = require('fs');
var filename = '1505205912157ss.png';


fs.stat('./uploads/'+filename, function(err, stats){
    if(err){
        return console.log(err,'err');
    }
    console.log(stats)
});




// var imgBuf = fs.readFileSync('./uploads/'+filename);


// console.log(imgBuf.toString('base64'))