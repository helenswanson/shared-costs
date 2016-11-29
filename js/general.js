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
		var roommate = {name: "Roommate " + (inputCounter + 1), paid: "", owes: "", payments:[], stillOwes:""};
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
	if (isStalePageLoad()) {
		var storedRoommates = localStorage.getItem('roommates');
		storedRoommates = JSON.parse(storedRoommates);
	} else {
		// set default data to use in the template
		storedRoommates = 	[	{name: "Roommate 1", paid: "", owes: "", payments:[], stillOwes:""},
								{name: "Roommate 2", paid: "", owes: "", payments:[], stillOwes:""}
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
	var result = $.grep(roommates, function(roommate){ return roommate.owes == owes; });

	return result[0];
}

function setPayments(roommates) {

	var maxCreditorOwes = Math.min.apply(Math, roommates.map(function(roommate) { return roommate.owes; }));
	var maxDebtorOwes = Math.max.apply(Math, roommates.map(function(roommate) { return roommate.owes; }));
	var maxCreditor = getRoommateFromOwes(roommates, maxCreditorOwes);
	var maxDebtor = getRoommateFromOwes(roommates, maxDebtorOwes)

	console.log("maxCreditor: " + maxCreditorOwes);
	console.log("maxDebtor: " + maxDebtorOwes);
	console.log("maxCreditor.name: " + maxCreditor.name);
	console.log("maxDebtor.name: " + maxDebtor.name);

// 	look at highest creditor that has a stillOwes != 0
//	
// 	while (this creditor's stillOwes < 0)	
//		var owesPayment = highestCreditor.stillOwes + highestDebtor.stillOwes
//		if (owesPayment <=0)
//			highestCreditor.stillOwes += highestDebtor.stillOwes
//			highestDebtor.stillOwes = 0
//		else (ie owesPayment > 0)	
//			var difference = highestDebtor.stillOwes - highestCreditor.stillOwes
//			highestCreditor.stillOwes += difference
//			highestDebtor.stillOwes -= difference
//	
//		


}

// order roommates from high to low - DONE
// lowest debtors goes to highest creditors
// --> if lowest debtor stillOwes == 0, move on to next lowest debtor
// keep doing this until
// --> if doing this causes highest creditor's stillOwes > 0
// --> subtract stillOwes amount from lowest debtor's stillOwes and
// --> move on to next highest creditor for payments

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