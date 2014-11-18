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
                'greensock/TweenLite.min',
                'greensock/easing/EasePack.min',
                'greensock/plugins/CSSPlugin.min'
            ], function () {
            return (root.classes.BGRenderer_Html = factory());
        });
    } else {
        root.classes.BGRenderer_Html = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

    'use strict';

    var BGRenderer_Html = function (containerId) {
        this.container = containerId;
        this.initialized = false;
        this.outer1 = this.outer2 = this.inner1 = this.inner2 = null;
        this.image1 = this.image2 = null;
        this.nextContainer = 0;
        this.verbose = false;
        this.width = 0;
        this.height = 0;
        this.zoomAmount = 0.15;
    }

    function init(){
        if(this.verbose)console.log('BGRenderer_Html | init');
        this.initialized = true;
        this.container = document.getElementById(this.container);

        // create two bg containers
        this.outer1 = addStyles(document.createElement('div'));
        this.inner1 = addStyles(document.createElement('div'));
        this.outer1.appendChild(this.inner1);
        this.container.appendChild(this.outer1);

        this.outer2 = addStyles(document.createElement('div'));
        this.inner2 = addStyles(document.createElement('div'));
        this.outer2.appendChild(this.inner2);
        this.container.appendChild(this.outer2);

        this.outer1.style.overflow = this.outer2.style.overflow = "hidden";

        this.darken = addStyles(document.createElement('div'));
        this.darken.style.background = "#000000";
        this.darken.style.opacity = 0;
        this.container.appendChild(this.darken);
        // call resize via shell
        FLOCK.app.Shell.resize();
    }

    function addStyles(elem){
        elem.style.position = 'absolute';
        elem.style.top = elem.style.left = '0px';
        elem.style.width = elem.style.height = '100%';
        // elem.style.overflow = 'hidden';
        return elem;
    }

    function changeBg(imageObj, instant, callbackFn){
        if(!this.initialized)this.init();

        // add new image
        var newContainer, oldContainer;
        var newContainerInner, oldContainerInner;
        if(this.nextContainer == 0){
            newContainer = this.outer1;
            newContainerInner = this.inner1;
            oldContainer = this.outer2;
            oldContainerInner = this.inner2;
            this.image1 = imageObj.img;
            this.image1Obj = imageObj;
            this.image1.style.position = 'absolute';
            this.inner1.appendChild(this.image1);
        } else {
            newContainer = this.outer2;
            newContainerInner = this.inner2;
            oldContainer = this.outer1;
            oldContainerInner = this.inner1;
            this.image2 = imageObj.img;
            this.image2Obj = imageObj;
            this.image2.style.position = 'absolute';
            this.inner2.appendChild(this.image2);
        }

        this.resize();

        var tl = new TimelineLite({onComplete:function(){
            // this.changeComplete(callbackFn);
        }.bind(this)});
        tl.pause();

        var t = (instant)?0:(8/3);

        // set initial position and scale out new container
        tl.to(newContainer, 0, {y: this.height+'px'});
        tl.to(newContainerInner, 0, {scaleX:1/(1+this.zoomAmount), scaleY:1/(1+this.zoomAmount)});

        // scale out old
        tl.to(oldContainerInner, t*3/8, {force3D: true, scaleX:1/(1+this.zoomAmount), scaleY:1/(1+this.zoomAmount), ease: Quart.easeOut});
        tl.to(this.darken, t*3/8, {opacity:0.4, ease: Quart.easeOut}, 0);

        // animate positions
        tl.to(oldContainer, t*3.5/8, {y: -this.height+'px', ease: Expo.easeInOut}, t*2/8);
        tl.to(newContainer, t*3.5/8, {y: 0+'px', ease: Expo.easeInOut}, t*2/8);

        // call finish early
        tl.to(oldContainer, 0, {y: -this.height+'px', onComplete:function(){
            this.changeComplete(callbackFn);
        }.bind(this)}, t*6.5/8);

        // scale in new
        tl.to(newContainerInner, t*3.5/8, {force3D: true, scaleX:0.98, scaleY:0.98, ease: Quart.easeOut}, t*4.5/8);
        tl.to(this.darken, t*3.5/8, {opacity:0, ease: Quart.easeOut}, t*4.5/8);

        tl.play();

        // this.changeComplete(callbackFn);
    }

    function zoomOut(){
        var currContainer, currContainerInner;
        if(this.nextContainer == 0){
            currContainer = this.outer2;
            currContainerInner = this.inner2;
        } else {
            currContainer = this.outer1;
            currContainerInner = this.inner1;
        }

        // scale out old
        TweenLite.to(currContainerInner, 1, {force3D: true, scaleX:1/(1+this.zoomAmount), scaleY:1/(1+this.zoomAmount), ease: Quart.easeOut});
    }

    function zoomIn(){
        var currContainer, currContainerInner;
        if(this.nextContainer == 0){
            currContainer = this.outer2;
            currContainerInner = this.inner2;
        } else {
            currContainer = this.outer1;
            currContainerInner = this.inner1;
        }

        // scale out old
        TweenLite.to(currContainerInner, 1, {force3D: true, scaleX:0.98, scaleY:0.98, ease: Quart.easeOut});
    }

    function changeComplete(callbackFn){
        // remove old image
        if(this.nextContainer == 0){
            this.inner2.innerHTML = "";
            this.image2 = null;
            this.image2Obj = null;
        } else {
            this.inner1.innerHTML = "";
            this.image1 = null;
            this.image1Obj = null;
        }

        // update nextContainer value
        this.nextContainer = (this.nextContainer+1)%2;

        if(callbackFn)callbackFn();
    }

    function clear(){
        this.inner1.innerHTML = "";
        this.image1 = null;
        this.image1Obj = null;
        this.inner2.innerHTML = "";
        this.image2 = null;
        this.image2Obj = null;
    }

    function resize(w, h){

        if(!this.inner1)return;
        if(!w)w = FLOCK.settings.sectionWidth;
        if(!h)h = FLOCK.settings.window_dimensions.height;
        this.width = w;
        this.height = h;

        var imgDimensions = {w: 1544, h: 1200},
            bgRatio = Math.max(w/imgDimensions.w, h/imgDimensions.h),
            bgAdjustedWidth = (imgDimensions.w*bgRatio)*(1+this.zoomAmount),
            bgAdjustedHeight = (imgDimensions.h*bgRatio)*(1+this.zoomAmount),
            paddingW = w*(this.zoomAmount),
            paddingH = h*(this.zoomAmount),
            bgOffsetLeftMin = -paddingW/2,
            bgOffsetLeftMax = ((w-bgAdjustedWidth)+(paddingW/2))-bgOffsetLeftMin,
            bgOffsetTopMin = -paddingH/2,
            bgOffsetTopMax = ((h-bgAdjustedHeight)+(paddingH/2))-bgOffsetTopMin;

        if(this.image1Obj){
            this.image1.style.top = (bgOffsetTopMin+(bgOffsetTopMax*this.image1Obj.v))+'px';
            this.image1.style.left = (bgOffsetLeftMin+(bgOffsetLeftMax*this.image1Obj.h))+'px';
            this.image1.style.width = bgAdjustedWidth+'px';
            this.image1.style.height = bgAdjustedHeight+'px';
        }
        if(this.image2Obj){
            this.image2.style.top = (bgOffsetTopMin+(bgOffsetTopMax*this.image2Obj.v))+'px';
            this.image2.style.left = (bgOffsetLeftMin+(bgOffsetLeftMax*this.image2Obj.h))+'px';
            this.image2.style.width = bgAdjustedWidth+'px';
            this.image2.style.height = bgAdjustedHeight+'px';
        }
    }

    // override base class functions
    BGRenderer_Html.prototype.init = init;
    BGRenderer_Html.prototype.changeBg = changeBg;
    BGRenderer_Html.prototype.zoomOut = zoomOut;
    BGRenderer_Html.prototype.zoomIn = zoomIn;
    BGRenderer_Html.prototype.changeComplete = changeComplete;
    BGRenderer_Html.prototype.clear = clear;
    BGRenderer_Html.prototype.resize = resize;

    return BGRenderer_Html;
}));
