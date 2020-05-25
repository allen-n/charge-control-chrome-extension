function updateBatteryLevel(level, isCharging) {
  const batteryLevelText = level !== 1 ? (level * 100).toFixed() : '';
  const chargingStatus = isCharging ? 'charging' : 'not-charging';

  chrome.browserAction.setIcon({
    path: `./images/icon-${chargingStatus}.png`
  });

  chrome.browserAction.setBadgeText({
    text: batteryLevelText
  });

  chrome.browserAction.setBadgeBackgroundColor({
    color: [94, 97, 106, 255]
  });
}


/**
 * Makes a http request to the iftt webhook specified in options.js
 * @param {Boolean} turnOn - true if a request to the "Turn On" routine should be made, else false
 * @param {Function} callback - a callback function to be called, will be passed the status code of the HTTP request as arg
 */
const makeReq = (turnOn, callback = null) => {
  chrome.storage.sync.get({
    apiKey: "",
    onEventName: "",
    offEventName: ""
  }, function (items) {
    if (items.apiKey == "" ||
      items.onEventName == "" ||
      items.offEventName == "") {
      console.error(`Couldn't control your power supply. 
        The apiKey, Turn On, and Turn Off event names all must be set 
        in settings`);
    } else {
      const req = new XMLHttpRequest();
      const eventName = turnOn ? items.onEventName : items.offEventName;
      const apiKey = items.apiKey;
      const baseUrl = "https://maker.ifttt.com/trigger/" + eventName + "/with/key/" + apiKey;
      const value1 = "1"; // Not used, but can be used in certain routines
      const value2 = "2"
      const urlParams = `value1=${value1}&value2=${value2}`;

      req.open("POST", baseUrl, true);
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      req.send(urlParams);

      req.onreadystatechange = function () { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          // console.log("Got response 200!"); // Success
          if (callback != null) {
            callback(this.status)
          }
        }
      }
    }
  });
}

/**
 * Automatically fire the "Turn On" webhook specified in options.js
 * if the level < minCharge, and the "Turn Off" webhook if 
 * level > maxCharge
 * @param {Number} level - The current battery level %, should be between 0 and 100
 * @param {Boolean} isCharging - True if battery is currently charging, else false
 */
const handleBatteryLevel = (level, isCharging) => {
  level *= 100 // Change to percent
  chrome.storage.sync.get({
    maxCharge: 80,
    minCharge: 20,
  }, function (items) {
    if (level > items.maxCharge && isCharging) {
      makeReq(false);
    }
    if (level < items.minCharge && !isCharging) {
      makeReq(true);
    }
  });
}

function getBatteryStatus() {
  navigator.getBattery().then(battery => {
    updateBatteryLevel(battery.level, battery.charging);
    handleBatteryLevel(battery.level, battery.charging);
  });
}

chrome.alarms.create('batteryLevel', {
  when: Date.now() + 1000,
  periodInMinutes: 2
});
chrome.runtime.onInstalled.addListener(getBatteryStatus);
chrome.alarms.onAlarm.addListener(getBatteryStatus);