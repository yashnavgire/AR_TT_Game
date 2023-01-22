 /*
    Human pose detection using machine learning.
    This code uses: 
    ML5.js: giving us easy to use poseNet ML model.
    P5.js: for drawing and creating video output in the browser.
  */

// the output of our webcam
let webcam_output;
// to store the ML model
let poseNet;
// output of our ML model is stored in this
let poses = [];
var xhttp = new XMLHttpRequest();
var bodyPart="rightEye";


let width=400;
let height=400;

var filterX=[0,0,0,0,0,0,0,0,0,0];
var filterY=[0,0,0,0,0,0,0,0,0,0];
var cnt=0;
var sumX=0;
var sumY=0;
var filterSize=5;
// let past=-1;
/* function setup() is by P5.js:
      it is the first function that is executed and runs only once.
      We will do our initial setup here.
*/
function setup() {

  /* create a box in browser to show our output. Canvas having:
         width: 640 pixels and
         height: 480 pixels
  */
  let cnv=createCanvas(400, 400);
  cnv.position(0,0);
  // get webcam input
  webcam_output = createCapture(VIDEO);
  // set webcam  height and video to the samewidth of our canvas
  webcam_output.size(width, height);

  /* Create a new poseNet model. Input:
      1) give our present webcam output
      2) a function "modelReady" when the model is loaded and ready to use
  */
  poseNet = ml5.poseNet(webcam_output,'single', modelReady);

  /*
    An event or trigger.
    Whenever webcam gives a new image, it is given to the poseNet model.
    The moment pose is detected and output is ready it calls:
    function(result): where result is the models output.
    store this in poses variable for furthur use.
  */
  poseNet.on('pose', function(results) {

   
    // console.log("pose event");
    poses = results;
    // draw();
    // console.log(poses);
    let position=getCordinates(bodyPart);

    if(typeof position === "undefined")
    {
      position.x=0;
      position.y=0;
      // console.log("inside");
    }

    //moving average filter
    sumX-=filterX[cnt];
    sumY-=filterY[cnt];
    
    filterX[cnt]=position.x;
    filterY[cnt]=position.y;

    sumX+=filterX[cnt];
    sumY+=filterY[cnt];

    let currX=sumX/filterSize;
    let currY=sumY/filterSize;

    app.paddle.position.x = THREE.Math.mapLinear(
      // e.pageX,
      // position.x,
      currX,
      width-70, 0+70,      //window.innerWidth,
      -100, 100
    );
    app.paddle.position.y = THREE.Math.mapLinear(
      // e.pageY,
      // position.y,
      currY,
      height/3, height,   //window.innerHeight,
      40, -40
    );
    
    cnt++;
    if(cnt>=filterSize)
      cnt=0;
  });

  /* Hide the webcam output for now.
     We will modify the images and show with points and lines of the 
     poses detected later on.
  */
  webcam_output.hide();
}

/* function called when the model is ready to use.
   set the #status field to Model Loaded for the
  user to know we are ready to rock!
 */
function modelReady() {
  // select('#status').html('Model Loaded');
  console.log("model loaded");
}


/* function draw() is by P5.js:
      This function is called on repeat forever (unless you plan on closing the browser
      and/or pressing the power button)
// */
// function draw() {

 
//   // show the image we currently have of the webcam output.
//   image(webcam_output, 0, 0, width, height);


//   // draw the points we have got from the poseNet model
//   // if(game_status) 
//   	drawKeypoints();
 
// }

// A function to draw detected points on the image.
function drawKeypoints(){
  /*
    Remember we saved all the result from the poseNet output in "poses" array.
    Loop through every pose and draw keypoints
   */

  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    // console.log(pose);
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
	  let keypoint = pose.keypoints[j];
	  
	  ellipse(keypoint.position.x, keypoint.position.y, 20, 20);
      // Only draw an ellipse if the pose probability is bigger than 0.2
      if (keypoint.score > 0.2 && keypoint.part=="rightWrist") {
        // choosing colour. RGB where each colour ranges from 0 255
        fill(0, 0, 255);
        // disable drawing outline
        noStroke();
        /* draw a small ellipse. Which being so small looks like a dot. Purpose complete.
            input: X position of the point in the 2D image
                   Y position as well
                   width in px of the ellipse. 10 given
                   height in px of the ellipse. 10 given
        */
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
    /*
    Remember we saved all the result from the poseNet output in "poses" array.
    Loop through every pose and draw skeleton lines.
   */
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      // line start point
      let startPoint = skeleton[j][0];
      // line end point
      let endPoint = skeleton[j][1];
      // Sets the color used to draw lines and borders around shapes
      stroke(0, 255, 0);
      /* draw a line:
            input: X position of start point of line in this 2D image
                   Y position as well
                   X position of end point of line in this 2D image
                   Y position as well
          */
      line(startPoint.position.x, startPoint.position.y, endPoint.position.x, endPoint.position.y);
    }
  }
}


