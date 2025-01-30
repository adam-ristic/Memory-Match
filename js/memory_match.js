window.addEventListener("load", event => {
    document.getElementById("easyMode").click(); // On window load, click the button
    document.getElementById("submit").style.display = "none"; // Hide the submit button
    document.getElementById("round").innerHTML = curRound; // Set the round count accordingly
    drawStartGrid(); // Draw the main grid
})

// Create variables
var countdown;
var wait;
var curRound = 0;
var time = 3;
var targetArray = [];
var patternInterval;
let playerResponse = [];

// Set up shape properties
const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
circle.setAttribute("width", "100");
circle.setAttribute("height", "100");
circle.setAttribute("cx", "50");
circle.setAttribute("cy", "50");
circle.setAttribute("r", "45");
circle.setAttribute("stroke-width", "3");
circle.setAttribute("transform-origin", "50 50");

// Function to get the difficulty for the game and add/remove classes from buttons
function getDifficulty(clickedId)
{
    if(clickedId == "easyMode")
    {
        wait = 1500;
        document.getElementById("easyMode").classList.add('active');
        document.getElementById("mediumMode").classList.remove('active');
        document.getElementById("hardMode").classList.remove('active');
    }
    else if(clickedId == "mediumMode")
    {
        wait = 1000;
        document.getElementById("mediumMode").classList.add('active');
        document.getElementById("easyMode").classList.remove('active');
        document.getElementById("hardMode").classList.remove('active');
    }
    else
    {
        wait = 500;
        document.getElementById("hardMode").classList.add('active');
        document.getElementById("mediumMode").classList.remove('active');
        document.getElementById("easyMode").classList.remove('active');
    }
    resetGame();
}


// Draws the main 3x3 grid
function drawStartGrid()
{
    // Set the fill and stroke colours
    circle.setAttribute("fill", "white");
    circle.setAttribute("stroke", "black");

    // Get all <svg> tags with the "identifier" class
    let gridCells = document.querySelectorAll(".identifier");

    // Append the circles to the svgs
    for(let i = 0; i < gridCells.length; i++)
    {
        // Give them a unique ID
        circle.setAttribute("id", "circle"+i);

        // Append them and add a "click" listener
        gridCells[i].appendChild(circle.cloneNode(true)).addEventListener("click", getPlayerResponse);
    }

    // Get all circles so we can add "mouseover" and "mouseleave" listeners to change colours.
    let circles = document.getElementsByTagNameNS("http://www.w3.org/2000/svg", "circle");

    for(let i = 0; i < circles.length; i++)
    {
        circles[i].addEventListener("mouseover", function(){this.setAttribute("fill", "lemonchiffon");});
        circles[i].addEventListener("mouseleave", function(){this.setAttribute("fill", "white");});
        circles[i].classList.add("shadow-lg");
    }
}

// Remove the starting grid
function removeStartGrid()
{
    // Get all <svg> tags with the "identifier" class
    let gridCells = document.querySelectorAll(".identifier");

    // Remove the first child (the circle) from each SVG.
    for(let i = 0; i < gridCells.length; i++)
    {
        gridCells[i].removeChild(gridCells[i].firstChild);
    }
}

// Generate the pattern to determine which circles should be pressed
function generatePattern()
{
    // For every number until the current round:
    for(let i = 0; i < curRound; i++)
    {
        if(targetArray[i] != null) // If there's already something at index i:
        {
            // Do nothing
        }
        else
        {
            // Put a random number
            targetArray[i] = randomNum();
        }
    }
    drawPattern();
}

// Draw the pattern
async function drawPattern()
{
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // For each circle to be drawn:
    for(let i = 0; i < targetArray.length; i++)
    {
        // Draw it and wait
        drawTargetCircle(targetArray[i]);
        await delay(wait / 2);

        // Remove it and wait
        removeTargetCircle(targetArray[i]);
        await delay(wait / 2);
    }

    drawStartGrid();   

    document.getElementById("submit").style.display = "inline"; // Show the submit button
}

