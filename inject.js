var $originalSearch;
var $mySearch;


$(document).ready(function(){
  // remove ads
  $("#watch7-sidebar-ads").remove();

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

  $searchBar.hide();

  $searchBar.find("#my-search-btn").click(runThisLittleBeastInstead);
  $searchBar.find("input").keydown(function(event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == 13) {
      runThisLittleBeastInstead();
    }
  })

  return $searchBar;
}

function changeSearchBar() {
    // If this is a video
    if(window.location.href.indexOf("www.youtube.com/watch?v=") != -1) {
      $mySearch.find("input").val($originalSearch.find("input").val());
 
      $mySearch.show();
      $originalSearch.hide();
    } else {
      $originalSearch.find("input").val($mySearch.find("input").val());

      $mySearch.hide();
      $originalSearch.show();
    }
}

function runThisLittleBeastInstead() {
  if($mySearch.find("input").val() == "") return;
  addLoadingScreen();
  getSearchResults();
}

function addLoadingScreen() {
  var overlay = jQuery('<div id="my-overlay"> </div>');
  var imgURL = chrome.extension.getURL("spinner.gif");
  var spinner = jQuery('<div id="my-overlay-spinner"> </div>');
  spinner.css("background-image", "url(" + imgURL + ")");
  $('#watch7-sidebar').append(overlay);
  $('#watch7-sidebar').append(spinner);
}

function removeOverlay() {
  $("#my-overlay").remove();
  $("#my-overlay-spinner").remove();
}

function getSearchResults() {
  var query = "/results?search_query=" + encodeURIComponent($mySearch.find("input").val());
  var results;

  $.ajax({
    url: query,
    type: "post",
    dataType: "html",
    success: function(data){replaceSidebar(data, $mySearch.find("input").val())},
  });
}

function replaceSidebar(data, query) {
  $nodes = $(data).find(".yt-lockup");
  //console.log($nodes);  

  var newNodes = []; 
  $nodes.each(function() {
    newNodes.push(createNewSideRes($(this)));
  });

  $("#generated-res").remove();
  $("#watch7-sidebar-contents #watch-related.video-list").empty();
  $("#watch7-sidebar-contents #watch-related.video-list").append($("<div id='generated-res' class='watch-sidebar-section'>Search results for: <i><b>" + query + "</b></i></div>"));
  newNodes.forEach(function(node) {
    $("#watch7-sidebar-contents #watch-related.video-list").append(node);
  })
  
  removeOverlay();
  //console.log(newNodes);
}

function createNewSideRes($normalSearchResult) {
  var duration = $normalSearchResult.find(".accessible-description").text().replace(" - Duration: ", "").replace("Already watched.", "").replace(".", "");
  var ago = $normalSearchResult.find(".yt-lockup-meta-info li:nth-child(1)").text();
  var title = $normalSearchResult.find(".yt-lockup-title a").text();
  var channel = $normalSearchResult.find(".yt-lockup-byline a").text();
  var channelHref = $normalSearchResult.find(".yt-lockup-byline a").attr("href");
  var views = $normalSearchResult.find(".yt-lockup-meta-info li:nth-child(2)").text();
  var image = $normalSearchResult.find(".yt-thumb-simple img").data("thumb");
  var url = $normalSearchResult.find(".yt-lockup-title a").attr("href");
  var videoID = url.replace("/watch?v=", "");

  if (typeof image === "undefined")
    image = $normalSearchResult.find(".yt-thumb-simple img").attr("src");
//console.log($normalSearchResult.find(".yt-thumb-simple img")[0]);
console.log(image);
$newRes = $(`
<li class="video-list-item related-list-item related-list-item-compact-video">
  <div class="content-wrapper">
  <a href="${url}" class="yt-uix-sessionlink content-link spf-link" title="${title}">
    <span class="title">
      ${title}
    </span>
    <span class="accessible-description" id="description-id-325936">
       - Duration: ${duration}.
    </span>
    <span class="stat attribution">
      <span class="g-hovercard">
        ${title}
      </span>
    </span>
    <span class="stat view-count">${views}</span>
  </a>
  </div>
  <div class="thumb-wrapper">
    <a href="${url}" class="yt-uix-sessionlink thumb-link spf-link" tabindex="-1"><span class="yt-uix-simple-thumb-wrap yt-uix-simple-thumb-related" tabindex="0"><img aria-hidden="true" width="120" alt="" src="${image}" height="90"></span>
    </a>
    <span class="video-time">
      ${duration}
    </span>

  <span class="thumb-menu dark-overflow-action-menu video-actions">
    <button aria-expanded="false" onclick=";return false;" class="yt-uix-button-reverse flip addto-watch-queue-menu spf-nolink hide-until-delayloaded yt-uix-button yt-uix-button-dark-overflow-action-menu yt-uix-button-size-default yt-uix-button-has-icon no-icon-markup yt-uix-button-empty" type="button" aria-haspopup="true"><span class="yt-uix-button-arrow yt-sprite"></span><ul class="watch-queue-thumb-menu yt-uix-button-menu yt-uix-button-menu-dark-overflow-action-menu hid"><li role="menuitem" class="overflow-menu-choice addto-watch-queue-menu-choice addto-watch-queue-play-next yt-uix-button-menu-item" data-action="play-next" onclick=";return false;" data-video-ids="${videoID}"><span class="addto-watch-queue-menu-text">Play next</span></li><li role="menuitem" class="overflow-menu-choice addto-watch-queue-menu-choice addto-watch-queue-play-now yt-uix-button-menu-item" data-action="play-now" onclick=";return false;" data-video-ids="${videoID}"><span class="addto-watch-queue-menu-text">Play now</span></li></ul></button>
  </span>
  <button class="yt-uix-button yt-uix-button-size-small yt-uix-button-default yt-uix-button-empty yt-uix-button-has-icon no-icon-markup addto-button addto-queue-button video-actions spf-nolink hide-until-delayloaded addto-tv-queue-button yt-uix-tooltip" type="button" onclick=";return false;" title="Queue" data-video-ids="${videoID}" data-style="tv-queue"></button>
</div>

</li>
`);

  return $newRes;
}

// On page "reload" - youtube is kinda a single page app so
// listen in bg.js for page reloads
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  changeSearchBar();
});
