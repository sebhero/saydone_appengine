/***
 * @author Sebastian Boreback
 **/

/***
 * Server stuff
 */

var scopes = 'https://www.googleapis.com/auth/userinfo.email';
var client_id = '721477199484-4sv11th1kbmtpfuovj1gvv5qcsn9r9na.apps.googleusercontent.com';


var serverList;

$(document).ready(function() {
	console.log("load model");
	$(window).load(function(){
        $('#infoMOdal').modal('show');
    });
});


function handleAuth() {
	  var request = gapi.client.oauth2.userinfo.get().execute(function(resp) {
	    if (!resp.code) {
	      // User is signed in, so hide the button
	    	//TODO fix name of id
	      document.getElementById('loginBtn').style.visibility = "hidden";
	      
	    	  //+resp.name;
	      console.log("login user: "+resp.name);
	      document.getElementById('logoutBtn').textContent = "Logg off "+resp.name;
	      document.getElementById('logoutBtn').style.visibility = "";
	    }
	    else {
	    	document.getElementById('loginBtn').style.visibility = "";
	    	document.getElementById('logoutBtn').style.visibility = "hidden";
	    }
	  });
	}


//remove token
function disconnectUser(token) {
	  var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' +
	  token.access_token;

	  // Perform an asynchronous GET request.
	  $.ajax({
	    type: 'GET',
	    url: revokeUrl,
	    async: false,
	    contentType: "application/json",
	    dataType: 'jsonp',
	    success: function(nullResponse) {
	      // Do something now that user is disconnected
	      // The response is always undefined.
	    },
	    error: function(e) {
	      // Handle the error
	      // console.log(e);
	      // You could point users to manually disconnect if unsuccessful
	      // https://plus.google.com/apps
	    }
	  });

}


function signin(mode, callback) {
	  gapi.auth.authorize({client_id: client_id,scope: scopes, immediate: mode},callback);
}
function signout() {
//	var ac_token = gapi.auth.getToken();
	gapi.auth.setToken(null);
	gapi.auth.signOut();
//	disconnectUser(ac_token);
	
	  document.getElementById('logoutBtn').style.visibility = "hidden";
	  document.getElementById('logoutBtn').textContent ="";
	  document.getElementById('loginBtn').style.visibility = "";
}

function init() {
	console.log("loaded init");
    var apisToLoad;

    //called when server connection is setup
    var callback = function() {

        if (--apisToLoad == 0) {
        	//auto logon
           // signin(true, handleAuth);
        }
        //load the list from server
        listTasks();
    }

    apisToLoad = 2;
    //Parameters are APIName,APIVersion,CallBack function,API Root
    var apiRoot = '//' + window.location.host + '/_ah/api';
    gapi.client.load('taskitemendpoint', 'v1', callback, apiRoot);
	gapi.client.load('oauth2','v2',callback);
   


    //check for localstorage.
    if(localStorage["tasklist"])
    {
//	taskList = JSON.parse(localStorage["tasklist"]);
        taskList = JSON.parse(localStorage.getItem("tasklist"));
        //load all the task to list.
        taskList.forEach(function(taskItem)
        {
            if(taskItem !=0)
            {
                insertTask2(taskItem,taskItem.taskID);
                updateGuiForTask(taskItem);
            }

        });
        console.log("done loading from localestorage");
    }
    else
    {
        console.log("no storage");
        $('#errorPanel').append("Problem with localstorage: ");
        taskList = [];
        taskList.push(0); //TODO fix fulhack for JDO auto funkara inte
    }
    
    document.getElementById('loginBtn').onclick = function() {
		signin(false,handleAuth);
	}
    document.getElementById('logoutBtn').onclick = function() {
    	signout();
    }
    
}


//for adding tooltips
$('[data-toggle="tooltip"]').tooltip();
var item={};
var taskList =[];
taskList.push(0); //TODO fix fulhack for JDO auto funkara inte
var timerList = [];
//taskList[1000] = {title:"Test"};

