/**
Author: Shema Rezanejad

Used to give functionality to the graduate page.
Adds new graduates to the database, and searches for them in the database
Edits, and deletes grads as well.

**/ 
// static var

function addGrad(studentInfo) {
	console.log(studentInfo[0]+ "\n" + studentInfo[1] + "\n" + studentInfo[2]
		+ "\n" + studentInfo[3] + "\n" + studentInfo[4] + "\n" + studentInfo[5]
		+ "\n" + studentInfo[6] + "\n" + studentInfo[7] + "\n" + studentInfo[8]);

	var id = studentInfo[0];
	var firstName = studentInfo[1];
	var lastName = studentInfo[2];
	var email = studentInfo[3];
	var GPA = studentInfo[4];
	var program = studentInfo[5];
	var gradYear = studentInfo[6];
	var gradTerm = studentInfo[7];
	var contact = studentInfo[8];
	// 	pool.getConnection(function(error, connection) {
	// 	//query database
 //        connection.query("INSERT INTO graduate (studentId, firstName, lastName, email, gpa, program, gradTerm, gradYear)" + 
 //        	"VALUES ('" + id + "'" + "," + "'" + firstName + "'" + ")", function(err, rows) {

	// 		//error querying
	// 		if (err) {
	// 			console.log(err);
	// 			res.send(err);
	// 		} else {
	
	// 			console.log("Graduate was added!");

	// 			//release connection to db
	// 			connection.release();
				
	// 			//pass graduates object to graduate view
	// 			// res.render('graduate.ejs', graduates);
	// 		}
	// 	});
	// });	
}
