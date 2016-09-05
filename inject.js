var $originalSearch;
var $mySearch;
var bgOn;

// from http://stackoverflow.com/a/31133401/589921
Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get: function(){
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    }
})


$(document).ready(function(){
  $("a").click(function(e){
    if (e.currentTarget.className == "ytp-next-button ytp-button") {
      document.location = $(".autoplay-bar ul li:first-child a:first-child").attr("href");
    }
  }); 
  $("a").mouseover(function(e){
    if (e.currentTarget.className == "ytp-next-button ytp-button") {
      setTimeout(function() {
        $(".ytp-tooltip.ytp-text-detail.ytp-preview.ytp-has-duration.ytp-bottom").remove()
      }, 200);
      return false;
    }
  }); 

  chrome.extension.sendRequest({storage:"bgOn"}, function(response) {
    if (response.storage == 'undefined') {
      bgOn = true;
    }
    else {  
      bgOn = JSON.parse(response.storage);
    }
    saveSearchBars();
    regeneratePlaylist();
    changeSearchBar();
  });

  onVideoFinished();

  function onVideoFinished() {
    setTimeout(function() {
      var isAdShowing = $('.ad-showing').length !== 0;

      if (isAdShowing) {
        onVideoFinished();
      } else {
        $("video").bind('ended', videoFinishedHandler);
      }

      function videoFinishedHandler() {
        // play the next video after a second
        chrome.extension.sendRequest({storage: "autoplaylist"}, function(response) {
          if (typeof response.storage !== "undefined" && response.storage != "[]" /*fucking localstorage*/ && $("#autoplay-checkbox").is(":checked")) {
            setTimeout(function() {
              document.location = $(".autoplay-bar ul li:first-child a:first-child").attr("href");
            }, 3000);
          }
        });
      }
    }, 3000);
  }
});

// On page "reload" - youtube is kinda a single page app so
// listen in bg.js for page reloads
// TODO: don't have this run on first page reload and share code 
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // sucks, but this timeout needs to be here
  setTimeout(function(){
    chrome.extension.sendRequest({storage:"bgOn"}, function(response) {
      bgOn = JSON.parse(response.storage);
      addQueueButtonsToSuggestions();
      changeSearchBar();
      regeneratePlaylist();
    });
    $savedSuggestions = $("#watch-related").clone();
  }, 500);
});

function addQueueButtonsToSuggestions() {
  $(".related-list-item").each(function(i, elem) {
    if (!$(this).hasClass('in-queue')) {
      url = $(this).find('a.yt-uix-sessionlink.content-link').attr('href');
      $(this).addClass('in-queue');
      $(this).attr('data-href', url);
      $(this).find('.view-count').after($(`<span class="stat add-to-playlist suggestion" data-video-id="${url}"><button class="add-playlist">Add to queue</button></span>`));
    }
  });
  $(".suggestion.add-to-playlist").click(function(e){playlistClick(e, $(this));});
}

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
    if (((event.ctrlKey||event.metaKey || !document.querySelector('video').playing) && event.keyCode == 13)) {
      document.location = "https://www.youtube.com/results?search_query=" + encodeURIComponent($(this).val());
    } else if (event.keyCode == 13) {
      runThisLittleBeastInstead();
    }
  })

  return $searchBar;
}

