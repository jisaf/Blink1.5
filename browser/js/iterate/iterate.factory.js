//factory used to determine what function to iterate

core.factory('IterateFactory', function($rootScope, TimerFactory, KeyboardFactory, TrackingFactory, SettingsFactory, PositionFactory, SidebarFactory) {
    var iterateObj = {};
    var count = 0;
    var debounce = true;
    var selectingLetter = false;
    var selectingOption = false;
    iterateObj.scopeValue = [];
    iterateObj.linkValue;
    iterateObj.settingsValue;
    iterateObj.selectedLetter;

    // Iterator functions to update scope values
    var keyboardIterator = function() {
        if (debounce && !selectingLetter) {
            let arr = [KeyboardFactory.iterateRow(), iterateObj.scopeValue[1]]
            angular.copy(arr, iterateObj.scopeValue);
        } else if (debounce && selectingLetter) {
            iterateObj.scopeValue[1] = KeyboardFactory.iterateLetter();
        }
    }

    var linkIterator = function() {
        iterateObj.linkValue = SidebarFactory.moveSelected();
    }

    var settingsIterator = function() {
        console.log("RUNNING ITERATOR")
            // Iterate tabs
        if (!selectingOption) {
            console.log("moving tabs")
            iterateObj.scopeValue[0] = SettingsFactory.moveSelected();
            iterateObj.scopeValue[1] = 0;
        }
        // Iterate options
        else if (debounce && selectingOption) {
            // else {
            console.log("tab value is", iterateObj.scopeValue[0])
            iterateObj.scopeValue[1] = SettingsFactory.iterateOption(iterateObj.scopeValue[0]);
            console.log("iterating through options, currently at", iterateObj.scopeValue[1])
        }
    }

    // Zero functions
    var browZero = function(page) {
        var converge = TrackingFactory.convergence();
        if (converge < 300) {
            count++;
            if (count > 20) {
                TimerFactory.calibrationFinished();
                iterateObj.iterate(page);
            }
        } else {
            count = 0;
        }
    }

    // Position Functions for keyboard/sidebar use
    function analyzePositions(cb) {
        var positions = TrackingFactory.getPositions();
        if (positions) {
            if (PositionFactory.browCompare(positions)) {
                cb();
            }
        }
    }

    // Callback functions for analyzePositions
    function keyboardCallback() {
        if (debounce) {
            debounce = false;
            selectLetter();
        }
    }

    function navCallback() {
        TimerFactory.clearTracking();
        iterateObj.scopeValue[0] = null;
        TimerFactory.clearAll();
        SidebarFactory.changeState();
    }

    function settingsCallback() {
        console.log("SETTINGS CALLBACK")
        if (!selectingOption) {
            SettingsFactory.changeState();
            if (debounce) {
                debounce = false;
                selectUserOption();
            }
            selectingOption = true;
        } else {
            if (debounce) {
                debounce = false;
                SettingsFactory.selectOption();
                console.log("This is where you run the ng-clicks")
                setTimeout(function() {
                    selectingOption = false;
                    debounce = true;
                }, 750)
            }
        }
    }

    // Row/Column selector for keyboard callback
    function selectLetter() {
        iterateObj.selectedLetter = iterateObj.scopeValue[1];
        //check to make sure the selected letter is not undefined
        if (selectingLetter && iterateObj.selectedLetter) {
            iterateObj.word = KeyboardFactory.selectLetter();
            iterateObj.scopeValue[1] = "";
            selectingLetter = false;
        } else {
            selectingLetter = true;
        }
        setTimeout(function() {
            iterateObj.selectedLetter = '';
            debounce = true;
        }, 750)
    }

    // Tab selector for settings callback
    function selectUserOption() {
        if (selectingOption) {
            iterateObj.scopeValue[1] = SettingsFactory.iterateOption(iterateObj.scopeValue[0]);
        }
        // Options selector for settings callback
        else {
            selectingOption = true;
        }
        setTimeout(function() {
            debounce = true;
        }, 750)
    }

    iterateObj.zero = function(page) {
        TimerFactory.calibrate(browZero, 50, page);
    }

    iterateObj.iterate = function(page) {
        var positions = TrackingFactory.getPositions();
        switch (page) {
            case 'nav':
                PositionFactory.setBrowZero(positions);
                TimerFactory.startReading(analyzePositions, 50, navCallback);
                TimerFactory.moveCursor(linkIterator, 1000);
                break;
            case 'scroll':
                PositionFactory.setBrowZero(positions);
                TimerFactory.startReading(analyzePositions, 50, keyboardCallback);
                TimerFactory.moveCursor(keyboardIterator, 750);
                break;
            case 'settings':
                PositionFactory.setBrowZero(positions);
                TimerFactory.startReading(analyzePositions, 50, settingsCallback);
                TimerFactory.moveCursor(settingsIterator, 1500);
                break;
        }
    }

    return iterateObj;
});
