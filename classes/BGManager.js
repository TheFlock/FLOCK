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
            return (root.classes.BGManager = factory());
        });
    } else {
        root.classes.BGManager = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

    'use strict';

    var BGManager = function (renderer, data) {
        console.log("BGManager | "+data);
        this.initialized = false;
        this.verbose = false;
        this.renderer = renderer;

        this.sections = data.sections;
        this.images = data.images;

    }

    function init(){
        if(this.verbose)console.log("BGManager | init");
        this.initialized = true;
        this.currBgObj = null;

        var sectionsLength = this.sections.length;

        // randomize the imgIDs array of each section
        while(sectionsLength--){
            var sectionObj = this.sections[sectionsLength];
            // if(sectionObj.imgIDs)sectionObj.imgIDs = randomizeArray(sectionObj.imgIDs);
        }

        // create sectionLoader entries for each image
        for (var imageName in this.images){
            this.images[imageName].img = null;
            FLOCK.utils.SectionLoader.addSection('background_'+imageName, {
                files: {
                    images: [this.images[imageName].url]
                }
            });

        }

    }

    function returnSectionObj(id){
        if(this.verbose)console.log("BGManager | returnSectionObj: "+id);
        var sectionObj = null,
            numSections = this.sections.length;

        while(numSections--){
            if(this.sections[numSections].id == id){
                sectionObj = this.sections[numSections];
                break;
            }
        }

        return sectionObj;
    }

    function deprioritize(imgID){
        if(this.verbose)console.log("BGManager | deprioritize: "+imgID);
        var sectionsLength = this.sections.length,
            numIDs;

        // if image exists in any sections... move it to the end of their queue
        while(sectionsLength--){
            numIDs = (this.sections[sectionsLength].imgIDs) ? this.sections[sectionsLength].imgIDs.length : 0;
            while(numIDs--){
                if(this.sections[sectionsLength].imgIDs[numIDs] == imgID){
                    this.sections[sectionsLength].imgIDs.push(this.sections[sectionsLength].imgIDs.splice(numIDs,1)[0]);
                }
            }
        }
    }

    function getBg(sectionId, sectionLoaderId, keepPriority){
        if(this.verbose)console.log("BGManager | getBg: "+sectionId);
        if(!this.initialized)this.init();

        var sectionObj = this.returnSectionObj(sectionId),
            imgID;

        // check that section exists and has images
        if(!sectionObj || !sectionObj.imgIDs || sectionObj.imgIDs.length <= 0)return false;

        imgID = sectionObj.imgIDs[0];

        if(!keepPriority)this.deprioritize(imgID);

        //return id of sectionLoader obj to load
        return (sectionLoaderId) ? 'background_'+imgID : imgID;
    }

    function changeBg(sectionId, instant, callbackFn){
        var bgId = this.getBg(sectionId, false, false),
            imgObj = this.images[bgId],
            loadCatch = false;
        
        if(bgId === false){
            imgObj = {
                img: false
            }
        }

        if(imgObj == this.currBgObj){
            if(callbackFn)callbackFn();
            return;
        }
        this.currBgObj = imgObj;

        if(imgObj.img === false || (imgObj.img && imgObj.loaded)){
            this.renderer.changeBg(imgObj, instant, callbackFn);
        } else {
            imgObj.img = new Image();
            imgObj.img.alt = "Background";
            $(imgObj.img).bind('load readystatechange', function(){
                if(loadCatch)return;
                loadCatch = true;
                imgObj.loaded = true;
                if(this.verbose)console.log("BGManager | image loaded: "+imgObj.url);
                this.renderer.changeBg(imgObj, instant, callbackFn);
            }.bind(this));
            imgObj.img.src = imgObj.url;
        }
    }

    function preloadNextBg(sectionId, callbackFn){
        var bgId = this.getBg(sectionId, false, true);
        if(!bgId)return;
        var imgObj = this.images[bgId];

        if(!imgObj.img) {
            imgObj.img = new Image();
            imgObj.img.alt = "Background";

            $(imgObj.img).bind('load readystatechange', function(){
                imgObj.loaded = true;
                if(callbackFn)callbackFn();
            }.bind(this));
            imgObj.img.src = imgObj.url;
        }
    }

    function clear(){
        this.renderer.clear();
    }

    function randomizeArray(arr){
        var newArr = [],
            arrLength = arr.length;

        while(arrLength--){
            var aIndex = Math.floor(Math.random()*arr.length);
            var aItem = arr.splice(aIndex,1)[0];

            newArr.unshift(aItem);
        }

        return newArr;
    }


    // override base class functions
    BGManager.prototype.init = init;
    BGManager.prototype.returnSectionObj = returnSectionObj;
    BGManager.prototype.deprioritize = deprioritize;
    BGManager.prototype.getBg = getBg;
    BGManager.prototype.preloadNextBg = preloadNextBg;
    BGManager.prototype.clear = clear;
    BGManager.prototype.changeBg = changeBg;

    return BGManager;
}));
