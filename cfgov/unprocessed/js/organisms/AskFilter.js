'use strict';

// Required modules.
var atomicHelpers = require( '../modules/util/atomic-helpers' );
var standardType = require( '../modules/util/standard-type' );
var scroll = require( '../modules/util/scroll' );
var Pagination = require( '../molecules/Pagination' );

/**
 * Pagination
 * @class
 *
 * @classdesc Initializes the organism.
 *
 * @param {HTMLNode} element
 *   The DOM element within which to search for the organism.
 * @returns {Pagination} An instance.
 */
function AskFilter( element, facetMap, page, pageCount ) {
  var BASE_CLASS = 'ask-categories';
  var HIDDEN_CLASS = 'hidden';
  var TAG_CLASS = 'tags_link'
  var PER_PAGE = 20;

  var _dom = atomicHelpers.checkDom( element, BASE_CLASS );
  var _facets = _dom.querySelector('.facets');
  var _categoryCheckboxes = _facets.querySelectorAll('.cf-input');
  var _tagList = _dom.querySelector('.tags_list');
  var _audienceLinks = _tagList.querySelectorAll('.' + TAG_CLASS);
  var _resultContainer = _dom.querySelector( '.question_list' );
  var _resultsList = _resultContainer.querySelectorAll( 'article' );
  var _selections = _dom.querySelector('.selections');
  var _selectionsText = _selections.querySelector('.selections_text');
  var _resetBtn = _dom.querySelector('.reset');
  var _notification = document.querySelector('.notification')

  var _results = facetMap.answers;
  var _pagination;

  var _filteredResults = _results;
  var _pageResults;
  var _currentPage = +page || 1;
  var _pageCount = +pageCount;
  var _selectedCategories = [];
  var _selectedAudiences = [];

  /**
   * @returns {AskFilter|undefined} An instance,
   *   or undefined if it was already initialized.
   */
  function init() {
    if ( !atomicHelpers.setInitFlag( _dom ) ) {
      return standardType.UNDEFINED;
    }

    _pagination = new Pagination( _dom, page );
    _pagination.init();
    _pagination.addEventListener( 'updatePage',  _pageChangeHandler );

    _facets.addEventListener( 'click',  _categorySelectionHandler );
    _tagList.addEventListener( 'click',  _audienceSelectionHandler );
    _resetBtn.addEventListener( 'click', _resetHandler );
    return this;
  }

  function _audienceSelectionHandler( e ) {
    e.preventDefault();
    if ( e.target && e.target.classList.contains( TAG_CLASS )) {
      var audience = e.target.getAttribute( 'data-id' );
      if ( _selectedAudiences.indexOf( audience ) < 0 ) {
        _selectedAudiences.push( audience );
        _filterResults();
      }
    }
  }

  function _categorySelectionHandler( e ) {
    if ( e.target && e.target.classList.contains( 'cf-input' ) ) {
      e.stopPropagation();
      var category = e.target.getAttribute( 'data-id' );
      if ( e.target.checked ) {
        _selectedCategories.push( category );
      } else {
        _selectedCategories.splice( _selectedCategories.indexOf( category ), 1 );
      }
      _filterResults();
    }
  }

  function _pageChangeHandler( obj ) {
    var page = +obj.currentPage;
    if ( page > 0 && page <= _pageCount ) {
      _currentPage = page;
      _paginateResults();
    }
  }

  function _resetHandler( e ) {
    e.preventDefault();
    _resetSelections();
    _resetCheckboxes();
    _filterResults();
  }

  function _filterResults() {
    if ( _selectedAudiences.length ) {
      _filteredResults = _filterByAudience() ;
    } else if ( _selectedCategories.length ) {
      _filteredResults = _filterByCategory();
    } else {
      _filteredResults = _results;
    }
    _paginateResults( true );
  }

  function _filterByAudience() {
    var results = [];
    _selectedAudiences.forEach( function( audience ) {
      var audienceMap = facetMap.audiences[audience];
      var audienceResults = [];
      // if selected categories, combine the audience's
      // arrays for each of those categories
      if ( _selectedCategories.length ) {
        _selectedCategories.forEach(function( cat ) {
          audienceResults = union( audienceResults, audienceMap[cat] );
        }); 
      } else {
        audienceResults = audienceMap['all'];
      }
      // if results for the audience, get intersection
      // if there are results for previous audiences
      if ( audienceResults.length ) {
        if ( results.length ) {
          results = intersection( results, audienceResults );
        } else {
          results = audienceResults;
        } 
      }
    });
    return results;
  }

  function _filterByCategory() {
    var temp = [];
    _selectedCategories.forEach( function( cat ) {
      temp = union( temp, facetMap.subcategories[cat]['all'] );
    } ); 
    return temp;
  }

  function _paginateResults( filtering ) {
    if ( filtering ) {
      _currentPage = 1;
      _pageCount = getPageCount( _filteredResults )
      _pagination.dispatchEvent( 'updatePagination',  {
        currentPage: _currentPage, pageCount: _pageCount
      } );
    }
    var start = ( _currentPage - 1 ) * PER_PAGE;
    var end = _currentPage * PER_PAGE;
    _pageResults =  _filteredResults.slice( start, end );
    _updateDOM( filtering ); 
  }

  function getPageCount( keys ) {
    var keysLen = keys.length;
    if ( keysLen < 1 ) {
      return 0;
    } else if ( keysLen < PER_PAGE ) {
      return 1;
    } else {
      var count = Math.floor( keysLen/PER_PAGE );
      count += ( keysLen % PER_PAGE ) ? 1 : 0;
      return count;
    }
  }

  function _updateDOM( filtering ) {
    _updateResultsCount();
    _updateResults();
    if ( filtering ) {
      _updateSelectionSummary();
      _updateAudienceCounts();
    } else {
      scroll.scrollIntoView( _notification );
    }
  } 

  function _updateSelectionSummary() {
    if ( _selectedCategories.length || _selectedAudiences.length ) {
      var catNames = _selectedCategories.map( function( cat ) {
        return facetMap.subcategories[cat].name
      } );
      _selectionsText.innerHTML = catNames.concat( _selectedAudiences ).join( '; ' );
      _selections.classList.remove( HIDDEN_CLASS );
    } else {
      _selections.classList.add( HIDDEN_CLASS );
    }
  }

  function _updateAudienceCounts() {
    var audiences = facetMap.audiences;
    var audienceCounts = {};
    Object.keys(audiences).forEach( function( key ) {
        audienceCounts[key] = intersection( audiences[key]['all'], _filteredResults )
    } );
    _audienceLinks.forEach(function( link ) {
      var id = link.getAttribute( 'data-id' )
      var count = ( audienceCounts[id] || [] ).length
      if ( count ) {
          link.querySelector( '.count' ).innerHTML = '(' + count + ')';
          link.parentElement.classList.remove( HIDDEN_CLASS );
      } else {
          link.parentElement.classList.add( HIDDEN_CLASS );
      }
    })
  }

  function _updateResults() {
    _resultsList.forEach( function ( item ) {
      var id = item.getAttribute('data-id');
      if ( _pageResults.indexOf( id ) < 0 ) {
        item.classList.add( HIDDEN_CLASS );
      } else {
        item.classList.remove( HIDDEN_CLASS );
      }
    } );
  }

  function _updateResultsCount() {
    var count = _filteredResults.length;
    _notification.innerHTML = count + ( count === 1 ?  ' result' : ' results' );
  }

  function _resetSelections() {
    _selectedCategories = [];
    _selectedAudiences = [];
  }
  
  function _resetCheckboxes() {
    _categoryCheckboxes.forEach(function( checkbox ) {
      checkbox.checked && ( checkbox.checked = false );
    })
  }

  function union( a, b ) {
    // de-duplicated union of two arrays
    return a.concat( b.filter( function ( item ) {
        return a.indexOf( item ) < 0;
    } ) );
  }

  function intersection( a, b ) {
    // intersection of two arrays
    return a.filter( function ( item ) { 
      return b.indexOf( item ) > -1;
    } );
  }
  
  this.init = init;
  
  return this;
}

module.exports = AskFilter;
