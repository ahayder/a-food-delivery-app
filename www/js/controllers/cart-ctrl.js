angular.module('app.cartCtrl', [])

// Cart Controller
.controller('cartCtrl', function($scope, $http, $ionicLoading, CartFactory, UsersFactory, $state, $ionicModal, $ionicPopup, $resource) {

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

        }, function(error) {
            $ionicLoading.hide();

            $ionicPopup.alert({
                title: 'Error!',
                template: 'Opps.. something wrong'
            });
            console.log("eror is address saving" + error);
        });

    }

    $scope.openDeliveryModal = function() {
        //    if (localStorage.getItem('defaultAddress') != null) {
        //alert(localStorage.getItem('defaultAddress'));
        var defaultAddress = JSON.parse(localStorage.getItem('defaultAddress'));

        // if default address value is null then don't show the address panel
        if (defaultAddress == null) {
            $scope.showAddAddress = false;
        }
        else{
           $scope.showAddAddress = true;
           $scope.defaultAdrs = defaultAddress;
        }
        
        $scope.deliveryModal.show();

        //  }
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

});