Task = function(theTitle, theTaskID, theAvgTime, theMinTime, theMaxTime)
{
        Object.defineProperties(this,{
        "title":
        {
            value:theTitle || "No title",
            writable:true,
            enumerable:true
        },
        "taskID":
        {
            //Must be set!
            value:theTaskID,
            writable:true,
            enumerable:true
        },
        "avgTime":
        {
            value:theAvgTime || new Date(0),
            writable:true,
            enumerable:true
        },
        "minTime":
        {
            value:theMinTime || new Date(0),
            writable:true,
            enumerable:true
        },
        "maxTime":
        {
            value:theMaxTime || new Date(0),
            writable:true,
            enumerable:true
        },
        "isDone":
        {
            value:false,
            writable:true,
            enumerable:true
        },
        "totalTime":
        {
            value:new Date(0),
            writable:true,
            enumerable:true
        },
        "totalDones":
        {
            value:0,
            writable:true,
            enumerable:true
        },
        "toJson":
        {
            value:function()
            {
                return JSON.stringify(this);
            }
        }
    });
};

Task.prototype.toString = function()
{
    return JSON.stringify(this);
}


/*Create a object from JSON*/
Task.fromJson = function (json) {
    var obj = JSON.parse(json);
    return new Task(obj.title, obj.avgTime, obj.minTime, obj.maxTime);
};


//Create a new task
function insertTask2(theTask, theNewID)
{
        //Gui stuff creation TODO move to a own function
    $('#taskLiTemplate').clone().attr('id','id'+theNewID).appendTo('#ulTaskList');//add new task to list

    //update the fields.
    var theNewListItem=$('#id'+theNewID);
    theNewListItem.removeClass('hidden');
    theNewListItem.find('.input-group-addon label').attr('for','chkID'+theNewID); //update checkbutton link
    theNewListItem.find('.input-group-addon input').attr('id','chkID'+theNewID); //update checkbutton link

    //add click function to checkbox.
    //ToDO maybe reuse a function instead..

    $('#chkID'+theNewID).change(function (event)
    {
        if($(event.currentTarget).is(':checked'))
        {
            handleDoneTask(taskList[theNewID]);
        }
        else
        {
            handleRedoTask(taskList[theNewID]);
        }

    });
//$('#chkID'+theNewID).click(function ()
//		{
//			alert("is checked");
//		});

    //TODO fix is isDone to mark it as checked
    theNewListItem.find('#timerIDTemp').attr("id","timerID"+theNewID); //update task listing btn link
    theNewListItem.find('.taskBtn').attr("href","#collapseID"+theNewID); //update task listing btn link
    theNewListItem.find('#playBtnIDTemp').attr({
        id:'playBtnID'+theNewID,
        onclick:'toggleTimer('+theNewID+');'
    });//play and paus btn update the id and connect to function
    $('#id'+theNewID+' #collapseTemp').attr('id','collapseID'+theNewID); //show edit info
    $('#id'+theNewID+' #collapseBtnIDTemp').attr('id','collapseBtnID'+theNewID); //show edit info
    $('#collapseBtnID'+theNewID).text(theTask.title);
    //TODO update Span innerhtml with values from theTask
    theNewListItem.find('#avgIDTemp').attr('id','avgID'+theNewID); //the avg time id
    theNewListItem.find('#minIDTemp').attr('id','minID'+theNewID); //the min time id
    theNewListItem.find('#maxIDTemp').attr('id','maxID'+theNewID); //the max time id
    $('#id'+theNewID+' #inputTitleIDTemp').attr('id','inputTitleID'+theNewID);//uppdate the inpute-title id
    $('#inputTitleID'+theNewID).val(theTask.title);//uppdate to new title of task in input-title

    theNewListItem.find('#saveBtnIDTemp').attr({
        id:'#saveBtnID'+theNewID,
        onclick:'saveBtnClick('+theNewID+');return false;'
    });//save update title

    theNewListItem.find('#resetBtnIDTemp').attr({
        id:'#resetBtnID'+theNewID,
        onclick:'resetTimer('+theNewID+');return false;'
    });//Reset the timer

    theNewListItem.find('#archiveBtnIDTemp').attr({
        id:'#archiveBtnID'+theNewID,
        onclick:'archiveTask('+theNewID+');return false;'
    });//save update title


    //gui stuff done

}



$("#finishBtn").click(function()
{
//							alert("hello");

    var str ='{"title":"diska1","timestamp":123,"minimum":0,"maximum":0,"average":0}';
    var obj = JSON.parse(str);
    alert(JSON.stringify(obj.title));

});


