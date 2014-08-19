// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.app = root.app || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'jquery',
            'gs/TweenLite.min',
            'gs/TimelineLite.min',
            'gs/easing/EasePack.min',
            'gs/plugins/CSSPlugin.min',            
            'FLOCK/utils/ArrayExecuter'
                ], function ($) {
            return (root.app.HUD_simple = factory($));
        });
    } else {
        root.app.HUD_simple = factory($);
    }
}(window.FLOCK = window.FLOCK || {}, function ($) {

    var myName = "HUD",
        container,
        filesToLoad = [],
        tempImage,
        arrayExecuter = FLOCK.utils.ArrayExecuter,
        files = {
            'tempImage': 'img/HUD/HUD_temp.png'
        },
        currSetting = "off",
        sectionSettings;

    function HUD_simple() {

        for(var _file in files)
            filesToLoad.push(files[_file]);

        // console.log('hey there ' + myName);
    }

    function setSectionSettings(settings){
        sectionSettings = settings;
    }

    function init(){
        container = document.getElementById("HUD");
        container.style.visibility = "hidden";
        this.init = true;

        tempImage = new Image();
        tempImage.src = files['tempImage'];
        tempImage.className = "tempImage";
        container.appendChild(tempImage);

        resize(FLOCK.settings.window_dimensions.width, FLOCK.settings.window_dimensions.height);
    }

    function updateSetting(sectionID){
        var destSetting = (sectionSettings[sectionID] !== undefined)?sectionSettings[sectionID]:sectionSettings['default'];
        if(destSetting !== currSetting){
            currSetting = destSetting;
            switch(currSetting){
                case "hidden":
                    TweenLite.to(container, 0.5, {autoAlpha: 0});
                    break;
                case "normal":
                    TweenLite.to(container, 0.5, {autoAlpha: 1});
                    break;
            }
        }

        arrayExecuter.stepComplete_instant();
    }

    function resize (w, h) {
        //this.backplate.resize(w, h);
        console.log('resizing ' + myName);

        var hAlign = 0.5;
        // switch(backgroundImages[currBG].hAlign){
        //     case 'left':
        //         hAlign = 0;
        //         break;
        //     case 'right':       
        //         hAlign = 1;
        //         break;
        //     case 'center':
        //     default:    
        //         hAlign = 0.5;       
        //         break;      
        // }
            
        var vAlign = 0.5;
        // switch(backgroundImages[currBG].vAlign){
        //     case 'top':
        //         vAlign = 0;
        //         break;
        //     case 'bottom':      
        //         vAlign = 1;
        //         break;
        //     case 'center':
        //     default:    
        //         vAlign = 0.5;       
        //         break;
        // }

        var imgWidth = 1600;
        var imgHeight = 970;


        var imgAvailableHeight = h;   
        
        var imgRatio_h = w/imgWidth;
        var imgRatio_v = imgAvailableHeight/imgHeight;
        var imgRatio = 0;   
        
        imgRatio = Math.max(imgRatio_h, imgRatio_v); 
        // switch(backgroundImages[currBG].resizeType){
        //     case 'width':
        //         imgRatio = imgRatio_h;  
        //         break;
        //     case 'height':  
        //         imgRatio = imgRatio_v;  
        //         break;
        //     case 'contain':     
        //         imgRatio = Math.min(imgRatio_h, imgRatio_v);    
        //         break;
        //     case 'cover':
        //     default:    
        //         imgRatio = Math.max(imgRatio_h, imgRatio_v);        
        //         break;
        // };

        var imgAdjustedWidth = imgWidth*imgRatio;
        var imgAdjustedHeight = imgHeight*imgRatio;
        var imgOffsetLeft = (w-imgAdjustedWidth)*hAlign;
        var imgOffsetTop = (imgAvailableHeight-imgAdjustedHeight)*vAlign;
            
        tempImage.style.width = imgAdjustedWidth+'px';
        tempImage.style.height = imgAdjustedHeight+'px';
        tempImage.style.top = imgOffsetTop+'px';
        tempImage.style.left = imgOffsetLeft+'px';
    }

    HUD_simple.prototype.init = init;
    HUD_simple.prototype.resize = resize;
    HUD_simple.prototype.setSectionSettings = setSectionSettings;
    HUD_simple.prototype.updateSetting = updateSetting;

    HUD_simple.prototype.filesToLoad = filesToLoad;

    return HUD_simple;

}));