#!/usr/bin/env node

var filestocopy = [{
    "app/res/icon/android/icon-96-xhdpi.png": 
    "platforms/android/res/drawable/icon.png"
}
/*
 ,
{
    "app/res/screen/android/screen-xhdpi-portrait.png": 
    "platforms/android/res/drawable/splash.png"
}, 
{
    ".tmp/styles/main.css":
        "www/styles/main.css"
}
 */
];

console.log('CUSTOM Build step after_prepare');

var fs = require('fs');
var path = require('path');
 
// no need to configure below
var rootdir = process.argv[2];

var copyArray = function(filestocopy) {
    filestocopy.forEach(function(obj) {
        Object.keys(obj).forEach(function(key) {
            var val = obj[key];
            var srcfile = path.join(rootdir, key);
            var destfile = path.join(rootdir, val);
            console.log("copying "+srcfile+" to "+destfile);
            var destdir = path.dirname(destfile);
            if (fs.existsSync(srcfile) && fs.existsSync(destdir)) {

                //console.log('Copy file', srcfile, destfile);

                fs.createReadStream(srcfile).pipe(
                   fs.createWriteStream(destfile));
            }
        });
    });
};

copyArray(filestocopy);

var modes = ['xh', 'h', 'm', 'l'];
//var screen_modes = ['port', 'land'];
var screen_modes = ['land'];

var addCopy = [];
modes.forEach(function(mode) {
    screen_modes.forEach(function(screen_mode) {
        var dirName = "platforms/android/res/drawable-" + screen_mode + "-" + mode + "dpi";
        var fileName = "platforms/android/res/drawable-" + screen_mode + "-" + mode + "dpi/screen.png";

        if (fs.existsSync(fileName)) {
            console.log('remove file', fileName);
            fs.unlinkSync(fileName);
        }
        if (fs.existsSync(dirName)) {
            fs.rmdirSync(dirName);
        }
    });

    dict = {};
    dict["app/res/screen/android/screen-" + mode + "dpi-portrait.png"] = "platforms/android/res/drawable-port-"+ mode + "dpi/screen.png";
    //dict["app/res/screen/android/screen-" + mode + "dpi-landscape.png"] = "platforms/android/res/drawable-land-" + mode + "dpi/screen.png";

    addCopy.push(dict);
});

copyArray(addCopy);