function tryToAddToLocalStorage(taskFromServer) {
console.log("tasklist length "+taskList.length)
    //check if its allready in list
    if(taskList[taskFromServer.taskID]!==undefined)
    {
        console.log("is allready added in tasklist id= "+taskFromServer.taskID);
        //compare data.. if it got updated from server.
    }
    else
    {
        console.log("Adding new task from server id="+taskFromServer.taskID);
        // then update gui stuff.
        insertTask2(taskFromServer,taskFromServer.taskID);
        updateGuiForTask(taskFromServer);
        taskList.push(taskFromServer);
        saveToStorage();
    }



    // then update gui stuff.
//    insertTask2(taskFromServer,taskFromServer.taskID);
//    updateGuiForTask(taskFromServer);

}
function listTasks() {
    
    if(gapi.client.taskitemendpoint === undefined)
    {
        console.error("list tasks, NO Server");
        return;
    }
    
        console.log("list stuff");
        gapi.client.taskitemendpoint.listTaskItem().execute(function(resp) {
            if (!resp.code) {
                resp.items = resp.items || [];
                var result = "";
                for (var i=0;i<resp.items.length;i++) {
//                    result = result+ "<b>" + resp.items[i].title + "</b>" + "[" + resp.items[i].id + "]" + "<br/>";
                    tryToAddToLocalStorage(resp.items[i]);
                }
                document.getElementById('listQuotesResult').innerHTML = result;
            }
        });
        console.log("done loading from server");
    }
	
/***
 * Add the task to the server
 * @param newTask js object of the new task
 */
function addToServer(newTask)
{
    
    if(gapi.client.taskitemendpoint === undefined)
    {
        console.error("No server connection");
        return;
    }
    
    //TODO fix ful hack, ska skotas av jdo
    newTask.id=newTask.taskID;
	console.log("added to server");
    gapi.client.taskitemendpoint.insertTaskItem(newTask).execute(function(resp) {
        console.log(resp);
        if (!resp.code) {
            //Just logging to console now, you can do your check here/display message
            console.log(resp.id + ":" + resp.titel);
            console.log(JSON.stringify(resp));
            global_resp = resp;

            //client update
            localStorage["tasklist"] = JSON.stringify(taskList);
            insertTask2(newTask, newTask.taskID);
        }
        else {
            console.log(resp.code + " : " + resp.titel);
            alert("Error : " + resp.code + ":" + resp.titel+" Did you login??");
            taskList.splice(newTask.taskID,1);
        }
    });
}


function insertTaskBtnClick()
{
    //old insert
//            insertTask();
    var theTitle = $('#inputTitle').val();
    var newTask = new Task(theTitle);
    
    var theNewID = taskList.push(newTask)-1;
    taskList[theNewID].taskID = theNewID;//should be generated from server.. TODO fix
    
    addToServer(newTask);
	    


}


$("#taskListSelect").change(function(){

    item= $(this).find(":selected").data("value");

    $("#currTitle").text(item.title);
    $("#currTimestamp").text(item.timestamp);
    $("#currMin").text(item.minimum);
    $("#currMax").text(item.maximum);
    $("#currAvg").text(item.average);

});




function toggleTimer(taskID)
{

    var currentTask = timerList[taskID];

    //TODO fixa problemte med vad timern ska ligga i en egen klass
    //eller tillhöra tasklist som funktioner

    if (typeof currentTask !== 'undefined' && currentTask !== null) {
        if(currentTask.isRunning)
        {

            $('#playBtnID'+taskID+' span').attr('class','glyphicon glyphicon-play glyp-green');
            clearInterval(currentTask.timer);
            currentTask.timer=null;
            currentTask.isRunning = false;
        }
        else
        {
            currentTask.timer = setInterval(function(){
                //start tid + ökning i milli.
                currentTask.savedTime = currentTask.savedTime+1000;
//								var currTime = currentTask.startTime+currentTask.savedTime;
                var dd = new Date(currentTask.savedTime);

                //UTC doesnt care about daytime diff..
                document.getElementById("timerID"+taskID).innerHTML = getStringTime(dd);

            },1000);
            currentTask.isRunning =true;
            $('#playBtnID'+taskID+' span').attr('class','glyphicon glyphicon-pause glyp-pause');
        }
    }
    else
    {
        currentTask = {};
        //Starta the timer if the timer object doesnt exist
        $('#playBtnID'+taskID+' span').attr('class','glyphicon glyphicon-pause glyp-pause');

        currentTask.isRunning =true;
        currentTask.savedTime=0;
        currentTask.startTime = performance.now();
        currentTask.timer = setInterval(function(){

            currentTask.savedTime = currentTask.savedTime+1000;
            //start tid + ökning i milli

            var dd = new Date(currentTask.savedTime);
            document.getElementById("timerID"+taskID).innerHTML = getStringTime(dd);
        },1000);
        timerList[taskID] = currentTask;
    }
}
/*end of start timer*/


