

let rotationData = { x: null, y: null, z: null };
let accelerationData = { x: null, y: null, z: null };
let isShaken = false;
let lastShakeTime = 0;
let timeSinceShake = 0;
let dataReceived = false;
let shakeHistory = [];
let shakeRate = 0;
let permissionButton;
let shakeToggle = false;
let lastToggleTime = 0;
let displayMode = false;

// Data playback variables
let playbackData = [];
let playbackIndex = 0;
let useRecordedData = false; // Default to using recorded data

const SHAKE_WINDOW = 3000; // Consider shakes in the last 3 seconds
const SHAKE_THRESHOLD = 8; // Acceleration threshold for shake detection
const SHAKE_TIMEOUT = 500; // Time in milliseconds to consider a shake "active"
const TOGGLE_COOLDOWN = 6000; // Cooldown period for toggle (in milliseconds)

let pg; 
let pg0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(LEFT, TOP);
  frameRate(20);
  pg = createGraphics(width*10, height);
  pg0 = createGraphics(width*10, height);
  pg0.background(240);
  rope = loadImage("rope1.png");
  startDeviceMotionDetect();

  // Load the recorded data file automatically
  loadJSONFile("sensor_data_1755120523115.json");
  
  // Create toggle button for display mode
  toggleButton = createButton('Switch to Visualization Mode');
  toggleButton.position(20, windowHeight - 60);
  toggleButton.style('font-size', '16px');
  toggleButton.style('padding', '10px 15px');
  toggleButton.style('background-color', '#4CAF50');
  toggleButton.style('color', 'white');
  toggleButton.style('border', 'none');
  toggleButton.style('border-radius', '4px');
  toggleButton.mousePressed(toggleDisplayMode);
  
  // Toggle data source button
  let buttonY = windowHeight - 110;
  let buttonWidth = 180;
  
  toggleDataSourceButton = createButton('Use Live Sensors');
  toggleDataSourceButton.position(20, buttonY);
  toggleDataSourceButton.style('font-size', '16px');
  toggleDataSourceButton.style('padding', '10px 15px');
  toggleDataSourceButton.style('background-color', '#9C27B0');
  toggleDataSourceButton.style('color', 'white');
  toggleDataSourceButton.style('border', 'none');
  toggleDataSourceButton.style('border-radius', '4px');
  toggleDataSourceButton.style('width', buttonWidth + 'px');
  toggleDataSourceButton.mousePressed(toggleDataSource);
}


let doOnceMode = false;
let canvasOffset = 0;
let autoScrollSpeed = 2; // Speed at which canvas scrolls when needed
let canvasViewportMargin = 100; // Start scrolling when we're this close to the edge
let isDragging = false;
let dragStartX = 0;
let lastDragX = 0;
let dragInertia = 0; // For momentum-based scrolling
let inertiaDecay = 0.95; // How quickly inertia decreases

function draw() {
  
  updateData();

  if (displayMode === "data") {
    displayData();
    doOnceMode = true;
  } else {
    if (doOnceMode){
      //pg.background(240);
      doOnceMode = false;
    }
    
    // Check if we've reached the canvas edge before drawing more elements
  /*   if (curPosX < pg.width - 100) { // Leave some margin before stopping
     
      //horizontalMode();
    } */

      nr = nr + 1;
       translateData();
    
    // Auto-scroll the canvas when the drawing approaches the right edge
    let rightmostPos = nr + 40; // The rightmost position of our drawing elements
    
    // Only auto-scroll if we're not manually dragging and moving forward
    if (!isDragging) {
      // Check if drawing is getting close to the right edge of the visible area
      if (rightmostPos > width + canvasOffset - canvasViewportMargin && dragInertia <= 0) {
        // Move the canvas view to keep the drawing in view
        canvasOffset += autoScrollSpeed;
      }
      
      // Apply inertia if present (for momentum-based scrolling)
      if (abs(dragInertia) > 0.5) {
        canvasOffset -= dragInertia;
        
        // Decay inertia more quickly when scrolling left (positive dragInertia)
        if (dragInertia > 0) {
          dragInertia *= 0.9; // Quicker decay for leftward motion
        } else {
          dragInertia *= inertiaDecay;
        }
      } else {
        dragInertia = 0;
      }
    }
    
    // Make sure we don't scroll beyond the canvas bounds
    canvasOffset = constrain(canvasOffset, 0, pg.width - width);
    
    // Draw the graphics buffer with the appropriate offset
    image(pg0, -canvasOffset, 0);
    image(pg, -canvasOffset, 0);
    
  }
}

