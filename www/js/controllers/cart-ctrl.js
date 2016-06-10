angular.module('app.cartCtrl', [])

// Cart Controller
.controller('cartCtrl', function($scope, $http, $ionicLoading, CartFactory, UsersFactory, $state, $ionicModal, $ionicPopup, $ionicPopover, FoodFactory) {

    // For showing/hiding the shipping address section into modal

    $scope.deliverySelected = true;
    $scope.termsCondition=true;
    $scope.taxRate= parseFloat(localStorage.getItem('taxRate'));
    $scope.deliveryCharge = localStorage.getItem('deliveryCharge');
    $scope.deliveryChargeForShowingOnly = localStorage.getItem('deliveryCharge');

    // Getting Address
    // Saving the user's defau lt address in local storage

    UsersFactory.getAddresses(localStorage.getItem('userId')).then(function(response) {

        var addresses = response.data;


        // jodi address matro 1 ta hoy tahole oitai save korbe
        if(addresses.length == 1){
            localStorage.setItem('defaultAddress', JSON.stringify(addresses[0]));
        }
        else{
            for (var i = 0; i < addresses.length; i++) {
                if (addresses[i].adrs_type == 1) {
                    //alert(addresses[i]);
                    localStorage.setItem('defaultAddress', JSON.stringify(addresses[i]));
                    break;
                }
            }
        }

    });
    // End Saving the user's default address in local storage


    // Value initialization for tips calculation
    $scope.tips=0;
    $scope.percentages = [
      {
        val: 0,
        per: "0%"
      },
      {
        val: 5,
        per: "5%"
      },
      {
        val: 10,
        per: "10%"
      },
      {
        val: 15,
        per: "15%"
      },
      {
        val: 20,
        per: "20%"
      },
      {
        val: 25,
        per: "25%"
      }];
      // End Value initialization for tips calculation

    $scope.emptyCart = true;
    var cartInfo = CartFactory.getCartInfo();
    $scope.resId = localStorage.getItem('resId');
    // if (cartInfo != undefined) {
    //     if (cartInfo.length > 0)
    //     console.log(cartInfo.length);
    //         $scope.emptyCart = false;
    // }
    //alert(JSON.stringify(cartInfo));
    var grandTotal = 0;
      //$scope.cartFoods = cartInfo;
    //  $scope.cartFoods.
      ///console.log($scope.cartFoods);
    if (cartInfo) {


        $scope.emptyCart = false;
        var temp = [];

        for (var i = 0; i < cartInfo.length; i++) {

            var food = {
                name: cartInfo[i].mainFood.food_name,
                size: cartInfo[i].sizeInfo.sizeName,
                qty: cartInfo[i].qty,
                price: parseFloat(cartInfo[i].totalPrice),
                specialInstruction: cartInfo[i].specialInstruction
            }

            temp.push(food);
            // var temporaray = cartInfo[i].totalPrice*cartInfo[i].qty;
            temporaray = cartInfo[i].totalPrice;
            grandTotal += temporaray;
        }
        $scope.subTotal = parseFloat(grandTotal);

        // Calculating grandTotal excluding tips
        var subTotal = $scope.subTotal;
        var deliveryCharge = parseFloat($scope.deliveryCharge);
        var taxRate = parseFloat($scope.taxRate);

        var tax = subTotal*(taxRate/100);
        var tips = subTotal*($scope.percentage/100);

        $scope.gTotal = subTotal + deliveryCharge + tax;

        $scope.foods = temp;
        $ionicLoading.hide();

    }
    else {
        $scope.emptyPage = " empty-page";
        $scope.emptyCart = true;

        $ionicLoading.hide();
    }











    //........................... For Delivery Starts......................

    $scope.disableCheckOut = false;
    if (CartFactory.getCartInfo() != undefined) {
        if (CartFactory.getCartInfo().length < 1) {
            $scope.disableCheckOut = true;
        }
    }

    $scope.boolAddNewAddress = false;

    $scope.deliveryType = 'delivery';
    // $scope.tipsPercent = 1;
    // $scope.tipsPercent = 0;
    $scope.foodTotal = $scope.grandTotal;
    // $scope.tipsPercent = $scope.foodTotal * ($scope.tips / 100);
    // $scope.tipsPercent = $scope.tipsPercent.toFixed(2);

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



    $scope.addAddressDiv = function() {
        $scope.boolAddNewAddress = true;
    }

    $scope.saveAddress = function(address) {
        $scope.address = address;
        //alert(JSON.stringify($scope.address));

        $ionicLoading.show({
            template: 'Saving into savor365 database.'
        });
        var user = JSON.parse(localStorage.getItem('loggedInUserInofos'));
        $scope.defaultAdrs = {};

        UsersFactory.addressSave(user[0].cus_id, $scope.address).then(function(response) {
            //$scope.address = response.data;
            $scope.boolAddNewAddress = false;

            $scope.defaultAdrs.addrs = $scope.address.line1 + ' ' + $scope.address.line2;
            $scope.defaultAdrs.state = $scope.address.state;
            $scope.defaultAdrs.town = $scope.address.city;
            $scope.defaultAdrs.zip_code = $scope.address.zipcode;
            $scope.defaultAdrs.phone = $scope.address.phone;
            $scope.defaultAdrs.country = "USA";


            $ionicLoading.hide();

            $scope.showAddAddress = true;
            $scope.showOnlyAddAddress = false;

        }, function(error) {
            $ionicLoading.hide();

            $ionicPopup.alert({
                title: 'Error!',
                template: 'Opps.. something wrong'
            });
            //console.log("eror is address saving" + error);
        });

    }
//saveAddress ends here

//saveBillingAddress starts below

$scope.saveBillingAddress=function(billingAddress) {
    return;
      $scope.address = billingAddress;
      //alert(JSON.stringify($scope.address));

      $ionicLoading.show({
          template: 'Saving into savor365 database.'
      });

      $scope.defaultAdrs = {};

      UsersFactory.addressSave(user[0].cus_id, $scope.address).then(function(response) {
          //$scope.address = response.data;
          $scope.boolAddNewAddress = false;

          $scope.defaultAdrs.addrs = $scope.address.line1 + ' ' + $scope.address.line2;
          $scope.defaultAdrs.state = $scope.address.state;
          $scope.defaultAdrs.town = $scope.address.city;
          $scope.defaultAdrs.zip_code = $scope.address.zipcode;
          $scope.defaultAdrs.phone = $scope.address.phone;
          $scope.defaultAdrs.country = "USA";


          $ionicLoading.hide();

          $scope.showAddAddress = true;
          $scope.showOnlyAddAddress = false;

      }, function(error) {
          $ionicLoading.hide();

          $ionicPopup.alert({
              title: 'Error!',
              template: 'Opps.. something wrong'
          });
          //console.log("eror is address saving" + error);
      });

  }



//saveBillingAddress ends

    $scope.makeThisShippingAddress = function(address){

        $scope.defaultAdrs.cus_name = address.cus_name;
        $scope.defaultAdrs.addrs = address.line1 + ' ' + address.line2;
        $scope.defaultAdrs.state = address.state;
        $scope.defaultAdrs.town = address.city;
        $scope.defaultAdrs.zip_code = address.zipcode;
        $scope.defaultAdrs.phone = address.phone;
        $scope.defaultAdrs.country = "USA";

        $scope.popover.hide();
        $scope.$on('$destroy', function() {
            $scope.popover.remove();
        });

    }

    // getting addressess- user will select an address from these addresses
    $scope.changeAddress = function($event){


        var user = JSON.parse(window.localStorage['loggedInUserInofos']);

        UsersFactory.getAddresses(user[0].cus_id).then(function(response) {
            $scope.addrsses = response.data;

            $ionicPopover.fromTemplateUrl('templates/popovers/selectAddressPopover.html', {
                scope: $scope
            }).then(function(popover) {
                $scope.popover = popover;
                $scope.popover.show($event);

            });





        });


    }

    $scope.openDeliveryModal = function() {
        //    if (localStorage.getItem('defaultAddress') != null) {
        //alert(localStorage.getItem('defaultAddress'));
        var defaultAddress = JSON.parse(localStorage.getItem('defaultAddress'));
        //console.log(defaultAddress);

        // if default address value is null then don't show the address panel
        if (defaultAddress == null) {
            $scope.showAddAddress = false;
            $scope.showOnlyAddAddress = true;
            //console.log("if");
        }
        else{
          $scope.showOnlyAddAddress = false;
           $scope.showAddAddress = true;
           $scope.defaultAdrs = defaultAddress;
           //console.log($scope.defaultAdrs);
           //console.log("else");
        }

        $scope.deliveryModal.show();

        //  }
    }

    $scope.close = function() {
        $scope.boolAddNewAddress = false;
    }


    // calcuate tips
    $scope.calculateTip = function(val) {


        //console.log(val);
        $scope.tips = val;

        $scope.tipsPercent = $scope.foodTotal * ($scope.tips / 100);
        $scope.tipsPercent = $scope.tipsPercent.toFixed(2);
    }

    $scope.setDeliveryCharge = function(val) {

            if(val){
                $scope.deliveryCharge = localStorage.getItem('deliveryCharge');
                $scope.deliveryChargeForShowingOnly = localStorage.getItem('deliveryCharge');
                $scope.deliverySelected = true;
                //console.log($scope.deliveryCharge);
              }
              else{
                //$scope.deliveryCharge = 0;
                $scope.deliveryChargeForShowingOnly = 0;
                $scope.pickUp=true;
                $scope.deliverySelected = false;
                //console.log($scope.deliveryCharge);
              }

    }

    // Getting the card Type
    var getCardType = function(cardNum){
        var firstChar = cardNum.charAt(0);
        if(firstChar == 4){
            return "Visa"
        }
        else if(firstChar == 5){
            return "MasterCard"
        }
        else if(firstChar == 3){
            return "American Express"
        }
        else if(firstChar == 6){
            return "Discover"
        }
    }


    $scope.checkout = function(deliveryType, tipPercetage) {

      //--------
      $ionicLoading.show({
            template: 'Processing...'
        });
      //--------
        // Making the checkout object
        var checkOutInfo = {};


        // User Info
        var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);
        checkOutInfo.userinfo = userInfo;

        // Restaurant Info
        checkOutInfo.resInfo = JSON.parse(localStorage.getItem('restaurantInfoForCheckoutInfo'));
        //console.log(checkOutInfo.resInfo);

        // Order Number
        var d = new Date();
        var time = d.getTime();
        //alert(time);
        var orderNo = time.toString();
        orderNo = Number(orderNo.substring(4));
        checkOutInfo.orderNo = orderNo;


        // Confirmation code
        var confirmationCode = time.toString().substring(9);
        checkOutInfo.confirmationCode = confirmationCode;


        // Delivery Type
        checkOutInfo.deliveryType = deliveryType;


        // Cart Info
        checkOutInfo.cartItem = CartFactory.getCartInfo();


        //Address
        checkOutInfo.shippingAddress = $scope.defaultAdrs;


        // Checkout foods
        checkOutInfo.foods = $scope.foods;



        // SubTotal
        checkOutInfo.subTotal = $scope.subTotal;


        // Grand Total
        // if(deliveryType == 'delivery'){
        //     checkOutInfo.grandTotal = $scope.gTotal + ($scope.subTotal * tipPercetage/100)
        // }
        // else{
        //     checkOutInfo.grandTotal = $scope.gTotal + ($scope.subTotal * tipPercetage/100) - $scope.deliveryCharge;
        // }
        checkOutInfo.grandTotal = 0.1;


        // Delivery charge
        checkOutInfo.deliveryCharge = $scope.deliveryCharge;


        // Tax
        checkOutInfo.tax = $scope.subTotal * ($scope.taxRate/100);


        // Tips percentage
        checkOutInfo.tips = $scope.subTotal * tipPercetage/100;


        // Speacial Intructions
        checkOutInfo.specialInstruction = "";


        //alert(JSON.stringify(checkOutInfo));
        //console.log(checkOutInfo);



        // End of object building for checkout
        /////////////////////////////////////////////////////////////
        ///////////////////----------------!!------------------------






        // Making payment Starts here

        $scope.boolPayment = false;

        UsersFactory.getPaymentInfo(userInfo[0].cus_id).then(function(response) {

            var cc = response.data[0];

            if(!cc){

                $ionicLoading.hide();

                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Please add a card to proceed.'
                }).then(
                    function(res){
                        $state.go("app.payment");
                    }
                );
            }
            else{

                // payemnt object
                var paymentInfo = {}


                // Card Info
                paymentInfo.cardInfo = cc;


                // Card type
                var ccType = getCardType(cc.card_number);
                paymentInfo.cardType = ccType;


                // Order Number
                paymentInfo.orderNo = orderNo;


                // User Info
                paymentInfo.userinfo = userInfo[0];


                // Grand Total
                paymentInfo.amount = checkOutInfo.grandTotal


                console.log(paymentInfo);

                var makePayment = function(forHmac){

                    $http({
                        method: 'POST',
                        url: 'https://savor365.com/api/setPayload',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: paymentInfo


                    }).then(function(response){
                      $ionicLoading.hide();
                      console.log($scope.boolPayment);
                      // if success payment
                      console.log(response.data);
                      var res = response.data;
                      // do whatever need after payment made
                      $scope.boolPayment = true;
                      //msg payment done
                      var alertPopup = $ionicPopup.alert({
                          title: 'success!!',
                          template: 'successfully checked out...please wait for order confirmation!! '
                      });
                      alertPopup.then(function(res) {
                        //-----------------Saving & Fax---------------------------------
                        // Saving into database and send fax
                        //////////////////////////////////////////////////////////////

                                $ionicLoading.show({
                                    template: 'Order confirm!!'
                                });


                            var sendReq = $http({
                                method: 'POST',
                                url: 'https://savor365.com/api/orderInfo',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                },
                                data: checkOutInfo


                            }).then(function(data) {
                                //alert(JSON.stringify(data));
                                $ionicLoading.hide();
                                $ionicPopup.alert({
                                    title: 'Success!!',
                                    template: 'Your order is confirmed!!'
                                });

                                console.log(data);
                                localStorage.removeItem('cartInfo');
                            },function(error){
                              $ionicLoading.hide();
                              //error message
                              $ionicPopup.alert({
                                  title: 'Error!',
                                  template: 'Opps.. something wrong'
                              });
                            });
                            //console.log(sendReq);
                        /////////////////////////////////////////////////////
                     });

                    }, function(error){
                          $ionicLoading.hide();
                          //alert message
                          $ionicPopup.alert({
                              title: 'Error!',
                              template: 'Opps.. something wrong'
                          });


                        // if error payment
                        console.log(error.message);
                        alert("Error");
                    });
                    // end of makePayment()
                }

                makePayment();

            }

        },
        function(error) {
          $ionicLoading.hide();
          //error message
          $ionicPopup.alert({
              title: 'Error!',
              template: 'Opps.. something wrong'
          });
            console.log(error.message);
        });


        // payment end here




    } //............................For Delivery Ends........................







