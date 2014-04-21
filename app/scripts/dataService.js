/**
 * Created by Muly on 4/20/2014.
 */
angular.module('Ionic03.services',[])
    .factory('DataService', function() {
        var currentNewText = 'Sample Text';

        var editItem = {
            text: currentNewText,
            save: function(item) {

                console.log('Save: ', item.text);

                items.push( {
                    title: 'new',
                    text: item.text
                });
                item.text = '';
                currentNewText = '';
            }
        };

        var items = [
            { title: 'Reggae', id: 1, text: 'Text' },
            { title: 'Chill v7', id: 2, text: 'Longer much longer text Text', image: 'images/ionic.png'  },
            { title: 'Dubstep', id: 3 },
            { title: 'Indie', id: 4 },
            { title: 'Rap', id: 5 },
            { title: 'Cowbell', id: 6 }
        ];

        return {
            authResult: null,
            isLogin: false,
            getItems: function() {
                return items;
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
            }
        }
    });