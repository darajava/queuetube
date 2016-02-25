var $originalSearch;
var $mySearch;

$(document).ready(function(){
  saveSearchBars();
  logElements();

  changeSearchBar();
});


function saveSearchBars() {
  $originalSearch = $("#masthead-search").clone(true, true).css("border", "1px solid green");

  var $searchButton = $('#search-btn').detach();
  var $searchTerms = $('#masthead-search-terms').detach();

  $searchButton.attr("onclick", "").css("border", "1px solid red").click(runThisLittleBeastInstead);

  $mySearch = $("<div id='masthead-search' class='search-form consolidated-form'></div>")
    .append($searchButton)
    .append($searchTerms);
}

function myListener(tabId, info, tab) {
  alert("ok");
}

function changeSearchBar() {
  // If this is a video
  if(window.location.href.indexOf("www.youtube.com/watch?v=") != -1) {
    //alert('vid');
    $("#yt-masthead-content").empty().append($mySearch);
  } else {
    $("#yt-masthead-content").empty().append($originalSearch);
  }
}

function runThisLittleBeastInstead() {
  console.log("for real?");
  alert();
}

function logElements(){
  console.dir($originalSearch);
  console.dir($mySearch);
}
