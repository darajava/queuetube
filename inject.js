var $originalSearch;
var $mySearch;

$(document).ready(function(){
  $originalSearch = $("#masthead-search").css("border", "1px solid green").clone(true, true);
  $mySearch = $("#masthead-search").clone(true, true);

  $mySearch = $mySearch.find("#search-btn")
      // remove the form submitting the search query
      .unwrap()
      // and add a new element with the same id and classes to keep style
      .wrap("<span id='masthead-search' class='search-form consolidated-form'></span>")
      .attr("onclick", "")
      .css("border", "1px solid red")
      .click(runThisLittleBeastInstead).parent().append($("#masthead-search-terms"));
  logElements();

  changeSearchBar();
});


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
  alert();
}

function logElements(){
  console.dir($originalSearch);
  console.dir($mySearch);
}
