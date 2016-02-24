$(document).ready(function(){
  $("#search-btn")
    // remove the form submitting the search query
    .unwrap()
    // and add a new element with the same id and classes to keep style
    .wrap("<span id='masthead-search' class='search-form consolidated-form'></span>")
    .attr("onclick", "")
    .click(runThisLittleBeastInstead);
});


function runThisLittleBeastInstead() {
  alert();
}

