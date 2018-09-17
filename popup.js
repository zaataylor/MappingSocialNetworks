//controls what happens when popup (a button) is clicked
var button = document.getElementById('touchToMap');

var timelineURL;


//executed when the blue button described in popup.html is clicked
button.onclick = function () {
    //open URL corresponding to Friend's portion of Timeline
    chrome.storage.local.get(['friendTimelineURL'], function (result) {
        timelineURL = result.friendTimelineURL
        chrome.tabs.create({ url: timelineURL, active: true }, function () {

        })
    })

    //establishing connection between getFriendsList.js and background script after button is clicked
    var port = chrome.runtime.connect({ name: "popup" })

    port.onMessage.addListener(function (msg) {
        if (port.name == "popup") {
            var friends = msg.userData
            chrome.tabs.query({ active: true, currentWindow: true }, function () {
                chrome.tabs.create({ url: friends.slice(-1)[0].mutualFriendsUrl, active: false })
            })
        } else {
            console.log("Error!")
        }
    });
}
