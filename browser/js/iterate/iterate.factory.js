core.factory('IterateFactory', function($rootScope, CornersFactory, TimerFactory, PopupFactory, KeyboardFactory, TrackingFactory, SettingsFactory, PositionFactory, SidebarFactory) {
    var iterateObj = {};
    var count = 0;
    var debounce = true;
    var selectingLetter = false;
    var selectingOption = false;
    iterateObj.scopeValue = [];
    iterateObj.linkValue;
    iterateObj.settingsValue;
    iterateObj.selectedLetter;

    let debounceFn = (time, fn) => {
        let t = time || 750
        setTimeout(() => {
            debounce = true
            if (fn) { fn() };
        }, t)
    }

    const translateDelay = {
            0: 1400,
            1: 1200,
            2: 950,
            3: 750,
            4: 600,
            5: 500
        }
        // Set default delay
    let delay = translateDelay[3];

    // If a user is logged in, use their delay preferences
    if ($rootScope.user) {
        delay = translateDelay[$rootScope.user.keyboardSpeed]
    }

    ////////////////////////////////////////////////////////////
    //////////// Iterator Functions sent to Timer
    ////////////////////////////////////////////////////////////

    // Iterator functions to update scope values
    var keyboardIterator = function() {
        if (debounce && !selectingLetter) {
            // Iterate Rows
            let arr = KeyboardFactory.iterateRow();
            angular.copy(arr, iterateObj.scopeValue);
            if (iterateObj.scopeValue[0] === 0) {
                //TimerFactory.pauseIteration(500);
            }
        } else if (debounce && selectingLetter) {
            // Iterate Letters
            iterateObj.scopeValue[1] = KeyboardFactory.iterateLetter();
            if (iterateObj.scopeValue[1] === 0) {
                //TimerFactory.pauseIteration(500);
            }
        }
    }

    var popupIterator = function() {
        if (debounce && !selectingLetter) {
            let arr = PopupFactory.iterateRow()
            angular.copy(arr, iterateObj.scopeValue);
            if (iterateObj.scopeValue[0] === 0) {
                TimerFactory.pauseIteration(500);
            }
        } else if (debounce && selectingLetter) {
            iterateObj.scopeValue[1] = PopupFactory.iterateLetter();
            if (iterateObj.scopeValue[1] === 0) {
                TimerFactory.pauseIteration(500);
            }
        }
    }

    // Iterate functions to update values on scope
    var linkIterator = function() {
        iterateObj.linkValue = SidebarFactory.moveSelected();
    }

    var settingsIterator = function() {
        // Iterate tabs
        if (!selectingOption) {
            iterateObj.scopeValue[0] = SettingsFactory.moveSelected();
            iterateObj.scopeValue[1] = 0;
        }
        // Iterate options
        else if (debounce && selectingOption) {
            iterateObj.scopeValue[1] = SettingsFactory.iterateOption(iterateObj.scopeValue[0]);
        }
    }


    ////////////////////////////////////////////////////////////
    //////////// Analyze functions that accept callbacks
    ////////////////////////////////////////////////////////////

    let lastBlinkTime;
    let blinkDt;

    function analyzeEyePositions(cb) {
        var positions = TrackingFactory.getPositions();
        if (positions && PositionFactory.blinkCompare(positions)) {
            blinkDt = Date.now() - lastBlinkTime;
            console.log("Caught a blink. BlinkDT is", blinkDt)
            // On double blink
            if ((blinkDt < 800) && (blinkDt > 100)) {
                console.log("Undo!")
            }
            // Two blinks
            else {
                console.log("Single blink")
                cb();
            }
            console.log("resetting last blink time")
            lastBlinkTime = Date.now();
        }
    }

    function analyzeBrowPositions(cb) {
        var positions = TrackingFactory.getPositions();
        if (positions) {
            if (PositionFactory.browCompare(positions)) {
                cb();
            }
        }
    }

    function readPositions() {
        let positions = TrackingFactory.getPositions();
        if (positions) {
            let eyeX = positions[27][0] + positions[32][0]
            let eyeY = positions[27][1] + positions[32][1]
            CornersFactory.eyePosition(eyeX, eyeY); // if the eyes go more than the "threshold" away from center then go to the corner
        }
    }

    ////////////////////////////////////////////////////////////
    //////////// Callback functions to send to analyzers
    ////////////////////////////////////////////////////////////

    // Callback functions for analyzePositions
    function keyboardCallback() {
        if (debounce) {
            debounce = false;
            selectLetter();
        }
    }

    function popupCallback() {
        if (debounce) {
            debounce = false;
            popupSelect();
        }
    }

    function navCallback() {
        TimerFactory.clearTracking();
        iterateObj.linkValue = null;
        goToPage();
    }

    let cornersCallback = () => {
        if (debounce) {
            debounce = false;
            CornersFactory.goToBox()
            debounceFn()
        }
    }

    ////////////////////////////////////////////////////////////
    /////////// Candidates for an Action Factory?
    ////////////////////////////////////////////////////////////

    // Position Functions
    function goToPage() {
        TimerFactory.clearAll();
        SidebarFactory.changeState();
    }

    function settingsCallback() {
        // Choosing a tab
        if (!selectingOption) {
            let navbarCheck = SettingsFactory.changeState();
            if (!navbarCheck) { // Still in settings state
                if (debounce) {
                    debounce = false;
                    selectUserOption();
                }
                selectingOption = true;
            } else { // Moving to Nav
                TimerFactory.clearTracking();
                iterateObj.iterate('nav');
            }
        }
        // Choosing a user option
        else {
            if (debounce) {
                debounce = false;
                SettingsFactory.selectOption();
                setTimeout(function() {
                    selectingOption = false;
                    debounce = true;
                }, 750)
            }
        }
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

    function popupSelect() {
        iterateObj.selectedLetter = iterateObj.scopeValue[1];
        //check to make sure the selected letter is not undefined
        if (selectingLetter) {
            iterateObj.word = PopupFactory.selectLetter();
            iterateObj.scopeValue[1] = null;
            selectingLetter = false;
        } else {
            iterateObj.scopeValue[1] = PopupFactory.iterateLetter();
            selectingLetter = true;
        }
        debounceFn(null, function() {
            iterateObj.selectedLetter = null;
        })
    }

    // Row/Column selector for keyboard callback
    function selectLetter() {
        if (selectingLetter) {
            iterateObj.selectedLetter = KeyboardFactory.getCurrentLetter();
            iterateObj.word = KeyboardFactory.selectLetter();
            selectingLetter = false;
        } else {
            iterateObj.scopeValue[1] = KeyboardFactory.iterateLetter();
            selectingLetter = true;
        }
        debounceFn(null, function() {
            iterateObj.selectedLetter = null;
        })
    }

    ////////////////////////////////////////////////////////////
    /////////// Zeroing functions
    ////////////////////////////////////////////////////////////

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

    iterateObj.zero = function(page) {
        TimerFactory.calibrate(browZero, 50, page);
    }

    iterateObj.iterate = function(page) { // fires once we have calibration (from browZero())
        var positions = TrackingFactory.getPositions();
        switch (page) {
            case 'nav':
                PositionFactory.setBrowZero(positions);
                TimerFactory.startReading(analyzeBrowPositions, 50, navCallback);
                TimerFactory.moveCursor(linkIterator, 1000);
                break;
            case 'type':
                // PositionFactory.setBrowZero(positions);
                lastBlinkTime = Date.now();
                PositionFactory.setBlinkZero(positions);
                TimerFactory.startReading(analyzeEyePositions, 50, keyboardCallback);
                // TimerFactory.startReading(analyzeBrowPositions, 50, keyboardCallback);
                TimerFactory.moveCursor(keyboardIterator, 750);
                break;
            case 'corners':
                PositionFactory.setBrowZero(positions);
                TimerFactory.startReading(analyzeBrowPositions, 50, cornersCallback)
                TimerFactory.startReading(readPositions, 50)
                break;
            case 'popup':
                PositionFactory.setBrowZero(positions);
                TimerFactory.startReading(analyzeBrowPositions, 50, popupCallback);
                TimerFactory.moveCursor(popupIterator, delay);
                break;
            case 'settings':
                PositionFactory.setBrowZero(positions);
                TimerFactory.startReading(analyzeBrowPositions, 50, settingsCallback);
                TimerFactory.moveCursor(settingsIterator, 1500);
                break;
        }
    }
    return iterateObj;
});
