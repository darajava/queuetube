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

regenerateMyToken = function() {
  localStorage['mytoken'] = 'blah';
};

getMyToken = function() {
  if (typeof localStorage['mytoken'] === 'undefined') {
    regenerateMyToken();
  }
  return localStorage['mytoken'];
}

setConnectedToken = function(token) {
  localStorage['connectedtoken'] = token;
  return localStorage['connectedtoken'];
}

getConnectedToken = function() {
  return localStorage['connectedtoken'];
}
chrome.runtime.onInstalled.addListener(function(details){
  if (details.reason == "install") {
    localStorage['bgOn'] = 'true';
    setText();
  }
});

var socket = io.connect("http://darajava.ie:3000");

socket.emit('subscribe', getMyToken());

socket.on('message', function(msg) {
  console.log(msg);
})

if (typeof getConnectedToken() !== 'undefined') {
  socket.emit('subscribe', getConnectedToken());
} 

// RECIEVE VIDEOS VIA SOCKET
chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    msg = JSON.parse(msg);
    switch (msg.action) {
      case 'setConnectedToken':
        // unsubscribe from old room
        socket.emit('unsubscribe', getConnectedToken());
        socket.emit('subscribe', setConnectedToken(msg.room));
      break;
    }
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
    socket.emit('send', {
      room: getConnectedToken(),
      video: request.video 
    });
    sendResponse({});
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

