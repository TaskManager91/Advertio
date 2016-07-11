angular.module('advertioApp.controllers', [])
.controller('MasterCtrl', function($scope, $location, $cookies, authService, $rootScope) {
	
	$scope.logedin = false;
	$rootScope.streaming = false;
	$scope.user = $cookies.get('user');
	 $scope.alerts = [
  	];

	if($scope.user != null)
	{
		var token = $cookies.get('token');
		console.log("loaded cookies for: " + $scope.user + " token: " + token);
		authService.setSettings($scope.user, token);
		$scope.logedin = true;
    	//change path specific on user rights
    	$location.path('/map');
	}

	  
    console.log(window.innerWidth);
    $scope.width = window.innerWidth;

	$scope.submit = function (usr) {
        authService.login(usr)
        	.success(function(data, status, headers, config) {
        		console.log(data);
    			authService.setSettings(usr.user, token);
				$scope.logedin = true;
    			$scope.user = usr.user;
    			$scope.alerts = [];
    			//change path specific on user rights
    			$location.path('/map');
  			})
  			.error(function(data, status, headers, config) {
        		if(data== "error")
        			$scope.alerts.push({ type: 'danger', msg: 'User nicht bekannt!'});
        		else if(data == "wrongPW")
        			$scope.alerts.push({ type: 'danger', msg: 'Falsches Passwort!'});
        		else
        			$scope.alerts.push({ type: 'danger', msg: 'Unbekannter Fehler, bitte wenden sie sich an den Support!'});
  			});
    };

    $scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	  };

    $scope.logout = function() {
        $cookies.remove('user');
        $cookies.remove('token');
		$scope.logedin = false;

		$location.path('/');
    };
})
.controller('mapController', function($scope, queryService) {

	queryService.getBoards().then(function(response){
		$scope.currentQuery = response.data;
		//console.log($scope.currentQuery);
		//$scope.Buffer = $scope.currentQuery.split("-");


		//$scope.boards = new Array($scope.Buffer.length);
		$scope.boards = $scope.currentQuery;
		console.log($scope.boards);
		/*
		for(var i = 0; i<$scope.Buffer.length-1; i++)
		{
			var board = $scope.Buffer[i].split(" ");
			console.log("boardNR" + i);
			console.log(board);
			$scope.boards[i] = new Array (7);
			$scope.boards[i][0] = board[0];		//ID
			$scope.boards[i][1] = board[1];		//Adr
			$scope.boards[i][2] = board[2];		//BildX
			$scope.boards[i][3] = board[3];		//BildY
			$scope.boards[i][4] = board[4];		//P
			$scope.boards[i][5] = board[5];		//XPos
			$scope.boards[i][6] = board[6];		//YPos

		}
		*/
		//$scope.boards = $scope.currentQuery.boards;
	});
})
.controller('werbEditController', function($scope, $routeParams, queryService) {
    var currentId = $routeParams.id;
    /*
    $scope.id = 0;
		$scope.adr = 0;
		$scope.x = 0;
		$scope.y = 0;
		$scope.p = 0;
		var board = "";
		*/

    queryService.getBoard(currentId).then(function(response){
		$scope.currentQuery = response.data;
		//console.log($scope.currentQuery);
		//$scope.Buffer = $scope.currentQuery.split("-");

		$scope.board = $scope.currentQuery;
		console.log($scope.board);

		/* Nicht mehr nötig hab es auf JSON gestellt
		for(var i = 0; i<$scope.Buffer.length-1; i++)
		{
			var bBoard = $scope.Buffer[i].split(" ");
			console.log("boardNR" + i);
			console.log(bBoard);
			if(bBoard[0] == currentId)
			{
				$scope.id 	= bBoard[0];		//ID
				$scope.adr 	= bBoard[1];		//Adr
				$scope.xBild = bBoard[2];		//X
				$scope.yBild = bBoard[3];		//Y
				$scope.p 	= bBoard[4];		//p
				$scope.xPos = board[5];		//XPos
				$scope.yPos = board[6];		//YPos
			}
		}
		*/
		//$scope.boards = $scope.currentQuery.boards;
	});

	$scope.saveBoard = function () {
		/* Dank Json support nicht mehr nötig!
		var id = $scope.id.toString();
		var adr = $scope.adr.toString();
		var x = $scope.x.toString();
		var y = $scope.y.toString();
		var p = $scope.p.toString();
		board = id +" " + adr + " " + x + " " + y +" " + p;
		console.log(board);
		*/
        queryService.setBoard(board)
        	.success(function(data, status, headers, config) {
    			
    			//change path specific on user rights
    			$location.path('/map');
  			})
  			.error(function(data, status, headers, config) {

  			});
    };


})
.controller('streamController', function(config, $scope, $routeParams, queryService, $interval, $rootScope) {
    $scope.currentId = $routeParams.id;
    $scope.stream = 0;
    $scope.streamURL = "";
    $rootScope.streaming = true;
    $rootScope.timer = 1;
    $rootScope.videoList = [];

    var tafel = $interval(function(){

    	$rootScope.timer--;

    	if($rootScope.timer == 0)
    	{
    		queryService.getBoard($routeParams.id).then(function(response){
    		console.log($routeParams.id);
			$scope.currentQuery = response.data;
			$scope.board = $scope.currentQuery;


			if($scope.board.stream != "empty")
			{
				$scope.streamURL = config.apiUrl  + "/api/stream/" + $scope.board.stream;

				if($scope.board.stream == "sa")
					$rootScope.timer = 35;

				if($scope.board.stream == "mm")
					$rootScope.timer = 35;

				//Double buffering bitch
				if($scope.stream == 1)
					$scope.stream = 2;
				else if($scope.stream == 2 || $scope.stream == 0)
					$scope.stream = 1;

				$scope.board.streamOld = $scope.board.stream;
				$scope.board.stream = "empty";
			}
			else
			{
				$scope.stream = 0;
				$scope.board.streamOld = $scope.board.stream;
				$rootScope.timer = 10;
			}

			queryService.setBoard($scope.board)
	        	.success(function(data, status, headers, config) {
	        		console.log("setBoardSuccess");
	  			})
	  			.error(function(data, status, headers, config) {
	  					console.log("setBoardFAIL");
	  			});
		});
    	}
    	

    	console.log($rootScope.timer);
    }, 1000);
		
});
