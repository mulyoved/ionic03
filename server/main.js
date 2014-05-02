var fs = require('fs');
var imageUpload = require('./imageUpload');
var parseString = require('xml2js').parseString;

// Create the "uploads" folder if it doesn't exist
fs.exists(__dirname + '/uploads', function (exists) {
    if (!exists) {
        console.log('Creating directory ' + __dirname + '/uploads');
        fs.mkdir(__dirname + '/uploads', function (err) {
            if (err) {
                console.log('Error creating ' + __dirname + '/uploads');
                process.exit(1);
            }
        })
    }
});

exports.getImages = function(req, res, next) {
    console.log('empty data:');
};

exports.addImage = function(req, res, next) {
    var file = req.files.file,
        filePath = file.path,
        lastIndex = filePath.lastIndexOf("/"),
        tmpFileName = filePath.substr(lastIndex + 1),
        image = req.body;

    var albumId = req.body.albumId; //"5965097735673433505"
    var description = req.body.description;
    var token = req.body.token;
    var userId = req.body.userId;

    //console.log("upload: tmpFileName", tmpFileName);
    //console.log("upload: image.fileName", image.fileName);
    //console.log("upload: image", image);
    //console.log("upload: filePath", filePath);
    //console.log("upload: file", file);

    image.fileName = tmpFileName;
    //console.log('tmpFileName:',  tmpFileName);
    imageUpload.upload(tmpFileName, {albumId: albumId, userId: userId, token: token}, function(error, response, body) {
        if (body && (response.statusCode === 200 || response.statusCode === 201 || response.statusCode === 202)) {
            parseString(body, function (err, result) {
                if (!err) {
                    res.json(result);
                    console.log(result.entry['media:group'][0]['media:content'][0].$.url);
                }
                else {
                    var error = {
                        statusCode: 0,
                        message: err
                    };
                    res.json(error);
                    console.error('Error', error);
                }
            });
        }
        else {
            var error = {
                statusCode: response.statusCode,
                message: body
            };
            // should return with error code
            res.json(error);
            console.error('Error', error);
        }

    });
};

