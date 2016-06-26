angular.module('app.addressesCtrl', [])


// Addina a new address and showing the addresses list
.controller('addressesCtrl', function($scope, $ionicLoading, $ionicModal, UsersFactory, $ionicPopup, $state, $rootScope, $ionicHistory) {
    //alert('holaaa');
    var user = JSON.parse(window.localStorage['loggedInUserInofos']);


    var getAddrs = function(){

        UsersFactory.getAddresses(user[0].cus_id).then(function(response) {
            $scope.addresses = response.data;

            // Saving it for to use in checkout
            for(var i = 0; i < $scope.addresses.length; i++){
                if($scope.addresses[i].adrs_type == '1'){
                    $rootScope.selectedShippingAddress = $scope.addresses[i];
                }
            }

            console.log($scope.addresses);
        });

    }

    getAddrs();
    


    $scope.saveAddress = function(address) {
        //alert(JSON.stringify(address));

        $ionicLoading.show({
            template: 'Saving into savor365 database.'
        });

        UsersFactory.addressSave(user[0].cus_id, address).then(function(response) {
            $scope.address = response.data;
            $ionicLoading.hide();
            $scope.closeModal();
            getAddrs();
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


    // form old address ctrl

    $scope.makeDafultAddress = function(id) {
        //alert(id);
        UsersFactory.makeThisAddressDefault(id, user[0].cus_id).then(function() {
            $ionicPopup.alert({
                title: 'Success!',
                template: 'Successfully saved'
            });
            getAddrs();
            if($ionicHistory.backTitle() == 'Cart'){
                $state.go("app.cart");
            }
        }, function(error) {
            console.log("Can't save");
        });
    }

});