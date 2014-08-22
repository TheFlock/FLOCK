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
                'FLOCK/classes/MenuPaginator',
                'greensock/TweenLite.min',
                'greensock/TimelineLite.min',
                'greensock/easing/EasePack.min',
                'greensock/plugins/CSSPlugin.min'
            ], function () {
            return (root.classes.Menu = factory());
        });
    } else {
        root.classes.Menu = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

    'use strict';

    var isMobile = FLOCK.utils.DeviceDetect.isMobile;
    var that;

    var Menu = function (data) {
        console.log('main menu');
        that = this;

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

        this.isHidden = false;

        this.elements.listItems = this.elements.el.getElementsByTagName('li');
        this.elements.selected = $('#menu a[data-section="' + current_section + '"]').addClass('selected')

        this.selectMenuItem(this.elements.selected.data('section'), false);

        this.resize();

    }

    function buildMenu () {

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
            if(menuList[i].visible === false)continue;
            if(!firstBtn){
                // var newDot = document.createElement('li');
                // newDot.className = "menu_dot";
                // menuElem.appendChild(newDot);
            } else {firstBtn = false;};
            
            var newMenuEntry = document.createElement('li');
            var newMenuLink = document.createElement('a');
            newMenuLink.innerHTML = menuList[i].label;
            newMenuLink.setAttribute('data-section', menuList[i].link);
            newMenuLink.setAttribute('href', menuList[i].link);
            newMenuLink.style.fontSize = menuList[i]["font-size"];
            if(menuList[i].type === "external"){
                newMenuLink.target = "_blank";
            } else if(menuList[i].type === "popup") {
                newMenuLink.rel = menuList[i].link+","+menuList[i]["popupw"]+","+menuList[i]["popuph"];
                $(newMenuLink).click(menu_openPopUp);
            }
            
            newMenuEntry.appendChild(newMenuLink);
            this.elements.el.appendChild(newMenuEntry);
        }

        this.menuPaginator = new FLOCK.classes.MenuPaginator({
            wrapper: this.elements.wrapper
        });
    }

    function selectMenuItem (section_name, animate) {

        var selected = $(this.elements.el).find('a[data-section="' + section_name + '"]');

        animate = true;

        if (isMobile) {
            // $('#mainNav').removeClass('open');
        }

        this.elements.selected[0].className = '';
        this.elements.selected = selected;
        this.elements.selected[0].className = 'selected';

    }

    function hide () {

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