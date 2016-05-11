core.config(function ($stateProvider) {
    $stateProvider.state('scroll', {
        url: '/scroll',
        controller: 'ScrollCtrl',
        templateUrl: 'templates/scroll.html',
        resolve: {
            user: function(AuthService) {
                return AuthService.getLoggedInUser();
            }
        },
        onEnter: function(IterateFactory) {
        	//this starts nav iteration on home page
        	console.log('Entering scroll!');
        	IterateFactory.zero('scroll');
        }
    });
});

core.controller('ScrollCtrl', function($state, $scope, user) {
    $scope.delay; // keyboard iteration speed
    console.log(1)
    // Key-value pairs for keyboard speed based on user's settings
    const translateDelay = {
        5: 500,
        4: 750,
        3: 1000,
        2: 1250,
        1: 1500,
        0: 1750
    }

    if (user) { $scope.delay = translateDelay[user.keyboardSpeed] } else { $scope.delay = translateDelay[5] };
    console.log("Keyboard Speed", $scope.delay)

});



