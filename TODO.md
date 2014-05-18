1. Post Image, do wee need to format it like blogger?
- Node
    done - Upload image to picasa
    done - Pass token + album to node from app
    done - return URL to App: parse xml and grab media:content url=
    done use gapi token
    done configure album, maybe create if not exists? (node side)
    done configure user name (gapi)
    done format feed URL to read images as needed
    done move the take image to 'add post' screen
    done move upload to sync code
    done if image added that all the post - close the screen - show image URI in post
    done write test to server code
    done icon for unsync posts
    done publish node on Heroku or Blue using https://www.codeship.io/
    Test end to end image publish
    done upgrade Ionic version + document how
    cannot be done - try to post comment using v2 version API

1. done - test post with 2 images from dbtest

done smaller icons
done convert image to http (now http2)
done have href in a

done test 1 image upload ok 2nd not, improve code to upload only the 2nd image

6. Menu
    done Select Blog
    done Switch blog, just use different database?

2. done - Allow to select blog
4. done - Limit Database size
5. done - Load More - Infinit list, when beyond database use blogger directly
    - http://ionicframework.com/docs/api/directive/ionInfiniteScroll/
    - play with load more list
    - see if can add more items dynamicly without saving in database
    - check delete old records from database


7. Alerts - Push notifications

    http://plugreg.com/plugin/phonegap-build/PushPlugin or
    https://github.com/Pushwoosh/phonegap-cordova-push-notifications
    https://github.com/katzer/cordova-plugin-local-notifications
    http://aerogear.org/
    http://forum.ionicframework.com/t/pushnotification-guide-for-android/3756

    Send PUSH
    Subscribe to blog ID
    Send After Sync
    Sync on blog switch
    sync on incomming message
    hold - network state, sync on reconnect
    test end to end push -
        done make new post
        done see notification sent
        done recived
        close app and open from notification
        filter by username
        done set variables of server
        done deploy server

3. Hold - Auto sync, retry and such, delay
     Connection - wait for online event for syncronization
     Periodic Sync - on hold, maybe will get push notification to do this

12. lock screen and retrigger request on power button, app switch
    Connect to events -> maybe use pushservice events
    Improve lock screen

13 test on Android 4.0.3

11. Testing with Protector
    http://gaslight.co/blog/getting-started-with-protractor-and-page-objects-for-angularjs-e2e-testing
    https://egghead.io/lessons/angularjs-getting-started-with-protractor

    done Have login without sync
    done complete delete - dump test reliably
    done sync test
    done add post + sync to blogger
    debug test make sure all is work
    run test on emulator

    other tests
    browse throgh main screen with delay for visual compare
    swipe throgh list

11: Change sort field _id based on updated and not published
done 12: Save Selected blog in local storage
13: make local storage specific for user
12: logic to clean database from old records
12: option to clear database, options from blogger select

14. Deploy in Google Store -> APK
15. Test on device

After 1.0
==========
8. Hidden Images
11. Insta NASA lock screen

Use: Google Closure Compiler
http://www.mircozeiss.com/a-radical-new-approach-to-developing-angularjs-apps/

background & title image to login screen

Use https://github.com/apache/cordova-plugin-network-information/blob/master/doc/index.md