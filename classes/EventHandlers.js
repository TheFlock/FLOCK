// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'jquery',
                'FLOCK/utils/DeviceDetect',
                'FLOCK/classes/Menu',
                'greensock/TweenLite.min',
                'greensock/easing/EasePack.min',
                'greensock/plugins/CSSPlugin.min'
            ], function () {
            return (root.classes.EventHandlers = factory());
        });
    } else {
        root.classes.EventHandlers = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

    'use strict';

    var EventHandlers = function (el) {

    }

    EventHandlers.prototype.init = function(data) {
        var _window = $(window),
            _document = $(document);

        _document.on('keydown', keyHandler);
        _window.on('scroll', scrollHandler);
        window.addWheelListener(document, mousewheelHandler);

        if (Modernizr.touch) {
            _document.on('touchstart', touchStartHandler);
            _document.on('touchmove', touchMoveHandler);
            _document.on('touchend', touchEndHandler);
        } else {
            _window.on('mousemove', mousemoveHandler);
        }

        //window.onorientationchange = handleResize;
    }

    function mousemoveHandler (e) {
        if (FLOCK.sections[FLOCK.app.navigation.current_section] && FLOCK.sections[FLOCK.app.navigation.current_section].mousemoveHandler) {
            FLOCK.sections[FLOCK.app.navigation.current_section].mousemoveHandler(e);
        }
    }

    function mousewheelHandler (e) {
        if (FLOCK.sections[FLOCK.app.navigation.current_section] && FLOCK.sections[FLOCK.app.navigation.current_section].mousewheelHandler) {
            FLOCK.sections[FLOCK.app.navigation.current_section].mousewheelHandler(e);
        }
    }

    function scrollHandler (e) {
        if (FLOCK.sections[FLOCK.app.navigation.current_section] && FLOCK.sections[FLOCK.app.navigation.current_section].scrollHandler) {
            FLOCK.sections[FLOCK.app.navigation.current_section].scrollHandler(e);
        }
    }

    function keyHandler (e) {
        if (FLOCK.sections[FLOCK.app.navigation.current_section] && FLOCK.sections[FLOCK.app.navigation.current_section].keyHandler) {
            FLOCK.sections[FLOCK.app.navigation.current_section].keyHandler(e);
        }
    }

    function touchStartHandler (e) {
        if (FLOCK.sections[FLOCK.app.navigation.current_section] && FLOCK.sections[FLOCK.app.navigation.current_section].touchStartHandler) {
            FLOCK.sections[FLOCK.app.navigation.current_section].touchStartHandler(e);
        }
    }

    function touchMoveHandler (e) {
        if (FLOCK.sections[FLOCK.app.navigation.current_section] && FLOCK.sections[FLOCK.app.navigation.current_section].touchMoveHandler) {
            FLOCK.sections[FLOCK.app.navigation.current_section].touchMoveHandler(e);
        }
    }

    function touchEndHandler (e) {
        if (FLOCK.sections[FLOCK.app.navigation.current_section] && FLOCK.sections[FLOCK.app.navigation.current_section].touchEndHandler) {
            FLOCK.sections[FLOCK.app.navigation.current_section].touchEndHandler(e);
        }
    }

    return new EventHandlers();
}));
