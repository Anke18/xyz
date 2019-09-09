    
/*-----------------------------------------------------------
  Code reference:
  Claire EllulCEGE0043: Web and Mobile GIS - Apps and Programming (18/19)


var client;

function startAnswerUpload(postAnswerString)
{
	//alert(postAnswerString);
	processAnswerData(postAnswerString);
}

function processAnswerData(postAnswerString) 
{
	client = new XMLHttpRequest();
	var url = 'http://developer.cege.ucl.ac.uk:'+ httpPortNumber + "/uploadAnswer";
	client.open('POST',url,true);
	client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	client.onreadystatechange = answerDataUploaded;
	client.send(postAnswerString);
}

function answerDataUploaded()
{
	if (client.readyState == 4)
	{
		//alert("Your answer was submitted!"); change alert to div
		document.getElementById("answerUploadResult").innerHTML = client.responseText;
	}
}
------------------------------------------------------------*/

function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		
		reader.onload = function (e) {
			$('#blah').attr('src', e.target.result);
		}
		
		reader.readAsDataURL(input.files[0]);
	}
}

$("#imgInp").change(function(){
	readURL(this);
});
//------------------------------------------------------
$("#form1").ajaxSubmit();

$(function () {
	$('#datetimepicker1').datetimepicker();
});




