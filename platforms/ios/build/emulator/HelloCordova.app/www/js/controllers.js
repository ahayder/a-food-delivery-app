// Here $rootScope.login value is direct opposite because I am using ng-hide instead of ng-show
// because ng-show was not working
// user infos into this locastorage window.localStorage['loggedInUserInofos']

angular.module('app.controllers', [])

.controller('appCtrl', ['$scope', '$state', '$rootScope', 'UsersFactory', function ($scope, $state, $rootScope, UsersFactory) {

	$rootScope.login = true; // acctually it means false incase of ng-hide

    var loggedIn = window.localStorage['loggedIn'];

    if(loggedIn === "true"){
    	$rootScope.login = false;
       	$state.go("app.tabs.cart"); //app.tabs.search
    }
    else{
    	window.localStorage['loggedIn'] = "false";
      	$state.go("app.login");
      	$scope.logoutMessage = false;
    }

    $scope.logout = function(){

       	window.localStorage['loggedIn'] = "false";
       	window.localStorage['loggedInUserInofos'] = "";

       	$scope.logoutMessage = true;
       	$rootScope.login = true;
      	$state.go("app.login");
      	
      	
    }


    // for using into cart page
    var user = JSON.parse(window.localStorage['loggedInUserInofos']);

    UsersFactory.getPaymentInfo(user[0].cus_id).then(function(response){
		$rootScope.cc = response.data[0];
		},
		function(error){
			console.log(error.message);});
	// End of call

}])


.controller('searchCtrl', ['$scope', '$cordovaGeolocation', 'LocationFactory', 'SearchFactory', '$ionicLoading', 'FoodFactory', '$state', '$window',
	function($scope, $cordovaGeolocation, LocationFactory, SearchFactory, $ionicLoading, FoodFactory, $state, $window) {

	// A little refresher for(only one time) menu showing when login
	//$state.transitionTo($state.current, {}, { reload: true, inherit: false, notify: true });
	
	
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
.controller('cartCtrl', function($scope, $rootScope, $ionicLoading, CartFactory, $rootScope) {

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

	$scope.checkout = function(amnt){

		window.open("https://savor365.com/api/makePayment?amount="+amnt+"&cardNumber="+$rootScope.cc.card_number+"&cvv="+$rootScope.cc.cvv+"&expDate="+$rootScope.cc.expiration_date+"&invNumber=102", "_blank", "location=no");
		
		UsersFactory.getPaymentInfo(user[0].cus_id).then(function(response){
			$scope.cc = response.data[0];




			// CartFactory.makePayment(amnt, cc.card_number, cc.cvv, cc.expiration_date).then(
			// 	function(res){
			// 		console.log("done");
			// 	});
		},
		function(error){
			console.log(error.message);
		});

			
	}
	

})
   




.controller('myProfileCtrl', function($scope) {

})

.controller('myAccountCtrl', function($scope, $ionicLoading, $ionicModal, UsersFactory) {

	var userInfo = JSON.parse(window.localStorage['loggedInUserInofos']);



	UsersFactory.getUserInfo(userInfo[0].cus_email).then(function(response){
		$scope.user = response.data[0];
		console.log($scope.user);
	});

})

.controller('addressesCtrl', function($scope, $ionicLoading, $ionicModal, UsersFactory, $ionicPopup, $state) {

	var user = JSON.parse(window.localStorage['loggedInUserInofos']);

	UsersFactory.getAddresses(user[0].cus_id).then(function(response){
		$scope.addresses = response.data;
	});


	$scope.saveAddress = function(address){
		$ionicLoading.show({
      		template: 'Saving into foood365 database.'
    	});

    	UsersFactory.addressSave(user[0].cus_id, address).then(function(response){
			$scope.address = response.data;
			console.log($scope.address);
			$ionicLoading.hide();
			$scope.closeModal();
			$ionicPopup.alert({
				title: 'Success!',
				template: 'Successfully saved'
		   	});
		   	$state.go("app.addresses");
		}, function(error){
			$ionicLoading.hide();
			$scope.closeModal();
			$ionicPopup.alert({
				title: 'Error!',
				template: 'Opps.. something wrong'
		   	});
			console.log("eror is address saving"+error);
		});


	}

	$scope.saveAddressForSate = function(address){
		UsersFactory.saveAddressForNextState(address);
	}




	// Ionic Modal Configuration
	$ionicModal.fromTemplateUrl('templates/address/add-address-modal.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
	});


	// Order Modal
	$scope.addNewAddressModal = function() {
		$scope.modal.show();
  	};



  	// Order modal closing function

  	$scope.closeModal = function() {
    	$scope.modal.hide();
  	};

  	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});

	

})

