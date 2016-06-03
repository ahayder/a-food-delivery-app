angular.module('app.loginCtrl', [])

// Login and signup using facebook ctrl
.controller('loginCtrl', function($scope, UsersFactory, $ionicPopup, $state, $rootScope, $timeout, ngFB, SignUpFactory, $ionicHistory) {

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

                // // Saving the user's default address in local storage for use in delivery modal
                // UsersFactory.getAddresses(userInfo[0].cus_id).then(function(response) {
                //
                //     var addresses = response.data;
                //
                //
                //     // jodi address matro 1 ta hoy tahole oitai save korbe
                //     if(addresses.length == 1){
                //         localStorage.setItem('defaultAddress', JSON.stringify(addresses[0]));
                //     }
                //     else{
                //         for (var i = 0; i < addresses.length; i++) {
                //             if (addresses[i].adrs_type == 1) {
                //                 //alert(addresses[i]);
                //                 localStorage.setItem('defaultAddress', JSON.stringify(addresses[i]));
                //                 break;
                //             }
                //         }
                //     }
                //
                // });

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















    $scope.signUp = function(data) {
        $scope.user = data;
        SignUpFactory.signup(data).then(function(response) {
            var popup = $ionicPopup.alert({
                title: 'Success!',
                template: 'Successfully signed up!'
            });

            popup.then(function(res) {
                if (res) {
                    //$state.go("app.login");
                    //////////////////////////////
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
                                title: 'Unsuccessful',
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
                    //////////////////////////////
                } else {
                    console.log("Do nothing");
                }
            });

        }, function(error) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'The signup was not successful for this reason:' + JSON.parse(error)
            });
        });
    }

    $scope.fbSignUp = function() {

    //alert('hola');
    $scope.data = {};
    ngFB.login({
        scope: 'email'
    }).then(
        function(response) {
            ngFB.api({
                path: '/me',
                params: {
                    fields: 'id,name,email'
                }
            }).then(
                function(user) {

                    var fbData = {};
                    fbData.name = user.name;
                    fbData.email = user.email;
                    fbData.password = "";
                    //fbData.mobile = user.mobile;
                    $scope.signUp(fbData);
                },
                function(error) {
                    alert('Facebook error: ' + error.error_description);
                });
        });
    }

});
