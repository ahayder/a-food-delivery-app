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
                    title: 'Unsuccessful',
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
                title: 'Unsuccessful',
                template: 'Opps! there was a problem' + error.message
            });
        });
    }















    $scope.savorFbSignUp = function(data) {

        $scope.user = data;

        UsersFactory.signup(data).then(function(response) {

            UsersFactory.login($scope.user.email, $scope.user.password).then(function(response) {

                var userInfo = response.data;
                ////////////////////
                if (localStorage.getItem('userId') != userInfo[0].cus_id) {
                    localStorage.removeItem('cartInfo');
                }
                localStorage.setItem('userId', userInfo[0].cus_id);
                ////////////////////////
                UsersFactory.getAddresses(userInfo[0].cus_id).then(function(response) {
                    var addresses = response.data;
                    for (var i = 0; i < addresses.length; i++) {
                        if (addresses[i].adrs_type == 1) {
                            //alert(addresses[i]);
                            localStorage.setItem('defaultAddress', JSON.stringify(addresses[i]));
                            break;
                        }
                    }
                });

                if (userInfo.length == 0) {
                    $ionicPopup.alert({
                        title: 'Error!',
                        template: 'The email or password mismatched'
                    });
                } else {
                    //Saving variables to use later
                    //$rootScope.login = false;
                    $scope.login1 = false;
                    window.localStorage['loggedIn'] = "true";
                    window.localStorage['loggedInUserInofos'] = JSON.stringify(userInfo);
                    // without timeout menu ng-show doesn't work
                    if (localStorage.getItem('resId') == null) {
                        $ionicHistory.nextViewOptions({
                          disableBack: true
                        });
                        $state.go("app.search");
                        $rootScope.login = false;
                    } else {
                        $ionicHistory.nextViewOptions({
                          disableBack: true
                        });
                        $state.go("app.foods", {
                            restaurantId: JSON.parse(localStorage.getItem('resId'))
                        });
                        $rootScope.login = false;
                    }


                }

            }, function(error) {
                $ionicPopup.alert({
                    title: 'Unsuccessful',
                    template: 'Opps! there was a problem' + JSON.parse(error)
                });
            });


        }, function(error) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'The signup was not successful for this reason:' + JSON.parse(error)
            });
        });
    }

    // $scope.fbSignUp = function() {

    // //alert('hola');
    // $scope.data = {};
    // ngFB.login({
    //     scope: 'email'
    // }).then(
    //     function(response) {
    //         ngFB.api({
    //             path: '/me',
    //             params: {
    //                 fields: 'id,name,email'
    //             }
    //         }).then(
    //             function(user) {

    //                 var fbData = {};
    //                 fbData.name = user.name;
    //                 fbData.email = user.email;
    //                 fbData.password = "";
    //                 //fbData.mobile = user.mobile;
    //                 $scope.signUp(fbData);
    //             },
    //             function(error) {
    //                 alert('Facebook error: ' + error.error_description);
    //             });
    //     });
    // }







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
            // For the purpose of this example I will store user data on local storage
            // UserService.setUser({
            //   authResponse: authResponse,
            //           userID: profileInfo.id,
            //           name: profileInfo.name,
            //           email: profileInfo.email,
            //   picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
            // });
            // $ionicLoading.hide();
            // $state.go('app.home');

            // Temporary for our system
            var fbData = {};
            fbData.name = profileInfo.name;
            fbData.email = profileInfo.email;
            fbData.fbUserId = profileInfo.id;
            fbData.password = "";
            $scope.savorFbSignUp(fbData);
            $ionicLoading.hide();
        }, function(fail){
          // Fail get profile info
          console.log('profile info fail', fail);
        });
    };

    // This is the fail callback from the login method
    var fbLoginError = function(error){
        console.log('fbLoginError', error);
        $ionicLoading.hide();
    };

      //This method is executed when the user press the "Login with facebook" button
      $scope.facebookSignIn = function() {

        facebookConnectPlugin.getLoginStatus(function(success){
             if(success.status == 'connected'){
                // the user is logged in and has authenticated your app, and response.authResponse supplies
                // the user's ID, a valid access token, a signed request, and the time the access token
                // and signed request each expire
                //console.log('getLoginStatus', success.status);

                        //check if we have our user saved
                        //var user = UserService.getUser('facebook');
                        //alert(JSON.stringify(window.localStorage['loggedInUserInofos']));
                        //if(!user.userID)
                        //{
                            getFacebookProfileInfo(success.authResponse)
                            .then(function(profileInfo) {

                                //for the purpose of this example I will store user data on local storage
                                // UserService.setUser({
                                //     authResponse: success.authResponse,
                                //     userID: profileInfo.id,
                                //     name: profileInfo.name,
                                //     email: profileInfo.email,
                                //     picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
                                // });

                                // $state.go('app.home');
                                $ionicLoading.show({
                                  template: 'Logging in...'
                                });

                                // Temporary for our system
                                var fbData = {};
                                fbData.name = profileInfo.name;
                                fbData.email = profileInfo.email;
                                fbData.fbUserId = profileInfo.id;
                                fbData.password = "";
                                $scope.login(fbData);
                                $ionicLoading.hide();

                            }, function(fail){
                                //fail get profile info
                                console.log('profile info fail', fail);
                            });
                        //}else{
                           // $state.go('app.search');
                        //}

             } else {
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
