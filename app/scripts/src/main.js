;(function () {
	// level caps
	var mainStageCap = 450;
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

	var modes = ["MAIN", "EXPERT", "SPECIAL"];
	
	// setup stage divisions
	var pokemonCollectionUrl = 'https://rawgit.com/shelune/poke-shuffle-guide/master/app/scripts/assets/pokemonCollection.json';
	var pokemonCollection;
	$.getJSON(pokemonCollectionUrl, function (data) {
		pokemonCollection = data;
	});

	var stageId = $('body').attr('stage-data-id');
	var stageUrl;

	/******
	** helper functions - HELPERS
	******/
	
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

	var unwrapProp = function(target, key) {
		if (target[key]) {
			return target[key];
		} else {
			return "";
		}
	}

	var splitBreakLine = function (sentence) {
		return sentence.split('\n');
	};

	var splitPeriod = function(sentence) {
		return sentence.split('.');
	};
	
	var splitSlash = function(sentence) {
		return sentence.split('/');
	};
	
	var splitColon = function(sentence) {
		var result = {key: "", phrase: ""};
		var separator = sentence.indexOf(':');
		result.phrase = sentence.slice(separator + 1, sentence.length);
		result.key = sentence.slice(0, separator);
		return result;
	};

	var checkKey = function(sentence, key) {
		return sentence.toLowerCase().includes(key);
	};

	var checkKeyArr = function(sentence, keyArr) {
		var included = false;
		keyArr.forEach(function(key) {
			if (checkKey(sentence, key)) {
				included = true;
			}
		});
		return included;
	}

	function unique(list) {
	  var result = [];
	  list.forEach(function(listItem) {
	  	if ($.inArray(listItem, result) == -1) result.push(listItem);
	  });
	  return result;
	}

	var getPokemonDivisions = function(stageDivisionUrl) {
		$.getJSON(stageDivisionUrl, function (data) {
			return data;
		});
	};

	/*****
	** Handle Displaying Data - HANDLES
	*****/

	// handle HP
	var handleHP = function(hitPts) {
		var hitpointsDisplay = $('[data-attr="stage-hp"]');
		hitpointsDisplay.text(hitPts);
		// handle nerfed stages
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
			// handle mega capture rate
			if (isNaN(captureRateInit) || isNaN(captureRateBonus)) {
				$('[data-attr="stage-capture"]').text('N/A');
				$('[data-attr="stage-capture-bonus"]').text('N/A');
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
		// remove the s-rank requirement
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
		var disruptionBoard, disruptionInit, disruptionTimer, disruptionSupport, disruptionCond, disruptionCondStart;
		var disruptionArrBoard = [], disruptionArrInit = [], disruptionArrTimer = [], disruptionArrSupport = [], disruptionArrCond = [], disruptionArrRandom = [];
					
		if (disruptionArr.length <= 1) {
			$('[data-attr="stage-disruption-board"]').append('<li>None</li>');
			$('[data-attr="stage-disruption-init"]').append('<li>None</li>');
			$('[data-attr="stage-disruption-timer"]').append('<li>None</li>');
		} else {
			$.each(disruptionArr, function(line, value) {
				if (checkKey(value, 'board:') && value.length > value.indexOf(':')) {
					disruptionBoard = splitColon(value)['phrase'];
				} else if (checkKey(value, 'initial:') && value.length > value.indexOf(':')) {
					disruptionInit = splitColon(value)['phrase'];
				} else if (checkKey(value, 'timer:') && value.length > value.indexOf(':')) {
					disruptionTimer = splitColon(value)['phrase'];
				} else if (checkKey(value, 'support:') || checkKey(value, 'added:')) {
					disruptionSupport = splitColon(value)['phrase'];
				} else if (checkKeyArr(value, ['moves:', 'turn:', 'health:', '%:', 'hp:'])) {
					disruptionCond = splitColon(value)['phrase'];
					disruptionCondStart = splitColon(value)['key'];
				}
			});

			disruptionArrTimer = splitPeriod(disruptionTimer);
			disruptionArrInit = splitPeriod(disruptionInit);
			disruptionArrBoard = splitPeriod(disruptionBoard);

			if (disruptionSupport) {
				disruptionArrSupport = splitPeriod(disruptionSupport);
			} else {
				$('[data-attr="stage-disruption-support"]').append('<li>None</li>');
			}

			if (disruptionCond) {
				$('[data-attr="stage-disruption-conditionstart"]').text(disruptionCondStart);
				if (disruptionCond.includes('/')) {
					disruptionArrRandom = splitColon(disruptionCond)['phrase'].split('/');
					$('[data-attr="stage-disruption-condition"]').append('<li>Any of the following:<ul></ul></li>');
					disruptionArrRandom.forEach(function (randomDisruption) {
						$('[data-attr="stage-disruption-condition"] li > ul').append('<li>' + randomDisruption.trim() +'</li>');
					});
				} else {
					$('[data-attr="stage-disruption-condition"]').append('<li>' + disruptionCond + '</li>');
				}
			} else {
				$('[data-attr="stage-disruption-conditionstart"]').text('None');
			}

			disruptionArrBoard.forEach(function (disruption) {
				// detects if have random disrution
				if (disruption.includes('/')) {
					// if yes, get the possible disruptions & add inner ul
					disruptionArrRandom = splitColon(disruption)['phrase'].split('/');
					$('[data-attr="stage-disruption-board"]').append('<li>Any of the following:<ul></ul></li>');
					
					// split the disruptions into items and insert into the inner ul
					disruptionArrRandom.forEach(function (randomDisruption) {
						$('[data-attr="stage-disruption-board"] li > ul').append('<li>' + randomDisruption.trim() +'</li>');
					});
				} else {
					// if not, just add items into the outer ul
					$('[data-attr="stage-disruption-board"]').append('<li>' + disruption.trim() + '</li>');
				}
			});

			disruptionArrInit.forEach(function (disruption) {
				if (disruption.includes('/')) {
					disruptionArrRandom = splitColon(disruption)['phrase'].split('/');
					$('[data-attr="stage-disruption-init"]').append('<li>Any of the following:<ul></ul></li>');
					disruptionArrRandom.forEach(function (randomDisruption) {
						$('[data-attr="stage-disruption-init"] li > ul').append('<li>' + randomDisruption.trim() +'</li>');
					});
				} else {
					$('[data-attr="stage-disruption-init"]').append('<li>' + disruption.trim() + '</li>');
				}
			});

			disruptionArrTimer.forEach(function (disruption) {
				if (disruption.includes('/')) {
					disruptionArrRandom = splitColon(disruption)['phrase'].split('/');
					$('[data-attr="stage-disruption-timer"]').append('<li>Any of the following:<ul></ul></li>');
					disruptionArrRandom.forEach(function (randomDisruption) {
						$('[data-attr="stage-disruption-timer"] li > ul').append('<li>' + randomDisruption.trim() +'</li>');
					});
				} else {
					$('[data-attr="stage-disruption-timer"]').append('<li>' + disruption.trim() + '</li>');
				}
			});

			disruptionArrSupport.forEach(function (disruption, index) {
				if (index === 0) {
					$('[data-attr="stage-disruption-support"]').append('<li><strong>' + disruption.trim() + '</strong></li>');
				} else {
					$('[data-attr="stage-disruption-support"]').append('<li>' + disruption.trim() + '</li>');
				}
			});
		}
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
					// clumsy filter for Zard X, dunno how to deal with MMX
					if (referencePoke.pokemonName.toLowerCase().includes(result.substring(0, result.length - 2).toLowerCase()) && !referencePoke.pokemonName.endsWith(' X') && !result.toLowerCase().includes("any")) {
						$('[data-attr="stage-slots-mega"]').append('<span class="hint--bottom" aria-label="' + referencePoke.pokemonName + ' - ' + referencePoke.location + '" style="background-image: url(' + referencePoke.pokemonIcon + ')"></span>');
					}
				});
			} else {
				for (var key in pokemonCollection) {
					var division = pokemonCollection[key];
					division.forEach(function (referencePoke) {
						if (result.trim().toLowerCase().startsWith(referencePoke.pokemonName.toLowerCase()) && result.trim().length > 0) {
							$('[data-attr="stage-slots-' + key + '"]').append('<span class="hint--bottom" aria-label="' + referencePoke.pokemonName + ' - ' + referencePoke.location + '" style="background-image: url(' + referencePoke.pokemonIcon + ')"></span>');
						}
					});
				}
			}
		});
		console.log(results);
	};

	// handle stage type display
	var handleStageType = function (stageType) {
		$('[data-attr="stage-type"]').css('background-image', 'url(images/types/type_' + stageType + '.svg)');
	};

	// handle supports limit
	var handleStageLimit = function (stageLimit) {
		$('[data-attr="stage-limit"]').text(stageLimit);
	};

	// handle stage maximum moves & srank moves
	var handleStageMoves = function (stageMoves, stageSRank) {
		var movesInitPos = stageSRank.indexOf('least');
		var movesLastPos = stageSRank.indexOf('left');
		var movesSRank = stageSRank.slice(movesInitPos + 6, movesLastPos - 6);
		if (/^[a-zA-Z]/.test(movesSRank)) {
			$('[data-attr="stage-srank-moves"]').text('0');
		} else {
			$('[data-attr="stage-srank-moves"]').text(movesSRank);
		}
		$('[data-attr="stage-moves"]').text(stageMoves);
	};

	// handle stage Pokemon name display
	var handleStageName = function (stageName) {
		$('[data-attr="stage-name"]').text(stageName);
	};

	// reset site to its original state
	var resetData = function() {
		$('ul[data-attr^="stage-disruption"]').empty();
		$('span[data-attr^="stage-"]').text('---');
		$('[data-attr^="stage-slots-"]').empty();
		$('[data-attr^="stage-strategy-"]').empty();
		$('img[data-attr="stage-setup-layout"]').attr('src', 'http://placehold.it/300x300');
		$('img[data-attr="stage-thumbnail"]').attr('src', 'images/icons/icon_01.png');
		$('span[data-attr="stage-type"]').css('background-image', 'url(images/types/type_Unknown.svg)');
		$('.stage-selector__helper').remove();
	};

	// get data from targeted JSON file
	var loadStageData = function (stageUrl) {
		var stageName, stageIcon, stageType, stageMoves, hitPoints, captureRate, basePower, ability, stageTimer, stageUnlock,
				boardLayout, disruptions,
				teamLimit, srankStrat, clearStrat, recommendedParty;
		$.getJSON(stageUrl, function (data) {
		// get the area name
			currentArea = data.shift()['stageNo'];
			console.log(stageUrl);
			console.log(currentArea);
			
			// filter out the correct stage and process data
			data.map(function (item) {
				if (item['stageNo'].toString() === $('body').attr('stage-data-id')) {
					stageIcon = unwrapProp(item, 'icon')
					hitPoints = unwrapProp(item, 'hitPts');
					stageName = unwrapProp(item, 'name');
					stageType = unwrapProp(item, 'type');
					stageMoves = unwrapProp(item, 'moves');;
					boardLayout = unwrapProp(item, 'initialBoardSetup');
					teamLimit = unwrapProp(item, 'pokemon');
					recommendedParty = unwrapProp(item, 'recommendedParty');
					captureRate = splitBreakLine(unwrapProp(item, 'captureRate'));
					srankStrat = unwrapProp(item, 'srankingStrategy');
					clearStrat = unwrapProp(item, 'clearingStrategy');
					disruptions = unwrapProp(item, 'disruptions');
					basePower = unwrapProp(item, 'basePower');
					ability = unwrapProp(item, 'ability');
					stageTimer = unwrapProp(item, 'time');
					stageUnlock = unwrapProp(item, 'srank');

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

	stageUrl = getStage(stageId);
	resetData();
	loadStageData(stageUrl);

	/*****
	** Autocomplete
	*****/

	var options = {
		url: pokemonCollectionUrl,
		listLocation: "main",
		getValue: "pokemonName",
		list: {
			match: {
				enabled: true
			},
			onClickEvent: function() {
				stageId = parseInt($('#stage-selector').getSelectedItemData()['location']);
				$('#stage-selector').val(stageId);
				$('body').attr('stage-data-id', stageId);	
				stageUrl = getStage(stageId);
				resetData();
				loadStageData(stageUrl);
			},
		},
		highlightPhrase: false,
		template: {
			type: "description",
			fields: {
				description: "location"
			}
		}
	};

	$('#stage-selector').easyAutocomplete(options);

	$('#stage-selector').keyup(function (e) {
		if (e.keyCode === 13) {
			resetData();
			stageId = parseInt($('#stage-selector').val());
			if (!isNaN(stageId)) {
				if (stageId > mainStageCap) {
					$('.stage__number').after('<div class="stage-selector__helper">Current stage cap is ' + mainStageCap + '</div>');
				} else if (stageId < 1) {
					$('.stage__number').after('<div class="stage-selector__helper">Even Celebi would not allow you to go back that far</div>');
				} else {
					$('body').attr('stage-data-id', stageId);	
					stageUrl = getStage(stageId);
					loadStageData(stageUrl);
				}
			} else {
				$('.stage__number').after('<div class="stage-selector__helper">Please input number only or use the suggestions</div>');
			}
		}
	});

	$('.stage-back').click(function(e) {
		e.preventDefault();
		if (parseInt(stageId) < 2) {
			resetData();
			$('.stage__number').after('<div class="stage-selector__helper">Even Celebi would not allow you to go back that far</div>');
		} else {
			stageId = parseInt(stageId) - 1;
			$('body').attr('stage-data-id', stageId);
			stageUrl = getStage(stageId);
			resetData();
			loadStageData(stageUrl);
		}
	});

	$('.stage-next').click(function(e) {
		e.preventDefault();
		if (parseInt(stageId) + 1 > mainStageCap) {
			resetData();
			$('.stage__number').after('<div class="stage-selector__helper">Current stage cap is ' + mainStageCap + '</div>');
		} else {
			stageId = parseInt(stageId) + 1;
			$('body').attr('stage-data-id', stageId);
			stageUrl = getStage(stageId);
			resetData();
			loadStageData(stageUrl);
		}
	});

})();