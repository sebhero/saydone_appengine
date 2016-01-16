/**
 * Created by Sebastian Börebäck on 2014-10-04.
 */



var google_scopes = 'https://www.googleapis.com/auth/userinfo.email';
var google_client_id = '721477199484-4sv11th1kbmtpfuovj1gvv5qcsn9r9na.apps.googleusercontent.com';


$(document).ready(function() {
    console.log("load model");
    $(window).load(function(){
//        TODO uncomment should show on load.
//        $('#infoMOdal').modal('show');
    });
});

var signedIn = false;
var currentUser;

var userAuthed = function() {
    var request = gapi.client.oauth2.userinfo.get().execute(function(resp) {
        if (!resp.code) {
            signedIn = true;
            console.log("user is logged in as "+resp.email);
            currentUser = resp;
        }
    });
};

function init() {
    console.log("loaded init");
    var apisToLoad;

    //called when server connection is setup
    var callback = function () {

        console.log("done loading gapi");
        if (--apisToLoad == 0) {
            //auto logon
            signin(true, userAuthed);
        }
//load the list from server
    }

    apisToLoad = 2;
//Parameters are APIName,APIVersion,CallBack function,API Root
    var apiRoot = '//' + window.location.host + '/_ah/api';
//        gapi.client.load('taskitemendpoint', 'v1', callback, apiRoot);
    gapi.client.load('oauth2', 'v2', callback);
    gapi.client.load('taskitemendpoint', 'v1', callback, apiRoot);
}


function signin(mode, callback) {
    gapi.auth.authorize({client_id: google_client_id, scope: google_scopes, immediate: mode}, callback);
}



'use strict';


var app = angular.module('todo', ['ngResource', 'ngAnimate'])
    .factory('TaskReadonlyService', function ($resource) {
        var TaskReadonlyService = $resource('/_ah/api/taskitemendpoint/v1/taskitem/:id', {}, {
            query: {method: 'GET', isArray: false}
        });
        return TaskReadonlyService;
    })
    .factory('storageService', function ($rootScope) {

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
    })
    .factory('cacheService', function ($http, $q, storageService) {

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
    };
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
    })

    app.animation(".fade", function () {
        return {
            addClass: function (element, className) {
                TweenMax.to(element, 2, {opacity: 0});
            },
            removeClass: function (element, className) {
                TweenMax.to(element, 1, {opacity: 1});
            }
        }
    })


    app.controller('TodoCtrl', function ($scope, $q, $timeout, cacheService, storageService, TaskReadonlyService) {

        $scope.isHidden= true;

        $scope.todos = [];


        //set init for toogle timer
        $scope.toggleTimerIcon='glyphicon glyphicon-play glyp-green';

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
         }
         else
         {
             console.log("is running false");
             theTask.isRunning=true;
         }


//            $('#playBtnID'+taskID+' span').attr('class','glyphicon glyphicon-play glyp-green');
//            $('#playBtnID'+taskID+' span').attr('class','glyphicon glyphicon-pause glyp-pause');
        };

        TaskReadonlyService.query(function (response) {
            $scope.todos = response.items;
        });

//                //get all from rest point
        $scope.getTaskList = function () {
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
            newTask.addedByUser =currentUser.email;
            cacheService.insert(newTask)
                .then(function (result) {
                    //succes.
                    console.log("Q success " + JSON.stringify(result));
                    $scope.todos.push(result);
                    $scope.todoText = '';
                    $scope.resultMessage = "Success in adding";
                    displayResultTyp(false);
                }, function (error) {
                    displayError(error);
                });
        };

        $scope.removeTask = function (task, taskIndex) {
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
        };

        $scope.updateTask = function (theTask) {

            theTask.addedByUser =currentUser.email;
            console.log("New task title: "+$scope.newTitle);
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
        };

        function displayResultTyp(isError) {
            $scope.isHidden = false;
            if (isError) {
                console.log("is error");
                $scope.resultType = "alert-danger";
            }
            else {
                console.log("is success");
                $scope.resultType = "alert-success";
            }

            $timeout(function () {
                $scope.isHidden = true;
            }, 4000);
        }

        $scope.loginGapi = function () {
            signin(false, $scope.handleAuth);

        };

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

        //end of controller
    });



