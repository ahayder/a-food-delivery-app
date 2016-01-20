angular.module('app.controllers', [])


.controller('searchCtrl', function($scope) {

	// Map Init
	$scope.initMap = function() {
	  var myLatLng = {lat: -25.363, lng: 131.044};

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
	    title: 'Hello World!'
	  });
	}

	$scope.initMap();

})
  
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


	// Ionic Modal Configuration
	$ionicModal.fromTemplateUrl('templates/order-modal.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
	});


	// Order Modal
	$scope.orderModal = function(index) {
		$scope.modal.show();
		// show loading
		$ionicLoading.show({
      		template: 'Loading...'
    	});
    	
		// Returning the particular food
		$scope.thisFood = $scope.foods[index];

		// Getting the food sizes
		FoodFactory.getFoodSize($scope.thisFood.food_id).then(function(response){
			$scope.foodSizes = response.data;
		});

		// Getting extra items
		FoodFactory.getExtrasById($scope.thisFood.food_id).then(function(response){
			$scope.extras = response.data;
		});

		$scope.data = {
			'foodId': $scope.thisFood.food_id,
			'foodName': $scope.thisFood.food_name,
			'price': " ",
			'quantity': 1
		}
    	$ionicLoading.hide();
  	};



  	// Closing order modal
  	$scope.orderModalClose = function() {
    	$scope.modal.hide();
  	};

  	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});


$scope.t=function(name){
	alert('hola');
	alert(JSON.stringify(name));
}

	// Add to cart
	$scope.addToCart = function(){
		// At first close the the modal
		$scope.orderModalClose();
		alert(JSON.stringify($scope.extra));

		// Getting the data
		//console.log($scope.data);

		var a = JSON.parse(window.localStorage['cart']) || [];
		a.push($scope.data);
		indow.localStorage['cart'] = null;
		window.localStorage['cart'] = JSON.stringify(a);
	}

}])




// Cart Controller
.controller('cartCtrl', function($scope) {
	$scope.cartFoods = JSON.parse(window.localStorage['cart'] || '[]');
	console.log("hi from cart controller");
	console.log($scope.cartFoods);

})
   


// Login/Signup     
.controller('loginCtrl', ['$scope', 'UsersFactory', '$ionicPopup', '$state', function($scope, UsersFactory, $ionicPopup, $state) {

	// Login
	$scope.login = function(user){
		UsersFactory.getUser(user.email, user.password).then(function(response){
			var userInfo = response.data;
			console.log(userInfo);
			
			if(userInfo.length != 1){
				$ionicPopup.alert({
			     title: 'Error',
			     template: 'Oooops! Username or password missmatched.'
			   });
			}
			else{
				$state.go("tabs.order");
				window.localStorage['loggedIn'] = true;
			}

		});
	}

}])
   
.controller('signupCtrl', function($scope) {

});
    