//***************HORIZONTAL

// Velocity storage
let vx = 0, vy = 0, vz = 0;

// Low-pass filter memory (for gravity estimation)
let gravityX = 0, gravityY = 0, gravityZ = 0;

// Filtering constant (0 < alpha < 1, lower = smoother)
let alpha = 0.1;

// Damping to reduce drift
let damping = 0.98;



function horizontalMode(){
  let dt = deltaTime / 1000; // convert ms to seconds

  let speed = getFilteredSpeed(
    accelerationData.x,
    accelerationData.y,
    accelerationData.z,
    dt
  );



  pg.image(rope,nr,50,accelerationData.y*40,accelerationData.y*40);
  //pg.circle(nr,50,speed*100);
  
  console.log("Speed " + speed.toFixed(2)); // in m/s
}

function getFilteredSpeed(ax, ay, az, dt) {
  // --- Step 1: Low-pass filter to estimate gravity ---
  gravityX = alpha * gravityX + (1 - alpha) * ax;
  gravityY = alpha * gravityY + (1 - alpha) * ay;
  gravityZ = alpha * gravityZ + (1 - alpha) * az;

  // --- Step 2: Remove gravity ---
  let linearAx = ax - gravityX;
  let linearAy = ay - gravityY;
  let linearAz = az - gravityZ;

  // --- Step 3: Integrate into velocity ---
  vx += linearAx * dt;
  vy += linearAy * dt;
  vz += linearAz * dt;

  // --- Step 4: Apply damping ---
  vx *= damping;
  vy *= damping;
  vz *= damping;

  // --- Step 5: Return magnitude of velocity ---
  return Math.sqrt(vx * vx + vy * vy + vz * vz);
}

//*************** CIRCULAR

let angle = 0; // Global variable to track spiral angle
let radius = 0; // Initial radius for the spiral
let angleAdd = 0.1;

let nr = 0;

let rope;

function circularStructure(){

  //calculate spiral pos
  

  
  //draw element
  //circle(x,y,5);
  

  pg.image(rope,nr,50,20,20);
  angle += angleAdd;
  //angleAdd = angleAdd - 0.00002


   if (deviceShaken()) {
    // image(rope,0,0,imgSize,imgSize);
   }
  radius -= 0.1;
  
}



// ********** CREATIVE PART HERE //

let curPosX = 0;
let curPosY = 0;
let distanceX = 60;
let distanceY = 5;

let speed = 0;
let altitude = 0;

//perlin

    let noiseOffset = 0; // Controls the movement of the wobble over time
    let amplitude = 100; // Controls the maximum width of the wobble
    let noiseScale = 0.003; // Controls the "smoothness" of the noise


