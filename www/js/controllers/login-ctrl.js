angular.module('app.loginCtrl', [])

// Login and signup using facebook ctrl
.controller('loginCtrl', function($scope, UsersFactory, $ionicPopup, $state, $rootScope, $timeout, $ionicHistory, $q, $ionicLoading) {

    $scope.logoutMessage = false;
    $scope.login1 = true;


    $scope.login = function(user) {

        UsersFactory.login(user.email, user.password).then(function(response) {
            //console.log(localStorage.getItem('userId'));
            var userInfo = response.data;

            if (userInfo.length == 0) {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'The email or password mismatched'
                });
            } else {

                if (localStorage.getItem('userId') != userInfo[0].cus_id) {

                    console.log('no match');
                    localStorage.removeItem('cartInfo');
                    console.log(localStorage.getItem('cartInfo'));

                }

                localStorage.setItem('userId', userInfo[0].cus_id);


                //Saving variables to use later
                //$rootScope.login = false;
                $scope.login1 = false;
                window.localStorage['loggedIn'] = "true";
                window.localStorage['loggedInUserInofos'] = JSON.stringify(userInfo);
                // without timeout menu ng-show doesn't work
                //$state.go("app.search");
                if (localStorage.getItem('resId') == null) {
                    $state.go("app.search");
                    $rootScope.login = false;
                } else {

                    // disabeling the back button in the next page
                    $ionicHistory.nextViewOptions({
                      disableAnimate: true,
                      disableBack: true
                    });
                    $state.go("app.search", {

                        restaurantId: JSON.parse(localStorage.getItem('resId'))
                    });
                    $rootScope.login = false;
                }

            }

        }, function(error) {
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Opps! there was a problem' + error.message
            });
        });
    }





///////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
//                                              ALL ABOUT FB
//                                                  LOGIC
//
//          If user is loggin in for the first time then we savor is maing signup the user by saving
//          user's email, name & FBid to savor Database. And also immedietely making the user login.
//          Savor is using only the email address, & the FBid for the credentials of the user as 
//          login credentials.          
//
//          If the user already allow Savor from FB then Savor will just take the users email address
//          and FBuserId and make the user login.
//
//
//
//
//
//
////////////////////////////////////////////////////////////////////////////////////////////////////////







    $scope.loginWithFB = function(info) {

        UsersFactory.loginWithFacebook(info).then(function(response) {
            //console.log(localStorage.getItem('userId'));
            var userInfo = response.data;

            if (userInfo.length == 0) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Something Wrong, please try agin'
                });
            } else {

                if (localStorage.getItem('userId') != userInfo[0].cus_id) {

                    console.log('no match');
                    localStorage.removeItem('cartInfo');
                    console.log(localStorage.getItem('cartInfo'));

                }

                localStorage.setItem('userId', userInfo[0].cus_id);


                //Saving variables to use later
                //$rootScope.login = false;
                $scope.login1 = false;
                window.localStorage['loggedIn'] = "true";
                window.localStorage['loggedInUserInofos'] = JSON.stringify(userInfo);
                // without timeout menu ng-show doesn't work
                //$state.go("app.search");
                if (localStorage.getItem('resId') == null) {
                    $state.go("app.search");
                    $rootScope.login = false;
                    $ionicLoading.hide();
                } else {

                    // disabeling the back button in the next page
                    $ionicHistory.nextViewOptions({
                      disableAnimate: true,
                      disableBack: true
                    });
                    $state.go("app.search", {

                        restaurantId: JSON.parse(localStorage.getItem('resId'))
                    });
                    $rootScope.login = false;
                    $ionicLoading.hide();
                }

            }

        }, function(error) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Opps! there was a problem this is from log in with FB ' + JSON.stringify(error)
            });
        });
    }











    $scope.savorFbSignUp = function(info) {

        UsersFactory.signupWithFB(info).then(function(response){
            $scope.loginWithFB(info);
            
        }, function(error){
            //console.log("https://savor365.com/api/signupWithFB?name="+info.name+"&email="+info.email+"&fbId="+info.fbUserId);
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error',
                template: 'The login was not successful, error: ' + error.message
            });
        });
    }



    ////////////////////////////////// NATIVE FB LOGIN ///////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////


    // This method is to get the user profile info from the facebook api
    var getFacebookProfileInfo = function (authResponse) {
        var info = $q.defer();

        facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
          function (response) {
                    console.log(response);
            info.resolve(response);
          },
          function (response) {
                    console.log(response);
            info.reject(response);
          }
        );
        return info.promise;
    };


    // This is the success callback from the login method
    var fbLoginSuccess = function(response) {
        
        if (!response.authResponse){
          fbLoginError("Cannot find the authResponse");
          return;
        }

        var authResponse = response.authResponse;

        getFacebookProfileInfo(authResponse)
        .then(function(profileInfo) {
            // Temporary for our system
            var fbData = {};
            fbData.name = profileInfo.name;
            fbData.email = profileInfo.email;
            fbData.fbId = profileInfo.id;
            $scope.savorFbSignUp(fbData);
        }, function(fail){
          // Fail get profile info
          console.log('profile info fail', fail);
          $ionicPopup.alert({
                title: 'Error!',
                template: 'Can\'t get your profile info from FB for the error ' + fail.message
            });
        });
    };

    // This is the fail callback from the login method
    var fbLoginError = function(error){
        console.log('fbLoginError', error);
        $ionicPopup.alert({
            title: 'Error!',
            template: 'FB Login in error' + error.message
        });
        $ionicLoading.hide();
    };

    //This method is executed when the user press the "Login with facebook" button
    $scope.facebookSignIn = function() {

        facebookConnectPlugin.getLoginStatus(function(success){
            // if the app is already connected to FB
            if(success.status == 'connected'){

                var authResponse = success.authResponse;

                getFacebookProfileInfo(authResponse)
                .then(function(profileInfo) {

                    $ionicLoading.show({
                      template: 'Logging in...'
                    });

                    // Temporary for our system
                    var fbData = {};
                    fbData.name = profileInfo.name;
                    fbData.email = profileInfo.email;
                    fbData.fbId = profileInfo.id;
                    // Saving the auth response access token
                    $scope.loginWithFB(fbData);

                }, function(fail){
                    //fail get profile info
                    console.log('profile info fail', fail);
                    $ionicPopup.alert({
                        title: 'Error!',
                        template: 'Can\'t get your profile info from FB for the error ' + fail.message
                    });
                });

            }
            else {
                //if (success.status === 'not_authorized') the user is logged in to Facebook, but has not authenticated your app
                //else The person is not logged into Facebook, so we're not sure if they are logged into this app or not.
                console.log('getLoginStatus', success.status);

                $ionicLoading.show({
                  template: 'Logging in...'
                });

                //ask the permissions you need. You can learn more about FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
                facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);

            }

        });



    };




    ////////////////////////////////// END OF NATIVE FB LOGIN ///////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////












});
