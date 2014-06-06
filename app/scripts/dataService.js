/**
 * Created by Muly on 4/20/2014.
 */
angular.module('Ionic03.services',[])
    .factory('DataService', function($rootScope, $log,$q, pouchdb, localStorageService, ConfigService) {
        var _blogdb;
        var currentNewText = '';


        var editItem = {
            text: currentNewText
        };

        var openDb = function() {
            var id = ConfigService.blogId; // why this is null?
            _blogdb = pouchdb.create('blogdb_' + id);
            //console.log('OpenDB', _blogdb);
        };

        var getBlogByID = function(blogid) {
            var blogs = localStorageService.get('blogs');
            if (blogs) {
                for (i=0; i<blogs.length; i++) {
                    if (blogs[i].id === blogid) {
                        return blogs[i];
                    }
                }
            }

            return null;
        };

        return {
            authResult: null,
            isLogin: false,
            getItems: function(limit, lastItem) {
                limit = limit || 10;

                console.log('DataService: getItems', limit, lastItem);

                var options = {
                    include_docs: true,
                    attachments: true,
                    startkey: 'P0',
                    endkey: 'PZ',
                    limit: limit
                };

                if (lastItem) {
                    options.startkey = lastItem._id;
                    options.skip = 1;
                }

                return alldocs = _blogdb.allDocs(options);
            },
            getCurrentNewItem: function() {
                return editItem;
            },
            blogdb: function() {
                return _blogdb;
            },
            deletedb: function() {
                var deferred = $q.defer();
                var alldocs = _blogdb.allDocs({include_docs: true, attachments: true});

                alldocs
                    .then(function(answer) {
                        var r = [];
                        angular.forEach(answer.rows, function (doc) {
                            r.push(_blogdb.remove(doc.doc));
                        });

                        //$log.log('Delete all', r);
                        return $q.all(r);
                    }).
                    then(function(answer) {
                        $log.log('deletedb: Delete all', answer);
                        deferred.resolve(answer);
                    }).catch(function(reason) {
                        $log.error('readdb failed', reason);
                        deferred.reject(reason);
                    });

                return deferred.promise;
            },
            selectBlog: function(blogid, triggerSync) {
                if (!blogid) {
                    blogid = localStorageService.get('selected_blog');
                }
                if (!blogid) {
                    $log.log('Blog not selected, need to request user to select one');
                    return false;
                }
                $log.log('Select BLog', blogid);

                var id = blogid;
                var blog = getBlogByID(id);
                localStorageService.add('selected_blog', id);



                ConfigService.blogId = id;
                if (blog) {
                    ConfigService.blogName = blog.name;
                }
                else {
                    ConfigService.blogName = 'Unknown';
                }

                $log.log('ConfigService.blogId', ConfigService.blogId, id, ConfigService.blogName);
                openDb();

                if (triggerSync) {
                    //$rootScope.$broadcast('event:DataSync:DataChange');
                    $rootScope.$broadcast('event:DataSync:Notify', {
                        action: 'blogid',
                        blogid: id,
                        sent: 0,
                        received: 0
                    });
                }

                return true;

                //done Switch database, remobe blogdb and make it property of Config, access from controlers by var
                //done reimplement delete database to actually drop and create
                //done test all
                //Change configuration items like title
                //Trigger Sync of new database
                //Problem, unsync old database, save list of unsync database
                //
                //after sync, sync more database, have database property of the sync function
            }
        }
    })
    .factory('ConfigService', function() {
        return {
            version: '0.8.0.1',
            blogName: 'Unknown',
            isUnittest: false,
            isInitDone: false,
            imageUploadServerURL: 'http://picasawebapibridge.herokuapp.com', //http://10.0.2.2:3000' (localhost on emulator)

            enablePushNotification: true,
            pushServiceURL: 'http://picasawebapibridge.herokuapp.com/push/', //http://10.0.2.2:3000/push/', //http://127.0.0.1:3000/push/',

            // Todo: Problem need the server to get or create the albumId based on blogId/Name, if album not found need to create or album is full need to create a new one (limit 2000 images)
            albumId: '5965097735673433505',


            prevState: null,
            //mainScreen: 'app.playlists', // setup
            mainScreen: 'dbtest',
            blogId: false,
            locked: false,
            unlockCode: '',
            tempDisableUnlock: 0, // needed when switch to camera
            username: 'Unknown', // needed for push to exclude self, but not implemented yet
            initialSyncLimit: 100
        }
    });