function translateData(){
  let yPos = 30;
    if (!dataReceived) {
    text("Waiting for sensor data...", 20, yPos);
    return;
  }
  
  
  
  curPosY = curPosY + distanceY;
  if(curPosY > height ) {
    curPosY = 0;
    curPosX = curPosX + distanceX;
  }
  
  let sizeX =accelerationData.x *10;
  let sizeY =accelerationData.y *10;
  let sizeZ =accelerationData.z *10;
  
  noFill();
  
 /*  if (accelerationData.x > 0.2 ||  accelerationData.x < -0.2 ){
    pg.stroke(0,0,255)
    pg.circle(curPosX, curPosY, sizeX);
    pg.stroke(255,0,0)
    pg.circle(curPosX + 20, curPosY, sizeY);
    pg.stroke(0,255,0)
    pg.circle(curPosX + 40, curPosY, sizeZ);
  }*/
 


  // lines based on rotation drawn on pg0, mapped on hsb

/*  push();


  let colorRot = map(rotationData.x, 0, 180, 190, 250);

  let h = map(colorRot, -180, 180, 180, 255);
  pg0.stroke(colorRot);
  pg0.strokeWeight(8);
  pg0.line(nr, 0, nr, height);

  pop(); 
*/
  // PERLIN NOISE vertical besier line

 // noiseScale = map( accelerationData.x, - 2, 2, -0.01, 0.01);

 let treshholdNoise = 2;
  let noiseAccY = accelerationData.y;
 if (noiseAccY < treshholdNoise &&  noiseAccY > -treshholdNoise ){
  noiseAccY = 0;
 } 

  
   amplitude = map( noiseAccY, - 4, 4, -300, 300);


   let strWidth = map( noiseAccY, - 6, 6, -5, 5);
   if (strWidth == 0) {
     strWidth = 0.25; // Set a minimum stroke width
     amplitude = 30;
   }
   //noiseScale = map( accelerationData.y, - 20, 20, -0.01, 0.01);

// Start drawing a shape

if ( noiseAccY > 3){
  pg.stroke(255, 106, 77); //red
} else{
    pg.stroke(0, 0, 255, 190);//blue
  if (strWidth == 0.25){
    pg.stroke(0, 0, 255, 90);//blue
  }
  
}



  pg.noFill();
  pg.strokeWeight(strWidth);
  pg.beginShape();
      
      // Use the center of the canvas as the base x position
      let centerX = nr;

      // Loop through the height of the canvas to draw the vertical line (step by 4 for performance)
      for (let y = 0; y < height; y += 4) {
        // Calculate the noise value for this point
        // The noise is based on the vertical position (y) and a time offset (noiseOffset)
        let noiseVal = noise((y * noiseScale), noiseOffset);
        // Map the noise value (from 0-1) to the desired amplitude range
        let x = map(noiseVal, 0, 1, centerX - amplitude, centerX + amplitude);
        // Add a vertex to the shape at the calculated x and current y
        pg.vertex(x, y);
      }
      
      // End the shape and draw the line
      pg.endShape();

      // Increment the noise offset to make the line move and change its wobble
      noiseOffset += 0.01;

}



function handleOrientation(event) {
  rotationData.x = event.beta;
  rotationData.y = event.gamma;
  rotationData.z = event.alpha;
  dataReceived = true;


}

function mousePressed(){
  drawBox();
  console.log("press")
}

// orange, marine blue, red, grey, darkblue

let boxColors =["#FFA500", "#0077BE", "#FF0000", "#808080", "#00008B"];


function drawBox(){
  print("click");
  pg0.stroke(255);
  pg0.fill(255);
  // depending on shake strengh, draw multiple boxes#
  // devide the hight in 10 possible segments and draw x amount of boxes depending on shake strength
  let numSegments = 60;
  let maxBoxes = 6;
  let boxWidth = 25;
  let segmentHeight = height / numSegments;
  let numBoxes = floor(map(shakeStrength, 0, 1, 1, maxBoxes));

  console.log("Number of boxes to draw: " + numBoxes);

  for (let i = 0; i < numBoxes; i++) {
    // random color from the color array
    // the position should be random (segmentheight * random(0,numSegments))
    let posY = segmentHeight * floor(random(numSegments));
    // boxes x-pos should be in 40px steps. calculate the right x position. divide nr by 40
    let posX = floor(nr / boxWidth) * boxWidth;


    // decide randomly to draw the box on pg0 or pg
    if (random() < 0.5) {
      pg0.fill(boxColors[floor(random(boxColors.length))]);
      pg0.noStroke();
      pg0.rect(posX, posY, boxWidth, segmentHeight);
    } else {
      pg.noStroke();
      pg.fill(boxColors[floor(random(boxColors.length))]);
      pg.rect(posX, posY, boxWidth, segmentHeight);
    }
  }
}

function handleMotion(event) {
  accelerationData.x = event.acceleration.x;
  accelerationData.y = event.acceleration.y;
  accelerationData.z = event.acceleration.z;
  dataReceived = true;
}

