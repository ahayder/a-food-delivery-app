
angular.module('app',
  ['ionic',
  'app.appCtrl',
  'app.addressCtrl',
  'app.addressesCtrl',
  'app.cartCtrl',
  'app.favouriteCtrl',
  'app.foodCtrl',
  'app.inviteFriendsCtrl',
  'app.loginCtrl',
  'app.moreInfoCtrl',
  'app.myAccountCtrl',
  'app.myProfileCtrl',
  'app.orderHistoryCtrl',
  'app.orderStatusCtrl',
  'app.paymentCtrl',
  'app.searchCtrl',
  'app.signupCtrl',
  'app.routes',
  'app.services',
  'app.directives',
  'ngCordova',
  'ngOpenFB',
  'google.places',
  'ngResource'])

.run(function($ionicPlatform,ngFB) {
   ngFB.init({appId: '577646735745723'});
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
