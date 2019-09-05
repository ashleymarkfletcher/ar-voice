// set up speech recognition globals
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

let video
let poseNet
let poses = []
let boxes = []
let lastKeypoints = [] // The most recent keypoints

// module aliases
var Engine = Matter.Engine
// Render = Matter.Render,
var World = Matter.World
var Bodies = Matter.Bodies

// create an engine
var engine = Engine.create()
var world = engine.world
// let arm

function setup() {
  createCanvas(640, 480)
  video = createCapture(VIDEO)
  video.size(width, height)

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, 'single', modelReady)
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', results => {
    poses = results

    // if (!arm) {
    //   arm = createArmBody(lastKeypoints)
    //   if (arm) {
    //     World.add(world, arm)
    //     // randomBox()
    //   }
    // }
  })
  // Hide the video element, and just show the canvas
  video.hide()
}

const canv = document.getElementById('defaultCanvas0')

function modelReady() {
  select('#status').html('Model Loaded')
}

function draw() {
  image(video, 0, 0, width, height)

  // We can call both functions to draw all keypoints and the skeletons
  // drawKeypoints()
  // drawSkeleton()

  Engine.update(engine) // Update the physics engine.
  drawPhysics() // Draw the physics objects.
  updateKeypoints()

  // if (arm) updateArmBody(arm, lastKeypoints)

  // fill(255)
  // textSize(32)
  // if (lastKeypoints[0]) {
  //   const { x, y } = lastKeypoints[0]
  //   text(currentTranscript, x, y)
  // }
}

function drawPhysics() {
  for (var i = 0; i < boxes.length; i++) {
    boxes[i].show()
  }
  noStroke(255)
  fill(170)
  rectMode(CENTER)
  // rect(ground.position.x, ground.position.y, width, 100)
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j]
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0)
        noStroke()
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10)
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0]
      let partB = skeleton[j][1]
      stroke(255, 0, 0)
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y)
    }
  }
}

function updateKeypoints() {
  // If there are no poses, ignore it.
  if (poses.length <= 0) {
    return
  }

  // Otherwise, let's update the lastKeypoints.
  let pose = poses[0].pose
  let keypoints = pose.keypoints
  // console.log(keypoints)

  for (let kp = 0; kp < keypoints.length; kp++) {
    lastKeypoints[kp] = keypoints[kp].position
  }
}

function getArmPoints(keypoints) {
  const leftShoulder = keypoints[5] || { x: 0, y: 0 }
  const rightShoulder = keypoints[6] || { x: 1, y: 1 }
  const leftElbow = keypoints[7] || { x: 2, y: 2 }
  const rightElbow = keypoints[8] || { x: 3, y: 3 }
  const leftWrist = keypoints[9] || { x: 4, y: 4 }
  const rightWrist = keypoints[10] || { x: 5, y: 5 }

  return [
    // { x: 0, y: height },
    leftWrist,
    leftElbow,
    leftShoulder,
    rightShoulder,
    rightElbow,
    rightWrist
    // { x: width, y: height }
  ]
}

// create a physics body with the shape of the arms
function createArmBody(keypoints) {
  const armPoints = getArmPoints(keypoints)
  // console.log(armPoints)
  // const armVectors = armPoints.map(point => point.position || point)
  // console.log(armVectors)
  let armBody
  try {
    armBody = Matter.Bodies.fromVertices(width / 2, height / 2, armPoints)
    Matter.Body.setStatic(armBody, true)
  } catch (error) {}
  // const armBody = Matter.Bodies.fromVertices(armVectors)

  // console.log(armBody)
  //

  return armBody
}

function createBodyObjects() {
  // TODO: inbetween shoulders
  // elbow
  // wrist
  // as circle to start
  // then maybe rectangle inbetween joints with rotation from joint a->b
  // var shoulders = Matter.Bodies.rectangle(x, y, width, height, [options])
}

function updateArmBody(armBody, keypoints) {
  const armPoints = getArmPoints(keypoints)

  // const armVectors = armPoints.map(point => point.position || point)

  Matter.Body.setVertices(armBody, armPoints)

  // console.log(arm )
}
// create a renderer
// var render = Render.create({
//   element: canv,
//   engine: engine
// })

// render.options.wireframeBackground = 'transparent'
// render.options.background = 'transparent'

// create two boxes and a ground
// var boxA = Bodies.rectangle(400, 200, 80, 80)
// var boxB = Bodies.rectangle(450, 50, 80, 80)
// var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true })

// // add all of the bodies to the world
// World.add(engine.world, [boxA, boxB, ground])

function randomBox() {
  setInterval(() => {
    //   var x = width / 2
    //   var y = 0
    //   boxes.push(new Box(x, y, 30, 30, World))

    for (let i = 0; i < 50; i++) {
      var x = random(0, width) //width / 2
      var y = random(0, -200)
      boxes.push(new Box(x, y, 30, 30, World))
    }
  }, 5000)
}

function mousePressed() {
  // var x = width / 2
  // var y = 0
  // boxes.push(new Box(x, y, 30, 30, World))

  speech()
}
// run the engine
// Engine.run(engine)

// run the renderer
// Render.run(render)
let finalTranscript = ''
let currentTranscript = ''
let transcript = ''
const speech = () => {
  window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
  finalTranscript = ''

  let recognition = new window.SpeechRecognition()
  recognition.interimResults = true
  // recognition.maxAlternatives = 10
  recognition.maxAlternatives = 1
  // apaprently returns one at a time if true
  recognition.continuous = true

  recognition.onresult = event => {
    let interimTranscript = ''
    for (let i = event.resultIndex, len = event.results.length; i < len; i++) {
      console.log(event.results[i][0])

      if (event.results[i][0].confidence < 0.7) return
      if (event.results[i][0].transcript == currentTranscript) return

      transcript = event.results[i][0].transcript

      if (transcript.startsWith(currentTranscript)) transcript = transcript.slice(currentTranscript.length)
      if (event.results[i].isFinal) {
        finalTranscript += transcript
        currentTranscript = transcript

        const words = currentTranscript.split(' ')

        // words.forEach((word, i) => {
        //   setTimeout(params => {
        //     addWordBox(word)
        //   }, i * 200)
        // })

        // TODO: build up interim
        // split words
        // show first unique word
        // every word after add a delay and show next

        // addWordBox(currentTranscript)
        console.log('final: ' + finalTranscript)
        currentTranscript = ''
      } else {
        currentTranscript = transcript

        interimTranscript += transcript
        addWordBox(transcript)

        console.log('current: ' + transcript)
        console.log('interim: ' + interimTranscript)
      }
    }

    // document.querySelector('body').innerHTML = finalTranscript + '<i style="color:#ddd;">' + interimTranscript + '</>'
  }

  function addWordBox(word) {
    const { x, y } = lastKeypoints[0] || { x: width / 2, y: height / 2 }

    boxes.push(new Box(x, y, 30, 30, World, word))
  }
  recognition.start()
}
