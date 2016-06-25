angular.module('app.cartCtrl', [])

// Cart Controller
.controller('cartCtrl', function($scope, $http, $ionicLoading, CartFactory, UsersFactory, $state, $ionicModal, $ionicPopup, $ionicPopover, FoodFactory) {

    // For showing/hiding the shipping address section into modal
    $scope.listCanSwipe=true;
    $scope.deliverySelected = true;
    $scope.termsCondition=true;
    $scope.taxRate= parseFloat(localStorage.getItem('taxRate'));
    $scope.deliveryCharge = localStorage.getItem('deliveryCharge');
    $scope.deliveryChargeForShowingOnly = localStorage.getItem('deliveryCharge');

    // logged in user info
    var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);

    // Getting Address
    // Saving the user's defau lt address in local storage

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









    $scope.emptyCart = true;
    $scope.foodsForInvoice = CartFactory.getCartInfo();

    $scope.resId = localStorage.getItem('resId');

    var grandTotal = 0;

    if ($scope.foodsForInvoice) {

        console.log("showing foodFor Invoice");
        console.log($scope.foodsForInvoice.qty);
        $scope.emptyCart = false;
        var temp = [];

        for (var i = 0; i < $scope.foodsForInvoice.length; i++) {

            var food = {
                name: $scope.foodsForInvoice[i].mainFood.food_name,
                size: $scope.foodsForInvoice[i].sizeInfo.sizeName,
                qty: $scope.foodsForInvoice[i].qty,
                price: parseFloat($scope.foodsForInvoice[i].totalPrice),
                specialInstruction: $scope.foodsForInvoice[i].specialInstruction

            }

            temp.push(food);
            temporaray = $scope.foodsForInvoice[i].totalPrice;
            grandTotal += temporaray;
        }
        var moga = parseFloat(grandTotal).toFixed(2);
        $scope.subTotal = parseFloat(moga);

        // Calculating grandTotal excluding tips
        var subTotal = $scope.subTotal;
        var deliveryCharge = parseFloat($scope.deliveryCharge);
        var taxRate = parseFloat($scope.taxRate);

        var tax = subTotal*(taxRate/100);
        console.log("Tax rate calculated "+tax);
        var tips = subTotal*($scope.percentage/100);

        $scope.gTotal = subTotal + deliveryCharge + tax;
        console.log("The gTotal is:"+$scope.gTotal);
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
    if ($scope.foodsForInvoice != undefined) {
        if ($scope.foodsForInvoice.length < 1) {
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

          // for checkout object
          $scope.billingAddress = billingAddress;

          // Now saving into Database
          $scope.billAddr = {};

          UsersFactory.addressSave(user[0].cus_id, $scope.address).then(function(response) {

              alert("saved into datbase");

              $scope.showAddAddress = true;
              //testing code starts here

              $scope.showOnlyAddAddress = false;
              //testing code ends above
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
        console.log(address);

        $scope.defaultAdrs.cus_name = address.cus_name;
        $scope.defaultAdrs.addrs = address.addrs;
        $scope.defaultAdrs.state = address.state;
        $scope.defaultAdrs.town = address.town;
        $scope.defaultAdrs.zip_code = address.zip_code;
        $scope.defaultAdrs.phone = address.phone;
        $scope.defaultAdrs.country = "USA";

        $scope.popover.hide();
        $scope.$on('$destroy', function() {
            $scope.popover.remove();
        });

    }

    //same as shipping code for billing address starts
      $scope.sameAsShipping=function(billing){

              if(billing=="sameAsShipping"){
                  $scope.billingAddress = $scope.defaultAdrs;
              }
              else{
                return;
              }
      };
      $scope.sameAsShipping();

    //same as shipping code for billing address ends



    // getting addressess- user will select an address from these addresses
    $scope.changeAddress = function($event){

        //testing code below
        var user = JSON.parse(window.localStorage['loggedInUserInofos']);

        UsersFactory.getAddresses(user[0].cus_id).then(function(response) {

            $scope.addrsses = response.data;
            console.log(response.data);
            $ionicPopover.fromTemplateUrl('templates/popovers/selectAddressPopover.html', {
                scope: $scope
            }).then(function(popover) {
                $scope.popover = popover;
                $scope.popover.show($event);

            });





        });


    }

    $scope.openDeliveryModal = function(instructionCart) {

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

        //special instruction cartInfo
        $scope.cartInstruction = instructionCart;

    }

    // add new Shippig Address close
    $scope.close = function() {
        $scope.boolAddNewAddress = false;
    }


    // calcuate tips
    $scope.calculateTip = function(val) {


        //console.log(val);
        $scope.tips = val;

        var moga2 = $scope.foodTotal * ($scope.tips / 100);
        $scope.tipsPercent = moga2.toFixed(2);

    }

    $scope.setDeliveryCharge = function(val) {

              if(val === 0){
                $scope.deliveryCharge = localStorage.getItem('deliveryCharge');
                $scope.deliveryChargeForShowingOnly = localStorage.getItem('deliveryCharge');
                $scope.deliverySelected = true;
                //console.log($scope.deliveryCharge);
              }
              else if(val === 1){
                //$scope.deliveryCharge = 0;
                $scope.deliveryChargeForShowingOnly = 0;
                $scope.deliverySelected = false;
                //console.log($scope.deliveryCharge);
              }
              else{
                $scope.deliveryChargeForShowingOnly = 0;
                $scope.deliverySelected = false;
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

    // Getting Card Info
    UsersFactory.getPaymentInfo(userInfo[0].cus_id).then(function(response) {

        var cc = response.data;
        $scope.ccForShowingOnly = cc[0];
        $scope.payemntCardInfo = cc[0];
        console.log(response.data);

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
    // End of getting cardinfo



    //Payment PopOver code start
    $scope.changeCard = function($event){

            $ionicPopover.fromTemplateUrl('templates/popovers/selectCardPopover.html', {
                scope: $scope
            }).then(function(popover) {
                $scope.popover2 = popover;
                $scope.popover2.show($event);

            });


      }



    //Payment PopOver code ends
    $scope.makeThisPaymentCard=function(c){

        $scope.payemntCardInfo = c;

        $scope.ccForShowingOnly = c;

        $scope.popover2.hide();
        $scope.$on('$destroy', function() {
            $scope.popover2.remove();
        });


    }

    //Cart Edit function Starts

        //Edit cart item quantity
        $scope.editQuantity=function(index){

            //copied alert below

            $scope.showPopup = function() {
                $scope.data = {};

                // An elaborate, custom popup
                var myPopup = $ionicPopup.show({
                  template: '<input type="text" ng-model="data.q">',
                  title: 'Change quantity',
                  scope: $scope,
                  buttons: [
                    { text: 'Cancel',
                    onTap: function(e) {
                            myPopup.close();
                    } },
                    {
                      text: '<b>Save</b>',
                      type: 'button-assertive',
                      onTap: function(e) {
                        if (!$scope.data.q) {
                          //don't allow the user to close unless he enters wifi password
                          e.preventDefault();

                        } else {
                          console.log($scope.data.q);
                          if($scope.foodsForInvoice[index].qty>0){
                             subTotal=subTotal/$scope.foodsForInvoice[index].qty;
                             tax=tax/$scope.foodsForInvoice[index].qty;
                             $scope.foodsForInvoice[index].qty=$scope.data.q;
                             subTotal=subTotal*$scope.data.q;
                             tax=subTotal*(taxRate/100)
                             $scope.subTotal=subTotal;
                             gTotal=subTotal+deliveryCharge+(tax);
                             $scope.gTotal=gTotal;
                             console.log(subTotal);
                             console.log(tax+ "Tax");
                          }


                    console.log("checking foodinvoice");
                    console.log($scope.foodsForInvoice[index].qty);
                    // return $scope.data.q;


                }
              }
            }
          ]
        });

        myPopup.then(function(res) {
          console.log('Tapped!', res);

          console.log($scope.foodsForInvoice[index].qty);
          console.log($scope.data.q);
        });


      }();


              //copied alert above
        };





    //cart edit function ends

    //Function for cart item slide delete starts
    $scope.deleteBySwipe=function(index){

          $scope.foodsForInvoice.splice(index, 1);
          console.log($scope.foodsForInvoice);
    };
    //Function for cart item slide delete ends





    $scope.checkout = function(deliveryType, tipPercetage,instructionCart) {

        //--------
        $ionicLoading.show({
            template: 'Payment is processing...'
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
        console.log(time);
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
        checkOutInfo.cartItem = $scope.foodsForInvoice;


        //Address
        checkOutInfo.shippingAddress = $scope.defaultAdrs;


        // billingAddress
        checkOutInfo.billingAddress = $scope.billingAddress;


        // Checkout foods
        // checkOutInfo.foods = $scope.foods;



        // SubTotal
        checkOutInfo.subTotal = $scope.subTotal;


        //Grand Total
        if(deliveryType == 'delivery'){
            var boroMoga = $scope.gTotal + ($scope.subTotal * tipPercetage/100);
            checkOutInfo.grandTotal = boroMoga.toFixed(2);
        }
        else{
          var akhriMoga = $scope.gTotal + ($scope.subTotal * tipPercetage/100) - $scope.deliveryCharge;
            checkOutInfo.grandTotal = akhriMoga.toFixed(2);
        }
        //checkOutInfo.grandTotal = 0.1;


        // Delivery charge
        checkOutInfo.deliveryCharge = $scope.deliveryCharge;


        // Tax
        checkOutInfo.tax = $scope.subTotal * ($scope.taxRate/100);


        // Tips percentage
        checkOutInfo.tips = $scope.subTotal * tipPercetage/100;


        // Speacial Intructions cart
        checkOutInfo.cartInstruction = $scope.cartInstruction;


        //console.log(checkOutInfo);

        //alert(JSON.stringify(checkOutInfo));
        // console.log(instructionCart);
        //return;


        // End of object building for checkout
        /////////////////////////////////////////////////////////////
        ///////////////////----------------!!------------------------






        // Making payment Starts here

        $scope.boolPayment = false;

        // payemnt object
        var paymentInfo = {}


        // Card Info
        paymentInfo.cardInfo = $scope.payemntCardInfo;
        console.log($scope.payemntCardInfo);


        // Card type
        var ccType = getCardType($scope.payemntCardInfo.card_number);
        paymentInfo.cardType = ccType;


        // Order Number
        paymentInfo.orderNo = orderNo;


        // User Info
        paymentInfo.userinfo = userInfo[0];


        // Grand Total
        paymentInfo.amount = checkOutInfo.grandTotal


        //console.log(paymentInfo);

        checkOutInfo.payment = paymentInfo;
        console.log(checkOutInfo);
        return;

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

                    // saving payment informations to checkout obj for saving into order info table
                    //checkOutInfo.payment = paymentInfo;
                    $ionicLoading.show({
                        template: 'Order is confirming!!'
                    });


                    $http({
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
                        $state.go("app.search");
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
                alert(JSON.Stringify(error.message));
            });
            // end of makePayment()
        }

        //makePayment();



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
console.log($scope.foods);
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

      console.log(localStorage.getItem("userPreference"));


});
