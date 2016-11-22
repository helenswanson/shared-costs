// ===================Handlebars specific============================
// get your template content
var paidSource = $("#roommate-paid-template").html();
var owesSource = $("#roommate-owes-template").html();
// use Handlebars to "compile" the template
var roommatePaidTemplate = Handlebars.compile(paidSource);
var roommateOwesTemplate = Handlebars.compile(owesSource);
// set some data to use in the template

var roommates = [	{name: "Roommate 1", paid: "", owes: ""},
					{name: "Roommate 2", paid: "", owes: ""}
				];

var roommates = getStoredRoomates();

$.each(roommates, function(index, roommate) {
	// combine the templateA with individual roommate to create useable HTML
	var roommatePaidHTML = roommatePaidTemplate(roommate);
	var roommateOwesHTML = roommateOwesTemplate(roommate);

	// append your newly created html
	$('#roommate-paid').append(roommatePaidHTML);
	$('#roommate-owes').append(roommateOwesHTML);

});

// ===================General========================================
// $("#clear").click(function(){
//   window.location.reload()
// });

var inputCounter = 2;
function addInput(){
	var limit = 9;

	if (inputCounter == limit)  {
			alert("You have reached the limit of adding " + inputCounter + " roommates");
	}
	else {
		var roommate = {name: "Roommate " + (inputCounter + 1), paid: "", owes: ""};
		// combine the template with roommate to create useable HTML
		var html = templateA(roommate);
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
	console.log('roommates: ' + roommates);

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
	console.log("sum/count = " + sum/count);

	return sum/count;
}

function updateLocalStorage(roommates) {
	// Put the object into storage
	localStorage.setItem('roommates', JSON.stringify(roommates));
	console.log('local storage: ', JSON.stringify(roommates));
}

function getStoredRoomates() {
	var storedRoommates = localStorage.getItem('roommates');
	console.log('storedRoommates: ', JSON.parse(storedRoommates));

	return JSON.parse(storedRoommates);
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
		var html = templateB(roommate);
		// append your newly created html
		$('#roommate-owes').append(html);
	});
}

$(document).ready(function() {

	$("#clear").click(function(){
      window.location.reload()
	});

	var localStorage = getStoredRoomates();
	console.log('localStorage: ', localStorage);

	if(localStorage){ 
		alert("Local storage exists");
	} else {
		alert("No local storage");
	}

	// if localStorage is empty, load page normally
	// if localStorage contains saved values, display all of them as they were


});