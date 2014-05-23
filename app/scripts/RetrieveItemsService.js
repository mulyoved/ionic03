angular.module('Ionic03.RetrieveItemsService',[])
    .factory('RetrieveItemsService', function($rootScope, $q, $log, DataService, DataSync, ConfigService) {
        var lastItem;
        var _items = [];
        var blogItemCount = -1;
        var enableBloggerRetrive = true;
        var busy = false;

        var resetData = function() {
            _items = [];
            lastItem = {
                source: 'db',
                doc: null,
                topItemDateTime: new Date(0),
                blogId: ConfigService.blogId
            };
            blogItemCount = -1;
        };

        resetData();

        //Sort post by ID
        var sortPosts = function(items) {
            items.sort(function (a, b) {
                if (a._id < b._id)
                    return -1;
                if (a._id > b._id)
                    return 1;
                return 0;
            });
        };

        // Add _id, Sort, and check for duplicates, return 1st not duplicate item
        function syncLists(items, newItems) {

            for (i = 0; i < newItems.length; i++) {
                var doc = newItems[i];
                DataSync._mapPost(doc);
            }

            sortPosts(newItems);

            var i;
            var j = 0;

            // the duplicate items can be in the end
            // cannot assume the duplicate item is the 1st in newItems as blogger sort is different and limit can cut in any place
            // itemLength - newItems.length - 20
            // 20 for the edj case we got 2 items and the sort can be 3 from the bottom
            // becouse we cannot assume the duplicate item is even
            var itemLength = items.length;
            for (j = 0; j < newItems.length; j++) {

                /*
                if (newItems[j]._id === 'P610477473000#8791549646213892639') {
                    $log.log('### DEBUG ITEM B', newItems[j]);
                }
                */

                var duplicate = false;
                for (i = Math.max(0, itemLength - newItems.length - 20); i < itemLength; i++) {

                    /*
                    if (items[i]._id === 'P610477473000#8791549646213892639') {
                        $log.log('### DEBUG ITEM C', items[i]);
                    }
                    */
                    if (items[i]._id === newItems[j]._id) {
                        duplicate = true;
                        break;
                    }
                }
                if (!duplicate) {
                    items.push(newItems[j]);
                }
            }
            return j;
        };

        var requestFromBlogger = function(deferred, limit) {
            if (enableBloggerRetrive) {
                $log.log('Blogger Request');

                DataSync.getItems(lastItem.doc, limit)
                    .then(function (answer) {
                        var oldLength = _items.length;
                        $log.log('Recived Items from Blogger', answer.length, answer);

                        syncLists(_items, answer);
                        var doc1 = _items[_items.length - 1];

                        lastItem.source = oldLength == _items.length ? 'end' : 'blog';
                        lastItem.doc = doc1;

                        if (lastItem.source == 'end') {
                            blogItemCount = _items.length;
                        }

                        busy = false;
                        deferred.resolve(_items);
                    })
                    .catch(function (err) {
                        $log.error(err);
                        busy = false;
                        deferred.reject(err);
                    });
            }
            else {
                busy = false;
                deferred.resolve(_items);
            }
        };

        var loadItems = function(limit, next) {
            var deferred = $q.defer();
            if (busy) {
                $log.error('RetrieveItemsService is BUSY');
                deferred.reject('RetrieveItemsService is BUSY');
            }
            else {
                busy = true;


                if (ConfigService.blogId != lastItem.blogId) {
                    resetData();
                }

                if (!next || !lastItem) {
                    //Query from top
                    lastItem.source = 'db';
                    lastItem.doc = null;

                    _items = [];
                }

                if (lastItem.source == 'db') {
                    DataService.getItems(limit, lastItem.doc)
                        .then(function (answer) {
                            if (answer.rows.length > 0) {
                                var date = new Date(answer.rows[0].doc.updated);
                                if (_items.length === 0 && date > lastItem.topItemDateTime) {
                                    lastItem.topItemDateTime = date;
                                }

                                for (i = 0; i < answer.rows.length; i++) {
                                    var doc = answer.rows[i].doc;
                                    _items.push(doc);
                                }

                                $log.log('Recived Items from DB', answer.rows.length);
                                lastItem.doc = answer.rows[answer.rows.length - 1].doc;
                            }

                            if (answer.rows.length < limit) {
                                if (blogItemCount > -1 && blogItemCount <= _items.length) {
                                    requestFromBlogger(deferred, limit);
                                }
                                else {
                                    lastItem.source = 'end';
                                    busy = false;
                                    deferred.resolve(_items);
                                }
                            }
                            else {
                                busy = false;
                                deferred.resolve(_items);
                            }
                        })
                        .catch(function (err) {
                            $log.error(err);
                            busy = false;
                            deferred.reject(err);
                        });
                }
                else if (lastItem.source == 'blog') {
                    requestFromBlogger(deferred, limit);
                }
                else if (lastItem.source == 'end') {
                    busy = false;
                    deferred.resolve(_items);
                }
            }

            return deferred.promise;
        };

        return {
            _syncLists: syncLists,
            loadItems: loadItems,
            getItems: function() {
                return _items;
            },
            getStatus: function() {
                return lastItem;
            }
        }
    });
