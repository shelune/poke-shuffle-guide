;(function () {
	var jsonUrl = 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/cn.json';
	
	var currentArea, hitPoints, stageName, stageType, stageMoves, teamLimit, recommendedParty, srankStrat, captureRate, clearStrat, disruptions;
	
	var stageData = $('body').attr('stage-data');
	console.log('searched stage is ' + stageData);
	
	$.getJSON(jsonUrl, function (data) {
		// get the area name
		currentArea = data.shift()['stageNo'];
		
		data.map(function (item) {
			
			if (item['stageNo'].toString() === stageData) {
				hitPoints = item['hitPts'];
				stageName = item['name'];
				stageType = item['type'];
				stageMoves = item['moves'];
				teamLimit = item['pokemon'];
				recommendedParty = item['recommendedParty'];
				captureRate = item['captureRate'];
				srankStrat = item['srankingStrategy'];
				clearStrat = item['clearingStrategy'];
				disruptions = item['disruptions'];
				
				$('.stage__thumbnail').attr('src', 'images/icons/icon_' + stageData + '.png');
				$('span.stage-type').text(stageType);
				$('span.stage-hp').text(hitPoints);
				$('span.stage-capture').text(captureRate);
				$('span.stage-limit').text(teamLimit);
				$('span.stage-moves').text(stageMoves);
				$('.stage-name').text(stageName);
				
				console.log(disruptions);

			}	
		});
				
	});
})();