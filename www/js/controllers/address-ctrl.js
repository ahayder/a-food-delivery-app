angular.module('app.addressCtrl', [])

// Single address view page controller
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

});