function updateData() {
  if (!dataReceived) return;
  
  const currentTime = millis();
  
  // If using recorded data, update sensor values from recording
  if (useRecordedData && playbackData.length > 0) {
    if (playbackIndex >= playbackData.length) {
      playbackIndex = 0; // Loop playback
    }
    
    let dataPoint = playbackData[playbackIndex];
    rotationData.x = dataPoint.rotation.x;
    rotationData.y = dataPoint.rotation.y;
    rotationData.z = dataPoint.rotation.z;
    accelerationData.x = dataPoint.acceleration.x;
    accelerationData.y = dataPoint.acceleration.y;
    accelerationData.z = dataPoint.acceleration.z;
    
    playbackIndex++;
  }

  // Update shake data
  if (deviceShaken()) {
    isShaken = true;
    lastShakeTime = currentTime;
    shakeHistory.push(lastShakeTime);

    // calculate shake strength
    shakeStrength = map(abs(accelerationData.x), 0, SHAKE_THRESHOLD, 0, 1);
    shakeStrength = constrain(shakeStrength, 0, 1);

    console.log("Shake detected! Strength: " + shakeStrength);

    drawBox();

    // Toggle shakeToggle if enough time has passed since last toggle
    if (currentTime - lastToggleTime > TOGGLE_COOLDOWN) {
      shakeToggle = !shakeToggle;
      lastToggleTime = currentTime;
    }
  } else {
    // Set isShaken to false if SHAKE_TIMEOUT has passed since the last shake
    isShaken = currentTime - lastShakeTime < SHAKE_TIMEOUT;
  }
  timeSinceShake = (currentTime - lastShakeTime) / 1000;

  // Update shake rate
  shakeHistory = shakeHistory.filter(time => currentTime - time <= SHAKE_WINDOW);
  shakeRate = shakeHistory.length / (SHAKE_WINDOW / 1000);
}

function displayData() {
  background(220);
  let yPos = 20;
  const lineHeight = 20;

  textSize(16);
  fill(0);
  text("Device Motion and Orientation Data", 20, yPos);
  yPos += lineHeight * 1.5;

  textSize(12);

  if (!dataReceived) {
    text("Waiting for sensor data...", 20, yPos);
    return;
  }

  // Display rotation data
  text("Rotation:", 20, yPos);
  yPos += lineHeight;
  text("X: " + formatValue(rotationData.x) + "°", 40, yPos);
  yPos += lineHeight;
  text("Y: " + formatValue(rotationData.y) + "°", 40, yPos);
  yPos += lineHeight;
  text("Z: " + formatValue(rotationData.z) + "°", 40, yPos);
  yPos += lineHeight * 1.5;

  // Display acceleration data
  text("Acceleration:", 20, yPos);
  yPos += lineHeight;
  text("X: " + formatValue(accelerationData.x) + " m/s²", 40, yPos);
  yPos += lineHeight;
  text("Y: " + formatValue(accelerationData.y) + " m/s²", 40, yPos);
  yPos += lineHeight;
  text("Z: " + formatValue(accelerationData.z) + " m/s²", 40, yPos);
  yPos += lineHeight * 1.5;

  // Display shake data
  text("Device Shaken: " + (isShaken ? "Yes" : "No"), 20, yPos);
  yPos += lineHeight;
  text("Time Since Last Shake: " + timeSinceShake.toFixed(2) + " seconds", 20, yPos);
  yPos += lineHeight;
  text("Shake Rate: " + shakeRate.toFixed(2) + " shakes/second", 20, yPos);
  yPos += lineHeight * 1.5;

  // Display shake toggle status
  text("Shake Toggle: " + (shakeToggle), 20, yPos);
  
  //
  
  let dt = deltaTime / 1000; // convert ms to seconds

  let speed = getFilteredSpeed(
    accelerationData.x,
    accelerationData.y,
    accelerationData.z,
    dt
  );
  
   yPos += lineHeight * 1.5;

  // Display shake toggle status
  text("Speed: " + (speed ), 20, yPos);
  
  
}

function deviceShaken() {
  if (!dataReceived) return false;
  
  return (
    abs(accelerationData.x || 0) > SHAKE_THRESHOLD ||
    abs(accelerationData.y || 0) > SHAKE_THRESHOLD ||
    abs(accelerationData.z || 0) > SHAKE_THRESHOLD
  );
}

