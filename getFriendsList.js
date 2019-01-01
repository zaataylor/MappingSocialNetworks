//Gets list of friend page URLs and the friend's names

//make sure document is ready before we work with it 
$(document).ready(function () {
    chrome.runtime.onMessage.addListener(function (request, sender) {
        if (request.from == "background_1") {
            pageScroll(10, request).then(friendGetter)
        }
    })
})

//scrolls down page and gets the list of friends on the timeline
function pageScroll(scrollDirection, request) {
    return new Promise(function (resolve, reject) {
        //scroll down by scrollDirection number of pixels
        window.scrollBy(0, scrollDirection);
        //start a recursive set timeout call with delay of 25 milliseconds
        if (request.from == "background_1") {
            scrolldelay = setTimeout(function () { pageScroll(scrollDirection, request).then(friendGetter) }, 25);
        }

        //indicates bottom of page has been reached, so there is no need to continue recursive setTimeout calls
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            clearTimeout(scrolldelay);
            resolve();
        }
    })
}

//returns list of objects corresponding to friends list
var friendsArray = []
function friendGetter() {
    var friendsList = $("ul li[class=_698]")
    $(friendsList).each(function () {
        friendsArray.push(new Friend($(this)))
    })
    if (friendsArray.length == friendsList.length) {
        chrome.runtime.sendMessage({ from: "getFriendsList", message: friendsArray })
    }
}

//makes friend objects that have a person's name and the URL to their FB page
function Friend(friendObj) {
    this.name = $(friendObj).find("div[class='fsl fwb fcb'] a:nth-child(1)").text()
    this.pageUrl = $(friendObj).find("div[class=uiProfileBlockContent] a:nth-child(1)").attr("href")
    this.mutualFriends = []

    var idString = $(friendObj).find("div[class=uiProfileBlockContent] a:nth-child(1)").attr("data-hovercard")
    //regex that matches the string "id=" followed by one or more decimal digits and ending with an equals sign
    var regex = /id=(\d+)=*/
    var uuidString;
    if(idString != undefined){
        uuidString = idString.match(regex)
        this.fbID = uuidString[1]
    } else {
        //case where friend has deactivated their account
        var inactiveIDString = $(friendObj).find("div[class=uiProfileBlockContent] a:nth-child(1)").attr("ajaxify")
        uuidString = inactiveIDString.match(regex)
        this.fbID = uuidString[1]
    }
    
    this.mutualFriendsUrl = "https://www.facebook.com/browse/mutual_friends/?uid=" + this.fbID
    return this
}