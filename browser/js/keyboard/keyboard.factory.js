// Basic iteration and letter select/get

core.factory("KeyboardFactory", function($state) {
    let rowIndex = 0;
    let letterIndex = 0;
    let startRow = true;
    const alphabet = [
        [1, "A", "B", "C", "D", "E"],
        [2, "F", "G", "H", "I", "J"],
        [3, "K", "L", "M", "N", "O"],
        [4, "P", "Q", "R", "S", "T"],
        [5, "U", "V", "W", "X", "Y"],
        ['Nav', 'home', 'newsfeed', 'corners', 'settings', 'stop']
    ];
    //let word = [];
    let word = "";
    return {
        iterateRow: () => {
            //start row is used to reset row position to 0,0
            if(startRow) {
                startRow = false;
                return alphabet[0][0];
            }
            else {
                if(rowIndex < alphabet.length - 1) {
                    rowIndex++;
                }
                else {
                    rowIndex = 0;
                }
                return alphabet[rowIndex][letterIndex];
            }
        },
        iterateLetter: () => {
            letterIndex++;
            if(letterIndex === alphabet[rowIndex].length) {
                letterIndex = 1;
            }
            return alphabet[rowIndex][letterIndex];
        },
        selectLetter: () => {
            if(alphabet[rowIndex][letterIndex].length > 1) {
                $state.go(alphabet[rowIndex][letterIndex]);
            }
            else {
                word += alphabet[rowIndex][letterIndex];
                rowIndex = 0;
                letterIndex = 0;
                startRow = true;
                return word;
            }
        },
        resetPosition: () => {
            rowIndex = 0;
            letterIndex = 0;
        },
        alphabet: alphabet,
        getCurrentLetter: () => {
            return alphabet[rowIndex][letterIndex];
        }
    }
});
