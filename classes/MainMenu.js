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
                'greensock/TimelineLite.min',
                'greensock/easing/EasePack.min',
                'greensock/plugins/CSSPlugin.min'
            ], function () {
            return (root.classes.MainMenu = factory());
        });
    } else {
        root.classes.MainMenu = factory();
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
            header: document.getElementById('mainHeader')
        };

        this.elements.listItems = this.elements.el.getElementsByTagName('li');

        this.elements.wrapper = this.elements.el.parentNode;
        this.elements.selected = $('#menu a[data-section="' + current_section + '"]').addClass('selected')

        // $(el).find('a').hover(this._over.bind(this), this._out.bind(this));
        $(this.elements.el).on('mouseenter', 'li', this._over.bind(this));
        $(this.elements.el).on('mouseleave', this._out.bind(this));

        this.selectMenuItem(this.elements.selected.data('section'), false);

        this.resize();

    }

    function buildMenu (menuList) {

        for (var i = 0; i < menuList.length; i++)
        {
            var menuItem = menuList[i];
            if (menuItem.visible == 'false' || menuItem.comingSoon == 'true')
                continue;

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

        var selected = $(this.elements.el).find('a[data-section="' + section_name + '"]');

        animate = true;

        if (isMobile) {
            $('#mainNav').removeClass('open');
        }

        this.elements.selected[0].className = '';
        this.elements.selected = selected;
        this.elements.selected[0].className = 'selected';

    }

    function over (e) {

        var item_offset = e.currentTarget.offsetTop + this.elements.el.offsetTop,
            item_height = $(e.currentTarget).height();
    }

    function out (e) {
        console.log('OUT');
        
        var selected_offset = this.elements.selected[0].parentNode.offsetTop + this.elements.el.offsetTop,
            selected_height = this.elements.selected[0].parentNode.offsetHeight;
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