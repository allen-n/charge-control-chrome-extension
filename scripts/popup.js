document.addEventListener('DOMContentLoaded', function () {
  const statusElement = document.getElementById('status');
  const iconNotChargingElement = document.getElementById('i-notCharging');
  const iconChargingElement = document.getElementById('i-charging');
  let batteryInfo = {
    level: '',
    levelText: '',
    time: '',
    timeText: ''
  }

  // Add test buttons

  const lowBattery = () => {
    console.log("LOW")
  }

  const highBattery = () => {
    console.log("HIGH")
    makeReq();
  }

  document.getElementById("low-batt").addEventListener('click', lowBattery);
  document.getElementById("high-batt").addEventListener('click', highBattery);

  // Make HTTP Request

  const makeReq = () => {
    const req = new XMLHttpRequest();
    const eventName = "comp_batt_high";
    const apiKey = "8XGpdlz5pZqNFdaRgPJFd";
    const baseUrl = "https://maker.ifttt.com/trigger/" + eventName + "/with/key/" + apiKey;
    const value1= "1";
    const value2 = "2"
    const urlParams = `value1=${value1}&value2=${value2}`;

    req.open("POST", baseUrl, true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send(urlParams);

    req.onreadystatechange = function () { // Call a function when the state changes.
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        console.log("Got response 200!");
      }
    }
  }

  navigator.getBattery().then(battery => {
    let date = new Date(null);

    batteryInfo.level = (battery.level * 100).toFixed();

    chrome.browserAction.setBadgeText({
      text: battery.level !== 1 ? batteryInfo.level.toString() : ''
    });

    chrome.browserAction.setBadgeBackgroundColor({
      color: [94, 97, 106, 255]
    });

    if (battery.charging) {
      iconChargingElement.style.display = 'block';

      batteryInfo.levelText = 'Charged';

      if (isFinite(battery.chargingTime) && battery.level !== 1) {
        date.setSeconds(battery.chargingTime);

        batteryInfo.time = date.toISOString().substr(11, 5);
        batteryInfo.timeText = 'Until Full';
      } else if (isFinite(battery.chargingTime) && battery.level === 1) {
        batteryInfo.levelText += ' ⚡️';
      } else {
        batteryInfo.timeText = '';
      }
    } else {
      iconNotChargingElement.style.display = 'block';

      batteryInfo.levelText = 'Power Left';

      if (isFinite(battery.dischargingTime)) {
        date.setSeconds(battery.dischargingTime);

        batteryInfo.time = date.toISOString().substr(11, 5);
        batteryInfo.timeText = 'Remaining';
      } else {
        batteryInfo.timeText = '';
      }
    }

    let markup = `
      <p><b>${batteryInfo.level}</b>% ${batteryInfo.levelText}</p>
      <p><b>${batteryInfo.time}</b> ${batteryInfo.timeText}</p>
    `;

    statusElement.innerHTML = markup;
  });
});
