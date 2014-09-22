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
var target;
var puppieGenerator = {
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
      'page='+page
    },

  /**
   * Sends an XHR GET request to grab photos of lots and lots of puppies. The
   * XHR's 'onload' event is hooks up to the 'showPhotos_' method.
   *
   * @public
   */
  requestPuppies: function() {
    var req = new XMLHttpRequest();
    req.open("GET", this.searchOnFlickr_(), true);
    req.onload = this.showPhotos_.bind(this);
    req.send(null);
  },

  /**
   * Handle the 'onload' event of our puppie XHR request, generated in
   * 'requestPuppies', by generating 'img' elements, and stuffing them into
   * the document for display.
   *
   * @param {ProgressEvent} e The XHR ProgressEvent.
   * @private
   */
  showPhotos_: function (e) {
    target = e.target;
    $('img').remove();
    pages = $( e.target.responseXML ).find('photos').attr('pages');
    var puppies = e.target.responseXML.querySelectorAll('photo');
    for (var i = 0; i < puppies.length; i++) {
      var img = document.createElement('img');
      img.src = this.constructPuppiesURL_(puppies[i]);
      img.setAttribute('alt', puppies[i].getAttribute('title'));
      $('#results').append(img);
    }
  },

  /**
   * Given a photo, construct a URL using the method outlined at
   * http://www.flickr.com/services/api/misc.urlPuppiel
   *
   * @param {DOMElement} A puppie.
   * @return {string} The puppie's URL.
   * @private
   */
  constructPuppiesURL_: function (photo) {
    return "http://farm" + photo.getAttribute("farm") +
        ".static.flickr.com/" + photo.getAttribute("server") +
        "/" + photo.getAttribute("id") +
        "_" + photo.getAttribute("secret") +
        "_s.jpg";
  },

  
  /**
   * Updates page permutation
   */
  expandPhoto_: function() {
    console.log($(this));
    console.log($(this).data("m-url"));
  }
};

// Run our puppie generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  puppieGenerator.requestPuppies();
  $('footer span').bind( "click", function() {
    if($( this ).hasClass('search')){
      QUERY = $('footer input').val();
      page = 1;
    } else {
      page = $( this ).data("page");
    }
    puppieGenerator.updatePage_();
    puppieGenerator.requestPuppies();

  });

  $('footer select').on( "change", function() {
    page = 1;
    sort = $( this ).val();
    puppieGenerator.updatePage_();
    puppieGenerator.requestPuppies();
  } )

  $( "footer input" ).keypress(function( event ) {
    if ( event.which == 13) {
      if($('footer input').val().trim().length != 0) {
        QUERY = $('footer input').val();
      } else {
        QUERY = 'puppies';
      }
      page = 1;
      puppieGenerator.updatePage_();
      puppieGenerator.requestPuppies();

    }
  });
});
