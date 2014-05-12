"use strict"

angular.module("hiin", [
  "ngCookies"
  "ngResource"
  "ngSanitize"
  "ngRoute"
  "services"
  "btford.socket-io"
  "ui.calendar"
  "ui.bootstrap"
  #"dialogs"
  "infinite-scroll"
  "multi-select"
]).config ($routeProvider) ->
  $routeProvider
    .when("/",
        templateUrl: "views/login/login.html"
        controller: "LoginCtrl"
    )
    .when("/signUp",
        templateUrl: "views/login/signup.html"
        controller: "SignUpCtrl"
    )
    .when("/idLogin",
        templateUrl: "views/login/id_login.html"
        controller: "idLoginCtrl"
    )
    .when("/cal",
        templateUrl: "views/calv/calendar.html"
        controller: "calendarCtrl"
    )
    .when("/admin",
        templateUrl: "views/admin/admin.html"
        controller: "adminCtrl"
    )
    .when("/user",
        templateUrl: "views/calv/user.html"
        controller: "userCtrl"
    )
    .when("/adminEdit",
        templateUrl: "views/admin/adminEditmini.html"
        controller: "adminEditminiCtrl"
    )
    .when("/adminDel",
        templateUrl: "views/admin/adminDel.html"
        controller: "adminDelCtrl"
    )
    .when("/adminResult",
        templateUrl: "views/admin/adminResult.html"
        controller: "adminResultCtrl"
    )
    .otherwise redirectTo: "/"
    return
.config ($httpProvider) ->
    $httpProvider.defaults.transformRequest = (data) ->
      return data  if data is `undefined`
      $.param data
    $httpProvider.defaults.withCredentials = true
    #$httpProvider.defaults.useXDomain = true
    #delete $httpProvider.defaults.headers.common['X-Requested-With']
    
    #$httpProvider.defaults.headers.common = {Accept: "application/json, text/plain, */*"}
    #$httpProvider.defaults.headers.post = {"Content-Type": "application/json;charset=utf-8"}
  return
