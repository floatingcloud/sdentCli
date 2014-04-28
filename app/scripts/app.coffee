"use strict"

angular.module("hiin", [
  "ngCookies"
  "ngResource"
  "ngSanitize"
  "ngRoute"
  "services"
  "btford.socket-io"
  "ui.calendar"
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
    #.when("/groupChat",
        #templateUrl: "views/chat/group_chat.html"
        #controller: "groupChatCtrl"
    #)
    #.when("/showProfile",
        #templateUrl: "views/menu/profile.html"
        #controller: "MenuCtrl"
    #)
    #.when("/showEvents",
        #templateUrl: "views/menu/event.html"
        #controller: "MenuCtrl"
    #)
    #.when("/showSetting",
        #templateUrl: "views/menu/setting.html"
        #controller: "MenuCtrl"
    #)
    .otherwise redirectTo: "/"
    return
.config ($httpProvider) ->
    $httpProvider.defaults.transformRequest = (data) ->
      return data  if data is `undefined`
      $.param data
    $httpProvider.defaults.withCredentials = true
  return
