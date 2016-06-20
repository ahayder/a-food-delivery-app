angular.module('app.appCtrl', [])

// Main ctrl
.controller('appCtrl', function($scope, $state, $rootScope, UsersFactory, CartFactory, $ionicActionSheet,$cordovaSocialSharing) {

  //Social sharing code Starts
  $scope.socialSharing = function(){
    $cordovaSocialSharing
              //.share(message, subject, file, link) // Share via native share sheet
              .share("message", "subject", "file", "link") // Share via native share sheet
              .then(function(result) {
              // Success!
              }, function(err) {
              // An error occured. Show a message to the user
              });

  }
  //Social sharing code ends above





    //ionic Action Sheet Starts below

    $scope.show = function() {

 // Show the action sheet
       var hideSheet = $ionicActionSheet.show({
         buttons: [
           { text: 'Delivery' },
           { text: 'Pickup' },
           { text: 'Dine in' }
         ],

         titleText: '<h4>Set you preference</h4>',
         cancelText: 'Cancel',
         cancel: function() {
              // add cancel code..
            },
         buttonClicked: function(index) {
           if(index===0){
              localStorage.setItem("userPreference", "Delivery");
           }else if(index===1){
              localStorage.setItem("userPreference", "Pick Up");
           }else{
              localStorage.setItem("userPreference", "Dine In");
           }

           return true;
         }
       });
     }();
//ionic Action sheet ends above



    $rootScope.login = true; // acctually it means false incase of ng-hide

    var loggedIn = window.localStorage['loggedIn'];

    if (loggedIn === "true") {
        $rootScope.login = false;
        $state.go("app.search"); //app.search
    } else {
        window.localStorage['loggedIn'] = "false";
        // $state.go("app.login");
        $state.go("app.search");
        $scope.logoutMessage = false;
    }

    $scope.logout = function() {

        window.localStorage['loggedIn'] = "false";
        window.localStorage['loggedInUserInofos'] = "";

        $scope.logoutMessage = true;
        $rootScope.login = true;
        $state.go("app.login");
    };




    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        // For showing the amount into cart icon
        var cart = CartFactory.getCartInfo();
        //console.log("From state ctrl");
        //console.log(cart);

        if(cart == undefined){
            $scope.cartTotal = 0.00;
        }
        else if(cart.length == 1){
            $scope.cartTotal = cart[0].totalPrice;
        }
        else{
            var total = 0;

            for(var i=0; i<cart.length; i++){

                total += cart[i].totalPrice;

            }

            $scope.cartTotal = total;
        }
        // End of For showing the amount into cart icon
    });


});
