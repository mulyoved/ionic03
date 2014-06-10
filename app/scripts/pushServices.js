'use strict';

angular.module('Ionic03.PushServices', [])

.service('PushServices', function(ConfigService, $rootScope, $q, $log, $http, $state, DataService) {
    var tagPrefix = 'BLOG:';

    var init = function() {
        if (typeof PushNotification != 'undefined') {
            $log.log('PushServices: DevicePushServices Init!');

            // Incoming message callback
            var handleIncomingPush = function (event) {
                if (event.message) {
                    $log.log('PushServices: Incoming push: ', event);
                    $log.log('PushServices: Incoming push: ', event.message);

                    //todo: select blogid and show this blog
                    var blogid = event.extras.blogid;
                    DataService.selectBlog(blogid, true);
                } else {
                    $log.log('PushServices: No incoming message');
                }
            };

            // Registration callback
            var onRegistration = function (event) {
                if (!event.error) {
                    $log.log('PushServices: Reg Success: ' + event.pushID);
                } else {
                    $log.log(event.error)
                }
            };

            // Register for any urban airship events
            document.addEventListener('urbanairship.registration', onRegistration, false);
            document.addEventListener('urbanairship.push', handleIncomingPush, false);

            // Handle resume
            document.addEventListener('resume', function () {
                if (ConfigService.tempDisableUnlock === 0) {
                    ConfigService.locked = true;
                }
                else {
                    ConfigService.tempDisableUnlock -= 1;
                }
                $log.log('PushServices: Device resume! count:' + ConfigService.tempDisableUnlock +', ' +  new Date().getTime());

                PushNotification.resetBadge();
                PushNotification.getIncoming(handleIncomingPush);

                // Reregister for urbanairship events if they were removed in pause event
                document.addEventListener('urbanairship.registration', onRegistration, false);
                document.addEventListener('urbanairship.push', handleIncomingPush, false);
                $rootScope.$broadcast('Event:device-resume');
            }, false);


            // Handle pause
            document.addEventListener('pause', function () {
                if (ConfigService.tempDisableUnlock === 0) {
                    ConfigService.locked = true;
                    ConfigService.prevState = $state.current;

                    if (ConfigService.locked && ConfigService.unlockCode !== '*skip*' ) {
                        $state.go('unlock2');
                    }

                    if (navigator.splashscreen) navigator.splashscreen.show();
                }
                $log.log('PushServices: Device pause!' + new Date().getTime());

                // Remove urbanairship events.  Important on android to not receive push in the background.
                document.removeEventListener('urbanairship.registration', onRegistration, false);
                document.removeEventListener('urbanairship.push', handleIncomingPush, false);
            }, false);

            // Register for notification types
            PushNotification.registerForNotificationTypes(PushNotification.notificationType.badge |
                PushNotification.notificationType.sound |
                PushNotification.notificationType.alert);

            // Get any incoming push from device ready open
            PushNotification.getIncoming(handleIncomingPush)
        }
    };

    var configure = function() {
        if (typeof PushNotification != 'undefined') {
            PushNotification.setVibrateEnabled(ConfigService.enablePushNotification_Vibration, function () {
                $log.log('Configured setVibrateEnabled', ConfigService.enablePushNotification_Vibration);
            });

            PushNotification.setSoundEnabled(ConfigService.enablePushNotification_Sound, function () {
                $log.log('Configured setSoundEnabled', ConfigService.enablePushNotification_Sound);
            });

            if (ConfigService.enablePushNotification) {
                listenToBlogs([ConfigService.blogId]);
            }
            else {
                listenToBlogs([]);
            }
        }
    };

    // array of blogids,
    var listenToBlogs = function(blogs) {
        var tags = [];
        angular.forEach(blogs, function (blogid) {
            tags.push(tagPrefix+blogid);
        });

        if (typeof PushNotification != 'undefined') {
            PushNotification.setTags(tags, function () {
                PushNotification.getTags(function (obj) {
                    obj.tags.forEach(function (tag) {
                        $log.log("Listen to Blog: " + tag);
                    });
                });
            });
        }
    };

    var updateBlog = function(blogid) {
        var deferred = $q.defer();
        var message = 'New Star';

        var pushInfo = {
            device_types:
                'all',
            audience: {
                tag: tagPrefix + blogid
                /*
                AND: [
                    { tag: tagPrefix + ConfigService.blogId },
                    { NOT:
                        { apid: ConfigService.username}
                    },
                    { NOT:
                        { alias: ConfigService.username}
                    }
                ]
                */
            },
            notification: {
                alert: message,
                android: {
                    extra: {
                        blogid: ''+blogid,
                        user: ConfigService.username
                    }
                }
                /*
                ios: {
                    extra: {
                        blogid: ''+blogid,
                        user: ConfigService.username
                    }
                }
               */
            }
        };

        $log.log('Send PUSH', pushInfo);

        $http.post(ConfigService.pushServiceURL, pushInfo)
            .success(function(answer) {
                deferred.resolve(answer);
                $log.log('Send Push to updateBlog, Answer from server', answer);
            })
            .error(function(err) {
                $log.error('Send Push to updateBlog Success', err);
                deferred.reject(err);
            });

        return deferred.promise;
    };

    var dbg_queryAll = function() {
        PushNotification.isPushEnabled(function(isEnabled) {
            $log.log('PushServices: #pushEnabled' , isEnabled);
        });

        PushNotification.isSoundEnabled(function(isEnabled) {
            $log.log('PushServices: #soundEnabled' ,isEnabled);
        });

        PushNotification.isVibrateEnabled(function(isEnabled) {
            $log.log('PushServices: #vibrateEnabled', isEnabled);
        });

        PushNotification.isQuietTimeEnabled(function(isEnabled) {
            $log.log('PushServices: #quietTimeEnabled', isEnabled);
        });

        PushNotification.isLocationEnabled(function(isEnabled) {
            $log.log('PushServices: #locationEnabled', isEnabled);
        });

        PushNotification.getPushID(function(id) {
            if(id) {
                $log.log('PushServices: Got push ID: ' + id);
            }
        });

        PushNotification.getAlias(function(alias) {
            if(alias) {
                $log.log('PushServices: Got alias: ' + alias);
                //setAlias(alias)
            }
        });

        PushNotification.getTags(function(obj) {
            obj.tags.forEach(function(tag) {
                $log.log('PushServices: Get Tag ',tag);
            })
        });

        PushNotification.getQuietTime(function(obj) {
            $log.log('PushServices: #startHour',obj.startHour);
            $log.log('PushServices: #startMinute',obj.startMinute);
            $log.log('PushServices: #endHour',obj.endHour);
            $log.log('PushServices: #endMinute',obj.endMinute);
        })
    };

    return {
        init: init,
        configure: configure,
        updateBlog: updateBlog,
        dbg_queryAll: dbg_queryAll,
    }
});
