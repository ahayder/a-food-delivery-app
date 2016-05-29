angular.module('app.addressesCtrl', [])


// Addina a new address and showing the addresses list
.controller('addressesCtrl', function($scope, $ionicLoading, $ionicModal, UsersFactory, $ionicPopup, $state) {
    //alert('holaaa');
    var user = JSON.parse(window.localStorage['loggedInUserInofos']);

    UsersFactory.getAddresses(user[0].cus_id).then(function(response) {
        $scope.addresses = response.data;
    });


    $scope.saveAddress = function(address) {
        //alert(JSON.stringify(address));

        $ionicLoading.show({
            template: 'Saving into savor365 database.'
        });

        UsersFactory.addressSave(user[0].cus_id, address).then(function(response) {
            $scope.address = response.data;
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

});