core.controller('SettingsCtrl', function($scope, user, SettingsFactory) {

    $scope.user = user;
    $scope.name = user.firstName + " " + user.lastName;
    $scope.selections = SettingsFactory.selections;

    $scope.speeds = [1, 2, 3, 4, 5];
    $scope.features = ['eyes', 'eyebrows', 'mouth'];

});
