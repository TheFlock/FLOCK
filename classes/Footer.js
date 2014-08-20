// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'FLOCK/utils/DeviceDetect'], function () {
            return (root.classes.Footer = factory());
        });
    } else {
        root.classes.Footer = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

    'use strict';

    var that,
        isMobile = FLOCK.utils.DeviceDetect.isMobile,
        shareShelf_width,
        data;

    var Footer = function (el) {
        // console.log(FLOCK.app.dataSrc.sections);

        that = this;
    }

    function init (el) {
        data = FLOCK.app.dataSrc.sections.main.data;

        this.elements = {
            el: el
        }

        //build links in credit drawer
        var linkRows = data["footerLinks"] || [];
        var updatedLinkRows = [];
        var linkContainerObj = document.getElementById("legal");
        var mpaaContainerObj = document.getElementById("mpaa_legal");
        var r, e;
        var addSpacerLi = true;
        var spacerContents = "-";
        var dividerLi;

        // this loop looks at all links and only adds links if visible is true
        // also it only adds a row if there are 1 more more visible links in the row
        for(r=0; r<linkRows.length; r++){
            var updatedRow = [];
            for(e=0; e<linkRows[r].length; e++){
                if(String(linkRows[r][e]["VISIBLE"]).toLowerCase() == "true"){
                    updatedRow.push(linkRows[r][e]);
                }
            }
            if(updatedRow.length >= 1)updatedLinkRows.push(updatedRow);
        }
        // this link will loop through the added links and create the html
        for(r=0; r<updatedLinkRows.length; r++){
            for(e=0; e<updatedLinkRows[r].length; e++){
                var linkLi  = document.createElement("li");
                linkContainerObj.appendChild(linkLi);
                var linkA  = document.createElement("a");
                linkLi.appendChild(linkA);
                
                linkA.target = "_blank";
                linkA.href = updatedLinkRows[r][e]["URL"];
                linkA.innerHTML = updatedLinkRows[r][e]["LABEL"];
                linkA.style.fontSize = updatedLinkRows[r][e]["font-size"];
                // $(linkA).on('click', FLOCK.functions.externalLink);
                
                if(String(updatedLinkRows[r][e]["MPAA_REQUIRED"]).toLowerCase() == "true"){
                    $(mpaaContainerObj).append($(linkLi).clone());
                }
                
                if(addSpacerLi && e+1 < updatedLinkRows[r].length){
                    var spacerLi = document.createElement("li");
                    spacerLi.innerHTML = spacerContents;
                    linkContainerObj.appendChild(spacerLi);
                }
            }
            if(r+1 < updatedLinkRows.length){
                dividerLi = document.createElement('li');
                dividerLi.className = 'divider';
                linkContainerObj.appendChild(dividerLi);
            }
        }
        
        //addIcons to Follow Us Menu
        var followUsObj = data["footerFollowUs"];

        if (followUsObj) {
            var followUsElem = document.getElementById("follow");
            if(String(followUsObj["VISIBLE"]).toLowerCase() == "false"){
                followUsElem.style.display = "none";
            } else {
                for(var l=0; l<followUsObj.links.length; l++){
                    if(String(followUsObj.links[l]["VISIBLE"]).toLowerCase() == "true"){
                        var followUsA = document.createElement("a");
                        followUsA.className = followUsObj.links[l]["CLASS"] + ' social-icon';
                        followUsA.target = "_blank";
                        followUsA.href = followUsObj.links[l]["URL"];
                        followUsElem.appendChild(followUsA);
                        // $(followUsA).on('click', FLOCK.functions.externalLink);
                    }
                }
            }
        }
 
        //addIcons to Follow Us Menu
        var shareObj = data["footerShare"]; 

        if (shareObj) {
            if(String(shareObj["VISIBLE"]).toLowerCase() == "false"){
                $("#share").css("display", "none");
            } else {
                var shareBtns = [
                    {
                        "JSON_ID": "getGlue",
                        "HTML_ID": "getGlueBtn",
                    },
                    {
                        "JSON_ID": "googlePlus",
                        "HTML_ID": "gPlusBtn",
                    },
                    {
                        "JSON_ID": "tweet",
                        "HTML_ID": "tweetBtn",
                    },
                    {
                        "JSON_ID": "facebook_like",
                        "HTML_ID": "fbLikeBtn",
                    },
                    {
                        "JSON_ID": "facebook_share",
                        "HTML_ID": "share-facebook",
                    }
                ];
                
                for(var b=0; b<shareBtns.length; b++){
                    var currBtn = shareBtns[b];
                    var btnDisp = (shareObj["show_buttons"][currBtn["JSON_ID"]].toLowerCase() == "true")?"inherit":"none";
                    $("#"+currBtn["HTML_ID"]).css("display", btnDisp);
                }
            }
        }

        //Share on facebook
        $('#share-facebook').on('click', function(e) {
            
            window.open('http://www.facebook.com/share.php?u='+encodeURIComponent($(this).attr('href')), '_blank');
            // $('#sound_button').removeClass('sound-on');
            // FLOCK.functions.pauseSound();

            e.preventDefault();
            //return false;
        });
            
        //shareShelf
        $('#sharelabel').on('click', this._toggleShare);
        
        //Credits button
        $('#credits-button').on('click', this._toggleCredits);
        // $('#creditsbox-close').on('click', toggleCredits);
        
        // $('#shareShelf').css('width', 'auto');
        $('#shareShelfContents').css('width', 'auto');

        shareShelf_width = $('#shareShelfContents').width()+10;
        $('#shareShelfContents').css('width', shareShelf_width+'px');
    }

    function showMPAARequirements(){
        var mpaaRequirementsJSON = data["MPAA_requirements"],
            mpaaRequirementsElement = $("#MPAA_requirements");

        if (mpaaRequirementsJSON.VISIBLE === 'false') {
            return;
        }

        mpaaRequirementsElement.css('width', (40 + mpaaRequirementsElement.find('img').width() + mpaaRequirementsElement.find('#mpaa_legal').outerWidth(true)));
        FLOCK.settings.mpaaShown = true;
        TweenLite.to(mpaaRequirementsElement, 1, {css:{bottom: 0}, ease:Power4.easeInOut});
        // TweenLite.to($("#bottomRight"), 1, {css:{bottom: -200}, ease:Power4.easeInOut});

        var that = this;
        window.setTimeout(function () {
            that.hideMPAARequirements();
        }, 6000);
        
        // TweenLite.to($("#bottomRight"), 1, {css:{bottom: 0}, ease:Power4.easeInOut, delay: 6});
    }

    function hideMPAARequirements(){
        var mpaaRequirementsElement = $("#MPAA_requirements");
        TweenLite.to(mpaaRequirementsElement, 1, {css:{bottom: -200}, ease:Power4.easeInOut});
    }

    function toggleCredits(e) {

        var credits = document.getElementById('credits'),
            creditsButton = document.getElementById('credits-button'),
            credits_height = $(credits).outerHeight();

        if (creditsButton.className.match('active') !== null || e === 'close') {
            
            creditsButton.className = creditsButton.className.replace('active', '');

            TweenLite.to(credits, 0.5, {bottom: -credits_height + 'px', ease:Power4.easeInOut, onUpdate: function () {
                creditsButton.style.top = Math.min(0, (Math.abs(parseInt(credits.style.bottom)) - (credits_height - 30))) + 'px';
            }, onComplete: function () {
                creditsButton.style.zIndex = 1;
                credits.style.zIndex = 0;
            }});
        } else {

            creditsButton.className = creditsButton.className + ' active';
            creditsButton.style.zIndex = 10;
            credits.style.zIndex = 9;
            
            TweenLite.to(credits, 0.5, {bottom:'0px', ease:Power4.easeInOut, onUpdate: function () {
                creditsButton.style.top = Math.min(0, (Math.abs(parseInt(credits.style.bottom)) - (credits_height - 30))) + 'px';
            }});

            if (document.getElementById('sharelabel').className.match('active')) {
                that._toggleShare();
            }
        }

        if (e) {
            // e.preventDefault();
            return false;
        }
    }

    function toggleShare(e){

        var shareShelf = $('#shareShelf'),
            sharelabel = document.getElementById('sharelabel'),
            shareShelfContents = $('#shareShelfContents'),
            shelf_height = shareShelf.height();

        if (shareShelf[0].className.match('active') !== null || e === 'close') {
            shareShelf[0].className = shareShelf[0].className.replace('active', '');
            sharelabel.className = sharelabel.className.replace('active', '');
            TweenLite.to(shareShelf, 0.5, {top:'30px', ease:Power4.easeInOut});
            TweenLite.to(sharelabel, 0.5, {top:'0px', ease:Power4.easeInOut, onComplete: function () {
                shareShelf[0].style.zIndex = 0;
                sharelabel.style.zIndex = 1;
                document.getElementById('share').style.zIndex = 0;
            }});
        } else {
            shareShelf[0].className = shareShelf[0].className + ' active';
            sharelabel.className = sharelabel.className + ' active';

            shareShelf[0].style.zIndex = 10;
            sharelabel.style.zIndex = 11;
            document.getElementById('share').style.zIndex = 9;

            TweenLite.to(shareShelf, 0.5, {top:-(shelf_height + 15) + 'px', ease:Power4.easeInOut});
            TweenLite.to(sharelabel, 0.5, {top:-(shelf_height + 15) + 'px', ease:Power4.easeInOut});

            if (document.getElementById('credits-button').className.match('active')) {
                that._toggleCredits();
            }
        }

        if (e) {
            // e.preventDefault();
            return false;
        }
    }

    function resize (w, h) {
        console.log('resize footer');
    }

    function closeMenus () {
        this._toggleShare('close');
        this._toggleCredits('close');
    }

    function hide () {
        TweenLite.to(this.elements.el, 0.25, {bottom: '-30px', ease:Power2.easeInOut, onComplete: function () {
            // that.elements.el.style.display = 'none';
        }});
    }

    function show () {
        // this.elements.el.style.display = 'block';
        TweenLite.to(this.elements.el, 0.25, {bottom: '0px', ease:Power2.easeInOut});
    }


    Footer.prototype._toggleShare = toggleShare;
    Footer.prototype._toggleCredits = toggleCredits;

    Footer.prototype.closeMenus = closeMenus;
    Footer.prototype.init = init;

    Footer.prototype.hide = hide;
    Footer.prototype.show = show;

    Footer.prototype.resize = resize;
    Footer.prototype.showMPAARequirements = showMPAARequirements;
    Footer.prototype.hideMPAARequirements = hideMPAARequirements;

    return new Footer();
}));