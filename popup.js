window.addEventListener("load", function()
{
  var BGPage = chrome.extension.getBackgroundPage();
  bg = BGPage.getBg();

  document.getElementById("myonoffswitch").checked = bg === "true";
  document.getElementById("myonoffswitch")
          .addEventListener("click", setSearch, false);
}, false);

function setSearch(){
  var BGPage = chrome.extension.getBackgroundPage();
  BGPage.setBg(this.checked);

  console.log();
};

