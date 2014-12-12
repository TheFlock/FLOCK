// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'jquery',
                'mustache',
                'FLOCK/utils/DeviceDetect',
                'greensock/TweenLite.min',
                'greensock/easing/EasePack.min',
                'greensock/plugins/CSSPlugin.min'
            ], function ($, Mustache) {
            return (root.classes.Footer = factory($, Mustache));
        });
    } else {
        root.classes.Footer = factory($, Mustache);
    }
}(window.FLOCK = window.FLOCK || {}, function ($, Mustache) {

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

        var linkList_template = '{{#links}}{{#VISIBLE}}<li><a class="footer-btn" {{#font-size}}style="font-size:{{font-size}}"{{/font-size}} href="{{URL}}" target="_blank" >{{LABEL}}</a></li>{{/VISIBLE}}{{/links}}';
        Mustache.parse(linkList_template);

        this.elements = {
            el: el
        }

        var linkLists = data['footerLinks'] || [],
            list_container,
            list;
        for (var i = 0; i < linkLists.length; i++) {
            list = Mustache.render(linkList_template, {links:linkLists[i].links});
            list_container = document.getElementById(linkLists[i].id);
            list_container.innerHTML = list;
            console.log(list, linkLists[i], linkLists[i].id);
        };

        //Credits button
        $('#credits-button').on('click', this.toggleCredits.bind(this));
        if(document.getElementById('creditsbox-close'))$('#creditsbox-close').on('click', toggleCredits);

        this.initFollow(data);
        this.initShare(data);

        $('#soundButton').on('click', function () {
            this.className = this.className.match('on') ? 'off' : 'on';
            FLOCK.app.SoundEffects.mute();
        });

        if(this.init_extend)this.init_extend(data);

    }

    function showMPAARequirements(){

        var data = FLOCK.app.dataSrc.sections.main.data,
            mpaaRequirementsJSON = data["MPAA_requirements"],
            mpaaRequirementsElement = $("#MPAA_requirements");

        if (mpaaRequirementsJSON.VISIBLE === 'false') {
            return;
        }

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
                this.toggleShare();
            }
        }

        if (e) {
            // e.preventDefault();
            return false;
        }
    }

    function initFollow(data){

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
                        followUsA.className = 'icon-' + followUsObj.links[l]["CLASS"] + ' social-icon';
                        followUsA.target = "_blank";
                        followUsA.href = followUsObj.links[l]["URL"];
                        followUsElem.appendChild(followUsA);
                        // $(followUsA).on('click', FLOCK.functions.externalLink);
                    }
                }
            }
        }
    }

    function initShare(data){

            //share buttons
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
        $('#sharelabel').on('click', this.toggleShare.bind(this));

        // $('#shareShelf').css('width', 'auto');
        $('#shareShelf').css('top', FLOCK.settings.footer_height+'px');
        $('#shareShelfContents').css('width', 'auto');

        shareShelf_width = $('#shareShelfContents').width()+10;
        $('#shareShelfContents').css('width', shareShelf_width+'px');
    }

    function toggleShare(e){

        var shareShelf = $('#shareShelf'),
            sharelabel = document.getElementById('sharelabel'),
            shareShelfContents = $('#shareShelfContents'),
            shelf_height = shareShelf.outerHeight();

        if (shareShelf[0].className.match('active') !== null || e === 'close') {
            shareShelf[0].className = shareShelf[0].className.replace('active', '');
            sharelabel.className = sharelabel.className.replace('active', '');
            TweenLite.to(shareShelf, 0.5, {top: FLOCK.settings.footer_height + 'px', ease:Power4.easeInOut});
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

            TweenLite.to(shareShelf, 0.5, {top:-(shelf_height - FLOCK.settings.footer_height) + 'px', ease:Power4.easeInOut});
            TweenLite.to(sharelabel, 0.5, {top:-(shelf_height - FLOCK.settings.footer_height) + 'px', ease:Power4.easeInOut});

            if (document.getElementById('credits-button').className.match('active')) {
                this.toggleCredits();
            }
        }

        if (e) {
            // e.preventDefault();
            return false;
        }
    }

    function attachSocialScripts(callbackFn){
        console.log('FOOTER | attachSocialScripts')
        getGlueScript();
        twitterScript();
        googlePlusScript();
        if(callbackFn)callbackFn();
    }

    function getGlueScript(){
        var s=document.createElement("script");
        s.src="//widgets.getglue.com/checkin.js";
        var n=document.getElementsByTagName("script")[0];
        n.parentNode.insertBefore(s,n);
    }

    function twitterScript(){

        window.twttr = (function (d,s,id) {
            var t, js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return; js=d.createElement(s); js.id=id;
            js.src="https://platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs);
            return window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f) } });
        }(document, "script", "twitter-wjs"));

        twttr.ready(function (twttr) {
            twttr.events.bind('click', function () {
                videos_pause();
            });
        });
    }

    function googlePlusScript(){
        var gPlusOne,
            container = document.getElementById('gPlusBtn');

        if (container) {
            gPlusOne = document.createElement('g:plusone')
            gPlusOne.setAttribute("size", "medium");
            gPlusOne.setAttribute("annotation", "none");
            gPlusOne.setAttribute("href", FLOCK.settings.base_url);
            container.appendChild(gPlusOne);

            var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
            po.src = 'https://apis.google.com/js/plusone.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
        }
    }

    function resize (w, h) {
        console.log('resize footer');
    }

    function closeMenus () {
        this.toggleShare('close');
        this.toggleCredits('close');
    }

    function hide () {
        TweenLite.to(this.elements.el, 0.25, {bottom: -FLOCK.settings.footer_height + 'px', ease:Power2.easeInOut, onComplete: function () {
            // that.elements.el.style.display = 'none';
        }});
    }

    function show () {
        // this.elements.el.style.display = 'block';
        TweenLite.to(this.elements.el, 0.25, {bottom: '0px', ease:Power2.easeInOut});
    }


    Footer.prototype.initFollow = initFollow;
    Footer.prototype.initShare = initShare;
    Footer.prototype.toggleShare = toggleShare;
    Footer.prototype.toggleCredits = toggleCredits;
    Footer.prototype.attachSocialScripts = attachSocialScripts;

    Footer.prototype.closeMenus = closeMenus;
    Footer.prototype.init = init;

    Footer.prototype.hide = hide;
    Footer.prototype.show = show;

    Footer.prototype.resize = resize;
    Footer.prototype.showMPAARequirements = showMPAARequirements;
    Footer.prototype.hideMPAARequirements = hideMPAARequirements;

    return Footer;
}));
