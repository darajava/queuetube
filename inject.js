$(document).ready(function(){
  // If this is a video
  if(window.location.href.indexOf("www.youtube.com/watch?v=") != -1) {
    $("#search-btn")
      // remove the form submitting the search query
      .unwrap()
      // and add a new element with the same id and classes to keep style
      .wrap("<span id='masthead-search' class='search-form consolidated-form'></span>")
      .attr("onclick", "")
      .css("border", "1px solid red")
      .click(runThisLittleBeastInstead);
  }
});

$(window).on('hashchange', function(e){
}

function runThisLittleBeastInstead() {
  alert();
}

