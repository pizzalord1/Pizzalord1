
// --------------------------------------------------
// SCENES
// Read through the comments below to see what this section does
//
// TO CUSTOMIZE THIS SECTION
// 1) add fields for each scene, as relevant, to match your mockup
// 2) customize the scenes to fit your story
// 3) add any new fields to the function below
// --------------------------------------------------

// First, we create a variable for the current scene being displayed
let currentScene = "bigroom";

// Then, we create an object that stores the data for each scene,
const scenes = {
  // See "bigroom" for the first example
  bigroom: {
    title: "Location: bigroom",
    character: "Interviewer:clerk",
    text: "your job is to find the correct CPU without breaking your bank.",
    // you can choose how many choices to include
    // each choice can have text, an action, and/or nextScene
    choices: [
      {
        text: "Buy the i9-14900k like you dont care.",
        action: function () {
          updateHealth(-100);
        },
        nextScene: "entrance"
      },
      {
        text: "Ask for a GPU",
        nextScene: "gpuArea"
      },
      {
          text: "Pick up the golden item",
          action: function () {
            pickUpItem("golden item");
          },
          nextScene: "gpuArea"
      }
    ]
  },

  entrance: {
    title: "Location: Entrance",
    character: "Interviewer:Other clerk",
    text: "what...",
    choices: [
      {
        text: "Go back to the big room",
        nextScene: "bigroom"
      },
         {
        text: "Ask about the the other clerk",
        nextScene: "gpuArea"
      }
    ]
  },

  gpuArea: {
    title: "The gpuArea",
    text: "The gpuArea is dark and silent.",
    choices: [
      {
        text: "bigroom",
        nextScene: "goldenSSD"
      }
    ]
  },

   goldenSSD: {
    title: "The golden SSD",
    text: "The door bar doesn't move.",
    choices: [
      {
        text: "Try to exit",
        action: unlockDoor
      },
      {
        text: "Go back",
        nextScene: "bigroom"
      }
    ]
  },

   solution: {
    title: "The solution",
    text: "You didnt break your bank!",
    
  }
};

// --------------------------------------------------
// UPDATE SCENES
// Read through the comments below to see what this section does
//
// TO CUSTOMIZE THIS SECTION
// 1) add a new const variable for each new field you added above
// Make sure to match the ids used in your mock up with the fields 
// 2) set the .textContent of each variable to the corresponding field in the scene object
// Use sceneTitle as a model
// --------------------------------------------------

// First, we create variables to hold the references to the HTML elements
// Technically you could just use document.getElementById('id-name') 
// in the function itself, but that would be very wordy 
// and make the code harder to read
const sceneTitle = document.getElementById("scene-title");
const sceneText = document.getElementById("scene-text");
const choicesContainer = document.getElementById("choices-container");
const characterName = document.getElementById("character-name");
const sceneImage = document.getElementById("scene-image");

// Then, we create a function to update the scene,
function updateScene(sceneName) {

  //This update the variable currentScene with the new scene passed as a parameter
  currentScene = sceneName;

  //This accesses the scene object based on the scene name
  const scene = scenes[sceneName];

  sceneImage.hidden = sceneName !== "bigroom";

  // Here, for each html element, you change the textContent to match
  // the appropriate text from the scene object
  sceneTitle.textContent = scene.title;
  sceneText.textContent = scene.text;
  characterName.textContent = scene.character;

  // Clear the old buttons before creating new ones
  choicesContainer.innerHTML = "";

  // Loop through each choice in the scene, connecting an action and nextScene if included
  (scene.choices || []).forEach(function (choice) {
    const button = document.createElement("button");

    button.textContent = choice.text;

    button.addEventListener("click", function () {
      if (choice.action) {
        choice.action();
      }

      if (choice.nextScene) {
        updateScene(choice.nextScene);
      }
    });

    choicesContainer.appendChild(button);
  });
}

// This updates the screen with the current scene
updateScene(currentScene);


// --------------------------------------------------
// HEALTH
// Read through the comments below to see what this section does
//
// TO CUSTOMIZE THIS SECTION
// Either customize the name from health to steps, stress, etc...
// OR
// create a copy of each step for each additional state you want to track throughout the game
// --------------------------------------------------

// Create a variable for health
let health = 100;

// Display current health
const healthDisplay = document.getElementById("health-display");
const messageDisplay = document.getElementById("message-display");

// Create a function to update health 
function updateHealth(amount) {
  health += amount;
  healthDisplay.textContent = health;

  if (health <= 0) {
    messageDisplay.textContent = "You ran out of money!";
  }
}
// I should add a check to see if health is below 0 and if so, end the game or show a "game over" scene
// gameOver: {
//   title: "Game Over",
//   character: "",
//   text: "You ran out of health.",
//   choices: []
// }
// function updateHealth(amount) {
//   health = Math.max(0, health + amount);
//   healthDisplay.textContent = health;

//   if (health === 0) {
//     updateScene("gameOver");
//   }
// }
// if (choice.action) {
//   choice.action();
// }

// if (health === 0) return;

// if (choice.nextScene) {
//   updateScene(choice.nextScene);
// }






// This refreshes the health display
updateHealth(0);

// --------------------------------------------------
// INVENTORY
// Read through the comments below to see what this section does
//
// For now, you are probably leaving this section as is. 
// --------------------------------------------------

// Create a variable for inventory
let inventory = [];

// Display current inventory
const inventoryDisplay = document.querySelector("#inventory-display");

// Create a function to update inventory 
function pickUpItem(itemName) {
    // Add itemName to the inventory array
    // Show the updated inventory on the page
  inventory.push(itemName);
  inventoryDisplay.textContent = inventory.join(", ");
}

// --------------------------------------------------
// CONDITIONAL 
// Depending on how you want to implement the conditional logic, you may 
// simply adjust the names below or you may need to expand upon this section
// --------------------------------------------------

// Create a function that checks if the inventory contains one item and if so shows the win condition scene.
function unlockDoor() {
  if (inventory.includes("golden item")) {
    updateScene("solution");
  } else {
    messageDisplay.textContent = "The door is locked.";
  }
}