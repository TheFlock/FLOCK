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
                'FLOCK/classes/Menu',
                'greensock/TweenLite.min',
                'greensock/easing/EasePack.min',
                'greensock/plugins/CSSPlugin.min'
            ], function () {
            return (root.classes.Shell = factory());
        });
    } else {
        root.classes.Shell = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

    'use strict';

    var Shell = function (el) {
        this.elements = {
            shell: $('#shell'),
            window: $(window)
        }
    }

    function init(callbackFn) {
        console.log('Shell Init');
        var sectionOBJ = FLOCK.utils.SectionLoader.returnSectionOBJ('main');

        // add html to page
        $('#shell').append($(sectionOBJ.htmlData));

        window.requestAnimationFrame(function(){
            this.ready(callbackFn);
        }.bind(this));
    }

    function ready(callbackFn){
        console.log('Shell ready');
        this.initialized = true;


        FLOCK.app.Footer.init(document.getElementById('footer'));

        if (FLOCK.app.navigation.current_section !== 'videos') {
            FLOCK.app.Footer.show();
        }

        this.setupMenu();
        this.resize();

        callbackFn();
    }

    function setupMenu(){

        // create menu
        var menuData = {
            menuID: 'menu',
            wrapperID: 'mainHeader',
            paginatorElID: 'mainNav',
            menuStyle: FLOCK.app.dataSrc.sections.main.data.menu.menuStyle,
            menuList: FLOCK.app.dataSrc.sections.main.data.menu.links
        };
        var menuTemplate = document.getElementById('menuTemplate');
        if(menuTemplate)menuData.template = menuTemplate.innerHTML;
        FLOCK.app.mainMenu = new FLOCK.classes.Menu(menuData);

        FLOCK.app.mainMenu.init(FLOCK.app.navigation.current_section);

        // setup menu clicks
        $('#menu').on('click', 'a', function (e) {

            // for links defined as external in json
            if (this.getAttribute('target') === '_blank') {
                return;
            }

            var section_name = $(this).data('section');

            if (this.getAttribute('data-type') === 'overlay') {
                FLOCK.functions.showOverlay(section_name);
            } else {
                // FLOCK.app.main.changeSection(section_name);
                FLOCK.app.navigation.changeSection(section_name);
            }

            // e.preventDefault();
            return false;
        });
    }

    function resize(){
        if(!this.initialized)return;

        var w, h;

        FLOCK.settings.window_dimensions = {
            width: this.elements.window.width(),
            height: this.elements.window.height()
        }

        w = Math.max(FLOCK.settings.min_width, FLOCK.settings.window_dimensions.width),
        h = Math.max(FLOCK.settings.min_height, FLOCK.settings.window_dimensions.height);

        this.elements.shell[0].style.width = w + 'px';

        if (!document.documentElement.className.match(/^(?=.*\bipad\b)(?=.*\bios7\b)/)) {
            this.elements.shell[0].style.height = h + 'px';
        }

        if (FLOCK.app.mainMenu && FLOCK.app.mainMenu.elements) {
            FLOCK.settings.menu_width = FLOCK.app.mainMenu.elements.el.offsetWidth;
        }

        /**
        * Portrait messaging
        */
        if (FLOCK.settings.isAndroid || FLOCK.settings.isMobile || FLOCK.settings.isIOS){
            var main_mobileHorizontal = (w>h)?true:false;
            var portraitDiv = document.getElementById('portraitTest');
            // alert(portraitDiv);
            // alert(main_mobileHorizontal);

            if (portraitDiv) {
                // alert(main_mobileHorizontal);
                if(!main_mobileHorizontal){
                    portraitDiv.style.display = 'block';
                } else {
                    portraitDiv.style.display = 'none';
                    if (FLOCK.settings.isIpad) {
                        h = FLOCK.settings.window_dimensions.height = 672;
                    }
                }
            }

            //double check that zooming hasn't messup dimensions, if so correct the dimensions
            if(w != 1000){
                h = h*(1000/w);
                w = 1000;
            }
        }

        FLOCK.settings.sectionWidth = w;

        if (FLOCK.app.BGRenderer) {
            FLOCK.app.BGRenderer.resize();
        }

        if (FLOCK.sections[FLOCK.app.navigation.current_section]) {
            if (FLOCK.sections[FLOCK.app.navigation.current_section].initialized) {
                FLOCK.sections[FLOCK.app.navigation.current_section].resize(w, h);
            }
        }

        if (FLOCK.app.mainMenu) {
            FLOCK.settings.menu_width = FLOCK.app.mainMenu.resize();
        }

        if (FLOCK.settings.window_dimensions.width < FLOCK.settings.min_width || FLOCK.settings.window_dimensions.height < FLOCK.settings.min_height) {
            this.elements.shell[0].style.position = 'absolute';
        } else {
            this.elements.shell[0].style.position = 'fixed';
        }

    }

    Shell.prototype.init = init;
    Shell.prototype.ready = ready;
    Shell.prototype.setupMenu = setupMenu;
    Shell.prototype.resize = resize;

    return Shell;
}));