.controller('addressCtrl', function($scope, $ionicLoading, $ionicModal, UsersFactory, $ionicPopup) {
	
	$scope.thisAddress= UsersFactory.getAddress();

	console.log($scope.thisAddress['id']);

	$scope.makeDafultAddress = function(id){
		UsersFactory.makeThisAddressDefault(id).then(function(){
			$ionicPopup.alert({
				title: 'Success!',
				template: 'Successfully saved'
		   	});
		},function(error){
			console.log("Can't save");
		});
	}

})

.controller('currentOrderCtrl', function($scope, $ionicLoading, $ionicModal, FoodFactory) {
	

})

.controller('paymentCtrl', function($scope, $ionicLoading, $ionicModal, $ionicPopup, $state, UsersFactory) {
	
	var user = JSON.parse(window.localStorage['loggedInUserInofos']);

	UsersFactory.getPaymentInfo(user[0].cus_id).then(function(response){
		$scope.card = response.data[0];
		console.log($scope.card);
		},
		function(error){
			console.log(error.message);});
	// End of call

	$scope.savePaymentInfos = function(payment){
		$ionicLoading.show({
      		template: 'Saving into foood365 database.'
    	});

    	UsersFactory.paymentInfoSave(payment, user[0].cus_id).then(function(response){
			$scope.payment = response.data;
			console.log($scope.payment);
			$ionicLoading.hide();
			$scope.closeModal();
			$ionicPopup.alert({
				title: 'Success!',
				template: 'Successfully saved'
		   	});
		   	$state.go("app.payment");
		}, function(error){
			$ionicLoading.hide();
			$scope.closeModal();
			$ionicPopup.alert({
				title: 'Error!',
				template: 'Opps.. something wrong'
		   	});
			console.log("eror in payment saving"+error);
		});


	}


	// Ionic Modal Configuration
	$ionicModal.fromTemplateUrl('templates/payment/payment-add-modal.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
	});


	// Order Modal
	$scope.addNewCardModal = function() {
		$scope.modal.show();
  	};



  	// Order modal closing function

  	$scope.closeModal = function() {
    	$scope.modal.hide();
  	};

  	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});


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
.controller('loginCtrl', ['$scope', 'UsersFactory', '$ionicPopup', '$state', '$rootScope', '$timeout',
	function($scope, UsersFactory, $ionicPopup, $state, $rootScope, $timeout) {

	$scope.logoutMessage = false;

	// Login
	$rootScope.login = function(user){
		UsersFactory.login(user.email, user.password).then(function(response){
			var userInfo = response.data;

			if(userInfo.length == 0){
				$ionicPopup.alert({
					title: 'Unsuccessful',
					template: 'The email or password mismatched'
			   	});
			}
			else{
				//Saving variables to use later
				
				$rootScope.login = false;
				

				window.localStorage['loggedIn'] = "true";
				window.localStorage['loggedInUserInofos'] = JSON.stringify(userInfo);

				// without timeout menu ng-show doesn't work

			    	$state.go("app.tabs.search");    

				

			}

			
			
		}, function(error){
				$ionicPopup.alert({
					title: 'Unsuccessful',
					template: 'Opps! there was a problem' + JSON.parse(error)
			   	});
		});
	}

}])
   
.controller('signupCtrl', function($scope, SignUpFactory, $ionicPopup, $state) {

	$scope.signUp = function(data){
		SignUpFactory.signup(data).then(function(response){
			var popup = $ionicPopup.alert({
				title: 'Success!',
				template: 'Successfully signed up, now login and enjoy your food'
		   	});

		   	popup.then(function(res){
		   		if(res){
		   			$state.go("app.login");
		   		}
		   		else{
		   			console.log("Do nothing");
		   		}
		   	});

		}, function(error){
				$ionicPopup.alert({
					title: 'Error',
					template: 'The signup was not successful for this reason' + JSON.parse(error)
			   	});
		});
	}

	

});
    