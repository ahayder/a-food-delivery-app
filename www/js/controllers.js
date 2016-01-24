angular.module('app.controllers', [])

.controller('appCtrl', ['$scope', '$state', function ($scope, $state) {

	$scope.login = true;

    var loggedIn = window.localStorage['loggedIn'];

    if(loggedIn === "true"){
    	$scope.login = true;
       	$state.go("app.tabs.cart"); //app.tabs.search
    }
    else{
      	$state.go("app.login");
      	$scope.logoutMessage = false;
    }

    $scope.logout = function(){

       	window.localStorage['loggedIn'] = "false";

       	$scope.logoutMessage = true;
       	$scope.login = false;
      	$state.go("app.login");
      	
      	
    }

    $scope.$watch(function($scope) {
    	$scope.login;
    });

}])


.controller('searchCtrl', ['$scope', '$cordovaGeolocation', 'LocationFactory', 'SearchFactory', '$ionicLoading', 'FoodFactory', '$state',
	function($scope, $cordovaGeolocation, LocationFactory, SearchFactory, $ionicLoading, FoodFactory, $state) {

	$ionicLoading.show({
  		template: 'Loading...'
	});

	// Map Init
	$scope.initMap = function() {

		// Getting current position

		var posOptions = {timeout: 10000, enableHighAccuracy: false};
		  $cordovaGeolocation
		    .getCurrentPosition(posOptions)
		    .then(function (position) {
		      var lat  = position.coords.latitude;
		      var lng = position.coords.longitude;
		      var myLatLng = {lat, lng};

		    // Create a map object and specify the DOM element for display.
			var map = new google.maps.Map(document.getElementById('map'), {
			center: myLatLng,
			scrollwheel: false,
			zoom: 15
			});

			// Create a marker and set its position.
			var marker = new google.maps.Marker({
				map: map,
				position: myLatLng,
				title: 'You are here'
			});

			var infowindow = new google.maps.InfoWindow({
			    content: "You are here"
			  });

			infowindow.open(map, marker);


			// Getting the zip code using lat lng
			LocationFactory.getZipCode(lat, lng).then(function(response){
				$scope.zipcode = response.data.postalCodes[0].postalCode;
				$ionicLoading.hide();
			});

		    }, function(err) {
		      console.log("Opps! something wrong here");
		      $ionicLoading.hide();
	    });


		
	}

	

	$scope.initMap();


	// Searching by location

	$scope.searchByLocation = function(){
		$ionicLoading.show({
      		template: 'Loading...'
    	});

    	var searchResult = [];

		// Getting the restaurants by zipcode //Should be in one query//

		SearchFactory.searchByZipCode($scope.zipcode).then(function(response){
			var restaurants = response.data;
			// Getting the restaurants

			for(var i = 0; i < restaurants.length; i++){
				FoodFactory.getRestaurantsById(restaurants[i].res_id).then(function(res){
					searchResult.push(res.data[0]);
				});
			}


			$ionicLoading.hide();
			$state.go("app.tabs.searchResult");
			SearchFactory.saveSearchResult(searchResult);

		});
	}

}])




.controller("searchResultCtrl", ['$scope', 'SearchFactory', function($scope, SearchFactory){

	$scope.searchResult = SearchFactory.getSearchResult();
	
}])



