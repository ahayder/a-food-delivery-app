angular.module('app.paymentCtrl', [])


// All about payment
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


});