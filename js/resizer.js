(function() {
	var elements = {
		// iframe element is dynamic, so don't cache as elements member
		// the rest are straitforward jquery selectors cached
		startButton : $(".button-start"),
		pauseButton : $(".button-pause"),
		minusButton : $(".button-minus"),
		plusButton : $(".button-plus"),
		helpButton : $(".button-help"),
		dataEntry : $(".data-entry"),
		showWidth : $(".show-width"),
		title : $(".sitetitle"),
		header : $(".header"),
		url : $(".url-entry"),
		img : $(".loading"),
		body : $("body"),
		win : $(window)
	}
	var data = {
		// url entered to resize
		url : null,
		// variable to hold a setInterval in order to clear it
		timer : null,
		// flag to determine whether to pause/resume play on button click
		paused : false,
		// flag to determine whether to start resizing or remove iframe on button click
		resizing : false,
		// class added/removed from body for resizing tag to control CSS states
		klassResize : "resizing",
		// class added/removed from body for pausing tag to control CSS states
		klassPause : "paused",
		// direction to resize: +1 = positive(right), -1 = negative(left)
		direction : -1,
		// # of milliseconds to animate when < or > buttons are pressed
		stepDuration : 50,
		// # of pixels to animate when the < or > buttons are pressed
		stepIncrememnt : 10,
		// # of milliseconds to animate resizing on interval
		animationDuration : 100,
		// # of pixels to animate when the resizing on interval
		animationIncrement : 50,
		// minimum width to animate to (arbitray mobile width)
		minWidth : 320,
		// the width of the animation at any given time
		currWidth : elements.win.width(),
		// the maximum width to animate to. in case user resizes browser manually
		// this is called each time as function instead of caching it on page load
		maxWidth : function() {
			return elements.win.width();
		},
		// strings for the iframe and spinner animations. iframe src is replaced
		// where {{url}} is located in src attribute
		iframe : '<iframe frameborder="0" width="100%" height="100%" class="resizer" src="{{url}}"></iframe>'
	}
	var init =  function(queryLoad) {
		// init is a bad name, but none seemed more appropriate. this is called whenever start/end button is clicked.
		// determine if script needs to start resizing or stop.
		if (data.resizing) {
			// need to stop existing resizing
			// remove resizing class to adjust CSS states
			elements.body.removeClass( data.klassResize );
			// clear the setInterval to halt animations
			clearInterval(data.timer);
			// halt any ongoing animations
			elements.body.stop(true,true);
			// reference the iframe without using elements.xxxx variable as is isn't on page at initial load
			// hide the spinner (in case user clicked stop before iframe fully loaded)
			elements.img.css("display","none");
			// remove the iframe
			$(".resizer").remove();
			// make sure the pause button is ready for pausing in case user
			// ended with it paused (and saying resume) earlier
			elements.pauseButton.html("<span>P</span>ause");
			data.paused = false;
			// remove pause class to adjust CSS states
			elements.body.removeClass( data.klassPause );
			// clear the URL
			data.url = null;
			// reset the direction
			data.direction = -1;
			// reset the width back to the current max viewport size for currWidth and actual body/header elements
			var mw = data.maxWidth();
			data.currWidth = mw;
			elements.body.width(mw);
			elements.header.width(mw);
			elements.showWidth.text(mw + "px");
			// set the text & title of the start/end button
			elements.startButton.html("<span>S</span>tart").attr("title","For best results maximize your browser first =)");
			History.pushState(elements.body.html(),document.title,"?");
		} else {
			// add resizing class to adjust CSS states
			elements.body.addClass( data.klassResize );
			// set the text & clear the title of the start/end button
			elements.startButton.html("<span>E</span>nd").attr("title","");
			// show the spinner as a placeholder while iframe loads
			elements.img.css("display","block");
			// assign the URL
			// ******************************** to do - validate URL **********************************************
			data.url = elements.url.val();
			// check for protocol (either http or https) and add basic http if not present
			if (data.url.indexOf("://") === -1) {data.url = "http://" + data.url;}
			// add the iframe initially hidden
			$(data.iframe.replace("{{url}}",data.url)).css("display","none").appendTo( elements.body ).one("load",function() {
				// once the iframe fully loads, remove the spinner and show the iframe
				elements.img.css("display","none");
				$(".resizer").css("display","block");
				// determine if this data comes from the querystring
				if (queryLoad === true) {
					// data comes from a querystring, do not start timer for animation
					pause();
				} else {
					// regular event, start the timer for animation
					data.timer = setInterval(resizer,data.animationDuration);
				}
			});
		}
		// reverse the flag so that it keeps its state
		data.resizing = !data.resizing;
	}
	// pause is called when the pause/resume button is clicked
	var pause = function () {
		// determine if a pause or resume is needed
		if (data.paused) {
			// was paused, need to resume
			// remove pause class to adjust CSS states
			elements.body.removeClass( data.klassPause );
			// reset the timer
			data.timer = setInterval(resizer,data.animationDuration);
			// adjust the text of the pause/resume button to show the next click will pause
			elements.pauseButton.html("<span>P</span>ause");
		} else {
			// was active, need to pause
			// add pause class to adjust CSS states
			elements.body.addClass( data.klassPause );
			// clear the interval to halt future animations
			clearInterval(data.timer);
			// stop all current animations on the body tag.
			elements.body.stop(true,true);
			// since the animation (likely) didn't finish, need to adjust current width to be accurate
			data.currWidth = elements.body.width();
			// update width displayed to be accurate
			elements.showWidth.text( data.currWidth + "px");
			// adjust the text of the pause/resume button to show the next click will resume
			elements.pauseButton.html("<span>R</span>esume");
		}
		// reverse the flag so it keeps its state
		data.paused = !data.paused;
	}
	// resizer is called from the setInterval timer
	var resizer = function() {
		// call keep in bounds to handle match and subsequent call to animate
		keepInBounds(data.animationIncrement,data.direction,true,data.animationDuration);
	}
	// plus is called when the > (+) button is clicked
	var plus = function() {
		// make sure there is room to animate before wasting an animation
		if ( data.currWidth < data.maxWidth() ) {
			// call keep in bounds to handle match and subsequent call to animate
			keepInBounds(data.stepIncrememnt,1,false,data.stepDuration);
		}
	}
	// plus is called when the < (-) button is clicked
	var minus = function() {
		// make sure there is room to animate before wasting an animation
		if ( data.currWidth > data.minWidth ) {
			// call keep in bounds to handle match and subsequent call to animate
			keepInBounds(data.stepIncrememnt,-1,false,data.stepDuration);
		}
	}
	/*	keep in bounds does width calculations
		@adjustment : amount of pixels to animate
		@direction : +1 for right/positive, -1 for left/negative
		@reset : boolean flag to determine if data.direction needs
			to be reset if it reaches either min or max widths
		@duration : # of milliseconds for animation duration
	*/
	var keepInBounds = function(adjustment,direction,reset,duration) {
		// adjust the current width by the adjustment & direction indicated
		data.currWidth = data.currWidth + (adjustment * direction);
		// make sure that it's not animating more than the max width allowed
		if ( data.currWidth > data.maxWidth() ) {
			// adjust animation amoutn down to equal to the max width
			data.currWidth = data.maxWidth()
			// if this is in setInterval (instead of + button) reset the direction
			if (reset) {data.direction *= -1;}
		// make sure that it's not animating to less than the min width
		} else if (data.currWidth < data.minWidth) {
			// adjust animation amoutn up to equal to the min width
			data.currWidth = data.minWidth
			// if this is in setInterval (instead of - button) reset the direction
			if (reset) {data.direction *= -1;}
		}
		// call the actual animation function
		animator(duration);
	}
	// called when user manually edits the displayed width
	var setWidth = function() {
		// get the numeric value in the displayed width
		var px = elements.showWidth.text().replace(" ","").replace("px","").replace("em", "");
		if (isNaN(px)) {
			// no numeric data, reset to current and return
			elements.showWidth.text( data.currWidth + "px" );
			return;
		}
		// adjust the current width by the adjustment & direction indicated
		data.currWidth = parseInt(px);
		// make sure that it's not animating more than the max width allowed
		if ( data.currWidth > data.maxWidth() ) {
			// adjust animation amoutn down to equal to the max width
			data.currWidth = data.maxWidth()
			// reset the direction
			data.direction *= -1;
		// make sure that it's not animating to less than the min width
		} else if (data.currWidth < data.minWidth) {
			// adjust animation amoutn up to equal to the min width
			data.currWidth = data.minWidth
			// reset the direction
			data.direction *= -1;
		}
		// call the actual animation function
		animator(data.animationDuration);
	}
	// animator is called from within KeepInBounds()
	 // @duration : # of milliseconds for animation duration
	var animator = function(duration) {	
		// animate the body width to the width calculated in keepInBounds()
		// with the duration passed into this function
		elements.body.animate({"width":data.currWidth}, duration, function() {
			// once the animation is complete adjust the width displayed
			elements.showWidth.text( data.currWidth + "px");
		});
		var newURL = "?url=" + encodeURIComponent( elements.url.val() ) + "&width=" + encodeURIComponent( elements.showWidth.text().replace("px","") );
		History.pushState(elements.body.html(),document.title,newURL);
	}
	// this compares a single or multiple keys and executes a function on match
	// @e : jquery event passed in from .keydown()
	// @keys : array of one or more numeric keycodes
	// @func : function to execute if match is found
	var keyboardControls = function(e,keydata) {
		var kdlen = keydata.length,
			keys = null,
			klen = 0;
		// loop through set of keycodes until we find a match
		for (var i = 0; i < kdlen; i++) {
			keys = keydata[i].keys;
			klen = keys.length;
			for (var n = 0; n < klen; n++) {
				// compare actual pressed key against keycode
				if ( e.which === keys[n] ) {
					// found a match. execute the function
					keydata[i].func();
					// make sure focus is no longer on url text area (even when hidden) to escape its .stopPropagation()
					elements.url.blur();
					// return to prevent more comparisons as a match is already found
					return;
				}
			}
		}
	}
	// get data (if any exists) from querystring
	var getQueryString = function() {
		var result = {},
			queryString = location.search.substring(1),
			// complicated regex magickery found on stackoverflow
			regex = /([^&=]+)=([^&]*)/g,
			matches;
		// while the regex finds matches in a xxx=yyy format, it splits & parses them up
		while (matches = regex.exec(queryString)) {
			// also decodes them in case they are URI encoded
			result[decodeURIComponent(matches[1])] = decodeURIComponent(matches[2]);
		}
		// return any matches as an array
		return result;
	}
	// called on page load to see if query string data exists
	var checkQueryString = function() {
		// get the querystring params
		params = getQueryString();
		// verify there was a 'url' and 'width' parm in querystring
		if ( ("url" in params) && ("width" in params) ) {
			// verify url is not empty and width is a number
			if ( params['url'] !== '' && !isNaN(params['width']) ) {
				// set the URL text box's value to the URL in the querystring
				elements.url.val( params['url'] );
				// by passing true into init, it will not queue the animation via setInterval
				init(true);
				// set the text of the displayed width and blur it, trigger than animation instead
				elements.showWidth.text( params['width'] + 'px' ).blur();
			}
		}
	}
	// bind keyboard shortcuts
	$(document).keydown(function(e) {
		var keydata = [
			{keys:[83,115,69,101], func:init}, // s, S, e, E : for start/end button
			{keys:[80,112,82,114], func:pause}, // p, P, r, R : for pause/resume button
			{keys:[40,37,109,45], func:minus}, // down arrow, left arrow, numpad minus, number row minus : for minu button
			{keys:[38,39,107,43], func:plus} // up arrow, right arrow, numpad plus, number row plus : for plus button
		];
		keyboardControls(e,keydata)
	});
	// bind the enter button on the URL text input to start as if a form submitted
	elements.url.keydown(function(e) {
		// stop propogation so the global document keydown doesn't get these and fire something
		e.stopPropagation();
		// check to see if the enter key was hit
		if (e.which === 13) {
			init();
		}
	});
	// bind the dispalyed width to react to changes as it's contentedtiable
	elements.showWidth.blur(setWidth);
	elements.showWidth.keydown(function(e) {
		// stop propogation so the global document keydown doesn't get these and fire something
		e.stopPropagation();
		// check to see if the enter key was hit
		if (e.which === 13) {
			// prevent carriage return
			e.preventDefault();
			elements.showWidth.blur();
		}
	});
	// bind the four buttons,
	elements.startButton.click(init);
	elements.pauseButton.click(pause);
	elements.plusButton.click(plus);
	elements.minusButton.click(minus);
	// check for querystring details
	checkQueryString();
})()