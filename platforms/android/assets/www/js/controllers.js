// Here $rootScope.login value is direct opposite because I am using ng-hide instead of ng-show
// because ng-show was not working
// user infos into this locastorage window.localStorage['loggedInUserInofos']
angular.module('app.controllers', [])

.controller('appCtrl', ['$scope', '$state', '$rootScope', 'UsersFactory', function($scope, $state, $rootScope, UsersFactory) {

    $rootScope.login = true; // acctually it means false incase of ng-hide

    var loggedIn = window.localStorage['loggedIn'];

    if (loggedIn === "true") {
        $rootScope.login = false;
        $state.go("app.searchResult"); //app.searchResult
    } else {
        window.localStorage['loggedIn'] = "false";
        // $state.go("app.login");
        $state.go("app.searchResult");
        $scope.logoutMessage = false;
    }

    $scope.logout = function() {

        window.localStorage['loggedIn'] = "false";
        window.localStorage['loggedInUserInofos'] = "";

        $scope.logoutMessage = true;
        $rootScope.login = true;
        $state.go("app.login");
    };


}])


.controller("searchResultCtrl", function($scope, $ionicPopup, $cordovaGeolocation, LocationFactory, SearchFactory, $ionicLoading, FoodFactory, $state, $window, $http, $ionicPopover, UsersFactory) {

        $ionicLoading.show({
            template: 'Loading...'
        });

        var initialization = function(zipcode) {
            //alert(zipcode);
            $ionicLoading.show({
                template: 'Loading...'
            });

            // Getting current position
            var posOptions = {
                timeout: 10000,
                enableHighAccuracy: false
            };
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function(position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    //var myLatLng = {lat,lng};


                    // Getting the zip code using lat lng
                    LocationFactory.getZipCode(lat, lng).then(function(response) {

                        $scope.zipcode = response.data.postalCodes[0].postalCode;
                        console.log($scope.zipcode);

                        var searchResult = [];

                        // Getting the restaurants by zipcode //Should be in one query//

                        SearchFactory.searchByZipCode($scope.zipcode).then(function(response) {
                            var restaurants = response.data;
                            // Getting the restaurants

                            for (var i = 0; i < restaurants.length; i++) {
                                FoodFactory.getRestaurantsById(restaurants[i].res_id).then(function(res) {
                                    searchResult.push(res.data[0]);
                                });
                            }

                            SearchFactory.saveSearchResult(searchResult);
                            $scope.searchResult = SearchFactory.getSearchResult();
                        });
                        $ionicLoading.hide();

                    });

                }, function(err) {
                    $ionicPopup.alert({
                        title: 'Error!',
                        template: 'Opps.. something wrong ' + err.message
                    });
                    console.log("Opps! something wrong here " + err.message);
                    $ionicLoading.hide();
                });

        }

        $scope.favClass = "not-fav";



        initialization();
        


        // Searching by location
        $scope.searchByLocation = function() {

            $ionicLoading.show({
                template: 'Loading...'
            });

            var searchResult = [];

            // Getting the restaurants by zipcode //Should be in one query//

            SearchFactory.searchByZipCode($scope.zipcode).then(function(response) {
                var restaurants = response.data;
                // Getting the restaurants

                for (var i = 0; i < restaurants.length; i++) {
                    FoodFactory.getRestaurantsById(restaurants[i].res_id).then(function(res) {
                        searchResult.push(res.data[0]);
                    });
                }


                $ionicLoading.hide();
                $state.go("app.searchResult");
                SearchFactory.saveSearchResult(searchResult);

            });
        }

        $scope.searchByZipCode = function(zipcode) {
            //alert(zipcode);
            $ionicLoading.show({
                template: 'Loading...'
            });

            var searchResult = [];

            // Getting the restaurants by zipcode //Should be in one query//

            SearchFactory.searchByZipCode(zipcode).then(function(response) {
                var restaurants = response.data;
                // Getting the restaurants

                for (var i = 0; i < restaurants.length; i++) {
                    FoodFactory.getRestaurantsById(restaurants[i].res_id).then(function(res) {
                        searchResult.push(res.data[0]);
                    });
                }


                $ionicLoading.hide();
                SearchFactory.saveSearchResult(searchResult);
                $scope.searchResult = SearchFactory.getSearchResult();
            });

        }



        // Sorting functions

        $scope.cuisinesPopover = function($event){


            $ionicPopover.fromTemplateUrl('templates/popovers/cuisines-popover.html', {
                    scope: $scope
                }).then(function(popover) {
                    $scope.popover = popover;
                });


            SearchFactory.getCuisines().then(function(response){
                $scope.cuisines = response.data;
                    $scope.popover.show($event);
                
                
            });
            
        }

        $scope.closePopover = function(id){
            $scope.popover.hide();
            $scope.$on('$destroy', function() {
                $scope.popover.remove();
            });

            // Getting data by cuisine
            $ionicLoading.show({
                template: 'Loading...'
            });
            var searchResult = [];
            SearchFactory.searchByCuisine(id).then(function(response){
                var resIds = response.data;

                if(resIds.length == 0){
                    $scope.searchResult = false;
                    $ionicLoading.hide();
                }
                else{

                    for (var i = 0; i < resIds.length; i++) {
                        FoodFactory.getRestaurantsById(resIds[i]).then(function(res) {
                            searchResult.push(res.data[0]);
                        });
                    }

                    SearchFactory.saveSearchResult(searchResult);
                    $scope.searchResult = SearchFactory.getSearchResult();
                    $ionicLoading.hide(); 
                }

                

            });
        }



        $scope.filterPopover = function($event){

            $ionicPopover.fromTemplateUrl('templates/popovers/filter-popover.html', {
                    scope: $scope
                }).then(function(popover) {
                    $scope.filterPop = popover;
                    $scope.filterPop.show($event);
                });

            
            
        }

        $scope.closeFilterPopover = function(){

            $scope.filterPop.hide();
            $scope.$on('$destroy', function() {
                $scope.filterPop.remove();
            });
            

            // Getting data by free delivery charge
            $ionicLoading.show({
                template: 'Loading...'
            });

            var searchResult = [];
            SearchFactory.searchByFreeDelivery().then(function(response){

                var resIds = response.data;

                if(resIds.length == 0){
                    $scope.searchResult = false;
                    $ionicLoading.hide();
                }
                else{

                    for (var i = 0; i < resIds.length; i++) {
                        FoodFactory.getRestaurantsById(resIds[i]).then(function(res) {
                            searchResult.push(res.data[0]);
                        });
                    }

                    SearchFactory.saveSearchResult(searchResult);
                    $scope.searchResult = SearchFactory.getSearchResult();
                    $ionicLoading.hide(); 
                }
                

            });

        }

        

})


