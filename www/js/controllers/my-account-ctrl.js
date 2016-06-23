angular.module('app.myAccountCtrl', [])

// Mayaccount page ctrl
.controller('myAccountCtrl', function($scope, $ionicLoading, $ionicModal, UsersFactory) {

	$ionicLoading.show({
      template: 'Logging in...'
    });
    var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);

    console.log(userInfo);

    UsersFactory.getUserInfo(userInfo[0].cus_email).then(function(response) {
        $scope.user = response.data[0];
        console.log($scope.user);
        $ionicLoading.hide();
    });

});