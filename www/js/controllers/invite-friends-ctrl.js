angular.module('app.inviteFriendsCtrl', [])

.controller('inviteFriendsCtrl', function($scope) {


    // $scope.invitationFB = function(link) {
    //     ngFB.login().then(
    //         function(response) {

    //             if (response.status === 'connected') {
    //                 (alert)('Facebook Signup succeeded');

    //                 $scope.shareFB(link);


    //             } else {
    //                 (alert)('Facebook Signup failed');
    //             }
    //         });
    // }


    // $scope.shareFB = function(link) {

    //     ngFB.api({
    //         method: 'POST',
    //         path: '/me/feed',
    //         params: {
    //             message: 'Welcome to food world',
    //             link: link
    //         }
    //     }).then(
    //         function() {
    //             (alert)('The session was shared on Facebook');
    //         },
    //         function() {
    //             (alert)('An error occurred while sharing this session on Facebook');
    //         });
    // };


    // $scope.invitationTwitter = function() {
    //     $cordovaSocialSharing.share("This is your message", "This is your subject", "www/imagefile.png", "http://blog.nraboy.com");
    // }

    // $scope.invitationTwitter = function() {
    //     $cordovaSocialSharing.share("This is your message", "This is your subject", "www/imagefile.png", "http://blog.nraboy.com");
    // }


})