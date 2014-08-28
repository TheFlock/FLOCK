// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'jquery', 
                'FLOCK/classes/Paginator', 
                'FLOCK/classes/Backplate',
                'FLOCK/classes/VideoBackplate',
                'greensock/TweenLite.min',
                'greensock/easing/EasePack.min',
                'greensock/plugins/CSSPlugin.min'
            ], function ($) {
            return (root.classes.SlideShow = factory($));
        });
    } else {
        root.classes.SlideShow = factory($);
    }
}(window.FLOCK = window.FLOCK || {}, function ($) {

    var cantransform3d = Modernizr.csstransforms3d,
        transformPrefixed = cantransform3d ? Modernizr.prefixed('transform') : '',
        isMobile,
        useFallbackImage,
        slide_ids = {};

    var SlideShow = function (data) {

        var el = data.el || data;

        this.close_fn = data.close_fn || false;
        this.paginator = data.paginator;
        this.axis = data.axis || 'x'; // direction to animate
        this.duration = data.duration || 0.75; // speed of animation
        this.rotate = data.rotate || false;
        this.rotation_delay = data.rotation_delay || 3000; // switch slide every 3 seconds

        isMobile = FLOCK.settings.isMobile;
        useFallbackImage = isMobile || FLOCK.settings.isIOS;

        this.slides = [];

        this.nextSlideshow = data.nextSlideshow || false;
        this.previousSlideshow = data.previousSlideshow || false;

        this.elements = {
            wrapper: el,
            prev: document.createElement('a'),
            next: document.createElement('a'),
            resizeContainer: data.resizeContainer || false,
            paginator_container: data.paginator_container || el
        };

        this.settings = {
            header_height: FLOCK.settings.header_height,
            footer_height: FLOCK.settings.footer_height,
            mode: data.mode || 'cover'
        }

        this.buildSlideshow(data.slides);
    }

    function buildSlideshow (slides) {

        var slide = '<div class="slide"><div class="backplate_wrapper"><img class="backplate" data-thumb="{{backplate.thumb}}" data-mode="{{backplate.mode}}" data-anchor="{{backplate.anchor}}" src="' + FLOCK.settings.base_url + '{{backplate.img}}"></div></div>',
            slides_html = '';

        for (var i = 0; i < slides.length; i++) {
            if (slides[i].visible === 'false') {
                continue;
            }
            slides_html += slide.replace('{{backplate.anchor}}', slides[i].anchor)
                                .replace('{{backplate.mode}}', slides[i].mode)
                                .replace('{{backplate.img}}', slides[i].img)
                                .replace('{{backplate.thumb}}', slides[i].thumb);
        };
        this.elements.wrapper.innerHTML = slides_html;

        var slideElements = this.elements.wrapper.getElementsByClassName('slide');
        for (var i = 0; i < slideElements.length; i++) {
            var loaded = i === 0 ? true : false; // TODO: this won't apply in all cases, need to determine if a backplate has been preloaded rather than just assuming the first one always is

            this.addSlide({
                el: slideElements[i],
                loaded: loaded
            });
        };

        $(this.elements.wrapper).on('click', '.internal', function (e) {
            FLOCK.functions.internalLink($(this).attr('href'));

            // e.preventDefault();
            return false;
        });

        this.state = {
            current_index: 0,
            last_index: this.slides.length - 1,
            direction: 'left',
            animating: false
        };

        if (Modernizr.touch) {
            // $(this.elements.wrapper).on('touchstart', touchStart.bind(this));
            // $(this.elements.wrapper).on('touchmove', touchMove.bind(this));
            // $(this.elements.wrapper).on('touchend', touchEnd.bind(this));
        }

        // previous and next index keep track of the slides to the left and right of current slide for touch
        this.state.previous_index = this.state.last_index;
        this.state.next_index = Math.min(1, this.state.previous_index);

        this.elements.wrapper.style.top = this.settings.header_height + 'px';

        var thumbs = [];
        for (var i = 0; i < this.slides.length; i++) {
            thumbs.push({
                src: this.slides[i].thumb,
                index: i
            });
        };

        if (this.paginator !== false) {
            this.paginator = new FLOCK.classes.Paginator({
                thumbs: thumbs
            });

            this.paginator.prev = this.previous.bind(this);
            this.paginator.next = this.next.bind(this);
            this.paginator.goToIndex = this.goToIndex.bind(this);
        }
        

        if (this.close_fn) {
            this.close = close_fn;

            this.elements.close_btn = document.createElement('a');
            this.elements.close_btn.href = '#';
            this.elements.close_btn.className = 'close';

            if (this.paginator) {
                this.paginator.elements.el.appendChild(this.elements.close_btn);
            } else {
                this.elements.wrapper.appendChild(this.elements.close_btn);
            }

            $(this.elements.close_btn).on('click', this.close);
        }

        if (this.paginator) {
            this.elements.paginator_container.appendChild(this.paginator.elements.el);
            this.paginator.update(this.state.current_index + 1, this.slides.length);
        }

        if (this.slides.length > 0) {
            this.slides[this.state.current_index].backplate.onScreen = true;
            this.slides[this.state.current_index].el.style.display = 'block';
            this.slides[this.state.current_index].backplate.elements.wrapper.style.display = 'block';

            if (cantransform3d) {
                this.slides[this.state.current_index].el.style[transformPrefixed] = 'translate3d(0px,0px,1px)';
                this.slides[this.state.last_index].el.style[transformPrefixed] = 'translate3d(' + (-this.slides[this.state.last_index].el.offsetWidth) + 'px, 0px, 1px)';
            } else {
                this.slides[this.state.current_index].el.style.left = '0px';
                this.slides[this.state.last_index].el.style.left = -this.slides[this.state.last_index].el.offsetWidth;
            }
        }

        if (this.rotate) {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
            this.timer = window.setInterval(this.next.bind(this), this.rotation_delay);
        }

        this.resize();
    }

    /**
    * if element exists, el is the only required property
    * if element does not exist, we need src, anchor, and sizing ('contain' or 'cover')
    */
    function addSlide (data) {
        var slide_obj = {},
            slide_element = data.el,
            loaded = data.loaded;

        if (slide_element === undefined) {

            if (slide_ids[data.src]) {
                console.log('ALREADY ADDED');
                return;
            } else {
                slide_ids[data.src] = this.slides.length;
            }

            slide_element = document.createElement('div');
            slide_element.className = 'slide';

            var backplate_wrapper = document.createElement('div'),
                backplate = document.createElement('img');

            backplate_wrapper.className = 'backplate_wrapper';

            backplate.className = 'backplate';
            backplate.src = data.src;

            backplate.anchor = data.anchor;

            backplate_wrapper.appendChild(backplate);

            slide_element.appendChild(backplate_wrapper);

            this.elements.wrapper.appendChild(slide_element);
        }

        slide_obj.el = slide_element;

        slide_obj.backplate = new FLOCK.classes.Backplate(slide_element.getElementsByClassName('backplate_wrapper')[0], loaded, this.elements.resizeContainer, this.settings.mode);
        
        if (slide_obj.backplate.elements.wrapper.className.match('quote')) {
            slide_obj.isQuote = true;
            slide_obj.backplate.settings.mode = 'contain';
        }

        slide_obj.thumb = slide_obj.backplate.elements.backplate.getAttribute('data-thumb');
        slide_obj.backplate.onScreen = false;

        slide_obj.video_wrapper = slide_element.getElementsByClassName('video_backplate')[0];

        if (slide_obj.video_wrapper) {
            // use fallback image instead of background video for mobile devices because the video can't auto-play
            if (useFallbackImage) {
                slide_obj.backplate = document.createElement('img');
                slide_obj.backplate.src = slide_obj.video_wrapper.getAttribute('data-image');
                slide_obj.backplate.className = 'backplate';
                slide_obj.video_wrapper.className = 'backplate_wrapper';
                slide_obj.video_wrapper.appendChild(slide_obj.backplate);
            } else {
                slide_obj.video_player = new FLOCK.classes.VideoBackplate(slide_obj.video_wrapper);
            }
        }

        if (isMobile) {
            slide_obj.backplate_wrapper = slide_obj.el.getElementsByClassName('backplate_wrapper')[0];
        }

        this.slides.push(slide_obj);

    }

    function go (instant) {

        if (this.state.last_index === this.state.current_index && this.slides.length !== 1) {
            return;
        }

        var that = this,
            prev = this.slides[this.state.last_index],
            curr = this.slides[this.state.current_index],
            prev_x = this.state.direction === 'left' ? -prev.el.offsetWidth : prev.el.offsetWidth,
            prev_y = this.state.direction === 'left' ? -prev.el.offsetHeight : prev.el.offsetHeight,
            tl = new TimelineLite();

        curr.backplate.onScreen = true;
        curr.el.style.display = 'block';
        curr.backplate.elements.wrapper.style.display = 'block';

        this.resize();

        if (cantransform3d) {
            if (prev.el.style[transformPrefixed] === 'translate3d(0px, 0px, 1px)') {
                if (this.axis === 'y') {
                    TweenLite.to(curr.el, 0, {y: (-prev_y) + 'px', z:1});
                } else {
                    TweenLite.to(curr.el, 0, {x: (-prev_x) + 'px', z:1});
                }
                //curr.style[transformPrefixed] = 'translate3d(' + (-prev_x) + 'px,0px,1px)';
            }
        } else {
            if (this.axis === 'y') {
                if (prev.el.style.top === '0px') {
                    curr.el.style.top = -prev_y + 'px';
                }
            } else {
                if (prev.el.style.left === '0px') {
                    curr.el.style.left = -prev_x + 'px';
                }
            }
            
        }

        // this.resize(getWindowDimensions().w, getWindowDimensions().h);
        if (this.paginator) {
            this.paginator.update(this.state.current_index + 1, this.slides.length);
        }

        if (this.slides[this.state.last_index].video_player) {
            this.slides[this.state.last_index].video_player.stop();
        }
        
        console.log("instant: "+instant);

        if (instant) {
            
            if (this.axis === 'y') {
                tl.to(curr.el, 0, {y: '0px', z:1}, 0)
                  .to(prev.el, 0, {y: prev_y + 'px', z:1}, 0);
            } else {
                tl.to(curr.el, 0, {x: '0px', z:1}, 0)
                  .to(prev.el, 0, {x: prev_x + 'px', z:1}, 0);
            }

            if(prev !== undefined && prev.style !== undefined){
                prev.style.display = 'none';
                prev.backplate.elements.wrapper.style.display = 'none';
                prev.backplate.onScreen = false;
            }

            that.state.animating = false;
            if (that.slides[that.state.current_index].video_player) {
                that.slides[that.state.current_index].video_player.play();
            }

        } else {
            this.state.animating = true;

            if (cantransform3d) {
                if (this.axis === 'y') {
                    tl.to(curr.el, this.duration, {y: '0px', z:1, ease: Power2.easeInOut}, 0)
                      .to(prev.el, this.duration, {y: prev_y + 'px', z:1, ease: Power2.easeInOut, onComplete: function () {
                        
                        if(prev !== undefined && prev.style !== undefined){
                            prev.el.style.display = 'none';
                            prev.backplate.elements.wrapper.style.display = 'none';
                            prev.backplate.onScreen = false;
                        }
                        
                        that.state.animating = false;
                        if (that.slides[that.state.current_index].video_player) {
                            that.slides[that.state.current_index].video_player.play();
                        }
                        that.onTransitionComplete();
                    }}, 0);
                } else {
                    tl.to(curr.el, this.duration, {x: '0px', z:1, ease: Power2.easeInOut}, 0)
                      .to(prev.el, this.duration, {x: prev_x + 'px', z:1, ease: Power2.easeInOut, onComplete: function () {
                        prev.el.style.display = 'none';
                        prev.backplate.elements.wrapper.style.display = 'none';
                        prev.backplate.onScreen = false;
                        that.state.animating = false;
                        if (that.slides[that.state.current_index].video_player) {
                            that.slides[that.state.current_index].video_player.play();
                        }
                        that.onTransitionComplete();
                    }}, 0);
                }
            } else {
                if (this.axis === 'y') {
                    console.log('axis is y');
                    console.log('this.duration: '+this.duration);
                    tl.to(curr.el, this.duration, {top: '0px', ease: Power2.easeInOut}, 0)
                      .to(prev.el, this.duration, {top: prev_y + 'px', ease: Power2.easeInOut, onComplete: function () {
                        
                        if(prev !== undefined && prev.style !== undefined){
                            prev.el.style.display = 'none';
                            prev.backplate.elements.wrapper.style.display = 'none';
                            prev.backplate.onScreen = false;
                        }
                        
                        that.state.animating = false;
                        if (that.slides[that.state.current_index].video_player) {
                            that.slides[that.state.current_index].video_player.play();
                        }
                        that.onTransitionComplete();
                    }}, 0);
                } else {
                    tl.to(curr.el, this.duration, {left: '0px', ease: Power2.easeInOut}, 0)
                      .to(prev.el, this.duration, {left: prev_x + 'px', ease: Power2.easeInOut, onComplete: function () {
                        prev.el.style.display = 'none';
                        prev.backplate.elements.wrapper.style.display = 'none';
                        prev.backplate.onScreen = false;
                        that.state.animating = false;
                        if (that.slides[that.state.current_index].video_player) {
                            that.slides[that.state.current_index].video_player.play();
                        }
                        that.onTransitionComplete();
                    }}, 0);
                }
            }
            
        }

    }

    function next () {
        if (this.state.animating) {
            return;
        }

        if (this.nextSlideshow) {
            if (this.state.current_index + 1 >= this.slides.length) {
                this.nextSlideshow();
                return;
            }
        }

        this.state.last_index = this.state.current_index;

        if (this.state.current_index + 1 < this.slides.length) {
            this.state.current_index = this.state.current_index + 1;
        } else {
            this.state.current_index = 0;
        }

        this._updateState();

        // this.state.current_index = this.state.current_index + 1 < this.slides.length ? this.state.current_index + 1 : 0;
        this.state.direction = 'left';
        this._go();
    }

    function previous () {
        if (this.state.animating) {
            return;
        }

        if (this.previousSlideshow) {
            if (this.state.current_index - 1 < 0) {
                this.previousSlideshow();
                return;
            }
        }

        this.state.last_index = this.state.current_index;

        if (this.state.current_index - 1 >= 0) {
            this.state.current_index = this.state.current_index - 1;
        } else {
            this.state.current_index = this.slides.length - 1;
        }

        this._updateState();

        // this.state.current_index = this.state.current_index - 1 >= 0 ? this.state.current_index - 1 : this.slides.length - 1;
        this.state.direction = 'right';
        this._go();
    }

    function goToIndex (i) {
        if (this.state.animating) {
            return;
        }
        
        this.state.direction = i > this.state.current_index ? 'left' : 'right';
        this.state.last_index = this.state.current_index;
        this.state.current_index = i;
        this._updateState();
        this._go();
    }

    function goToId (id, instant) {

        if (this.state.animating) {
            return;
        }

        var i = slide_ids[id];

        this.state.direction = 'left';
        this.state.last_index = this.state.current_index;
        this.state.current_index = i;
        this._updateState();

        this._go(instant);
    }

    function resizeVideo (w, h) {
        
    }

    function resize (width, height) {

        if (this.slides.length === 0) {
            return;
        }

        var w = width,
            h = height,
            wrapper = this.elements.wrapper,
            curr_slide = this.slides[this.state.current_index],
            backplate = curr_slide.backplate,
            video_player = curr_slide.video_player;

        if (w === undefined || h === undefined) {
            if (this.elements.resizeContainer) {
                w = this.elements.resizeContainer.offsetWidth;
                h = this.elements.resizeContainer.offsetHeight;
            } else {
                w = FLOCK.settings.window_dimensions.width;
                h = FLOCK.settings.window_dimensions.height - (FLOCK.settings.header_height + FLOCK.settings.footer_height);
            }
        }

        wrapper.style.height = h + 'px';

        if (curr_slide.isQuote) {
            w -= Math.max(FLOCK.settings.menu_width, FLOCK.settings.features_width);
        }

        if (backplate) {
            backplate.resize(w, h);
            // this._resizeBackplate(backplate, w, h);
        } else if (video_player) {
            // this._resizeBackplate(video_player, w, h);
        }

        // for (var i = this.slides.length - 1; i >= 0; i--) {

        //     curr_slide = this.slides[i];
        //     backplate = curr_slide.backplate;
        //     video_player = curr_slide.video_player;

        //     if (backplate) {
        //         backplate.resize(w, h);
        //         // this._resizeBackplate(backplate, w, h);
        //     } else if (video_player) {
        //         // this._resizeBackplate(video_player, w, h);
        //     }
        // };

        if (this.paginator) {
            this.paginator.resize(w,h);
        }

        console.log('RESIZE SLIDESHOW ' + FLOCK.settings.menu_width, FLOCK.settings.features_width);
    }

    function updateState () {
        this.state.previous_index = this.state.current_index - 1;
        if (this.state.previous_index < 0) {
            this.state.previous_index = this.slides.length - 1;
        }

        this.state.next_index = this.state.current_index + 1;
        if (this.state.next_index > this.slides.length - 1) {
            this.state.next_index = 0;
        }
    }

    function reset (go) {

        for (var i = this.slides.length - 1; i >= 0; i--) {
            if (this.slides[i].video_player) {
                this.slides[i].video_player.reset();
            }
        };

        this.state.current_index = 0;

        this.state.last_index = this.slides.length - 1;
        this.state.previous_index = this.state.last_index;
        this.state.next_index = Math.min(1, this.state.previous_index);

        if (go) {
            this._go('instant');
        }

        this.resize();
    }

    function onTransitionComplete () {
        console.log('onTransitionComplete');
    }

    function keyHandler (e) {
        switch (e.keyCode) {
        case 37: // left arrow
            this.previous();
            break;
        case 39: // right arrow
            this.next();
            break;
        default:
            // nothin'
        }
    }

    function touchStart (e) {

        if (this.state.animating) {
            this.mobileVars = false;
            return;
        }

        var touches = e.originalEvent.touches,
            offsetHeight = this.slides[this.state.current_index].el.offsetHeight,
            offsetWidth = this.slides[this.state.current_index].el.offsetWidth;

        this.mobileVars = {
            swipeStart: e.timeStamp,
            lastTime: e.timeStamp,
            startLeft: 0,
            endY: undefined,
            startY: touches[0].pageY,
            initialY: touches[0].pageY,
            endX: undefined,
            startX: touches[0].pageX,
            initialX: touches[0].pageX
        };

        TweenLite.to(this.slides[this.state.previous_index].el, 0, {x: (-offsetWidth) + 'px', z: 1});
        TweenLite.to(this.slides[this.state.next_index].el, 0, {x: (-offsetWidth) + 'px', z: 1});
        // this.slides[this.state.previous_index].el.style[transformPrefixed] = 'translate3d(' + (-offsetWidth) + 'px, 0px, 1px)';//  = -offsetWidth + 'px';
        // this.slides[this.state.next_index].el.style[transformPrefixed] = 'translate3d(' + offsetWidth + 'px, 0px, 1px)';//   = offsetWidth + 'px';

        this.slides[this.state.previous_index].el.style.display = 'block';
        this.slides[this.state.next_index].el.style.display = 'block';

        if (this.slides[this.state.previous_index].backplate) {
            this._resizeBackplate(this.slides[this.state.previous_index].backplate);
        } else {
            var vid_width = this.slides[this.state.previous_index].video_player.player_obj.player.videoWidth,
                vid_height = this.slides[this.state.previous_index].video_player.player_obj.player.videoHeight;
            console.log('touchStart 1: '+vid_width, vid_height);
        }
        
        if (this.slides[this.state.next_index].backplate) {
            this._resizeBackplate(this.slides[this.state.next_index].backplate);
        } else {
            var vid_width = this.slides[this.state.next_index].video_player.player_obj.player.videoWidth,
                vid_height = this.slides[this.state.next_index].video_player.player_obj.player.videoHeight;
            console.log('touchStart 2: '+vid_width, vid_height);
        }
    }

    function touchMove (e) {
        if (!isMobile) {
            e.preventDefault();
        }

        if (this.mobileVars === false) {
            return;
        }

        var touches = e.originalEvent.touches,
            offsetWidth = this.slides[this.state.current_index].el.offsetWidth,
            lastMoveDuration = e.timeStamp - this.mobileVars.lastTime;

        this.mobileVars.lastTime = e.timeStamp;

        this.mobileVars.endY = touches[0].pageY;
        this.mobileVars.endX = touches[0].pageX;

        this.mobileVars.lastX = this.mobileVars.currentPageX;
        this.mobileVars.lastY = this.mobileVars.currentPageY;
        this.mobileVars.currentPageY = this.mobileVars.endY;
        this.mobileVars.currentPageX = this.mobileVars.endX;

        this.mobileVars.changeY = this.mobileVars.currentPageY - this.mobileVars.initialY;
        this.mobileVars.changeX = this.mobileVars.currentPageX - this.mobileVars.initialX;


        if (this.mobileVars.direction === undefined) {
            this.mobileVars.direction = Math.abs(this.mobileVars.changeX) > Math.abs(this.mobileVars.changeY) ? 'horiz' : 'vert';
        }

        if (this.mobileVars.direction === 'horiz') {

            var target_left = (this.mobileVars.startLeft + (this.mobileVars.changeX / 3));

            TweenLite.to(this.slides[this.state.current_index].el, 0, {x: target_left + 'px', z: 1});
            TweenLite.to(this.slides[this.state.previous_index].el, 0, {x: (target_left - offsetWidth) + 'px', z: 1});
            TweenLite.to(this.slides[this.state.next_index].el, 0, {x: (target_left + offsetWidth) + 'px', z: 1});
            
            // this.slides[this.state.current_index].el.style[transformPrefixed] = 'translate3d(' + target_left + 'px, 0px, 1px)';// target_left + 'px';
            // this.slides[this.state.previous_index].el.style[transformPrefixed] = 'translate3d(' + (target_left - offsetWidth) + 'px, 0px, 1px)';// (target_left - offsetWidth) + 'px';
            // this.slides[this.state.next_index].el.style[transformPrefixed] = 'translate3d(' + (target_left + offsetWidth) + 'px, 0px, 1px)';// (target_left + offsetWidth) + 'px';

            // this.elements.wrapper.css('left', this.mobileVars.startLeft + (this.mobileVars.changeX / 4)); // divide changeX by 4 to get a more subtle effect
        } else {
            // this.elements.window.scrollTop(this.mobileVars.startScroll - this.mobileVars.changeY);
        }
    }

    function touchEnd (e) {

        if (this.mobileVars === false) {
            return;
        }

        var touches = e.originalEvent.touches,
            changeX = this.mobileVars.changeX,
            lastChangeX = this.mobileVars.currentPageX - this.mobileVars.lastX; // Math.abs(this.mobileVars.changeX + (this.mobileVars.currentPageX - this.mobileVars.lastX));

        if (changeX === undefined || Math.abs(changeX) < 60) {
            return;
        }

        // if you swipe, but change your mind, don't change index
        if (Math.abs(changeX + lastChangeX) < Math.abs(changeX)) {
            console.log('don\'t change');
            this._go();
            return;
        }

        if (Math.abs(this.mobileVars.changeX) > 100) {
            if (this.mobileVars.changeX > 0) {
                this.previous();
            } else {
                this.next();
            }
        } else {
            this._go();
        }

    }

    function enter () {
        if (this.rotate) {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
            this.timer = window.setInterval(this.next.bind(this), this.rotation_delay);
        }
    }

    function exit () {
        if (this.timer) {
            window.clearInterval(this.timer);
        }
    }

    SlideShow.prototype._go = go;
    SlideShow.prototype._updateState = updateState;
    
    // SlideShow.prototype._resizeBackplate = resizeBackplate;
    SlideShow.prototype.buildSlideshow = buildSlideshow;
    SlideShow.prototype.addSlide = addSlide;
    SlideShow.prototype.reset = reset;
    SlideShow.prototype.keyHandler = keyHandler;
    SlideShow.prototype.next = next;
    SlideShow.prototype.previous = previous;
    SlideShow.prototype.goToId = goToId;
    SlideShow.prototype.goToIndex = goToIndex;
    SlideShow.prototype.resize = resize;
    SlideShow.prototype.onTransitionComplete = onTransitionComplete;

    SlideShow.prototype.enter = enter;
    SlideShow.prototype.exit = exit;

    // touch events
    SlideShow.prototype.touchStartHandler = touchStart;
    SlideShow.prototype.touchMoveHandler = touchMove;
    SlideShow.prototype.touchEndHandler = touchEnd;

    return SlideShow;
}));