// .controller('orderCtrl', ['$scope', 'FoodFactory', '$ionicModal', '$ionicLoading',
//         function($scope, FoodFactory, $ionicModal, $ionicLoading) {
//             // Getting Foods    
//             var fetchFoods = function() {
//                     // show loading
//                     $ionicLoading.show({
//                         template: 'Loading...'
//                     });

//                     FoodFactory.getFoods().then(function(foodsResponse) {
//                         var fooods = foodsResponse.data;

//                         // For getting the name of the cuisine
//                         FoodFactory.getCuisines().then(function(cuisineResponse) {
//                             var allCuisines = cuisineResponse.data;
//                             for (var i = 0; i < fooods.length; i++) {
//                                 for (var j = 0; j < allCuisines.length; j++) {
//                                     if (+fooods[i].cuisine_id == +allCuisines[j].id) {
//                                         fooods[i].cuisine_id = allCuisines[j].cuisine_name;
//                                     }
//                                 }
//                             }
//                             $scope.foods = fooods;
//                             $ionicLoading.hide();
//                         });


//                     });
//                 }
//                 // Calling the fetch function when order page loads
//             fetchFoods();
//         }
//     ])
    // Cart Controller
    .controller('cartCtrl', function($scope, $http, $ionicLoading, CartFactory, UsersFactory, $state, $ionicModal, $ionicPopup, $resource) {

        // $ionicLoading.show({
        //     template: 'Loading...'
        // });
        $scope.emptyCart = true;
        var cartInfo = CartFactory.getCartInfo();
        $scope.resId = localStorage.getItem('resId');
        if (cartInfo != undefined) {
            if (cartInfo.length > 0)
                $scope.emptyCart = false;
        }
        //alert(JSON.stringify(cartInfo));
        var grandTotal = 0;

        if (cartInfo) {
            $scope.emptyCart = false;
            var temp = [];

            for (var i = 0; i < cartInfo.length; i++) {

                var food = {
                    name: cartInfo[i].mainFood.food_name,
                    size: cartInfo[i].sizeInfo.sizeName,
                    qty: cartInfo[i].qty,
                    price: cartInfo[i].totalPrice,
                    specialInstruction: cartInfo[i].specialInstruction
                }

                temp.push(food);
                grandTotal += cartInfo[i].totalPrice;
            }
            $scope.grandTotal = grandTotal;
            $scope.foods = temp;
        } else {}
        $scope.emptyCart = true;

        $ionicLoading.hide();


        //........................... For Delivery Starts......................

        $scope.disableCheckOut = false;
        if (CartFactory.getCartInfo() != undefined) {
            if (CartFactory.getCartInfo().length < 1) {
                $scope.disableCheckOut = true;
            }
        }

        $scope.boolAddNewAddress = false;
        $scope.deliveryCharge = 1;
        $scope.deliveryType = 'delivery';
        $scope.tips = 1;
        $scope.tipsPercent = 0;
        $scope.foodTotal = $scope.grandTotal;
        $scope.tipsPercent = $scope.foodTotal * ($scope.tips / 100);
        $scope.tipsPercent = $scope.tipsPercent.toFixed(2);

        $ionicModal.fromTemplateUrl('templates/deliveryModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(deliveryModal) {
            $scope.deliveryModal = deliveryModal;
        });
        // Order Modal

        $scope.closeModal = function() {
            $scope.deliveryModal.hide();
        };

        $scope.$on('$destroy', function() {
            $scope.deliveryModal.remove();
        });

        $scope.openDeliveryModal = function() {
            //    if (localStorage.getItem('defaultAddress') != null) {
            //alert(localStorage.getItem('defaultAddress'));
            var defaultAddress = JSON.parse(localStorage.getItem('defaultAddress'));
            $scope.defaultAdrs = defaultAddress;
            $scope.deliveryModal.show();

            //  }
        }

        $scope.addAddressDiv = function() {
            $scope.boolAddNewAddress = true;
        }

        $scope.saveAddress = function(address) {
            $scope.address = address;
            // JSON.stringify($scope.address);
            // return;
            $ionicLoading.show({
                template: 'Saving into savor365 database.'
            });
            var user = JSON.parse(localStorage.getItem('loggedInUserInofos'));
            $scope.defaultAdrs = {};

            UsersFactory.addressSave(user[0].cus_id, address).then(function(response) {
                //$scope.address = response.data;
                $scope.boolAddNewAddress = false;
                //alert(JSON.stringify(response.data));
                if (response.data == "Address Saved") {
                    $scope.defaultAdrs.addrs = $scope.address.line1 + ' ' + $scope.address.line2;
                    $scope.defaultAdrs.state = $scope.address.state;
                    $scope.defaultAdrs.town = $scope.address.city;
                    $scope.defaultAdrs.zip_code = $scope.address.zipcode;
                    $scope.defaultAdrs.phone = $scope.address.phone;
                    $scope.defaultAdrs.country = "USA";

                }
                $ionicLoading.hide();

            }, function(error) {
                $ionicLoading.hide();

                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Opps.. something wrong'
                });
                console.log("eror is address saving" + error);
            });

        }
        $scope.close = function() {
            $scope.boolAddNewAddress = false;
        }
        $scope.setTipsPercent = function(val) {
            $scope.tips += val;
            if ($scope.tips < 0) {
                $scope.tips = 0;
                return;
            }
            $scope.tipsPercent = $scope.foodTotal * ($scope.tips / 100);
            $scope.tipsPercent = $scope.tipsPercent.toFixed(2);
        }
        $scope.setDeliveryCharge = function(val) {
            $scope.deliveryCharge = Number(val);
        }
        $scope.checkout = function(amnt, deliveryType, tips) {

            $scope.boolPayment = false;

            var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);

            // Making payment

            UsersFactory.getPaymentInfo(userInfo[0].cus_id).then(function(response) {

                $scope.cc = response.data[0];
                if(!$scope.cc){
                    $ionicPopup.alert({
                        title: 'Error!',
                        template: 'Please add payment info.'
                    }).then(
                        function(res){
                            $state.go("app.addresses");
                        }
                    );
                }
                else{

                    var options = {
                      location: 'no',
                      clearcache: 'yes',
                      toolbar: 'no'
                    };

                    //var ref = cordova.InAppBrowser.open("https://savor365.com/api/makePayment?amount=" + amnt + "&cardNumber=" + $scope.cc.card_number + "&cvv=" + $scope.cc.cvv + "&expDate=1018&invNumber=45", "_blank", "location=no");

                    
                    // CartFactory.makePayment(amnt, $scope.cc.card_number, $scope.cc.cvv, "1080").then(
                    //         function(response){
                    //             alert(response)
                    //         }
                    //     );








                    // TEST WITH FORUM CODE



                    $scope.postResource = function(){

                        var nonce = Math.random() * 1000000000000000000;
                        alert("Nonce: " + nonce);
                        var d = new Date();
                        var time = d.getTime();
                        alert("Time: " + time)
                        //var time = Math.round(new Date().getTime()/1000.0)
                        // var payStatus = $resource('https://api-cert.payeezy.com/v1/transactions',{},
                        //     {post: {method: 'POST',
                        //         headers: {
                        //                     'Accept' : '*/*',
                        //                     'Content-Type' :'application/json',
                        //                     'Accept': 'application/json',
                        //                     'apikey' :'y6pWAJNyJyjGv66IsVuWnklkKUPFbb0a',
                        //                     'token' :'fdoa-a480ce8951daa73262734cf102641994c1e55e7cdf4c02b6',
                        //                     'nonce': '5930422970134099000',
                        //                     'timestamp':'1463342428744',
                        //                     'Authorization':'86fbae7030253af3cd15faef2a1f4b67353e41fb6799f576b5093ae52901e6f7'
                        //                 }
                        //             }
                        //     }
                        // );

                        // payStatus.post(function() {
                        //     (
                        //         {
                        //           "merchant_ref": "Astonishing-Sale",
                        //           "transaction_type": "purchase",
                        //           "method": "credit_card",
                        //           "amount": "1299",
                        //           "partial_redemption": "false",
                        //           "currency_code": "USD",
                        //           "credit_card": {
                        //             "type": "visa",
                        //             "cardholder_name": "John Smith",
                        //             "card_number": "4788250000028291",
                        //             "exp_date": "1020",
                        //             "cvv": "123"
                        //           }
                        //         }
                        //     );
                        // });


                        $http({
                            method: 'POST',
                            url: 'https://api-cert.payeezy.com/v1/transactions',
                            headers: {
                                        'apikey' :'Ped28IrSxtf707W0mmrNMxRr3G2GNhEC',
                                        'token' :'fdoa-ecd0023840ef37df4fef467af8269e2cecd0023840ef37df',
                                        'Content-Type' :'application/json',
                                        'Authorization':'f2253ef33d032006a828f02fffc01d0872e1fbfba8ec64b421183eb1d085b759',
                                        'nonce': nonce,
                                        'timestamp': time,
                                        
                                    },
                            data: {
                                  "merchant_ref": "Astonishing-Sale",
                                  "transaction_type": "purchase",
                                  "method": "credit_card",
                                  "amount": "1299",
                                  "partial_redemption": "false",
                                  "currency_code": "USD",
                                  "credit_card": {
                                    "type": "visa",
                                    "cardholder_name": "John Smith",
                                    "card_number": "4788250000028291",
                                    "exp_date": "1020",
                                    "cvv": "123"
                                  }
                                }

                        }).then(function(resone){alert("success ho geya" + JSON.stringify(resone))}, function(error){alert("error" + JSON.stringify(error))});
                    }

                    $scope.postResource();



                    /// END of test
                    
                    //$scope.boolPayment = true;
                }
                
            },
            function(error) {
                console.log(error.message);
            });

            $scope.checkOutInfo = {};
            if ($scope.boolPayment) {
                $scope.checkOutInfo.cartItem = CartFactory.getCartInfo();
                var d = new Date();
                var time = d.getTime();
                //alert(time);
                var orderNo = time.toString();
                orderNo = Number(orderNo.substring(4));
                $scope.confirmationCode = time.toString().substring(9);
                $scope.checkOutInfo.orderNo = orderNo;
                // $scope.checkOutInfo.address = JSON.parse(localStorage.getItem('defaultAddress'));
                $scope.checkOutInfo.address = $scope.defaultAdrs;
                $scope.checkOutInfo.deliveryType = deliveryType;
                $scope.foodTotal = $scope.grandTotal;
                $scope.grandTotal += $scope.deliveryCharge;
                $scope.checkOutInfo.foodTotal = $scope.foodTotal;
                $scope.checkOutInfo.grandTotal = $scope.grandTotal;
                //$scope.checkOutInfo.tips=tips;
                $scope.checkOutInfo.deliveryCharge = $scope.deliveryCharge;
                $scope.checkOutInfo.tips = $scope.tipsPercent;
                $scope.checkOutInfo.confirmationCode = $scope.confirmationCode;
                $scope.checkOutInfo.userinfo = userInfo;
                //alert(JSON.stringify($scope.checkOutInfo));
                console.log($scope.checkOutInfo);


                ////////////////////////////
                $http({
                    method: 'POST',
                    url: 'https://savor365.com/api/orderInfo',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: $scope.checkOutInfo


                }).then(function(data) {
                    //alert(JSON.stringify(data));
                    console.log(data);
                    localStorage.removeItem('cartInfo');
                });
                /////////////////////////////

            }
        } //............................For Delivery Ends........................
    })

