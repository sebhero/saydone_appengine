console.log("loading main");
//for adding tooltips
$('[data-toggle="tooltip"]').tooltip();
var item={};
var taskList =[];
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
            value:theAvgTime || 0,
            writable:true,
            enumerable:true
        },
        "minTime":
        {
            value:theMinTime || 0,
            writable:true,
            enumerable:true
        },
        "maxTime":
        {
            value:theMaxTime || 0,
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
            value:0,
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
    console.log("doint insert ver 2");
//	console.log("title: "+theTask.toJson()+" id: "+theNewID);

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
            console.log("task is checked for done");
//				taskList[theNewID].isDone=true;
            handleDoneTask(taskList[theNewID]);

        }
        else
        {
            console.log("task is marked as undone");
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
        id:'#saveBtnID'+theNewID,
        onclick:'saveBtnClick('+theNewID+');return false;'
    });//deletes task TODO remove should use a archive button instead

    //gui stuff done

}


if(localStorage["tasklist"])
{
//	taskList = JSON.parse(localStorage["tasklist"]);
    taskList = JSON.parse(localStorage.getItem("tasklist"));
    console.log("found local storage: "+taskList);
    $('#errorPanel').append(JSON.stringify(taskList));
    //load all the task to list.
    taskList.forEach(function(taskItem)
    {
        insertTask2(taskItem,taskItem.taskID);
        updateGuiForTask(taskItem);
    });
}
else
{
    console.log("no storage");
    $('#errorPanel').append("Problem with localstorage: ");
    taskList = [];
}
$("#finishBtn").click(function()
{
//							alert("hello");

    var str ='{"title":"diska1","timestamp":123,"minimum":0,"maximum":0,"average":0}';
    var obj = JSON.parse(str);
    alert(JSON.stringify(obj.title));

});


//when click Add Task
document.getElementById('insertTask').onclick = function () {
    //old insert
//            insertTask();
    var theTitle = $('#inputTitle').val();
    var newTask = new Task(theTitle);
    var theNewID = taskList.push(newTask) - 1;
    taskList[theNewID].taskID = theNewID;//should be generated from server.. TODO fix

    localStorage["tasklist"] = JSON.stringify(taskList);

    insertTask2(newTask, theNewID);

};



