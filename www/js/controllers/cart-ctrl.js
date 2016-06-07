angular.module('app.cartCtrl', [])

// Cart Controller
.controller('cartCtrl', function($scope, $http, $ionicLoading, CartFactory, UsersFactory, $state, $ionicModal, $ionicPopup, $ionicPopover) {

    // For showing/hiding the shipping address section into modal

    $scope.deliverySelected = true;
    $scope.termsCondition=true;
    $scope.taxRate= parseFloat(localStorage.getItem('taxRate'));
    $scope.deliveryCharge = localStorage.getItem('deliveryCharge');
    $scope.deliveryChargeForShowingOnly = localStorage.getItem('deliveryCharge');
    //console.log($scope.taxRate*10);
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
        var subTotal = parseFloat($scope.subTotal);
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
            console.log("if");
        }
        else{
          $scope.showOnlyAddAddress = false;
           $scope.showAddAddress = true;
           $scope.defaultAdrs = defaultAddress;
           //console.log($scope.defaultAdrs);
           console.log("else");
        }

        $scope.deliveryModal.show();

        //  }
    }

    $scope.close = function() {
        $scope.boolAddNewAddress = false;
    }


    // calcuate tips
    $scope.setTipsPercent = function(val) {


        console.log(val);
        $scope.tips = val;

        $scope.tipsPercent = $scope.foodTotal * ($scope.tips / 100);
        $scope.tipsPercent = $scope.tipsPercent.toFixed(2);
    }

    $scope.setDeliveryCharge = function(val) {

            if(val){
                $scope.deliveryCharge = localStorage.getItem('deliveryCharge');
                $scope.deliveryChargeForShowingOnly = localStorage.getItem('deliveryCharge');
                $scope.deliverySelected = true;
                console.log($scope.deliveryCharge);
              }
              else{
                //$scope.deliveryCharge = 0;
                $scope.deliveryChargeForShowingOnly = 0;
                $scope.pickUp=true;
                $scope.deliverySelected = false;
                console.log($scope.deliveryCharge);
              }

    }

    // Getting the card Type
    var getCardType = function(cardNum){
        cardNum = cardNum.charAt(0);
        if(cardNum == 4){
            return "visa"
        }
        else if(cardNum == 5){
            return "master card"
        }
        else if(cardNum == 3){
            return "american express"
        }
        else if(cardNum == 6){
            return "discover"
        }
    }


    $scope.checkout = function(amnt, deliveryType, tips) {

        $scope.boolPayment = false;

        var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);

        // Making payment

        UsersFactory.getPaymentInfo(userInfo[0].cus_id).then(function(response) {

            var cc = response.data[0];

            console.log(cc);

            var cardType = getCardType(cc.card_number);



            if(!cc){
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Please add an payment.'
                }).then(
                    function(res){
                        $state.go("app.payment");
                    }
                );
            }
            else{

                var nonce = Math.random() * 1000000000000000000;

                var d = new Date();
                var time = d.getTime();

                var apikey = "yfcM9zC93Ixhi1Y8u5d0b8QdbwagCxKh";
                var token = "fdoa-83b6ae2adf296e152fdc15078558582983b6ae2adf296e15";

                var forHmac = {};
                forHmac.time = time;
                forHmac.nonce = nonce;
                forHmac.payload = {
                              "merchant_ref": "Astonishing-Sale",
                              "transaction_type": "purchase",
                              "method": "credit_card",
                              "amount": String(amnt),
                              "partial_redemption": "false",
                              "currency_code": "USD",
                              "credit_card": {
                                "type": String(cardType),
                                "cardholder_name": String(cc.holder_name),
                                "card_number": String(cc.card_number),
                                "exp_date": String(cc.expiration_date),
                                "cvv": String(cc.cvv)
                              }
                            }

                console.log(forHmac.payload);
                alert(JSON.stringify(forHmac.payload));



                //var ref = cordova.InAppBrowser.open("https://savor365.com/api/makePayment?amount=" + amnt + "&cardNumber=" + $scope.cc.card_number + "&cvv=" + $scope.cc.cvv + "&expDate=1018&invNumber=45", "_blank", "location=no");


                // CartFactory.makePayment(amnt, $scope.cc.card_number, $scope.cc.cvv, "1080").then(
                //         function(response){
                //             alert(response)
                //         }
                //     );



                // Getting HMAC authorization for payeezy payemnt

                var getHmac = function(forHmac){

                    $http({
                        method: 'POST',
                        url: 'https://savor365.com/api/hmac',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: forHmac


                    }).then(function(hmacAuth){

                        alert("This is the api key: " + String(apikey));


                        // Making Payment
                        $http({
                            method: 'POST',
                            url: 'https://api-cert.payeezy.com/v1/transactions',
                            headers: {
                                        'apikey' : String(apikey),
                                        'token' : String(token),
                                        'Content-Type' :'application/json',
                                        'Authorization': String(hmacAuth.data),
                                        'nonce': String(nonce),
                                        'timestamp': String(time),

                                    },
                            data: {
                                      "merchant_ref": "Astonishing-Sale",
                                      "transaction_type": "purchase",
                                      "method": "credit_card",
                                      "amount": String(amnt),
                                      "partial_redemption": "false",
                                      "currency_code": "USD",
                                      "credit_card": {
                                        "type": String(cardType),
                                        "cardholder_name": String(cc.holder_name),
                                        "card_number": String(cc.card_number),
                                        "exp_date": String(cc.expiration_date),
                                        "cvv": String(cc.cvv)
                                      }
                                    }

                        }).then(function(response){
                            alert("success ho geya" + JSON.stringify(response));
                            localStorage.removeItem('cartInfo');
                        },function(error){
                            alert("error" + JSON.stringify(error));
                        });





                          }, function(error){

                        alert(JSON.stringify(error))
                    });

                }


                getHmac();


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
            $scope.checkOutInfo.foodTotal = $scope.foodTotal.toFixed(2);
            $scope.checkOutInfo.grandTotal = $scope.grandTotal.toFixed(2);
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
        console.log(localStorage);
        $scope.foods=false;
        $scope.emptyCart=true;
        console.log($scope.emptyCart);
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
