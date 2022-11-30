//Open and connect socket
let socket = io();
let myId;
let myPos;
let myStatus;

//Listen for confirmation of connection
socket.on('connect', function () {
  console.log("Connected");
});


//when button is clicked, emit message to server that allows for passing mouseXY positions back and forth
let joinCons = document.getElementById('joinCons');
joinCons.addEventListener("click", joinRoom);



// listen for what your socket ID is so you know who you are in the object
socket.on('userID', function (socketId) {
  console.log("I am " + socketId);
  myId = socketId;
});

// listen for what your socket ID is so you know who you are in the object
socket.on('consCount', function (consCount) {
  //   if (consCount<2) {
  //     joinCons.style.visibility = "visible";
  //   } else {
  //     joinCons.style.visibility = "hidden";
  //   }
  // });

  if (consCount < 2) {
    joinCons.innerHTML = 'Join the Consonance';
  } else {
    joinCons.innerHTML = 'Room is Full';
    joinCons.style.pointerEvents = 'none';
    joinCons.style.color = 'rgb(168,169,173)';
  }
});

// listen for what your socket ID is so you know who you are in the object
socket.on('playerStatus', function (playerStatus) {
  myStatus = playerStatus;
});


function joinRoom() {
  socket.emit('joinRoom', "cons");
  joinCons.style.visibility = "hidden";
}



// ------------------This is where you can find variables to play with! myPos contains the distance of x and y from an average of all users' x and y. Theoretically this should mean that it works for as many users as we want to have join. myPos is an object that has the x position, y position, distance from average for x, distance from average for y, and the total distance from the average point. It is console logged in the browser. These elements for the myPos object are defined in the users array in index.js
let player1Img;
let player2Img;
let bg
var song1
let volumeMultiplier = 0.5;


//load bg
function preload() {
  bg = loadImage("/images/background/background_flower.png");
  player1Img = loadImage("/images/flower.gif");
  player2Img = loadImage("/images/waterpot.gif");


  song1 = createAudio("/sounds/ambience.wav");
  // 	console.log(song1)
}

//get button to trigger the song
document.getElementById('buttonID').addEventListener('click', () => {
  // function mousePressed() {
  //   // song1.play()
  song1.loop()
  // if (song1.isPlaying()) {
  //   song1.pause()
  // } else {
  //   song1.play()

  // }
  // song1.volume(0.1);

  // }
})

//slider
var slider = document.getElementById("myRange");

var setVolume = function () {
  volumeMultiplier = this.value / 100;
};

slider.addEventListener('change', setVolume);
// volumeControl.addEventListener('input',setVolume);





function setup() {

  // console.log(bg);
  // let bg;
  // bg = loadImage('/background/background_night.jpg');


  // createCanvas(windowWidth, windowHeight);
  // background(220);


  const myCanvas = createCanvas(windowWidth, windowHeight)
  myCanvas.parent('canvas-container')

  // img = loadImage('background/background_night.jpg')
  background(bg);
  fill(225, 0, 0);

  //Listen for messages named 'data' from the server, which will contain information about current user's xy position
  socket.on('data', function (users) {

    for (i = 0; i < users.length; i++) {
      if (users[i].id == myId) {
        myPos = users[i];
      }
    }
    // console.log(users);

    //draw an ellipse at each users' mouse position. this is where we could update graphics




    background(bg);
    fill(225, 0, 0);


    for (i = 0; i < users.length; i++) {
      push()
      imageMode(CENTER);
      if (i == 0) {
        image(player1Img, users[i].x, users[i].y, 200, 200);
      } else {
        image(player2Img, users[i].x, users[i].y, 200, 200);

      }
      pop()


      calcDistance(users)
    }


  });
}





function mouseMoved() {
  if (myStatus == "Playing") {
    //Grab mouse position
    let mouseCPos = { x: mouseX, y: mouseY, id: socket.id };
    //Send mouse position object to the server
    socket.emit('dataCons', mouseCPos);
  }


  // Draw yourself at your xy position
  // ----- this is where you can put something different at the cursor.
  // fill(0);
  // background(255);
  // ellipse(mouseX, mouseY, 10, 10);
}

function calcDistance(users) {
  let maximum =
    window.innerWidth > window.innerHeight
      ? window.innerWidth
      : window.innerHeight


  let mapDistance = map(users[0].totalDist, maximum, 0, 0, 1)
  console.log(mapDistance);
  if (mapDistance <= 0.98) {
    mapDistance *= 0

  } else if (mapDistance > 0.98 && mapDistance < 5) {
    mapDistance *= 1

  }

  song1.volume(mapDistance * volumeMultiplier);
  console.log(song1.volume);
  // what we are mapping here is distance mapping to volume, map(value, start1, stop1, start2, stop2) 

}

//Expects an object with a and y properties
// function drawPos(pos) {
//   fill(100);
//   ellipse(pos.x, pos.y, 10, 10);
// }