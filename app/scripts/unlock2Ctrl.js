'use strict';
angular.module('Ionic03.Unlock2Ctrl', [])

.controller('Unlock2Ctrl', function ($scope, $timeout, ConfigService, localStorageService, $log, $state) {
    var isClickMode = true;
    var nextScreen = ConfigService.mainScreen;
    console.log('UnlockCtrl');
    $scope.dragIds = '';
    $scope.text = 'Welcome';

    var isBackDoorMode = false;

    var isdrawing = false;
    var from = "";
    var to = "";
    var startbutton = 0;
    var inputbox_value = '';

    var gridsize = false;
    var buttons = []; // array to hold the 9 buttons
    var lines = []; // array to hold the connecting lines

    var generate = function(){
        console.log('generate');
        var pel = document.getElementById('unlock-area');

        // main container
        var patternTag = document.createElement("div");
        patternTag.className = "patternlockcontainer";

        // horizontal lines
        var linesTag = document.createElement("div");
        linesTag.className = "patternlocklineshorizontalcontainer";
        var elid=["12","23","45","56","78","89"];
        for (var i=0;i<6;i++){
            var lineTag = document.createElement("div");
            lineTag.className = "patternlocklinehorizontal";
            lineTag.id = "line" + elid[i];
            //lineTag.style.visibility = 'visible';
            lines.push(lineTag);
            linesTag.appendChild(lineTag);
        }
        patternTag.appendChild(linesTag);

        // vertical lines
        linesTag = document.createElement("div");
        linesTag.className = "patternlocklinesverticalcontainer";
        elid=["14","25","36","47","58","69"];
        for (var i=0;i<6;i++){
            var lineTag = document.createElement("div");
            lineTag.className = "patternlocklinevertical";
            lineTag.id = "line" + elid[i];
            lines.push(lineTag);

            //lineTag.style.visibility = 'visible';
            linesTag.appendChild(lineTag);
        }
        patternTag.appendChild(linesTag);

        // diagonal lines
        linesTag = document.createElement("div");
        linesTag.className = "patternlocklinesdiagonalcontainer";
        elid=["24","35","57","68"];
        for (var i=0;i<4;i++){
            var lineTag = document.createElement("div");
            lineTag.className = "patternlocklinediagonalforward";
            lineTag.id = "line" + elid[i];

            //lineTag.style.visibility = 'visible';
            lines.push(lineTag);
            linesTag.appendChild(lineTag);
        }
        patternTag.appendChild(linesTag);

        linesTag = document.createElement("div");
        elid=["15","26","48","59"];
        linesTag.className = "patternlocklinesdiagonalcontainer";
        for (var i=0;i<4;i++){
            var lineTag = document.createElement("div");
            lineTag.className = "patternlocklinediagonalbackwards";
            lineTag.id = "line" + elid[i];
            //lineTag.style.visibility = 'visible';
            lines.push(lineTag);
            linesTag.appendChild(lineTag);
        }
        patternTag.appendChild(linesTag);


        // the 9 buttons
        var buttonsTag = document.createElement("div");
        buttonsTag.className = "patternlockbuttoncontainer";
        for (var i=1;i<10;i++){
            var buttonTag = document.createElement("div");
            buttonTag.className = "patternlockbutton";
            buttonTag.id = "patternlockbutton" + i;
            buttons.push(buttonTag);
            buttonsTag.appendChild(buttonTag);
        }
        patternTag.appendChild(buttonsTag);

        // stupid preloader for the hover images
        var imgTag = document.createElement("div");
        imgTag.style.display = 'none';
        imgTag.className = "patternlockbutton touched";
        patternTag.appendChild(imgTag);

        imgTag = document.createElement("div");
        imgTag.style.display = 'none';
        imgTag.className = "patternlockbutton touched multiple";
        patternTag.appendChild(imgTag);


        pel.appendChild(patternTag);
    };

    var clear = function(){
        var i,len;
        for (i= 0, len=buttons.length; i<len; i++){
            buttons[i].className = "patternlockbutton";
        }
        for (i= 0, len=lines.length; i<len; i++){
            lines[i].style.visibility = 'hidden';
        }
        inputbox_value = "";
    };


    var buttonTouchStart = function(b){
        console.log('buttonTouchStart', b);
        isdrawing = true;
        if (inputbox_value != "") {
            clear();
        }

        from = "";
        to = b.id.split("patternlockbutton").join("");

        if (to.length === 1 && to !== '0') {
            b.className = "patternlockbutton touched";
            inputbox_value = to;
            startbutton = to;
        }
        return false;
    };

    var buttonTouchOver = function(b){
        if (isdrawing){
            var thisbutton = b.id.split("patternlockbutton").join("");
            $log.log('thisbutton', thisbutton);

            if(thisbutton.length == 1 && thisbutton != 0 && thisbutton != to) { // touching the same button twice in a row is not allowed (should it ?)

                //console.log('buttonTouchOver', b);
                var cn = b.className;
                if(cn.indexOf('touched')<0){
                    b.className = "patternlockbutton touched"
                }else{
                    b.className = "patternlockbutton touched multiple"
                }

                from = to;
                to = thisbutton;

                // display line between 2 buttons
                var thisline = document.getElementById("line" + from + to);
                if (to <  from) {
                    thisline = document.getElementById("line" + to + from);
                }
                if (thisline) {
                    thisline.style.visibility = 'visible';

                    //update input value
                    inputbox_value += to;
                    console.log('buttonTouchOver', from, to, inputbox_value);
                }
            }
        }
        return(false)
    };

    var buttonTouchEnd = function(){
        console.log('buttonTouchEnd', inputbox_value);
        if (isdrawing){
            isdrawing = false;
            gridsize = false; // set to false so on the next touch it's recalculated as the layout could have been changed
            clear();
        }
        return(false)
    };


    var unlockCode = localStorageService.get('unlock_code');
    $log.info('unlockCode', unlockCode);
    var state = 'unlock';
    var temp_unlockCode = '';
    if (!unlockCode) {
        state = 'set';
    }

    var updateState = function () {
        if (state === 'unlock') {
            $scope.text = 'Welcome';
        }
        else if (state === 'set') {
            $scope.text = 'Choose Unlock Code';
        }
        if (state === 'confirm') {
            $scope.text = 'Confirm Unlock Code';
        }
    };

        function unlock() {
            var _nextScreen = nextScreen;
            if (ConfigService.prevState) {
                _nextScreen = ConfigService.prevState.name;
            }

            $log.log('Unlock code is correct, go to', _nextScreen);
            ConfigService.locked = false;
            $state.go(_nextScreen);
        }

        var checkUnlockCode = function (code) {
        $log.info('checkUnlockCode', code);
        if (state === 'unlock') {
            if (unlockCode === code) {
                unlock();
            }
            else if (code === '1251') {
                //reset code
                if (isBackDoorMode) {
                    ConfigService.locked = false;
                    $log.log('Backdor activated, go to dbtest');
                    $state.go('dbtest');
                }
                else {
                    $log.log('Backdor activated, go to dbtest, clear unlock code');
                    localStorageService.remove('unlock_code');
                    ConfigService.unlockCode = '';
                    unlockCode = null;
                    state = 'set';
                    $log.info('Reset lock code');
                    updateState();
                }
            }
            else {
                $log.info('Code does not match, ask again', unlockCode, code);
            }
            //else do nothing, keep ask for code
        }
        else if (state === 'set') {
            temp_unlockCode = code;
            state = 'confirm';
            $log.info('Ask to confirm code', code);
            updateState();
        }
        else if (state === 'confirm') {
            if (temp_unlockCode === code) {
                //save code
                localStorageService.add('unlock_code', code);
                ConfigService.unlockCode = code;
                $log.info('Save new unlock code', code);
                ConfigService.locked = false;
                $state.go(nextScreen);
            }
            else {
                state = 'set';
                $scope.text = 'Code not match, choose';
                $log.info('Code not match, get a new code', temp_unlockCode, code);
            }
        }
    };

    updateState();
    generate();

    //Calculate the unlock path
    $scope.onDragOver = function (e) {
        if (e.type === 'tap') {
            console.log('Tap: ', e, inputbox_value);
            if (inputbox_value.length == 0) {
                buttonTouchStart(e.target);
            }
            else {
                buttonTouchOver(e.target);
            }

            if (inputbox_value.length == 4) {
                checkUnlockCode(inputbox_value);
                console.log('Unlock Pattern', inputbox_value);
                buttonTouchEnd();
            }
        }
        else if (e.type === 'dragend') {
            checkUnlockCode(inputbox_value);
            console.log('Unlock Pattern', inputbox_value);
            buttonTouchEnd();
        }
        else {
            var id = e.target.id;
            if (id) {
                if (e.type === 'dragstart') {
                    //$scope.dragIds = '';
                    //console.log('Drawstart ', e);

                    if (e.srcElement) {
                        id = e.srcElement.id;
                        if (id.length == 0 && e.srcElement.firstChild) {
                            id = e.srcElement.firstChild.id;
                        }
                    }

                    buttonTouchStart(e.target);
                }

                if (id.length > 0) {
                    buttonTouchOver(e.target);


                    /*
                     if (!$scope.dragIds || id != $scope.dragIds.slice(-1)) {
                     $scope.dragIds += id;
                     //console.log('Drag Sequence',e);
                     console.log('Drag Sequence: ', $scope.dragIds);
                     }
                     */
                }
            }
        }
    };

    $scope.backdoor = function() {
        if (state === 'set') {
            $log.log('Backdor', inputbox_value);
            unlock();
            //isBackDoorMode = true;
        }
    };

});