function changeSearchBar() {
  // If this is a video, and we have background searching switched on
  if(bgOn && window.location.href.indexOf("www.youtube.com/watch?v=") != -1) {
    if (!$mySearch.is(":visible")) {
      $mySearch.find("input").val($originalSearch.find("input").val());
      
      $mySearch.show();
      $originalSearch.hide();
    }
  } else {
    if (!$originalSearch.is(":visible")) {
      $originalSearch.find("input").val($mySearch.find("input").val());

      $mySearch.hide();
      $originalSearch.show();
    }
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

var $savedSuggestions;

function restoreOriginal() {
  $("#generated-res").remove();
  $("#watch7-sidebar-contents #watch-related.video-list").empty();
  $("#watch7-sidebar-contents #watch-related.video-list").append($savedSuggestions.clone());
}

function replaceSidebar(data, query) {
  $nodes = $(data).find(".yt-lockup");

  var newNodes = []; 
  var node;
  $nodes.each(function() {
    node = createNewSideRes($(this));
    if (node != null)
      newNodes.push(createNewSideRes($(this)));
  });

  $("#generated-res").remove();
  $("#watch7-sidebar-contents #watch-related.video-list").empty();
  $("#watch7-sidebar-contents #watch-related.video-list").append($("<div id='generated-res' class='watch-sidebar-section'>Search results for: <i><b>" + query + "</b></i> <a id='restore-original'>Show original suggestions</a></div>"));

  $("#restore-original").click(function() {
    restoreOriginal();
  });
  newNodes.forEach(function(node) {
    $("#watch7-sidebar-contents #watch-related.video-list").append(node);
  })

  $(".add-to-playlist").click(function(e){playlistClick(e, $(this))});
 
  removeOverlay();
}

function playlistClick(e, elem) {
  e.preventDefault();
  addToPlaylist(elem.parents('li:first'));
  elem.find("button").text("Added!").unbind("click");
}

jQuery.fn.outerHTML = function() {
  return jQuery('<div />').append(this.eq(0).clone()).html();
};

function addToPlaylist($searchElem) {
  console.log($searchElem.outerHTML);

  $searchElem.addClass('in-queue');
  // Remove the "new" button found in some suggestions, as it messes things up!
  $searchElem.find('.yt-badge-list').remove();
  $searchElem.find('.yt-uix-menu-trigger').remove();
  chrome.extension.sendRequest({storage: "autoplaylist"}, function(response) {
    var list;
    if (typeof response.storage === "undefined") {
      list = [$searchElem.outerHTML()];
    } else {
      list = JSON.parse(response.storage);
      list.push($searchElem.outerHTML());
    }
    chrome.extension.sendRequest({storage: "autoplaylist", value: JSON.stringify(list)});
    regeneratePlaylist();
  });
}

function regeneratePlaylist() {
  chrome.extension.sendRequest({storage: "autoplaylist"}, function(response) {
    if (typeof response.storage === "undefined") return;
    var autoplaylist = JSON.parse(response.storage);
  
    for (var i = 0; i < autoplaylist.length; ++i) {
      $playlistItem = $(autoplaylist[i]);
      // if this video is currently playing, remove it from playlist 
      if (window.location.toString().indexOf($playlistItem.find("a").attr("href")) > -1) {
        autoplaylist.splice(i--, 1);
        chrome.extension.sendRequest({storage: "autoplaylist", value: JSON.stringify(autoplaylist)});
        continue; 
      }
    }

    // Keep the original autoplay vid if we have none queued
    if (autoplaylist.length == 0) return null;

    $(".autoplay-bar ul").empty();
    for (var i = 0; i < autoplaylist.length; ++i) {
      $playlistItem = $(autoplaylist[i]);
      $playlistItem.find(".add-to-playlist").remove();

      $buttonsContainer = $('<span class="stat add-to-playlist"></span>');

      $removeButton = $('<button data-href="' + $playlistItem.data('href') + '" class="add-playlist">Remove</button>');
      $removeButton.click(function(e){
        var target = $(e.target);
        chrome.extension.sendRequest({storage: "autoplaylist"}, function(response) {
          if (typeof response.storage === "undefined") return;

          var autoplaylist = JSON.parse(response.storage);
          
          for (var i = 0; i < autoplaylist.length; ++i) {
            if (target.data('href') == $(autoplaylist[i]).data('href')) {
              autoplaylist.splice(i--, 1);
              chrome.extension.sendRequest({storage: "autoplaylist", value: JSON.stringify(autoplaylist)});
            }
          }

          $(".autoplay-bar ul").empty();
          regeneratePlaylist();
        });
	e.stopPropagation();
        e.preventDefault();
        return false;
      });
      $buttonsContainer.append($removeButton);

      if (autoplaylist.length > 1) {
        $upButton = $('<button data-href="' + $playlistItem.data('href') + '" class="add-playlist" alt="Move up">&#x25B2;</button>');
        $downButton = $('<button data-href="' + $playlistItem.data('href') + '" class="add-playlist" alt="Move down">&#x25BC;</button>');

        $upButton.click(function(e) { movePlaylistItem(true, e)});
        $downButton.click(function(e) { movePlaylistItem(false, e)});

        $buttonsContainer.prepend($upButton);
        $buttonsContainer.append($downButton);
      }
      
      $playlistItem.find(".view-count").append($buttonsContainer);
      
      $(".autoplay-bar ul").append($playlistItem);
    }
  });
}

function movePlaylistItem(up, e) {
  var target = $(e.target);
  chrome.extension.sendRequest({storage: "autoplaylist"}, function(response) {
    if (typeof response.storage === "undefined") return;
    var autoplaylist = JSON.parse(response.storage);

    for (var i = 0; i < autoplaylist.length; ++i) {
      if (target.data('href') == $(autoplaylist[i]).data('href')) {
        var buf;
        if (up) {
          if (i > 0) {
            buf = autoplaylist[i];
            autoplaylist[i] = autoplaylist[i-1];
            autoplaylist[i-1] = buf;
          }
        } else {
          if (i < autoplaylist.length - 1) {
            buf = autoplaylist[i];
            autoplaylist[i] = autoplaylist[i+1];
            autoplaylist[i+1] = buf;
          }
        }

        chrome.extension.sendRequest({storage: "autoplaylist", value: JSON.stringify(autoplaylist)});
        // Break because we messed up the ordering, so we might be moving this value up again
        break;
      }
    }

    $(".autoplay-bar ul").empty();
    regeneratePlaylist();
  });
  e.stopPropagation();
  e.preventDefault();

  return false;
}

function createNewSideRes($normalSearchResult) {
  var duration = $normalSearchResult.find(".accessible-description").text().replace(" - Duration: ", "").replace("Already watched.", "").replace(".", "");
  
  var addToPlaylist = "";
  // if we don't have a video (i.e. playlist or channel), disallow adding to playlist
  if (!duration.match(/[0-9]+:[0-9]/)) {
    addToPlaylist = "hidden";
  }
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
<li data-href="${url}" class="video-list-item related-list-item related-list-item-compact-video">
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
        ${channel}
      </span>
    </span>
    <span class="stat view-count">${views}</span>
    <span class="stat add-to-playlist" data-video-id="${url}"><button class=" ${addToPlaylist} add-playlist">Add to queue</button></span>
  </a>
  </div>
  <div class="thumb-wrapper">
    <a href="${url}" class="yt-uix-sessionlink thumb-link spf-link" tabindex="-1"><span class="yt-uix-simple-thumb-wrap yt-uix-simple-thumb-related" tabindex="0"><img aria-hidden="true" width="168" alt="" src="${image}" height="94"></span>
    </a>
    <span class="video-time">
      ${duration}
    </span>
</div>

</li>
`);
  return $newRes;
}
