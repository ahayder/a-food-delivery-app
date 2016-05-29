angular.module('app.favouriteCtrl', [])

// Making a restarant favourite
.controller('favouriteCtrl', function($scope, $ionicPopup, $q, UsersFactory, FoodFactory) {

    var getFav = function(){

        var resId = localStorage.getItem('resId');

        var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);

        var userId = userInfo[0].cus_id;

        

        UsersFactory.getFavs(userId).then(function(response){

            var res = response.data;
            $scope.restaurantsInfo = [];
            var loopPromises = [];
            //console.log(res);

            angular.forEach(res, function(r){
                var deferred = $q.defer();
                loopPromises.push(deferred.promise);
                FoodFactory.getRestaurantsById(r.res_id).then(function(response){
                    //console.log(response.data[0]);
                    $scope.restaurantsInfo.push(response.data[0]);
                    //console.log($scope.restaurantsInfo);
                    deferred.resolve();
                });
            })

            $q.all(loopPromises).then(function(){
                //console.log($scope.restaurantsInfo);
                $scope.restaurants = $scope.restaurantsInfo;
                //console.log($scope.restaurants);

            });
            
        }, function(error){
            $ionicPopup.alert({
                title: 'Error!',
                template: 'Opps.. something wrong ' + error.message
            });
        });
        
    }

    getFav();

});