angular.module('advertioApp',['ui.bootstrap',
	'ngRoute',
	'ngResource',
	'ngCookies',
	'ngMd5',
	'advertioApp.controllers',
	'advertioApp.directives',
	'advertioApp.services'])
.config(function($routeProvider, $httpProvider, $locationProvider, $sceProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.html5Mode(true).hashPrefix('!');
	$routeProvider
		.when('/', {templateUrl: 'Partials/login.html'})
		.when('/map', {templateUrl: 'Partials/map.html', controller: 'mapController'})
		.when('/werbErst', {templateUrl: 'Partials/werbErst.html', controller: 'werbErstController'})
		.when('/kontakt', {templateUrl: 'Partials/kontakt.html', controller: 'kontaktController'})
		.when('/werbEdit/:id', {templateUrl: 'Partials/werbEdit.html', controller: 'werbEditController'})
		.when('/stream/:id', {templateUrl: 'Partials/stream.html', controller: 'streamController'});
	$httpProvider.defaults.useXDomain = true; 
	$sceProvider.enabled(false);
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
})
.constant('config', {
    appName: 'advertioFrontend',
    apiUrl: 'http://backendsharpcologne.azurewebsites.net'
});