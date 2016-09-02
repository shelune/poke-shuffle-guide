;(function () {
	var jsonUrl = 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/pv.json';

	// URL for resources
	var jsonUrl = 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/rc.json';
	var stageTypesUrl = 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageTypes.json';

	// setup reference to stage types
	var stageTypes;

	//
	var currentArea, stageIcon, hitPoints, stageName, stageType, stageMoves, 
			boardLayout, disruptions, disruptionInit, disruptionBoard, disruptionTimer,
			basePower, ability, captureRate,
			recommendedParty, srankStrat, clearStrat, teamLimit;

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
				stageIcon = item['icon'];
				hitPoints = item['hitPts'];
				stageName = item['name'];
				stageType = item['type'];
				stageMoves = item['moves'];
				boardLayout = item['initialBoardSetup'];
				teamLimit = item['pokemon'];
				recommendedParty = item['recommendedParty'];
				captureRate = splitBreakLine(item['captureRate']);
				srankStrat = item['srankingStrategy'];
				clearStrat = item['clearingStrategy'];
				disruptions = item['disruptions'];
				basePower = item['basePower'];
				ability = item['ability'];
				
				$('span.stage-type').text(stageType);
				$('span.stage-hp').text(hitPoints);
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
						} else if (value.includes('Initial')) {
							disruptionInit = value.slice(8, value.length);
						} else if (value.includes('Timer')) {
							disruptionTimer = value.slice(6, value.length);
						}
					});
				}

				// handle stage icon
				handleStageIcon(stageIcon);

				// handle capture rate
				handleCaptureRate(captureRate);
				$('.stage-power').text(basePower);
				$('.stage-ability').text(ability);

				// handle board layout
				handleStageLayout(boardLayout);

				// handle clearing strategy
				handleStageClearing(clearStrat);

				// handle srank strategy
				handleStageSRank(srankStrat);
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

	var handleStageIcon = function(stageIcon) {
		$('.stage__thumbnail').attr('src', 'images/icons/icon_' + stageIcon + '.png');
	}

	var handleStageLayout = function(stageLayoutUrl) {
		$('.setup__layout').attr('src', stageLayoutUrl);
	}

	var handleStageClearing = function(stageClearing) {
		$('.strategy__walkthrough-content.clearing').text(stageClearing);
	}

	var handleStageSRank = function(stageSRank) {
		var movesInitPos = stageSRank.indexOf('least');
		var movesLastPos = stageSRank.indexOf('left');
		var movesSRank = stageSRank.slice(movesInitPos + 6, movesLastPos - 6);

		var strat = stageSRank.split('\n');
		strat.shift();
		
		$('.stage-srank-moves').text(movesSRank);
		$('.strategy__walkthrough-content.srank').text(strat.join(' '));
	}
	
})();