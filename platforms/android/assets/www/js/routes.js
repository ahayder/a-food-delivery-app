angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
      
    .state('tabs', {
      url: '/tabs',
      abstract:true,
      templateUrl: 'templates/tabsController.html'
    })

    .state('tabs.search', {
      url: '/search',
      views: {
        'tab1': {
          templateUrl: 'templates/search.html',
          controller: 'searchCtrl'
        }
      }
    })


    .state('tabs.order', {
      url: '/order',
      views: {
        'tab2': {
          templateUrl: 'templates/order.html',
          controller: 'orderCtrl'
        }
      }
    })
        
      
        
    .state('tabs.cart', {
      url: '/cart',
      views: {
        'tab2': {
          templateUrl: 'templates/cart.html',
          controller: 'cartCtrl'
        }
      }
    })
      
      
        
    .state('menu.login', {
      url: '/login',
      views: {
        'side-menu': {
          templateUrl: 'templates/login.html',
          controller: 'loginCtrl'
        }
      }
    })
           
      
        
    .state('menu.signup', {
      url: '/signup',
      views: {
        'side-menu': {
          templateUrl: 'templates/signup.html',
          controller: 'signupCtrl'
        }
      }
    })
        
         
      
    .state('menu', {
      url: '/side-menu',
      abstract:true,
      templateUrl: 'templates/menu.html',
      onEnter: function($state){
        var loggedIn = window.localStorage['loggedIn'] || false;
        if(loggedIn){
           $state.go("tabs.order");
        }
      }
    })
      
    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/side-menu/login');

});