function getCordinates(part){
  var cord={};
  image(webcam_output, 0, 0, width, height);

  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    // console.log(pose);
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
	    var keypoint = pose.keypoints[j];
      cord=keypoint.position;
	    ellipse(keypoint.position.x, keypoint.position.y, 20, 20);
      // Only draw an ellipse if the pose probability is bigger than 0.2
      if (keypoint.part==part) {
        // choosing colour. RGB where each colour ranges from 0 255
        console.log(keypoint.part);
        fill(0, 0, 255);
        // disable drawing outline
        noStroke();
        // ellipse(keypoint.position.x, keypoint.position.y, 20, 20);
        
        return keypoint.position;
      }
    }
  }

  return cord;
}
//////////////////////////////////////////////////////

 
 
 
 
 // run server: python -m http.server

var app = app || {};

app.planeWidth = 250;
app.planeLength = 250;
app.paddleWidth = 30 * app.planeWidth/100;
app.guiControls = {
  bouncingSpeed: 1.5,
  rollDebug: '',
  ballVelocityScale: 2.5,
  gravity: 0.08,
  sideWalls: false,
  easyMode: false,
  hasCrossed: false,
  numParticles: 50,
  particleDistribution: 800,
  particleVelocityScale: 1.0,
  
  rightEye:function(){
      bodyPart="rightEye";
      document.getElementById("controlling").innerHTML = "Game controlled using right Eye : move face/upper-body to adjust the bat";
  },
  rightWrist:function(){
    bodyPart="rightWrist";
    document.getElementById("controlling").innerHTML = "Game controlled using right-wrist : stay 1.5m away from screen for good results with plain background";
  }

}

app.humanScore = 0;
app.aiScore = 0;
app.winningScore = 5;
app.step = 0;
app.winner = "";
app.nextTurn = "AI";
//only if human turn to serve - check if human has served
app.pointHasBegun = false;

app.justHit = 'AI';
app.justServed = true;
app.bounce = 0;
//to check if the ball has bounced on the other side
app.hasBouncedOnOppositeSide = false;
//to actiave particle once and turn it off
app.activeParticle = true;
app.addPoint = true;

app.config = {
  doBallUpdate: true,
  aiXAngleOffset: -0.05,  // upward tilt bias
  humanHitVelocityScale: 2.0
}


//const BASE = 'https://raw.githubusercontent.com/liaa2/Ping-Pong-Nano-Cup/master/';

//const BASE = 'http://localhost:3000/';

const BASE = 'https://ar-table-tennis-game.onrender.com/';

app.humanPaddleSound = new Audio(`${BASE}audio/paddle1.mp3`);
app.aiPaddleSound = new Audio(`${BASE}audio/paddle2.mp3`);
app.humanSide = new Audio(`${BASE}audio/pong1.mp3`);
app.aiSide = new Audio(`${BASE}audio/pong2.mp3`);
app.cheering = new Audio(`${BASE}audio/cheering.mp3`);