function insertTask()
{

    //get title from input
    var title = $('#inputTitle').val();

    //get a number of the time
    var timeStamp = Date.now();
    var theTask = {};
    theTask.title = title;
    theTask.timestamp=timeStamp;
    theTask.minimum=0;
    theTask.maximum=0;
    theTask.average=0;

    taskList.push(theTask);
//								alert(JSON.stringify(theTask));
//										alert(JSON.stringify(taskList));
    localStorage["tasklist"] = JSON.stringify(taskList);
//								updateList();
    $("#taskListSelect").prepend("<option data-value='"+JSON.stringify(theTask)+"'>"+theTask.title+"</option>");
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
            console.log("pause time for task: "+taskID);

            $('#playBtnID'+taskID+' span').attr('class','glyphicon glyphicon-play glyp-green');
            clearInterval(currentTask.timer);
            currentTask.timer=null;
            currentTask.isRunning = false;
        }
        else
        {
            console.log("restart time  for task: "+taskID);
            currentTask.timer = setInterval(function(){
                //start tid + ökning i milli.
                currentTask.savedTime = currentTask.savedTime+1000;
//								var currTime = currentTask.startTime+currentTask.savedTime;
                var dd = new Date(currentTask.savedTime);

                //UTC doesnt care about daytime diff..
                console.log(dd.getUTCHours()+":"+dd.getUTCMinutes()+":"+dd.getUTCSeconds());
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
        console.log("start time for task: "+taskID);
        $('#playBtnID'+taskID+' span').attr('class','glyphicon glyphicon-pause glyp-pause');

        currentTask.isRunning =true;
        currentTask.savedTime=0;
        currentTask.startTime = performance.now();
        currentTask.timer = setInterval(function(){

            currentTask.savedTime = currentTask.savedTime+1000;
            //start tid + ökning i milli

            var dd = new Date(currentTask.savedTime);
            console.log(dd.getUTCHours()+":"+dd.getUTCMinutes()+":"+dd.getUTCSeconds());
            document.getElementById("timerID"+taskID).innerHTML = getStringTime(dd);
        },1000);
        timerList[taskID] = currentTask;
    }
}
/*end of start timer*/


function resetTimer(taskID)
{
    var theTask = timerList[taskID];
    console.log("Reset timer for "+taskID);
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
    console.log("timer removed");
    document.getElementById("timerID"+taskID).innerHTML ="0:00";
}


//end of restTimer
function handleDoneTask(theTask)
{
//	alert("hello");
    theTask.isDone = true;
    var theTimeSpent =0;
    var theTimer= timerList[theTask.taskID];
    if(theTimer)
    {
        //stop timer
        if(theTimer.isRunning)
            toggleTimer(theTask.taskID);

        console.log("saved time: "+ timerList[theTask.taskID].savedTime);
        theTimeSpent = theTimer.savedTime;
    }

    //does it exist
    if(theTask.maxTime == undefined || theTask.maxTime==null)
        theTask.maxTime = theTimeSpent;

    //is the time better
    if(theTask.maxTime<theTimeSpent)
        theTask.maxTime = theTimeSpent;

    //does it exist
    if(theTask.minTime == undefined || theTask.minTime==null)
        theTask.minTime = theTimeSpent;

    //is the time better
    if(theTask.minTime>theTimeSpent || theTask.minTime == 0)
    {

        theTask.minTime = theTimeSpent;
    }


    //does it exist
    if(theTask.totalTime == undefined || theTask.totalTime==null)
    {

        theTask.totalTime = theTimeSpent;}
    else
    {
        //add the time spent to current time spent.
        theTask.totalTime=theTask.totalTime+theTimeSpent;
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
    theTask.avgTime = theTask.totalTime/theTask.totalDones;

    updateGuiForTask(theTask);
    saveToStorage(theTask);
}

function handleRedoTask(theTask)
{
    console.log("handle redo task");
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
    console.log("Updateing gui");
    var taskID = theTask.taskID;

    if(theTask.isDone)
    {
        console.log("is done "+JSON.stringify(theTask));
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


        console.log("avg "+avg+" min "+min+" max "+max+ " getstr "+getStringTime(max));
    }

    if(theTask.isDone == false)
    {
        console.log("is NOT done "+JSON.stringify(theTask));
        console.log("task is not done");
        $('#playBtnID'+theTask.taskID).attr('disabled',false);
        $('#collapseBtnID'+theTask.taskID).css('text-decoration', "");
    }
}

console.log("loaded newest 1");
//Save/update the tasks in localstorage
function saveToStorage(theTask)
{
    console.log("Saving> "+theTask);
    taskList[theTask.taskID]=theTask;
    //maybe update task... but i have a direct ref to tasklist...no need
    localStorage["tasklist"] = JSON.stringify(taskList);
}

//update the tasklist with new title of task	
function updateTaskTitle(theID,newTitle)
{
    taskList[theID].title= newTitle;
    saveToStorage(taskList[theID]);
}

//handle savebtn click
function saveBtnClick(theID)
{
    var title = $('#inputTitleID'+theID).val();
    $('#collapseBtnID'+theID).text(title);
    updateTaskTitle(theID,title);
}



//TODO remove for testing
//taskList[1000] = new Task("Test",1000);

$('#chkID'+1000).change(function (event)
{
    if($(event.currentTarget).is(':checked'))
    {
        console.log("task is checked for done");
//				taskList[theNewID].isDone=true;
        handleDoneTask(taskList[1000]);

    }
    else
    {
        console.log("task is marked as undone");
        handleRedoTask(taskList[1000]);
    }
});


