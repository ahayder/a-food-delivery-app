angular.module('app.orderHistoryCtrl', [])


// Order history page ctrl
.controller('orderHistoryCtrl', function($scope, $ionicLoading, $ionicModal, $http, FoodFactory) {
    // console.log(localStorage.getItem('loggedInUserInofos'));
    var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);
    console.log(userInfo[0].cus_id);
    $http.get('https://savor365.com/api/orderHistory?cusId=' + Number(userInfo[0].cus_id)).success(function(data) {
        console.log(data);
    });

});