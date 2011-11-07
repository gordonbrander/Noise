/* Quickly define constructor functions using object-literal syntax. */ 
var __def = function(details){
    details.constructor.prototype = details;
    return details.constructor;
};

exports.__def = __def;