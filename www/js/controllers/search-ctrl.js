angular.module('app.searchCtrl', [])

// Food search logics
.controller("searchCtrl", function($scope, $ionicPopup, $cordovaGeolocation, LocationFactory, SearchFactory, $ionicLoading, FoodFactory, $state, $window, $http, $ionicPopover, UsersFactory,$ionicModal) {

        $ionicLoading.show({
            template: 'Loading...'
        });
          //close button function

          $scope.preferenceModalClose = function() {
            $scope.disableCartButton=true;
            $scope.preferenceModal.hide();
          };

          $scope.selectedPreference=function(value){
            window.localStorage.preferenceType=value;
            $scope.preferenceModal.hide();
            console.log(value);

          };



        var initialization = function(zipcode) {
            //alert(zipcode);
            $ionicLoading.show({
                template: 'Loading...'
            });

            // Getting current position
            var posOptions = {
                timeout: 10000,
                enableHighAccuracy: false
            };
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function(position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    //var myLatLng = {lat,lng};


                    // Getting the zip code using lat lng
                    LocationFactory.getZipCode(lat, lng).then(function(response) {

                        $scope.zipcode = response.data.postalCodes[0].postalCode;
                        console.log($scope.zipcode);

                        var searchResult = [];

                        // Getting the restaurants by zipcode //Should be in one query//

                        SearchFactory.searchByZipCode($scope.zipcode).then(function(response) {
                            var restaurants = response.data;
                            // Getting the restaurants

                            for (var i = 0; i < restaurants.length; i++) {
                                FoodFactory.getRestaurantsById(restaurants[i].res_id).then(function(res) {
                                    searchResult.push(res.data[0]);
                                });
                            }

                            SearchFactory.saveSearchResult(searchResult);
                            $scope.searchResult = SearchFactory.getSearchResult();

                            // maybe here

                        },function(error){
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'Error!',
                                template: 'Problem getting restaurants from server.' + error.message
                            });
                        });

                    $ionicLoading.hide();

                    //Preference modal starts here
                    $ionicModal.fromTemplateUrl('templates/modals/preference-modal.html', {
                        scope: $scope,
                        animation: 'slide-in-up'
                    }).then(function(preferenceModal) {
                        $scope.preferenceModal = preferenceModal;

                    });


                    setTimeout(function(){
                      $scope.openModal = function() {
                        if(window.localStorage.preferenceType==null){
                             $scope.preferenceModal.show();
                        }else{
                          return;
                        }

                                 }();

                       }
                          , 2000);

                  //Preference modal ends here

                    },function(error){
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Error!',
                            template: 'Problem getting your zipcode. Search manually.' + error.message
                        });
                    });

                }, function(err) {
                    $ionicPopup.alert({
                        title: 'Error!',
                        template: 'Opps.. something wrong ' + err.message
                    });
                    console.log("Opps! something wrong here " + err.message);
                    $ionicLoading.hide();
                });

        }

        $scope.favClass = "not-fav";



        initialization();



        // Searching by location
        $scope.searchByLocation = function() {

            $ionicLoading.show({
                template: 'Loading...'
            });

            var searchResult = [];

            // Getting the restaurants by zipcode //Should be in one query//

            SearchFactory.searchByZipCode($scope.zipcode).then(function(response) {
                var restaurants = response.data;
                // Getting the restaurants

                for (var i = 0; i < restaurants.length; i++) {
                    FoodFactory.getRestaurantsById(restaurants[i].res_id).then(function(res) {
                        searchResult.push(res.data[0]);
                    });
                }


                $ionicLoading.hide();
                $state.go("app.search");
                SearchFactory.saveSearchResult(searchResult);

            });
        }

        $scope.searchByZipCode = function(zipcode) {
            //alert(zipcode);
            $ionicLoading.show({
                template: 'Loading...'
            });

            var searchResult = [];

            // Getting the restaurants by zipcode //Should be in one query//

            SearchFactory.searchByZipCode(zipcode).then(function(response) {
                var restaurants = response.data;
                // Getting the restaurants

                for (var i = 0; i < restaurants.length; i++) {
                    FoodFactory.getRestaurantsById(restaurants[i].res_id).then(function(res) {
                        searchResult.push(res.data[0]);
                    });
                }


                $ionicLoading.hide();
                SearchFactory.saveSearchResult(searchResult);
                $scope.searchResult = SearchFactory.getSearchResult();
                console.log($scope.searchResult);
            });

        }



        // Sorting functions

        $scope.cuisinesPopover = function($event){


            $ionicPopover.fromTemplateUrl('templates/popovers/cuisines-popover.html', {
                    scope: $scope
                }).then(function(popover) {
                    $scope.popover = popover;
                });


            SearchFactory.getCuisines().then(function(response){
                $scope.cuisines = response.data;
                    $scope.popover.show($event);


            });

        }

        $scope.closePopover = function(id){
            $scope.popover.hide();
            $scope.$on('$destroy', function() {
                $scope.popover.remove();
            });

            // Getting data by cuisine
            $ionicLoading.show({
                template: 'Loading...'
            });
            var searchResult = [];
            SearchFactory.searchByCuisine(id).then(function(response){
                var resIds = response.data;

                if(resIds.length == 0){
                    $scope.searchResult = false;
                    $ionicLoading.hide();
                }
                else{

                    for (var i = 0; i < resIds.length; i++) {
                        FoodFactory.getRestaurantsById(resIds[i]).then(function(res) {
                            searchResult.push(res.data[0]);
                        });
                    }

                    SearchFactory.saveSearchResult(searchResult);
                    $scope.searchResult = SearchFactory.getSearchResult();
                    $ionicLoading.hide();
                }



            });
        }



        $scope.filterPopover = function($event){

            $ionicPopover.fromTemplateUrl('templates/popovers/filter-popover.html', {
                    scope: $scope
                }).then(function(popover) {
                    $scope.filterPop = popover;
                    $scope.filterPop.show($event);
                });



        }

        $scope.closeFilterPopover = function(){

            $scope.filterPop.hide();
            $scope.$on('$destroy', function() {
                $scope.filterPop.remove();
            });


            // Getting data by free delivery charge
            $ionicLoading.show({
                template: 'Loading...'
            });

            var searchResult = [];
            SearchFactory.searchByFreeDelivery().then(function(response){

                var resIds = response.data;

                if(resIds.length == 0){
                    $scope.searchResult = false;
                    $ionicLoading.hide();
                }
                else{

                    for (var i = 0; i < resIds.length; i++) {
                        FoodFactory.getRestaurantsById(resIds[i]).then(function(res) {
                            searchResult.push(res.data[0]);
                        });
                    }

                    SearchFactory.saveSearchResult(searchResult);
                    $scope.searchResult = SearchFactory.getSearchResult();
                    $ionicLoading.hide();
                }


            });

        }



});
