//Gets list of friend page URLs and the friend's names

//make sure document is ready before we work with it 
$(document).ready(function () {
    var currentPageURL = window.location.href;
    if (currentPageURL.includes("pb_friends_tl")) {
        pageScroll().then(friendGetter)
    }
})

//scrolls down page and gets the list of friends on the timeline
var scrollDirection = 18;
function pageScroll() {
    return new Promise(function (resolve, reject) {
        window.scrollBy(0, scrollDirection);
        scrolldelay = setTimeout(function () { pageScroll().then(friendGetter) }, 50);
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
        var friend = new Friend($(this))
        chrome.runtime.sendMessage({ from: "getFriendsList", message: friend }, function (response) {
            console.log(response)
        })
    })
}

//makes friend objects that have a person's name and the URL to their FB page
function Friend(friendObj) {
    this.name = $(friendObj).find("div[class='fsl fwb fcb'] a:nth-child(1)").text()
    this.pageUrl = $(friendObj).find("div[class=uiProfileBlockContent] a:nth-child(1)").attr("href")
    this.mutualFriends = []

    var idString = $(friendObj).find("div[class=uiProfileBlockContent] a:nth-child(1)").attr("data-hovercard")
    //regex that matches the string "id=" followed by one or more decimal digits and ending with an equals sign
    var regex = /id=(\d+)=*/
    var uuidString = idString.match(regex)
    this.fbID = uuidString[1]
    this.mutualFriendsUrl = "https://www.facebook.com/browse/mutual_friends/?uid=" + this.fbID
    return this
}