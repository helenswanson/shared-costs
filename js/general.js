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
	console.log("sum/count = " + sum/count);
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
	// Sort owes by high to low (debtors to creditors)
	roommates.sort(sort_by('owes', true, parseInt));
	console.log('set Owes : ', roommates.sort(sort_by('owes', true, parseInt)));
}

function getRoommateFromOwes(roommates, owes) {
	// var result = $.grep(roommates, function(roommate){ return roommate.owes == owes; });
	var result = roommates.filter(function(roommate) { return roommate.owes == owes; });

	console.log("getRoommateFromOwes: ", result[0]);

	return result[0];
}

function getCreditorStillOwed(maxCreditor, maxDebtor) {
	var creditorStillOwes = maxCreditor.stillOwes/1 + maxDebtor.stillOwes/1;
	console.log("creditorStillOwes: " + creditorStillOwes);

	return creditorStillOwes;
}

function addDebtorPayment(maxCreditor, maxDebtor, paymentAmount) {
	var newPayment = {name: maxCreditor.name, amount: paymentAmount};
	maxDebtor.payments.push(newPayment);

	console.log("newPayment: {name: " + newPayment.name + ", amount: " + newPayment.amount + "}");
	console.log("maxDebtor.payments: ", maxDebtor.payments);
}

function getMaxCreditor(roommates) {
	// min owes = maxCreditor
	var maxCreditorOwes = Math.min.apply(Math, roommates.map(function(roommate) { return roommate.owes; }))
	var result = roommates.filter(function(roommate) { return roommate.owes == maxCreditorOwes; });

	console.log("getMaxCreditor: ", result[0]);

	return result[0];
}

function getMaxDebtor(roommates) {
	// max owes = maxDebtor
	var maxDebtorOwes = Math.max.apply(Math, roommates.map(function(roommate) { return roommate.owes; }));
	var result = roommates.filter(function(roommate) { return roommate.owes == maxDebtorOwes; });

	console.log("getMaxDebtor: ", result[0]);

	return result[0];
}


function setPayments(roommates) {

	// maybe in a separate function(s)...
	// 	given roommates, determine who are current maxCreditor and maxDebtor
	// 		update maxCreditor.stillOwes and maxDebtor.stillOwes as needed
	// 	once selected maxCreditor.stillOwes = 0 OR maxDebtor.stillOwes = 0,
	//		re-determine who are the current maxCreditor and maxDebtor
	//	repeat everything until all stillOwes = 0


	var maxCreditor = getMaxCreditor(roommates);
	var maxDebtor = getMaxDebtor(roommates);
										console.log("maxCreditor: ", maxCreditor);
										console.log("maxDebtor: ", maxDebtor);

	// while selected maxCreditor is still owed money...
	// while(maxCreditor.stillOwes < 0) {
		var creditorStillOwed = getCreditorStillOwed(maxCreditor, maxDebtor);
		var maxCreditorStillOwes = maxCreditor.stillOwes/1;
		var maxDebtorStillOwes = maxDebtor.stillOwes/1;

		if(creditorStillOwed < 0) {
			addDebtorPayment(maxCreditor, maxDebtor, maxDebtor.stillOwes/1);

			maxCreditor.stillOwes = maxCreditor.stillOwes/1 + maxDebtor.stillOwes/1;
			maxDebtor.stillOwes = 0;
										console.log("maxCreditor is now owed (1): " + maxCreditor.stillOwes/1);
										console.log("maxDebtor now owes (1): " + maxDebtor.stillOwes/1);
		} else if (creditorStillOwed > 0) {
			var diff = maxDebtor.stillOwes - maxCreditor.stillOwes;
			addDebtorPayment(maxCreditor, maxDebtor, diff);
			maxCreditor.stillOwes += difference;
			maxDebtor.stillOwes -= difference;
										console.log("maxCreditor is now owed (2): " + maxCreditor.stillOwes/1);
										console.log("maxDebtor now owes (2): " + maxDebtor.stillOwes/1);
		}

	// }

// order roommates from high to low - DONE
// lowest debtors goes to highest creditors - DONE	
// --> if lowest debtor stillOwes == 0, move on to next lowest debtor
// keep doing this until
// --> if doing this causes highest creditor's stillOwes > 0
// --> subtract stillOwes amount from lowest debtor's stillOwes - DONE
// --> move on to next highest creditor for payments

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