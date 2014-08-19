// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.utils = root.utils || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'jquery', 
                'gs/TweenLite.min', 
                'FLOCK/utils/ArrayExecuter', 
                'FLOCK/utils/SectionLoader'
            ], function ($) {
            return (root.utils.Preloader = factory($));
        });
    } else {
        root.utils.Preloader = factory($);
    }
}(window.FLOCK = window.FLOCK || {}, function ($) {

    var arrayExecuter = FLOCK.utils.ArrayExecuter,
        sectionLoader = FLOCK.utils.SectionLoader,
        curr_loaderID = false, // current preloader
        loaderUIObjects = {}, // object to store preloaders by id
        perc = 0,
        tracker;

    var preloader = function() {
        sectionLoader.addLoaderUI(this);
        this.finished = true;
    }

    function switchLoader(loader_id) {
        if(loaderUIObjects[loader_id]){
            curr_loaderID = loader_id;
        } else {
            console.log("preloader.js : switchLoader : no loader found with ID: "+loader_id);
        }
    }
            
    function addLoader(loader_obj) {

        loaderUIObjects[loader_obj.id] = loader_obj;

        // if there is not already a UI attached, it will automatically be set to the current UI
        if(!curr_loaderID)curr_loaderID = loader_obj.id;

        arrayExecuter.stepComplete();
    }
            
    function bringIn() {
        console.log('preloader bringIn');

        if(!curr_loaderID)return;

        this.finished = false;
        perc = 0;

        //
        if(curr_loaderID && loaderUIObjects[curr_loaderID].bringIn !== undefined){
            //custom bringIn
            loaderUIObjects[curr_loaderID].bringIn(isIn.bind(this));
        } else {
            if(curr_loaderID && loaderUIObjects[curr_loaderID].elem !== undefined){
                //default bringIn
                TweenLite.to(loaderUIObjects[curr_loaderID].elem, 0.5, {autoAlpha: 1, onComplete: isIn.bind(this)});
                track.apply(this);
            } else {
                isIn();
            }
        }

    }

    function isIn(){
        console.log('preloader isIn');

        startTracking.apply(this);
    }
           
    function startTracking(e) {
        tracker = track.bind(this);
        TweenLite.ticker.addEventListener("tick", tracker);
    }
            
    function track(e) {
        var newPerc = sectionLoader.getPerc();
        if(!newPerc)newPerc = 1;

        //ease it
        newPerc = perc+(Math.ceil((newPerc-perc)/.2)/100);

        perc = Math.max(perc, newPerc);

        if(curr_loaderID && loaderUIObjects[curr_loaderID].onProgress !== undefined){
            //custom onProgress
            var animComplete = loaderUIObjects[curr_loaderID].onProgress(perc);

            if(perc >= 1 && this.finished && animComplete === true){
                TweenLite.ticker.removeEventListener("tick", tracker);
                goOut();
            }
        } else {

            if(curr_loaderID && loaderUIObjects[curr_loaderID].updateBar !== undefined){
                //custom progressBar update
                loaderUIObjects[curr_loaderID].updateBar(perc);
            } else if (curr_loaderID && loaderUIObjects[curr_loaderID].progressBar !== undefined){
                //default progressBar update
                loaderUIObjects[curr_loaderID].progressBar.style.width = (perc*100)+'%';
            }

            if(curr_loaderID && loaderUIObjects[curr_loaderID].updateLabel !== undefined){
                //custom label fill                
                loaderUIObjects[curr_loaderID].updateText(perc);
            } else if (curr_loaderID && loaderUIObjects[curr_loaderID].loaderText !== undefined){
                //default label fill                
                var labelString = "";
                if(curr_loaderID && loaderUIObjects[curr_loaderID].loaderText_before !== undefined)
                    labelString += loaderUIObjects[curr_loaderID].loaderText_before;

                labelString += Math.round(perc*100);

                if(curr_loaderID && loaderUIObjects[curr_loaderID].loaderText_after !== undefined)
                    labelString += loaderUIObjects[curr_loaderID].loaderText_after;

                loaderUIObjects[curr_loaderID].loaderText.innerHTML = labelString;
            }

            if(perc >= 1 && this.finished){
                TweenLite.ticker.removeEventListener("tick", tracker);
                goOut();
            }
        }
    }
            
    function goOut() {
        console.log('preloader goOut');
        if(curr_loaderID && loaderUIObjects[curr_loaderID].goOut !== undefined){
            //custom goOut
            loaderUIObjects[curr_loaderID].goOut(isOut.bind(this));
        } else {
            if(curr_loaderID && loaderUIObjects[curr_loaderID].elem !== undefined){
                //default goOut
                TweenLite.to(loaderUIObjects[curr_loaderID].elem, 0.5, {autoAlpha: 0, onComplete: isOut.bind(this)});
            } else {
                isOut();
            }
        }
    }
            
    function isOut(e){
        console.log('Preloader isOut');
                
        arrayExecuter.stepComplete();
    }
            
    function complete(e) {
        // console.log('preloader complete');
        // TweenLite.ticker.removeEventListener("tick", this.track);

        if(!curr_loaderID)isOut();

        this.finished = true;
    }

    preloader.prototype.switchLoader = switchLoader;
    preloader.prototype.addLoader = addLoader;

    preloader.prototype.bringIn = bringIn;
    preloader.prototype.complete = complete;

    return new preloader();

}));