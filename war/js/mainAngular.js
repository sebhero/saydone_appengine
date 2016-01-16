/**
 * Created by Sebastian Börebäck on 2014-10-04.
 */



var google_scopes = 'https://www.googleapis.com/auth/userinfo.email';
var google_client_id = '721477199484-4sv11th1kbmtpfuovj1gvv5qcsn9r9na.apps.googleusercontent.com';


//$(document).ready(function() {
//    console.log("load model");
//    $(window).load(function(){
////        TODO uncomment should show on load.
////        $('#infoMOdal').modal('show');
//    });
//});

var signedIn = false;
var currentUser = {};

'use strict';
function init() {
    window.init(); // Calls the init function defined on the window

}


var app = angular.module('todo', ['ngResource', 'ngAnimate'])
    app.factory('cloudendpoint', function ($q) {
        return {
            init: function () {
                var ROOT = '//' + window.location.host + '/_ah/api';
                var hwdefer = $q.defer();
                var oauthloaddefer = $q.defer();
                var oauthdefer = $q.defer();

                gapi.client.load('taskitemendpoint', 'v1', function () {
                    hwdefer.resolve(gapi);
                }, ROOT);
                gapi.client.load('appuserendpoint', 'v1', function () {
                    hwdefer.resolve(gapi);
                }, ROOT);
                gapi.client.load('oauth2', 'v2', function () {
                    oauthloaddefer.resolve(gapi);
                });
                var chain = $q.all([hwdefer.promise, oauthloaddefer.promise]);
                return chain;
            },
            doCall: function (callback) {
                var p = $q.defer();
                gapi.auth.authorize({client_id: google_client_id, scope: 'https://www.googleapis.com/auth/userinfo.email',
                    immediate: true}, function () {
                    console.log("autho is done success");
                    var request = gapi.client.oauth2.userinfo.get().execute(function (resp) {
                        if (!resp.code) {
                            //call save away user.
                            console.log("do call "+resp.email);

                            p.resolve(resp);
                        } else {
                            p.reject(resp);
                        }
                    });
                });
                return p.promise;
            },
            sigin: function (callback) {
                gapi.auth.authorize({client_id: google_client_id, scope: 'https://www.googleapis.com/auth/userinfo.email',
                    immediate: false}, callback);
            },
            signout: function()
            {
                gapi.auth.setToken(null);
                //Todo now do logout stuff

            },
            checkUser: function () {
                var deferred = $q.defer();
                gapi.client.oauth2.userinfo.get().execute(function (currentUser) {
                    if (!currentUser.code) {
                        //var deferred = $q.defer();
                        console.log(JSON.stringify(currentUser));
                        console.log("got current user "+currentUser.email);

                        var theUser = {};
                        theUser.id=currentUser.email;
                        theUser.email=currentUser.email;
                        //check or add user
                        gapi.client.appuserendpoint.insertAppUser(theUser)
                            .execute(function (resp) {
                                if (!resp.code) {
                                    console.log("got user");
                                    deferred.resolve(resp);

                                }
                                else {
                                    console.error("couldnt get user from server");
                                    deferred.reject(resp);
                                }
                            });

                    }
                    else {
                        console.error("couldnt get user from server");
                        deferred.reject(resp);
                    }
                });
                return deferred.promise;
            }
        }
    });

    app.factory('storageService', function ($rootScope) {

        return {

            get: function (key) {
                return localStorage.getItem(key);
            },

            save: function (key, data) {
                localStorage.setItem(key, JSON.stringify(data));
            },

            remove: function (key) {
                localStorage.removeItem(key);
            },

            clearAll: function () {
                localStorage.clear();
            }
        };
    });

    app.factory('cacheService', function ($http, $q, storageService, cloudendpoint) {

        return {
            //TODO user for localstorage
            getData: function (key) {
                return storageService.get(key);
            },
//TODO user for localstorage
            setData: function (key, data) {
                storageService.save(key, data);
            },

            removeData: function (key) {
                storageService.remove(key);
            },
            insert: function (newTask) {
                var deferred = $q.defer();

                console.log("added to server");
                gapi.client.taskitemendpoint.insertTaskItem(newTask).execute(function (resp) {
                    console.log(resp);
                    if (!resp.code) {
                        //Just logging to console now, you can do your check here/display message
                        console.log("succes! " + resp.id + ":" + resp.title);
                        console.log(JSON.stringify(resp));

                        //promise return
                        deferred.resolve(resp);
                    }
                    else {
                        console.log("error " + resp.code + " : " + resp.titel);
                        deferred.reject(resp);
                    }
                });
                return deferred.promise;
            },
            delete: function (theTaskID) {
                console.log("Doing delete");
                var deferred = $q.defer();
                //Build the Request Object
                var requestData = {};
                requestData.id = theTaskID;
                console.log(requestData);
                gapi.client.taskitemendpoint.removeTaskItem(requestData).execute(function (resp) {
                    //Just logging to console now, you can do your check here/display message
                    console.log(resp);
                    if (!resp.code) {
                        console.log("succes on delete");
                        deferred.resolve(resp);
                    }
                    else {
                        console.log("faild to remove " + theTaskID);
                        deferred.reject(resp);

                    }
                });
//done with delete return promise
                return deferred.promise;
            },
            update: function (theTask) {
                //do update.
                console.log("update task on server");
                var deferred = $q.defer();

                gapi.client.taskitemendpoint.updateTaskItem(theTask).execute(function (resp) {
                    if (!resp.code) {
                        //Just logging to console now, you can do your check here/display message
                        console.log(resp.id + ":" + resp.title);
                        deferred.resolve(resp);
                    }
                    else {
                        console.error("couldnt update on server");
                        deferred.reject(resp);
                    }
                });
//return the promise
                return deferred.promise;
            },
            getTaskList: function () {
                console.log("get list stuff");
                var deferred = $q.defer();

                gapi.client.taskitemendpoint.listTaskItem().execute(function (resp) {
                    if (!resp.code) {
                        console.log("got list of tasks")
                        deferred.resolve(resp);

                    }
                    else {
                        console.error("couldnt get list of task from server");
                        deferred.reject(resp);
                    }
                });
                console.log("done loading from server");
//                  return the promise
                return deferred.promise;
            }
            //end of fucntions of cacheservice
    };
        //cacheservice
    });

    app.directive("hideMe", function ($animate) {
        return function (scope, element, attrs) {
            scope.$watch(attrs.hideMe, function (newVal) {
                if (newVal) {
                    $animate.addClass(element, "fade");
                } else {
                    $animate.removeClass(element, "fade");
                }
            })
        }
    });

    app.animation(".fade", function () {
        return {
            addClass: function (element, className, done) {
                TweenMax.to(element, 1, {opacity: 0,display:'none', onComplete:done});
            },
            removeClass: function (element, className, done) {
                TweenMax.to(element, 1, { display:'block',delay: 1, opacity: 1,onComplete:done});
            }
        }
    });

