// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], function ($) {
            return (root.classes.FallbackLoader = factory());
        });
    } else {
        root.classes.FallbackLoader = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

    var that,
        arrayExecuter = FLOCK.utils.ArrayExecuter,
        logo_dots = [],
        active_dots = [],
        inactive_dots = [],
        rows = [],
        numpoints = 27,
        dot_settings = {
            x_y_ratio: 0.7775,
            y_distance: 20,
            dot_size: 16
        };

    dot_settings.x_distance = dot_settings.x_y_ratio * dot_settings.y_distance;
    
    var Dot = function (point) {
        this.dot_size = dot_settings.dot_size,

        this.dot = document.createElement('img');
        this.dot.className = 'loader_dot';
        this.dot.width = this.dot.height = dot_settings.dot_size;
        this.dot.style.position = 'absolute';
        this.dot.style.left = point.x + 'px';
        this.dot.style.top = point.y + 'px';

        this.dot.src = FLOCK.settings.base_url + '/img/loader_dot.png';

        this.tween = new TweenLite.fromTo(this.dot, 1, {alpha:0.00001}, {alpha:0.75, paused: true, onCompleteParams: [this], onComplete: this._isOn, onReverseCompleteParams: [this], onReverseComplete: this._isOn, onReverseComplete: this._isOff});

        this.point = point;

        this.reset();
    }

    Dot.prototype.turnOn = function () {
        this.tween.timeScale( 1 );
        this.tween.restart();
    }

    Dot.prototype.turnOff = function () {
        this.tween.timeScale( 2 );
        this.tween.reverse();
    }

    Dot.prototype.resize = function (point) {
        this.point = point;

        this.reset();
    }

    Dot.prototype._isOn = function (dot) {
        dot.turnOff();
        dot.done = true;
    }

    Dot.prototype._isOff = function (dot) {
        Dot.off ++;

        if (Dot.off === 27) {
            Dot.onComplete();
        }
    }

    Dot.prototype.reset = function () {
        that.done = false;
    }

    var FallbackLoader = function () {
        this.id = 'FallbackLoader';

        this.elem = document.createElement('div');
        this.elem.id = 'FallbackLoader';
        this.elem.style.position = 'fixed';
        this.elem.style.zIndex = 2;

        $('body').append($(this.elem));

        this.elem.style.display = 'block';
        this.elem.width = $(window).width();
        this.elem.height = $(window).height();

        that = this;

        var devicePixelRatio = window.devicePixelRatio || 1;

        if (devicePixelRatio > 1) {
            dot_settings.y_distance = 10;
            dot_settings.dot_size = 8;
            dot_settings.x_distance = dot_settings.x_y_ratio * dot_settings.y_distance;
        }

        this._buildLogo();
    }

    function buildLogo () {
        var window_width = $(window).width(),
            window_height = $(window).height(),
            window_size = {
                width: window_width,
                height: window_height
            },
            logo_dot,
            startx = window_width / 2,
            starty = window_height / 3,
            currx = startx,
            curry = starty,
            row = 1,
            row_length = 6,
            curr_point;

        // make logo dots
        for (var i = 0; i < numpoints; i++) {
            curr_point = {
                x: currx,
                y: curry
            }

            logo_dot = new Dot(curr_point, window_size, true);
            logo_dots.push(logo_dot);
            this.elem.appendChild(logo_dot.dot);

            inactive_dots.push(logo_dot);

            if (row > 3) {
                row_length = 3;
            }

            if ((i + 1)%row_length === 0) {
                startx += dot_settings.x_distance;
                starty += dot_settings.y_distance;
                currx = startx;
                curry = starty;
                row ++;
            } else {
                currx -= dot_settings.x_distance;
                curry += dot_settings.y_distance;
            }
        };

        Dot.onComplete = this.isOut;

        this._positionLogo();
    }

    function positionLogo () {
        var window_width = $(window).width(),
            window_height = $(window).height(),
            window_size = {
                width: window_width,
                height: window_height
            },
            startx = window_width / 2,
            starty = window_height / 2.5,
            currx = startx,
            curry = starty,
            curr_point,
            row = 1,
            row_length = 6,
            rect_y = starty;

        for (var i = 0; i < numpoints; i++) {
            
            curr_point = {
                x: currx,
                y: curry
            }

            logo_dots[i].resize(curr_point);

            if (row > 3) {
                row_length = 3;
            }

            if ((i + 1)%row_length === 0) {
                startx += dot_settings.x_distance;
                starty += dot_settings.y_distance;
                currx = startx;
                curry = starty;
                row ++;
            } else {
                currx -= dot_settings.x_distance;
                curry += dot_settings.y_distance;
            }
        }
        
    }

    function reset () {
        Dot.off = 1;
        while (active_dots.length > 0) {
            inactive_dots.push(active_dots.pop());
        }
        for (var i = logo_dots.length - 1; i >= 0; i--) {
            logo_dots[i].reset();
        }
    }

    function stop() {
        console.log('paper stop');
    }

    function complete () {
        console.log('paper complete');
    }

    function update () {
        if (inactive_dots.length > 0) {
            var points_to_add = Math.floor(this.perc * numpoints) - active_dots.length,
                dot;

            while (points_to_add > 0) {
                points_to_add--;

                dot = inactive_dots.splice(Math.floor(Math.random()*(inactive_dots.length - 1)), 1)[0];
                dot.turnOn();

                active_dots.push(dot);
            }
        } else {
            var done = 0;

            for (var i = active_dots.length - 1; i >= 0; i--) {
                // extra_dots[i].update();
                if (active_dots[i].done) {
                    done ++;
                }
            };

            if (done === active_dots.length) {
                this.finished = true;
                this.elem.className = '';
            };
        }
    }

    function bringIn () {
        var el = this.elem;

        this.resize();
        this._reset();

        this.finished = false;
        this.perc = 0;
        this.elem.style.display = 'block';

        window.setTimeout(function () {
            el.className = 'loading';
        }, 50);
    }

    function goOut () {
        console.log('paper goOut');
        arrayExecuter.stepComplete();
    }

    function isOut () {
        console.log('paper isOut');
        // that.finished = true;
        that.elem.style.display = 'none';
    }

    function resize () {

        this.elem.width = $(window).width();
        this.elem.height = $(window).height();

        this._positionLogo();
    }

    FallbackLoader.prototype._stop = stop;
    FallbackLoader.prototype._buildLogo = buildLogo;
    FallbackLoader.prototype._positionLogo = positionLogo;
    FallbackLoader.prototype._reset = reset;

    FallbackLoader.prototype.resize = resize;
    FallbackLoader.prototype.complete = complete;
    FallbackLoader.prototype.update = update;
    FallbackLoader.prototype.bringIn = bringIn;
    FallbackLoader.prototype.goOut = goOut;
    FallbackLoader.prototype.isOut = isOut;

    return FallbackLoader;
}));