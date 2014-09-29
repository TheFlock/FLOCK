// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (root.classes.Section = factory());
        });
    } else {
        
        root.classes.Section = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

        var myName,
            that,
            data;

        function Section() {
            console.log('hey there ' + myName);
            this.initialized = false;
        }

        function init (callback) {
            // console.log('init ' + myName);
            // that = this;

            // data = FLOCK.app.dataSrc.sections.Section.data;

            // this.elements = {
            //     sectionWrapper: document.getElementById(myName.toLowerCase())
            // }

            // if (callback) {
            //     callback();
            // }
        }

        function enter (direction, callback) {
            this.elements.sectionWrapper.style.display = 'block';
            this.resize(FLOCK.settings.window_dimensions.width, FLOCK.settings.window_dimensions.height);
            if (callback) {
                callback({
                    section_wrapper: this.elements.sectionWrapper
                });
            }
        }

        function isIn () {
        }

        function exit (direction, callback) {
            var that = this;
            if (callback) {
                callback({
                    section_wrapper: this.elements.sectionWrapper
                }, function () {
                    that.elements.sectionWrapper.style.display = 'none';
                });
            }
        }

        function resize (w, h) {
            if (this.backplate) {
                this.backplate.resize(w, h);
            }
        }

        function keyHandler (e) {
        }

        function touchStart (e) {
        }

        function touchEnd (e) {
        }

        function touchMove (e) {
        }

        function mousewheelHandler (e) {
        }

        Section.prototype._isIn = isIn;

        Section.prototype.init = init;
        Section.prototype.enter = enter;
        Section.prototype.exit = exit;
        Section.prototype.resize = resize;
        Section.prototype.keyHandler = keyHandler;

        Section.prototype.touchStartHandler = touchStart;
        Section.prototype.touchEndHandler = touchEnd;
        Section.prototype.touchMoveHandler = touchMove;
        Section.prototype.mousewheelHandler = mousewheelHandler;

        return Section;
}));