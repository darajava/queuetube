var $originalSearch;
var $mySearch;

var $searchButton;
var $searchTerms;

$(document).ready(function(){
  saveSearchBars();
  logElements();

  changeSearchBar();
});


function saveSearchBars() {
  $originalSearch = $("#masthead-search").clone(true, true).css("border", "1px solid green");

  $searchButton = $('#search-btn').detach();
  $searchTerms = $('#masthead-search-terms').detach();

  $searchButton.attr("onclick", "").css("border", "1px solid red").click(runThisLittleBeastInstead);

  $mySearch = $("<div id='masthead-search' class='search-form consolidated-form'></div>")
    .append($searchButton)
    .append($searchTerms);
}

function changeSearchBar() {
  // If this is a video
  if(window.location.href.indexOf("www.youtube.com/watch?v=") != -1) {
    $("#yt-masthead-content").empty().append($mySearch);
  } else {
    $("#yt-masthead-content").empty().append($originalSearch);
  }
}

function runThisLittleBeastInstead() {
  console.log("for real?");
  alert();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  changeSearchBar();
});

function logElements(){
  console.dir($originalSearch);
  console.dir($mySearch);
}
