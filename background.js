//Background script that's always running


//Displays popup if current page matches a certain state
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


//Gets messages from getFriendsTimeline.js, getFriendsList.js, popup.js, and viz.js scripts
//current user's display name
var displayName;
//current user's FB id
var initUserID;
//number of messages sent so far
var messageCount = 0;
//list of friends in network (including current user)
var finalFriendList = [];
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //message from getFriendsTimeline.js
    if (request.from === "getFriendsTL") {
        messageCount += 1;

        var pageLink = request.pageUrl
        var userName = request.displayName

        //storing the friend's timeline URL locally
        if (messageCount == 1) {
            chrome.storage.local.set({ friendTimelineURL: pageLink })
            var homeURL = pageLink
            var regex = /id=(\d+)/
            //gets FB ID of the person who's clicked the extension
            var homeID = homeURL.match(regex)[1]
            chrome.storage.local.set({ startUserID: homeID })
            initUserID = homeID;
            chrome.storage.local.set({ startUserName: userName })
            displayName = userName;
        }
        sendResponse(request)
    }

    //message from getFriendsList.js
    if (request.from == "getFriendsList") {
        mutualFriendsSimulator(request.message)
    }

    //message from the popup button
    if (request.from == "popup") {
        //open URL corresponding to Friend's portion of Timeline
        chrome.storage.local.get(['friendTimelineURL'], function (result) {
            timelineURL = result.friendTimelineURL
            chrome.tabs.create({ url: timelineURL, active: true })
        })
    }

    //message from viz.js
    if (request.from = "viz") {
        //send the list of friends to viz
        sendResponse({ data: finalFriendList, from: "background_2" })
    }
})


//listens for newly created tab
chrome.tabs.onCreated.addListener(function (tab) {
    //We need to listen for updates on the tab that was created
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        chrome.storage.local.get(['startUserID'], function (result) {
            var startID = result.startUserID
            var url = tab.url
            var TLString = "pb_friends_tl"
            //send a message that will initiate scrolling down the page
            if (url.includes(startID) && changeInfo.status == "complete" && url.includes(TLString)) {
                chrome.tabs.sendMessage(tab.id, { from: "background_1" })
            }
        })
    })
})

//Generates a simulated list of friends for each friend in friends list
function mutualFriendsSimulator(friends) {
    return new Promise(function (resolve, reject) {
        //for each friend in my friends list
        for (j = 0; j < friends.length; j++) {
            //give them a random number of mutual friends
            numFriends = Math.floor(Math.random() * friends.length / Math.log(friends.length));
            //select from the mutual friends list the required number of friends

            //keeps track of indices already selected
            var selectedIndices = []
            for (i = 0; i < numFriends; i++) {
                //select a random friend from the list
                idx = Math.floor(Math.random() * friends.length / Math.log(friends.length));
                //prevent adding someone as their own mutual or adding a duplicate mutual friend
                if (idx == j || selectedIndices.includes(idx)) {
                    i--;
                } else {
                    /*
                    Add the person to the mutualFriends array
                    To avoid circular references and resulting JSON stringify errors, I put
                    copies of friend objects in each friend object's mutualFriends 
                    array instead of the actual friend objects themselves.
                    The copies have an empty array as the value for the mutualFriends
                    property.
                    */
                    var f = Object.assign({}, friends[idx])
                    f.mutualFriends = [];
                    friends[j].mutualFriends.push(f);
                    //make sure we can't add the mutual friend at that index again
                    selectedIndices.push(idx)
                }
            }
        }

        //add current user to the friends array
        friends.push(new Friend(displayName, initUserID))
        /*
        set the current user's mutual friends array to have a
        reference to everyone else. This really corresponds to the
        current user's friend list
        */
        for (i = 0; i < friends.length - 1; i++) {
            friends[friends.length - 1].mutualFriends.push(friends[i]);
        }

        //put all of these users (including the current user) into a final list of friends
        finalFriendList = []
        finalFriendList.push(friends)

        //open a tab to the page that the visualization will be on
        chrome.tabs.create({ url: "chrome-extension://oeafjbhmalmbhdphiiimhfbcnadnfnhn/background.html", active: true })
        resolve();
    })
}

//Makes a Friend object that corresponds to the current user
function Friend(name, fbID) {
    this.mutualFriends = []
    this.name = name;
    this.fbID = fbID;
}