function formatValue(value) {
  return value !== null ? value.toFixed(2) : "N/A";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Mouse events for drag/pan functionality
function mousePressed() {
  // Check if we clicked on a button first
  if (mouseX >= toggleButton.position().x && 
      mouseX <= toggleButton.position().x + toggleButton.size().width &&
      mouseY >= toggleButton.position().y &&
      mouseY <= toggleButton.position().y + toggleButton.size().height) {
    return; // Clicked on toggle button, don't start dragging
  }
  
  if (mouseX >= toggleDataSourceButton.position().x && 
      mouseX <= toggleDataSourceButton.position().x + toggleDataSourceButton.size().width &&
      mouseY >= toggleDataSourceButton.position().y &&
      mouseY <= toggleDataSourceButton.position().y + toggleDataSourceButton.size().height) {
    return; // Clicked on data source button, don't start dragging
  }
  
  // If we're in visualization mode and didn't click a button, start dragging
  if (displayMode !== "data") {
    isDragging = true;
    dragStartX = mouseX;
    lastDragX = mouseX;
    dragInertia = 0;
    cursor('grab');
  }
}

function mouseDragged() {
  if (isDragging) {
    // Calculate how much to move the canvas
    let dx = mouseX - lastDragX;
    canvasOffset -= dx;
    
    // Make sure we don't scroll beyond the canvas bounds
    canvasOffset = constrain(canvasOffset, 0, pg.width - width);
    
    // Update the last position and calculate velocity for inertia
    dragInertia = mouseX - lastDragX;
    lastDragX = mouseX;
    
    cursor('grabbing');
  }
}

function mouseReleased() {
  isDragging = false;
  cursor(ARROW);
}

// Touch events (for mobile)
function touchStarted() {
  // Don't process touch events if we touched a button
  // Check if we touched on a button first
  if (touches.length === 1) {
    let touchX = touches[0].x;
    let touchY = touches[0].y;
    
    // Check for toggle button touch
    if (touchX >= toggleButton.position().x && 
        touchX <= toggleButton.position().x + toggleButton.size().width &&
        touchY >= toggleButton.position().y &&
        touchY <= toggleButton.position().y + toggleButton.size().height) {
      return; // Touched toggle button, don't start dragging
    }
    
    // Check for data source button touch
    if (touchX >= toggleDataSourceButton.position().x && 
        touchX <= toggleDataSourceButton.position().x + toggleDataSourceButton.size().width &&
        touchY >= toggleDataSourceButton.position().y &&
        touchY <= toggleDataSourceButton.position().y + toggleDataSourceButton.size().height) {
      return; // Touched data source button, don't start dragging
    }
  canvasOffset = constrain(canvasOffset, 0, pg.width - width);
    
    // Update the last position and calculate velocity for inertia
    dragInertia = touches[0].x - lastDragX;
    lastDragX = touches[0].x;
    
    return false; // Prevent default
  }
}

function touchEnded() {
  isDragging = false;
  // Autoscroll will resume in draw() when dragging ends
  return false; // Prevent default
}

function startDeviceMotionDetect() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    permissionButton = createButton('Click to allow access to sensors');
    permissionButton.style('font-size', '24px');
    permissionButton.position(20, 20);
    permissionButton.mousePressed(requestDevicePermissions);
  } else {
    // For browsers that don't require permission (e.g., Android)
    enableSensors();
  }
}

function requestDevicePermissions() {
  DeviceOrientationEvent.requestPermission()
    .then(response => {
      if (response == 'granted') {
        enableSensors();
        hidePermissionButton();
      }
    })
    .catch(console.error);
}

function enableSensors() {
  window.addEventListener('deviceorientation', handleOrientation);
  window.addEventListener('devicemotion', handleMotion);
}

function hidePermissionButton() {
  if (permissionButton) {
    permissionButton.remove();
  }
}

function toggleDisplayMode() {
  if (displayMode === "data") {
    displayMode = "translate";
    toggleButton.html('Switch to Data Mode');
    toggleButton.style('background-color', '#2196F3');
  } else {
    displayMode = "data";
    toggleButton.html('Switch to Visualization Mode');
    toggleButton.style('background-color', '#4CAF50');
  }
}
