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

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

regenerateMyToken = function() {
  var consonants = 'weruoaszxcvnm';
  var vowels = 'aeou';
  
  var blocks = randomInt(3, 4);

  var token = '';  

  var pickConsonant = true;

  do {
    var blockLength = randomInt(3, 6);
    do {
      if (pickConsonant) {
        token += consonants.charAt(randomInt(0, consonants.length - 1));
        pickConsonant = false;
      } else {
        token += vowels.charAt(randomInt(0, vowels.length - 1));
        if (randomInt(0, 3) == 0) {
          pickConsonant = true;
        }
      }
    } while(--blockLength > 0);
    pickConsonant = true;
    token += '-'
  } while(--blocks > 0);
  
  localStorage['mytoken'] = token.slice(0, -1);
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

getNickname = function() {
  return localStorage['nickname'];
}

setNickname = function(nick) {
  localStorage['nickname'] = nick;
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
  chrome.tabs.query({}, function(tabs) {
    for (var i=0; i<tabs.length; ++i) {
      if (tabs[i].url.indexOf('youtube.com') !== -1)
        if (msg.room == getMyToken()) { 
          chrome.tabs.sendMessage(tabs[i].id, {action: 'addRemote', video: msg.video, nickname: msg.nickname});
      }
    }
  });
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
      case 'setNickname':
        setNickname(msg.nickname);
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
      video: request.video,
      nickname: getNickname() 
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