//CONTROLLER START
app.controller('TodoCtrl', function ($scope, $window,$q,$interval, $timeout, cacheService, storageService, cloudendpoint) {

        $window.init = function () {

            $scope.$apply($scope.initgapi);

        };

        $scope.selected = true;

        $scope.signedIn=false;

        $scope.isHidden= true;

        $scope.todos = [];

        //set init for toogle timer
        $scope.toggleTimerIcon='glyphicon glyphicon-play glyp-green';

        //handle loading gapi
        $scope.initgapi = function () {

            cloudendpoint.init().then(function () {
                console.log("Succesfully loaded gapi");
                //Todo have buttons disable until done
                if($scope.signedIn)
                {
                    //if user is logged in
                    $scope.getTaskList();
                }
                $scope.loginGapi();
                //TODO remove
            }, function () {
                console.error("Failedloaded gapi");
                //TODO disable buttons
            });
        }

    $scope.loginGapi = function () {
        cloudendpoint.sigin(
            function()
            {
                cloudendpoint.checkUser().then(function(result)
                {
                        $scope.username=result.email;
                        $scope.signedIn=true;
                        //get the tasks
                        $scope.getTaskList();


                },function(error)
                {
                    displayError(error);
                });
            }
        );
    };

        //handle timer start stop
        $scope.toggleTimer = function(theTask)
        {
         //first time
         if(theTask.isRunning === undefined)
         {
             theTask.isRunning = true;
         }

         if(theTask.isRunning)
         {
             console.log("is running true");
             theTask.isRunning = false;
             //first time
             if(angular.isUndefined(theTask.currentTime))
             {
                 theTask.currentTime={'hours':0,'minutes':0,'secounds':0};
             }

             theTask.timer = $interval(function() {
                 updateTimer(theTask.currentTime);
             }, 1000);

         }
         else
         {
             console.log("is running false");
             theTask.isRunning=true;
             if ( angular.isDefined(theTask.timer) )
             {
                 $interval.cancel(theTask.timer);
                 theTask.timer= undefined;
                 return;
             }
         }


//            $('#playBtnID'+taskID+' span').attr('class','glyphicon glyphicon-play glyp-green');
//            $('#playBtnID'+taskID+' span').attr('class','glyphicon glyphicon-pause glyp-pause');
        };

//        TaskReadonlyService.query(function (response) {
//            $scope.todos = response.items;
//        });


//                //get all from rest point
        $scope.getTaskList = function () {
            cloudendpoint.doCall().then(function () {
                cacheService.getTaskList()
                    .then(function (result) {
                        //succes.
                        console.log("Q success " + JSON.stringify(result));
                        $scope.todos = result.items;
    //                        $scope.todoText = '';
                        $scope.resultMessage = "Success in adding";
                        displayResultTyp(false);
                    }, function (error) {
                        displayError(error);
                });
            });
//                    $scope.todos.push(todo);
        }


        function displayError(error) {
            //handle error
            switch (error.code) {
                case -1:
                    $scope.resultMessage = "Your offline! " + error.message + " code: " + error.code;
                    break;
                case 401:
                    $scope.resultMessage = "You need to Logon! " + error.message + " code: " + error.code;
                    break;
                default:
                    $scope.resultMessage = "Unkown error " + error.message + " code: " + error.code;
                    break;
            }
            console.log("Q error " + error.message + " code: " + error.code);
            displayResultTyp(true);

        };

        $scope.insertTask = function () {

            var newTask = {};

            newTask.title = $scope.todoText;
            cloudendpoint.doCall().then(function () {
                cacheService.insert(newTask)
                    .then(function (result) {
                        //succes.
                        console.log("Q success " + JSON.stringify(result));

                        if(angular.isUndefined($scope.todos))
                        {
                            $scope.todos= [];
                        }
                        $scope.todos.push(result.result);
                        $scope.todoText = '';
                        $scope.resultMessage = "Success in adding";
                        displayResultTyp(false);
                    }, function (error) {
                        displayError(error);
                });

            });
        };

        $scope.removeTask = function (task, taskIndex) {
            cloudendpoint.doCall().then(function () {
            cacheService.delete(task.id)
                .then(function (result) {
                    //succes.
                    console.log("Q success " + JSON.stringify(result));

                    var i = $scope.todos.indexOf(task);
                    $scope.todos.splice(taskIndex, 1);

                    $scope.resultMessage = "Success in Removing task: " + task.title;
                    displayResultTyp(false);
                }, function (error) {
                    displayError(error);
                });
            });
        };

        //calcs the min max avg times
        function calcTaskTimes(theTask,newTime)
        {
            //there is no min time
            if(angular.isUndefined(theTask.minTime))
            {
                theTask.minTime =newTime;
            }
            else
            {
                //if new time is smaller
                if(theTask.minTime > newTime)
                {
                    theTask.minTime=newTime;
                }
            }

            //no max time
            if(angular.isUndefined(theTask.maxTime))
            {
                theTask.maxTime = newTime;
            }
            else
            {
                //if new time is bigger than max
                if(theTask.maxTime < newTime)
                {
                    theTask.maxTime = newTime;
                }
            }

            //update times done
            //calc avg
            theTask.totalDones++;

            if(angular.isUndefined(theTask.totalTime))
            {
                theTask.totalTime=new Date(1970,0,0,25,0,0);
            }

            theTask.totalTime =new Date(newTime.getTime()+theTask.totalTime.getTime());
            theTask.avgTime = new Date(theTask.totalTime /theTask.totalDones);
        }

        $scope.doneTask = function (theTask) {

            if(theTask.isDone)
            {

                //stop the running clock
                theTask.isRunning=true;
                if ( angular.isDefined(theTask.timer) )
                {
                    $interval.cancel(theTask.timer);
                    theTask.timer= undefined;

                    //year month day, hour, min, sec
                    //new Date(1970,0,0,25,0,0); 0 date
                    var newTime = new Date(1970,0,0,(24 +theTask.currentTime.hours),theTask.currentTime.minutes,theTask.currentTime.secounds);

                    //calcs the min max avg time
                    calcTaskTimes(theTask,newTime);
                    //clear the current running time
                    //resets the clock
                    theTask.currentTime = undefined;
                }
            }

            //update the task on server
            $scope.updateTask(theTask);
        }




        $scope.updateTask = function (theTask) {
            cloudendpoint.doCall().then(function () {

            console.log("update task title: "+$scope.newTitle);
            cacheService.update(theTask)
                .then(function (result) {
                    //succes.
                    console.log("Q success " + JSON.stringify(result));
                    //$scope.todos[taskIndex] = result;
                    $scope.resultMessage = "Success in updating";
                    displayResultTyp(false);
                }, function (error) {
                    displayError(error);
                });
            });
        };

        function displayResultTyp(isError) {
            console.log("display result is called");

            if (isError) {
                console.log("is error");
                $scope.resultType = "alert-danger";
            }
            else {
                console.log("is success");
                $scope.resultType = "alert-success";
            }
            $scope.isHidden = false;
            $timeout(function () {
                $scope.isHidden = true;
            }, 3000);
        }

        $scope.logout= function () {
            gapi.auth.setToken(null);
            $scope.signedIn=false;
            //$scope.$apply();
        }



        $scope.checkSession = function () {
//
//TODO fixa sa att en kolla endast mitt app.
            gapi.auth.checkSessionState({client_id: google_client_id}, $scope.sessionStateCallback);

        }

        $scope.logoutGapi = function () {
            console.log("doing logout");
            //	var ac_token = gapi.auth.getToken();
            gapi.auth.setToken(null);
            gapi.auth.signOut();
            $scope.checkSession();
        };


        $scope.sessionStateCallback = function (resp) {
            console.log("session is [ " + resp + " ] if is false, your logged in");

        }

        $scope.handleAuth = function () {
            var request = gapi.client.oauth2.userinfo.get().execute(function (resp) {
                if (!resp.code) {
                    // User is signed in, so hide the button
                    console.log($scope.username + " login user: " + resp.name);
                    
                    $scope.checkSession();
//                            $scope.test(resp);
                    $scope.$apply(function () {
                        //TODO save logged in user.
                        $scope.username = "welcome " + resp.name + " ";
                    });

                }
                else {
                    console.log("user logged off")
                }
            });
        };

        
        	//$scope.timerRunning = true;

        function updateTimer(taskTime)
        {
            taskTime.secounds++;
                    if(taskTime.secounds>=60)
                    {
                        taskTime.minutes++;
                        taskTime.secounds=0;
                    }
                    if(taskTime.minutes>=60)
                    {
                        taskTime.hours++;
                        taskTime.minutes=0;
                    }
         };

       // currentUser = "test@test.com";
        //end of controller
    });