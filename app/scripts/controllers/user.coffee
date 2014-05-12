'use strict'

angular.module('hiin')
  .controller 'userCtrl', ($scope, $rootScope, $window, $log, socket, Util ) ->
    angular.element("#cirClock").tzineClock(new Date())
    $scope.uiConfig = {
      calendar:{
        editable: true
        header:{
          left: 'month,agendaWeek,agendaDay'
          center: 'title'
          right: 'today prev,next'
        }
        viewRender: (view , element) ->
            sendData = {
              start: view.visStart      
              end: view.visEnd
            }
            socket.emit 'loadUserCases', sendData
            console.log sendData
            #console.log('delete')
      }
    }
    $scope.sdentId = "d429"
    $scope.sdentPasswd = "d1093110"
    $scope.eventSources = []
    
    parad = {}
    parad.action = "LOGIN"
    parad.userid = $scope.sdentId+"@snu.ac.kr"
    parad.userid1 = $scope.sdentId
    parad.userid2 = "snu.ac,kr"
    parad.passwd = $scope.sdentPasswd
    console.log parad
    
    Util.reqSdent('post','_common/login.php',parad )
        .success (data) ->
          console.log data
        .error (data, status) ->
          console.log status
    Util.reqSdentCal('post')
        .success (data) ->
          console.log data
        .error (data, status) ->
          console.log status

      
    socket.on 'loadUserCases', (data) ->
      console.log data
      $scope.eventSources.splice(0,$scope.eventSources.length)
      $scope.eventSources.push data

    socket.on 'serverTime', (data) ->
      console.log(data)
      angular.element("#cirClock").empty()
      angular.element("#cirClock").tzineClock(new Date(data))


    socket.on 'alert', (data) ->
      socket.emit 'loadCases', $scope.currentEventId
      BootstrapDialog.show({
              type: BootstrapDialog.TYPE_WARNING
              title: '경고'
              message: data 
              buttons: [{
                          label: '확인'
                          action: (dialogItself) ->
                              dialogItself.close()
                        }]
              })

    socket.on 'applyOk', (data) ->
      socket.emit 'loadCases', $scope.currentEventId
      BootstrapDialog.show({
              type: BootstrapDialog.TYPE_SUCCESS 
              title: '확인'
              message: data 
              buttons: [{
                          label: '확인'
                          action: (dialogItself) ->
                              dialogItself.close()
                        }]
              })

    $scope.userName = localStorage.loginUserName || sessionStorage.loginUserName

    $scope.clockRe = () ->
      socket.emit 'serverTime'

    $scope.logout = () ->
      Util.makeReq('get','logout')
        .success (data) ->
          if data isnt 'success logout'
            alert data
            return
          Util.Go('/')
        .error (error, status) ->
          console.log "$http.error"
      sessionStorage.removeItem("logined")
      sessionStorage.removeItem("loginUserName")
      sessionStorage.removeItem("loginUserStNum")
      sessionStorage.removeItem("loginUserNumber")
      sessionStorage.removeItem("loginUserObjid")
      localStorage.removeItem("logined")
      localStorage.removeItem("loginUserName")
      localStorage.removeItem("loginUserStNum")
      localStorage.removeItem("loginUserNumber")
      localStorage.removeItem("loginUserObjid")
      console.log "logout"



