core.config(function ($stateProvider) {
    $stateProvider.state('type', {
        url: '/type',
        controller: 'TypeCtrl',
        templateUrl: 'templates/type.html',
        resolve: {
            user: function(AuthService) {
                return AuthService.getLoggedInUser();
            }
        },
        onEnter: function(IterateFactory) {
        	//this starts nav iteration on type page
        	IterateFactory.iterate('type');
        }
    });
});

core.controller('TypeCtrl', function($state, $scope, user, IterateFactory, TimerFactory) {
    $scope.delay; // keyboard iteration speed

    // Key-value pairs for keyboard speed based on user's settings
    $scope.start = function() {
        IterateFactory.zero('type');
    }

    $scope.stop = function() {
        TimerFactory.clearTracking();
    }

});



