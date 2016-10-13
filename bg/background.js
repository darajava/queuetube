function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

chrome.runtime.onInstalled.addListener(function(details){
  if (details.reason == "install") {
    localStorage['bgOn'] = 'true';
    setText();
  }
});


chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.storage) {
    if (typeof request.value != 'undefined') {
      localStorage[request.storage] = request.value;
    }
    sendResponse({storage: localStorage[request.storage]});
  } else if (request.addvidremote) {
    var socket = io.connect("http://darajava.ie:3000");
    socket.emit('chat message', 'lolol');
    sendResponse({farewell: socket.toString()});
  }
});

//Listen for when a Tab changes state
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  if(changeInfo && changeInfo.status == "complete") {
    chrome.tabs.sendMessage(tabId, {data: tab}, function(response) {
    });
  }
});

chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    console.log("message recieved"+ msg);
  });
});

function setText() {
  chrome.browserAction.setBadgeText({   
    text: localStorage['bgOn'] === "true" ? "ON" : "OFF"
  });
}

setText();

getBg = function() {
  return localStorage['bgOn'];
};

setBg = function(bgOn) {
  localStorage['bgOn'] = bgOn;
  setText();
};

