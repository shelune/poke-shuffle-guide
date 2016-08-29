;(function () {
	var jsonUrl = 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/pb.json';
	
	$.getJSON(jsonUrl, function (data) {
		data.splice(0, 1);
		data.map(function (item) {
			console.log(item);
		});
	});
})();