.controller('myProfileCtrl', function($scope) {

})

.controller('myAccountCtrl', function($scope, $ionicLoading, $ionicModal, UsersFactory) {
    //alert('holaa');
    var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);

    console.log(userInfo);

    UsersFactory.getUserInfo(userInfo[0].cus_email).then(function(response) {
        $scope.user = response.data[0];
        console.log($scope.user);
    });

})

.controller('addressesCtrl', function($scope, $ionicLoading, $ionicModal, UsersFactory, $ionicPopup, $state) {
    //alert('holaaa');
    var user = JSON.parse(window.localStorage['loggedInUserInofos']);

    UsersFactory.getAddresses(user[0].cus_id).then(function(response) {
        $scope.addresses = response.data;
    });


    $scope.saveAddress = function(address) {
        //alert(JSON.stringify(address));

        return;
        $ionicLoading.show({
            template: 'Saving into savor365 database.'
        });

        UsersFactory.addressSave(user[0].cus_id, address).then(function(response) {
            $scope.address = response.data;
            //    var newAddress={addrs:address.line1+' '+address.line2,
            // country:'USA',
            // cus_id:user[0].cus_id,
            // id:-1,
            // phone:address.phone,
            // state:address.state,
            // town:address.city,
            // zip_code:address.zipcode};
            // alert(JSON.stringify($scope.address));
            //$scope.addresses.push(newAddress);
            $ionicLoading.hide();
            $scope.closeModal();
            UsersFactory.getAddresses(user[0].cus_id).then(function(response) {
                $scope.addresses = response.data;
            });
            $ionicPopup.alert({
                title: 'Success!',
                template: 'Successfully saved'
            });
            $state.go("app.addresses");
        }, function(error) {
            $ionicLoading.hide();
            $scope.closeModal();
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Opps.. something wrong'
            });
            console.log("eror is address saving" + error);
        });
    }

    $scope.saveAddressForSate = function(address) {
            UsersFactory.saveAddressForNextState(address);
        }
        // Ionic Modal Configuration
    $ionicModal.fromTemplateUrl('templates/address/add-address-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    // Order Modal
    $scope.addNewAddressModal = function() {
        $scope.modal.show();
    };
    // Order modal closing function

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

})

