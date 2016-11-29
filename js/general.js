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

	// reorder roommates by name
	roommates.sort(sort_by('name', false, function(a){return a.toUpperCase()}));

	$.each(roommates, function(index, roommate) {

		// if(roommate.owes <= 0){
		// 	roommate.owes = "nothing";
		// } else {
		// 	roommate.owes = "$" + roommate.owes;
		// }

		// combine the templateA with individual roommate to create useable HTML
		var roommatePaidHTML = roommatePaidTemplate(roommate);
		// append your newly created html
		$('#roommate-paid').append(roommatePaidHTML);
		if (isStalePageLoad()) {
			// reorder roommates
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
		var roommate = {name: "Roommate " + (inputCounter + 1), paid: ""};
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
							paid: $(this).val(),
							owes: "",
							payments: [],
							stillOwes: ""
						};
		if(roommate.paid !== "") {
			roommates.push(roommate);
		}
	});
										console.log('roommates: ', roommates);
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

	return sum/count;
}

function updateLocalStorage(roommates) {
	// Put the object into storage
	localStorage.setItem('roommates', JSON.stringify(roommates));
										console.log('local storage: ', JSON.stringify(roommates));
}

function getStoredRoomates() {
	if (isStalePageLoad()) {
		var storedRoommates = localStorage.getItem('roommates');
		storedRoommates = JSON.parse(storedRoommates);
	} else {
		// set default data to use in the template
		storedRoommates = 	[	{name: "Roommate 1", paid: "", owes: "", payments: [], stillOwes:""},
								{name: "Roommate 2", paid: "", owes: "", payments: [], stillOwes:""}
							];
	}	
										console.log('storedRoommates: ', storedRoommates);
	return storedRoommates;
}

function setOwes(roommates) {
	var averagePaid = getAveragePaid(roommates);

	$.each(roommates, function(key, roommate) {
		roommate.owes = (averagePaid-roommate.paid/1).toFixed(2);
		roommate.stillOwes = roommate.owes;
	});
	// Sort by name, case-insensitive, A-Z
	roommates.sort(sort_by('name', false, function(a){return a.toUpperCase()}));
										console.log('set Owes: ', roommates.sort(sort_by('name', false, function(a){return a.toUpperCase()})));
}

function getCreditorStillOwed(maxCreditor, maxDebtor) {
	var creditorStillOwed = maxCreditor.stillOwes/1 + maxDebtor.stillOwes/1;

	return creditorStillOwed;
}

function addDebtorPayment(maxCreditor, maxDebtor, paymentAmount) {
	var newPayment = {name: maxCreditor.name, amount: paymentAmount};
	maxDebtor.payments.push(newPayment);
	// Sort by name, case-insensitive, A-Z
	maxDebtor.payments.sort(sort_by('name', false, function(a){return a.toUpperCase()}));
										console.log("newPayment: {name: " + newPayment.name + ", amount: " + newPayment.amount + "}");
										console.log("maxDebtor.payments: ", maxDebtor.payments);
}

function getMaxCreditor(roommates) {
	// min owes = maxCreditor
	var maxCreditorOwes = Math.min.apply(Math, roommates.map(function(roommate) { return roommate.stillOwes; }))
	var maxCreditorArray = roommates.filter(function(roommate) { return roommate.stillOwes == maxCreditorOwes; });

	return maxCreditorArray[0];
}

function getMaxDebtor(roommates) {
	// max owes = maxDebtor
	var maxDebtorOwes = Math.max.apply(Math, roommates.map(function(roommate) { return roommate.stillOwes; }));
	var maxDebtorArray = roommates.filter(function(roommate) { return roommate.stillOwes == maxDebtorOwes; });

	return maxDebtorArray[0];
}

function doPaymentsRemain(roommates) {
	var paymentsRemaining = 0;

	$.each(roommates, function(key, roommate) {
		if(roommate.stillOwes/1 !== 0) {
			paymentsRemaining += 1;
		} 
	});	
										console.log("paymentsRemaining? " + (paymentsRemaining > 0? true: false));
	return (paymentsRemaining > 0? true: false);
}

function setPayments(roommates) {
	while(doPaymentsRemain(roommates)) {
		var maxCreditor = getMaxCreditor(roommates);
		var maxDebtor = getMaxDebtor(roommates);
										console.log("maxCreditor: ", maxCreditor);
										console.log("maxDebtor: ", maxDebtor);
		var creditorStillOwed = getCreditorStillOwed(maxCreditor, maxDebtor);

		if(creditorStillOwed <= 0) {
			addDebtorPayment(maxCreditor, maxDebtor, maxDebtor.stillOwes/1);
			maxCreditor.stillOwes = maxCreditor.stillOwes/1 + maxDebtor.stillOwes/1;
			maxDebtor.stillOwes = 0;
										console.log("maxCreditor is now owed (1): " + maxCreditor.stillOwes/1);
										console.log("maxDebtor now owes (1): " + maxDebtor.stillOwes/1);
		} else if (creditorStillOwed > 0) {
			var diff = maxDebtor.stillOwes/1 + maxCreditor.stillOwes/1;
			addDebtorPayment(maxCreditor, maxDebtor, diff);
			maxCreditor.stillOwes = maxCreditor.stillOwes/1 + diff/1;
			maxDebtor.stillOwes = maxDebtor.stillOwes/1 - diff/1;
										console.log("maxCreditor is now owed (2): " + maxCreditor.stillOwes/1);
										console.log("maxDebtor now owes (2): " + maxDebtor.stillOwes/1);
		}
	}
}

// reusable sort for any field type
var sort_by = function(field, reverse, primer){
	var key = primer ? 	function(x) {return primer(x[field])} : 
						function(x) {return x[field]};

	reverse = !reverse ? 1 : -1;

	return function (a, b) {
		return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
	} 
}

function displayPayments() {
	var roommates = getRoommates();
	setOwes(roommates);
	setPayments(roommates);
	updateLocalStorage(roommates);

	$('#roommate-owes').empty();
	$.each(roommates, function(index, roommate) {

		// if(roommate.owes <= 0){
		// 	roommate.owes = "nothing";
		// } else {
		// 	roommate.owes = "$" + roommate.owes;
		// 	// example: Roommate 1 owes $15.00 total, $5.00 to Roommate 2 and $10.00 to Roommate 3
		// }

		// combine the templateB with roommate payment to create useable HTML
		var html = roommateOwesTemplate(roommate);
		// append your newly created html
		$('#roommate-owes').append(html);
	});
}

// Clear button
$("#clear").click(function(){
	window.localStorage.clear();
	initializePage();
});

initializePage();