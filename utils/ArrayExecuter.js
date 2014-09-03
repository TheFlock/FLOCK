// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.utils = root.utils || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
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
    --------------------------------------------------------------------------------------------------------------------
    */ 

    var ArrayExecuter = function () {
        this.task_arr = [];
    }

    ArrayExecuter.prototype = {
        //Exectutes an array of functions
        //If this is called and another array is currently executing, then
        //the new set of functions will run before finishing the previous set
        execute: function (arr) {
            arr.reverse();

            for (var i = 0; i < arr.length; i++) {
                if (arr[i]) {
                    this.task_arr.unshift(arr[i]);
                }
            }

            this.runStep('');
        },
        tackOn: function (arr) {
            for (var i=0; i<arr.length; i++) {
                this.task_arr.push(arr[i]);
            }
            
            // trace('///// arrayExecuter_tackOn: length: '+task_arr.length+' /////');
            
            this.runStep('');
        },
        runFunctionInScope: function (arr) {
            var obj = arr[0];
            var function_name = arr[1];
            var optionalVars = (arr.length >2)?arr[2]:null;
            
            if (arr.length >2) {  
                obj[function_name](arr[2]);
            } else {
                obj[function_name]();
            }
        },
        runStep: function (args) {

            if (this.task_arr.length == 0)return;
            
            var step = this.task_arr.shift();
            var funct = step.fn;

            step.scope = step.scope || this;
            step.vars = step.vars || [];
            
            if (typeof step.vars === "string") {
                step.vars = [step.vars];
            } 

            funct.apply(step.scope, step.vars);
        },
        stepComplete: function (args) {
            // var that = this;
            // trace('///// arrayExecuter: stepComplete /////');

            if (this.task_arr.length > 0) {
                window.requestAnimationFrame(this.runStep.bind(this));      
                // setTimeout(function(){
                //     ();
                // }, 60);
            }

        },
        stepComplete_instant: function (args) {
            // trace('///// arrayExecuter: stepComplete_instant /////');

            if (this.task_arr.length > 0) {
                this.runStep();
            }
        },
        clearArrayExecuter: function () {
            this.task_arr = [];
        }
    }

    return ArrayExecuter;
}));