// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.utils = root.utils || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'FLOCK/utils/ArrayExecutor'
        ], function () {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (root.utils.ArrayExecuter = factory());
        });
    } else {
        root.utils.ArrayExecuter = factory();
    }
}(window.FLOCK = window.FLOCK || {}, function () {

    /*
    --------------------------------------------------------------------------------------------------------------------
    arrayExecuter

    ArrayExecutor had a typo, this should make the corrected spelling backwards compatible
    --------------------------------------------------------------------------------------------------------------------
    */

    console.log('You are including the misspelled version of ArrayExecutor')

    var ArrayExecutor = FLOCK.utils.ArrayExecutor;

    return ArrayExecutor;
}));
