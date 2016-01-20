angular.module('app.services', [])


// Temporary using get for login
.factory('UsersFactory', ['$http', function($http){
	return {
		getUser: function(email, password){
			return $http.get("https://foood365.com/api/user?email=" + email + "&password"); // password will be added later on
		}
		
	}
}])


.factory('SearchFactory', ['$http', function($http){
	var result = [];
	return {
		getUser: function(email, password){
			return $http.get("https://foood365.com/api/user?email=" + email + "&password"); // password will be added later on
		},
		searchByZipCode: function(zip){
			return $http.get("https://foood365.com/api/searchByZipCode?zipcode="+zip);
		},
		saveSearchResult: function(rst){
			result =  rst;
		},
		getSearchResult: function(){
			return result;
		}
		
	}
}])


.factory('FoodFactory', ['$http', function($http){

	return {
		getFoods: function(email, password){
			return $http.get("https://foood365.com/api/foods");
		},
		getCuisines: function(){
			return $http.get("https://foood365.com/api/cuisines");
		},
		getFoodSize: function(id){
			return $http.get("https://foood365.com/api/foodSizeById?id="+ id);
		},
		getExtrasById: function(id){
			return $http.get("https://foood365.com/api/extraFoodsById?id="+ id);
		},
		getExtraFoodPrice: function(id){
			return $http.get("https://foood365.com/api/extraFoodPrice?foodId="+ id);
		},
		getFoodsByRestaurantId: function(restaurantId){
			return $http.get("https://foood365.com/api/foodsByRestaurantId?restaurantId="+ restaurantId);
		},
		getRestaurantsById: function(restaurantId){
			return $http.get("https://foood365.com/api/findRestaurantsById?restaurantId="+ restaurantId);
		}
		
	}
}])


.factory('CartFactory',['$http', function($http) {
	var cartData = null;
	return {
		saveIntoCart: function(cartInfo){
			window.localStorage['cartInfo'] = JSON.stringify(cartInfo);
		},
		getCartInfo: function(){
			return cartData;
		}
	}
}])




.factory('LocationFactory',['$http', function($http) {
  return {
    getZipCode: function(lat, lng) {
      return $http.get("http://ws.geonames.org/findNearbyPostalCodesJSON?formatted=true&lat="+lat+"&lng="+lng+"&username=ahayder");
    }
  }
}]);