.controller('addressCtrl', function($scope, $ionicLoading, $ionicModal, UsersFactory, $ionicPopup) {

    $scope.thisAddress = UsersFactory.getAddress();

    console.log($scope.thisAddress['id']);

    $scope.makeDafultAddress = function(id) {
        //alert(id);
        UsersFactory.makeThisAddressDefault(id).then(function() {
            $ionicPopup.alert({
                title: 'Success!',
                template: 'Successfully saved'
            });
        }, function(error) {
            console.log("Can't save");
        });
    }

})

.controller('paymentCtrl', function($scope, $ionicLoading, $ionicModal, $ionicPopup, $state, UsersFactory) {


    var user = JSON.parse(window.localStorage['loggedInUserInofos']);

    UsersFactory.getPaymentInfo(user[0].cus_id).then(function(response) {
            $scope.card = response.data[0];
            console.log($scope.card);
        },
        function(error) {
            console.log(error.message);
        });

    // End of call

    $scope.savePaymentInfos = function(payment) {
            if (!$scope.invalidNumber) {
                /////////////////////////
                // $(function() {
                //$('#ccnum').validateCreditCard(function(result) {
                // alert(JSON.stringify(result.valid));
                //  if(!result.valid){
                // alert("Please insert valid card number");
                //  $scope.invalidNumber=true;
                //   return;
                //   }
                //   else{
                //  alert(JSON.stringify(payment));
                //////////////////////////
                $ionicLoading.show({
                    template: 'Saving into savor365 database.'
                });

                UsersFactory.paymentInfoSave(payment, user[0].cus_id).then(function(response) {
                    $scope.payment = response.data;
                    console.log($scope.payment);
                    $ionicLoading.hide();
                    $scope.closeModal();
                    $ionicPopup.alert({
                        title: 'Success!',
                        template: 'Successfully saved'
                    });
                    $state.go("app.payment");
                }, function(error) {
                    $ionicLoading.hide();
                    $scope.closeModal();
                    $ionicPopup.alert({
                        title: 'Error!',
                        template: 'Opps.. something wrong'
                    });
                    console.log("eror in payment saving" + error);
                });
                //////////////////////////
                //}


                // });
                // });
            }


        }
        // Ionic Modal Configuration
    $ionicModal.fromTemplateUrl('templates/payment/payment-add-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    // Order Modal
    $scope.addNewCardModal = function() {

        $scope.modal.show();
        $('#ccnum').validateCreditCard(function(result) {
            if (!result.valid) {

                $scope.invalidNumber = true;
                //alert($scope.invalidNumber);
            } else {

                $scope.invalidNumber = false;
                //alert($scope.invalidNumber);
            }
        });

    };

    // Order modal closing function
    $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.invalidNumber = false;
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });


})