function resetTimer(taskID)
{
    var theTask = timerList[taskID];
    //check that it exists
    if (typeof theTask == 'undefined' || currentTask == null) {
        //must allways return either true or false otherwise reloads
        console.error("didnt find task");
        return false;
    }

    if(theTask.isRunning)
    {
        $('#playBtnID'+taskID+' span').attr('class','glyphicon glyphicon-play glyp-green');
        clearInterval(theTask.timer);
    }

    //removes the timer aka resets it. so it will be created on start push
    delete timerList[taskID];
    document.getElementById("timerID"+taskID).innerHTML ="0:00";
}


//end of restTimer
function handleDoneTask(theTask)
{
//	alert("hello");
    theTask.isDone = true;
    var theTimeSpent =new Date(0);
    var theTimer= timerList[theTask.taskID];
    if(theTimer)
    {
        //stop timer
        if(theTimer.isRunning)
            toggleTimer(theTask.taskID);

        theTimeSpent = new Date(theTimer.savedTime);
    }
    
//    console.log("timepsent: "+(typeof theTimeSpent));

    if(typeof theTimeSpent  != Date)
    {
        theTimeSpent = new Date(theTimeSpent);
    }
   
    if(typeof theTask.maxTime  != Date)
    {
        theTask.maxTime = new Date(theTask.maxTime);
    }
    
    
   
    
    
    //does it exist
    if(theTask.maxTime == undefined || theTask.maxTime==null)
    {
        theTask.maxTime = theTimeSpent;
        
    }
    else if(theTask.maxTime.getTime() < theTimeSpent.getTime())
    {
        //is the time better
        theTask.maxTime = theTimeSpent;
    }

    
    //does it exist
    if(theTask.minTime == undefined || theTask.minTime==null)
    {
        console.log("min undefined");
        theTask.minTime = theTimeSpent;
    }

    if(typeof theTask.minTime != Date)
    {
     theTask.minTime = new Date(theTask.minTime);   
    }
    //is the time better
    if(theTask.minTime>=theTimeSpent || theTask.minTime.getTime()===0)
    {
        console.log("min new time is better "+theTimeSpent);
        theTask.minTime = theTimeSpent;
    }
    


    //does it exist
    if(theTask.totalTime == undefined || theTask.totalTime==null)
    {
        
        theTask.totalTime = new Date(theTimeSpent);
    }
    else
    {
        //add the time spent to current time spent.
        
        console.error("old tot: "+theTask.totalTime);
        console.log("id: "+theTask.taskID);
        console.error("timesp: "+theTimeSpent.getTime());
        if(typeof theTask.totalTime != Date)
        {
            theTask.totalTime = new Date(theTask.totalTime);
        }
        theTask.totalTime=new Date(theTask.totalTime.getTime()+theTimeSpent.getTime());
    }
    
    //does it exist
    if(theTask.totalDones == undefined || theTask.totalDones==null)
    {	theTask.totalDones = 1;}
    else
    {
        //increase runs done
        theTask.totalDones++;
    }

    //get the avg time
    theTask.avgTime = new Date(theTask.totalTime.getTime()/theTask.totalDones);


    updateGuiForTask(theTask);
    saveToStorage(theTask);
}

function handleRedoTask(theTask)
{
    //noll ställ timer.
    delete timerList[theTask.taskID];

    $('#timerID'+theTask.taskID).text("0:00");
    theTask.isDone = false;

    
    updateGuiForTask(theTask);
    //when everything is updated, set task is not done


}

