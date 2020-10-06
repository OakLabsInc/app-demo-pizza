window.oak.disableZoom()

window.reload = function () {
  window.oak.reload()
}

function touchHandler(event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;        
        case "touchend":   type = "mouseup";   break;
        case "touchcancel":   type = "mouseup";   break;
        default:           return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //                screenX, screenY, clientX, clientY, ctrlKey, 
    //                altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                  first.screenX, first.screenY, 
                                  first.clientX, first.clientY, false, 
                                  false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function init() 
{
    document.addEventListener("touchstart", touchHandler, { passive: false, capture: true });
    document.addEventListener("touchmove", touchHandler, { passive: false, capture: true });
    document.addEventListener("touchend", touchHandler, { passive: false, capture: true });
    document.addEventListener("touchcancel", touchHandler, { passive: false, capture: true }); 

}
init()
var app = window.angular
  .module('demoApp', ['ngMaterial', 'ngMessages'])
  .constant('oak', window.oak)
  .constant('_', window._)
  .constant('epson', window.epson)
  .run(function ($rootScope) {
    $rootScope._ = window.lodash
  })
  .config(function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['self'])
  })
  .filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + 
      input.substr(1).toLowerCase() : '';
    }
  })
  .filter('deslug', function() {
    return function(input) {
      return input.replace("_"," ")
    }
  })