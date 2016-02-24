$(document).ready(function(){
  $("#search-btn")
    .unwrap() // Remove the form submitting the query
    .attr("onclick", "")
    .click(runThisLittleBeastInstead);
});


function runThisLittleBeastInstead() {
  alert();
}

