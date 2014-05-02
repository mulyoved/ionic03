var fs = require('fs');
var request = require('request');

exports.upload = function(fileName, options,callback) {
    fs.readFile(fileName,function(error,data) {
        if (error) {
            callback(error, null, null);
        }
        else {
            console.log('Read file', data.length);

            var token = options.token;
            var userId = options.userId || 'default';
            var rootUrl = 'https://picasaweb.google.com/data/feed/api/user/'+userId+'/albumid/'+options.albumId+'';
            request({
                method:'POST',
                headers:{ 
                    'GData-Version': '2',
                    'Authorization':'Bearer' + ' ' + token,
                    "Content-Type":'image/jpeg',
                    'Content-Length':data.length,
                    "MIME-version":"1.0"},
                body:data,
                uri:rootUrl
            },callback);
        }
    });   
};
