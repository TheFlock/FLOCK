;(function (root, factory) {
    // Browser globals
    root.utils = root.utils || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'FLOCK/utils/DeviceDetect', 'FLOCK/utils/ArrayExecuter'], function ($) {
            // Add to namespace
            return (root.utils.SectionLoader = factory($));
        });
    } else {
        root.utils.SectionLoader = factory($);
    }
}(window.FLOCK = window.FLOCK || {}, function ($) {

    var arrayExecuter = new FLOCK.utils.ArrayExecuter(),
        DeviceDetect = FLOCK.utils.DeviceDetect,
        base_url = '';

    if (FLOCK.settings) {
        base_url = FLOCK.settings.base_url || '';
    }

    /*
    --------------------------------------------------------------------------------------------------------------------
    Section Loader
    --------------------------------------------------------------------------------------------------------------------
    */

    var sectionLoaderState = {sections:[], currentlyLoadingIDs:[], templatesToLoad: [], imagesToLoad:[], imagesLoaded:0, videosToLoad:[], videosLoaded:0, videosLoading:[], videoLoadingStatus:false, miscToLoad:[], miscLoaded:0, loader:null},
        isMobile = DeviceDetect.isMobile;

    function addLoaderUI (loaderObj) {
        // trace('sectionLoader_addLoaderUI: '+loaderObj);
        sectionLoaderState.loader = loaderObj;
    }

    function addFiles (section_id, files) {
        var sectionOBJ = returnSectionOBJ(section_id);
        sectionOBJ.files = sectionOBJ.files || {};
        // sectionOBJ.addFiles = typeof files === 'String' ? sectionOBJ.addFiles.push(files) : files;
        if (typeof files === 'String') {
            sectionOBJ.addFiles.push(files);
        } else {
            for (var i = files.length - 1; i >= 0; i--) {
                sectionOBJ.addFiles.push(files[i]);
            };
        }
    }

    function addSection (id, data) {
        // console.log('addSection: '+id);
        //Check to be sure a section has not already been added with the same name
        var numSections = sectionLoaderState.sections.length,
            files = data.files || {},
            templatePath = files.templatePath || false,
            partials = files.partials || {},
            images = files.images || false,
            htmlPath = files.htmlPath || false,
            cssPath = files.cssPath || false,
            jsPath = files.jsPath || false,
            addFiles = files.addFiles || [];

        while (numSections--) {
            if(sectionLoaderState.sections[numSections].id === id){
                // trace('sectionLoader_addSection: section id already exists');
                return;
            }
        }

        sectionLoaderState.sections.push({id: id, images: images, data:data.data, templatePath: templatePath, partials:partials ,htmlPath: htmlPath, htmlData: null, cssPath: cssPath, cssData: null, jsPath: jsPath, jsAttached: true, jsData: null, addFiles:addFiles, loaded: false});
        if (id === 'work') {
            // console.log(sectionLoaderState.sections);
        }
    }

    function loadSection () {
        //Load section content by passing in the ID of the section, or an array of IDs

        var function_arr =  [],
            args = Array.prototype.slice.call(arguments),
            callback;

        if (args.length === 1 && args[0] === 'all') {
            args = [];
            for (var i = sectionLoaderState.sections.length - 1; i >= 0; i--) {
                args.push(sectionLoaderState.sections[i].id);
            };
        }

        if(args !== undefined && args !== null){
            for (var i = args.length - 1; i >= 0; i--) {
                if (typeof args[i] === 'function') {
                    callback = args[i];
                } else {
                    function_arr.push({scope: this, fn: this.initScrape, vars: args[i]});
                }
            };
        } else {
            // trace('this.loadSection: input not valid');
        }

        function_arr.push({scope: this, fn: this.loadFiles, vars: null});

        if (callback) {
            function_arr.push({fn: callback, vars: null});
        }

        arrayExecuter.execute(function_arr);
    }

    function initScrape () {
        
        var args = Array.prototype.slice.call(arguments),
            id = args.pop(),
            numAddFiles,
            numImages,
            sectionOBJ = this.returnSectionOBJ(id);
                        
        //confirm sectionOBJ was found
        if(sectionOBJ === undefined){
            // trace('this.loadSection: section id '+id+' not found');
            arrayExecuter.stepComplete_instant();
            return;
        }

        //check is section is already loaded
        if(sectionOBJ.loaded === true){
            // trace('this.loadSection: '+id+' is already loaded');
            arrayExecuter.stepComplete_instant();
            return;
        }

        sectionLoaderState.currentlyLoadingIDs.push(sectionOBJ.id);

        // add any templates
        for( var partial in sectionOBJ.partials ) {
            if (sectionOBJ.partials.hasOwnProperty(partial)) {
                sectionLoaderState.templatesToLoad.push({template_name: partial, template_path: sectionOBJ.partials[partial]})
            }
        }

        //add any addFiles that may have been passed
        numAddFiles = sectionOBJ.addFiles.length;

        while (numAddFiles--){
            if(!this.isDuplicate(sectionOBJ.addFiles[numAddFiles])){
                var fileURL = sectionOBJ.addFiles[numAddFiles];

                if(fileURL.indexOf('.gif') > 0 || fileURL.indexOf('.jpg') > 0 || fileURL.indexOf('.jpeg') > 0 || fileURL.indexOf('.png') > 0){
                    sectionLoaderState.imagesToLoad.push(fileURL);
                } else if (fileURL.indexOf('.mp4')>0 || fileURL.indexOf('.webm')>0 || fileURL.indexOf('.ogg')>0){
                    sectionLoaderState.videosToLoad.push(fileURL);
                } else {
                    // console.log('ajax load: '+fileURL);
                    sectionLoaderState.miscToLoad.push(fileURL);         
                }
            }
        }

        //add any iamges from the json
        numImages = sectionOBJ.images.length;
        
        while (numImages--){
            if(!this.isDuplicate(sectionOBJ.images[numImages])){
                var fileURL = sectionOBJ.images[numImages];

                if(fileURL.indexOf('.gif') > 0 || fileURL.indexOf('.jpg') > 0 || fileURL.indexOf('.jpeg') > 0 || fileURL.indexOf('.png') > 0){
                    sectionLoaderState.imagesToLoad.push(fileURL);
                } else if (fileURL.indexOf('.mp4')>0 || fileURL.indexOf('.webm')>0 || fileURL.indexOf('.ogg')>0){
                    sectionLoaderState.videosToLoad.push(fileURL);
                } else {
                    // trace('not a supported fileType: '+fileURL);
                }
            }
        }

        var function_arr =  [];
        
        if (sectionOBJ.htmlPath) {
            function_arr.push({scope: this, fn: this.loadHTML,  vars: [sectionOBJ]});
        }

        if (sectionOBJ.templatePath) {
            function_arr.push({scope: this, fn: this.loadTemplate,  vars: [sectionOBJ, sectionOBJ.templatePath]});
        }

        for (var i = sectionLoaderState.templatesToLoad.length - 1; i >= 0; i--) {
            function_arr.push({scope: this, fn: this.loadTemplate,  vars: [sectionOBJ, sectionLoaderState.templatesToLoad[i]]});
        };

        if(sectionOBJ.cssPath) {
            function_arr.push({scope: this, fn: this.loadCSS,   vars: [sectionOBJ]});
        }

        arrayExecuter.execute(function_arr);

    }

    function loadHTML (sectionOBJ) {
        var that = this;

        // console.log('loadHTML: '+sectionOBJ.htmlPath);

        //load html and scrape for images
        $.get(sectionOBJ.htmlPath, function(data){
            that.htmlLoaded(sectionOBJ, data);
        });
    }

    function htmlLoaded (sectionOBJ, data) {
        // console.log('sectionLoader_htmlLoaded: ');
        
        sectionOBJ.htmlData = data;

        var sectionID = sectionOBJ.id;

        if(sectionLoader.localizationJSON && sectionLoader.localizationJSON.sections){
            var htmlObjs;
            var numHtmlObjs;
            var spanStyle;
            var spanStyleNum;
            var newStr;
            var currSpanStyle;
            var currObj;
            
            //handle the shared 'html' category 
            if(sectionLoader.localizationJSON.sections['shared'] && sectionLoader.localizationJSON.sections['shared']["html"]){
                htmlObjs = sectionLoader.localizationJSON.sections['shared']["html"];
                numHtmlObjs = htmlObjs.length;
                while(numHtmlObjs--){
                    currObj = htmlObjs[numHtmlObjs];

                    while(String(sectionOBJ.htmlData).indexOf(currObj["ID"]) > 0){
                        spanStyle = "";
                        spanStyleNum = (currObj["css"])?currObj["css"].length:0;
                        while(spanStyleNum--){
                            currSpanStyle = currObj["css"][spanStyleNum];
                            spanStyle += currSpanStyle["ID"]+':'+currSpanStyle["VAL"]+';';
                        }
                        newStr = (spanStyle == "")?String(currObj["VAL"]):'<span style="'+spanStyle+'" >'+String(currObj["VAL"])+'</span>';
                        if(currObj["visible"] && String(currObj["visible"]).toLowerCase() == "false")newStr = "";
                        sectionOBJ.htmlData = sectionOBJ.htmlData.replace(String(currObj["ID"]), newStr);
                    }
                }
            }

            //handle the section specifc 'html' category
            if(sectionLoader.localizationJSON.sections[sectionID] && sectionLoader.localizationJSON.sections[sectionID]["html"]){
                htmlObjs = sectionLoader.localizationJSON.sections[sectionID]["html"];
                numHtmlObjs = htmlObjs.length;
                while(numHtmlObjs--){
                    currObj = htmlObjs[numHtmlObjs];
                    while(String(sectionOBJ.htmlData).indexOf(String(currObj["ID"])) > 0){
                        spanStyle = "";
                        spanStyleNum = (currObj["css"])?currObj["css"].length:0;
                        while(spanStyleNum--){
                            currSpanStyle = currObj["css"][spanStyleNum];
                            spanStyle += currSpanStyle["ID"]+':'+currSpanStyle["VAL"]+';';
                        }
                        newStr = (spanStyle == "")?String(currObj["VAL"]):'<span style="'+spanStyle+'" >'+String(currObj["VAL"])+'</span>';
                        if(currObj["visible"] && String(currObj["visible"]).toLowerCase() == "false")newStr = "";
                        sectionOBJ.htmlData = sectionOBJ.htmlData.replace(String(currObj["ID"]), newStr);
                    }
                }
            }
        }

        // preload images from html
        var img_pattern = /<img [^>]*src="([^"]+)"[^>]*>/g;
        var results;

        // load backplate from data attribute
        if ($(sectionOBJ.htmlData).data('backplate')) {
            sectionLoaderState.imagesToLoad.push($(sectionOBJ.htmlData).data('backplate'));
        }

        while ((results = img_pattern.exec(sectionOBJ.htmlData)) !== null)
        {
            sectionLoaderState.imagesToLoad.push(results[1]);
        }

        arrayExecuter.stepComplete_instant();
    }

    function loadCSS (sectionOBJ) {
        var that = this;

        $.get(sectionOBJ.cssPath, function(data){
            that.cssLoaded(sectionOBJ, data);
        }, 'text');

    }

    function cssLoaded (sectionOBJ, data){
        // trace('this.cssLoaded: ');
        sectionOBJ.cssData = String(data);

        var sectionID = sectionOBJ.id;

        if(sectionLoader.localizationJSON && sectionLoader.localizationJSON.sections && sectionLoader.localizationJSON.sections[sectionID] && sectionLoader.localizationJSON.sections[sectionID].css){
            var cssObjs = sectionLoader.localizationJSON.sections[sectionID].css;
            var numCssObjs = cssObjs.length;
            while(numCssObjs--){
                    
                while(String(sectionOBJ.cssData).indexOf(String(cssObjs[numCssObjs].ID)) > 0){
                    sectionOBJ.cssData = sectionOBJ.cssData.replace(String(cssObjs[numCssObjs].ID), String(cssObjs[numCssObjs].VAL));
                }
                
            }
        }

        var imgUrls = sectionOBJ.cssData.match(/[^\(]+\.(gif|jpg|jpeg|png)/g);

        if(imgUrls){
            var numImages = imgUrls.length;
            while (numImages--) {
                var fileURL = imgUrls[numImages].replace('../', '');
                 // trace('sectionLoader_cssLoaded: adding: '+fileURL);
                if (!this.isDuplicate(fileURL)) {
                    sectionLoaderState.imagesToLoad.push(fileURL);
                }
            }
        }

        arrayExecuter.stepComplete();
    }

    function loadJS (sectionOBJ){
        var that = this;

        // trace('sectionLoader_loadJS: '+sectionOBJ.jsPath);

        if (sectionOBJ.jsPath) {
            that.jsLoaded(sectionOBJ, null);
        }

    }

    function jsLoaded (sectionOBJ, data){
        // trace('sectionLoader_loadJS: success');
        sectionOBJ.jsAttached = true;
        
        arrayExecuter.stepComplete();
    }

    function isDuplicate (fileURL){
        var numImages = sectionLoaderState.imagesToLoad.length;
        while(numImages--){
            if (sectionLoaderState.imagesToLoad[numImages] === fileURL) {
                return true;
            }
        }
        var numVids = sectionLoaderState.videosToLoad.length;
        while(numVids--){
            if(sectionLoaderState.videosToLoad[numVids] === fileURL) {
                return true;
            }
        }
        return false;
    }

    function loadTemplate(sectionOBJ, template) {
        var that = this,
            template_path = typeof template === 'string' ? template : template.template_path;

        //load mustache templates
        $.get(base_url + template_path, function(data){
            if (typeof template === 'string') {
                sectionOBJ.template = data;
            } else {
                sectionOBJ.partials[template.template_name] = data;
            }
            
            Mustache.compile(data);

            arrayExecuter.stepComplete_instant();
        });
    }

    function loadFiles (){

        var numImages = sectionLoaderState.imagesToLoad.length,
            numVids = sectionLoaderState.videosToLoad.length,
            numMisc = sectionLoaderState.miscToLoad.length,
            fileURL,
            newImage,
            newVid,
            that = this;

        if((numImages+numVids+numMisc) < 1){
            this.complete();
            return;
        }

        if (sectionLoaderState.loader) {
            sectionLoaderState.loader.bringIn();
        }

        while (numImages--) {
            fileURL = sectionLoaderState.imagesToLoad[numImages];
            newImage = new Image();
            newImage.alt = String(numImages)
            $(newImage).load(this.imageLoaded).error('error', this.fileError);
            newImage.src = base_url + fileURL;
        }

        sectionLoaderState.videoLoadingStatus = {currURL: '', buffered:0, seekable:0, totalLoad: 0, currentCount:0};
        
        while (numVids--) {
            fileURL = sectionLoaderState.videosToLoad[numVids];
            newVid = document.createElement('video');

            //if it's a mobile device use the central player to load the videos, one at a time
            if(DeviceDetect.isiPhone || DeviceDetect.isiPod){
                sectionLoaderState.videosLoaded = sectionLoaderState.videosToLoad;
            } else if (DeviceDetect.isMobile || siteVideo_Settings.isFlash || true) {
                siteVideo_Player.preload = 'auto';
                siteVideo_Player.autobuffer = 'true';
    //          siteVideo_Player.controls = true;
                siteVideo_Player.autoplay = false;
                            
                sectionLoaderState.videosLoading.push(fileURL);
                
                if (numVids === 0) {
                    this.addNextVid_centralPlayer();
                }
            } else {
                $(newVid).attr('preload', 'auto');
                $(newVid).attr('autobuffer', 'true');
                $(newVid).attr('controls', 'controls');
                
                newVid.preload = 'auto';
                newVid.autobuffer = true;
                newVid.controls = true;
                newVid.autoplay = false;
                
                newVid.src = fileURL;
                        
                sectionLoaderState.videosLoading.push(newVid);

                if (numVids === 0) {
                    setTimeout(this.checkVidStatus.bind(that), 100);
                }
            }
            
        }
        
        console.log(sectionLoaderState.miscToLoad);
        while(numMisc--){
            var fileURL = sectionLoaderState.miscToLoad[numMisc];
            console.log('loading misc: '+fileURL);
            var fileIndex = 0+numMisc;
            $.get(fileURL, function(){
                sectionLoader.miscFileLoaded();
            });            
        }
    }

    function imageLoaded (e){
        var imageId = Number(this.alt);

        if(sectionLoaderState.imagesToLoad[imageId]){
            //alert(sectionLoaderState.imagesToLoad[imageId] + ' loaded');

            // sectionLoaderState.imagesToLoad.splice(sectionLoaderState.imagesToLoad.indexOf(imageId), 1);
            sectionLoaderState.imagesToLoad[imageId] = null;
            sectionLoaderState.imagesLoaded++;

            // trace('sectionLoader image Loaded: '+this.alt+' : '+this.src+' : '+sectionLoaderState.imagesLoaded+' of '+sectionLoaderState.imagesToLoad.length);
            sectionLoader.checkComplete();
        }
    }

    function addNextVid_centralPlayer (){
        var fileURL = sectionLoaderState.videosLoading[0];
        siteVideo_Player.setSrc('');
        siteVideo_Player.setSrc(fileURL);
        sectionLoaderState.videoLoadingStatus.currURL = fileURL;
        sectionLoaderState.videoLoadingStatus.buffered = 0;
        sectionLoaderState.videoLoadingStatus.seekable = 0;
        setTimeout(function() {sectionLoader.checkVidStatus_centralPlayer();}, 100);
    }

    function checkVidStatus_centralPlayer () {
        var videoToCheck = siteVideo_Player;
                    
        //make sure it's loading the right file
        var currURL = sectionLoaderState.videosLoading[0];
        if(String(siteVideo_Player.src).indexOf(currURL) < 0){
            this.addNextVid_centralPlayer();
            return;
        }
        
        var vidFinished = false;
        var buffered = 0;
        if(videoToCheck.buffered.length){
            buffered = videoToCheck.buffered.end(0);
            if(buffered >= videoToCheck.duration){
                vidFinished = true;
            }
        }
        
        var seekable = 0;
        if(!vidFinished && videoToCheck.seekable.length){
            seekable = videoToCheck.seekable.end(0);
            if(seekable >= videoToCheck.duration){
                vidFinished = true;
            }
        }

        //check if the load status has changed, if not count up, once the limit is met assume it's stuck and move one
        var totalLoad = this.getPerc();
        if(!vidFinished && sectionLoaderState.videoLoadingStatus.currURL === currURL && sectionLoaderState.videoLoadingStatus.totalLoad === totalLoad && sectionLoaderState.videoLoadingStatus.seekable === seekable && sectionLoaderState.videoLoadingStatus.buffered === buffered){
            sectionLoaderState.videoLoadingStatus.currentCount++;
            if(sectionLoaderState.videoLoadingStatus.currentCount > 50){
                vidFinished = true;
            }
        } else {
            sectionLoaderState.videoLoadingStatus.currentCount = 0;
        }
        
        sectionLoaderState.videoLoadingStatus.currURL = currURL;
        sectionLoaderState.videoLoadingStatus.totalLoad = totalLoad;
        sectionLoaderState.videoLoadingStatus.seekable = seekable;
        sectionLoaderState.videoLoadingStatus.buffered = buffered;
        
        if(vidFinished){
            sectionLoaderState.videoLoadingStatus.currentCount = 0;
            sectionLoaderState.videosLoaded++;
            trace('sectionLoader video Loaded: '+siteVideo_Player.src+' : '+sectionLoaderState.videosLoaded+' of '+sectionLoaderState.videosToLoad.length);
            sectionLoaderState.videosLoading.splice(0, 1);
            
            if(sectionLoaderState.videosLoading.length){
                //there are more videos: load the next video
                this.addNextVid_centralPlayer();
            } else {
                //there are no more videos so check if everything is done
                checkComplete();
            }
        } else {
            // wait 100ms then check if video is done
            setTimeout(function(){sectionLoader.checkVidStatus_centralPlayer();}, 100);
        }
    }

    function checkVidStatus (){
        var arrayLength = sectionLoaderState.videosLoading.length;
        while(arrayLength--){
            var videoToCheck = sectionLoaderState.videosLoading[arrayLength];
            if(videoToCheck.buffered.length){
                var buffered = videoToCheck.buffered.end(0);
                if(buffered >= videoToCheck.duration){
                    sectionLoaderState.videosLoaded++;
                    // trace('sectionLoader video Loaded: '+videoToCheck.src+' : '+sectionLoaderState.videosLoaded+' of '+sectionLoaderState.videosToLoad.length);
                    sectionLoaderState.videosLoading.splice(arrayLength, 1);
                }
            }
        }

        if (sectionLoaderState.videosLoading.length) {
            setTimeout(function(){sectionLoader.checkVidStatus();}, 100);
        }
        
        sectionLoader.checkComplete();
    }

    function miscFileLoaded(fileId){
        sectionLoaderState.miscLoaded++;
        
        sectionLoader.checkComplete();
    }
    
    function getPerc () {
        var perc = (sectionLoaderState.imagesLoaded + sectionLoaderState.videosLoaded + sectionLoaderState.miscLoaded)/(sectionLoaderState.imagesToLoad.length + sectionLoaderState.videosToLoad.length + sectionLoaderState.miscToLoad.length);
        return perc;
    }

    function fileError (e) {
        // trace('sectionLoader_fileError');
        // trace(e);
    }

    function checkComplete(){
        if(sectionLoaderState.imagesLoaded >= sectionLoaderState.imagesToLoad.length
        && sectionLoaderState.videosLoaded >= sectionLoaderState.videosToLoad.length
        && sectionLoaderState.miscLoaded >= sectionLoaderState.miscToLoad.length)this.complete();
    }

    function complete () {
        // console.log('sectionLoader_complete: ');
        
        var numSectionsLoaded = sectionLoaderState.currentlyLoadingIDs.length;
        while (numSectionsLoaded--) {
            var sectionID = sectionLoaderState.currentlyLoadingIDs[numSectionsLoaded];
            var sectionOBJ = this.returnSectionOBJ(sectionID);
            sectionOBJ.loaded = true;
            
            //attachCSS
            if (sectionOBJ.cssPath) {
                // trace('attachCSS: '+sectionOBJ.cssPath);

                if (sectionLoader.localizationJSON && sectionLoader.localizationJSON.sections && sectionLoader.localizationJSON.sections[sectionID] && sectionLoader.localizationJSON.sections[sectionID].css) {
                    //write modified CSS directly into HTML header 
                    $('<style type="text/css">' + sectionOBJ.cssData + '</style>').appendTo('head');
                } else {
                    //attached link to original CSS file
                    var fileref = document.createElement('link');
                    fileref.setAttribute('rel', 'stylesheet');
                    fileref.setAttribute('type', 'text/css');
                    fileref.setAttribute('href', sectionOBJ.cssPath);
                    document.getElementsByTagName('head')[0].appendChild(fileref);
                }
            }
        }
        
        sectionLoaderState.currentlyLoadingIDs = [];
        sectionLoaderState.imagesToLoad = [];
        sectionLoaderState.imagesLoaded = 0;
        sectionLoaderState.videosToLoad = [];
        sectionLoaderState.videosLoaded = 0;
        sectionLoaderState.videosLoading = [];
        sectionLoaderState.miscToLoad = [];  
        sectionLoaderState.miscLoaded = 0;   
        
        if (sectionLoaderState.loader && !sectionLoaderState.loader.finished) {
            sectionLoaderState.loader.complete(arrayExecuter.stepComplete_instant.bind(arrayExecuter));
        } else {
            arrayExecuter.stepComplete_instant();
        }
    }

    function returnSectionOBJ (id) {
        var sectionOBJ,
            numSections = sectionLoaderState.sections.length;

        while (numSections--) {
            if(sectionLoaderState.sections[numSections].id === id){
                sectionOBJ = sectionLoaderState.sections[numSections];
            }
        }

        return sectionOBJ;
    }

    var sectionLoader = {
        localizationJSON: {},
        addLoaderUI: addLoaderUI,
        addSection: addSection,
        addFiles: addFiles,
        loadSection: loadSection,
        initScrape: initScrape,
        loadHTML: loadHTML,
        loadTemplate: loadTemplate,
        htmlLoaded: htmlLoaded,
        loadCSS: loadCSS,
        cssLoaded: cssLoaded,
        loadJS: loadJS,
        jsLoaded: jsLoaded,
        isDuplicate: isDuplicate,
        loadFiles: loadFiles,
        imageLoaded: imageLoaded,
        addNextVid_centralPlayer: addNextVid_centralPlayer,
        checkVidStatus_centralPlayer: checkVidStatus_centralPlayer,
        checkVidStatus: checkVidStatus,
        miscFileLoaded: miscFileLoaded,
        getPerc: getPerc,
        fileError: fileError,
        checkComplete: checkComplete,
        complete: complete,
        returnSectionOBJ: returnSectionOBJ
    };

    return sectionLoader;

}));