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
            saveItem: function(item) {
                $log.log('DataService: Save Item', item);
                var time = new Date();
                DataSync.createPost('', item.text);
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
            mainScreen: 'dbtest' //'app.playlists'
        }
    })
    .factory('blogdb', function(pouchdb) {
        console.log('Open pouchdb database');
        return pouchdb.create('blogdb');
    });
