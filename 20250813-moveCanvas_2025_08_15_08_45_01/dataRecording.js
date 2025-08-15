// Functions for recording, downloading, and loading sensor data

// Records the current sensor data point
function recordDataPoint() {
  let dataPoint = {
    timestamp: millis(),
    rotation: {
      x: rotationData.x,
      y: rotationData.y,
      z: rotationData.z
    },
    acceleration: {
      x: accelerationData.x,
      y: accelerationData.y,
      z: accelerationData.z
    }
  };
  recordedData.push(dataPoint);
}

// Toggle recording on/off
function toggleRecording() {
  isRecording = !isRecording;
  
  if (isRecording) {
    // Clear previous recordings when starting a new recording
    recordedData = [];
    recordButton.html('Stop Recording');
    recordButton.style('background-color', '#F44336');
    lastRecordTime = millis();
    console.log("Recording started");
  } else {
    recordButton.html('Start Recording');
    recordButton.style('background-color', '#FF5722');
    console.log("Recording stopped. Recorded " + recordedData.length + " data points");
  }
}

// Download the recorded data as a JSON file
function downloadRecordedData() {
  if (recordedData.length === 0) {
    alert("No data recorded yet!");
    return;
  }
  
  // Create a JSON blob
  let dataStr = JSON.stringify(recordedData);
  let blob = new Blob([dataStr], {type: 'application/json'});
  
  // Create download link
  let url = URL.createObjectURL(blob);
  let downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'sensor_data_' + Date.now() + '.json';
  
  // Trigger download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  console.log("Downloaded " + recordedData.length + " data points");
}

// Handle file upload
function handleFileUpload(file) {
  if (file.type !== 'application/json') {
    alert('Please upload a JSON file');
    return;
  }
  
  // Read the file
  let reader = new FileReader();
  reader.onload = function(event) {
    try {
      playbackData = JSON.parse(event.target.result);
      playbackIndex = 0;
      console.log("Loaded " + playbackData.length + " data points");
      
      // Switch to recorded data automatically
      useRecordedData = true;
      updateDataSourceButton();
      
    } catch (e) {
      alert('Error parsing JSON: ' + e.message);
      console.error("Error parsing JSON:", e);
    }
  };
  reader.readAsText(file.file);
}

// Toggle between live sensor data and recorded data
function toggleDataSource() {
  useRecordedData = !useRecordedData;
  updateDataSourceButton();
}

// Update the data source button text and color
function updateDataSourceButton() {
  if (useRecordedData) {
    toggleDataSourceButton.html('Use Live Sensors');
    toggleDataSourceButton.style('background-color', '#9C27B0');
  } else {
    toggleDataSourceButton.html('Use Recorded Data');
    toggleDataSourceButton.style('background-color', '#673AB7');
  }
  
  // Reset playback index when toggling
  playbackIndex = 0;
}

// Helper function to format values for display
function formatValue(value) {
  return value !== null ? value.toFixed(2) : "N/A";
}
