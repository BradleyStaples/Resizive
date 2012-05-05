/*global jQuery, Kibo*/
(function ($) {
	"use strict";
	var Resizive = function () {
		var animator, data, elements, end, getQueryString, keepInBounds, minus, parseQueryString, pause,
			plus, resize, resume, setBindings, setWidth, start, updateDirection, updateMaxWidth, updateWidth;

		elements = {
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
		};

		data = {
			url : null,
			timer : null,
			paused : false,
			resizing : false,
			klassResize : "resizing",
			klassPause : "paused",
			direction : -1,
			stepDuration : 50,
			stepIncrememnt : 10,
			animationDuration : 100,
			animationIncrement : 50,
			minWidth : 320,
			currWidth : elements.win.width(),
			maxWidth : elements.win.width(),
			iframe : '<iframe frameborder="0" width="100%" height="100%" class="resizer" src="{{url}}"></iframe>'
		};

		animator = function (duration) {
			elements.body.animate({"width": data.currWidth}, duration, function () {
				elements.showWidth.text(data.currWidth + "px");
			});
			window.location.hash = "#url=" + encodeURIComponent(elements.url.val()) + "&width=" + encodeURIComponent(data.currWidth);
		};

		end = function () {
			var mw = data.maxWidth;
			elements.body.removeClass(data.klassResize);
			clearInterval(data.timer);
			elements.body.stop(true, true);
			elements.img.css("display", "none");
			$(".resizer").remove();
			elements.pauseButton.html("<span>P</span>ause");
			elements.body.removeClass(data.klassPause);
			data.url = null;
			// reset the direction
			data.direction = -1;
			// reset the width back to the current max viewport size for currWidth and actual body/header elements
			data.currWidth = mw;
			elements.body.width(mw);
			elements.header.width(mw);
			elements.showWidth.text(mw + "px");
			elements.startButton.html("<span>S</span>tart").attr("title", "For best results maximize your browser first =)");
			window.location.hash = "";
			data.paused = false;
			data.resizing = false;
		};

		getQueryString = function () {
			var result = {},
				queryString = location.hash.toString().substring(1),
				// complicated regex magickery found on stackoverflow
				regex = /([^&=]+)=([^&]*)/g,
				matches;
			// while the regex finds matches in a xxx=yyy format, it splits & parses them up
			matches = regex.exec(queryString);
			while (matches) {
				// also decodes them in case they are URI encoded
				result[decodeURIComponent(matches[1])] = decodeURIComponent(matches[2]);
				matches = regex.exec(queryString);
			}
			// return any matches as an array
			return result;
		};

		keepInBounds = function (reset) {
			if (data.currWidth > data.maxWidth) {
				data.currWidth = data.maxWidth;
				if (reset) {
					data.direction *= -1;
				}
			} else if (data.currWidth < data.minWidth) {
				data.currWidth = data.minWidth;
				if (reset) {
					data.direction *= -1;
				}
			}
		};

		minus = function () {
			updateDirection(-1);
			resize("stepDuration", "stepIncrememnt");
		};

		parseQueryString = function () {
			var params = getQueryString();
			if (params.hasOwnProperty("url") && params.hasOwnProperty("width")) {
				if (params.url !== '' && !isNaN(params.width)) {
					elements.url.val(params.url);
					data.currWidth = parseInt(params.width, 10);
					elements.showWidth.text(params.width + 'px').blur();
					return true;
				}
			}
			return false;
		};

		pause = function () {
			elements.body.addClass(data.klassPause).stop(true, true);
			clearInterval(data.timer);
			updateWidth(elements.body.width());
			data.paused = true;
			elements.pauseButton.html("<span>R</span>esume");
		};

		plus = function () {
			updateDirection(+1);
			resize("stepDuration", "stepIncrememnt");
		};

		resize = function (durationType, sizeType) {
			var adjustment = data[sizeType],
				duration = data[durationType],
				reset = (durationType === "stepDuration") ? false : true,
				startingWidth = data.currWidth;
			data.currWidth = data.currWidth + (adjustment * data.direction);
			keepInBounds(reset);
			if (startingWidth !== data.currWidth) {
				animator(duration);
			}
		};

		resume = function () {
			elements.body.removeClass(data.klassPause).stop(true, true);
			data.timer = setInterval(function () {
				resize("animationDuration", "animationIncrement");
			}, data.animationDuration);
			data.paused = false;
			elements.pauseButton.html("<span>P</span>ause");
		};

		setBindings = function () {
			var k;
			elements.win.resize(updateMaxWidth);
			elements.startButton.click(function () {
				if (data.resizing) {
					end();
				} else {
					start();
				}
			});
			elements.pauseButton.click(function () {
				if (data.paused) {
					resume();
				} else {
					pause();
				}
			});
			elements.plusButton.click(plus);
			elements.minusButton.click(minus);
			elements.url.keydown(function (e) {
				e.stopPropagation();
				if (e.which === 13) { // enter key
					start(false); // pass explicit false to show no query data and avoid auto pause
				}
			});
			elements.showWidth.blur(function () {
				setWidth();
			});
			elements.showWidth.keydown(function (e) {
				e.stopPropagation();
				if (e.which === 13) { // enter key
					// prevent carriage return with preventDefault
					e.preventDefault();
					elements.showWidth.blur();
				}
			});
			// keyboard controls via Kibo : https://github.com/marquete/kibo
			k = new Kibo();
			k.down(['s'], start);
			k.down(['e'], end);
			k.down(['p'], pause);
			k.down(['r'], resume);
			k.down(['down', 'left', '-'], minus);
			k.down(['up', 'right', '+'], plus);
		};

		setWidth = function () {
			var px = elements.showWidth.text().replace(" ", "").replace("px", "").replace("em", ""),
				startingWidth = data.currWidth;
			if (isNaN(px)) {
				elements.showWidth.text(data.currWidth + "px");
				return;
			}
			data.currWidth = parseInt(px, 10);
			if (data.currWidth < startingWidth) {
				updateDirection(-1);
			} else {
				updateDirection(+1);
			}
			keepInBounds(false);
			if (startingWidth !== data.currWidth) {
				animator(data.animationDuration);
			}
		};

		start = function (queryLoad) {
			elements.body.addClass(data.klassResize);
			elements.startButton.html("<span>E</span>nd").attr("title", "");
			elements.img.css("display", "block");
			// ******************************** to do - validate URL **********************************************
			data.url = elements.url.val();
			if (data.url.indexOf("://") === -1) {data.url = "http://" + data.url; }
			$(data.iframe.replace("{{url}}", data.url)).css("display", "none").appendTo(elements.body).one("load", function () {
				elements.img.css("display", "none");
				$(".resizer").css("display", "block");
				if (queryLoad === true) {
					keepInBounds(false);
					animator(data.animationDuration);
					pause();
				} else {
					data.timer = setInterval(function () {
						resize("animationDuration", "animationIncrement");
					}, data.animationDuration);
				}
			});
			data.paused = false;
			data.resizing = true;
		};

		updateDirection = function (dir) {
			data.direction = dir;
		};
		updateMaxWidth = function () {
			data.max = elements.win.width();
		};

		updateWidth = function (w) {
			data.currWidth = w;
			elements.showWidth.text(data.currWidth + "px");
		};

		// enclosure via return object
		return {
			init : function () {
				var query = parseQueryString();
				setBindings();
				if (query) {
					start(query);
				}
			}
		};
	};

	$(function () {
		var r = new Resizive();
		r.init();
	});
}(jQuery));