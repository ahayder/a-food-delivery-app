angular.module('app.foodCtrl', [])


// Food order ctrl
.controller("foodsCtrl", function($scope, FoodFactory, $state, $stateParams, $ionicModal, $ionicLoading, CartFactory,$cordovaFacebook, $ionicPopup, UsersFactory, $ionicPopover, $location, $anchorScroll, $ionicScrollDelegate){
    $scope.foodSizeSelected=true;      //variable to check whether food size is selected or not
    $scope.foodExtraSelected=true;     //variable to check whether food extras are selected or not

    $scope.favClass = "not-fav";
	var restaurantId = $stateParams.restaurantId;
    $scope.resId = restaurantId; // For menu popover
    var temp=restaurantId;

    localStorage.setItem('resId',restaurantId);
	$scope.disableCartButton=true;


	FoodFactory.getFoodsByRestaurantId(restaurantId).then(function(response){
		$scope.foods = response.data;

        FoodFactory.getMenus(restaurantId).then(function(response){
            $scope.menus = response.data;
            //ionic hide



            //console.log($scope.menus);
        });

	});

  $ionicLoading.show({
        template: 'Loading...'
    });

    FoodFactory.getRestaurantsById(restaurantId).then(function(response){
        $scope.restaurant = response.data[0];
        // For using in cehckout info

        localStorage.setItem('restaurantInfoForCheckoutInfo',JSON.stringify($scope.restaurant));
        // For using in delivery modal

        localStorage.setItem('deliveryCharge',$scope.restaurant.delivery_charged);
        localStorage.setItem('taxRate',$scope.restaurant.res_tax_rate);
        //console.log($scope.restaurant.res_tax_rate);
        //loading hide code stars
            $ionicLoading.hide();
        //loading hide code ends
    });



	// Code of modal is started
	// Initializing some variables
    // (alert)($scope.price);
	$scope.qty = 1;
	$scope.globalPrice = 0;
	$scope.price = 0;
	$scope.checkOutObj={'foodExtra':[]};

	// Ionic Modal Configuration

    $ionicModal.fromTemplateUrl('templates/modals/order-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {

        $scope.modal = modal;
    });





	// Order Modal
	$scope.orderModal = function(food) {
        $scope.price = 0;
        $scope.globalPrice = 0;
        $scope.qty = 1;
        $scope.modal.show();
		// show loading
		// $ionicLoading.show({
    //   		template: 'Loading...'
    // 	});

    	// Modal View

    	// initializing the food

    	$scope.food = food;

    	// Getting the food sizes .... the price is also here

    	FoodFactory.getFoodSize($scope.food.food_id).then(function(response){
    		$scope.foodSizes = response.data;
    	});

    	// Getting the food extras

    	FoodFactory.getExtrasById($scope.food.food_id).then(function(response){
                //console.log(response.data);
    		var count=0;

    		$scope.foodExtras = response.data;
          console.log(response.data);
    		for(var i=0;i<$scope.foodExtras.length;i++){

    			for(var j=0;j<$scope.foodExtras.length;j++){

    				// Checking if multiple same type exists for not duplication of
    				// Extras heading title in ng-repeat

    				if($scope.foodExtras[i].type == $scope.foodExtras[j].type){

    					count++;

    					if(count>1){

    						$scope.foodExtras[j].bool=false;

    					}
    					else{

    						$scope.foodExtras[i].bool=true;
    					}

    				}
    			}

    			count=0;
    		}
    	});

    	// Getting the extras price

    	FoodFactory.getExtraFoodPrice($scope.food.food_id).then(function(response){
    		$scope.foodExtrasPrice = response.data;
        //console.log($scope.foodExtrasPrice);

    	});

    	// // End Modal View
    	//$ionicLoading.hide();
  	};


  	// Order modal closing function
  	$scope.orderModalClose = function() {
  		$scope.disableCartButton=true;
    	$scope.modal.hide();
  	};

  	$scope.loginThenShare=function(foodName){
  	$cordovaFacebook.login(["public_profile", "email", "user_friends","publish_actions"])
            .then(function(success) {

                $cordovaFacebook.api("me?fields=name,email")
                    .then(function(success) {

                      // **********Facebook Post**********
                        var options = {
                            method: 'feed',
                            link: 'https://savor365.com/',
                            caption: foodName
                        };
                        $cordovaFacebook.showDialog(options)
                        .then(function(success) {
                        console.log(success);
                        }, function (error) {

                        });
                        // **********Facebook Post End**********
                        },
                         function (error) {

                        });

                //////////////////////
            }, function(error) {
                // error
            });
  	};

  	$scope.share = function (foodName) {

    // ngFB.api({
    //     method: 'POST',
    //     path: '/me/feed',
    //     params: {
    //         message: foodName +':'+' By savor365.com'
    //     }
    // }).then(
    //     function () {
    //         (alert)('The session was shared on Facebook');
    //     },
    //     function () {
    //         (alert)('An error occurred while sharing this session on Facebook');
    //     });
    };

  	$scope.$on('$destroy', function() {
  		$scope.disableCartButton=true;
		$scope.modal.remove();
	});

  	// Price calculation

	$scope.setPrice = function(price,size,sizeName){

        $scope.foodSizeSelected=false;


		$scope.disableCartButton=false;
		for(var i=0;i<$scope.checkOutObj.foodExtra.length;i++){
          //console.log($scope.checkOutObj.foodExtra.length);
			$scope.checkOutObj.foodExtra[i].ifChecked=false;

		}

		$scope.checkOutObj.foodExtra = [];

    // if($scope.checkOutObj.sizeInfo!=null){
    //   return;
    // }else{
       $scope.checkOutObj.sizeInfo = {sizeId:size,sizeName:sizeName,sizePrice:price};
    // }

        //testing code starts
		$scope.price = Number(price);
		$scope.globalPrice=$scope.price;
    //console.log($scope.price);

    //testing code ends
		///////////////////////////////////////
    var temp = 0
    for(var j=0;j<$scope.foodExtras.length;j++){

		    for(var i=0;i<$scope.foodExtrasPrice.length;i++){
  				if($scope.foodExtrasPrice[i].extra_food_id==$scope.foodExtras[j].id && $scope.foodExtrasPrice[i].size_name_id==size){

              $scope.foodExtras[j].price1=$scope.foodExtrasPrice[i].price;
  				}
			  }

		}

    for(var i = 0; $scope.foodExtras.length; i++){

      if($scope.foodExtras[i].hasOwnProperty('price1')){
        //$scope.foodExtras[j].price1 = 0;
      }
      else{
        $scope.foodExtras[i].price1 = 0;
      }
    }
    //console.log($scope.foodExtras);


	};


	// for Increasing and Decreasing Qty

	$scope.increase=function(){

		$scope.qty+=1;
		//(alert)($scope.price);
		$scope.price=$scope.globalPrice*$scope.qty;

	}

	$scope.decrease=function(){
    if($scope.qty>0){
      $scope.qty-=1;
    }

		$scope.price=$scope.globalPrice*$scope.qty;
	}


	$scope.addExtraFood=function(price,ifChecked,foodExtra1){

		if(ifChecked){
      //testing code starts
			$scope.price=Number($scope.price)+($scope.qty*Number(price));
      //testing code ends
			$scope.globalPrice=$scope.price;
			$scope.checkOutObj.foodExtra.push(foodExtra1);
      $scope.foodExtraSelected=false;
		}
		else{
			$scope.price=Number($scope.price)-Number(price);
			$scope.globalPrice=$scope.price;
			for(var i=0;i<$scope.checkOutObj.foodExtra.length;i++){
				if($scope.checkOutObj.foodExtra[i].id==foodExtra1.id){
					$scope.checkOutObj.foodExtra.splice(i,1);
				}
			}
		}
	}

	$scope.addToCart=function(instruction){
		// alert(localStorage.getItem('loggedIn'));
		if(!JSON.parse(localStorage.getItem('loggedIn'))) {
			$state.go('app.login');
			$scope.orderModalClose();
			return;
		}
    console.log(instruction+" hi");

		$scope.checkOutObj.totalPrice = $scope.price;
		$scope.checkOutObj.mainFood = $scope.food;
		$scope.checkOutObj.qty = $scope.qty;
    $scope.checkOutObj.specialInstruction = instruction;
		CartFactory.saveIntoCart($scope.checkOutObj);
    console.log($scope.checkOutObj);

		$state.go("app.cart");
		$scope.orderModalClose();

	}



    var getFav = function(){

        var resId = localStorage.getItem('resId');

        if(window.localStorage['loggedInUserInofos']){

            var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);

            var userId = userInfo[0].cus_id;
        }
        else{
            userId = false;
        }



        if(userId){
            UsersFactory.getFavs(userId).then(function(response){
                var res = response.data;
                console.log(res);

                for(var i=0; i < res.length; i++){
                    if(res[i].res_id == resId){
                        $scope.favClass = "assertive";
                    }
                    else{
                        $scope.favClass = "not-fav";
                    }
                }

            }, function(error){
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Opps.. something wrong ' + error.message
                });
                $scope.favClass = "not-fav";
            });
        }
        else{
            $scope.favClass = "not-fav";
        }


    }

    getFav();



    // Making Favourite
    $scope.makeFav = function(resId){

        console.log("dhuksi");

        var resId = localStorage.getItem('resId');

        if(window.localStorage['loggedInUserInofos']){
            var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);

            var userId = userInfo[0].cus_id;
            console.log(userId);
        }
        else{
            userId = false;
        }


        // if already faved then unfaved
        // else fav


        // Checking if the restaurant already favourited or not
        if(userId){
            UsersFactory.getFavs(userId).then(function(response){
                var res = response.data;

                if( res.length == 0){
                  // Now save as fouvourite
                  UsersFactory.saveFav(resId, userId).then(function(response){
                      console.log(response.data);
                      if(response.data > 0){


                          $scope.favClass = "assertive";
                      }
                      else{

                          $scope.favClass = "not-fav";
                      }
                  }),function(error){

                      $scope.favClass = "not-fav";
                  }
                }
                else{
                  for(var i=0; i < res.length; i++){

                      if(res[i].res_id == resId){


                          UsersFactory.deleteFav(resId, userId).then(function(response){
                            $scope.favClass = "not-fav";
                          },
                          function(error){
                            $scope.favClass = "assertive";
                          });

                      }
                      else{

                          // Now save as fouvourite
                          UsersFactory.saveFav(resId, userId).then(function(response){
                              console.log(response.data);
                              if(response.data > 0){
                                  $scope.favClass = "assertive";
                              }
                              else{
                                  $ionicPopup.alert({
                                      title: 'Error!',
                                      template: 'Opps.. something wrong '
                                  });
                                  $scope.favClass = "not-fav";
                              }
                          }),function(error){
                              $ionicPopup.alert({
                                  title: 'Error!',
                                  template: 'Opps.. something wrong ' + error.message
                              });
                              $scope.favClass = "not-fav";
                          }

                      }
                  }
                }


            }, function(error){
                $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Opps.. something wrong ' + error.message
                });
                $scope.favClass = "not-fav";
            });
        }
        else{
            $scope.favClass = "not-fav";
        }


    }
      //testing loading code starts


        //testing loading code ends




    $scope.menuPopover = function($event){


        $ionicPopover.fromTemplateUrl('templates/popovers/menu-popover.html', {
                scope: $scope
            }).then(function(popover) {
                $scope.popover = popover;
                $scope.popover.show($event);
            });

    }

    $scope.goToMenu = function(id){



        $location.hash("menu-"+id);

        var handle =     $ionicScrollDelegate.$getByHandle('content');
        handle.anchorScroll();

        $scope.popover.hide();
            $scope.$on('$destroy', function() {
                $scope.popover.remove();
            });

    }


});
