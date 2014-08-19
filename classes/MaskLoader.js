// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], function ($) {
            return (root.classes.MaskLoader = factory());
        });
    } else {
        root.classes.MaskLoader = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [v1.0]
    function shuffle(o){ //v1.0
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    var requestId,
        that,
        arrayExecuter = FLOCK.utils.ArrayExecuter;

    var logo_dots = [],
        extra_dots = [],
        active_dots = [],
        inactive_dots = [],
        lines = [],
        active_lines = [],
        inactive_lines = [],
        rows = [],
        numpoints = 27,
        numlines = 20;

    var dot_settings = {
        x_y_ratio: 0.7775,
        y_distance: 20,
        dot_size: 8,
        dot_color: 'rgba(198,159,28,.75)'
    }

    dot_settings.x_distance = dot_settings.x_y_ratio * dot_settings.y_distance;
    dot_settings.angle = Math.atan(dot_settings.x_distance / dot_settings.y_distance);

    var Line = function (point, size) {
        this.direction = Math.random() < 0.5 ? -1 : 1;

        this.point = point;
        this.size = size;

        this.speed = 25 + Math.random() * 45;
        this.length = 50 + Math.random() * 500;
        this.weight = 0.5 + Math.random() * 3;

        // randomly position the lines constrained by the dot size
        this.point.x = (this.point.x - dot_settings.dot_size) + Math.random() * (dot_settings.dot_size * 2);
        this.point.y = (this.point.y - dot_settings.dot_size) + Math.random() * (dot_settings.dot_size * 2);

        this.line = {
            position: {},
            start_point: {},
            end_point: {}
        }

        this.reset();
    }

    Line.prototype.update = function () {

        var xchange = (this.line.target_position.x - this.line.start_point.x) / this.speed,
            ychange = (this.line.target_position.y - this.line.start_point.y) / this.speed;

        this.line.start_point.x += xchange;
        this.line.end_point.x += xchange;
        this.line.start_point.y += ychange;
        this.line.end_point.y += ychange;

        this.line.opacity = Math.max(this.line.opacity - 0.02, 0);
    }

    Line.prototype.resize = function (point, size) {
        this.point = point;
        this.size = size;
        this.reset();
    }

    Line.prototype.reset = function () {

        if (this.direction === -1) {
        // start lower left
            this.line.start_point = {
                x: this.point.x - Math.tan(dot_settings.angle) * (this.size.height - this.point.y),
                y: this.size.height
            };
            this.line.end_point = {
                x: this.line.start_point.x - Math.sin(dot_settings.angle) * this.length,
                y: this.line.start_point.y + Math.cos(dot_settings.angle) * this.length
            };
            this.line.target_position = {
                x: this.point.x + Math.tan(dot_settings.angle) * this.point.y + (Math.sin(dot_settings.angle) * this.length),
                y: 0 - (Math.cos(dot_settings.angle) * this.length)
            };
        } else {
        // start upper right
            this.line.start_point = {
                x: this.point.x + Math.tan(dot_settings.angle) * this.point.y,
                y: 0
            };
            this.line.end_point = {
                x: this.line.start_point.x + Math.sin(dot_settings.angle) * this.length,
                y: this.line.start_point.y - Math.cos(dot_settings.angle) * this.length
            };
            this.line.target_position = {
                x: this.point.x - Math.tan(dot_settings.angle) * (this.size.height - this.point.y) - Math.sin(dot_settings.angle) * this.length,
                y: this.size.height + Math.cos(dot_settings.angle) * this.length
            };
        }

        this.line.opacity = 0.75;
        this.line.strokeColor = dot_settings.dot_color;
        this.line.strokeWidth = this.weight;
    }

    var Dot = function (point, size, isLogoDot) {
        this.dot_size = dot_settings.dot_size,
        this.dot_color = dot_settings.dot_color;

        this.y_dist = 500;

        this.point = point;

        this.isLogoDot = isLogoDot || false;
        this.direction = Math.random() < 0.5 ? -1 : 1;
        this.speed = this.isLogoDot ? 2 + Math.random() * 5 : 10 + Math.random() * 10;

        this.reset();
    }

    Dot.prototype.update = function () {
        var xchange = (this.target.x - this.position.x) / this.speed,
            ychange = (this.target.y - this.position.y) / this.speed;

        if (ychange <= 0.2 && xchange <= 0.2) {
            this.done = true;
        }

        this.position.x = this.position.x + xchange;
        this.position.y = this.position.y + ychange;

        if (this.isLogoDot) {
            this.opacity = Math.max(0, 0.75 - Math.abs(ychange) / 50);
        } else {
            this.opacity = Math.max(0, 0.25 + Math.abs(ychange) / 50);
        }
    }

    Dot.prototype.resize = function (point) {
        this.point = point;

        this.reset();
    }

    Dot.prototype.reset = function () {

        if (FLOCK.settings.window_dimensions) {
            this.y_dist = FLOCK.settings.window_dimensions.height / 2 + 60;
        }

        this.origin = {
            x: this.point.x + this.direction * (Math.tan(dot_settings.angle) * this.y_dist), 
            y: this.point.y + -(this.direction * this.y_dist)
        };

        if (this.isLogoDot) {
            this.target = this.point;
        } else {
            this.direction *= -1;
            this.target = {
                x: this.point.x + this.direction * (Math.tan(dot_settings.angle) * this.y_dist),
                y: this.point.y + -(this.direction * this.y_dist)
            }
        }

        this.done = false;

        this.radius = this.dot_size;
        this.fillColor = this.dot_color;
        this.position = this.origin;
        this.opacity = 1;
    }

    var Row = function (rect_y, size) {

        this.out_speed = 1 + Math.random() * 8;

        this.rect = {
            x: -size.width / 2,
            y: rect_y - (dot_settings.dot_size),
            width: (size.width / 2 * 3) - (-size.width / 2),
            height: (rect_y + (dot_settings.dot_size)) - (rect_y - (dot_settings.dot_size))
        };

        this.center = {
            x: $(window).width() / 2,
            y: rect_y
        }

        // rowgroup masks group_1, group_2, and all of the dots in a row
        this.rowgroup = {
            dots: [],
            mask: {
                x: this.rect.x,
                y: this.rect.y,
                width: this.rect.width,
                height: this.rect.height
            }
        }

        // group_1
        this.group_1 = {
            dots: [],
            mask: {
                x: this.rect.x,
                y: this.rect.y,
                width: this.rect.width,
                height: 0
            }
        }

        // group_2
        this.group_2 = {
            dots: [],
            mask: {
                x: this.rect.x,
                y: this.rect.y + this.rect.height,
                width: this.rect.width,
                height: 0
            }
        }

    }

    Row.prototype.maskIn = function () {
        var target_height = dot_settings.dot_size * 2,
            curr_height = this.rowgroup.mask.height,
            change = (target_height - curr_height),
            target_y = this.group_1.mask.y,
            change_y = this.group_2.mask.y - target_y;

        this.rowgroup.mask.height += change / 10;
        
        curr_height = this.group_1.mask.height;
        change = (target_height - curr_height);
        this.group_1.mask.height += change / 30;

        curr_height = this.group_2.mask.height;
        change = (target_height - curr_height);
        this.group_2.mask.height += change / 20;
        this.group_2.mask.y -= change_y / 30;
    }

    Row.prototype.maskOut = function () {
        var target_height = 0,
            curr_height = this.rowgroup.mask.height,
            change = (curr_height - target_height) / this.out_speed,
            target_y = this.center.y,
            change_y = this.center.y - this.rowgroup.mask.y;

        if (change < 0.01) {
            this.done = true;
            this.rowgroup.mask.height = 0;
        } else {
            this.rowgroup.mask.height -= change;
            this.rowgroup.mask.y += change_y / 15;
        }
    }

    Row.prototype.resize = function (rect_y, size) {
        this.rect = {
            x: -size.width / 2,
            y: rect_y - (dot_settings.dot_size),
            width: (size.width / 2 * 3) - (-size.width / 2),
            height: (rect_y + (dot_settings.dot_size)) - (rect_y - (dot_settings.dot_size))
        };

        this.center = {
            x: $(window).width() / 2,
            y: rect_y
        };

        this.reset();
    }

    Row.prototype.reset = function () {
        this.done = false;

        // rowgroup masks group_1, group_2, and all of the dots in a row
        this.rowgroup.mask = {
            x: this.rect.x,
            y: this.rect.y,
            width: this.rect.width,
            height: this.rect.height
        }

        // group_1
        this.group_1.mask = {
            x: this.rect.x,
            y: this.rect.y,
            width: this.rect.width,
            height: 0
        }

        // group_2
        this.group_2.mask = {
            x: this.rect.x,
            y: this.rect.y + this.rect.height,
            width: this.rect.width,
            height: 0
        }
    }

    var MaskLoader = function () {

        this.id = 'MaskLoader';

        that = this;

        this.elem = document.createElement('canvas');
        

        this.elem.id = 'MaskLoader';
        this.elem.style.position = 'fixed';
        this.elem.style.zIndex = 2;

        this.settings = {
            lastTime: 0
        }

        this.maskSettings = {
            x: this.elem.width / 2,
            y: this.elem.height / 2,
            ax: 50,
            ay: 50,
            vx: 500,
            vy: 0
        }

        $('body').append($(this.elem));
        this.elem.style.display = 'block';
        this.elem.width = $(window).width();
        this.elem.height = $(window).height();
        this.context = this.elem.getContext("2d");

        // var devicePixelRatio = window.devicePixelRatio || 1,
        //     backingStoreRatio = this.context.webkitBackingStorePixelRatio ||
        //                         this.context.mozBackingStorePixelRatio ||
        //                         this.context.msBackingStorePixelRatio ||
        //                         this.context.oBackingStorePixelRatio ||
        //                         this.context.backingStorePixelRatio || 1,
        //     ratio = devicePixelRatio / backingStoreRatio;

        // // upscale the canvas if the two ratios don't match
        // if (devicePixelRatio !== backingStoreRatio) {

        //     var oldWidth = this.elem.width;
        //     var oldHeight = this.elem.height;

        //     this.elem.width = oldWidth * ratio;
        //     this.elem.height = oldHeight * ratio;

        //     this.elem.style.width = oldWidth + 'px';
        //     this.elem.style.height = oldHeight + 'px'; 

        //     // now scale the context to counter
        //     // the fact that we've manually scaled
        //     // our canvas element
        //     this.context.scale(ratio, ratio);

        // }

        // alert(window.devicePixelRatio);

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
            line,
            extra_dot,
            startx = window_width / 2,
            starty = window_height / 2.5,
            currx = startx,
            curry = starty,
            row = 1,
            row_length = 6;

        var rect_y = starty;

        // this.logo = new Group();

        // make rows to hold dots
        for (var i = 6; i > 0; i--) {

            rows.push(
                new Row(
                    rect_y,
                    window_size
                )
            );

            // each row of dots goes from the lower left of logo to upper right
            rect_y += (dot_settings.y_distance * 2);
        };

        var picker,
            curr_point,
            window_size = {
                width: window_width,
                height: window_height
            };

        // make logo dots
        for (var i = 0; i < numpoints; i++) {
            curr_point = {
                x: currx,
                y: curry
            }

            logo_dot = new Dot(curr_point, window_size, true);
            logo_dots.push(logo_dot);
            inactive_dots.push(logo_dot);

            extra_dot = new Dot(curr_point, window_size);
            extra_dots.push(extra_dot);

            line = new Line(curr_point, window_size);
            inactive_lines.push(line);
            lines.push(line);

            picker = Math.round(Math.random() * 2);

            // console.log(picker);
            // put the dot in randomly selected masking group
            switch (picker) {
                case 0:
                    rows[row - 1].rowgroup.dots.push(logo_dot);
                    rows[row - 1].rowgroup.dots.push(extra_dot);
                    // rows[row - 1].rowgroup.addChild(logo_dot.circle);
                    // rows[row - 1].rowgroup.addChild(extra_dot.circle);
                    break;
                case 1:
                    rows[row - 1].group_1.dots.push(logo_dot);
                    rows[row - 1].group_1.dots.push(extra_dot);
                    // rows[row - 1].rowgroup.children['group_1'].addChild(logo_dot.circle);
                    // rows[row - 1].rowgroup.children['group_1'].addChild(extra_dot.circle);
                    break;
                case 2:
                    rows[row - 1].group_2.dots.push(logo_dot);
                    rows[row - 1].group_2.dots.push(extra_dot);
                    // rows[row - 1].rowgroup.children['group_2'].addChild(logo_dot.circle);
                    // rows[row - 1].rowgroup.children['group_2'].addChild(extra_dot.circle);
                    break;
                default:
                    rows[row - 1].rowgroup.dots.push(logo_dot);
                    rows[row - 1].rowgroup.dots.push(extra_dot);
                    // rows[row - 1].rowgroup.addChild(logo_dot.circle);
                    // rows[row - 1].rowgroup.addChild(extra_dot.circle);
            }

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

        lines = shuffle(lines);
        
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

        // reposition rows
        for (var i = 0; i < 6; i++) {

            rows[i].resize(rect_y, window_size);

            // each row of dots goes from the lower left of logo to upper right
            rect_y += (dot_settings.y_distance * 2);
        };

        for (var i = 0; i < numpoints; i++) {
            
            curr_point = {
                x: currx,
                y: curry
            }

            logo_dots[i].resize(curr_point);
            extra_dots[i].resize(curr_point);
            lines[i].resize(curr_point, window_size);

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

    function onFrame (e) {

        if (active_dots.length === 0) {
            return;
        }

        var done = 0;

        for (var i = active_dots.length - 1; i >= 0; i--) {
            extra_dots[i].update();
            if (active_dots[i].done) {
                done ++;
                continue;
            }
            active_dots[i].update();
        };

        for (var j = active_lines.length - 1; j >= 0; j--) {
            active_lines[j].update();
        };

        if (done === active_dots.length) {
            var rows_done = 0;
            that.finished = true;
            that.elem.className = '';
            for (var i = rows.length - 1; i >= 0; i--) {
                rows[i].maskOut();
                if (rows[i].done) {
                    rows_done ++;
                }
            };

            if (rows_done === rows.length) {
                that.isOut();
            }
        } else {
            for (var i = rows.length - 1; i >= 0; i--) {
                rows[i].maskIn();
            };
        }

        that._draw();

        // Not sure why I need to do this, it seems like cancelAnimationFrame is supposed to stop the recursion,
        // but the only way I can get the interval to stop is to check for the requestId
        if (requestId) {
            requestAnimationFrame(that._onFrame);    
        }
    }

    function draw () {
        var context = this.context,
            width = this.elem.width,
            height = this.elem.height,
            dots,
            dot_radius = dot_settings.dot_size,
            mask;

        context.clearRect(0, 0, width, height);

        for (var i = rows.length - 1; i >= 0; i--) {
            context.save();

            dots = rows[i].rowgroup.dots;
            for (var j = dots.length - 1; j >= 0; j--) {
                context.beginPath();
                context.arc(dots[j].position.x, dots[j].position.y, dot_radius, 0, Math.PI * 2, false);

                context.fillStyle = 'rgba(198,159,28,' + dots[j].opacity + ')';
                context.fill();
            };
            context.restore();

            // group_1
            context.save();
            mask = rows[i].group_1.mask;
            
            context.beginPath();

            context.save();
            context.translate( rows[i].center.x, rows[i].center.y );
            context.rotate(dot_settings.angle - (Math.PI / 2));
            context.translate( -rows[i].center.x, -rows[i].center.y );

            context.moveTo(mask.x,mask.y);
            context.lineTo(mask.x + mask.width,mask.y);
            context.lineTo(mask.x + mask.width, mask.y + mask.height);
            context.lineTo(mask.x, mask.y + mask.height);
            // context.fillStyle = 'rgba(0,255,255,.25)';
            // context.fill();
            context.restore();

            context.clip();

            dots = rows[i].group_1.dots;
            for (var j = dots.length - 1; j >= 0; j--) {
                context.beginPath();
                context.arc(dots[j].position.x, dots[j].position.y, dot_radius, 0, Math.PI * 2, false);

                context.fillStyle = 'rgba(198,159,28,' + dots[j].opacity + ')';
                context.fill();
            };
            context.restore();

            // group_1
            context.save();
            mask = rows[i].group_2.mask;
            
            context.beginPath();

            context.save();
            context.translate( rows[i].center.x, rows[i].center.y );
            context.rotate(dot_settings.angle - (Math.PI / 2));
            context.translate( -rows[i].center.x, -rows[i].center.y );

            context.moveTo(mask.x,mask.y);
            context.lineTo(mask.x + mask.width,mask.y);
            context.lineTo(mask.x + mask.width, mask.y + mask.height);
            context.lineTo(mask.x, mask.y + mask.height);
            // context.fillStyle = 'rgba(255,255,0,.25)';
            // context.fill();
            context.restore();

            context.clip();

            dots = rows[i].group_2.dots;
            for (var j = dots.length - 1; j >= 0; j--) {
                context.beginPath();
                context.arc(dots[j].position.x, dots[j].position.y, dot_radius, 0, Math.PI * 2, false);

                context.fillStyle = 'rgba(198,159,28,' + dots[j].opacity + ')';
                context.fill();
            };
            context.restore();

            context.restore();

            // gco test
            // context.globalCompositeOperation = "destination-in";
        };

        context.save();
        context.globalCompositeOperation = "destination-in";
        context.beginPath();

        for (var i = rows.length - 1; i >= 0; i--) {
            // rowgroup
            
            mask = rows[i].rowgroup.mask;

            context.save();
            context.translate( rows[i].center.x, rows[i].center.y );
            context.rotate(dot_settings.angle - (Math.PI / 2));
            context.translate( -rows[i].center.x, -rows[i].center.y );

            context.moveTo(mask.x,mask.y);
            context.lineTo(mask.x + mask.width,mask.y);
            context.lineTo(mask.x + mask.width, mask.y + mask.height);
            context.lineTo(mask.x, mask.y + mask.height);
            
            context.restore();
        };

        context.fillStyle = 'rgba(0,0,0,1)';
        context.fill();

        context.restore();

        for (var i = active_lines.length - 1; i >= 0; i--) {
            context.beginPath();
            context.moveTo(active_lines[i].line.start_point.x, active_lines[i].line.start_point.y);
            context.lineTo(active_lines[i].line.end_point.x, active_lines[i].line.end_point.y);
            context.strokeStyle = 'rgba(198,159,28,' + active_lines[i].line.opacity + ')';
            context.lineWidth = active_lines[i].line.strokeWidth;
            context.stroke();
        };
    }

    function reset () {
        while (active_dots.length > 0) {
            inactive_dots.push(active_dots.pop());
        }

        for (var i = logo_dots.length - 1; i >= 0; i--) {
            logo_dots[i].reset();
        }

        for (var i = extra_dots.length - 1; i >= 0; i--) {
            extra_dots[i].reset();
        }

        for (var i = rows.length - 1; i >= 0; i--) {
            rows[i].reset();
        };
    }

    function stop() {
        console.log('paper stop');
    }

    function complete () {
        console.log('paper complete');
    }

    function update () {
        if (inactive_dots.length > 0) {
            var points_to_add = Math.floor(this.perc * numpoints) - active_dots.length;
            while (points_to_add > 0) {
                points_to_add--;
                active_dots.push(inactive_dots.splice(Math.floor(Math.random()*(inactive_dots.length - 1)), 1)[0]);

                if (active_lines.length < numlines) {
                    active_lines.push(inactive_lines.splice(Math.floor(Math.random()*(inactive_lines.length - 1)), 1)[0]);
                }
            }
        }
    }

    function bringIn () {
        var el = this.elem;

        this.resize();
        this._reset();

        this.finished = false;
        this.perc = 0;
        this.elem.style.display = 'block';
        
        requestId = window.requestAnimationFrame(this._onFrame);

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

        // this.view.onFrame = null;
        window.cancelAnimationFrame(requestId);
        requestId = undefined;

        this.elem.style.display = 'none';
    }

    function resize () {

        this.elem.width = FLOCK.settings.window_dimensions.width;
        this.elem.height = FLOCK.settings.window_dimensions.height;

        this._positionLogo();

    }

    MaskLoader.prototype._stop = stop;
    MaskLoader.prototype._buildLogo = buildLogo;
    MaskLoader.prototype._positionLogo = positionLogo;
    MaskLoader.prototype._onFrame = onFrame;
    MaskLoader.prototype._reset = reset;
    MaskLoader.prototype._draw = draw;

    MaskLoader.prototype.resize = resize;
    MaskLoader.prototype.complete = complete;
    MaskLoader.prototype.update = update;
    MaskLoader.prototype.bringIn = bringIn;
    MaskLoader.prototype.goOut = goOut;
    MaskLoader.prototype.isOut = isOut;

    return MaskLoader;
}));