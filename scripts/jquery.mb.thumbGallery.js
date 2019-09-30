/*******************************************************************************
 *
 * jQuery.mb.components: mb.thumbGrid
 * Creation date: 03/09/14
 *
 * Licences: MIT, GPL
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 ******************************************************************************/

(function ($) {
	jQuery.thumbGrid = {

		name    : "jquery.mb.thumbGrid",
		version : "1.0",
		author  : "Matteo Bicocchi",
		defaults: {
			nav_effect         : "slideLeft",
			nav_delay          : 60,
			nav_timing         : 800,
			nav_pagination     : 6,
			gallery_effectnext : "slideRight",
			gallery_effectprev : "slideLeft",
			gallery_timing     : 500,
			gallery_cover      : true,
			gallery_fullscreenw: "100%",
			gallery_fullscreenh: "100%"
		},

		transitions: {
			fade        : {in: {opacity: 0}, out: {opacity: 0}},
			slideUp     : {in: {opacity: 0}, out: {y: -200, opacity: 0}},
			slideDown   : {in: {opacity: 0}, out: {y: 200, opacity: 0}},
			slideLeft   : {in: {opacity: 0}, out: {x: -200, opacity: 0}},
			slideRight  : {in: {opacity: 0}, out: {x: 200, opacity: 0}},
			slideInverse: {in: {y: 200, opacity: 0}, out: {y: 200, opacity: 0}},
			zoomIn      : {in: {scale: .5, opacity: 0}, out: {scale: 2, opacity: 0}},
			zoomOut     : {in: {scale: 2, opacity: 0}, out: {scale: .1, opacity: 0}},
			rotate      : {in: { opacity: 0}, out: {rotate: 179, opacity: 0}}
		},

		init: function (options) {

			var opt = {};

			jQuery.extend(opt, jQuery.thumbGrid.defaults, options);

			return this.each(function () {
				var grid = this;
				var $grid = jQuery(grid);

				$grid.addClass("tg-container");

				$grid.hide();

				grid.isAnimating = false;
				grid.pageIndex = 0;

				grid.nav_effect = $grid.data("nav_effect") || opt.nav_effect;
				grid.nav_delay = $grid.data("nav_delay") || opt.nav_delay;
				grid.nav_timing = $grid.data("nav_timing") || opt.nav_timing;
				grid.nav_pagination = $grid.data("nav_pagination") || opt.nav_pagination;
				grid.gallery_fullscreenw = $grid.data("gallery_fullscreenw") || opt.gallery_fullscreenw;
				grid.gallery_fullscreenh = $grid.data("gallery_fullscreenh") || opt.gallery_fullscreenh;
				grid.gallery_cover = $grid.data("gallery_cover") || opt.gallery_cover;
				grid.gallery_effectnext = $grid.data("gallery_effectnext") || grid.nav_effect;
				grid.gallery_effectprev = $grid.data("gallery_effectprev") || grid.nav_effect;
				grid.gallery_timing = $grid.data("gallery_timing") || grid.nav_effect;

				jQuery.extend(opt, $grid.data());

				grid.opt = opt;

				grid.elements = $grid.children().clone();
				$grid.children().hide();

				grid.elements.each(function (i) {
					jQuery(this).attr("data-globalindex", i);
				});

				grid.pages = [];
				grid.totPages = Math.ceil(grid.elements.size() / grid.nav_pagination);

				var thumbIdx = 0;

				for (var p = 0; p < grid.totPages; p++) {
					var page = [];
					for (var x = 0; x < grid.nav_pagination; x++) {

						if (!grid.elements[thumbIdx])
							break;

						var thumb = grid.elements[thumbIdx];
						page.push(thumb);
						thumbIdx++;
					}
					grid.pages.push(page);
				}

				jQuery.thumbGrid.drawPage(grid, grid.pageIndex, false);
			})
		},

		normalizeCss: function (opt) {

			if (jQuery.browser.msie && jQuery.browser.version <= 9)
				return opt;

			var newOpt = jQuery.extend(true, {}, opt);
			var sfx = "";
			var transitionEnd = "transitionEnd";
			if (jQuery.browser.webkit) {
				sfx = "-webkit-";
				transitionEnd = "webkitTransitionEnd";
			} else if (jQuery.browser.mozilla) {
				sfx = "-moz-";
				transitionEnd = "transitionend";
			} else if (jQuery.browser.opera) {
				sfx = "-webkit-";
				transitionEnd = "oTransitionEnd";
			} else if (jQuery.browser.msie) {
				sfx = "-ms-";
				transitionEnd = "msTransitionEnd";
			}

			function uncamel(str) {
				return str.replace(/([A-Z])/g, function (letter) { return '-' + letter.toLowerCase(); });
			}

			function setUnit(i, units) {
				if ((typeof i === "string") && (!i.match(/^[\-0-9\.]+$/))) {
					return i;
				} else {
					return "" + i + units;
				}
			}

			for (var o in newOpt) {

				if (o === "transform") {
					newOpt[sfx + "transform"] = newOpt[o];
					delete newOpt[o];
				}

				if (o === "transform-origin") {
					newOpt[sfx + "transform-origin"] = opt[o];
					delete newOpt[o];
				}

				if (o === "filter") {
					newOpt[sfx + "filter"] = opt[o];
					delete newOpt[o];
				}

				/**
				 * Translate
				 * */

				var key = "";

				if (o === "x") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" translateX(" + setUnit(opt[o], "px") + ")");
					delete newOpt[o];
				}

				if (o === "y") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" translateY(" + setUnit(opt[o], "px") + ")");
					delete newOpt[o];
				}

				if (o === "z") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" translateZ(" + setUnit(opt[o], "px") + ")");
					delete newOpt[o];
				}

				/**
				 * Rotate
				 * */
				if (o === "rotate") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" rotate(" + setUnit(opt[o], "deg") + ")");
					delete newOpt[o];
				}

				if (o === "rotateX") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" rotateX(" + setUnit(opt[o], "deg") + ")");
					delete newOpt[o];
				}

				if (o === "rotateY") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" rotateY(" + setUnit(opt[o], "deg") + ")");
					delete newOpt[o];
				}

				if (o === "rotateZ") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" rotateZ(" + setUnit(opt[o], "deg") + ")");
					delete newOpt[o];
				}

				/**
				 * Scale
				 * */
				if (o === "scale") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" scale(" + setUnit(opt[o], "") + ")");
					delete newOpt[o];
				}

				if (o === "scaleX") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" scaleX(" + setUnit(opt[o], "") + ")");
					delete newOpt[o];
				}

				if (o === "scaleY") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" scaleY(" + setUnit(opt[o], "") + ")");
					delete newOpt[o];
				}

				if (o === "scaleZ") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" scaleZ(" + setUnit(opt[o], "") + ")");
					delete newOpt[o];
				}

				/**
				 * Skew
				 * */

				if (o === "skew") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" skew(" + setUnit(opt[o], "deg") + ")");
					delete newOpt[o];
				}

				if (o === "skewX") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" skewX(" + setUnit(opt[o], "deg") + ")");
					delete newOpt[o];
				}

				if (o === "skewY") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" skewY(" + setUnit(opt[o], "deg") + ")");
					delete newOpt[o];
				}

				/**
				 * Perspective
				 * */
				if (o === "perspective") {
					key = sfx + "transform";
					newOpt[key] = newOpt[key] || "";
					newOpt[key] += (" perspective(" + setUnit(opt[o], "px") + ")");
					delete newOpt[o];
				}

			}
			return newOpt;
		},

		drawPage: function (el, pageIdx, applyEffect) {

			if (typeof applyEffect === "undefined")
				applyEffect = true;

			var grid = el;
			var $grid = jQuery(grid);

			grid.nav_effect = $grid.data("nav_effect") || "fade";
			grid.nav_delay = $grid.data("nav_delay") || 100;
			grid.nav_timing = $grid.data("nav_timing") || 1000;

			grid.isAnimating = true;

			var pageElements = grid.pages[pageIdx];
			var page = jQuery("<ul/>").addClass("thumb-grid");

			for (var x = 0; x < grid.nav_pagination; x++) {
				var thumb = $(pageElements[x]).clone().removeClass("in");
				if (jQuery(thumb).length) {
					var thumbWrapper = jQuery("<li/>").addClass("thumbWrapper").append(thumb);
					thumbWrapper.data("idx", x);

					thumbWrapper.on("click", function () {
						var idx = $("img", this).data("globalindex");
						jQuery.thumbGrid.drawSlideShow(grid, idx);
					});

					if (applyEffect) {
						thumbWrapper.css({opacity: 0});
						var transitionIn = jQuery.thumbGrid.normalizeCss(jQuery.thumbGrid.transitions[grid.nav_effect].in);
						thumbWrapper.css(transitionIn);
					} else {
						var displayProperties = jQuery.thumbGrid.normalizeCss({top: 0, left: 0, opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, skew: 0, filter: " blur(0)"});
						thumbWrapper.css(displayProperties).show();
					}

					page.append(thumbWrapper);
					page.addClass("active");

				} else {
					break;
				}
			}

			if (applyEffect)
				page.addClass("in");

			$grid.find(".thumb-grid").addClass("out").removeClass("in");

			$grid.prepend(page);

			setTimeout(function () {

				var displayProperties = {top: 0, left: 0, opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, skew: 0, filter: " blur(0)"};

				var delayIn = grid.nav_delay;
				for (var i = 0; i < jQuery(".in .thumbWrapper", $grid).length; i++) {
					var elIn = jQuery(".in .thumbWrapper", $grid).eq(i);

					elIn.CSSAnimate(displayProperties, grid.nav_timing, delayIn, "cubic-bezier(0.19, 1, 0.22, 1)", function () {});
					delayIn += grid.nav_delay;
				}

				var delayOut = grid.nav_delay;
				for (var ii = 0; ii < jQuery(".out .thumbWrapper", $grid).length; ii++) {
					var elOut = jQuery(".out .thumbWrapper", $grid).eq(ii);
					var transitionOut = jQuery.thumbGrid.transitions[grid.nav_effect].out;

					elOut.CSSAnimate(transitionOut, grid.nav_timing, delayOut, "cubic-bezier(0.19, 1, 0.22, 1)", function () {

						if ($(this).index() == jQuery(".out .thumbWrapper", $grid).length - 1) {
							jQuery(".out", $grid).remove();
							grid.isAnimating = false;
						}

					});
					delayOut += grid.nav_delay;
				}

				$grid.fadeIn();

				if (!applyEffect) {
					grid.height = page.height();
					$grid.height(grid.height);
					jQuery.thumbGrid.buildIndex(grid);

					if (typeof grid.nav != "undefined")
						grid.nav.show();
				}

			}, 10);

			jQuery(window).on("resize.thumbGrid", function () {
				grid.height = page.height();
				$grid.height(grid.height);
			});
		},

		buildIndex: function (el) {
			var grid = el;
			var $grid = jQuery(grid);
			var nav = jQuery("<nav/>").addClass("thumbGridNav");

			if (grid.totPages <= 1)
				return;

			for (var x = 1; x <= grid.totPages; x++) {
				var idxPlaceHolder = jQuery("<a/>").html(x).attr({idx: (x - 1)});
				idxPlaceHolder.addClass("indexEl");
				idxPlaceHolder.on("click", function () {

					if (grid.pageIndex == jQuery(this).attr("idx"))
						return;

					grid.pageIndex = jQuery(this).attr("idx");
					jQuery.thumbGrid.drawPage(grid, grid.pageIndex);

					jQuery(".indexEl", nav).removeClass("sel");
					jQuery(".indexEl", nav).eq(grid.pageIndex).addClass("sel");
				});

				nav.append(idxPlaceHolder);
				jQuery(".indexEl", nav).eq(grid.pageIndex).addClass("sel");

			}
			nav.hide();

			grid.nav = nav;

			$grid.after(nav);

		},

		drawSlideShow: function (el, idx) {

			jQuery("body").trigger("drawSlideShow");
			jQuery("body").css({overflow: "hidden"});

			var grid = el,
					$grid = jQuery(grid),
					overlay = jQuery("<div/>").addClass("tg-overlay").css({opacity: 0}),
					placeHolder = jQuery("<div/>").addClass("tg-placeHolder"),
					slideShowClose = jQuery("<div/>").addClass("tg-close tg-icon").on("click", function () {jQuery.thumbGrid.closeSlideShow(el, idx)}),
					slideShowNext = jQuery("<div/>").addClass("tg-next tg-icon").on("click", function () {slideShow.next()}),
					slideShowPrev = jQuery("<div/>").addClass("tg-prev tg-icon").on("click", function () {slideShow.prev()}),
					spinnerPh = jQuery("<div/>").addClass("tg-spinner"),
					$origin = $grid.find("[data-globalindex=" + idx + "]").parent("li"),
					pHleft = $origin.offset().left - jQuery(window).scrollLeft(),
					pHtop = $origin.offset().top - jQuery(window).scrollTop(),
					pHwidth = $origin.outerWidth(),
					pHheight = $origin.outerHeight();


			grid.nav_effect = $grid.data("nav_effect") || "fade";
			grid.nav_delay = $grid.data("nav_delay") || 500;
			grid.nav_timing = $grid.data("nav_timing") || 1000;

			grid.slideShowIdx = idx;

			placeHolder.css({position: "fixed", left: pHleft, top: pHtop, width: pHwidth, height: pHheight});
			overlay.append(placeHolder).append(slideShowClose).append(spinnerPh).append(slideShowNext).append(slideShowPrev);

			jQuery(".tg-icon", overlay).css({opacity: 0});

			var spinnerOpts = {
				lines    : 11, // The number of lines to draw
				length   : 6, // The length of each line
				width    : 6, // The line thickness
				radius   : 16, // The radius of the inner circle
				corners  : 1, // Corner roundness (0..1)
				rotate   : 16, // The rotation offset
				direction: 1, // 1: clockwise, -1: counterclockwise
				color    : '#fff', // #rgb or #rrggbb or array of colors
				speed    : 1.3, // Rounds per second
				trail    : 52, // Afterglow percentage
				shadow   : false, // Whether to render a shadow
				hwaccel  : false, // Whether to use hardware acceleration
				className: 'spinner', // The CSS class to assign to the spinner
				zIndex   : 2e9, // The z-index (defaults to 2000000000)
				top      : '50%', // Top position relative to parent
				left     : '50%' // Left position relative to parent
			};

			var target = spinnerPh.get(0),
					spinner;

			spinner = new Spinner(spinnerOpts).spin(target);
			spinnerPh.hide();
			//spinnerPh.delay(800).fadeIn(1000);

			var slideShow = {
				effect    : grid.nav_effect,
				effectNext: grid.gallery_effectnext || grid.nav_effect,
				effectPrev: grid.gallery_effectprev || grid.nav_effect,

				init: function () {
					slideShow.goTo(false);
					slideShow.keyboard(true);
					grid.isAnimating = false;
				},

				keyboard: function (on) {
					if (on) {
						jQuery(document).on("keydown.thumbGallery", function (e) {

//							console.debug(e.keyCode, e.key) e.key is not supported by Webkit

							switch (e.keyCode) {

								case 27: //Esc
									jQuery.thumbGrid.closeSlideShow(el, idx);
									e.preventDefault();
									break;

								case 32: //space
//									jQuery.thumbGrid.closeSlideShow(el, idx);
									e.preventDefault();
									break;

								case 39: //arrow right
									slideShow.next();
									e.preventDefault();
									break;

								case 37: //arrow left
									slideShow.prev();
									e.preventDefault();
									break;
							}
						});

						jQuery("body").on("closeSlideShow", function () {slideShow.keyboard(false);});

					} else {
						jQuery(document).off("keydown.thumbGallery");
					}
				},

				goTo: function (animate) {

					var oldImgWrapper = jQuery(".tg-img-wrapper", placeHolder).eq(0);

					var idx = grid.slideShowIdx,
							imagesList = grid.elements,
							image = $(imagesList[idx]),
							imgWrapper = jQuery("<div/>").addClass("tg-img-wrapper"),
							imageToShowURL = image.data("highres"),
							imageCaption = image.data("caption"),
							imgContainer = jQuery("<div/>").addClass("tg-img-container");
					imgContainer.css({position: "absolute", top: 0, left: 0, bottom: 0, right: 0, width: grid.gallery_fullscreenw, height: grid.gallery_fullscreenh, margin: "auto"});
					imgWrapper.append(imgContainer);

					placeHolder.prepend(imgWrapper);

					imgWrapper.addClass("in");

					var img = jQuery("<img/>");

					var displayProperties = {top: 0, left: 0, opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, skew: 0, filter: "blur(0)"};

					if (animate) {
						imgWrapper.css(jQuery.thumbGrid.normalizeCss(jQuery.thumbGrid.transitions[slideShow.effect].in));
						slideShow.spinner = setTimeout(function () {
							spinner = new Spinner(spinnerOpts).spin(target);
							spinnerPh.fadeIn(300);
						}, 1000)
					} else {
						displayProperties = jQuery.thumbGrid.normalizeCss(displayProperties);
						imgWrapper.css(displayProperties);
						imgWrapper.css({opacity: 0});
					}

					img.one("load", function () {

						if (this.loaded)
							return;

						this.loaded = true;

						if (animate) {
							imgWrapper.css(jQuery.thumbGrid.normalizeCss(jQuery.thumbGrid.transitions[slideShow.effect].in));
						} else {
							displayProperties = jQuery.thumbGrid.normalizeCss(displayProperties);
							imgWrapper.css(displayProperties);
							imgWrapper.css({opacity: 0});
						}

						clearTimeout(slideShow.spinner);
						spinnerPh.fadeOut(300, function () {spinnerPh.empty();});

						imgContainer.css({
							backgroundImage   : "url(" + imageToShowURL + ")",
							backgroundSize    : grid.gallery_cover ? "cover" : "contain",
							backgroundPosition: "center center",
							backgroundRepeat  : "no-repeat"
						});

						var imageIndex = jQuery("<span/>").addClass("tg-img-index").html((idx + 1) + "/" + imagesList.length);
						var captionLabel = jQuery("<label/>").html(imageCaption).prepend(imageIndex);

						if (imageCaption)
							imgContainer.append(captionLabel);

						if (animate)
							grid.isAnimating = true;

						setTimeout(function () {
							imgWrapper.CSSAnimate(displayProperties, grid.opt.gallery_timing, 50, "cubic-bezier(0.19, 1, 0.22, 1)", function () {});
							oldImgWrapper.CSSAnimate(jQuery.thumbGrid.transitions[slideShow.effect].out, grid.opt.gallery_timing, 80, "cubic-bezier(0.19, 1, 0.22, 1)", function () {
								grid.isAnimating = false;
								oldImgWrapper.removeClass("in");
								jQuery(".tg-img-wrapper", placeHolder).not(".in").remove();
							});
						}, 100);

					}).attr({src: imageToShowURL});
				},

				next: function () {

					slideShow.effect = slideShow.effectNext;

					if (grid.isAnimating && jQuery.browser.msie)
						return;

					var imagesList = grid.elements;
					++grid.slideShowIdx;
					if (grid.slideShowIdx == $(imagesList).length) {
						grid.slideShowIdx = 0;
					}
					slideShow.goTo(true);
				},

				prev: function () {

					slideShow.effect = slideShow.effectPrev;

					if (grid.isAnimating && jQuery.browser.msie)
						return;

					var imagesList = grid.elements;
					--grid.slideShowIdx;
					if (grid.slideShowIdx == -1) {
						grid.slideShowIdx = $(imagesList).length - 1;
					}
					slideShow.goTo(true);
				}

			};

			jQuery("body").append(overlay);
			overlay.CSSAnimate({opacity: 1}, 600, 0, function () {

				placeHolder.CSSAnimate({width: "100%", height: "100%", left: 0, top: 0, opacity: 1}, 400, 0, "cubic-bezier(.8,.07,.98,.06)", function () {
					slideShow.init(grid);
					jQuery(".tg-icon", overlay).fadeTo(200, 1);
				})

			});

		},

		closeSlideShow: function (el, idx) {

			jQuery("body").trigger("closeSlideShow");

			var grid = el,
					$grid = jQuery(grid),
					origin = $grid.find("[data-globalindex=" + idx + "]").parents("li"),
					pHleft = origin.offset().left - jQuery(window).scrollLeft(),
					pHtop = origin.offset().top - jQuery(window).scrollTop(),
					pHwidth = origin.outerWidth(),
					pHheight = origin.outerHeight();

			jQuery(".tg-icon").fadeTo(200, 0);
			jQuery(".tg-placeHolder > div").fadeOut(500);
			jQuery(".tg-placeHolder").CSSAnimate({width: pHwidth, height: pHheight, left: pHleft, top: pHtop, opacity: 1}, 800, 400, "cubic-bezier(0.19, 1, 0.22, 1)", function () {
				jQuery(".tg-overlay").CSSAnimate({opacity: 0}, 600, function () {
					$(this).remove();
					jQuery("body").css({overflow: "auto"});
				});
			});
		}
	};

	jQuery.fn.thumbGrid = jQuery.thumbGrid.init;

})(jQuery);

