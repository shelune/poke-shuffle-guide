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
		if (stageUrls.length >= 1) {
			return stageUrls.shift();
		}
		return "";
	}
	
	var stageId = $('body').attr('stage-data-id');	
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

	// handle stage selection
	$('.stage-selector').change(function () {
		console.log($(this).val());
		$('body').attr('stage-data-id', $(this).val());
		stageId = $('body').attr('stage-data-id');
		var stageUrl = getStage(stageId);
		resetData();
		loadStageData(stageUrl);
	});

	// handle HP
	var handleHP = function(hitPts) {
		var hitpointsDisplay = $('[data-attr="stage-hp"]');
		hitpointsDisplay.text(hitPts);
		if (hitpointsDisplay.text().includes('\n')) {
			var nerfs = hitpointsDisplay.text().split('\n');
			hitpointsDisplay.html('<del>' + nerfs[0] + '</del> ' + nerfs[1]);
		}
	}
	
	// handle capture rate display
	var handleCaptureRate = function (captureRate) {
		if (captureRate.length < 2) {
			$('[data-attr="stage-capture"]').text('N/A');
			$('[data-attr="stage-capture-bonus"]').text('N/A');	
		} else {
			var captureRateInit = parseInt(captureRate[0].slice(5, -1));
			var captureRateBonus = parseInt(captureRate[1].slice(6, -1));
			if (isNaN(captureRateInit) || isNaN(captureRateBonus)) {
				$('[data-attr="stage-capture"]').text('N/A');
				$('[data-attr="stage-capture-bonus"]').text(captureRateBonus);
			} else {
				$('[data-attr="stage-capture"]').text(captureRateInit);
				$('[data-attr="stage-capture-bonus"]').text(captureRateBonus);
			}
		}
	};

	// handle stage icon display
	var handleStageIcon = function(stageIcon) {
		$('[data-attr="stage-thumbnail"]').attr('src', 'images/icons/icon_' + stageIcon + '.png');
	};

	// handle board layout display
	var handleStageLayout = function(stageLayoutUrl) {
		$('[data-attr="stage-setup-layout"]').attr('src', stageLayoutUrl);
	};
	
	// handle clearing strategy display
	var handleStageClearing = function(stageClearing) {
		$('[data-attr="stage-strategy-clearing"]').text(stageClearing);
	};

	// handle srank strategy & moves display
	var handleStageSRank = function(stageSRank) {
		var strat = stageSRank.split('\n');
		strat.shift();
		$('[data-attr="stage-strategy-srank"]').text(strat.join(' '));
	};
	
	// handle base power
	var handleBasePower = function(basePower) {
		if (isNaN(basePower)) {
			$('[data-attr="stage-power"]').text('N/A');
		} else {
			$('[data-attr="stage-power"]').text(basePower);
		}
	};
	
	// handle ability
	var handleAbility = function(ability) {
		if (ability.includes(':')) {
			ability = ability.slice(14, -1);
		}
		$('[data-attr="stage-ability"]').text(ability);
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

	// handle recommended team
	var handleParty = function(recommendedParty) {
		var choices = recommendedParty.split('\n');
		var result = [];

		// split & put each pokemon into a new array
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

		// filter out empty & duplicate values
		result = unique(result).filter(function (value) {
			return value != "";
		});

		// match pokemon with its icon to display out on recommended party
		result.forEach(function (pokemon) {
			pokemon = pokemon.trim();
			if (pokemon.startsWith('[')) {
				pokemon = pokemon.slice(1, -1).toLowerCase();
				console.log(pokemonCollection);
				pokemonCollection['mega'].forEach(function (value) {
					if (value.pokemonName.toLowerCase().includes(pokemon) && !value.pokemonName.includes(' X')) {
						$('[data-attr="stage-slots-mega"]').append('<span style="background-image: url(' + value.pokemonIcon + ')"></span>');
					}
				});
			} else {
				for (var key in pokemonCollection) {
					var tempStages = pokemonCollection[key];
					tempStages.forEach(function (value) {
						if (value.pokemonName.toLowerCase().startsWith(pokemon.toLowerCase())) {
							$('[data-attr="stage-slots-' + key + '"]').append('<span style="background-image: url(' + value.pokemonIcon + ')"></span>');
						}
					});
				}
			}
		});
		console.log(result);
	};

	var handleStageType = function (stageType) {
		$('[data-attr="stage-type"]').text(stageType);
	};

	var handleStageLimit = function (stageLimit) {
		$('[data-attr="stage-limit"]').text(stageLimit);
	};

	var handleStageMoves = function (stageMoves, stageSRank) {
		var movesInitPos = stageSRank.indexOf('least');
		var movesLastPos = stageSRank.indexOf('left');
		var movesSRank = stageSRank.slice(movesInitPos + 6, movesLastPos - 6);

		$('[data-attr="stage-srank-moves"]').text(movesSRank);
		$('[data-attr="stage-moves"]').text(stageMoves);
	};

	var handleStageName = function (stageName) {
		$('[data-attr="stage-name"]').text(stageName);
	};

	var resetData = function() {
		$('span[data-attr^="stage-"]').text('---');
		$('div[data-attr^="stage-slots-"]').empty();
	};

	function unique(list) {
	  var result = [];
	  $.each(list, function(i, e) {
	    if ($.inArray(e, result) == -1) result.push(e);
	  });
	  return result;
	}

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
					
					handleStageType(stageType);
					handleStageLimit(teamLimit);
					handleStageMoves(stageMoves, srankStrat);
					handleStageName(stageName);
					
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