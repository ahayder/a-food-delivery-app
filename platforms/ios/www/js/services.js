angular.module('app.services', [])


// Temporary using get for login
.factory('UsersFactory', ['$http', function($http){
	return {
		getUser: function(email, password){
			return $http.get("https://foood365.com/api/user?email=" + email + "&password"); // password will be added later on
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
		}
		
	}
}])


.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])


.service('BlankService', [function(){

}]);

