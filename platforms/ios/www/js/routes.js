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


      
  

    // Tabs
    
    .state('app.tabs', {
      url: '/tabs',
      abstract: true,
      views: {
        'side-menu': {
          templateUrl: 'templates/tabs.html'
        }
      }
    })

    // .state('app.tabs.search', {
    //   url: '/search',
    //   views: {
    //     'search-tab': {
    //       templateUrl: 'templates/search/search.html',
    //       controller: 'searchCtrl'
    //     }
    //   }
    // })

    .state('app.tabs.searchResult', {
      url: '/searchResult',
      views: {
        'search-tab': {
          templateUrl: 'templates/search/search-result.html',
          controller: 'searchResultCtrl'
        }
      }
    })


    .state('app.tabs.foods', {
      url: '/foods/:restaurantId',
      views: {
        'search-tab': {
          templateUrl: 'templates/search/foods.html',
          controller: 'foodsCtrl'
        }
      }
    })


    // .state('app.tabs.order', {
    //   url: '/order',
    //   views: {
    //     'order-tab': {
    //       templateUrl: 'templates/order.html',
    //       controller: 'orderCtrl'
    //     }
    //   }
    // })
    .state('app.tabs.cart', {
      url: '/cart',
      cache: false,
      views: {
        'cart-tab': {
          templateUrl: 'templates/cart.html',
           controller: 'cartCtrl'
        }
      }
    });
      
    

  // if none of the above states are matched, use this as the fallback
   $urlRouterProvider.otherwise('app/tabs/searchResult');

});