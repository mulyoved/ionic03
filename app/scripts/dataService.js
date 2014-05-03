/**
 * Created by Muly on 4/20/2014.
 */
angular.module('Ionic03.services',[])
    .factory('DataService', function($log, blogdb, DataSync) {
        var currentNewText = '';

        var editItem = {
            text: currentNewText
        };

        return {
            authResult: null,
            isLogin: false,
            saveItem: function(text) {
                var time = new Date();

                text = text.replace(/\n/g, '<br />');
                $log.log('DataService: Save Item', text);
                DataSync.createPost('', text);
            },
            getItems: function() {
                $log.log('DataService: getItems');

                var alldocs = blogdb.allDocs({
                    include_docs: true,
                    attachments: true,
                    startkey: 'P0',
                    endkey: 'PZ'
                });

                return alldocs;
            },
            getItem: function(id) {
                return items[id-1];
            },
            getCurrentNewItem: function() {
                return editItem;
            }
        }
    })
    .factory('ConfigService', function() {
        return {
            blogName: function() {
                return 'm&m&stars';
            },
            imageUploadServerURL: 'http://10.0.2.2:3000',

            // Todo: Problem need the server to get or create the albumId based on blogId/Name, if album not found need to create or album is full need to create a new one (limit 2000 images)
            albumId: '5965097735673433505',

            //mainScreen: 'app.playlists',
            mainScreen: 'dbtest',
            blogId: '4462544572529633201' //'4355243139467288758'
        }
    })
    .factory('blogdb', function(pouchdb) {
        console.log('Open pouchdb database');
        return pouchdb.create('blogdb');
    });
