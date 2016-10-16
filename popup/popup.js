$(document).ready(function() {
  var port = chrome.extension.connect({name: "qtoob"});
  var BGPage = chrome.extension.getBackgroundPage();

  $('#regenerate').click(function() {
    var msg = {
      action: 'regenerateToken'
    };
    port.postMessage(JSON.stringify(msg));
  });
  $('#connectedtoken').change(function() {
    var msg = {
      room: $(this).val(),
      action: 'setConnectedToken'
    };
    port.postMessage(JSON.stringify(msg));
  });

  $('#nickname').change(function() {
    var msg = {
      nickname: $(this).val(),
      action: 'setNickname'
    };
    port.postMessage(JSON.stringify(msg));
  });

  $('#connectedtoken').val(BGPage.getConnectedToken());  

  port.onMessage.addListener(function(msg) {});

  $('#mytoken').val(BGPage.getMyToken());
  $('#nickname').val(BGPage.getNickname());
});
