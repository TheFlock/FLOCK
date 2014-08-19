// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.app = root.app || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'FLOCK/app/Paginator', 'FLOCK/utils/VideoPlayerME'], function ($) {
            return (root.app.Backplate = factory($));
        });
    } else {
        root.app.Backplate = factory($);
    }
}(window.FLOCK = window.FLOCK || {}, function ($) {

    var Backplate = function (el, loaded, resizeContainer, mode) {

        this.elements = {
            wrapper: el,
            backplate: $(el).find('.backplate')[0],
            resizeContainer: resizeContainer || false
        };

        this.settings = {
            anchor: this.elements.backplate.getAttribute('data-anchor'),
            ratio: this._getRatio(),
            mode: mode || 'cover'
        }

        this.elements.wrapper.className += ' loading';
        this.elements.wrapper.style.display = 'none';

        // set loaded to true by default because most backplates will be preloaded with the section
        this.loaded = loaded === undefined ? true : loaded;
        this.onScreen = true;

        $(this.elements.backplate).addClass('loading').on('load', this._onImageLoaded.bind(this));

    }

    function getRatio () {
        var ratio = this.elements.backplate.height / this.elements.backplate.width;

        return ratio;
    }

    function onImageLoaded (e) {

        this.elements.wrapper.className = this.elements.wrapper.className.replace('loading', '');
        
        this.resize();
        window.setTimeout(this.resize.bind(this), 100);

        // Only tween images that are visible and weren't preloaded, so we aren't tweening gallery images that are off screen
        if (this.onScreen && !this.loaded) {
            TweenLite.fromTo(this.elements.backplate, 0.5, {alpha: 0}, {alpha: 1});
        }
    }

    function resize (w, h) {

        var backplate = this.elements.backplate,
            backplate_wrapper = this.elements.wrapper,
            anchor = this.settings.anchor,
            leftpos,
            toppos,
            w = w,
            h = h,
            bw = w,
            bh = h,
            current_ratio = this._getRatio();
            
        // current_ratio = 478/852;
        if (w === undefined || h === undefined) {
            if (this.elements.resizeContainer) {
                w = this.elements.resizeContainer.offsetWidth;
                h = this.elements.resizeContainer.offsetHeight;
            } else {
                w = FLOCK.settings.window_dimensions.width;
                h = FLOCK.settings.window_dimensions.height - (FLOCK.settings.header_height + FLOCK.settings.footer_height);
            }
        }

        backplate_wrapper.style.width = w + 'px';
        backplate_wrapper.style.height = h + 'px';

        if (isNaN(current_ratio) || current_ratio === 0) {
            return;
        }

        /**
        * set height and width based on ratio
        */
        // if tall image
        if (current_ratio > 1) {

            
            if (this.settings.mode === 'contain') {
                // if wide image
                if (h / w > current_ratio) {
                    // window is tall
                    bw = w;
                    bh = bw * current_ratio;
                } else {
                    // window is wide
                    bh = h;
                    bw = bh / current_ratio;
                }
            } else {
                bh = h;
                bw = bh / current_ratio;
            }

            backplate.style.width = bw + 'px';
            backplate.style.height = bh + 'px';

        } else {
            if (this.settings.mode === 'contain') {
                // if wide image
                if (h / w > current_ratio) {
                    // window is tall
                    bw = w;
                    bh = bw * current_ratio;
                } else {
                    // window is wide
                    bh = h;
                    bw = bh / current_ratio;
                }
            } else {
                // if wide image
                if (h / w > current_ratio) {
                    // window is tall
                    bh = h;
                    bw = bh / current_ratio;
                } else {
                    // window is wide
                    bw = w;
                    bh = bw * current_ratio;
                }
            }

            backplate.style.width = bw + 'px';
            backplate.style.height = bh + 'px';
        }

        switch (anchor) {
            case 't':
                toppos = 0;
                leftpos = (w - bw) / 2;
                break;
            case 'l':
                toppos = (h - bh) / 2;
                leftpos = 0;
                break;
            case 'tl':
                toppos = 0;
                leftpos = 0;
                break;
            case 'r':
                toppos = (h - bh) / 2;
                leftpos = w - bw;
                break;
            case 'tr':
                toppos = 0;
                leftpos = w - bw;
                break;
            case 'b':
                toppos = h - bh;
                leftpos = (w - bw) / 2;
                break;
            case 'bl':
                toppos = h - bh;
                leftpos = 0;
                break;
            case 'br':
                toppos = h - bh;
                leftpos = w - bw;
                break;
            default:
                toppos = (h - bh) / 2;
                leftpos = (w - bw) / 2;
        }

        /**
        * set top and left based on anchor
        */
        backplate.style.left = leftpos + 'px';
        backplate.style.top = toppos + 'px';

        var size_obj = {
            width: bw,
            height: bh,
            left: leftpos,
            top: toppos
        }
        
        return size_obj;

    }

    Backplate.prototype._onImageLoaded = onImageLoaded;
    Backplate.prototype._getRatio = getRatio;

    Backplate.prototype.resize = resize;

    return Backplate;
}));