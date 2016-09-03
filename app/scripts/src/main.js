;(function () {
	// level caps
	var stageCollections = [
		{
			levelCap: 10,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/pb.json'
		},
		{
			levelCap: 20,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/sb.json'
		},
		{
			levelCap: 30,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/nf.json'
		},
		{
			levelCap: 45,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/ia.json'
		},
		{
			levelCap: 60,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/rp.json'
		},
		{
			levelCap: 75,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/gr.json'
		},
		{
			levelCap: 90,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/ss.json'
		},
		{
			levelCap: 105,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/sm.json'
		},
		{
			levelCap: 135,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/cn.json'
		},
		{
			levelCap: 150,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/jv.json'
		},
		{
			levelCap: 180,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/ww.json'
		},
		{
			levelCap: 210,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/pv.json'
		},
		{
			levelCap: 240,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/at.json'
		},
		{
			levelCap: 300,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/rc.json'
		},
		{
			levelCap: 350,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/du.json'
		},
		{
			levelCap: 400,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/vp.json'
		},
		{
			levelCap: 450,
			stageUrl: 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/bs.json'
		}
	];
	
	// setup stage divisions
	var stageDivisionsUrl = 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageTypes.json';
	var stageDivisions = $.getJSON(stageDivisionsUrl, function (data) {
		return data;
	});
	
	// setup stage id
	function getStage(stageId) {
		var stageUrls = [];
		stageCollections.forEach(function (stages){
			if (stageId <= stages.levelCap) {
				stageUrls.push(stages.stageUrl);
			}
		});  
		return stageUrls;
	}
	
	var stageId = $('body').attr('stage-data');
	console.log('searched stage is ' + stageId);
	var stageUrl = getStage(stageId).shift();

	// variables for individual stage info
	var currentArea, stageIcon, hitPoints, stageName, stageType, stageMoves, 
			boardLayout, disruptions, disruptionInit, disruptionBoard, disruptionTimer,
			basePower, ability, captureRate,
			recommendedParty, srankStrat, clearStrat, teamLimit;
	
	
	$.getJSON(stageUrl, function (data) {
		// get the area name
		currentArea = data.shift()['stageNo'];
		
		data.map(function (item) {
			
			if (item['stageNo'].toString() === stageId) {
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
				$('.stage-number').text(stageId);
				
				var disruptionArr = disruptions.split(/\n/);
				
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
				
				console.log('disruption board: ' + disruptionBoard);
				console.log('disruption initial: ' + disruptionInit);
				console.log('disruption timer: ' + disruptionTimer);

				
				handleStageIcon(stageIcon);

				handleCaptureRate(captureRate);
				$('.stage-power').text(basePower);
				$('.stage-ability').text(ability);

				
				handleStageLayout(boardLayout);

				
				handleStageClearing(clearStrat);

				
				handleStageSRank(srankStrat);
			}	
		});
	});

	var splitBreakLine = function (data) {
		return data.split('\n');
	}
	
	var getPokemonDivisions = function(stageDivisionUrl) {
		$.getJSON(stageDivisionUrl, function (data) {
			return data;
		});
	};
	
	// handle capture rate display
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

	// handle stage icon display
	var handleStageIcon = function(stageIcon) {
		$('.stage__thumbnail').attr('src', 'images/icons/icon_' + stageIcon + '.png');
	}

	// handle board layout display
	var handleStageLayout = function(stageLayoutUrl) {
		$('.setup__layout').attr('src', stageLayoutUrl);
	}
	
	// handle clearing strategy display
	var handleStageClearing = function(stageClearing) {
		$('.strategy__walkthrough-content.clearing').text(stageClearing);
	}

	// handle srank strategy & moves display
	var handleStageSRank = function(stageSRank) {
		var movesInitPos = stageSRank.indexOf('least');
		var movesLastPos = stageSRank.indexOf('left');
		var movesSRank = stageSRank.slice(movesInitPos + 6, movesLastPos - 6);

		var strat = stageSRank.split('\n');
		strat.shift();
		
		$('.stage-srank-moves').text(movesSRank);
		$('.strategy__walkthrough-content.srank').text(strat.join(' '));
	}
	
	function closestLevelCap(value, stage) {
		return value <= stage.levelCap;
	}
	
})();