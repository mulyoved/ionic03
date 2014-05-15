'use strict';

angular.module('Ionic03.DataSync', [])

.service('DataSync', function($rootScope, $q, $http, localStorageService, $log,
                          GoogleApp, GoogleApi, GAPI, DataService, Blogger, ConfigService, HTMLReformat, MiscServices) {

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

    var convertDateToKey = function(date) {
        var timePublished = new Date(date).getTime();
        return 'P' + (2000000000000 - timePublished) + '#';
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

    var bumpDate = function(gapiDate, milisecodsOffset) {
        milisecodsOffset = milisecodsOffset || 1;
        var date = new Date(gapiDate);
        date = new Date(date.getTime() + milisecodsOffset);

        return date2GAPIDate(date);
    };

    function getComments(blogId, postId) {
        var params = {
            fetchBodies: true,
            //'maxResults': 10,
            //'startDate': _lastUpdate.date, // set by code later
            'fields': 'items(author/displayName,content,id,kind,post,published,updated),nextPageToken'
        };
        //$log.log('Going to request comments', params);
        return Blogger.listComments(blogId, postId, params);
    }

    var blogger_getModifiedDocuments = function(startDate, endDate, limit) {
        var _bloggerList = [];

        var params = {
            'fetchBodies': true,
            'fetchImages': false,
            'orderBy': 'published',
            //'startDate': _lastUpdate.date, // set by code later
            'fields': 'items(content,id,kind,published,status,title,titleLink,updated),nextPageToken'
        };


        if (startDate && startDate.length > 0) {
            //Start date use the publish field, so we will not get updated posts
            params.startDate = bumpDate(startDate);
        }
        else {
            params.maxResults = limit;
        }

        if (endDate) {
            //todo: may get duplicate, fix it by skip
            params.endDate = endDate;
        }

        //$log.log('Retrive posts from blogId', ConfigService.blogId, startDate, endDate, limit, params);
        return Blogger.listPosts(ConfigService.blogId, params).
            then(function(list) {

                // Get all modified comments from Blogger
                if ('items' in list && list.items.length > 0) {
                    _bloggerList = list.items;
                    //$log.log('Received From blogger Posts: ', list.items.length, list);

                    //Create query for each post comments
                    var r = [];
                    angular.forEach(list.items, function(item) {
                        r.push(getComments(ConfigService.blogId, item.id));
                    });
                    return $q.all(r);
                }
            }).
            then(function(list) {
                angular.forEach(list, function(postComments) {
                    //$log.log('Received From blogger Comments: ', postComments);
                    // Get all documents from DB
                    if ('items' in postComments && postComments.items.length > 0) {
                        //$log.log('Received From blogger Comments: ', postComments.items.length, postComments);
                        // Append list.items to _bloggerList
                        _bloggerList.push.apply(_bloggerList, postComments.items);
                    }
                });

                return _bloggerList;
            });
    };

    var syncFromBlogger = function() {
        var deferred = $q.defer();
        var recived = 0;
        var _lastUpdate;
        var _lastUpdateChanged = false;
        var _bloggerList = [];

        //Update DB->Blogger
        DataService.blogdb().get('lastUpdate').
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
            return blogger_getModifiedDocuments(_lastUpdate.date, null, ConfigService.initialSyncLimit);
        }).
        then(function(list) {
            _bloggerList = list;
            $log.log('blogger_getModifiedDocuments returned ', list, list.length);

            //Get all documents in database
            if (list.length > 0) {
                var maxDate = list[0].published;
                angular.forEach(list, function(item) {
                    //$log.log('Item from blogger: ', item);
                    if (maxDate < item.published) {
                        maxDate = item.published;
                    }
                });

                var maxKey = convertDateToKey(maxDate)+'z';
                $log.log('Query database for exsting document in the same date range as received from blogger', maxDate, maxKey);
                return DataService.blogdb().allDocs({
                    include_docs: true,
                    attachments: false,
                    startkey: 'P0',
                    endkey: maxKey
                });
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
                    recived  += toUpdate.length;
                    _lastUpdateChanged = true;
                    return DataService.blogdb().bulkDocs({'docs': toUpdate});
                }
            }
            return 0;
        }).then(function(answer) {
            //Save last update date to DB
            if (_lastUpdateChanged) {
                $log.log('All saved', answer);
                $log.log('Update last update', _lastUpdate);
                return DataService.blogdb().post(_lastUpdate);
            }
            else {
                $log.log('Nothing to update, all uptodate', answer);
                return 0;
            }
        })
        .then(function(answer) {
            deferred.resolve(recived);
        })
        .catch(function(err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    var uploadImages = function(doc) {
        var deferred = $q.defer();

        $log.log('uploadImages', doc);
        var images = HTMLReformat.extractLocalImages(doc.content);
        if (images && images.length > 0) {
            var imageUpload = [];
            angular.forEach(images, function (image) {
                imageUpload.push(MiscServices.uploadImage(image));
            });

            $q.all(imageUpload).then(function UploadImageResults(utlList) {
                $log.log('uploadImages Answer', utlList);
                for (var i = 0; i < images.length; i++) {
                    var image = images[i];
                    var url = utlList[i];
                    $log.log('URI -> URL', image, url);
                }
                var text = HTMLReformat.replaceLocalImages(doc.content, images, utlList);
                $log.log('Replace document', doc.content, text);
                doc.content = text;

                deferred.resolve(doc);
            }, function(err) {
                deferred.reject(err);
            });
        } else {
            deferred.resolve(doc);
        }

        return deferred.promise;
    };

    var syncToBloggerDoc = function(_doc) {
        console.log('syncToBloggerDoc', _doc);

        var doc = _doc.value;
        var orgDoc = JSON.parse(JSON.stringify(doc));
        var deferred = $q.defer();
        var promise;
        $log.log('to Update', doc);

        uploadImages(doc)
        .then(function(doc) {
            var kind = doc.kind;
            var id = doc.id;
            var isPost = kind.endsWith('#post');
            mapDb2Post(doc);
            $log.log('to Update Clean', doc);

            if (id.startsWith('G')) {
                delete doc.id;
                delete doc.kind;

                if (isPost) {
                    promise = Blogger.insertPosts(ConfigService.blogId, doc);
                }
                else {
                    promise = Blogger.insertComments(ConfigService.blogId, doc);
                }

                var item;
                promise.
                    then(function (answer) {
                        $log.log('insertPosts Answer:', answer);
                        item = answer;

                        return DataService.blogdb().remove(orgDoc);
                    }).then(function(answer) {
                        mapPost(item);
                        item.key = item.id;
                        return DataService.blogdb().post(item);
                    }).then(function(answer) {
                        deferred.resolve(answer);
                    }, function(err) {
                        deferred.reject(err);
                    });
            }
            else {
                promise = Blogger.updatePosts(ConfigService.blogId, id, doc);
                promise
                    .then(function (answer) {
                        $log.log('updatePosts Answer:', answer);
                        //Not sure this is right, need to test
                        var item = answer.doc;
                        mapPost(item);
                        item.key = item.id;
                        DataService.blogdb().post(item).then(function (answer) {
                            deferred.resolve(answer);
                        });
                    }, function (err) {
                        deferred.reject(err);
                    });
            }
        }, function(err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    var proccessArray = function(arr, promise) {
        var item = arr.pop();
        if (item) {
            return promise(item).
                then(function (answer) {
                    if (arr.length > 0) {
                        return proccessArray(arr, promise);
                    }
                    else {
                        return 0;
                    }
                });
        }
        else {
            return 0;
        }
    };

    var syncToBlogger = function() {
        var deferred = $q.defer();
        $log.log('syncToBlogger');

        var queryFun = {
            map: function(doc) { emit(doc.key, doc); }
        };

        var alldocs = DataService.blogdb().query(queryFun, {reduce: false, key: 'U'});

        /*
         var alldocs = DataService.blogdb().allDocs({
         include_docs: true,
         attachments: false,
         keys: 'U'
         });
         */

        alldocs
        .then(function(answer) {
            $log.log('syncToBlogger ',answer);

            //Reverse the order, work better with blogger
            var arr = answer.rows.reverse();

            var count = arr.length;
            if (count > 0) {
                return proccessArray(arr, syncToBloggerDoc)
                .then(function(doc) {
                    $log.log('syncToBlogger syncToBloggerDoc Answer', doc);
                    deferred.resolve(count);
                }, function(err) {
                    $log.log('syncToBlogger syncToBloggerDoc Error',err);
                    deferred.reject(err);
                })
            }
            else {
                $log.log('syncToBlogger Nothing to upload');
                deferred.resolve(0);
            }
        });

        return deferred.promise;
    };

    var dataSync = {
        gapiLogin: false,
        needSync: false, // Dirty
        duringSync: false,
        newData: false,

        init: function() {
            return GoogleApi.getToken({
                client_id: GoogleApp.client_id,
                client_secret: GoogleApp.client_secret
            }).then(function(data) {
                console.log('DataSync: got token', data);
                var token = {
                    access_token: data.access_token,
                    client_id: GoogleApp.client_id,
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
                var sent = 0;
                var recived = 0;
                syncToBlogger()
                    .then(function (answer) {
                        sent = answer;
                        return syncFromBlogger();
                    })
                    .then(function (answer) {
                        recived = answer;

                        var data = {
                            action: 'sync',
                            blogid: ConfigService.blogId,
                            sent: sent,
                            received: recived,
                            duringSync: false,
                            error: null
                        };

                        $log.log('syncModifiedDocuments completed', answer);
                        dataSync.duringSync = false;
                        dataSync.error = null;
                        $rootScope.$broadcast('event:DataSync:StatusChange');
                        //$rootScope.$broadcast('event:DataSync:DataChange');
                        $rootScope.$broadcast('event:DataSync:Notify', data);
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

        savePost: function(text) {
            text = text.replace(/\n/g, '<br />');
            $log.log('DataService: Save Item', text);
            return dataSync.createPost('', text);
        },

        createPost: function(title, content) {
            var time = new Date();

            var post = {
                id: 'G' + time.getTime(),
                kind: 'db#post',
                title: title,
                content: content,
                published: date2GAPIDate(time),
                key: 'U'
            };

            mapPost(post);
            return DataService.blogdb().post(post)
                .then(function(answer) {
                    $log.log('Add Success', answer);
                    //Trigger db change
                    //Start Sync

                    //todo: uncomment temp to see unsync item from database in list
                    dataSync.needSync = true;
                    dataSync.newData = true;
                    //$rootScope.$broadcast('event:DataSync:DataChange');
                    $rootScope.$broadcast('event:DataSync:StatusChange');
                }, function(err) {
                    $log.error('Add Failed', err);
                });
        },
        getItems: function(lastItem, limit) {
            limit = limit || 20;
            var published = null;
            if (lastItem) {
                published = bumpDate(lastItem.published, 60000);
            }
            $log.log('DataSyncService:getItems', lastItem, published);

            // don't make limit too small as it will get into a series of same date item
            // and will not be able to progress to next item
            return blogger_getModifiedDocuments(null, published, Math.max(20, limit));
        },

        //---------------------
        dumpDatabase: function() {
            var alldocs = DataService.blogdb().allDocs({include_docs: true, attachments: true});

            return alldocs
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
                    return answer.rows;
                }, function(reason) {
                    $log.error('readdb failed', reason);
                });
        },
        _mapPost: mapPost

        /*
        deletedb: function() {
            var alldocs = DataService.blogdb().allDocs({include_docs: true, attachments: true});

            alldocs
                .then(function(answer) {
                    var r = [];
                    angular.forEach(answer.rows, function (doc) {
                        r.push(DataService.blogdb().remove(doc.doc));
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
        */
    };

    //Todo:
    //handle comments
    //Decied how to limit database size
    //Old comments - load all - bypass database?

    return dataSync;
});
