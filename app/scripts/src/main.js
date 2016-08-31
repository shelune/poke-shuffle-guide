;(function () {
	var jsonUrl = 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/pv.json';
	
	var currentArea, hitPoints, stageName, stageType, stageMoves, teamLimit, recommendedParty, srankStrat, captureRate, clearStrat, disruptions, disruptionBoard, disruptionInit, disruptionTimer;
	
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
				$('.stage-number').text(stageData);
				
				var disruptionArr = disruptions.split(/\n/);
				console.log(disruptionArr);
				
				if (disruptionArr.length <= 1) {
					disruptionBoard = 'None';
					disruptionInit = 'None';
					disruptionTimer = 'None';
				} else {
					$.each(disruptionArr, function(line, value) {
						if (value.includes('Board:')) {
							disruptionBoard = value.slice(6, value.length);
						} else if (value.includes('Initial:')) {
							disruptionInit = value.slice(8, value.length);
						} else if (value.includes('Timer: ')) {
							disruptionTimer = value.slice(6, value.length);
						}
					});
				}
				
				console.log('board: ' + disruptionBoard);
				console.log('init: ' + disruptionInit);
				console.log('init: ' + disruptionTimer);
			}	
		});
	});
})();