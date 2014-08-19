// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'jquery',
            // 'pixi',
            'greensock/TweenLite.min',
            'greensock/TimelineLite.min',
            'greensock/easing/EasePack.min',
            'greensock/plugins/CSSPlugin.min',
            'FLOCK/classes/HUDLoader',
            'FLOCK/utils/ArrayExecuter'
                ], function ($) {
            return (root.classes.HUD = factory($));
        });
    } else {
        root.classes.HUD = factory($);
    }
}(window.FLOCK = window.FLOCK || {}, function ($) {

    var myName = "HUD",
        container,
        renderer,
        stage,
        filesToLoad = [],
        tempImage,
        arrayExecuter = FLOCK.utils.ArrayExecuter,
        elements = {},
        files = {
            'sheetPNG': 'img/HUD/HUD_sheet.png',
            'sheetJSON': 'img/HUD/HUD_sheet.json'
        },
        currSetting = "off",
        sectionSettings
        count = 0;

    function HUD() {

        for(var _file in files)
            filesToLoad.push(files[_file]);
                
        // console.log('hey there ' + myName);
    }

    function setSectionSettings(settings){
        sectionSettings = settings;
    }

    function init(){
        var assetsToLoad = [ files["sheetJSON"] ];
        // var assetsToLoad = [ files["sheetJSON"] ];
        var assetLoader = new PIXI.AssetLoader( assetsToLoad );
        assetLoader.onComplete = assetsLoaded.bind(this);
        assetLoader.load();
    }
        
    function assetsLoaded(){
        this.init = true;

        container = document.getElementById("HUD");
        container.style.visibility = "hidden";
        
        stage = new PIXI.Stage(0x000000);
        // renderer = PIXI.autoDetectRenderer(1600, 1000);
        renderer = PIXI.autoDetectRenderer(FLOCK.settings.window_dimensions.width, FLOCK.settings.window_dimensions.height, null, true);

        // add the renderer view element to the DOM
        container.appendChild(renderer.view);
        
        createInnerCircle();
        createOuterCircle();
        elements.squareCluster_tl = createSquareCluster(-1, -1);        
        elements.squareCluster_bl = createSquareCluster(-1, 1);
        createDotGrid();
                
        setTimeout(function(){
            resize(FLOCK.settings.window_dimensions.width, FLOCK.settings.window_dimensions.height);
            animate();         
        }, 200);

    }
    
/*/////////////////////////////////////////////////////////////////////////////////////////////////////
                                          CREATE ELEMENTS
/////////////////////////////////////////////////////////////////////////////////////////////////////*/

    function createDotGrid(){        
        var numRows = 10,
            rows = [],
            dotContainer = new PIXI.DisplayObjectContainer();
        
        elements.dots = {container: dotContainer, rows: rows};
        
        for (var r=0; r<numRows; r++){
            var rowContainer = new PIXI.DisplayObjectContainer();
            var leftDot = PIXI.Sprite.fromFrame("dot.png");
            var rightDot = PIXI.Sprite.fromFrame("dot.png");
            leftDot.position.x = -122;
            rightDot.position.x = 122;
            
            rowContainer.addChild(leftDot);
            rowContainer.addChild(rightDot);
            dotContainer.addChild(rowContainer);
            rows.push({container: rowContainer, left:leftDot, right:rightDot});
        }
        
        stage.addChild(dotContainer);
        
        dotContainer.alpha = 0.42;
    }
    
    function createSquareCluster(xDir, yDir){
        console.log('createSquareCluster');
        var xSpace = 10,
            ySpace = 10,
            numPerRow = [6, 4, 2],
            rows = [],
            blockContainer = new PIXI.DisplayObjectContainer(),
            minTime = 0.5,
            maxTime = 3;
            
        for( var r =0; r<numPerRow.length; r++){
            var numSquares = numPerRow[r],
                tChange = minTime+(Math.random()*(maxTime-minTime)),
                cDir = 1-(Math.round(Math.random())*2),
                cNum = Math.ceil(Math.random()*numSquares),
                row = {squares:[], total: numSquares, lastChange: 0, tChange: tChange*1000, cDir: cDir, cNum:cNum};
                
            rows.push(row);
            for (var s=0; s<numSquares; s++){
                var square = PIXI.Sprite.fromFrame("square.png");
                square.position.x = s*xSpace*xDir;
                square.position.y = r*ySpace*yDir;
                row.squares.push(square);
                blockContainer.addChild(square);
            }
        }
        
        stage.addChild(blockContainer);
                
        return {container:blockContainer, rows: rows};
    }
    
    function createInnerCircle(){
        elements.innerCircle = new PIXI.DisplayObjectContainer();
        elements.innerCircleResize = new PIXI.DisplayObjectContainer();
        elements.innerCircleLeft = PIXI.Sprite.fromFrame("innerCircle_left.png");
        // elements.innerCircleLeft = PIXI.Sprite.fromFrame("eggHead.png");
        elements.innerCircleLeft.anchor.x = 1;
        elements.innerCircleLeft.anchor.y = 0.5;
        elements.innerCircleLeft.position.x = -215;
        
        // elements.innerCircleRight = PIXI.Sprite.fromFrame("flowerTop.png");
        elements.innerCircleRight = PIXI.Sprite.fromFrame("innerCircle_right.png");
        elements.innerCircleRight.anchor.x = 0;
        elements.innerCircleRight.anchor.y = 0.5;
        elements.innerCircleRight.position.x = 215;
        
        elements.innerCircle.addChild(elements.innerCircleResize);
        elements.innerCircleResize.addChild(elements.innerCircleLeft);
        elements.innerCircleResize.addChild(elements.innerCircleRight);
        
        elements.innerCircle.direction = -1;
        stage.addChild(elements.innerCircle);
        
        elements.innerCircle.alpha = 0.22;
    }
    
    function createOuterCircle(){
        elements.outerCircle = new PIXI.DisplayObjectContainer();
        elements.outerCircleResize = new PIXI.DisplayObjectContainer();
        elements.outerCircleLeft = PIXI.Sprite.fromFrame("outerCircle_side.png");
        elements.outerCircleLeft.anchor.x = 1;
        elements.outerCircleLeft.anchor.y = 0.5;
        elements.outerCircleLeft.position.x = -472;
        
        elements.outerCircleRight = PIXI.Sprite.fromFrame("outerCircle_side.png");
        elements.outerCircleRight.scale.x = -1;
        elements.outerCircleRight.anchor.x = 1;
        elements.outerCircleRight.anchor.y = 0.5;
        elements.outerCircleRight.position.x = 472;
        
        elements.outerCircle.direction = 1;
        elements.outerCircle.addChild(elements.outerCircleResize);
        elements.outerCircleResize.addChild(elements.outerCircleLeft);
        elements.outerCircleResize.addChild(elements.outerCircleRight);
        stage.addChild(elements.outerCircle);
        
        elements.outerCircle.alpha = 0.22;
    }

    
/*/////////////////////////////////////////////////////////////////////////////////////////////////////
                                          ANIMATE ELEMENTS
/////////////////////////////////////////////////////////////////////////////////////////////////////*/

    function pixi_render(){
        renderer.render(stage);
    }
    
    function animate(){
        var currTime = new Date().getTime();
        
        var rotationLimit = Math.PI/6;     
        var rotSpeed = 0.001;        
        elements.innerCircle.rotation += rotSpeed*elements.innerCircle.direction;
        if(Math.abs(elements.innerCircle.rotation) > rotationLimit){
            elements.innerCircle.direction *= -1;
            elements.innerCircle.rotation += rotSpeed*elements.innerCircle.direction*2;
        }
        elements.outerCircle.rotation += rotSpeed*elements.outerCircle.direction;
        if(Math.abs(elements.outerCircle.rotation) > rotationLimit){
            elements.outerCircle.direction *= -1;
            elements.outerCircle.rotation += rotSpeed*elements.outerCircle.direction*2;
        }
        
        
        // count += 0.0001;
        // elements.innerCircle.scale.x = elements.innerCircle.scale.y = 0.5+Math.sin(count)*0.5;
        // elements.outerCircle.scale.x = elements.outerCircle.scale.y = 0.5+Math.cos(count)*0.5;
        
        updateSquareCluster(elements.squareCluster_tl, currTime, 1);
        updateSquareCluster(elements.squareCluster_bl, currTime, 1);
        
        pixi_render();
        requestAnimFrame(animate);
    }
    
    function updateSquareCluster(sqObj, currTime, speed){
        var numRows = sqObj.rows.length,
            deltaT,
            currRow,
            s;
            
        while(numRows--){
            currRow = sqObj.rows[numRows];
            deltaT = currTime-currRow.lastChange;
            
            if(deltaT > currRow.tChange/speed){
                currRow.lastChange = currTime;
                currRow.cNum += currRow.cDir;
                if(currRow.cNum < 0 || currRow.cNum > currRow.total){
                    currRow.cDir *= -1;
                    currRow.cNum += currRow.cDir*2;
                }
                for(s=0; s<currRow.total; s++){
                    currRow.squares[s].visible = (s > currRow.cNum-1)?false:true;
                }
            }
        }
    }

    function updateSetting(sectionID){
        var destSetting = (sectionSettings[sectionID] !== undefined)?sectionSettings[sectionID]:sectionSettings['default'];
        if(destSetting !== currSetting){
            currSetting = destSetting;
            switch(currSetting){
                case "hidden":
                    TweenLite.to(container, 1, {autoAlpha: 0});
                    // TweenLite.to(elements.innerCircle, 0.7, {rotation: "-=2", ease: Power4.easeInOut});
                    // TweenLite.to(elements.outerCircle, 0.5, {rotation: "-=2", ease: Power4.easeInOut});
                    TweenLite.to(elements.innerCircle.scale, 0.7, {x: 1.5, y: 1.5, ease: Power4.easeIn});;
                    TweenLite.to(elements.outerCircle.scale, 0.5, {x: 1.5, y: 1.5, ease: Power4.easeIn});
                    break;
                case "normal":
                    TweenLite.to(container, 0.25, {autoAlpha: 1});
                    // TweenLite.to(elements.innerCircle, 1, {rotation: "-=4", ease: Power4.easeOut});
                    // TweenLite.to(elements.outerCircle, 1, {rotation: "+=2", ease: Power4.easeOut});
                    TweenLite.fromTo(elements.innerCircle.scale, 0.75, {x: 0, y: 0}, {x: 1, y: 1, ease: Power4.easeOut, delay: 0.25});
                    TweenLite.fromTo(elements.outerCircle.scale, 1, {x: 0, y: 0}, {x: 1, y: 1, ease: Power4.easeOut});
                    break;
                case "fast":
                    
                    break;
            }
        }

        arrayExecuter.stepComplete_instant();
    }

    function resize (w, h) {
        //this.backplate.resize(w, h);
        
        renderer.resize(w, h);
        elements.outerCircle.position.x = w/2;
        elements.outerCircle.position.y = h/2;
        elements.innerCircle.position.x = w/2;
        elements.innerCircle.position.y = h/2;
        
        elements.squareCluster_tl.container.position.x = Math.round(w/5);
        elements.squareCluster_tl.container.position.y = Math.round(h/4);
        
        elements.squareCluster_bl.container.position.x = Math.round(w/5);
        elements.squareCluster_bl.container.position.y = Math.round(h*3/4);
        
        elements.dots.container.position.x = w*3/4;
        var numDr = elements.dots.rows.length;
        for(var dr=0; dr<numDr; dr++){
            elements.dots.rows[dr].container.position.y = (1+dr)*(h/numDr+2);
        }
        
        var destScale = w/1600;
        elements.innerCircleResize.scale.x = elements.innerCircleResize.scale.y = destScale;
        elements.outerCircleResize.scale.x = elements.outerCircleResize.scale.y = destScale;
        
        
        pixi_render();
    }

    HUD.prototype.init = init;
    HUD.prototype.resize = resize;
    HUD.prototype.setSectionSettings = setSectionSettings;
    HUD.prototype.updateSetting = updateSetting;

    HUD.prototype.filesToLoad = filesToLoad;

    return new HUD();

}));