// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.app = root.app || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'FLOCK/utils/DeviceDetect'], function () {
            return (root.app.MainMenu = factory());
        });
    } else {
        root.app.MainMenu = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

    'use strict';

    var isMobile = FLOCK.utils.DeviceDetect.isMobile;
    var that;

    var MainMenu = function () {
        console.log('main menu');
        that = this;
    }

    function init (current_section) {

        this.isHidden = true;

        this.elements = {
            el: document.getElementById('menu'),
            header: document.getElementById('mainHeader'),
            arrow: document.createElement('div'),
            underline: document.createElement('div'),
            mirror: document.getElementById('headerMirror'),
            mirrorInner: document.getElementById('headerMirrorInner')
        };

        this.elements.listItems = this.elements.el.getElementsByTagName('li');

        this.hideBars = function () {
            if ((!this.tl.reversed() && this.hideAll === false) || (this.tl.reversed() && this.showAll === false)) {
                this.tl.pause();
            }
        }

        this.tl = new TimelineLite({
            paused: true,
            onComplete: function () {
                document.getElementById('mainHeader').style.visibility = 'hidden';
            }
        });

        this.tl.to(this.elements.arrow, 0.25, {left: '-10px', ease: Power2.easeInOut}, "-=0.15");
        var li_width = 0;
        for (var i = 0; i < this.elements.listItems.length; i++) {
            li_width = 10 + this.elements.listItems[i].offsetLeft + this.elements.listItems[i].getElementsByTagName('a')[0].offsetWidth;
            this.tl.to(this.elements.listItems[i], 0.25, {left: -li_width + 'px', ease: Power2.easeInOut}, "-=0.15");
        };
        this.tl.call(this.hideBars, null, this);

        this.tl.to(this.elements.mirror, 0.25, {right: '-16px', ease: Power2.easeInOut}, "+=0");
        this.tl.to(this.elements.el.parentNode, 0.25, {left: '-16px', ease: Power2.easeInOut}, "-=0.25");
        this.tl.addLabel('end');

        this.elements.wrapper = this.elements.el.parentNode;
        this.elements.selected = $('#menu a[data-section="' + current_section + '"]').addClass('selected')

        this.settings = {
            duration: 0.25,
            ease: Power4.easeOut
        }

        this.elements.arrow.className = 'menu_arrow';
        this.elements.underline.className = 'menu_underline';

        this.elements.el.parentNode.appendChild(this.elements.arrow);
        this.elements.el.parentNode.appendChild(this.elements.underline);    
    
        // $(el).find('a').hover(this._over.bind(this), this._out.bind(this));
        $(this.elements.el).on('mouseenter', 'li', this._over.bind(this));
        $(this.elements.el).on('mouseleave', this._out.bind(this));

        this.selectMenuItem(this.elements.selected.data('section'), false);

        this.tl.seek('end');
        
        this.resize();
        document.getElementById('mainHeader').style.visibility = 'hidden';
    }

    function buildMenu (menuList) {

        for (var i = 0; i < menuList.length; i++)
        {
            var menuItem = menuList[i];
            if (menuItem.visible == 'false' || menuItem.comingSoon == 'true')
                continue;
            
            // ticketing widget & soundcloud api don't work for ie8
            if (document.documentElement.className.match('lt-ie9')) {
                if (menuItem.link === '#ticketing' || menuItem.link === '#soundtrack') {
                    continue;
                }
            }

            var btn = document.createElement('a');

            btn.className = 'mainMenuBtn';
            btn.setAttribute('data-type', menuItem.type);
            if (menuItem.type === 'external') {
                btn.setAttribute('target', '_blank');
            }
            btn.setAttribute('data-section', menuItem.link);
            btn.setAttribute('href', menuItem.link);
            btn.style.position = 'relative';
            btn.style.fontSize = menuItem["font-size"];
            
            btn.innerHTML = menuItem.label;
            for (var j = 0; j < FLOCK.app.dataSrc.sections.main.html.length; j++) {
                if (FLOCK.app.dataSrc.sections.main.html[j].ID === menuItem.label) {
                    btn.innerHTML = FLOCK.app.dataSrc.sections.main.html[j].VAL;
                }
            };
            // btn.innerHTML = $.grep(FLOCK.app.dataSrc.sections.main.html, function(e) { return e.ID == menuItem.label; })[0].VAL;

            var li = document.createElement('li');
            li.appendChild(btn);
            document.getElementById('menu').appendChild(li);
        }

    }

    function selectMenuItem (section_name, animate) {

        var selected = $(this.elements.el).find('a[data-section="' + section_name + '"]'),
            selected_offset = selected[0].parentNode.offsetTop + this.elements.el.offsetTop,
            selected_height = selected[0].parentNode.offsetHeight,
            arrow_anim = new TimelineLite();

        animate = true;

        if (isMobile) {
            $('#mainNav').removeClass('open');
        }

        this.elements.selected[0].className = '';
        this.elements.selected = selected;
        this.elements.selected[0].className = 'selected';

        if (animate === false) {
            this.elements.arrow.style.top = (selected_offset + (selected_height / 2)) + 'px';
            // this.elements.underline.style.top = selected_offset + 'px';
            // this.elements.underline.style.height = selected_height + 'px';
        } else {
            arrow_anim.to(this.elements.arrow, 0.25, {top: (selected_offset + (selected_height / 2)) + 'px', ease:Power4.easeOut }, 0);
            //        .to(this.elements.underline, 0.5, {top: selected_offset + 'px', height: selected_height + 'px', ease:Power4.easeOut }, 0);
        }

    }

    function over (e) {

        var item_offset = e.currentTarget.offsetTop + this.elements.el.offsetTop,
            item_height = $(e.currentTarget).height();

        TweenLite.to(this.elements.arrow, this.settings.duration, {top: (item_offset + (item_height / 2)) + 'px', ease: this.settings.ease });

    }

    function out (e) {
        console.log('OUT');
        
        var selected_offset = this.elements.selected[0].parentNode.offsetTop + this.elements.el.offsetTop,
            selected_height = this.elements.selected[0].parentNode.offsetHeight;

        TweenLite.to(this.elements.arrow, this.settings.duration, {top: (selected_offset + (selected_height / 2)) + 'px', ease: this.settings.ease }, 0);
    }

    function hide (hide) {
        if (this.isHidden === true) {
            return;
        }

        if (hide === 'all') {
            this.hideAll = true;
        } else {
            this.hideAll = false;
        }

        this.isHidden = true;
        this.tl.play();
    }

    function show (show) {
        if (this.isHidden === false) {
            if (show === 'bars') {
                this.hide();
            }
            return;
        }

        document.getElementById('mainHeader').style.visibility = 'visible';

        if (show === 'bars') {
            this.showAll = false;
        } else {
            this.showAll = true;
            this.isHidden = false;
        }

        this.tl.reverse();
    }

    function resize () {
        if (this.elements === undefined) {
            return;
        }

        var selected_offset = this.elements.selected[0].parentNode.offsetTop + this.elements.el.offsetTop,
            selected_height = this.elements.selected[0].parentNode.offsetHeight,
            menu_height = this.elements.el.offsetHeight,
            wrapper_height = menu_height + 120,
            window_height = FLOCK.settings.window_dimensions.height;

        this.elements.wrapper.style.height = wrapper_height + 'px';
        //this.elements.wrapper.style.top = ((window_height / 2) - (wrapper_height / 2) - 20) + 'px';

        var hashtag = document.getElementById('hashtag'),
            centeredtop = (window_height / 2) - (wrapper_height / 2) - 20,
            menutop = centeredtop;
        if (hashtag) {
            if (hashtag.offsetTop > 0) {
                menutop = Math.max(0, Math.min(hashtag.offsetTop - wrapper_height - 20, centeredtop));
            }
        }

        this.elements.header.style.top = menutop + 'px';

        this.elements.arrow.style.top = (selected_offset + (selected_height / 2)) + 'px';
        this.elements.underline.style.top = selected_offset + 'px';
        this.elements.underline.style.height = selected_height + 'px';

        // pass the amount of space between the bottom of the menu and the bottom of the screen to resize title treatment
        // FLOCK.app.TitleTreatment.resize(window_height / 2 - menu_height / 2);

        return $('#menu').width();
    }

    MainMenu.prototype._over = over;
    MainMenu.prototype._out = out;

    MainMenu.prototype.init = init;
    MainMenu.prototype.hide = hide;
    MainMenu.prototype.show = show;
    MainMenu.prototype.buildMenu = buildMenu;
    MainMenu.prototype.resize = resize;
    MainMenu.prototype.selectMenuItem = selectMenuItem;

    return new MainMenu();
}));