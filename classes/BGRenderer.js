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
            return (root.classes.BGRenderer = factory());
        });
    } else {
        root.classes.BGRenderer = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

    'use strict';

    var BGRenderer = function (containerId) {
        this.container = containerId;
        this.initialized = false;
        this.outer1 = this.outer2 = this.inner1 = this.inner2 = null;
        this.image1 = this.image2 = null;
        this.nextContainer = 0;
        this.verbose = false;
        this.width = 0;
        this.height = 0;
    }

    function init(){
        if(this.verbose)console.log('BGRenderer | init');
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

        // call resize via shell
        FLOCK.app.Shell.resize();
    }

    function addStyles(elem){
        elem.style.position = 'absolute';
        elem.style.top = elem.style.left = '0px';
        elem.style.width = elem.style.height = '100%';
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
            if (this.image1) {
                this.image1.style.position = 'absolute';
                this.inner1.appendChild(this.image1);
            }
        } else {
            newContainer = this.outer2;
            newContainerInner = this.inner2;
            oldContainer = this.outer1;
            oldContainerInner = this.inner1;
            this.image2 = imageObj.img;
            this.image2Obj = imageObj;
            if (this.image2) {
                this.image2.style.position = 'absolute';
                this.inner2.appendChild(this.image2);
            }
        }

        this.resize();

        var that = this;
        var tl = new TimelineLite({onComplete:function(){
            that.changeComplete(callbackFn);
        }.bind(this)});
        tl.pause();

        var t = (instant) ? 0 : (8 / 3);

        // set initial position and scale out new container
        tl.to(newContainer, 0, { x: this.width + 'px' });

        // animate positions
        tl.to(oldContainer, t*3.5/8, { x: -this.width + 'px', ease: Expo.easeInOut}, 0);
        tl.to(newContainer, t*3.5/8, { x: 0 + 'px', ease: Expo.easeInOut}, 0);

        tl.play();

        // this.changeComplete(callbackFn);
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

        var img1width = this.image1 ? this.image1.width : 0,
            img1height = this.image1 ? this.image1.height : 0,
            img2width = this.image2 ? this.image2.width : 0,
            img2height = this.image2 ? this.image2.height : 0;

        var img1Dimensions = {
                w: img1width, 
                h: img1height
            },
            bg1Ratio = Math.max(w/img1Dimensions.w, h/img1Dimensions.h),
            bg1AdjustedWidth = (img1Dimensions.w*bg1Ratio),
            bg1AdjustedHeight = (img1Dimensions.h*bg1Ratio),

            img2Dimensions = {
                w: img2width, 
                h: img2height
            },
            bg2Ratio = Math.max(w/img2Dimensions.w, h/img2Dimensions.h),
            bg2AdjustedWidth = (img2Dimensions.w*bg2Ratio),
            bg2AdjustedHeight = (img2Dimensions.h*bg2Ratio),

            paddingW = 0,
            paddingH = 0,

            bgOffsetLeftMin = -paddingW/2,
            bg1OffsetLeftMax = ((w-bg1AdjustedWidth)+(paddingW/2))-bgOffsetLeftMin,
            bg2OffsetLeftMax = ((w-bg2AdjustedWidth)+(paddingW/2))-bgOffsetLeftMin,

            bgOffsetTopMin = -paddingH/2,
            bg1OffsetTopMax = ((h-bg1AdjustedHeight)+(paddingH/2))-bgOffsetTopMin,
            bg2OffsetTopMax = ((h-bg2AdjustedHeight)+(paddingH/2))-bgOffsetTopMin;

        if(this.image1){
            this.image1.style.top = (bgOffsetTopMin+(bg1OffsetTopMax*this.image1Obj.v))+'px';
            this.image1.style.left = (bgOffsetLeftMin+(bg1OffsetLeftMax*this.image1Obj.h))+'px';
            this.image1.style.width = bg1AdjustedWidth+'px';
            this.image1.style.height = bg1AdjustedHeight+'px';
        }
        if(this.image2){
            this.image2.style.top = (bgOffsetTopMin+(bg2OffsetTopMax*this.image2Obj.v))+'px';
            this.image2.style.left = (bgOffsetLeftMin+(bg2OffsetLeftMax*this.image2Obj.h))+'px';
            this.image2.style.width = bg2AdjustedWidth+'px';
            this.image2.style.height = bg2AdjustedHeight+'px';
        }
    }

    BGRenderer.prototype.init = init;
    BGRenderer.prototype.changeBg = changeBg;
    BGRenderer.prototype.changeComplete = changeComplete;
    BGRenderer.prototype.clear = clear;
    BGRenderer.prototype.resize = resize;

    return BGRenderer;
}));
