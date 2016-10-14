$(document).ready(function() {
  var port = chrome.extension.connect({name: "qtoob"});
  var BGPage = chrome.extension.getBackgroundPage();

  $('#connectedtoken').change(function() {
    var msg = {
      room: $(this).val(),
      message: $('#mytoken').val()
    };
    BGPage.setConnectedToken(msg.room);
    port.postMessage(JSON.stringify(msg));
  });

  $('#connectedtoken').val(BGPage.getConnectedToken());  

  port.onMessage.addListener(function(msg) {});

  if (BGPage.getMyToken() == "") {
    $('#mytoken').val(BGPage.generateMyToken());
  } else {
    $('#mytoken').val(BGPage.getMyToken());
  }
});
