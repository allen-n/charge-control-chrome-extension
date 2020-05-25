// Saves options to chrome.storage
function save_options() {
    var maxCharge = document.getElementById('max-charge-percent').value
    var minCharge = document.getElementById('min-charge-percent').value
    var apiKey = document.getElementById('api-key').value
    var onEventName = document.getElementById('on-event-name').value
    var offEventName = document.getElementById('off-event-name').value

    chrome.storage.sync.set({
        maxCharge: maxCharge,
        minCharge: minCharge,
        apiKey: apiKey,
        onEventName: onEventName,
        offEventName: offEventName
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved!';
        setTimeout(function () {
            status.textContent = '';
        }, 1500);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        maxCharge: 80,
        minCharge: 20,
        apiKey: "",
        onEventName: "",
        offEventName: ""
    }, function (items) {
        document.getElementById('max-charge-percent').value = items.maxCharge
        document.getElementById('min-charge-percent').value = items.minCharge
        document.getElementById('api-key').value = items.apiKey
        document.getElementById('on-event-name').value = items.onEventName
        document.getElementById('off-event-name').value = items.offEventName
    });
    console.log("Options restored")
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
document.getElementById('close').addEventListener('click', () => {
    window.close();
});
document.getElementById('show-api-key').addEventListener('click', () => {
    var x = document.getElementById("api-key");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
});