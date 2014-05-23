'use strict';

angular.module('Ionic03.BlogListSync', [])

.service('BlogListSync', function($rootScope, $q, localStorageService, $log,
                          GoogleApp, GoogleApi, GAPI, Blogger) {

    var blogListSync = {
        clearStorage: function() {
            localStorageService.remove('blogs');
        },

        loadBlogList: function() {
            return Blogger.listBlogsByUser('self')
            .then(function(answer) {
                $log.log('loadBlogList', answer);
                //console.table(answer.items);

                var blogs = [];
                angular.forEach(answer.items, function (item) {
                    blogs.push( {
                        id: item.id,
                        kind: item.kind,
                        name: item.name,
                        description: item.description
                    });
                });

                localStorageService.add('blogs', blogs);
                //$rootScope.$broadcast('event:DataSync:BlogListChange'); // not needed
                return blogs;
            }).catch(function(err) {
                $log.error('loadBlogList Error', err);
            });
        },

        getBlogList: function() {
            var deferred = $q.defer(); // not needed but for API consistancy
            var blogs = localStorageService.get('blogs');
            if (blogs) {
                $log.log('Got Blog list from storage');
                deferred.resolve(blogs);
            }
            else {
                $log.log('Blog list not in storage, load from google');
                blogListSync.loadBlogList()
                .then(function(blogs) {
                    $log.log('Got from google', blogs);
                    deferred.resolve(blogs);
                }).catch(function(err) {
                    $log.error('getBlogList Error', err);
                        deferred.reject(err);
                });
            }
            return deferred.promise;
        }
    };
    return blogListSync;
});
