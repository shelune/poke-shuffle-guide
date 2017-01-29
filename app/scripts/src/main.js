;(function () {
	// level caps
	var mainStageCap = 530;
	var expertStageCap = 45;
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
		},
		{
			levelCap: 500,
			stageUrl: 'gh'
		},
		{
			levelCap: 530,
			stageUrl: 'nc'
		}
	];

	var currentMode = $('[stage-data-switcher="current"]').text();
	var altMode = $('[stage-data-switcher="alt"]').text();
	
	// setup stage divisions
	var pokemonCollectionUrl = 'scripts/assets/pokemonCollection.json';
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
	function getStageUrl(stageId) {
		if (currentMode === "Main") {
			var stageUrls = [];
			stageCollections.forEach(function (stages){
				if (stageId <= stages.levelCap) {
					stageUrls.push('scripts/assets/stageGuides/' + stages.stageUrl + '.json');
				}
			});  
			if (stageUrls.length >= 1) {
				return stageUrls.shift();
			}
			return "";
		} else if (currentMode === "Expert") {
			return 'scripts/assets/expertGuides/expert.json';
		}
	}

	// get the value with key from target object
	var unwrapProp = function(target, key) {
		if (target[key]) {
			return target[key];
		} else {
			return "";
		}
	};

	// split a sentence into array based on breakline
	var splitBreakLine = function (sentence) {
		if (sentence) {
			return sentence.split('\n');
		}
	};

	// split a sentence into array based on period.
	var splitPeriod = function(sentence) {
		if (sentence) {
			return sentence.split('.');
		}
	};
	
	// split a sentence into array based on slash
	var splitSlash = function(sentence) {
		if (sentence) {
			return sentence.split('/');
		}
	};
	
	// split a sentence into object with key and its value
	var splitColon = function(sentence) {
		var result = {key: "", phrase: ""};
		var separator = sentence.indexOf(':');
		result.phrase = sentence.slice(separator + 1, sentence.length);
		result.key = sentence.slice(0, separator);
		return result;
	};

	// split a sentence into array based on comma
	var splitComma = function(sentence) {
		if (sentence) {
			return sentence.split(',');
		}
	};
	
	var checkArrHasDupl = function(arr, element, key) {
		return arr.some(function(arrItem) {
			return arrItem[key] === element[key];
		});
	}

	// check if a sentence includes a word
	var checkKey = function(sentence, key) {
		return sentence.toLowerCase().includes(key);
	};

	// check a bunch of sentences for a word
	var checkKeyArr = function(sentence, keyArr) {
		var included = false;
		keyArr.forEach(function(key) {
			if (checkKey(sentence, key)) {
				included = true;
			}
		});
		return included;
	}

	// filter out all repeat items in an array
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
	** Change Mode - MODES
	*****/

	var changeMode = function(mode) {
		var tempMode = currentMode;
		currentMode = altMode;
		altMode = tempMode;
	}

	$('[stage-data-switcher="alt"]').click(function (e) {
		e.preventDefault();
		changeMode();
		$('[stage-data-switcher="current"]').text(currentMode);
		$('[stage-data-switcher="alt"]').text(altMode);
		$('body').attr('stage-mode', currentMode.toLowerCase());

		$('.stage-selector').val('');
		resetData();
		handleSuggestions(currentMode);
		stageUrl = getStageUrl(stageId);
		loadStageData(stageUrl);
	});

	/*****
	** Handle Displaying Data - HANDLES
	*****/

	// handle autocompletes
	var handleSuggestions = function(mode) {
		if (mode === "Main") {
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
						stageUrl = getStageUrl(stageId);
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
		} else if (mode === "Expert") {
			var options = {
				url: pokemonCollectionUrl,
				listLocation: "expert",
				getValue: "pokemonName",
				list: {
					match: {
						enabled: true
					},
					onClickEvent: function() {
						stageId = parseInt($('#stage-selector').getSelectedItemData()['location']);
						$('#stage-selector').val(stageId);
						$('body').attr('stage-data-id', stageId);	
						stageUrl = getStageUrl(stageId);
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
		}
		$('#stage-selector').easyAutocomplete(options);

		$('#stage-selector').keyup(function (e) {
		if (e.keyCode === 13) {
			resetData();
			stageId = parseInt($('#stage-selector').val());
			if (!isNaN(stageId)) {
				if (currentMode === "Main") {
					if (stageId > mainStageCap) {
						$('.stage__number').after('<div class="stage-selector__helper">Current stage cap is ' + mainStageCap + '</div>');
					} else if (stageId < 1) {
						$('.stage__number').after('<div class="stage-selector__helper">Even Celebi would not allow you to go back that far</div>');
					} else {
						$('body').attr('stage-data-id', stageId);	
						stageUrl = getStageUrl(stageId);
						loadStageData(stageUrl);
					}
				}
				if (currentMode === "Expert") {
					if (stageId > expertStageCap) {
						$('.stage__number').after('<div class="stage-selector__helper">Current stage cap is ' + expertStageCap + '</div>');
					} else if (stageId < 1) {
						$('.stage__number').after('<div class="stage-selector__helper">Celebi would not allow you to go back that far</div>');
					} else {
						$('body').attr('stage-data-id', stageId);	
						stageUrl = getStageUrl(stageId);
						loadStageData(stageUrl);
					}
				}
				
			} else {
				$('.stage__number').after('<div class="stage-selector__helper">Please input number only or use the suggestions</div>');
			}
		}
	});
	}

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

	var handleSRankCriteria = function(mode) {
		if (mode === "Expert") {
			$('span[data-attr="stage-srank-criteria"]').text('3 seconds');
		}
		if (mode === "Main") {
			$('span[data-attr="stage-srank-criteria"]').text('move');
			console.log('this mode is ' + mode);
		}
	}

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

	var handleTimer = function(timer) {
		$('[data-attr="stage-timer"]').text(timer);
	};

	var handleUnlockReq = function(requirement) {
		$('[data-attr="stage-requirement"]').text(requirement);
	}

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

			if (disruptionArrBoard) {
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
			}

			if (disruptionArrInit) {
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
			}

			if (disruptionArrTimer) {
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
			}

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

		console.log(results);

		// match pokemon with its icon to display out on recommended party
		results.forEach(function (result) {
			if (result.trim().startsWith('[')) {
				result = result.trim().slice(1, -1).toLowerCase();
				pokemonCollection['mega'].forEach(function (referencePoke) {
					// clumsy filter for Zard X, dunno how to deal with MMX
					if (referencePoke.pokemonName.toLowerCase().includes(result.substring(0, result.length - 2).toLowerCase()) && !referencePoke.pokemonName.endsWith(' X') && !result.toLowerCase().includes("any")) {
						$('[data-attr="stage-slots-mega"]').append('<span class="team-option hint--bottom" aria-label="' + referencePoke.pokemonName + ' - ' + referencePoke.location + '" style="background-image: url(' + referencePoke.pokemonIcon + ')"></span>');
					}
				});
			} else {
				for (var key in pokemonCollection) {
					var division = pokemonCollection[key];
					division.forEach(function (referencePoke) {
						if (result.trim().toLowerCase() === (referencePoke.pokemonName.toLowerCase()) && result.trim().length > 0) {
							$('[data-attr="stage-slots-' + key + '"]').append('<span class="team-option hint--bottom" aria-label="' + referencePoke.pokemonName + ' - ' + referencePoke.location + '" style="background-image: url(' + referencePoke.pokemonIcon + ')"></span>');
						}
					});
				}
			}
		});
	};

	// handle suggested team
	var handleSuggestedTeam = function (suggestions) {
		var teamList, memberList;
		if (suggestions != "") {
			teamList = [];
			// separate suggestTeam into 2 strings of teams
			splitBreakLine(suggestions).forEach(function (team, index) {
				if (team != "") {
					teamList.push(team);
				}
			});

			teamList.forEach(function (team, index) {
				// breakdown team string to array of team members
				memberList = splitComma(team);
				var suggestedList = [];
				if (index === 0) {
					var megaSlot = {'name': '', 'location': '', 'icon': ''};
					var supportSlots = [];
					memberList.map(function (member) {
						if (member.trim().startsWith('[')) {
							member = member.trim().slice(1, -1).toLowerCase();
							pokemonCollection['mega'].forEach(function (referencePoke) {
								// clumsy filter for Zard X, dunno how to deal with MMX
								if (referencePoke.pokemonName.toLowerCase().includes(member.substring(0, member.length - 2).toLowerCase()) && !referencePoke.pokemonName.endsWith(' X')) {
									megaSlot.pokemonName = referencePoke.pokemonName;
									megaSlot.location = referencePoke.location;
									megaSlot.pokemonIcon = referencePoke.pokemonIcon;
									console.log('mega: ' + referencePoke.pokemonName);
								}
							});
						} else {
							for (var key in pokemonCollection) {
								var division = pokemonCollection[key];
								division.forEach(function (referencePoke) {
									if (member.trim().toLowerCase() === (referencePoke.pokemonName.toLowerCase()) && member.trim().length > 0) {
										var supportSlot = {'pokemonName': '', 'location': '', 'pokemonIcon': ''};
										supportSlot.pokemonName = referencePoke.pokemonName;
										supportSlot.location = referencePoke.location;
										supportSlot.pokemonIcon = referencePoke.pokemonIcon;
										if (!checkArrHasDupl(supportSlots, supportSlot, 'pokemonName')) {
											supportSlots.push(supportSlot);
											console.log('added to support ' + supportSlot.pokemonName);
										}
									}
								});
							}
						}
					});
					$('[data-attr="stage-party-optimal"]').append('<span class="team-option hint--bottom mega" aria-label="' + megaSlot.pokemonName + ' - ' + megaSlot.location + '" style="background-image: url(' + megaSlot.pokemonIcon + ')"></span>');
					supportSlots.forEach(function (slot) {
						$('[data-attr="stage-party-optimal"]').append('<span class="team-option hint--bottom" aria-label="' + slot.pokemonName + ' - ' + slot.location + '" style="background-image: url(' + slot.pokemonIcon + ')"></span>');
					});
				} else {
					var megaSlot = {'name': '', 'location': '', 'icon': ''};
					var supportSlots = [];
					memberList.map(function (member) {
						if (member.includes('[') || member.includes(']')) {
							member = member.trim().slice(1, -1).toLowerCase();
							pokemonCollection['mega'].forEach(function (referencePoke) {
								// clumsy filter for Zard X, dunno how to deal with MMX
								if (referencePoke.pokemonName.toLowerCase().includes(member.substring(0, member.length - 2).toLowerCase()) && !referencePoke.pokemonName.endsWith(' X')) {
									megaSlot.pokemonName = referencePoke.pokemonName;
									megaSlot.location = referencePoke.location;
									megaSlot.pokemonIcon = referencePoke.pokemonIcon;
									console.log('mega: ' + referencePoke.pokemonName);
								}
							});
						} else {
							for (var key in pokemonCollection) {
								var division = pokemonCollection[key];
								division.forEach(function (referencePoke) {
									if (member.trim().toLowerCase() === (referencePoke.pokemonName.toLowerCase()) && member.trim().length > 0) {
										var supportSlot = {'pokemonName': '', 'location': '', 'pokemonIcon': ''};
										supportSlot.pokemonName = referencePoke.pokemonName;
										supportSlot.location = referencePoke.location;
										supportSlot.pokemonIcon = referencePoke.pokemonIcon;
										if (!checkArrHasDupl(supportSlots, supportSlot, 'pokemonName')) {
											supportSlots.push(supportSlot);
											console.log('added to support ' + supportSlot.pokemonName);
										}
									}
								});
							}
						}
					});
					$('[data-attr="stage-party-alternate"]').append('<span class="team-option hint--bottom mega" aria-label="' + megaSlot.pokemonName + ' - ' + megaSlot.location + '" style="background-image: url(' + megaSlot.pokemonIcon + ')"></span>');
					supportSlots.forEach(function (slot) {
						$('[data-attr="stage-party-alternate"]').append('<span class="team-option hint--bottom" aria-label="' + slot.pokemonName + ' - ' + slot.location + '" style="background-image: url(' + slot.pokemonIcon + ')"></span>');
					});
				}
			});
		}
	}

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

	// get stage id, change stage id in body, update stageUrl, reset data, load stage data
	var handleStagePrep = function (stageId) {
		$('body').attr('stage-data-id', stageId);
		stageUrl = getStageUrl(stageId);
		resetData();
		loadStageData(stageUrl);
	};

	// handle backward - forward button
	var validateProgressBtn = function(modeCap, forward) {
		if (forward) {
			if (parseInt(stageId) + 1 > modeCap) {
				resetData();
				$('.stage__number').after('<div class="stage-selector__helper">Current stage cap is ' + mainStageCap + '</div>');
			} else {
				stageId = parseInt(stageId) + 1;
				handleStagePrep(stageId);
			}
		} else {
			if (parseInt(stageId) < 2) {
				resetData();
				$('.stage__number').after('<div class="stage-selector__helper">Even Celebi would not allow you to go back that far</div>');
			} else {
				stageId = parseInt(stageId) - 1;
				handleStagePrep(stageId);
			}
		}
	};

	// reset site to its original state
	var resetData = function() {
		$('ul[data-attr^="stage-disruption"]').empty();
		$('span[data-attr^="stage-"]').text('---');
		$('[data-attr^="stage-slots-"]').empty();
		$('[data-attr^="stage-party-"]').empty();
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
				teamLimit, srankStrat, clearStrat, recommendedParty, suggestedTeam;
		$.getJSON(stageUrl, function (data) {
		// get the area name
			if (currentMode === "Main") {
				console.log(data.shift()['stageNo']);
			}

			console.log(stageUrl);
			
			$('#stage-selector').val(stageId);
			// filter out the correct stage and process data
			data.map(function (item) {
				var tempStage = item['stageNo'];
				if (parseInt(tempStage) === parseInt($('body').attr('stage-data-id'))) {
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
					suggestedTeam = unwrapProp(item, 'suggestedTeam');

					if (currentMode === "Expert") {
						handleTimer(stageTimer);
						handleUnlockReq(stageUnlock);
					}

					handleStageType(stageType);
					handleStageLimit(teamLimit);
					handleStageMoves(stageMoves, srankStrat);
					handleStageName(stageName);
					handleSRankCriteria(currentMode);
					
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
					handleSuggestedTeam(suggestedTeam);
				}	
			});
		});
	};

	handleStagePrep(stageId);
	handleSuggestions(currentMode);

	/*****
	** Autocomplete
	*****/

	$('.stage-back').click(function(e) {
		validateProgressBtn(mainStageCap, false);
	});

	$('.stage-next').click(function(e) {
		e.preventDefault();
		if (currentMode === "Expert") {
			validateProgressBtn(expertStageCap, true);
		}
		if (currentMode === "Main") {
			validateProgressBtn(mainStageCap, true);
		}
	});

})();