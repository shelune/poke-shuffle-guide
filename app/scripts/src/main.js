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
			levelCap: 120,
			stageUrl: 'mv'
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

	// variables for individual stage info
	var currentArea, stageIcon, hitPoints, stageName, stageType, stageMoves, 
			boardLayout, disruptions, disruptionInit, disruptionBoard, disruptionTimer,
			basePower, ability, captureRate,
			recommendedParty, srankStrat, clearStrat, teamLimit;

	var splitBreakLine = function (data) {
		return data.split('\n');
	}

	var splitPeriod = function(data) {
		return data.split('.');
	}
	
	var splitSlash = function(data) {
		return data.split('/');
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
		var disruptionArrBoard = [], disruptionArrInit = [], disruptionArrTimer = [];
					
		if (disruptionArr.length <= 1) {
			disruptionBoard = 'None';
			disruptionInit = 'None';
			disruptionTimer = 'None';
		} else {
			$.each(disruptionArr, function(line, value) {
				if (value.toLowerCase().startsWith('board') && value.length > value.indexOf(':')) {
					var separator = value.indexOf(':');
					disruptionBoard = value.slice(separator + 1, value.length);
				} else if (value.toLowerCase().startsWith('initial') && value.length > value.indexOf(':')) {
					var separator = value.indexOf(':');
					disruptionInit = value.slice(separator + 1, value.length);
				} else if (value.toLowerCase().startsWith('timer') && value.length > value.indexOf(':')) {
					var separator = value.indexOf(':');
					disruptionTimer = value.slice(separator + 1, value.length);
				}
			});
		}

		disruptionArrTimer = splitPeriod(disruptionTimer);
		disruptionArrInit = splitPeriod(disruptionInit);
		disruptionArrBoard = splitPeriod(disruptionBoard);

		$.each(disruptionArrTimer, function(index, value) {
			value = value + '.';
			$('[data-attr="stage-disruption-timer"]').append('<li>' + value.trim() + '</li>');
		});

		$.each(disruptionArrInit, function(index, value) {
			value = value + '.';
			$('[data-attr="stage-disruption-init"]').append('<li>' + value.trim() + '</li>');
		});

		$.each(disruptionArrBoard, function(index, value) {
			value = value + '.';
			$('[data-attr="stage-disruption-board"]').append('<li>' + value.trim() + '</li>');
		});
				
		//console.log(disruptionBoard);
		//console.log(disruptionInit);
		//console.log(disruptionArrTimer);
	};

	// handle recommended team
	var handleParty = function(recommendedParty) {
		var choices = recommendedParty.split('\n');
		var results = [];

		// split & put each pokemon into a new array
		choices.forEach(function (choice) {
			if (choice.includes('/')) {
				var tempChoices = choice.split('/');
				results = results.concat(tempChoices);
			}
			else if (choice.includes(',')) {
				var tempChoices = choice.split(',');
				results = results.concat(tempChoices);
			} 
			else {
				results.push(choice);
			}
		});

		// filter out empty & duplicate values
		results = unique(results).filter(function (value) {
			return value != "";
		});

		// match pokemon with its icon to display out on recommended party
		results.forEach(function (result) {
			if (result.startsWith('[')) {
				result = result.slice(1, -1).toLowerCase();
				pokemonCollection['mega'].forEach(function (referencePoke) {
					if (referencePoke.pokemonName.toLowerCase().includes(result.toLowerCase()) && !referencePoke.pokemonName.includes(' X')) {
						$('[data-attr="stage-slots-mega"]').append('<span style="background-image: url(' + referencePoke.pokemonIcon + ')"></span>');
					}
				});
			} else {
				for (var key in pokemonCollection) {
					var division = pokemonCollection[key];
					division.forEach(function (referencePoke) {
						if (result.trim().toLowerCase().startsWith(referencePoke.pokemonName.toLowerCase()) && result.trim().length > 0) {
							$('[data-attr="stage-slots-' + key + '"]').append('<span style="background-image: url(' + referencePoke.pokemonIcon + ')"></span>');
						}
					});
				}
			}
		});
		console.log(results);
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
		$('ul[data-attr^="stage-disruption"]').empty();
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
			console.log(stageUrl);
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

					handleDisruptions(disruptions);
					handleParty(recommendedParty);
				}	
			});
		});
	};

	resetData();
	loadStageData(stageUrl);
	
	/*
	*********
	Horsey Autocomplete
	*********
	*/
	
	horsey(document.querySelector('#stage-selector'), {
		source: [{ list: ['banana', 'apple', 'orange'] }]
	});
	

})();