.controller('inviteFriendsCtrl', function($scope) {


    // $scope.invitationFB = function(link) {
    //     ngFB.login().then(
    //         function(response) {

    //             if (response.status === 'connected') {
    //                 (alert)('Facebook Signup succeeded');

    //                 $scope.shareFB(link);


    //             } else {
    //                 (alert)('Facebook Signup failed');
    //             }
    //         });
    // }


    // $scope.shareFB = function(link) {

    //     ngFB.api({
    //         method: 'POST',
    //         path: '/me/feed',
    //         params: {
    //             message: 'Welcome to food world',
    //             link: link
    //         }
    //     }).then(
    //         function() {
    //             (alert)('The session was shared on Facebook');
    //         },
    //         function() {
    //             (alert)('An error occurred while sharing this session on Facebook');
    //         });
    // };


    // $scope.invitationTwitter = function() {
    //     $cordovaSocialSharing.share("This is your message", "This is your subject", "www/imagefile.png", "http://blog.nraboy.com");
    // }

    // $scope.invitationTwitter = function() {
    //     $cordovaSocialSharing.share("This is your message", "This is your subject", "www/imagefile.png", "http://blog.nraboy.com");
    // }


})

.controller('favouriteCtrl', function($scope, $ionicPopup, $q, UsersFactory, FoodFactory) {

    var getFav = function(){

        var resId = localStorage.getItem('resId');

        var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);

        var userId = userInfo[0].cus_id;

        

        UsersFactory.getFavs(userId).then(function(response){
            var res = response.data;
            $scope.restaurantsInfo = [];
            var loopPromises = [];
            //console.log(res);

            angular.forEach(res, function(r){
                var deferred = $q.defer();
                loopPromises.push(deferred.promise);
                FoodFactory.getRestaurantsById(r.res_id).then(function(response){
                    //console.log(response.data[0]);
                    $scope.restaurantsInfo.push(response.data[0]);
                    //console.log($scope.restaurantsInfo);
                    deferred.resolve();
                });
            })

            $q.all(loopPromises).then(function(){
                //console.log($scope.restaurantsInfo);
                $scope.restaurants = $scope.restaurantsInfo;
                //console.log($scope.restaurants);

            });
            
        }, function(error){
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Opps.. something wrong ' + error.message
            });
        });
    }

    getFav();

})

