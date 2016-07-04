angular.module('weatherApp.camera.init', [
        'ngRoute'
    ])
    .config(function($routeProvider) {
        $routeProvider
            .when('/camera', {
                templateUrl: 'app/camera/index.html',
                controller: photoCtrl
            })
    })