//help function for createing time
function getStringTime(theDate)
{
    var strTime="";

    if(theDate.getUTCHours()>0)
        strTime=theDate.getUTCHours()+":";

    strTime= strTime+ theDate.getUTCMinutes()+":";

    if(theDate.getUTCSeconds()>9)
    {
        strTime= strTime+theDate.getUTCSeconds();
    }
    else{
        strTime= strTime+"0"+theDate.getUTCSeconds();
    }
    return strTime;
}

function updateGuiForTask(theTask)
{
    var taskID = theTask.taskID;

    if(theTask.isDone)
    {
        var avg = new Date(theTask.avgTime);
        var max = new Date(theTask.maxTime);
        var min = new Date(theTask.minTime);
        //disable play btn
        $('#playBtnID'+theTask.taskID).attr('disabled',true);
        //strike out the task
        $('#collapseBtnID'+theTask.taskID).css('text-decoration', 'line-through');
//        'chkID'+theNewID
        var chkBx = $('#chkID'+theTask.taskID);
        if(!chkBx.is(':checked'))
        {
            chkBx.prop('checked',true);
        }

        $('#avgID'+taskID+' span').text(getStringTime(avg));
        $('#minID'+taskID+' span').text(getStringTime(min));
        $('#maxID'+taskID+' span').text(getStringTime(max));


    }

    if(theTask.isDone == false)
    {
        $('#playBtnID'+theTask.taskID).attr('disabled',false);
        $('#collapseBtnID'+theTask.taskID).css('text-decoration', "");
    }
}


//Save/update the tasks in localstorage on server
function updateTaskOnServer(theTask) {
    
    if(gapi.client.taskitemendpoint === undefined)
    {
        console.error("Cant update on server, No server");
        return;
    }

    
console.log("update task on server");

    theTask.id = theTask.taskID; //TODO fix fulhack

    gapi.client.taskitemendpoint.updateTaskItem(theTask).execute(function(resp) {
        if (!resp.code) {
            //Just logging to console now, you can do your check here/display message
            console.log(resp.id + ":" + resp.title);
    		taskList[theTask.taskID]=theTask;
    		$('#collapseBtnID'+theTask.taskID).text(theTask.title);
    		console.log("updating "+theTask.title);
        }
        else
       	 console.error("couldnt update on server");
    });
}
function saveToStorage(theTask)
{
    if(theTask != undefined)
    {
    	updateTaskOnServer(theTask);
        
    }
    else
    console.log("is undefinde the task");
    //maybe update task... but i have a direct ref to tasklist...no need
    localStorage["tasklist"] = JSON.stringify(taskList);
    
    //Server update
    //update the updateTaskOnServer(theTask);
}

//update the tasklist with new title of task	
function updateTaskTitle(theID,newTitle)
{
    saveToStorage(theID,newTitle)

}

//handle savebtn click
function saveBtnClick(theID)
{
    var title = $('#inputTitleID'+theID).val();
    
    updateTaskTitle(theID,title);
}



//TODO remove for testing
//taskList[1000] = new Task("Test",1000);

$('#chkID'+1000).change(function (event)
{
    if($(event.currentTarget).is(':checked'))
    {
//				taskList[theNewID].isDone=true;
        handleDoneTask(taskList[1000]);

    }
    else
    {
        handleRedoTask(taskList[1000]);
    }

});

function removeFromServer(taskID) {
    console.log("remove from server");
    if(gapi.client.taskitemendpoint === undefined)
    {
        console.error("delete, NO Server "+taskID);
        return;
    }
    //Build the Request Object
    var requestData = {};
    requestData.id = taskID;
    console.log(requestData);
    gapi.client.taskitemendpoint.removeTaskItem(requestData).execute(function(resp) {
        //Just logging to console now, you can do your check here/display message
        console.log(resp);
        if (!resp.code) {
    	    //remove from local array
    	    taskList.splice(taskID, 1);
    	    //update localstorage
    	    saveToStorage();
    	    var element = document.getElementById("id"+taskID);
        	element.parentNode.removeChild(element);

        }
        else
        {
        	console.log("faild to remove "+taskID);
        	return false;
        }
        
    });
}
function archiveTask(taskID)
{
    console.log("deleteing task "+taskID);
    //remove from server
    removeFromServer(taskID);
}

