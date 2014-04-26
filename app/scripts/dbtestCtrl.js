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

.controller('dbTestCtrl', function($scope, ConfigService, $log, $q, GAPI, Blogger, pouchdb, GoogleApi, DataSync) {
    $scope.answer = '<empty>';
    var blogdb = pouchdb.create('blogdb');

    $scope.getPosts = function() {
        console.log('getOPosts');

        var p = Blogger.listPosts('4462544572529633201',
            {'fetchBodies': true, 'fetchImages': false, 'maxResults': 10,'fields': 'items(content,id,kind,published,status,title,titleLink,updated),nextPageToken'});

        console.log('Answer: ', $scope.posts);

        p.
        then(function(list) {
            console.log('List: ', list);
            $scope.posts = list.items;
        });
    };

    $scope.logout = function() {
        console.log('Logout');

        GoogleApi.logout()
        .then(function() {
            //Reinit after we get new token
            DataSync.init();

            console.log('logout');
        }, function(data) {
            console.log('Logout failed', data);
        });

    };

    //Sync code start
    $scope.blogId = '4462544572529633201';

    var date2GAPIDate = function (date) {
        var pad = function (amount, width) {
            var padding = "";
            while (padding.length < width - 1 && amount < Math.pow(10, width - padding.length - 1))
                padding += "0";
            return padding + amount.toString();
        };

        date = date ? date : new Date();
        var offset = date.getTimezoneOffset();
        return pad(date.getFullYear(), 4)
            + "-" + pad(date.getMonth() + 1, 2)
            + "-" + pad(date.getDate(), 2)
            + "T" + pad(date.getHours(), 2)
            + ":" + pad(date.getMinutes(), 2)
            + ":" + pad(date.getSeconds(), 2)
            + "." + pad(date.getMilliseconds(), 3)
            + (offset > 0 ? "-" : "+")
            + pad(Math.floor(Math.abs(offset) / 60), 2)
            + ":" + pad(Math.abs(offset) % 60, 2);
    };

    var mapPost = function(doc) {
        var timePublished = new Date(doc.published).getTime();
        if (doc.kind.startsWith('delete#')) {
            doc._id = 'D' + doc.id;
        }
        else if (doc.kind.endsWith('#post')) {
            doc._id = 'P' + (2000000000000 - timePublished) + '#' + doc.id;  // for sorting
        }
        else {
            //Split comments and posts
            //doc._id = 'C' + doc.post.id + '#' + (timePublished) + '#' + doc.id;  // for sorting
            doc._id = 'P' + (2000000000000 - timePublished) + '#' + doc.id;  // for sorting
        }
        //doc['time_published'] = timePublished;
    };

    var mapDb2Post = function(post) {
        delete post._id;
        delete post._rev;
        delete post.key;
        //delete post['time_published'];
        //delete post['key'];

        return post;
    };

    var bumpDate = function(gapiDate) {
        var date = new Date(gapiDate);
        date = new Date(date.getTime() + 1);

        return date2GAPIDate(date);
    };

    var blogger_getModifiedDocuments = function(lastUpdate) {
        var _bloggerList = [];

        var params = {
            'fetchBodies': true,
            'fetchImages': false,
            'maxResults': 10,
            //'startDate': _lastUpdate.date,
            'fields': 'items(content,id,kind,published,status,title,titleLink,updated),nextPageToken'
        };

        if (lastUpdate.length > 0) {
            params.startDate = bumpDate(lastUpdate);
        }

        var promise = Blogger.listPosts($scope.blogId, params).
        then(function(list) {
            // Get all modified comments from Blogger
            if ('items' in list && list.items.length > 0) {
                _bloggerList = list.items;
            }

            var params = {
                'fetchBodies': true,
                'maxResults': 10,
                //'startDate': _lastUpdate.date,
                'fields': 'items(author/displayName,content,id,kind,post,published,updated),nextPageToken'
            };

            if (lastUpdate.length > 0) {
                params.startDate = bumpDate(lastUpdate);
            }

            return Blogger.listCommentsByBlog($scope.blogId, params);
        }).
        then(function(list) {
            // Get all documents from DB
            if ('items' in list && list.items.length > 0) {
                // Append list.items to _bloggerList
                _bloggerList.push.apply(_bloggerList, list.items);
            }

            return _bloggerList;
        });

        return promise;
    };

    $scope.syncResult = '';
    $scope.syncFromBlogger = function() {
        $scope.syncResult = 'Start Sync';

        var _lastUpdate;
        var _lastUpdateChanged = false;
        var _bloggerList = [];

        //Update DB->Blogger
        blogdb.get('lastUpdate').
        // read last update time from database
        then(function(lastUpdate) {
            // Get last update from DB
            $log.log('lastUpdate', lastUpdate);
            _lastUpdate = lastUpdate;
            if (!_lastUpdate.date) {
                _lastUpdate.date = '';
            }
        }, function(reason) {
            //$log.log('lastUpdate failed', reason);
            _lastUpdate = { _id: 'lastUpdate', date: '' };
        }).
        then(function() {
            // Get all modified posts from Blogger
            return blogger_getModifiedDocuments(_lastUpdate.date);
        }).
        then(function(list) {
            _bloggerList = list;

            //Get all documents in database
            if ('items' in list && list.items.length > 0) {
                return blogdb.allDocs({include_docs: true, attachments: false});
            }
            else {
                return [];
            }
        }).
        then(function(alldocs) {
            //Merge
            var list = _bloggerList;

            if (list.length > 0) {
                //$log.log('list', list)
                $log.log('Blogger -> got answer', list);
                $log.log('DB -> alldocs', alldocs);

                //create dictionary of saved item <id, item>
                var savedItems = {};
                angular.forEach(alldocs.rows, function(item) {
                    savedItems[item.id] = item.doc;
                });

                var lastUpdate = _lastUpdate.date;
                var toUpdate = [];
                angular.forEach(list, function(item) {
                    if (lastUpdate < item.updated) {
                        lastUpdate = item.updated;
                    }

                    var needUpdate = false;
                    var id = item.id;
                    //Find saved item
                    if (id in savedItems) {
                        var savedItem = savedItems[id];
                        if (item.updated !== savedItem.updated) {
                            $log.log('Items are different blogger:%O data:%O', item, savedItem);
                            needUpdate = true;
                            item._rev = savedItem._rev;
                        }
                    }
                    else {
                        needUpdate = true;
                    }

                    if (needUpdate) {
                        mapPost(item);
                        item.key = item.id;
                        toUpdate.push(item);
                    }
                });

                _lastUpdate.date = lastUpdate;
                if (toUpdate.length > 0) {
                    _lastUpdateChanged = true;
                    return blogdb.bulkDocs({'docs': toUpdate});
                }
            }
            return 0;
        }).then(function(answer) {
            //Save last update date to DB
            if (_lastUpdateChanged) {
                $log.log('All saved', answer);
                $log.log('Update last update', _lastUpdate);
                return blogdb.post(_lastUpdate);
            }
            else {
                $log.log('Nothing to update, all uptodate', answer);
                return 0;
            }
        }).then(function(answer) {
            $scope.syncResult = 'done';
        }, function(reason) {
            $log.error('Sync failed', reason);
        });
    };

    var syncToBloggerDoc = function(_doc) {
        console.log('syncToBloggerDoc', _doc);

        var doc = _doc.value;
        var orgDoc = JSON.parse(JSON.stringify(doc));
        var promise;
        $log.log('to Update', doc);

        var kind = doc.kind;
        var id = doc.id;
        var isPost = kind.endsWith('#post');
        mapDb2Post(doc);
        $log.log('to Update Clean', doc);

        if (id.startsWith('G')) {
            delete doc.id;
            delete doc.kind;

            if (isPost) {
                promise = Blogger.insertPosts($scope.blogId, doc);
            }
            else {
                promise = Blogger.insertComments($scope.blogId, doc);
            }
            promise.
                then(function(answer) {
                    $log.log('insertPosts Answer:', answer);
                    var item = answer;

                    return blogdb.remove(orgDoc).
                        then(function(answer) {
                            mapPost(item);
                            item.key = item.id;
                            return blogdb.post(item);
                        });
                });
        }
        else {
            promise = Blogger.updatePosts($scope.blogId, id, doc);
            promise.
                then(function(answer) {
                    $log.log('updatePosts Answer:', answer);
                    mapPost(item);
                    item.key = item.id;
                    return blogdb.post(item);
                });
        }

        return promise;
    };

    var prommiseArray = function(arr, promise) {
        var item = arr.pop();
        var p = promise(item).
            then(function(answer) {
                $log.log('Success: ',answer);
                if (arr.length > 0) {
                    return prommiseArray(arr, promise);
                }
                else {
                    return 0;
                }
            });

        return p;
    };

    var proccessArray = function(arr, promise) {
        var item = arr.pop();
        if (item) {
            var p = promise(item).
                then(function (answer) {
                    if (arr.length > 0) {
                        return prommiseArray(arr, promise);
                    }
                    else {
                        return 0;
                    }
                });

            return p;
        }
        else {
            return 0;
        }
    };

    $scope.syncToBlogger = function() {
        $log.log('syncToBlogger');

        var queryFun = {
            map: function(doc) { emit(doc.key, doc); }
        };

        var alldocs = blogdb.query(queryFun, {reduce: false, key: 'U'});

        /*
         var alldocs = blogdb.allDocs({
         include_docs: true,
         attachments: false,
         keys: 'U'
         });
         */

        alldocs.then(function(answer) {
            $log.log('syncToBlogger ',answer);

            if (answer.total_rows > 0) {
                return proccessArray(answer.rows, syncToBloggerDoc);
            }
            else {
                return 0;
            }
        }).
        then(function(answer) {
            $log.log('syncModifiedDocuments completed', answer);
        }, function(reason) {
            $log.error('syncModifiedDocuments Failed', reason)
        })
    };

    $scope.createPost = function() {
        $log.log('Add dummy post');
        var time = new Date();

        var post = {
            id: 'G' + time.getTime(), // Generated ID
            kind: 'db#post',
            title: 'V2: ' + time.toString(),
            content: 'Sample Content' + time.toString(),
            published: date2GAPIDate(time),
            key: 'U'
        };

        mapPost(post);
        blogdb.post(post)
        .then(function(answer) {
            $log.log('Add Success', answer);
        }, function(err) {
            $log.error('Add Failed', err);
        });
    };

    //---------------------
    $scope.dumpDatabase = function() {
        var alldocs = blogdb.allDocs({include_docs: true, attachments: true});

        alldocs.then(function(answer) {
            $log.log('All docs', answer);
            $scope.syncResult = 'done:' + answer.total_rows;
            //$scope.posts = answer.rows;
            console.table(answer.rows);

            r = [];
            angular.forEach(answer.rows, function (doc) {
                r.push(doc.doc);
            });

            console.log(r);
            console.table(r);

        }, function(reason) {
            $log.error('readdb failed', reason);
        });
    };

    $scope.deletedb = function() {
        var alldocs = blogdb.allDocs({include_docs: true, attachments: true});

        alldocs.then(function(answer) {
            r = [];
            angular.forEach(answer.rows, function (doc) {
                r.push(blogdb.remove(doc.doc));
            });

            $log.log('Delete all', r);
            return $q.all(r);
        }).
        then(function(answer) {
            $log.log('Delete all', answer);
        }, function(reason) {
            $log.error('readdb failed', reason);
        });
    };

});

