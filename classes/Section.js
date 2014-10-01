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
            this.verbose = true;
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

        function isIn () {
        }

        function resize (w, h) {
            if (this.backplate) {
                this.backplate.resize();
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
        Section.prototype.resize = resize;
        Section.prototype.keyHandler = keyHandler;

        Section.prototype.touchStartHandler = touchStart;
        Section.prototype.touchEndHandler = touchEnd;
        Section.prototype.touchMoveHandler = touchMove;
        Section.prototype.mousewheelHandler = mousewheelHandler;

        return Section;
}));
