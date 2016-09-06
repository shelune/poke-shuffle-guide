;(function () {
	// level caps
	var stageCollections = [
		{
			levelCap: 10,
			stageUrl: 'pb'
		},
		{
			levelCap: 20,
			stageUrl: 'sb'
		},
		{
			levelCap: 30,
			stageUrl: 'nf'
		},
		{
			levelCap: 45,
			stageUrl: 'ia'
		},
		{
			levelCap: 60,
			stageUrl: 'rp'
		},
		{
			levelCap: 75,
			stageUrl: 'gr'
		},
		{
			levelCap: 90,
			stageUrl: 'ss'
		},
		{
			levelCap: 105,
			stageUrl: 'sm'
		},
		{
			levelCap: 135,
			stageUrl: 'cn'
		},
		{
			levelCap: 150,
			stageUrl: 'jv'
		},
		{
			levelCap: 180,
			stageUrl: 'ww'
		},
		{
			levelCap: 210,
			stageUrl: 'pv'
		},
		{
			levelCap: 240,
			stageUrl: 'at'
		},
		{
			levelCap: 300,
			stageUrl: 'rc'
		},
		{
			levelCap: 350,
			stageUrl: 'du'
		},
		{
			levelCap: 400,
			stageUrl: 'vp'
		},
		{
			levelCap: 450,
			stageUrl: 'bs'
		}
	];
	
	// setup stage divisions
	var pokemonCollectionUrl = 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/pokemonCollection.json';
	var pokemonCollection;
	$.getJSON(pokemonCollectionUrl, function (data) {
		console.log(data);
		pokemonCollection = data;
	});
	
	// setup stage id
	function getStage(stageId) {
		var stageUrls = [];
		stageCollections.forEach(function (stages){
			if (stageId <= stages.levelCap) {
				stageUrls.push('https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/stageGuides/' + stages.stageUrl + '.json');
			}
		});  
		if (stageUrls.length < 1) {
			return "";
		} else {
			return stageUrls.shift();
		}
	}
	
	var stageId = $('body').attr('stage-data');	
	$('.stage-selector').keyup(function () {
		console.log($(this).val());
		$('body').attr('stage-data', $(this).val());
		stageId = $('body').attr('stage-data');
		var stageUrl = getStage(stageId);
		loadStageData(stageUrl);
	});
	var stageUrl = getStage(stageId);
	console.log(stageUrl);

	// variables for individual stage info
	var currentArea, stageIcon, hitPoints, stageName, stageType, stageMoves, 
			boardLayout, disruptions, disruptionInit, disruptionBoard, disruptionTimer,
			basePower, ability, captureRate,
			recommendedParty, srankStrat, clearStrat, teamLimit;

	var splitBreakLine = function (data) {
		return data.split('\n');
	}
	
	var getPokemonDivisions = function(stageDivisionUrl) {
		$.getJSON(stageDivisionUrl, function (data) {
			return data;
		});
	};


	// handle HP
	var handleHP = function(hitPts) {
		$('span.stage-hp').text(hitPts);
		if ($('span.stage-hp').text().includes('\n')) {
			var nerfs = $('span.stage-hp').text().split('\n');
			$('span.stage-hp').html('<del>' + nerfs[0] + '</del> ' + nerfs[1]);
		}
	}
	
	// handle capture rate display
	var handleCaptureRate = function (captureRate) {
		if (captureRate.length < 2) {
			$('.stage-capture').text('N/A');
			$('.stage-capture-bonus').text('N/A');	
		} else {
			var captureRateInit = parseInt(captureRate[0].slice(5, -1));
			var captureRateBonus = parseInt(captureRate[1].slice(6, -1));
			if (isNaN(captureRateInit)) {
				$('.stage-capture').text('N/A');
			} else {
				$('.stage-capture').text(captureRateInit);
			}

			if (isNaN(captureRateBonus)) {
				$('.stage-capture-bonus').text('N/A');
			} else {
				$('.stage-capture-bonus').text(captureRateBonus);
			}
		}
	};

	// handle stage icon display
	var handleStageIcon = function(stageIcon) {
		$('.stage__thumbnail').attr('src', 'images/icons/icon_' + stageIcon + '.png');
	};

	// handle board layout display
	var handleStageLayout = function(stageLayoutUrl) {
		$('.setup__layout').attr('src', stageLayoutUrl);
	};
	
	// handle clearing strategy display
	var handleStageClearing = function(stageClearing) {
		$('.strategy__walkthrough-content.clearing').text(stageClearing);
	};

	// handle srank strategy & moves display
	var handleStageSRank = function(stageSRank) {
		var movesInitPos = stageSRank.indexOf('least');
		var movesLastPos = stageSRank.indexOf('left');
		var movesSRank = stageSRank.slice(movesInitPos + 6, movesLastPos - 6);

		var strat = stageSRank.split('\n');
		strat.shift();
		
		$('.stage-srank-moves').text(movesSRank);
		$('.strategy__walkthrough-content.srank').text(strat.join(' '));
	};
	
	var handleBasePower = function(basePower) {
		if (isNaN(basePower)) {
			$('.stage-power').text('N/A');
		} else {
			$('.stage-power').text(basePower);
		}
	};
	
	var handleAbility = function(ability) {
		if (ability.includes(':')) {
			ability = ability.slice(14, -1);
		}
		$('.stage-ability').text(ability);
	};

	// TODO : better formatting without having format the source data
	var handleDisruptions = function(disruptions) {
		var disruptionArr = disruptions.split(/\n/);
					
		if (disruptionArr.length <= 1) {
			disruptionBoard = 'None';
			disruptionInit = 'None';
			disruptionTimer = 'None';
		} else {
			$.each(disruptionArr, function(line, value) {
				if (value.toLowerCase().startsWith('board')) {
					var separator = value.indexOf(':');
					disruptionBoard = value.slice(separator, value.length);
				} else if (value.toLowerCase().startsWith('initial')) {
					var separator = value.indexOf(':');
					disruptionInit = value.slice(separator, value.length);
				} else if (value.toLowerCase().startsWith('timer')) {
					var separator = value.indexOf(':');
					disruptionTimer = value.slice(separator, value.length);
				}
			});
		}
				
		console.log('disruption board: ' + disruptionBoard);
		console.log('disruption initial: ' + disruptionInit);
		console.log('disruption timer: ' + disruptionTimer);
	};

	var handleParty = function(recommendedParty) {
		var choices = recommendedParty.split('\n');
		var result = [];

		// split & put each pokemon into new array
		choices.forEach(function (choice) {
			if (choice.includes('/')) {
				var tempChoices = choice.split('/');
				result = result.concat(tempChoices);
			}
			else if (choice.includes(',')) {
				var tempChoices = choice.split(',');
				result = result.concat(tempChoices);
			} 
			else {
				result.push(choice);
			}
		});

		// filter out empty values
		result = result.filter(function (value) {
			return value != "";
		});

		// match pokemon with icon to display out on recommended party
		result.forEach(function (pokemon) {
			pokemon = pokemon.trim();
			if (pokemon.startsWith('[')) {
				pokemon = pokemon.slice(1, -1).toLowerCase();
				console.log(pokemonCollection);
				pokemonCollection['mega'].forEach(function (value) {
					if (value.pokemonName.toLowerCase().includes(pokemon)) {
						$('.strategy-slot--mega').find('.strategy-slot__options').append('<span style="background-image: url(' + value.pokemonIcon + ')"></span>');
					}
				});
			} else {
				for (var key in pokemonCollection) {
					var tempStages = pokemonCollection[key];
					tempStages.forEach(function (value) {
						if (value.pokemonName.toLowerCase().startsWith(pokemon.toLowerCase())) {
							$('.strategy-slot--' + key).find('.strategy-slot__options').append('<span style="background-image: url(' + value.pokemonIcon + ')"></span>');
						}
					});
				}
			}
		});

		//console.log('concat:');
		console.log(result);
	};

	var loadStageData = function (stageUrl) {

		$.getJSON(stageUrl, function (data) {
		// get the area name
			currentArea = data.shift()['stageNo'];
			console.log(currentArea);
			
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
					$('span.stage-limit').text(teamLimit);
					$('span.stage-moves').text(stageMoves);
					$('.stage-name').text(stageName);
					$('.stage-number').text(stageId);
					$('title').text(stageName);
					
					handleHP(hitPoints);
					handleStageIcon(stageIcon);
					handleCaptureRate(captureRate);
					handleBasePower(basePower);
					handleAbility(ability);
					handleStageLayout(boardLayout);					
					handleStageClearing(clearStrat);
					handleStageSRank(srankStrat);

					// handleDisruptions(disruptions);
					handleParty(recommendedParty);
				}	
			});
		});
	};

	loadStageData(stageUrl);

})();