// start to setup lights, objects(load paddles for user and AI), camera etc
app.init = () => {
  console.log("loaded");

  app.gui = new dat.GUI();
  // app.gui.DEFAULT_WIDTH=200;
  // var GUIContainer = document.getElementById('my-gui-container');
  // GUIContainer.appendChild(app.gui.domElement);
  app.gui.add(app.guiControls, "ballVelocityScale",0,4);
  app.gui.add(app.guiControls, "rightEye");
  app.gui.add(app.guiControls, "rightWrist");

  //set up 3D
  app.scene = new THREE.Scene()

  app.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
  app.camera.position.set( 0, 80, 200 );

  app.renderer = new THREE.WebGLRenderer({ antialias: true})
  app.renderer.shadowMap.enabled = true;
  app.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  //rotate camera
  app.controls = new THREE.OrbitControls( app.camera, app.renderer.domElement );

  app.renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild( app.renderer.domElement )


  //Stats
  app.stats = app.addStats();

  //table - just plane
  app.plane = app.createPlane();
  app.scene.add(app.plane);

  app.line = app.createLine();
  app.scene.add(app.line);

  app.upLine = app.createUpLine();
  app.scene.add(app.upLine);

  app.downLine = app.createDownLine();
  app.scene.add(app.downLine);

  app.leftLine = app.createLeftLine();
  app.scene.add(app.leftLine);

  app.rightLine = app.createRightLine();
  app.scene.add(app.rightLine);

  app.net = app.createNet();
  app.scene.add(app.net);

  //ball
  app.ball = app.createBall();
  app.scene.add(app.ball);

  // Light - ambientLight
  app.ambientLight = app.createAmbientlight();
  app.scene.add(app.ambientLight);

  //Light - pointLight
  app.spotLightL = app.createSpotlight(-150, 100, 0, 0xffffff);
  app.scene.add(app.spotLightL);

  //instantiate loader
  app.loader = new THREE.JSONLoader();

  app.loader.load(
    //resource URl AI
    `${BASE}paddle.js`,
    loadPaddleAI
  );

  app.loader.load(
    //resource URl
    `${BASE}paddle.js`,
    loadPaddle
  )

  //Paddle - AI
  function loadPaddleAI(geometry, materials){
    console.log('HERE');
    var scale = app.planeWidth/100;
    app.paddleAI = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
    app.paddleAI.scale.set(scale, scale, scale);
    app.paddleAI.position.set(0,30,-140);
    app.paddleAI.rotation.y = 0;
    app.scene.add( app.paddleAI );


    const surfaceGeometry = new THREE.CircleGeometry(app.paddleWidth/4, 20);
    const surfaceMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00, side: THREE.DoubleSide });
    app.surfaceAI = new THREE.Mesh( surfaceGeometry, surfaceMaterial );
    app.surfaceAI.visible = false;
    app.paddleAI.add( app.surfaceAI );
    app.paddleAI.updateMatrixWorld();
  };

  //Paddle - user
  function loadPaddle(geometry, materials){
    console.log('HERE');
    var scale = app.planeWidth/100;
    app.paddle = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
    app.paddle.scale.set(scale, scale, scale);
    app.paddle.position.set(0,30,135);
    app.paddle.velocity = new THREE.Vector3(0,0,0);
    app.paddle.rotation.y = 0;
    app.scene.add( app.paddle );


    const surfaceGeometry = new THREE.CircleGeometry(app.paddleWidth/4, 20);
    const surfaceMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00, side: THREE.DoubleSide });
    app.surface = new THREE.Mesh( surfaceGeometry, surfaceMaterial );
    app.surface.visible = false;
    app.paddle.add( app.surface );

    // don't start animating until the paddle is loaded
    app.animate();
  }


  //======================= version 1: mouse pad mode ================================



  /** 
  document.addEventListener("mousemove", e => {
    // console.log("e.page: ", e.pageX, e.pageY, e);
  
    if( e.shiftKey ){
      const yAngle = THREE.Math.mapLinear(
        e.pageX,
        0, window.innerWidth,
        Math.PI/4, -Math.PI/4
      );
      app.paddle.rotation.y = yAngle;
  
      const xAngle = THREE.Math.mapLinear(
        e.pageY,
        0, window.innerHeight,
        Math.PI/4, -Math.PI/4
      );
      app.paddle.rotation.x = xAngle;
      return; // don't change the position with the code below
    }
  
    let position;
    position=getCordinates("rightWrist");

    app.paddle.position.x = THREE.Math.mapLinear(
      // e.pageX,
      position.x,
      0, width,      //window.innerWidth,
      -100, 100
    );
    app.paddle.position.y = THREE.Math.mapLinear(
      // e.pageY,
      position.y,
      0, height,   //window.innerHeight,
      80, -10
    );
  
    // app.paddle.position.y = THREE.Math.mapLinear(e.pagey, 90, 1000, )
  });
  **/

  //=================== version 2: Leap Motion Controller Mode ===========================

  //initiate animationFrame & gestures
  // app.options = {
  //   frameEventName: 'animationFrame',
  //   enableGestures: true,
  // };

  // // The loop() function sets up the Leap controller and WebSocket connection and invokes the specified callback function on a regular update intervall. Don't need to create my own controller when using this method.
  // app.controller = Leap.loop(app.options, function(frame){

  //   //converts coordinates from Leap Space to THREE scene space
  //   if (frame.hands[0]){

  //      app.paddle.geometry.normalsNeedUpdate = true;

  //     const hand = frame.hands[0];
  //     handMesh = hand.data('riggedHand.mesh');

  //     // Leap::Vector handSpeed = hand.palmVelocity(); -> The rate of change of the palm position in millimeters/second.
  //     handMesh.scenePosition(hand.palmPosition, app.paddle.position);
  //     app.paddle.position.z += 150;
  //     app.paddle.position.x *= 3.5;

  //     app.paddle.velocity = new THREE.Vector3(
  //       hand.palmVelocity[0],
  //       hand.palmVelocity[1],
  //       hand.palmVelocity[2]
  //     );


  //     //scale down hand movement and apply them to paddle rotation
  //     //using pitch() - hand rotation along x axis:
  //     if (app.paddle.position.y > 40) {
  //       let xAngleLM = THREE.Math.mapLinear(
  //         frame.hands[0].pitch(),
  //         -2, 2,
  //         -Math.PI/3, Math.PI/4
  //       );
  //       // If this vector's x, y or z value is greater than/less than the max/min vector's x, y or z value, it is replaced by the corresponding value.
  //       xAngleLM = THREE.Math.clamp(xAngleLM, -Math.PI/3, Math.PI/4);
  //       app.paddle.rotation.x = xAngleLM;
  //     } else {
  //       let xAngleLM = THREE.Math.mapLinear(
  //         frame.hands[0].pitch(),
  //         -2, 2,
  //         -Math.PI/4, Math.PI/6
  //       );
  //       xAngleLM = THREE.Math.clamp(xAngleLM, -Math.PI/4, Math.PI/6);
  //       app.paddle.rotation.x = xAngleLM;
  //     }


  //     // using roll() - hand rotation along y axis:
  //     let yAngleLM = THREE.Math.mapLinear(
  //       frame.hands[0].roll(),   //value to map
  //       -2, 2,   //min & max input range
  //       Math.PI/3, -Math.PI/3  //min & max output
  //     );

  //     yAngleLM = THREE.Math.clamp(yAngleLM, -Math.PI/3, Math.PI/3);
  //     app.paddle.rotation.y = yAngleLM
  //   }
  // })//controller

  // // Begin using a registered plugin. The plugin is run for animationFrames only.
  // // list of plugins: https://developer-archive.leapmotion.com/javascript#plugins
  // app.controller.use('transform', { scale: app.planeWidth/1000 })
  // .use("riggedHand")

  // // Connects this Controller object to the Leap Motion WebSocket server. If the connection succeeds, the controller can begin supplying tracking data
  // app.controller.connect();
};

window.onload = app.init;


//resize canvas on resize window automatically
app.onResize = () => {
  app.width = window.innerWidth;
  app.height = window.innerHeight;
  app.camera.aspect = app.width/app.height
  app.camera.updateProjectionMatrix()
  app.renderer.setSize(app.width, app.height)
};

window.addEventListener('resize', app.onResize, false);


//key code mode - shortcut to debug
document.addEventListener('keydown', ev => {
  console.log(ev.keyCode, ev.key);
  switch(ev.key){
    case ' ': //pause the game
      app.config.doBallUpdate = !app.config.doBallUpdate;
      // console.log(`Ball movement ${ app.config.doBallUpdate ? 'unpaused' : 'paused'}.`)
      break;
    case 'Enter': // start the new game
      app.newGame();
      break;
    case "Tab": // jump to human player serve mode
      app.aiScore = app.winningScore;
      app.humanStart();
      break;
  }
});


