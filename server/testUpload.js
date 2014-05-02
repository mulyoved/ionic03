var imageUpload = require('./imageUpload');
var parseString = require('xml2js').parseString;

imageUpload.upload('C:/js/ionic03/docs/GoogleSign_Error.png', {
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


