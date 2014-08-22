FLOCK = FLOCK || {};
FLOCK.utils = FLOCK.utils || {};

/**
* 'Holy Grail' classical inheritance pattern from Javascript Patterns by Stoyan Stefanov
*/
FLOCK.utils.inherit = (function () {
    var proxy = function () {};
    return function (child, parent) {
        proxy.prototype = parent.prototype;
        child.prototype = new proxy();
        child._super = parent.prototype;
        child.prototype.constructor = child;
    }
}());