#Resources

##Ionic Commands
[Generator](https://github.com/diegonetto/generator-ionic)

##Update Ionic

[Generator](https://github.com/diegonetto/generator-ionic)

 `npm install -g generator-ionic`

Select Y for overwriting your Gruntfile.js and bower.json to stay up-to-date with the latest workflow
Compare them to make sure no packages was removed
Select Compass = Y

##Grunt Process

`grunt copy:all && grunt emulate:android`



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


Get log from device

`adb logcat CordovaLog:D *:S`

Q: How to reset the emulator

A: Android (from cmd not bash) delete and recreate

Q: Work with grunt

A:

`grunt cordova`

`grunt emulate:android`

`adb logcat CordovaLog:D *:S`

[File upload Example](http://coenraets.org/blog/2013/09/how-to-upload-pictures-from-a-phonegap-application-to-node-js-and-other-servers-2/)

Add Plugins

`cordova plugin add org.apache.cordova.device`

`cordova plugin add org.apache.cordova.console`

`cordova plugin add org.apache.cordova.file`

`cordova plugin add org.apache.cordova.file-transfer`

`cordova plugin add org.apache.cordova.camera`

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