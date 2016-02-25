var $originalSearch;
var $mySearch;


$(document).ready(function(){
  saveSearchBars();
  changeSearchBar();
});


function saveSearchBars() {
  $originalSearch = $("#masthead-search");
  $mySearch = setupSearchBar();
  $("#yt-masthead-content").append($mySearch);
}

function setupSearchBar() {
  $searchBar = $(`

<div id="my-masthead-search" class="search-form consolidated-form">
  <button id="my-search-btn" class="yt-uix-button yt-uix-button-size-default yt-uix-button-default search-btn-component search-button" tabindex="2" id="search-btn">
    <span class="yt-uix-button-content">Search</span>
  </button>
  <div id="my-masthead-search-terms" class="masthead-search-terms-border " dir="ltr">
    <input id="my-masthead-search-term" autocomplete="off" class="search-term masthead-search-renderer-input yt-uix-form-input-bidi" type="text" tabindex="1" title="Search" dir="ltr" spellcheck="true" style="outline: none;">
  </div>
</div>

`);

  $searchBar.css("border", "1px solid red");
  $searchBar.hide();

  $searchBar.click(runThisLittleBeastInstead);

  return $searchBar;
}

function changeSearchBar() {
    // If this is a video
    if(window.location.href.indexOf("www.youtube.com/watch?v=") != -1) {
      $mySearch.find("input").val($originalSearch.find("input").val());
      $mySearch.show();
      $originalSearch.hide();
    } else {
      $originalSearch.val($mySearch.val());

      $mySearch.hide();
      $originalSearch.show();
    }
}

function runThisLittleBeastInstead() {
  var query = "/results?search_query=" + encodeURIComponent($mySearch.find("input").val());

  $.ajax({
    url: query,
    type: "post",
    dataType: "html",
    success: function (data) {
      console.log(data);
    },
  });
}

// On page "reload" - youtube is kinda a single page app so
// listen in bg.js for page reloads
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  changeSearchBar();
});