.controller('orderHistoryCtrl', function($scope, $ionicLoading, $ionicModal, $http, FoodFactory) {
    // console.log(localStorage.getItem('loggedInUserInofos'));
    var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);
    console.log(userInfo[0].cus_id);
    $http.get('https://savor365.com/api/orderHistory?cusId=' + Number(userInfo[0].cus_id)).success(function(data) {
        console.log(data);
    });

})

// Login/Signup     
.controller('loginCtrl', function($scope, UsersFactory, $ionicPopup, $state, $rootScope, $timeout, ngFB, SignUpFactory, $ionicHistory) {

    $scope.logoutMessage = false;
    $scope.login1 = true;
    $scope.login = function(user) {

        UsersFactory.login(user.email, user.password).then(function(response) {
            //console.log(localStorage.getItem('storeUserId'));
            var userInfo = response.data;

            if (userInfo.length == 0) {
                $ionicPopup.alert({
                    title: 'Unsuccessful',
                    template: 'The email or password mismatched'
                });
            } else {

                if (localStorage.getItem('storeUserId') != userInfo[0].cus_id) {

                    console.log('no match');
                    localStorage.removeItem('cartInfo');
                    localStorage.removeItem('defaultAddress');
                    console.log(localStorage.getItem('cartInfo'));

                }

                localStorage.setItem('storeUserId', userInfo[0].cus_id);

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

                //Saving variables to use later
                //$rootScope.login = false;
                $scope.login1 = false;
                window.localStorage['loggedIn'] = "true";
                window.localStorage['loggedInUserInofos'] = JSON.stringify(userInfo);
                // without timeout menu ng-show doesn't work
                //$state.go("app.searchResult");
                if (localStorage.getItem('resId') == null) {
                    $state.go("app.searchResult");
                    $rootScope.login = false;
                } else {

                    $state.go("app.searchResult", {

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
                        if (localStorage.getItem('storeUserId') != userInfo[0].cus_id) {
                            localStorage.removeItem('cartInfo');
                        }
                        localStorage.setItem('storeUserId', userInfo[0].cus_id);
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
                                $state.go("app.searchResult");
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

})

.controller('signupCtrl', function($scope, SignUpFactory, $ionicPopup, $state, UsersFactory, $rootScope,  ngFB, $ionicHistory) {

    $scope.login1 = true;

    $scope.signUp = function(data) {
        $scope.user = data;
        SignUpFactory.signup(data).then(function(response) {
            var popup = $ionicPopup.alert({
                title: 'Success!',
                template: 'Successfully signed up, now login and enjoy your food'
            });

            popup.then(function(res) {
                if (res) {
                    //$state.go("app.login");
                    //////////////////////////////
                    UsersFactory.login($scope.user.email, $scope.user.password).then(function(response) {

                        var userInfo = response.data;
                        ////////////////////
                        if (localStorage.getItem('storeUserId') != userInfo[0].cus_id) {
                            localStorage.removeItem('cartInfo');
                        }
                        localStorage.setItem('storeUserId', userInfo[0].cus_id);
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
                                $state.go("app.searchResult");
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
        // openFB.login(
        //     function(response) {
        //         //alert(JSON.stringify(response));
        //         var accessToken = response.authResponse.accessToken;
        //         openFB.api({
        //             path: "/me",

        //             success: function(data) {
        //                 alert(JSON.stringify(data));
        //                 $scope.data.name = data.name;
        //                 $scope.data.email = data.email;

        //             },
        //             error: function() {

        //             }
        //         });
        //     }, {
        //         scope: "email"
        //     });
        // hello('facebook').login( function(res) {
        //     console.log(res);
        //     hello( 'facebook' ).api( '/me?fields=name,email' ).then(function(res) {
        //      // console.log(json.name);

        //       $scope.data.name=res.name;
        //       $scope.data.email=res.email;
        //       alert(JSON.stringify($scope.data));

        //   })
        // });      
        // $scope.data={};
        // $cordovaFacebook.login(["public_profile", "email", "user_friends","publish_actions"])
        //     .then(function(success) {
        //         // console.log(success);
        //         ////////////////////
        //         $cordovaFacebook.api("me?fields=name,email")
        //             .then(function(success) {
        //               console.log(success.name);
        //               $scope.data.name=success.name;
        //               $scope.data.email=success.email;
        //               // **********Facebook Post**********
        //                 // var options = {
        //                 // method: 'feed',
        //                 // link: 'http://loookz.com:3000/',
        //                 // caption: 'An example caption',
        //                 // };
        //                 // $cordovaFacebook.showDialog(options)
        //                 // .then(function(success) {
        //                 // console.log(success);
        //                 // }, function (error) {

        //                 // });                       
        //                 // **********Facebook Post End**********
        //                 },
        //                  function (error) {

        //                 });      

        //         //////////////////////                
        //     }, function(error) {
        //         // error
        //     });
    }

})

.controller('moreInfoCtrl', function ($scope, $stateParams, FoodFactory) {

    var restaurantId = $stateParams.restaurantId;
    localStorage.setItem('resId',restaurantId);

    FoodFactory.getResOpenHours(restaurantId).then(function(response){
        $scope.resOpenHours = response.data;
    });

    FoodFactory.getRestaurantsById(restaurantId).then(function(response){
        $scope.restaurant = response.data[0];
        console.log($scope.restaurant);
    });
    
})

.controller('orderStatusCtrl', function ($scope, UsersFactory, $ionicPopup) {

    $scope.orderStat = [];

    var user = JSON.parse(localStorage.getItem('loggedInUserInofos'));


    UsersFactory.getLastOrderStatus(user[0].cus_id).then(function(response){

        var res = response.data;
        
        if(res.length > 0){
            $scope.orderStat = res[0];
            console.log(res);
        }
        else{
            $scope.orderStat = false;
        }
    });
});
