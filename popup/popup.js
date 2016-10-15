$(document).ready(function() {
  var port = chrome.extension.connect({name: "qtoob"});
  var BGPage = chrome.extension.getBackgroundPage();

  $('#connectedtoken').change(function() {
    var msg = {
      room: $(this).val(),
      action: 'setConnectedToken'
    };
    port.postMessage(JSON.stringify(msg));
  });

  $('#connectedtoken').val(BGPage.getConnectedToken());  

  port.onMessage.addListener(function(msg) {});

  $('#mytoken').val(BGPage.getMyToken());
});
