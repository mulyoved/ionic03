//service - syncronize database with blogger api
//expose status - broadcast change in status
//queue sync request
// - var needSync
// - var duringSync
// - loop when finish sync
// - success and needSync - do sync
// - failed, turn on needSync and try again after some time out
// -

angular.module('Ionic03.controllers')

.controller('dbTestCtrl', function(
    $scope, ConfigService, $log, $q,
    GAPI, Blogger, pouchdb, GoogleApi, GoogleApp, DataSync,
    DataService, blogdb, HTMLReformat,
    $http) {

    $scope.answer = '<empty>';
    $scope.blogdb = blogdb;

    $scope.sync = function () {
        $log.log('sync');

        DataSync.sync();
    };

    $scope.createPost = function () {
        $log.log('Add dummy post');
        var time = new Date();

        DataSync.createPost('V2: ' + time.toString(), 'Sample Content' + time.toString());
    };

    //---------------------
    $scope.dumpDatabase = function () {
        DataSync.dumpDatabase();
    };

    $scope.deletedb = function () {
        DataSync.deletedb();
    };

    $scope.getPosts = function () {
        var p = DataService.getItems();
        p.then(function (answer) {
            $log.log(answer);
        }, function (err) {
            $log.error(err);
        });
    };

    $scope.show = function (item) {
        //$log.log(item);
        return item.content;
    };

    //-------------------------------------------------------------------
    $scope.htmlParserTest = function () {
        $log.log('htmlParserTest');

        var results = "";

        var input = '    Picture Post Below<br />\
        <br />\
        <div class="separator" style="clear: both; text-align: center;">\
            <a href="http://3.bp.blogspot.com/-bxdOien00ss/U140FvA8rvI/AAAAAAAAKAQ/h1eswgudS6Q/s1600/4-27-2014+10-42-53+PM.png" imageanchor="1" style="margin-left: 1em; margin-right: 1em;"><img border="0" src="http://3.bp.blogspot.com/-bxdOien00ss/U140FvA8rvI/AAAAAAAAKAQ/h1eswgudS6Q/s1600/4-27-2014+10-42-53+PM.png" height="245" width="320" /></a></div>\
        <br />\
        <br />\
    Picture Post Above\
    ';

        $scope.input = input;
        results = HTMLReformat.reformat(input);
        $log.log('Result', results);

        $scope.results = results;

    };


    $scope.raiseError = function () {
        $log.log('raiseError');

        throw new Error("Oh oh, an error has occured");

    };

    $scope.picasa_answer = 'undefined';
    $scope.picasaWebAPI = function () {
        $log.log('picasaWebAPI');
        var gapi_token;

        GoogleApi.getToken({
            client_id: GoogleApp.client_id,
            client_secret: GoogleApp.client_secret
        }).then(function (data) {
            console.log('DBTest: got token', data);
            gapi_token = {
                access_token: data.access_token,
                client_id: GoogleApp.client_id,
                cookie_policy: undefined,
                expire_in: data.expire_in,
                expire_at: new Date().getTime() + parseInt(data.expires_in, 10) * 1000 - 60000,
                token_type: data.token_type
            };
            //return GAPI.init_WithToken(token);
        }).then(function (data) {
            console.log('DBTest: gapiLogin = true', data);

            //&authkey=' + gapi_token.access_token
            //var url = 'http://picasaweb.google.com/data/feed/api/user/mulyoved?kind=album&access=public&alt=json&v=2';
            //var url = 'http://picasaweb.google.com/data/feed/api/user/mulyoved?kind=album&access=private&alt=json&v=2';
            //var url = 'https://picasaweb.google.com/data/entry/api/user/mulyoved/albumid/5775614605775374801';


            //var url = 'https://picasaweb.google.com/data/feed/api/user/mulyoved?access=private';
            var url = 'https://picasaweb.google.com/data/feed/api/user/mulyoved';
            console.log('DBTest: Send Picasa Query', url);

            /*
             $.ajax({
             url: url,
             type: 'GET',
             dataType: 'json',
             success: function(result) {
             $log.log('AJAX Success', result);
             },
             error: function(err) {
             $log.error('AJAX Failed', err);
             },
             beforeSend: setHeader
             });

             function setHeader(xhr) {
             $log.log('setRequestHeader: ', gapi_token.access_token);
             xhr.setRequestHeader('Gdata-version', 2);
             xhr.setRequestHeader("Authorization", "Bearer ya29.1.AADtN_WxtlsCw3cx03qnC7i2lqYR8AinrBC2AAhTXigV7BUl1hfZg4NXsP-5_5c")
             };
             */

            /*
             return $http({
             method: 'GET',
             url: url,
             useXDomain: true,
             withCredentials: true,
             headers: {
             'Gdata-version': 2,
             'Authorization': 'Bearer ya29.1.AADtN_XU8p1bBcsnfZ36ReO6_WJKfNgQ7RBnsWHRXXI1dJcD0ld81h88lhU3Hqt7J6k1yA'
             }
             });
             */

            xmlhttp = new XMLHttpRequest();
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader('Gdata-version', 2);
            xmlhttp.setRequestHeader('Authorization', 'Bearer ya29.1.AADtN_V2O-SZPjZpzHfEhDsCzaw-bsTGXma7lEjDg3YJ8ppHrLKtLm_jvPg6sr6XfPeqKg');


            //xmlhttp.setRequestHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:9000');

            xmlhttp.onload = function () {
                var text = xmlhttp.responseText;
                $log.log('Response from CORS request to ', url, text);
            };

            xmlhttp.onerror = function () {
                $log.error('Woops, there was an error making the request.');
            };
            xmlhttp.send();


        }).then(function (answer) {
            $log.log('Got answer', answer);
        }, function (err) {
            console.log('DBTest: gapiLogin = false');
        });


        /*
         var url = 'http://picasaweb.google.com/data/feed/api/user/mulyoved?kind=album&access=private&alt=json&v=2&authkey=' + 'test';
         $.getJSON(url, 'callback=?', $.proxy(function(json) {
         $log.log(json);
         }, this));
         */

        /*
         $scope.picasa_answer = $http.get('https://picasaweb.google.com/data/feed/api/user/mulyoved');
         {headers:
         {'GData-Version': '2',
         'Access-Control-Allow-Origin': '*'
         }

         });
         */
    };

    //$scope.picasaWebAPI();


    //------------------------------------------------------------------------------------------

    var upload = function (imageURI) {
        console.log('upload [' + imageURI+']');

        var ft = new FileTransfer(),
            options = new FileUploadOptions();

        options.fileKey = "file";
        options.fileName = 'filename.jpg'; // We will use the name auto-generated by Node at the server side.
        options.mimeType = "image/jpeg";
        options.chunkedMode = false;
        options.params = { // Whatever you populate options.params with, will be available in req.body at the server-side.
            description: "Uploaded from my phone",
            token: 'ya29.1.AADtN_UPuNv2J7l6hsVcdkxrWTxRR6vjVYL6KAFsa2z0d_riWNqVgZhtxA_o-9g',
            albumId: '5965097735673433505',
            userId: 'mulyoved'
        };

        console.log('upload options: [' + options+']');
        console.log('upload options2:', options);
        console.log('upload serverURL: [' + ConfigService.imageUploadServerURL+']');
        ft.upload(imageURI, ConfigService.imageUploadServerURL + "/images",
            function (e) {
                console.log('Upload sucess: ***********************');
                console.log(JSON.stringify(e));
                console.log('Upload sucess: ***********************');
                //result.entry['media:group'][0]['media:content'][0].$.url
            },
            function (e) {
                alert("Upload failed");
            }, options);
    };

    $scope.cameraTest = function () {
        console.log('cameraTest');

        var options = {
            quality: 45,
            targetWidth: 1000,
            targetHeight: 1000,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            sourceType: Camera.PictureSourceType.CAMERA
        };

        navigator.camera.getPicture(
            function (imageURI) {
                console.log(imageURI);
                upload(imageURI);
            },
            function (message) {
                // We typically get here because the use canceled the photo operation. Fail silently.
            }, options);

        return false;
    };
});
