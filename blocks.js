
// specify the board size. should be a gloal variable
const boardSize = 15;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// set the timer element
var timerCounting;
var timer_seconds = document.querySelector("#seconds");  // Assuming 'seconds' is an ID
var timer_minutes = document.querySelector("#minutes");  // Assuming 'minutes' is an ID

var timer = function(){
    if (parseFloat(timer_seconds.textContent) >= 59) {
        timer_minutes.textContent = parseFloat(timer_minutes.textContent) + 1;
        timer_seconds.textContent = "00";
    } 
    else {
        // slice(-2): slices the last two characters of the string
        timer_seconds.textContent = ("0" + (parseFloat(timer_seconds.textContent) + 1)).slice(-2);
    }
}

timerCounting = window.setInterval(timer, 1000);

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// print the board based on the board size. 
// attach attributes as needed.
var board = document.getElementById("board");
for(var i = 0; i < boardSize; i++){
    var row = document.createElement("div");
    row.setAttribute("class", "row");
    var inner = "";
    for(var j = 0; j < boardSize; j++){
        let id = "square-" + i + "-" + j;
        let tag = "<div class=\"unit\" id=" + id + " style: \"text-align: center\"></div>";
        inner += tag;
    }
    row.innerHTML = inner;
    board.appendChild(row);
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


// handle the main part of the game: 
var turn = 0; // the number of turns
var whose = ["black", "white"]; // take notes of whose turns it is right now
var squaresClicked = []; // take notes of the current clicked square.(act like a stack)

// define the afterClick function. the function does the following:
// 1. Error checking: check whether the user chose the correct the location.
// 2. Change the user interface(the background) to indicate the selected position.
// 3. Check whether there is a winner or a draw, and respond correspondingly. 

// handleWrong() and clearAlert() are used to display or cancel error message
// when the player chose a wrong position. 
var handleWrong = function(){
    document.getElementById("alert").style.display='flex';
}

var clearAlert = function(){
    document.getElementById("alert").style.display='none';
}

// after the user clicks on a square, afterClick(event) gets triggered. 
var afterClick = function(event){

    // 1. Error checking: check whether the user chose the correct the location.
    const clickedSquare = event.target; 

    if(clickedSquare.style.backgroundColor === "black" || clickedSquare.style.backgroundColor === "white"){
        handleWrong(); // display the error message
        return; 
    }

    squaresClicked.push(clickedSquare); // push on the stack

    // 2. Change the user interface(the background) to indicate the selected position.
    // move on to the next player
    clickedSquare.style.backgroundColor = whose[turn % 2];

    // 3. Check whether there is a winner or a draw. 

    // A draw. 
    if(turn === boardSize * boardSize - 1){
        // stop the timer
        window.clearInterval(timerCounting);
        document.getElementById("timer").style.color = "red";

        document.getElementById("whoseTurn").innerHTML = "<b id=\"draw\">What! A draw! Nice Work!</b>";

        turn++; // be very careful about when to increment the turn variable. 
    }

    else{
        const [_, row, col] = clickedSquare.id.split('-').map(Number);

        // DEBUG purpose
        console.log(row);
        console.log(col);
        console.log(clickedSquare.id);
        // end DEBUG

        // update to the next player
        // neither a draw nor a win
        if(!hasWon(row, col, whose[turn % 2])){ 
            // change the text displayed
            turn++; // we first increment the number of turns by one to determine who's next to place. 
            if(turn % 2 === 0){
                document.getElementById("whoseTurn").innerHTML = "<b>Black's Turn!</b>";
            }
            else{
                document.getElementById("whoseTurn").innerHTML = "<b>White's Turn!</b>";
            }

        }

        // someone has won. 
        else{
            // Stop the timer and change the color. 
            window.clearInterval(timerCounting);
            document.getElementById("timer").style.color = "red";

            // determine who is the winner
            if(turn % 2 === 0){
                document.getElementById("whoseTurn").innerHTML = "<b id=\"winner\">Black is the Winner!</b>";
            }
            else{
                document.getElementById("whoseTurn").innerHTML = "<b id=\"winner\">White is the Winner!</b>";
            }

            var units = document.getElementsByClassName("unit");
            for(var i = 0; i < units.length; i++){
                units[i].removeEventListener("click", afterClick);
            }

            turn++;

        }
    }

    // update the steps displayed
    updateStep();
}

// Add the Event listener to each unit. 
var units = document.getElementsByClassName("unit");

for(var i = 0; i < units.length; i++){
    units[i].addEventListener("click", afterClick);
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Another important step: determine whether a player has won. 
// @row and @col: the coordinates of the square the user has clicked.
var hasWon = function(row, col, who){
    // directional vector
    let deltaRow = [-1, -1, -1, 0];
    let deltaCol = [-1, 0, 1, 1];

    for(var i = 0; i < 4; i++){

        let count = 1;
        let currRow = row + deltaRow[i]; 
        let currCol = col + deltaCol[i]; 
        let currColor = "";
        while(currRow >= 0 && currRow < boardSize && currCol >= 0 && currCol < boardSize){
            currColor = document.getElementById("square-" + currRow + "-" + currCol).style.backgroundColor;
            if(currColor !== who) break;
            else{
                count++;
                currRow += deltaRow[i]; 
                currCol += deltaCol[i];
            }
        }

        currRow = row - deltaRow[i]; 
        currCol = col - deltaCol[i]; 
        currColor = "";

        while(currRow >= 0 && currRow < boardSize && currCol >= 0 && currCol < boardSize){
            currColor = document.getElementById("square-" + currRow + "-" + currCol).style.backgroundColor;
            if(currColor !== who) break;
            else{
                count++;
                currRow -= deltaRow[i]; 
                currCol -= deltaCol[i];
            }
        }
        if(count >= 5) return true; 
    }
    return false; 
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// when a user recalls a step, recall() is triggered.
// the last in element in the stack is popped.


var recall = function(){

    // deal with unexpected behavior
    if(turn === 0){
        return; 
    }

    // update the corresponding variable
    turn--;
    squaresClicked[turn].style.backgroundColor = "burlywood";
    squaresClicked.pop();

    // change the text displayed
    if(turn % 2 === 0){
        document.getElementById("whoseTurn").innerHTML = "<b>Black's Turn!</b>";
    }
    else{
        document.getElementById("whoseTurn").innerHTML = "<b>White's Turn!</b>";
    }

    // if the player wants to recall after he wins or there is a draw

    if(document.getElementById("timer").style.color === "red"){

        document.getElementById("timer").style.color = "black";

        var timer_seconds = document.querySelector("#seconds");  // Assuming 'seconds' is an ID
        var timer_minutes = document.querySelector("#minutes");  // Assuming 'minutes' is an ID

        timerCounting = window.setInterval(timer, 1000);

        var units = document.getElementsByClassName("unit");

        // add the events back
        for(var i = 0; i < units.length; i++){
            units[i].addEventListener("click", afterClick);
        }
    }

    // update the steps displayed
    updateStep();
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


const startOver = function(){
    var units = document.getElementsByClassName("unit");

    // change all the background color to original
    for(var i = 0; i < units.length; i++){
        units[i].style.backgroundColor = "burlywood";
    }

    // change the value of turns
    turn = 0;
    document.getElementById("whoseTurn").innerHTML = "<b>Black's Turn!</b>";

    // change the list
    while(squaresClicked.length != 0){
        squaresClicked.pop();
    }

    // reset the timer
    document.getElementById("minutes").innerHTML = "00";
    document.getElementById("seconds").innerHTML = "00";

    // if someone has won
    if(document.getElementById("timer").style.color === "red"){
        // change the color of timer to normal
        document.getElementById("timer").style.color = "black";

        var units = document.getElementsByClassName("unit");

        // start the timer again
        timerCounting = window.setInterval(timer, 1000);

        // add the events back
        for(var i = 0; i < units.length; i++){
            units[i].addEventListener("click", afterClick);
        }
    }
    // update the steps displayed
    updateStep();

}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


// used to update the steps displayed. 
document.querySelector("#stepCounter h3").innerHTML = "Steps: " + turn; 

function updateStep(){
    document.querySelector("#stepCounter h3").innerHTML = "Steps: " + turn; 
}