// Draw the target circle
function drawTargetCircle(patternIndex)
{
    // Set the fill and stroke colours
    circle.setAttribute("fill", "green");
    circle.setAttribute("stroke", "black");

    // Get all <svg> tags with the "identifier" class
    let gridCells = document.querySelectorAll(".identifier");

    gridCells[patternIndex].appendChild(circle.cloneNode(true));
}

function removeTargetCircle(patternIndex)
{
    // Get all <svg> tags with the "identifier" class
    let gridCells = document.querySelectorAll(".identifier");

    gridCells[patternIndex].removeChild(gridCells[patternIndex].firstChild);
}

// Get the player's response and push its ID to the playerResponse array
function getPlayerResponse()
{
    // Push the ID
    playerResponse.push(this.id);

    // Apply a scale animation and change the colour
    this.setAttribute("transform", "scale(0.5)");
    this.setAttribute("fill", " yellow");
    setTimeout(() => {this.setAttribute("transform", "scale(1)");}, 100);
    setTimeout(() => {this.setAttribute("fill", "white");}, 200);
}

// Compare playerResponse and targetArray to see if they made the correct answer.
function compareResponse()
{
    let isGoodAnswer = false;

    // Check to see if arrays are of the same length
    if(playerResponse.length != targetArray.length) // If the lengths are NOT the same:
    {
        isGoodAnswer = false; // It's a bad answer
    }
    else
    {
        // Check to see if playerResponse is in the same order as targetArray
        for(let i = 0; i < playerResponse.length; i++)
        {
            let currentAnswer = playerResponse[i];
            
            // If the number in the currentAnswer's ID is the same number as in targetArray, it is correct.
            if(currentAnswer[currentAnswer.length-1] == targetArray[i])
            {
                isGoodAnswer = true;
            }
            else
            {
                isGoodAnswer = false;
            }
        }
    }
    if(isGoodAnswer) // If we have a good answer:
    {
        playerResponse = []; // Reset for the next turn
        curRound++; // Increment the round number and adjust the HTMl accordingly:
        document.getElementById("round").innerHTML = curRound;
        removeStartGrid();
        generatePattern();
    }
    else
    {
        document.getElementById("highscore").innerHTML = "High Score: " + curRound;
        // Flash red three times
        incorrectAnswer();
        setTimeout(() => {incorrectAnswer();}, 500);
        setTimeout(() => {incorrectAnswer();}, 1000);

        resetGame();
    }
}

// Make all circles flash red after giving an incorrect answer
function incorrectAnswer()
{
    let circles = document.getElementsByTagNameNS("http://www.w3.org/2000/svg", "circle");
    for(let i = 0; i < circles.length; i++)
    {
        circles[i].setAttribute("fill", "red");
    }
    setTimeout(() => {
        for(let i = 0; i < circles.length; i++)
        {
            circles[i].setAttribute("fill", "white");
        }
    }, 250);
}

function resetGame()
{
    // Reset the buttons
    document.getElementById("submit").style.display = "none";
    document.getElementById("start").style.display = "inline";

    // Reset round
    curRound = 0;
    document.getElementById("round").innerHTML = curRound;
    playerResponse = []; // Reset for the next turn
    targetArray = [];
}

function startTimer()
{
    countdown = setInterval(timer, 1000);
}

function endTimer()
{
    clearInterval(countdown);
    countdown = null;
}

// Function to perform after the start button is pressed
function timer()
{
    let button = document.getElementById("start");
    button.innerHTML = "Start!";

    if(time < 0)
    {
        button.style.display = "none";
        playerResponse = []; // Reset the answers
        // FUNCTIONS TO DO HERE
        curRound = 1;
        document.getElementById("round").innerHTML = curRound;
        endTimer();
        removeStartGrid();
        generatePattern();
    }
    else
    {
        button.innerHTML = time;
        time -= 1;
    }
}

// Generate a random number
function randomNum()
{
    return Math.floor(Math.random() * 9);
}