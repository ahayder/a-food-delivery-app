angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'appCtrl'
    })

    .state('app.my-account', {
      url: '/my-account',
      views: {
        'side-menu': {
          templateUrl: 'templates/my-account.html',
          controller: 'myAccountCtrl'
        }
      }
    })

    .state('app.addresses', {
      url: '/addresses',
      cache:false,
      views: {
        'side-menu': {
          templateUrl: 'templates/address/addresses.html',
          controller: 'addressesCtrl'
        }
      }
    })

    // Single address

    .state('app.address', {
      url: '/address',
      views: {
        'side-menu': {
          templateUrl: 'templates/address/address.html',
          controller: 'addressCtrl'
        }
      }
    })

    // .state('app.payments', {
    //   url: '/payments',
    //   views: {
    //     'side-menu': {
    //       templateUrl: 'templates/payment/payments.html',
    //       controller: 'paymentsCtrl'
    //     }
    //   }
    // })

    .state('app.payment', {
      url: '/payment',
      views: {
        'side-menu': {
          templateUrl: 'templates/payment/payment.html',
          controller: 'paymentCtrl'
        }
      }
    })

    .state('app.invite-friends', {
      url: '/invite-friends',
      views: {
        'side-menu': {
          templateUrl: 'templates/invite-friends.html',
          controller: 'inviteFriendsCtrl'
        }
      }
    })

    .state('app.favourite', {
      url: '/favourite',
      views: {
        'side-menu': {
          templateUrl: 'templates/favourite.html',
          controller: 'favouriteCtrl'
        }
      }
    })

    .state('app.order-history', {
      url: '/order-history',
      cache:false,
      views: {
        'side-menu': {
          templateUrl: 'templates/order-history.html',
          controller: 'orderHistoryCtrl'
        }
      }
    })

    .state('app.login', {
      url: '/login',
      views: {
        'side-menu': {
          templateUrl: 'templates/login.html',
          controller: 'loginCtrl'
        }
      }
    })      
        
    .state('app.signup', {
      url: '/signup',
      views: {
        'side-menu': {
          templateUrl: 'templates/signup.html',
          controller: 'signupCtrl'
        }
      }
    })


    .state('app.searchResult', {
      url: '/searchResult',
      views: {
        'side-menu': {
          templateUrl: 'templates/search/search-result.html',
          controller: 'searchResultCtrl'
        }
      }
    })


    .state('app.foods', {
      url: '/foods/:restaurantId',
      views: {
        'side-menu': {
          templateUrl: 'templates/search/foods.html',
          controller: 'foodsCtrl'
        }
      }
    })


    .state('app.moreInfo', {
      url: '/moreInfo/:restaurantId',
      views: {
        'side-menu': {
          templateUrl: 'templates/search/more-info.html',
          controller: 'moreInfoCtrl'
        }
      }
    })

    .state('app.cart', {
      url: '/cart',
      cache: false,
      views: {
        'side-menu': {
          templateUrl: 'templates/cart.html',
           controller: 'cartCtrl'
        }
      }
    });
      
    

  // if none of the above states are matched, use this as the fallback
   $urlRouterProvider.otherwise('app/searchResult');

});