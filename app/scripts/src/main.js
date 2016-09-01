;(function () {

	// URL for resources
	var jsonUrl = 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/cn.json';
	var stageTypesUrl = 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageTypes.json';

	// setup reference to stage types
	var stageTypes;

	//
	var currentArea, hitPoints, stageName, stageType, stageMoves, 
			teamLimit, recommendedParty, srankStrat, clearStrat, disruptions,
			basePower, ability, captureRate;

	$.getJSON(stageTypes, function (data) {
		stageTypesUrl = data;
	});
	
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
				captureRate = splitBreakLine(item['captureRate']);
				srankStrat = item['srankingStrategy'];
				clearStrat = item['clearingStrategy'];
				disruptions = item['disruptions'];
				basePower = item['basePower'];
				ability = item['ability'];
				
				$('.stage__thumbnail').attr('src', 'images/icons/icon_' + stageData + '.png');
				$('span.stage-type').text(stageType);
				$('span.stage-hp').text(hitPoints);
				$('span.stage-limit').text(teamLimit);
				$('span.stage-moves').text(stageMoves);
				$('.stage-name').text(stageName);

				// handle capture rate
				handleCaptureRate(captureRate);
				$('.stage-power').text(basePower);
				$('.stage-ability').text(ability);
			}	
		});
				
	});

	var splitBreakLine = function (data) {
		return data.split('\n');
	}

	var handleCaptureRate = function (captureRate) {
		if (captureRate.length < 2) {
			$('.stage-capture').text('N/A');
			$('.stage-capture-add').text('N/A');	
		} else {
			var captureRateInit = parseInt(captureRate[0].slice(5, -1));
			$('.stage-capture').text(captureRateInit);
			var captureRateBonus = parseInt(captureRate[1].slice(6, -1));
			$('.stage-capture-bonus').text(captureRateBonus);
		}
	};

	var handle
})();