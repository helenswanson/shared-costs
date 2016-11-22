// ===================Handlebars specific============================
// get your template content
var paidSource = $("#roommate-paid-template").html();
var owesSource = $("#roommate-owes-template").html();
// use Handlebars to "compile" the template
var roommatePaidTemplate = Handlebars.compile(paidSource);
var roommateOwesTemplate = Handlebars.compile(owesSource);

var inputCounter = 0;

function initializePage() {
	$('#roommate-paid').empty();
	$('#roommate-owes').empty();
	var roommates = getStoredRoomates();
	// counter for addInput
	inputCounter = roommates.length;

	$.each(roommates, function(index, roommate) {
		// combine the templateA with individual roommate to create useable HTML
		var roommatePaidHTML = roommatePaidTemplate(roommate);
		// append your newly created html
		$('#roommate-paid').append(roommatePaidHTML);

		if (isStalePageLoad()) {
			var roommateOwesHTML = roommateOwesTemplate(roommate);
			$('#roommate-owes').append(roommateOwesHTML);
		}
	});
}

// ===================General========================================
function isStalePageLoad() {
	var storedRoommates = localStorage.getItem('roommates');

	return storedRoommates? true: false;
}

function addInput(){
	var limit = 9;

	if (inputCounter == limit)  {
			alert("You have reached the limit of adding " + inputCounter + " roommates");
	}
	else {
		var roommate = {name: "Roommate " + (inputCounter + 1), paid: "", owes: ""};
		// combine the template with roommate to create useable HTML
		var html = roommatePaidTemplate(roommate);
		// append your newly created html
		$('#roommate-paid').append(html);

		inputCounter += 1;
	}
}

function getRoommates() {
	// get all inputs into an array
	var $inputs = $('#dynamicInput :input');
	var roommates = [];

	$inputs.each(function() {
		var roommate = 	{	name: this.name,
							paid: $(this).val()
						};
		if(roommate.paid !== "") {
			roommates.push(roommate);
		}
	});
	// console.log('roommates: ' + roommates);
	return roommates;				
}

function getAveragePaid(roommates) {
	var sum = 0;
	var count = 0;

	$.each(roommates, function(key, roommate) {
		if(roommate.paid !== "") {
			sum += roommate.paid/1;
			count += 1;
		}
	});
	// console.log("sum/count = " + sum/count);
	return sum/count;
}

function updateLocalStorage(roommates) {
	// Put the object into storage
	localStorage.setItem('roommates', JSON.stringify(roommates));
	// console.log('local storage: ', JSON.stringify(roommates));
}

function getStoredRoomates() {
	if (isStalePageLoad()) {
		var storedRoommates = localStorage.getItem('roommates');
		storedRoommates = JSON.parse(storedRoommates);
	} else {
		// set default data to use in the template
		storedRoommates = 	[	{name: "Roommate 1", paid: "", owes: ""},
								{name: "Roommate 2", paid: "", owes: ""}
							];
	}	
	// console.log('storedRoommates: ', storedRoommates);
	return storedRoommates;
}

function setFinalPayments(roommates) {
	var averagePaid = getAveragePaid(roommates);

	$.each(roommates, function(key, roommate) {
		roommate.owes = averagePaid-roommate.paid/1;
	});
}

function displayPayments() {
	var roommates = getRoommates();
	setFinalPayments(roommates);
	updateLocalStorage(roommates);

	$('#roommate-owes').empty();
	$.each(roommates, function(index, roommate) {
		// combine the templateB with roommate payment to create useable HTML
		var html = roommateOwesTemplate(roommate);
		// append your newly created html
		$('#roommate-owes').append(html);
	});
}

// Start over button
$("#clear").click(function(){
	window.localStorage.clear();
	initializePage();
});

initializePage();
