var $originalSearch;
var $mySearch;
var bgOn;

$(document).ready(function(){
  saveSearchBars();
  options();
  regeneratePlaylist();
  changeSearchBar();
});

$("video").bind('ended', function(){  
  alert();
  document.location = $(".autoplay-bar ul li:first-child a:first-child").attr("href");
});

function saveSearchBars() {
  $originalSearch = $("#masthead-search");
  $mySearch = setupSearchBar();
  $("#yt-masthead-content").append($mySearch);
}

function options() {
  bgOn = getCookie("bgOn") == "true";
  if (getCookie("bgOn") == null)
  {
    setCookie("bgOn", "true", 1000);
    bgOn = getCookie("bgOn") == "true";
  }
  $(".myoptions").remove();
  var $options = $(`
<div class="myoptions checkbox-on-off">
       <label for="background-checkbox">Background search</label>
          <span class="yt-uix-checkbox-on-off ">
<input class="background-checkbox" class="" type="checkbox"><label for="background-checkbox" id="background-checkbox-label"><span class="checked"></span><span class="toggle"></span><span class="unchecked"></span></label>  </span>

      </div>
`);
  $options.insertAfter($(".checkbox-on-off"));
  $(".background-checkbox").prop("checked", bgOn);
  $(".myoptions").css("right", "140px");
  
  $(".background-checkbox").click(function () {
    if (getCookie("bgOn") == "true") {
      setCookie("bgOn", "false", 1000);
    } else {
      setCookie("bgOn", "true", 1000);
    }
    changeSearchBar(); 
    $(".background-checkbox").prop("checked", bgOn);
  });
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
      bgOn = getCookie("bgOn") == "true"; 
      if (bgOn) { 
        $mySearch.find("input").val($originalSearch.find("input").val());
        $mySearch.show();
        $originalSearch.hide();
      } else {
        $originalSearch.find("input").val($mySearch.find("input").val());
        $originalSearch.show();
        $mySearch.hide();
      }
    } else {
      $originalSearch.find("input").val($mySearch.find("input").val());

      $mySearch.hide();
      $originalSearch.show();
    }
}

function runThisLittleBeastInstead() {
  if($mySearch.find("input").val() == "") return;
  addOverlay();
  getSearchResults();
}

function addOverlay() {
  var overlay = jQuery('<div id="my-overlay"><div class="loader"></div></div>');
  $('#watch7-sidebar').append(overlay);
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

  $(".add-to-playlist").click(function(e) {
    e.preventDefault();
    addToPlaylist($(this).parent().parent().parent());
  });
 
  removeOverlay();
}

jQuery.fn.outerHTML = function() {
  return jQuery('<div />').append(this.eq(0).clone()).html();
};

function addToPlaylist($searchElem) {
  setCookie("playlistvid" + Date.now(), $searchElem.outerHTML());

  regeneratePlaylist();
}

function regeneratePlaylist() {
  $(".autoplay-bar ul").empty();
  var i = 1;
  var autoplayCookies = getCookieByMatch(/^(playlistvid\d+)/).sort();
  console.log(autoplayCookies);
  autoplayCookies.forEach(function(entry) {
    $playlistItem = $(getCookie(entry));
    // if this video is currently playing, remove it from playlist 
    if (window.location.toString().indexOf($playlistItem.find("a").attr("href")) > -1) {
      eraseCookie(entry);
      return;
    }
    $playlistItem.find(".add-to-playlist").remove();
    $(".autoplay-bar ul").append($playlistItem);
  });
}

function getCookieByMatch(regex) {
  var match, cs=document.cookie.split(/;\s*/), ret=[], i;
  for (i=0; i<cs.length; i++) {
    match = regex.exec(cs[i]);
    if (match != null && typeof match[1] !== "undefined") {
      ret.push(match[1]);
    }
  }
  return ret;
};

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
  
  var id = "a" + Math.random().toString(26).slice(10);
  
  if (typeof image === "undefined")
    image = $normalSearchResult.find(".yt-thumb-simple img").attr("src");

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
    <span class="stat add-to-playlist" data-video-id="${url}"><button>Add to playlist</button></span>
  </a>
  </div>
  <div class="thumb-wrapper">
    <a href="${url}" class="yt-uix-sessionlink thumb-link spf-link" tabindex="-1"><span class="yt-uix-simple-thumb-wrap yt-uix-simple-thumb-related" tabindex="0"><img aria-hidden="true" width="120" alt="" src="${image}" height="90"></span>
    </a>
    <span class="video-time">
      ${duration}
    </span>
</div>

</li>
`);
  return $newRes;
}

// On page "reload" - youtube is kinda a single page app so
// listen in bg.js for page reloads
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  setTimeout(options, 1000);
  changeSearchBar();
  regeneratePlaylist();
});

function setCookie(name, value, days) {
  var expires;

  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toGMTString();
  } else {
    expires = "";
  }
  document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = encodeURIComponent(name) + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

function eraseCookie(name) {
    setCookie(name, "", -1);
}
