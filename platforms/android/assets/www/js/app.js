
angular.module('app', ['ionic', 'app.foodCtrl', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function(LocalStorageFactory) {

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    window.localStorage['cartInfo'] = "";

  });
})

.config(function($cordovaFacebookProvider) {
    var appID = 577646735745723;
    var version = "v2.5"; // or leave blank and default is v2.0
    $cordovaFacebookProvider.browserInit(appID, version);
})
// Capitalize the first character
.filter('capitalize', function() {
  return function(input, scope) {
    if (input!=null)
    input = input.toLowerCase();
    return input.substring(0,1).toUpperCase()+input.substring(1);
  }
})

// Convert strings to number
.filter('num', function() {
    return function(input) {
      return parseInt(input, 10);
    };
});