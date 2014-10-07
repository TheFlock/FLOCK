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
                'FLOCK/classes/MenuPaginator',
                'greensock/TweenLite.min',
                'greensock/TimelineLite.min',
                'greensock/easing/EasePack.min',
                'greensock/plugins/CSSPlugin.min'
            ], function ($, Mustache) {
            return (root.classes.Menu = factory($, Mustache));
        });
    } else {
        root.classes.Menu = factory($, Mustache);
    }
}(window.FLOCK = window.FLOCK || {}, function ($, Mustache) {

    'use strict';

    var isMobile = FLOCK.utils.DeviceDetect.isMobile;
    var that;

    var Menu = function (data) {
        this.menuID = data.menuID || '';
        this.verbose = false;

        that = this;

        this.template = (data.template)?data.template:'<a rel="{{{rel}}}" class="{{{className}}}" data-type="{{{type}}}" data-section="{{{link}}}" href="{{{link}}}" target="{{{target}}}" style="position: {{{position}}}; font-size: {{{font-size}}};">{{{label}}}</a>';

        this.elements = {
            el: document.getElementById(data.menuID),
            wrapper: document.getElementById(data.wrapperID),
            paginatorEl: document.getElementById(data.paginatorElID)
        }

        this.menuList = data.menuList;
        this.menuStyle = data.menuStyle;

        if (data.menuList) {
            this.buildMenu();
        }
    }

    function init (current_section) {
        if(this.verbose)console.log('Main Menu | '+this.menuID+' | init');

        this.isHidden = false;

        this.elements.listItems = this.elements.el.getElementsByTagName('li');
        this.elements.selected = $('#menu a[data-section="' + current_section + '"]').addClass('selected')

        this.selectMenuItem(this.elements.selected.data('section'), false);

        this.resize();

    }

    function buildMenu () {
        if(this.verbose)console.log('Main Menu | '+this.menuID+' | buildMenu');

        switch (this.menuStyle) {
            case 'vertical':
                buildVerticalMenu.call(this, this.menuList);
                break;
            case 'horizontal':
                this.menuStyle = 'horizontal';
                buildHorizontalMenu.call(this, this.menuList);
                break;
            default:
                buildVerticalMenu.call(this, this.menuList);
        }

    }

    function buildVerticalMenu (menuList) {

        for (var i = 0; i < menuList.length; i++)
        {
            var menuItem = menuList[i];
            if (String(menuItem.visible).toLowerCase() == 'false' || menuItem.comingSoon == 'true')
                continue;

            var btnData = {},
                popUp = false;

            menuItem.className = 'mainMenuBtn';

            // btnData.dataType = menuItem.type;
            if (menuItem.type === 'external') {
                menuItem.target = '_blank';
            }else if (menuItem.type === "popup") {
                popUp = true;
                menuItem.rel = menuItem.link+","+menuItem["popupw"]+","+menuItem["popuph"];
            }

            // btnData.dataSection = menuItem.link;
            // btnData.href = menuItem.link;

            // btnData.fontSize = menuItem["font-size"];

            // btnData.label = menuItem.label;
            for (var j = 0; j < FLOCK.app.dataSrc.sections.main.html.length; j++) {
                if (FLOCK.app.dataSrc.sections.main.html[j].ID === menuItem.label) {
                    menuItem.label = FLOCK.app.dataSrc.sections.main.html[j].VAL;
                }
            };
            // btn.innerHTML = $.grep(FLOCK.app.dataSrc.sections.main.html, function(e) { return e.ID == menuItem.label; })[0].VAL;

            var btn = $(Mustache.render(this.template, menuItem));
            if(popUp)btn.click(menu_openPopUp);

            var li = document.createElement('li');
            li.appendChild(btn.get()[0]);
            this.elements.el.appendChild(li);
        }
    }

    function buildHorizontalMenu (menuList) {

        // var menuID = "menu";
        //var menuElem = document.getElementById(menuID);
        // var header = document.getElementById('mainHeader');
        this.elements.wrapper.className = 'horizontal ' + this.elements.wrapper.className;

        this.elements.el.className = 'centeredMenu';

        this.elements.paginatorEl.className = 'paginatorWrapper';

        var firstBtn = true;

        for(var i = 0; i < menuList.length; i++){
            var menuItem = menuList[i];
            if (String(menuItem.visible).toLowerCase() == 'false' || menuItem.comingSoon == 'true')
                continue;

            if(!firstBtn){
                // var newDot = document.createElement('li');
                // newDot.className = "menu_dot";
                // menuElem.appendChild(newDot);
            } else {firstBtn = false;};

            var btnData = {},
                popUp = false;

            menuItem.className = 'mainMenuBtn';

            // btnData.dataType = menuItem.type;
            if (menuItem.type === 'external') {
                menuItem.target = '_blank';
            }else if (menuItem.type === "popup") {
                popUp = true;
                menuItem.rel = menuItem.link+","+menuItem["popupw"]+","+menuItem["popuph"];
            }

            // btnData.dataSection = menuItem.link;
            // btnData.href = menuItem.link;

            // btnData.fontSize = menuItem["font-size"];

            // btnData.label = menuItem.label;
            for (var j = 0; j < FLOCK.app.dataSrc.sections.main.html.length; j++) {
                if (FLOCK.app.dataSrc.sections.main.html[j].ID === menuItem.label) {
                    menuItem.label = FLOCK.app.dataSrc.sections.main.html[j].VAL;
                }
            };
            // btn.innerHTML = $.grep(FLOCK.app.dataSrc.sections.main.html, function(e) { return e.ID == menuItem.label; })[0].VAL;

            var btn = $(Mustache.render(this.template, menuItem));
            if(popUp)btn.click(menu_openPopUp);

            var li = document.createElement('li');
            li.appendChild(btn.get()[0]);
            this.elements.el.appendChild(li);
        }

        this.menuPaginator = new FLOCK.classes.MenuPaginator({
            wrapper: this.elements.wrapper
        });
    }

    function selectMenuItem (section_name, animate) {
        if(this.verbose)console.log('Main Menu | '+this.menuID+' | selectMenuItem: '+section_name);

        var selected = $(this.elements.el).find('a[data-section="' + section_name + '"]');

        this.elements.selected[0].className = '';

        if (selected.length === 0) {
            return;
        }

        animate = true;

        if (isMobile) {
            // $('#mainNav').removeClass('open');
        }

        this.elements.selectedID = section_name;
        this.elements.selected = selected;
        this.elements.selected[0].className = 'selected';

    }

    function hide () {
        if(this.verbose)console.log('Main Menu | '+this.menuID+' | hide');

        if (this.isHidden === true) {
            return;
        }

        this.isHidden = true;

        switch (this.menuStyle) {
            case 'horizontal':
                TweenLite.to(this.elements.wrapper, 0.5, {y: -this.elements.wrapper.offsetHeight + 'px', ease: Power4.easeInOut});
                break;
            case 'vertical':
                break;
            default:
        }
    }

    function show (show) {
        if(this.verbose)console.log('Main Menu | '+this.menuID+' | show');

        if (this.isHidden === false) {
            return;
        }

        this.isHidden = false;

        document.getElementById('mainHeader').style.visibility = 'visible';

        switch (this.menuStyle) {
            case 'horizontal':
                TweenLite.to(this.elements.wrapper, 0.5, {y: '0px', ease: Power4.easeInOut});
                break;
            case 'vertical':
                break;
            default:
        }
    }

    function resize () {
        if (this.menuPaginator) {
            this.menuPaginator.resize(FLOCK.settings.window_dimensions.width, FLOCK.settings.window_dimensions.height);
        }

        if (this.elements === undefined) {
            return;
        }
    }

    Menu.prototype.init = init;
    Menu.prototype.hide = hide;
    Menu.prototype.show = show;
    Menu.prototype.buildMenu = buildMenu;
    Menu.prototype.resize = resize;
    Menu.prototype.selectMenuItem = selectMenuItem;

    return Menu;
}));
