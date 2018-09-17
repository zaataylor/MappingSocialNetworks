//Background script that's always running

//displays popup if current page matches a certain state
chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: 'www.facebook.com', schemes: ['https'], pathContains: "profile.php" }
                })
            ],
            //highlights the extension's popup button when someone is on any part of their Facebook profile
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }])
    })
})

//registers connection between popup.js and background connection (popup -> background)
chrome.runtime.onConnect.addListener(function (port) {
    console.log("Connection established with " + port.name + "!")
})

//gets messages from getFriendsTimeline.js and getFriendsList.js
var messageCount = 0;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //message from getFriendsTimeline.js
    if (request.from === "getFriendsTL") {
        messageCount += 1;

        var pageLink = request.pageUrl
        console.log(sender.id)

        //storing the friend's timeline URL locally
        console.log(messageCount)
        if (messageCount == 1) {
            chrome.storage.local.set({ friendTimelineURL: pageLink })
            var homeURL = pageLink
            var regex = /id=(\d+)/
            //gets FB ID of the person who's clicked the extension
            var homeID = homeURL.match(regex)[1]
            chrome.storage.local.set({ startUserID: homeID }, function () {

            })
        }
        sendResponse(request)
    }
    
    //message from getFriendsList.js
    if (request.from === "getFriendsList") {
        resolveUsers(request).then(function (friendArray) {
            //sending information to the popup.js script
            if (port.name == "popup"){
                port.postMessage({userData: friendArray})
            }
        })
        sendResponse(request)
    }
})

//put objects in an array and return them
function resolveUsers(request) {
    var friendArray = []
    return new Promise(function (resolve, reject) {
        //put Friend objects in an array
        friendArray.push(request.message), function () {
            resolve(friendArray)
        }
    })
}

