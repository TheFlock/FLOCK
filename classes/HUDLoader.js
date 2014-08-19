// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.app = root.app || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
            return (root.app.HUDLoader = factory());
        });
    } else {
        root.app.HUDLoader = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

    var myName = "HUDLoader",
        requestId,
        HUD,
        that,
        bars;

    var HUDLoader = function () {
        this.id = 'HUDLoader';
        // console.log('hey there ' + myName);

        bars = initialLoader.bars;
        this.elem = document.getElementById("initialLoader");
    }

    function bringIn(callback){
        TweenLite.to(this.elem, 0.5, {autoAlpha: 1, onComplete: callback});
    }

    function updateBar(perc){
        var dest = Math.round(perc*200);
        for(var i=0; i<dest; i++){
            var currBar = bars[i];
            if(currBar.className.indexOf('on')<0){
                currBar.className = "bar on";
            }
        }
    }

    function goOut(callback){
        TweenLite.to(this.elem, 0.5, {autoAlpha: 0, onComplete: function(){            
            for(var i=0; i<200; i++){
                var currBar = bars[i];
                currBar.className = "bar";
            }
            callback();
        }});
    }


    HUDLoader.prototype.bringIn = bringIn;
    HUDLoader.prototype.updateBar = updateBar;
    HUDLoader.prototype.goOut = goOut;

    return HUDLoader;
}));