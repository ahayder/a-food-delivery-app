angular.module('app.moreInfoCtrl', [])

// Restaurant more info apage ctrl
.controller('moreInfoCtrl', function ($scope, $stateParams, FoodFactory) {

    var restaurantId = $stateParams.restaurantId;
    localStorage.setItem('resId',restaurantId);

    FoodFactory.getResOpenHours(restaurantId).then(function(response){
        $scope.resOpenHours = response.data;
    });

    FoodFactory.getRestaurantsById(restaurantId).then(function(response){
        $scope.restaurant = response.data[0];
        console.log($scope.restaurant);
    });
    
})