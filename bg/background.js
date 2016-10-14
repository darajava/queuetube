chrome.runtime.onInstalled.addListener(function(details){
  if (details.reason == "install") {
    localStorage['bgOn'] = 'true';
    setText();
  }
});

var socket = io.connect("http://darajava.ie:3000");

// RECIEVE VIDEOS VIA SOCKET
chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    msg = JSON.parse(msg);
    socket.emit('subscribe', msg.room);
    socket.emit('send', { room: msg.room, message: msg.message });
console.log('d');
    socket.on('message', function (data) {
      console.log(data);
    });

    port.postMessage("connection established");
  });
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.storage) {
    if (typeof request.value != 'undefined') {
      localStorage[request.storage] = request.value;
    }
    sendResponse({storage: localStorage[request.storage]});
  } else if (request.addvidremote) {
    // ADDING A VIDEO VIA SOCKET
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

generateMyToken = function() {
  localStorage['mytoken'] = 'blah';
  return localStorage['mytoken'];
}

getMyToken = function() {
  return localStorage['mytoken'];
}

setConnectedToken = function(token) {
  localStorage['connectedtoken'] = token;
  return localStorage['connectedtoken'];
}

getConnectedToken = function() {
  return localStorage['connectedtoken'];
}
