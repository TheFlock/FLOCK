// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.app = root.app || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], function () {
            return (root.app.Paginator = factory());
        });
    } else {
        root.app.Paginator = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

    var breakpoints = [
        1250,
        1500,
        1750,
        2000,
        2250
    ]

    var Paginator = function (data) {

        var that = this;

        this.maxThumbs = data.maxThumbs || false;
        this.thumbs = data.thumbs || false;
        this.rotate = data.rotate || false;
        this.rotation_delay = data.rotation_delay || 3000;

        this.currThumbs = 4; // 4 thumbs will be visible by default
        if (this.maxThumbs) {
            this.currThumbs = Math.min(this.maxThumbs, this.currThumbs);
        }

        this.elements = {
            el: document.createElement('div'),
            prev: document.createElement('a'),
            next: document.createElement('a'),
            count: document.createElement('span'),
            bg: document.createElement('div')
        };

        this.elements.count.className = 'count';
        this.elements.el.className = 'paginator';
        this.elements.prev.innerHTML = 'Previous';
        this.elements.prev.href = '#';
        this.elements.prev.className = 'prev_page';
        this.elements.next.innerHTML = 'Next';
        this.elements.next.href = '#';
        this.elements.next.className = 'next_page';
        this.elements.bg.className = 'background_shape';

        this.elements.el.appendChild(this.elements.bg);
        this.elements.el.appendChild(this.elements.prev);
        this.elements.el.appendChild(this.elements.count);
        this.elements.el.appendChild(this.elements.next);

        if (this.thumbs) {
            this._buildThumbs();
        }

        $(this.elements.el).on('click', 'a', function (e) {

            if (this.getAttribute('data-type') === 'external') {
                return;
            } else if (this.getAttribute('data-type') === 'overlay') {
                FLOCK.functions.showOverlay(this.getAttribute('href'));
                return false;
            } else if (this.getAttribute('data-type') === 'internal') {
                FLOCK.functions.internalLink(this.getAttribute('href'));
            }

            if (this.className.match(/(selected|disabled)/)) {
                return false;
            } else if (this.className.match('thumb')) {
                if (that.goToIndex) {
                    that.goToIndex(parseInt(this.getAttribute('href')));
                }
            } else {
                switch (this.className) {
                    case 'prev':
                        if (that.prev) {
                            that.prev();
                        }
                        break;
                    case 'next':
                        if (that.next) {
                            that.next();
                        }
                        break;
                    case 'prev_page':
                        that._prevThumbs();
                        break;
                    case 'next_page':
                        that._nextThumbs('click');
                        break;
                    default:
                        return;
                }
            }

            // e.preventDefault();
            return false;

        });

    }

    function buildThumbs () {
        var thumbs_html = '';

        this.elements.thumb_wrapper = document.createElement('div');
        this.elements.thumb_wrapper.className = 'thumb_wrapper';

        this.elements.thumb_list = document.createElement('ul');

        for (var i = 0; i < this.thumbs.length; i++) {

            // ticketing widget doesn't work for ie8
            if (document.documentElement.className.match('lt-ie9')) {
                if (this.thumbs[i].link === '#ticketing' || this.thumbs[i].link === '#soundtrack') {
                    continue;
                }
            }
            

            thumbs_html += '<li>';

            if (this.thumbs[i].link) {
                thumbs_html += '<a class="thumb" href="' + this.thumbs[i].link + '"';
            } else {
                thumbs_html += '<a class="thumb" href="' + this.thumbs[i].index + '"';
            }
            
            if (this.thumbs[i].type) {
                thumbs_html += ' data-type="' + this.thumbs[i].type + '"';
                if (this.thumbs[i].type === 'external') {
                    thumbs_html += ' target="_blank"';
                }
            }
            thumbs_html += ' ><img src="' + this.thumbs[i].src + '" />';
            if (this.thumbs[i].caption) {
                var fontSize = '';
                if (this.thumbs[i].fontSize) {
                    fontSize = ' style="font-size:' + this.thumbs[i].fontSize + '"';
                }
                thumbs_html += '<p' + fontSize + '>' + this.thumbs[i].caption + '</p>';
            }
            thumbs_html += '</a>';
            thumbs_html += '</li>';
        };

        this.elements.thumb_list.innerHTML = thumbs_html;
        this.elements.thumb_wrapper.appendChild(this.elements.thumb_list);
        this.elements.el.appendChild(this.elements.thumb_wrapper);
        this.elements.thumbs = $(this.elements.thumb_list).find('.thumb'); //this.elements.thumb_list.getElementsByClassName('thumb');

        this.resize(FLOCK.settings.window_dimensions.width, FLOCK.settings.window_dimensions.height);
        window.setTimeout(this._resizeThumbHolder.bind(this), 10); // not sure why this needs to be in a settimeout, but if it's not, the features are positioned partially off the screen to the right
    
        if (this.rotate) {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
            this.timer = window.setInterval(this._nextThumbs.bind(this), this.rotation_delay);
        }
    }

    function prevThumbs () {
        var lpos = this.elements.thumb_list.offsetLeft + this.thumbWidth * this.currThumbs,
            that = this;

        this.elements.next.className = 'next_page';

        if (lpos >= 0) {
            lpos = 0;
            this.elements.prev.className = 'prev_page disabled';
        } else {
            this.elements.prev.className = 'prev_page';
        }

        if (this.timer) {
            window.clearInterval(this.timer);
        }

        TweenLite.to(this.elements.thumb_list, 0.5, {left:lpos + 'px', ease:Power3.easeInOut, onComplete: function () {
            if (that.rotate) {
                if (that.timer) {
                    window.clearInterval(that.timer);
                }
                that.timer = window.setInterval(that._nextThumbs.bind(that), that.rotation_delay);
            }
        }});
    }

    function nextThumbs (click) {
        console.log('next thumbs');

        var lpos = this.elements.thumb_list.offsetLeft - this.thumbWidth * this.currThumbs,
            that = this;

        this.elements.prev.className = 'prev_page';

        if (this.elements.next.className.match('disabled') && this.rotate) {
            this.elements.next.className = 'next_page';
            this.elements.prev.className = 'prev_page disabled';
            lpos = 0;
        } else if (lpos <= this.elements.thumb_wrapper.offsetWidth - this.elements.thumb_list.offsetWidth) {
            lpos = this.elements.thumb_wrapper.offsetWidth - this.elements.thumb_list.offsetWidth;
            this.elements.next.className = 'next_page disabled';
        } else {
            this.elements.next.className = 'next_page';
        }

        if (this.timer) {
            window.clearInterval(this.timer);
        }

        TweenLite.to(this.elements.thumb_list, 0.5, {left:lpos + 'px', ease:Power3.easeInOut, onComplete: function () {
            if (that.rotate) {
                if (that.timer) {
                    window.clearInterval(that.timer);
                }
                that.timer = window.setInterval(that._nextThumbs.bind(that), that.rotation_delay);
            }
        }});
    }

    function update (current, total) {

        var selected_thumbs = this.elements.thumb_list.getElementsByClassName('selected');

        for (var i = selected_thumbs.length - 1; i >= 0; i--) {
            selected_thumbs[i].className = selected_thumbs[i].className.replace('selected', '');
        };

        this.elements.thumbs[current - 1].className = this.elements.thumbs[current - 1].className + ' selected';

        this.elements.count.innerHTML = current + '/' + total;
    }

    function resizeThumbHolder () {
        this.currThumbs = this.numThumbs;
        if (this.maxThumbs) {
            this.currThumbs = Math.min(this.maxThumbs, this.currThumbs);
        }

        var total_width = 0,
            wrapper_width;

        this.thumbWidth = $(this.elements.thumbs[this.elements.thumbs.length - 1].parentNode).outerWidth(true); // thumb width plus thumb margin
        this.thumbMargin = this.thumbWidth - $(this.elements.thumbs[this.elements.thumbs.length - 1].parentNode).outerWidth();

        for (var i = 0; i < this.elements.thumbs.length; i++) {
            total_width += this.thumbWidth;
        };

        total_width -= this.thumbMargin;
        wrapper_width = this.thumbWidth * this.currThumbs - this.thumbMargin;

        // if all of the thumbs fit in the thumb_wrapper
        if (wrapper_width >= total_width) {
            this.elements.next.className = 'next_page disabled';
            this.elements.prev.className = 'prev_page disabled';

            this.elements.thumb_wrapper.style.width = total_width + 'px';
            this.elements.thumb_list.style.width = total_width + 'px';
            this.elements.thumb_list.style.left = '0px';
            
            this.elements.el.style.width = $(this.elements.thumb_wrapper).outerWidth(true) + 'px';
            this.elements.bg.style.width = this.elements.el.style.width;
        } else {
            this.elements.next.className = 'next_page';
            this.elements.prev.className = 'prev_page';

            this.elements.thumb_wrapper.style.width = wrapper_width + 'px';
            this.elements.thumb_list.style.width = total_width + 'px';

            this.elements.el.style.width = $(this.elements.thumb_wrapper).outerWidth(true) + 'px';
            this.elements.bg.style.width = this.elements.el.style.width;

            if (this.elements.thumb_list.offsetLeft >= 0) {
                this.elements.prev.className = 'prev_page disabled';
            }

            if (this.elements.thumb_list.offsetLeft + total_width <= wrapper_width) {
                this.elements.thumb_list.style.left = (wrapper_width - total_width) + 'px';
                this.elements.next.className = 'next_page disabled';
            } else {

                if (Math.abs(this.elements.thumb_list.offsetLeft) > 0) {
                    var remainder = Math.max(Math.abs(this.elements.thumb_list.offsetLeft), this.thumbWidth) % Math.min(Math.abs(this.elements.thumb_list.offsetLeft), this.thumbWidth);

                    if (Math.abs(this.elements.thumb_list.offsetLeft) < this.thumbWidth) {
                        remainder *= -1;
                    }

                    this.elements.thumb_list.style.left = (this.elements.thumb_list.offsetLeft + remainder) + 'px';
                }
            }

        }

    }

    function enter () {
        if (this.rotate) {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
            this.timer = window.setInterval(this._nextThumbs.bind(this), this.rotation_delay);
        }
    }

    function exit () {
        if (this.timer) {
            window.clearInterval(this.timer);
        }
    }

    // set number of visible thumbs
    function resize (w,h) {

        for (var i = 0; i < breakpoints.length; i++) {

            this.numThumbs = Math.min(this.elements.thumbs.length, 3 + i);

            if (w <= breakpoints[i]) {
                break;
            }
        };

        this._resizeThumbHolder();

    }

    Paginator.prototype._resizeThumbHolder = resizeThumbHolder;
    Paginator.prototype._prevThumbs = prevThumbs;
    Paginator.prototype._nextThumbs = nextThumbs;
    Paginator.prototype._buildThumbs = buildThumbs;

    Paginator.prototype.enter = enter;
    Paginator.prototype.exit = exit;

    Paginator.prototype.update = update;
    Paginator.prototype.resize = resize;

    return Paginator;
}));