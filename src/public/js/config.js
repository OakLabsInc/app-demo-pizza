window.oak.disableZoom()

window.reload = function () {
  window.oak.reload()
}

var app = window.angular
  .module('demoApp', ['ngMaterial', 'ngMessages'])
  .constant('oak', window.oak)
  .constant('_', window._)
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