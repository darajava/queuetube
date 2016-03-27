window.addEventListener("load", function()
{
  document.getElementById("myonoffswitch")
          .addEventListener("click", setSearch, false);
}, false);

function setSearch(){
  var BGPage = chrome.extension.getBackgroundPage();
  BGPage.setBg(this.checked);

  console.log();
};