//fgnass.github.com/spin.js#v2.0.1
!function (a, b) {"object" == typeof exports ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.Spinner = b()}(this, function () {
	"use strict";
	function a(a, b) {
		var c, d = document.createElement(a || "div");
		for (c in b)d[c] = b[c];
		return d
	}

	function b(a) {
		for (var b = 1, c = arguments.length; c > b; b++)a.appendChild(arguments[b]);
		return a
	}

	function c(a, b, c, d) {
		var e = ["opacity", b, ~~(100 * a), c, d].join("-"), f = .01 + c / d * 100, g = Math.max(1 - (1 - a) / b * (100 - f), a), h = j.substring(0, j.indexOf("Animation")).toLowerCase(), i = h && "-" + h + "-" || "";
		return l[e] || (m.insertRule("@" + i + "keyframes " + e + "{0%{opacity:" + g + "}" + f + "%{opacity:" + a + "}" + (f + .01) + "%{opacity:1}" + (f + b) % 100 + "%{opacity:" + a + "}100%{opacity:" + g + "}}", m.cssRules.length), l[e] = 1), e
	}

	function d(a, b) {
		var c, d, e = a.style;
		for (b = b.charAt(0).toUpperCase() + b.slice(1), d = 0; d < k.length; d++)if (c = k[d] + b, void 0 !== e[c])return c;
		return void 0 !== e[b] ? b : void 0
	}

	function e(a, b) {
		for (var c in b)a.style[d(a, c) || c] = b[c];
		return a
	}

	function f(a) {
		for (var b = 1; b < arguments.length; b++) {
			var c = arguments[b];
			for (var d in c)void 0 === a[d] && (a[d] = c[d])
		}
		return a
	}

	function g(a, b) {return"string" == typeof a ? a : a[b % a.length]}

	function h(a) {this.opts = f(a || {}, h.defaults, n)}

	function i() {
		function c(b, c) {return a("<" + b + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', c)}

		m.addRule(".spin-vml", "behavior:url(#default#VML)"), h.prototype.lines = function (a, d) {
			function f() {return e(c("group", {coordsize: k + " " + k, coordorigin: -j + " " + -j}), {width: k, height: k})}

			function h(a, h, i) {b(m, b(e(f(), {rotation: 360 / d.lines * a + "deg", left: ~~h}), b(e(c("roundrect", {arcsize: d.corners}), {width: j, height: d.width, left: d.radius, top: -d.width >> 1, filter: i}), c("fill", {color: g(d.color, a), opacity: d.opacity}), c("stroke", {opacity: 0}))))}

			var i, j = d.length + d.width, k = 2 * j, l = 2 * -(d.width + d.length) + "px", m = e(f(), {position: "absolute", top: l, left: l});
			if (d.shadow)for (i = 1; i <= d.lines; i++)h(i, -2, "progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");
			for (i = 1; i <= d.lines; i++)h(i);
			return b(a, m)
		}, h.prototype.opacity = function (a, b, c, d) {
			var e = a.firstChild;
			d = d.shadow && d.lines || 0, e && b + d < e.childNodes.length && (e = e.childNodes[b + d], e = e && e.firstChild, e = e && e.firstChild, e && (e.opacity = c))
		}
	}

	var j, k = ["webkit", "Moz", "ms", "O"], l = {}, m = function () {
		var c = a("style", {type: "text/css"});
		return b(document.getElementsByTagName("head")[0], c), c.sheet || c.styleSheet
	}(), n = {lines: 12, length: 7, width: 5, radius: 10, rotate: 0, corners: 1, color: "#000", direction: 1, speed: 1, trail: 100, opacity: .25, fps: 20, zIndex: 2e9, className: "spinner", top: "50%", left: "50%", position: "absolute"};
	h.defaults = {}, f(h.prototype, {spin: function (b) {
		this.stop();
		{
			var c = this, d = c.opts, f = c.el = e(a(0, {className: d.className}), {position: d.position, width: 0, zIndex: d.zIndex});
			d.radius + d.length + d.width
		}
		if (e(f, {left: d.left, top: d.top}), b && b.insertBefore(f, b.firstChild || null), f.setAttribute("role", "progressbar"), c.lines(f, c.opts), !j) {
			var g, h = 0, i = (d.lines - 1) * (1 - d.direction) / 2, k = d.fps, l = k / d.speed, m = (1 - d.opacity) / (l * d.trail / 100), n = l / d.lines;
			!function o() {
				h++;
				for (var a = 0; a < d.lines; a++)g = Math.max(1 - (h + (d.lines - a) * n) % l * m, d.opacity), c.opacity(f, a * d.direction + i, g, d);
				c.timeout = c.el && setTimeout(o, ~~(1e3 / k))
			}()
		}
		return c
	}, stop                              : function () {
		var a = this.el;
		return a && (clearTimeout(this.timeout), a.parentNode && a.parentNode.removeChild(a), this.el = void 0), this
	}, lines                             : function (d, f) {
		function h(b, c) {return e(a(), {position: "absolute", width: f.length + f.width + "px", height: f.width + "px", background: b, boxShadow: c, transformOrigin: "left", transform: "rotate(" + ~~(360 / f.lines * k + f.rotate) + "deg) translate(" + f.radius + "px,0)", borderRadius: (f.corners * f.width >> 1) + "px"})}

		for (var i, k = 0, l = (f.lines - 1) * (1 - f.direction) / 2; k < f.lines; k++)i = e(a(), {position: "absolute", top: 1 + ~(f.width / 2) + "px", transform: f.hwaccel ? "translate3d(0,0,0)" : "", opacity: f.opacity, animation: j && c(f.opacity, f.trail, l + k * f.direction, f.lines) + " " + 1 / f.speed + "s linear infinite"}), f.shadow && b(i, e(h("#000", "0 0 4px #000"), {top: "2px"})), b(d, b(i, h(g(f.color, k), "0 0 1px rgba(0,0,0,.1)")));
		return d
	}, opacity                           : function (a, b, c) {b < a.childNodes.length && (a.childNodes[b].style.opacity = c)}});
	var o = e(a("group"), {behavior: "url(#default#VML)"});
	return!d(o, "transform") && o.adj ? i() : j = d(o, "animation"), h
});
