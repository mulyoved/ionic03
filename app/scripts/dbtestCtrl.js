//service - syncronize database with blogger api
//expose status - broadcast change in status
//queue sync request
// - var needSync
// - var duringSync
// - loop when finish sync
// - success and needSync - do sync
// - failed, turn on needSync and try again after some time out
// -

angular.module('Ionic03.dbTestCtrl', [])

.controller('dbTestCtrl', function(
    $scope, $state, ConfigService, $log, $q, $http, $stateParams, $compile,
    GAPI, Blogger, pouchdb, GoogleApi, GoogleApp, DataSync, localStorageService,
    DataService, HTMLReformat, MiscServices, BlogListSync, RetrieveItemsService,
    PushServices
    )
{
    $scope.answer = '<empty>';
    $scope.newpost = {
        text: 'Sample Post: ' + new Date().toString()
    };

    //console.log('$stateParams', $stateParams.options);

    $scope.sync = function sync() {
        $log.log('sync');

        DataSync.syncEnabled = true;
        DataSync.sync()
            .then(function(answer) {
                DataSync.syncEnabled = false;
                $scope.dumpAnswer = 'sync';
                $log.log('Sync Answer', answer);
            })
            .catch(function(answer) {
                $log.log('Sync Error', answer);
                DataSync.syncEnabled = false;
                $scope.dumpAnswer = 'sync error';
            });
    };

    $scope.savePost = function () {
        DataSync.savePost($scope.newpost.text);
        $log.log('Add dummy post:', $scope.newpost.text);
    };

    $scope.createImagePost1 = function createImagePost() {
        var time = new Date();

        var url = 'file://lh6.googleusercontent.com/-oJNCUlvzVKs/U2UqdZsnctI/AAAAAAAAKHk/0aM2vyiZoJ4/%25255BUNSET%25255D.jpg';
        text = MiscServices.formatImageUrl(url);
        $log.log('createImagePost', text);
        DataSync.savePost('1Images<br>' + text);
    };

    $scope.createImagePost2 = function createImagePost() {
        var time = new Date();

        var url = 'file://lh6.googleusercontent.com/-oJNCUlvzVKs/U2UqdZsnctI/AAAAAAAAKHk/0aM2vyiZoJ4/%25255BUNSET%25255D.jpg';
        text = MiscServices.formatImageUrl(url);

        var url2 = 'file://lh3.googleusercontent.com/-xsaM7gQNcBg/U2YxNj8agEI/AAAAAAAAKIw/F73t2TAsK_E/%25255BUNSET%25255D.jpg';
        text2 = MiscServices.formatImageUrl(url2);

        $log.log('createImagePost', text);
        DataSync.savePost('2Images<br>' + text + '<br>' + text2);
    };

    $scope.createImagePost2error = function createImagePost() {
        var time = new Date();

        var url = 'file://lh6.googleusercontent.com/-oJNCUlvzVKs/U2UqdZsnctI/AAAAAAAAKHk/0aM2vyiZoJ4/%25255BUNSET%25255D.jpg';
        text = MiscServices.formatImageUrl(url);

        var url2 = 'file://error_lh3.googleusercontent.com/-xsaM7gQNcBg/U2YxNj8agEI/AAAAAAAAKIw/F73t2TAsK_E/%25255BUNSET%25255D.jpg';
        text2 = MiscServices.formatImageUrl(url2);

        $log.log('createImagePost', text);
        DataSync.savePost('2Images Error<br>' + text + '<br>' + text2);
    };

    //---------------------
    $scope.dumpDatabase = function () {
        DataSync.dumpDatabase()
            .then(function(rows) {
                $scope.dumpAnswer = 'dump';
                $scope.answerCount = rows.length;
            })
            .catch(function(err) {
                $scope.dumpAnswer = 'error' + err;
                $log.error('Failed', err);
            })
    };

    $scope.dumpTopRecord = function() {
        DataSync.dumpDatabase()
            .then(function(rows) {
                if (rows.length > 0) {
                    var doc = rows[0].doc;
                    console.log(doc);
                    $scope.dumpAnswer = JSON.stringify(doc,null,2);
                    $scope.answerCount = rows.length;
                    console.log($scope.dumpAnswer);

                    if (rows.length > 1) {
                        doc = rows[1].doc;
                        console.log(doc);
                        $scope.dump2Answer = JSON.stringify(doc,null,2);
                    }
                }
                else {
                    $scope.dumpAnswer = 'empty';
                    $scope.answerCount = 0;
                }

            })
            .catch(function(err) {
                $scope.dumpAnswer = 'error' + err;
                $log.error('Failed', err);
            })
    };

    $scope.deletedb = function () {
        DataService.deletedb()
            .then(function(answer) {
                console.log('deleted');
                $scope.dumpAnswer = 'deleted';
                $scope.answerCount = 0;
            })
            .catch(function(err) {
                $log.error('Failed to delete', err);
            });
    };

    $scope.db_showItems = [];
    $scope.blog_showItems = [];
    $scope.db_lastItem = null;
    $scope.blog_lastItem = null;
    $scope.getPostsFromBlogger = function () {
        var lastItem = $scope.blog_lastItem;
        $log.log('Get from blogger, next batch of records', lastItem);

        DataSync.getItems(lastItem)
            .then(function (answer) {
                processBlogItems(answer);
            }).catch(function (err) {
                $log.error('Blogger error', err);
            });
    };

    var processBlogItems = function (answer, currentItemList) {
        //Add ID Sort & Skip duplicates
        RetrieveItemsService._syncLists($scope.blog_showItems, answer);

        if (startOffset) {
            var doc0 = answer[startOffset];
            var doc1 = answer[answer.length - 1];

            var date0 = new Date(doc0.updated);
            var date1 = new Date(doc1.updated);

            $log.log('Doc0', doc0);

            $scope.answer_GetPosts = String.format('Retrieved {0} Items\nStart: {1} ID:{2}\nEnd:{3} ID:{4}',
                answer.length,
                date0.toDateString(), doc0.id,
                date1.toDateString(), doc1.id);

            $scope.blog_lastItem = doc1;

            //Add Items to view
            var i;
            var j;
            for (i = 0; i < answer.length; i++) {
                var doc = answer[i];
                for (j = 0; j < $scope.db_showItems.length; j++) {
                    if ($scope.db_showItems[j].id === doc.id) {
                        doc.match = j;
                    }
                }
            }
        }
    };

    var processDbItems = function(answer, addAlsoToBlog) {
        $log.log('getPosts', answer);
        if (answer.rows && answer.rows.length > 0) {
            var doc0 = answer.rows[0].doc;
            var doc1 = answer.rows[answer.rows.length - 1].doc;

            var date0 = new Date(doc0.updated);
            var date1 = new Date(doc1.updated);

            $log.log('Doc0', doc0);

            $scope.answer_GetPosts = String.format('Retrieved {0} Items\nStart: {1} ID:{2}\nEnd:{3} ID:{4}',
                answer.rows.length,
                date0.toDateString(), doc0._id,
                date1.toDateString(), doc1._id);

            var i;
            for (i = 0; i < answer.rows.length; i++) {
                var doc = answer.rows[i].doc;
                doc.match = $scope.db_showItems.length;
                $scope.db_showItems.push(doc);
                if (addAlsoToBlog) {
                    $scope.blog_showItems.push(doc);
                }
            }
        }
        else {
            $scope.answer_GetPosts = 'None found';
        }
        $log.log(answer);
    };

    $scope.getPostsDB = function (limit, next) {
        if (!next) {
            $scope.db_lastItem = null;
        }
        var p = DataService.getItems(limit, $scope.db_lastItem);
        p.then(function (answer) {
            processDbItems(answer, !next);

            if (answer.rows.length > 0) {
                var doc1 = answer.rows[answer.rows.length - 1].doc;
                $scope.db_lastItem = doc1;
                if (!next) {
                    $scope.blog_lastItem = doc1;
                }
            }

        }, function (err) {
            $log.error(err);
        });
    };

    $scope.getPosts = function(limit, next) {
        RetrieveItemsService.loadItems(limit, next)
            .then(function(answer) {
                $scope.db_showItems = answer;
                $scope.RetrieveItemsService_Status = RetrieveItemsService.getStatus();
            })
            .catch(function(err) {
                $log.error(err);
            });
    };

    $scope.show = function (item) {
        //$log.log(item);
        return item.content;
    };

    $scope.logout = function() {
        GoogleApi.logout();
    };

    $scope.clearToken = function() {
        GoogleApi.clearToken();
        BlogListSync.clearStorage();
        localStorageService.remove('selected_blog');
        localStorageService.remove('unlock_code');
        ConfigService.unlockCode = '';
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

    $scope.htmlParserTest_TextWithLink = function () {
        $log.log('htmlParserTest');

        var results = "";

        //Text with link
        var input = 'The application was posted into google play store <a href="https://play.google.com/store/apps/details?id=com.vixsoftware.Ionic03">https://play.google.com/store/apps/details?id=com.vixsoftware.Ionic03</a>';

        $scope.input = input;
        results = HTMLReformat.reformat(input);
        $log.log('Result:', results);

        $scope.results = results;

    };

    $scope.htmlParserTest_Text_FindLink = function () {
        $log.log('htmlParserTest');

        var results = "";


        //Text with link
        var input = 'The application was posted into google play store https://play.google.com/store/apps/details?id=com.vixsoftware.Ionic03 more text';

        $scope.input = input;
        results = HTMLReformat.reformat(input);
        $log.log('Result', results);

        $scope.results = results;
    };

    $scope.htmlParserTest_ShowLink = function() {
        //$scope.results = 'Text <a href="http://www.fin-alg.com">http://www.fin-alg.com</a>';
        //$scope.results = 'Text <a href="http://www.fin-alg.com">http://www.fin-alg.com</a>';
        $scope.results = 'Text <span class="span-link">http://www.fin-alg.com</span>';
    };

    window.clickURL = function(url) {
        $log.log('Click url', url);
    };

    //-------------------------------------------------------------------


    $scope.raiseError = function () {
        $log.log('raiseError');

        throw new Error("Oh oh, an error has occured");

    };

    //-------------------------------------------------------------------
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
    $scope.cameraUploadTest = function () {
        console.log('cameraUploadTest');

        MiscServices.cameraPicture(Camera.PictureSourceType.CAMERA).
        then(function(imageURI) {
            if (imageURI) {
                $log.log('Got image URI', imageURI);
                return MiscServices.uploadImage(imageURI);
            }
            return null;
        }).then(function(imageUrl) {
            if (imageUrl) {
                $log.log('Uploaded image URL', imageUrl);

                text = HTMLReformat.reformat(MiscServices.formatImageUrl(imageUrl));
                $scope.upload_answer = text;
            }
        }, function(err) {
            $log.log('cameraPicture', err);
            $scope.upload_answer = err;
        });
    };

    $scope.cameraLocalTest = function () {
        console.log('cameraLocalTest');

        MiscServices.cameraPicture(Camera.PictureSourceType.CAMERA).
        then(function(imageURI) {
            if (imageURI) {
                $log.log('Got image URI', imageURI);
                text = HTMLReformat.reformat(MiscServices.formatImageUrl(imageURI));
                $scope.upload_answer = text;
            }
            return null;
        }, function(err) {
            $log.log('cameraPicture', err);
            $scope.upload_answer = err;
        });
    };

    $scope.urlFormatTest = function() {
        var url = 'https://lh6.googleusercontent.com/-oJNCUlvzVKs/U2UqdZsnctI/AAAAAAAAKHk/0aM2vyiZoJ4/%25255BUNSET%25255D.jpg';
        text = HTMLReformat.reformat(MiscServices.formatImageUrl(url));
        $scope.upload_answer = text;
    };

    //---------------------------------------------------------
    $scope.getBlogList = function() {
        $log.log('getBlogList');

        Blogger.listBlogsByUser('self')
        .then(function(answer) {
            $log.log('listBlogsByUser', answer);
            //console.table(answer.items);
        }).catch(function(err) {
            $log.error('listBlogsByUser Error', err);
        });
    };

    $scope.loadBlogList = function() {
        BlogListSync.loadBlogList()
        .then(function(answer) {
            $log.log('loadBlogList Completed', answer);
            //console.table(answer);
        }).catch(function(err) {
            $log.error('loadBlogList Error', err);
        });
    };

    $scope.clearBlogListFromStorage = function() {
        BlogListSync.clearStorage();
    };

    $scope.getBlogListFromStorage = function() {
        BlogListSync.getBlogList()
        .then(function(answer) {
            $log.log('getBlogListFromStorage Completed', answer);
            //console.table(answer);
        }).catch(function(err) {
            $log.error('getBlogListFromStorage Error', err);
        });
    };

    $scope.SelectBlog = function(idx) {
        BlogListSync.getBlogList()
            .then(function(answer) {
                var blog = answer[idx];
                DataService.selectBlog(blog.id, true);
                $log.log('Selected Blog', idx, blog, ConfigService);
            }).catch(function(err) {
                $log.error('SelectBlog Error', err);
            });

    };

    //-----------------------------------------------------------------------------
    $scope.pushQuery = function() {
        $log.log('pushQuery Started');
        PushServices.dbg_queryAll();
    };

    $scope.sendPostMessage = function() {
        $log.log('sendPostMessage');

        PushServices.updateBlog(ConfigService.blogId);
        /*
        var message = 'New Star';

        var pushInfo = {
            device_types: 'all',
            audience: {
                'tag': 'BLOG:' + ConfigService.blogId
            },
            notification: {
                alert: message
            }
        };

        $http.post('http://127.0.0.1:3000/push/', pushInfo)
        .success(function(answer) {
                $log.log('Success', answer);
            })
        .error(function(err) {
                $log.error('Failed', err);
            });
        */
    };

    $scope.checkState = function() {
        $log.log('$state.current', $state.current);
    };

    $scope.go = function(state) {
        $state.go(state);
    }
});
