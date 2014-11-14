// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Global variable containing the query we'd like to pass to Flickr. In this
 * case, puppies!
 *
 * @type {string}
 */
var QUERY = 'puppies';
var page = 1;
var pages = 999;
var sort = 'interestingness-desc';
var isBrowsing = true;
var target;
var isLoading = false;
var herokuServer = "https://oneclickcuties.herokuapp.com";
var occ = {
  xfinityScrollCount: 0,
  scrollTopPosition: 0,
  hUrl: "/api/tweetsmedia/CuteEmergency?count=200",
  /**
   * Flickr URL that will give us lots and lots of whatever we're looking for.
   *
   * See http://www.flickr.com/services/api/flickr.photos.search.html for
   * details about the construction of this URL.
   *
   * @type {string}
   * @private
   */
  searchOnFlickr_: function() {
    return 'https://secure.flickr.com/services/rest/?' +
      'method=flickr.photos.search&' +
      'api_key=3f22a05791b2146277e51867d854ecb8&' +
      'text=' + encodeURIComponent(QUERY) + '&' +
      'safe_search=1&' +
      'content_type=1&' +
      'sort='+sort+'&' +
      'per_page=20&' +
      'extras=url_m&' +
      'page='+page
    },

  /**
   * Sends an XHR GET request to grab photos of lots and lots of cuties. The
   * XHR's 'onload' event is hooks up to the 'showPhotos_' method.
   *
   * @public
   */
  requestCuties: function(nextUrl) {
    isLoading = true;
    $('#loading').show();
    var req = $.getJSON( herokuServer+nextUrl );
    req.done(function(data) {
      console.log( "success" );
      occ.xfinityScrollCount++
      occ.showPhotos_(data);
      $("#results").delegate( "img", "click", occ.showPhoto_ );
      console.log( "nextUrl: " + data.nextUrl );
      occ.hUrl = data.nextUrl;
      
    });
    req.fail(function(err) {
      console.log( "error" );
      console.log( err );
    });
    req.always(function() {
      isLoading = false;
      $('#loading').hide();
      console.log( "done loading" );
    });

  },

  /**
   * Handle the 'onload' event of our cutie XHR request, generated in
   * 'requestCuties', by generating 'img' elements, and stuffing them into
   * the document for display.
   *
   * @param {ProgressEvent} e The XHR ProgressEvent.
   * @private
   */
  showPhotos_: function (data) {
    //$('#results img').remove();
    //pages = $( e.target.responseXML ).find('photos').attr('pages');
    var cuties = data.media;
    $('#results').append('<h1>---- Page '+occ.xfinityScrollCount+' ----</h1><div id="page-'+occ.xfinityScrollCount+'" class="page"></div>')
    for (var i = 0; i < cuties.length; i++) {
      var img = document.createElement('img');
      img.src = cuties[i].media_url;
      //img.setAttribute('alt', cuties[i].getAttribute('title'));
      img.setAttribute('data-m-url', cuties[i].media_url);
      $('#results #page-'+occ.xfinityScrollCount).append(img);
    }


  },

  /**
   * Given a photo, construct a URL using the method outlined at
   * http://www.flickr.com/services/api/misc.urlCuties
   *
   * @param {DOMElement} A cutie.
   * @return {string} The cuties URL.
   * @private
   */
  constructCutiesURL_: function (photo) {
    return "http://farm" + photo.getAttribute("farm") +
        ".static.flickr.com/" + photo.getAttribute("server") +
        "/" + photo.getAttribute("id") +
        "_" + photo.getAttribute("secret") +
        "_s.jpg";
  },

  /**
   * Updates page permutation
   */
  updatePage_: function() {
    if(page != pages) {
      $('footer .next').data("page",page+1).show();
    } else {
      $('footer .next').hide()  
    }

    if(page != 1){
      $('footer .prev').data("page",page-1).show();
    } else {
      $('footer .prev').hide();
    }

    $('.page-number').text(page);
  },

  showPhoto_: function() {
    if(isBrowsing) {
      occ.scrollTopPosition = $(window).scrollTop();
      console.log(occ.scrollTopPosition);

      $('#photo').show().children()[0].setAttribute('src',$(this).data("m-url"));
      $('.download').show().attr('href',$(this).data("m-url")).attr('download',$(this).data("m-url").split('/').pop());
      $('#results').hide();
    }
    isBrowsing = false;
  },
  hidePhoto_: function() {
    
    if(!isBrowsing){
      $('#photo').hide();
      $('.download').hide();
      $('#results').show();
      console.log(occ.scrollTopPosition);
      $(window).scrollTop(occ.scrollTopPosition);
    }
    isBrowsing = true;
    
  },
  isScrolledToBottom: function() {
    return $(window).scrollTop() == $(document).height() - $(window).height();
  }
};

// Run our cutie generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  occ.requestCuties(occ.hUrl);
  $(window).scroll(function()
  {
      if( occ.isScrolledToBottom() && !isLoading )
      {
          occ.requestCuties(occ.hUrl);
      }
  });
  
  // Click search or page
  $('footer span').bind( "click", function() {
    if($( this ).hasClass('search')){
      QUERY = $('footer input').val();
      page = 1;
    } else {
      page = $( this ).data("page");
    }
    occ.updatePage_();
    occ.requestCuties();
    $( "#results" ).delegate( "img", "click", expandPhoto_ );

  });

  // 
  $('footer select').on( "change", function() {
    page = 1;
    sort = $( this ).val();
    occ.updatePage_();
    occ.requestCuties();
  } );

  $( "body" ).keydown(function( event ) {
    // right arrow
    if ( event.which == 13) {

      if($('footer input').val().trim().length != 0) {
        QUERY = $('footer input').val();
      } else {
        QUERY = 'puppies';
      }
      page = 1;
      occ.updatePage_();
      occ.requestCuties();
    } 
    // left arrow
    else if (isBrowsing &event.which == 37 && page != 1) {
      page -= 1;
      occ.updatePage_();
      occ.requestCuties();
    }
    // right arrow
    else if (isBrowsing & event.which == 39 && page != pages) {
      page += 1;
      occ.updatePage_();
      occ.requestCuties();
    }

  });
  $("#photo").bind("click", occ.hidePhoto_ );

});
