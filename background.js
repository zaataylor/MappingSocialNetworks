//background script that's always running
chrome.runtime.onInstalled.addListener(function(){
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: 'www.facebook.com', schemes: ['https'], pathContains: "profile.php"}
                })
            ],
            actions:[ new chrome.declarativeContent.ShowPageAction()]
        }])
    })
})

chrome.runtime.onMessage.addListener(
    function(message, sender, response){
        console.log(sender);
    }
)
