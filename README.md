#Resources

##Ionic Commands
[Generator](https://github.com/diegonetto/generator-ionic)

##Update Ionic

[Generator](https://github.com/diegonetto/generator-ionic)


 `npm install -g generator-ionic`

 `npm update -g cordova`
 `npm update -g plugman`

`yo ionic`
Select Y for overwriting your Gruntfile.js and bower.json to stay up-to-date with the latest workflow
Compare them to make sure no packages was removed
Select Compass = Y

npm update
bower update

##Google Sign In For Cordova

[Article](http://phonegap-tips.com/articles/google-api-oauth-with-phonegaps-inappbrowser.html)

[Github](https://github.com/mdellanoce/google-api-oauth-phonegap)

![Create Client ID](/docs/GoogleSign_CreateClientID.png)

![Get This Error](/docs/GoogleSign_Error.png)

Q: How to solve?

A: Install the InAppBrowser plugin

[Get Log From Android Emulator](file:///D:/Mobile/Android/android-sdk/docs/tools/debugging/debugging-log.html)

`cordova plugins`

To install the InAppBrowser plugin (if necessary)...

`cordova plugin add org.apache.cordova.inappbrowser`


Q: How to reset the emulator

A: Android (from cmd not bash) delete and recreate

Q: Work with grunt

A:

##Grunt Process

`grunt cordova`

`grunt emulate:android`

`adb logcat CordovaLog:D *:S`
`adb logcat AndroidRuntime:E dalvikvm:S GCM:D memtrack:S android.os.Debug:S eglCodecCommon:S jdwp:S linker:E SoundPool:S AudioService:S IInputConnectionWrapper:E WindowManager:E`


adb shell pm uninstall -k com.example.Ionic03
`grunt copy:all && grunt emulate:android`





[File upload Example](http://coenraets.org/blog/2013/09/how-to-upload-pictures-from-a-phonegap-application-to-node-js-and-other-servers-2/)

Add Plugins

`cordova plugin add org.apache.cordova.inappbrowser`

`cordova plugin add org.apache.cordova.device`

`cordova plugin add org.apache.cordova.console`

`cordova plugin add org.apache.cordova.file`

`cordova plugin add org.apache.cordova.file-transfer`

`cordova plugin add org.apache.cordova.camera`

Instructions https://github.com/urbanairship/phonegap-ua-push
https://github.com/phonegap-build/PushPlugin

`cordova plugin add https://github.com/urbanairship/phonegap-ua-push.git`

To debug use logcat full
Must use Google API and not android https://support.urbanairship.com/customer/portal/articles/1266113-pushing-to-an-android-emulator
https://software.intel.com/en-us/blogs/2014/03/06/now-available-android-sdk-x86-system-image-with-google-apis
Add to d:/js/Ionic03/config.xml

	<!-- Urban Airship app credentials -->
	<preference name="com.urbanairship.production_app_key" value="PRODUCTION_APP_KEY" />
	<preference name="com.urbanairship.production_app_secret" value="PRODUCTION_APP_SECRET" />
	<preference name="com.urbanairship.development_app_key" value="dvjEEpPWSDumYs1cbqbIlw" />
	<preference name="com.urbanairship.development_app_secret" value="saLsLNGmRoC4oGItaQ5Mpw" />

	<!-- If the app is in production or not -->
	<preference name="com.urbanairship.in_production" value="false" />

	<!-- Enable push when the application launches (instead of waiting for enablePush js call).  Defaults to false -->
	<preference name="com.urbanairship.enable_push_onlaunch" value="true" />

	<!-- Only required for Android. -->
	<preference name="com.urbanairship.gcm_sender" value="AIzaSyA78RO9-B7qEr-WXJULOq3u-n4C7RS9wz4" />




if fail create the folders manually

$ cordova plugins ls
[ 'org.apache.cordova.camera',
  'org.apache.cordova.console',
  'org.apache.cordova.device',
  'org.apache.cordova.file',
  'org.apache.cordova.file-transfer',
  'org.apache.cordova.inappbrowser' ]

`cordova build`

`cordova serve android`

`cordova emulate android`

I fixed it ????

line 1062

            var message = messages.substr(spaceIdx + 1, msgLen);
            if (msgLen) {
                messages = messages.slice(spaceIdx + msgLen + 1);
                processMessage(message);
            }
            else {
                messages = '';
            }

            if (messages) {
                messagesFromNative[0] = messages;
            } else {
                messagesFromNative.shift();
            }
`
#Ripple
Work Great!

`ripple emulate --path platforms/android/assets/www`

#NPM Tricks

`npm uninstall express`

`npm view express versions`

#Mongodb

`"D:\Program Files\MongoDB 2.6 Standard\bin\mongod" --dbpath D:\Mobile\data\db`

`npm install express@3.5.2`

#Google API

`https://developers.google.com/oauthplayground/`

#Debug
`about:inspect`

#Test

protractor test/spec-e2e.conf.js --suite browse


##elementexplorer:
node C:/Users/Muly/AppData/Roaming/npm/node_modules/protractor/bin/elementexplorer.js http://localhost:9000/#/app/bloglist

http://attackofzach.com/setting-up-a-project-using-karma-with-mocha-and-chai/

router problems https://github.com/angular-ui/ui-router/issues/212

e2e protractor test requiring oauth authentication
http://stackoverflow.com/questions/20959748/e2e-protractor-test-requiring-oauth-authentication

Hands on Protractor, E2E Testing for AngularJS
http://blog.liftoffllc.in/2013/12/hands-on-protractor-e2e-testing-for.html

`protractor test/spec-e2e.conf.js`

export ANDROID_HOME=/D/Mobile/Android/android-sdk
appium

protractor test/android-e2e.conf.js


 element(by.repeater('item in items')).findElement(by.binding('item.name'))

 Publish
 -------

 https://play.google.com/apps/publish/signup/