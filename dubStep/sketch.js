/**
 * 
 * Description: This p5.js sketch demonstrates how to capture and display
 *              device motion and orientation data, including rotation,
 *              acceleration, shake detection, and shake rate.
 * 
 * Usage: 
 * - Run this sketch on a mobile device (Android or iOS)
 * - For iOS, you need to request permission to access motion sensors
 * - Move and rotate your device to see the values change
 * - Shake the device to trigger the shake detection and affect the shake rate
 * 
 * Dependencies: p5.js library
 * 
 * Variables:
 * rotationData: Object - Stores rotation data for X, Y, and Z axes
 * accelerationData: Object - Stores acceleration data for X, Y, and Z axes
 * isShaken: Boolean - Indicates if the device is currently shaken
 * shakeToggle: Boolean - Shake to toggle ON / Shake to toggle OFF
 * lastShakeTime: Number - Timestamp of the last detected shake
 * timeSinceShake: Number - Time elapsed since the last shake in seconds
 * dataReceived: Boolean - Indicates if any sensor data has been received
 * shakeHistory: Array - Stores timestamps of recent shakes
 * shakeRate: Number - Calculates the rate of shakes per second
 *
 * Author : Nick Puckett
 * Created using Github Copilot 
 */

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

const SHAKE_WINDOW = 3000; // Consider shakes in the last 3 seconds
const SHAKE_THRESHOLD = 20; // Acceleration threshold for shake detection
const SHAKE_TIMEOUT = 500; // Time in milliseconds to consider a shake "active"
const TOGGLE_COOLDOWN = 1000; // Cooldown period for toggle (in milliseconds)

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(LEFT, TOP);
  frameRate(60);

  startDeviceMotionDetect();
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

function draw() {
  //background(220);
  updateData();
  //displayData();
  translateData();
}

// ********** CREATIVE PART HERE //

let curPosX = 0;
let curPosY = 0;
let distanceX = 60;
let distanceY = 5;



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
  
  if (accelerationData.x > 0.2 ||  accelerationData.x < -0.2 ){
    stroke(0,0,255)
    circle(curPosX, curPosY, sizeX);
    stroke(255,0,0)
    circle(curPosX + 20, curPosY, sizeY);
    stroke(0,255,0)
    circle(curPosX + 40, curPosY, sizeZ);
  }
  
  
}

function handleOrientation(event) {
  rotationData.x = event.beta;
  rotationData.y = event.gamma;
  rotationData.z = event.alpha;
  dataReceived = true;
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

  // Update shake data
  if (deviceShaken()) {
    isShaken = true;
    lastShakeTime = currentTime;
    shakeHistory.push(lastShakeTime);
    
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
  text("Shake Toggle: " + (shakeToggle ? "ON" : "OFF"), 20, yPos);
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