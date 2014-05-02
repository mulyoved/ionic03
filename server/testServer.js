var fs = require('fs');
var request = require('request');
var parseString = require('xml2js').parseString;
var http = require('http');
http.post = require('http-post');

/*
var upload = function(fileName, options,callback) {
    fs.readFile(fileName,function(error,data) {
        if (error) {
            callback(error, null, null);
        }
        else {
            console.log('Read file', data.length);

            var token = options.token;
            var userId = options.userId || 'default';
            var rootUrl = 'http://localhost:3000/images';

            var files = [
                {
                    param: "file",
                    path: fileName
                }
            ];

            http.post(rootUrl, [], files, function(res){
                callback(res);
            });
        }
    });
};

upload('C:/js/ionic03/docs/GoogleSign_Error.png', {
        albumId:'5965097735673433505', 
        userId: 'mulyoved',
        token: 'ya29.1.AADtN_UPuNv2J7l6hsVcdkxrWTxRR6vjVYL6KAFsa2z0d_riWNqVgZhtxA_o-9g' 
    }, 
    function(error, response, body) {
        console.log('error', error);
        //console.log('response', response);
        console.log('body', body);

        if (body && (response.statusCode === 200 || response.statusCode === 201 || response.statusCode === 202)) {
            parseString(body, function (err, result) {
                console.dir(result);

                if (!err) {
                    console.dir(result.entry['media:group'][0]['media:content'][0].$.url);
                }
                else {
                    console.error('Error', err);
                }
            });
        }
        else {
            console.error('Error', response.statusCode, body);
        }

    });
*/

var filename = 'C:/js/ionic03/docs/GoogleSign_Error.png'
    , boundary = Math.random();

request
    .post('/images')
    .set('Content-Type', 'multipart/form-data; boundary=' + boundary)
    .write('--' + boundary + '\r\n')
    .write('Content-Disposition: form-data; name="image"; filename="'+filename+'"\r\n')
    .write('Content-Type: image/png\r\n')
    .write('\r\n')
    .write(fs.readFileSync(filename))
    .write('\r\n--' + boundary + '--')
    .end(function(res){
        res.should.have.status(200)
        done()
    })


