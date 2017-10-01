var fs = require('fs');

let logObj = {
    //写入日志
    //str：写入的内容
    write: function(str){
        fs.appendFile(__dirname+'/record.log',str+'\n',(err) => {
            if(err){
                console.log(err)
            } else {
                // console.log('写入成功')
            }
        });
        
    }

};
module.exports = logObj;