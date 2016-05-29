angular.module('app.orderStatusCtrl', [])


// Order status apge ctrl in future it'll show the driver location
.controller('orderStatusCtrl', function ($scope, UsersFactory, $ionicPopup) {

    $scope.orderStat = [];

    var user = JSON.parse(localStorage.getItem('loggedInUserInofos'));


    UsersFactory.getLastOrderStatus(user[0].cus_id).then(function(response){

        var res = response.data;
        
        if(res.length > 0){
            $scope.orderStat = res[0];
            console.log(res);
        }
        else{
            $scope.orderStat = false;
        }
    });
});