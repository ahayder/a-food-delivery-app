angular.module('app.paymentCtrl', [])


// All about payment
.controller('paymentCtrl', function($scope, $ionicLoading, $ionicModal, $ionicPopup, $state, UsersFactory, $rootScope, $ionicHistory) {


    var user = JSON.parse(window.localStorage['loggedInUserInofos']);

    var getInfo=function (){

        UsersFactory.getPaymentInfo(user[0].cus_id).then(function(response) {
              $scope.cards = response.data;
              console.log(response.data);
              if($scope.cards){
                  $scope.emptyPage = "";
              }
              else{
                  $scope.emptyPage = "empty-page";
              }
        },
        function(error) {
            $ionicPopup.alert({
                title: "Error!",
                template: "Problem getting cards information."
            });
            console.log(error.message);
        });

      // End of call

    }

    getInfo();


    $scope.selectThisCardForPayment = function(card){

        $scope.selectedCard = card.id;
        $rootScope.cardForPayment = card;
        getInfo();

        if($ionicHistory.backTitle() == 'Cart'){
            $state.go("app.cart");
        }
    }

    $scope.savePaymentInfos = function(payment) {
            if (!$scope.invalidNumber) {

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
                    getInfo();
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


});
