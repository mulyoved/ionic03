/**
 * Created by Muly on 4/20/2014.
 */
angular.module('Ionic03.services',[])
    .factory('DataService', function($rootScope, $log,$q, pouchdb, ConfigService) {
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
            getItem: function(id) {
                return items[id-1];
            },
            getCurrentNewItem: function() {
                return editItem;
            },
            blogdb: function() {
                return _blogdb;
            },
            deletedb: function() {
                var alldocs = _blogdb.allDocs({include_docs: true, attachments: true});

                alldocs
                    .then(function(answer) {
                        var r = [];
                        angular.forEach(answer.rows, function (doc) {
                            r.push(_blogdb.remove(doc.doc));
                        });

                        $log.log('Delete all', r);
                        return $q.all(r);
                    }).
                    then(function(answer) {
                        $log.log('Delete all', answer);
                    }).catch(function(reason) {
                        $log.error('readdb failed', reason);
                    });

                return alldocs;
            },
            selectBlog: function(blog) {
                $log.log('Select BLog', blog);

                var id = blog.id;

                ConfigService.blogId = id;
                ConfigService.blogName = blog.name;
                $log.log('ConfigService.blogId', ConfigService.blogId, id, ConfigService.blogName);
                openDb();
                $rootScope.$broadcast('event:DataSync:DataChange');

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
            blogName: 'Unknown',
            imageUploadServerURL: 'http://picasawebapibridge.herokuapp.com', //http://10.0.2.2:3000',

            // Todo: Problem need the server to get or create the albumId based on blogId/Name, if album not found need to create or album is full need to create a new one (limit 2000 images)
            albumId: '5965097735673433505',


            mainScreen: 'app.playlists',
            //mainScreen: 'dbtest',
            blogId: '4462544572529633201', //'4355243139467288758'
            initialSyncLimit: 100
        }
    });
