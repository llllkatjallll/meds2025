// Functions for loading and using recorded sensor data

// Load a JSON file containing sensor data
function loadJSONFile(filename) {
  console.log("Loading recorded data from:", filename);
  
  // Load JSON file
  loadJSON(filename, 
    // Success callback
    function(data) {
      playbackData = data;
      playbackIndex = 0;
      console.log("Loaded " + playbackData.length + " data points");
      dataReceived = true;
    },
    // Error callback
    function(error) {
      console.error("Error loading JSON file:", error);
    }
  );
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
