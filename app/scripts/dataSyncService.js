'use strict';

angular.module('Ionic03.controllers')

.service('DataSync', function($rootScope, $q, $http, localStorageService, GoogleApp, GoogleApi, GAPI, blogdb, Blogger, ConfigService, $log) {

        //Sync code start
    var blogId = ConfigService.blogId; // '4462544572529633201';

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
            'maxResults': 100,
            //'startDate': _lastUpdate.date,
            'fields': 'items(content,id,kind,published,status,title,titleLink,updated),nextPageToken'
        };

        if (lastUpdate.length > 0) {
            params.startDate = bumpDate(lastUpdate);
        }

        var promise = Blogger.listPosts(blogId, params).
            then(function(list) {
                // Get all modified comments from Blogger
                if ('items' in list && list.items.length > 0) {
                    _bloggerList = list.items;
                }

                var params = {
                    'fetchBodies': true,
                    'maxResults': 100,
                    //'startDate': _lastUpdate.date,
                    'fields': 'items(author/displayName,content,id,kind,post,published,updated),nextPageToken'
                };

                if (lastUpdate.length > 0) {
                    params.startDate = bumpDate(lastUpdate);
                }

                return Blogger.listCommentsByBlog(blogId, params);
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

    var syncFromBlogger = function() {
        var _lastUpdate;
        var _lastUpdateChanged = false;
        var _bloggerList = [];

        //Update DB->Blogger
        var p = blogdb.get('lastUpdate').
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
        });

        return p;
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
                promise = Blogger.insertPosts(blogId, doc);
            }
            else {
                promise = Blogger.insertComments(blogId, doc);
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
            promise = Blogger.updatePosts(blogId, id, doc);
            promise
            .then(function(answer) {
                $log.log('updatePosts Answer:', answer);
                //Not sure this is right, need to test
                var item = answer.doc;
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

    var syncToBlogger = function() {
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

        var p = alldocs
        .then(function(answer) {
            $log.log('syncToBlogger ',answer);

            if (answer.total_rows > 0) {
                return proccessArray(answer.rows, syncToBloggerDoc);
            }
            else {
                return 0;
            }
        });

        return p;
    };

    var dataSync = {
        gapiLogin: false,
        needSync: false, // Dirty
        duringSync: false,

        init: function() {
            GoogleApi.getToken({
                client_id: GoogleApp.client_id,
                client_secret: GoogleApp.client_secret
            }).then(function(data) {
                console.log('DataSync: got token', data);
                var token = {
                    access_token: data.access_token,
                    client_id: GoogleApp.client_id,
                    userName: data.userName,
                    cookie_policy: undefined,
                    expire_in: data.expire_in,
                    expire_at: new Date().getTime() + parseInt(data.expires_in, 10) * 1000 - 60000,
                    token_type: data.token_type
                };
                return GAPI.init_WithToken(token);
            }).then(function(data) {
                dataSync.gapiLogin = true;
                console.log('DataSync: gapiLogin = true', data);
                $rootScope.$broadcast('event:DataSync:StatusChange', dataSync);
            }, function(err) {
                dataSync.gapiLogin = false;
                console.log('DataSync: gapiLogin = false');
                $rootScope.$broadcast('event:DataSync:StatusChange', dataSync);
            });
        },

        sync: function() {
            if (!dataSync.duringSync) {
                dataSync.duringSync = true;
                dataSync.needSync = false;
                dataSync.error = null;
                console.log('Start Sync');
                $rootScope.$broadcast('event:DataSync:StatusChange');
                syncToBlogger()
                .then(function (answer) {
                    return syncFromBlogger();
                }).then(function (answer) {
                    $log.log('syncModifiedDocuments completed', answer);
                    dataSync.duringSync = false;
                    dataSync.error = null;
                    $rootScope.$broadcast('event:DataSync:StatusChange');
                    $rootScope.$broadcast('event:DataSync:DataChange');
                }, function (reason) {
                    $log.error('syncModifiedDocuments Failed', reason);
                    dataSync.duringSync = false;
                    dataSync.needSync = true;
                    dataSync.error = reason || 'Failed unknown reason';
                    $rootScope.$broadcast('event:DataSync:StatusChange');
                })
            }
            else {
                $log.error('Calling sync while sync in progress');
            }
        },

        createPost: function(title, content) {
            var time = new Date();

            var post = {
                id: 'G' + time.getTime(), // Generated ID
                kind: 'db#post',
                title: title,
                content: content,
                published: date2GAPIDate(time),
                key: 'U'
            };

            mapPost(post);
            blogdb.post(post)
            .then(function(answer) {
                $log.log('Add Success', answer);
                //Trigger db change
                //Start Sync

                //todo: uncomment temp to see unsync item from database in list
                //dataSync.needSync = true;
                    $log.log('Data Sync $broadcast DataChange');
                    $rootScope.$broadcast('event:DataSync:DataChange');
                $rootScope.$broadcast('event:DataSync:StatusChange');
            }, function(err) {
                $log.error('Add Failed', err);
            });
        },

        //---------------------
        dumpDatabase: function() {
            var alldocs = blogdb.allDocs({include_docs: true, attachments: true});

            alldocs
            .then(function(answer) {
                $log.log('All docs', answer);
                //$scope.syncResult = 'done:' + answer.total_rows;
                //$scope.posts = answer.rows;
                //console.table(answer.rows);

                var r = [];
                angular.forEach(answer.rows, function (doc) {
                    r.push(doc.doc);
                });

                //console.log(r);
                console.table(r);

            }, function(reason) {
                $log.error('readdb failed', reason);
            });
        },

        deletedb: function() {
            var alldocs = blogdb.allDocs({include_docs: true, attachments: true});

            alldocs
            .then(function(answer) {
                var r = [];
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
        }
    };

    //Todo:
    //handle comments
    //test on device
    //Post images
    //Decied how to limit database size
    //Old comments - load all - bypass database?

    return dataSync;
});
