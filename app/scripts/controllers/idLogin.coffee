'use strict'

angular.module('hiin')
  .controller 'idLoginCtrl', ($scope,$window,Util) ->
    $scope.signIn = ->
      Util.makeReq('post','login',$scope.userInfo )
        .success (data) ->
          if data is 'wrong password' or data is 'not exist email' or data is 'no entered event'
            alert data
            return
          Util.makeReq('get','loginUser' )
            .success (data) ->
              sessionStorage.setItem("logined", true)
              sessionStorage.setItem("loginUserName", data.name)
              sessionStorage.setItem("loginUserStNum", data.studentNumber)
              sessionStorage.setItem("loginUserNumber", data.number)
              sessionStorage.setItem("loginUserObjid", data._id)
              localStorage.setItem("logined", true)
              localStorage.setItem("loginUserName", data.name)
              localStorage.setItem("loginUserStNum", data.studentNumber)
              localStorage.setItem("loginUserNumber", data.number)
              localStorage.setItem("loginUserObjid", data._id)
              Util.Go('cal')
            .error (error, status) ->
              console.log status
              return
        .error (error, status) ->
            console.log "$http.error"
