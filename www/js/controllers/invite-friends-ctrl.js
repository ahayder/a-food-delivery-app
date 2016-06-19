angular.module('app.inviteFriendsCtrl', [])

.controller('inviteFriendsCtrl', function($scope) {


  $scope.shareNative = function() {
    //console.log(window.plugins);
      if (window.plugins && window.plugins.socialsharing) {
          window.plugins.socialsharing.share("I'll be attending the session: " + $scope.session.title + ".",
              'PhoneGap Day 2014', null, "http://pgday.phonegap.com/us2014",
              function() {
                  console.log("Success")
              },
              function (error) {
                  console.log("Share fail " + error)
              });
      }
      else console.log("Share plugin not available");
}

})
