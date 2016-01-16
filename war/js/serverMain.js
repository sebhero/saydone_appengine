	function init() {
		var apisToLoad;
		var callback = function() {
			 if (--apisToLoad == 0) {
				 signin(true, handleAuth);
			 }
		}

		apisToLoad = 2;
		//Parameters are APIName,APIVersion,CallBack function,API Root 
		gapi.client.load('taskitemendpoint', 'v1', callback, 'http://localhost:8888/_ah/api');


	document.getElementById('listTasksBtn').onclick = function() {
		listTasks(); 
		}

		document.getElementById('insertTask').onclick = function() {
		insertTask();
	}

		document.getElementById('updateTask').onclick = function() {
		updateTask();
	}

}

	 //List Quotes function that will execute the listQuote call
function listTasks() 
{
		gapi.client.taskitemendpoint.listTaskItem().execute(function(resp) {
			if (!resp.code) {
				resp.items = resp.items || [];
				var result = "";
				for (var i=0;i<resp.items.length;i++) {
					result = result+resp.items[i].title + "..." + "<b>" + resp.items[i].timeStamp + "</b>" + "[" + resp.items[i].id + "]" + "<br/>";
				}
				document.getElementById('listQuotesResult').innerHTML = result;
			}
		});
}

//Insert new taks.
function insertTask()
{

}