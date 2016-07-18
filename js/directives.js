angular.module('advertioApp.directives', [])
.directive('map', function($http, $interval, $uibModal, latllngService) {
	return {
		restrict: 'A',
		scope: {
            boards:"="
        },
		link: function(scope) 
		{	

			var icon = L.Icon.extend({
		       options: {
			     iconSize:     [50, 50], // size of the icon
			     iconAnchor:   [25, 45], // point of the icon which will correspond to marker's location
			     popupAnchor:  [0, -45] // point from which the popup should open relative to the iconAnchor
			       }
			   });

		   var kTafel = new icon({ iconUrl: '/img/Icons/iconG.png'}),
		     gTafel = new icon({iconUrl: '/img/Icons/iconK.png'});

			var markers = {};			
			var map = L.map('map').setView([50.935824, 6.951172], 13);

			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				}).addTo(map);

			//Right click on the map activated
			map.on('contextmenu', function(e) {

			    var animationsEnabled = true;

			    //Hier wird das Modal aufgerufen, wenn rechts geklickt wird!
			    var modalInstance = $uibModal.open({
			      animation: animationsEnabled,
			      templateUrl: 'createModal.html',
			      controller: 'latModalCtrl',
			      size: '',
			      resolve: {
			        item: function () {
			          return e;
			        }
			      }
			    });

			    modalInstance.result.then(function (latlng) {
			    	//hier werden die LatLang Koordinaten in den Buffer service geladen
			      var setLat = latllngService.setLat(latlng.lat);
			      var setLng = latllngService.setLng(latlng.lng);

			      //ACHTUNG die Werbedit seite wird per href vom Modal geladen!

			    }, function () {
			     
			    });
			});


			if(scope.boards != null)	
			{
			var Boards = scope.boards;
			console.log(Boards);
			//for(var i = 0; i<Boards.length-1; i++){
			for(var i in Boards){
				console.log(Boards[i]);

				var markerString = '<h2>Werbetafel:</h2>' + 
									'<table><tr><td>WerbetafelID:</td><td>' + Boards[i].werbetafelId + '</td></tr>' +
									'<tr><td>werbetafelMacAdresse: &nbsp &nbsp  </td><td> ' + Boards[i].werbetafelMacAdresse+'</td></tr>' +
									'<tr><td>AdressID: </td><td>' + Boards[i].adresse+'</td></tr>' +
									'<tr><td>Bildgröße (X-Achse): </td><td>' + Boards[i].dimensionX+'</td></tr>' +
									'<tr><td>Bildgröße (Y-Achse): </td><td>' + Boards[i].dimensionY+'</td></tr>' +
									'<tr><td>Preis: </td><td>' + Boards[i].preis+'</td></tr>' +
									'<tr><td>Längengrad: </td><td>' + Boards[i].xPos+ '</td></tr>' +
									'<tr><td>Breitengrad: </td><td>' + Boards[i].yPos+ '</table>'+
									'<br><br><button type="button" class="btn btn-primary"><a href ="/werbEdit/' +Boards[i].werbetafelId + '"><font color="white">editieren &nbsp<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></font></a> </button>' + '&nbsp' +
									'<button type="button" class="btn btn-primary" ><a href ="/stream/' +Boards[i].werbetafelId + '"><font color="white">stream &nbsp<span class="glyphicon glyphicon-film" aria-hidden="true"></span></font></a> </button>';
				//console.log(markerString);

				if(Boards[i].dimensionX <= 400)
					L.marker([Boards[i].xPos, Boards[i].yPos],{icon:kTafel}).addTo(map).bindPopup(markerString);
				else
					L.marker([Boards[i].xPos, Boards[i].yPos],{icon:gTafel}).addTo(map).bindPopup(markerString);
				//L.marker([50.9488, 6.924],{icon:greenIcon}).addTo(map).bindPopup(markerString);	
				}
			}
			//$interval(updateMarker, 2000);
		}
	};
});4