.controller("foodsCtrl", ['$scope', 'FoodFactory', '$stateParams', '$ionicModal', '$ionicLoading', '$state', 'CartFactory',
	function($scope, FoodFactory, $stateParams, $ionicModal, $ionicLoading, $state, CartFactory){

	var restaurantId = $stateParams.restaurantId;

	FoodFactory.getFoodsByRestaurantId(restaurantId).then(function(response){
		$scope.foods = response.data;
	});



	// Code of modal is started
	/////////////////////////////
	/////////////////////////////





	// Initializing some variables

	$scope.qty = 1;
	$scope.globalPrice = 0;
	$scope.price = 0;
	$scope.checkOutObj={'foodExtra':[]};

	// Ionic Modal Configuration
	$ionicModal.fromTemplateUrl('templates/order-modal.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
	});


	// Order Modal
	$scope.orderModal = function(food) {
		$scope.modal.show();
		// show loading
		$ionicLoading.show({
      		template: 'Loading...'
    	});



    	// Modal View

    	// initializing the food

    	$scope.food = food;



    	// Getting the food sizes .... the price is also here

    	FoodFactory.getFoodSize($scope.food.food_id).then(function(response){
    		$scope.foodSizes = response.data;
    	});



    	// Getting the food extras

    	FoodFactory.getExtrasById($scope.food.food_id).then(function(response){
    		
    		var count=0;

    		$scope.foodExtras = response.data;

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
    	});



    	// End Modal View
    	
		
    	$ionicLoading.hide();
  	};



  	// Order modal closing function

  	$scope.orderModalClose = function() {
    	$scope.modal.hide();
  	};

  	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});



  	// Price calculation

	$scope.setPrice = function(price,size,sizeName){
		
		for(var i=0;i<$scope.checkOutObj.foodExtra.length;i++){

			$scope.checkOutObj.foodExtra[i].ifChecked=false;

		}

		$scope.checkOutObj.foodExtra = [];

		$scope.checkOutObj.sizeInfo = {sizeId:size,sizeName:sizeName,sizePrice:price};
		
		$scope.price = Number(price) + $scope.globalPrice;
		$scope.globalPrice=$scope.price;
		///////////////////////////////////////
		for(var i=0;i<$scope.foodExtrasPrice.length;i++){
			for(var j=0;j<$scope.foodExtras.length;j++){
				if($scope.foodExtrasPrice[i].extra_food_id==$scope.foodExtras[j].id && $scope.foodExtrasPrice[i].size_name_id==size){
					$scope.foodExtras[j].price1=$scope.foodExtrasPrice[i].price;
				}
			}
		}
    	
	}


	// for Increasing and Decreasing Qty

	$scope.increase=function(){

		$scope.qty+=1;
		//alert($scope.price);
		$scope.price=$scope.globalPrice*$scope.qty;

	}

	$scope.decrease=function(){

		$scope.qty-=1;
		$scope.price=$scope.globalPrice*$scope.qty;
	}


	$scope.addExtraFood=function(price,ifChecked,foodExtra1){
		
		if(ifChecked){
			$scope.price=Number($scope.price)+Number(price);	
			$scope.globalPrice=$scope.price;
			$scope.checkOutObj.foodExtra.push(foodExtra1);
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

	$scope.addToCart=function(){

		$scope.checkOutObj.totalPrice = $scope.price;
		$scope.checkOutObj.mainFood = $scope.food;
		$scope.checkOutObj.qty = $scope.qty;
		$scope.checkOutObj.specialInstruction = $scope.instruction;

		CartFactory.saveIntoCart($scope.checkOutObj);

		$state.go("app.tabs.cart");

		$scope.orderModalClose();
	}


}])











  
.controller('orderCtrl', ['$scope', 'FoodFactory', '$ionicModal', '$ionicLoading', 
	function($scope, FoodFactory, $ionicModal, $ionicLoading) {

	// Getting Foods	
	var fetchFoods = function(){
		// show loading
		$ionicLoading.show({
      		template: 'Loading...'
    	});

		FoodFactory.getFoods().then(function(foodsResponse){
			var fooods = foodsResponse.data;

			// For getting the name of the cuisine
			FoodFactory.getCuisines().then(function(cuisineResponse){
				var allCuisines = cuisineResponse.data;
				for(var i = 0; i < fooods.length; i++){
					for(var j = 0; j < allCuisines.length; j++){
						if(+fooods[i].cuisine_id == +allCuisines[j].id){
							fooods[i].cuisine_id = allCuisines[j].cuisine_name;
						}
					}
				}
				$scope.foods = fooods;
				$ionicLoading.hide();
			});


		});
	}

	// Calling the fetch function when order page loads
	fetchFoods();


	

}])




// Cart Controller
.controller('cartCtrl', ['$scope', '$ionicLoading', 'CartFactory', function($scope, $ionicLoading, CartFactory) {

	$ionicLoading.show({
  		template: 'Loading...'
	});

	var cartInfo = CartFactory.getCartInfo();
	var grandTotal = 0;

	if(cartInfo){
		$scope.emptyCart = false;
		var temp = [];

		for(var i = 0; i < cartInfo.length; i++){

			var food = {
				name: cartInfo[i].mainFood.food_name,
				size: cartInfo[i].sizeInfo.sizeName,
				qty: cartInfo[i].qty,
				price: cartInfo[i].totalPrice,
				specialInstruction: cartInfo[i].specialInstruction
			}

			temp.push(food);

			grandTotal += cartInfo[i].totalPrice;
				
		}


		$scope.grandTotal = grandTotal;
		$scope.foods = temp;

		console.log("This is cartFoods" + temp);

		console.log("hi from cart controller");
		console.log(cartInfo);	
	}
	else{
		$scope.emptyCart = true;
	}

	

	 


	$ionicLoading.hide();

}])
   




.controller('myProfileCtrl', function($scope) {

})

.controller('myAccountCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {
	

})

.controller('addressesCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {
	

})

.controller('addressCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {
	

})

.controller('currentOrderCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {
	

})

.controller('paymentCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {
	

})

.controller('inviteFriendsCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {
	

})

.controller('favouriteCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {
	

})

.controller('orderHistoryCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {
	

})

.controller('rewardCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {
	

})

// Login/Signup     
.controller('loginCtrl', ['$scope', 'UsersFactory', '$ionicPopup', '$state', 
	function($scope, UsersFactory, $ionicPopup, $state) {

	$scope.logoutMessage = false;

	// Login
	$scope.login = function(user){
		UsersFactory.getUser(user.email, user.password).then(function(response){
			var userInfo = response.data;
			
			if(userInfo.length != 1){
				$ionicPopup.alert({
			     title: 'Error',
			     template: 'Oooops! Username or password missmatched.'
			   });
			}
			else{
				$scope.login = true;
				$state.go("app.tabs.search");
				window.localStorage['loggedIn'] = "true";
			}

		});
	}

}])
   
.controller('signupCtrl', function($scope,SignUpFactory) {

	SignUpFactory.signup($scope.data).then(function(response){
		console.log(response.data);
	});

});
    