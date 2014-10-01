// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'soundmanager/soundmanager2',
            ], function () {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (root.classes.Sound = factory());
        });
    } else {

        root.classes.Sound = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

        var myName,
            that,
            data;

        function Sound() {

            if (typeof soundManager !== 'undefined') {
                soundManager.audioFormats = {

                    /**
                    * determines HTML5 support + flash requirements.
                    * if no support (via flash/HTML5) for "required" format, SM2 will fail to start.
                    * flash fallback is used for MP3 or MP4 if lacking HTML5 (or preferFlash = true)
                    * multiple MIME types may be tried looking for positive canPlayType() response.
                    */

                    'mp3': {
                        'type': ['audio/mpeg; codecs="mp3"', 'audio/mpeg', 'audio/mp3', 'audio/MPA', 'audio/mpa-robust'],
                        'required': false
                    },

                    'mp4': {
                        'related': ['aac','m4a'], // additional formats under the MP4 container
                        'type': ['audio/mp4; codecs="mp4a.40.2"', 'audio/aac', 'audio/x-m4a', 'audio/MP4A-LATM', 'audio/mpeg4-generic'],
                        'required': false
                    },

                    'ogg': {
                        'type': ['audio/ogg; codecs=vorbis'],
                        'required': false
                    },

                    'wav': {
                        'type': ['audio/wav; codecs="1"', 'audio/wav', 'audio/wave', 'audio/x-wav'],
                        'required': false
                    }

                };

                soundManager.setup({
                    url: 'swf/',
                    useHTML5Audio: true,
                    debugMode: false,
                    debugFlash: false,
                    preferFlash: false,
                    onready: function () {
                        score = soundManager.createSound({
                            id: 'score',
                            url: [FLOCK.settings.base_url + 'audio/this_is_not_the_end.mp3'],
                            autoLoad: true,
                            autoPlay: false,
                            onload: function() {
                                console.log('LOAD');
                                // console.log('The sound '+this.id+' loaded!');
                            }
                        });

                    }
                });
            }

            if (FLOCK.settings.isIpad) {
                $('#sound_button').removeClass('sound-on');
            }

            $('#sound_button').on('click', function (e) {
                e.preventDefault();

                $(this).toggleClass('sound-on');
                if ($(this).hasClass('sound-on')) {
                    FLOCK.functions.playSound();
                } else {
                    FLOCK.functions.pauseSound();
                }
            });

            $('body').on('click', 'a', function (e) {
                if (this.getAttribute('target') === '_blank') {
                    $('#sound_button').removeClass('sound-on');
                    FLOCK.functions.pauseSound();
                }

                if (this.getAttribute('data-type') === 'overlay') {
                    FLOCK.functions.showOverlay(this.getAttribute('href'));
                    return false;
                }
            });


        }

        return new Sound();
}));