//-----------CART DELETE POPUP---------------

$scope.showDeleteAlert = function() {
  var confirmPopup = $ionicPopup.confirm({
    title: 'Delete alert',
    template: 'Are you sure you want to empty cart?'
  });

  confirmPopup.then(function(res) {
    if(res) {

        //localStorage.setItem('cartInfo',[]);
        localStorage.removeItem('cartInfo');
        //console.log(localStorage);
        $scope.foods=false;
        $scope.emptyCart=true;
        $scope.subTotal=0;
        //console.log("subTotal:" +$scope.subTotal);
        //console.log($scope.emptyCart);
        $scope.emptyPage = "empty-page";

      } else {
        return;
        $scope.emptyPage = "";

      }

  });
};





    // Getting the promocode

    $scope.getPromocode = function(){

        $scope.promo = {};
        var promoPopup = $ionicPopup.show({
            template: '<input type="number" ng-model="promo.code">',
            title: 'Enter the promocode',
            scope: $scope,
            buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Use</b>',
                type: 'button-positive',
                onTap: function(e) {
                  if (!$scope.promo.code) {
                    //don't allow the user to close unless he enters wifi password
                    e.preventDefault();
                  } else {
                    return $scope.promo.code;
                  }
                }
              }
            ]
        });

        promoPopup.then(function(res) {
            console.log('Tapped!', res);
        });

    }






});
