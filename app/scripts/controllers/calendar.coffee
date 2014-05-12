'use strict'

angular.module('hiin')
  .controller 'calendarCtrl', ($scope, $rootScope, $window, socket, Util, $filter ) ->
    angular.element("#cirClock").tzineClock(new Date())
    $scope.uiConfig = {
      calendar:{
        editable: true
        header:{
          left:'title' 
          center:'' 
          right: 'today prev,next'
        }
        eventClick: (event) ->
          #console.log event
          if event.type is "applyForm"
            sendData = {
                          _id : event._id
                        }
            socket.emit 'apply', sendData
          else
            da = "정말로\""+ event.title+'('+$filter('date')(event.created_at, 'y MMM d, h:mm:ss.sss a')+")\"를 삭제하시겠습니까?"
            sendData = {
                          _id : event._id
                        }
            
            BootstrapDialog.show({
              type: BootstrapDialog.TYPE_DANGER
              title: '확인'
              message: da
              closable: true
              autodestroy: true
              buttons: [{
                          label: '삭제'
                          cssClass: 'btn-primary',
                          action: (dialogItself) ->
                              socket.emit 'deleteEvent', sendData
                              dialogItself.close()
                        }
                        {
                          label: '취소'
                          action: (dialogItself) ->
                              dialogItself.close()
                        }]
              })

        eventRender: (event, element) ->
           
           if event.type isnt "applyForm"
                cnt = $filter('date')(event.created_at, 'y MMM d, h:mm:ss.sss a')
                element.qtip({
                               content: cnt
                               position: {
                                 my: 'bottom center'
                                 at: 'top center'
                                 target: element
                                  }
                               style: {
                                        classes: 'qtip-dark qtip-shadow qtip-rounded'
                                     }
                              })
              
      }
    }




    $scope.eventSources = []


    socket.emit 'eventList'
    
    socket.on 'eventList', (data) ->
      #console.log data
      $scope.events = data

    socket.on 'loadEventInfo', (data) ->
      console.log data
      $scope.eventInfo = data
      console.log $scope.eventInfo
      console.log $scope.eventInfo.priorMin 

    socket.on 'serverTime', (data) ->
      console.log(data)
      angular.element("#cirClock").empty()
      angular.element("#cirClock").tzineClock(new Date(data))

    socket.on 'loadCases', (data) ->
      #console.log data
      $scope.eventSources.splice(0,$scope.eventSources.length)
      $scope.eventSources.push data.events
      $scope.eventSources.push data.results
      $scope.count = data.num
      $scope.max = data.max

    socket.on 'alert', (data) ->
      socket.emit 'loadCases', $scope.currentEventId
      #$dialogs.error 'ALERT', data
      BootstrapDialog.show({
              type: BootstrapDialog.TYPE_WARNING
              title: '경고'
              message: data
              autodestroy: true
              closable: true
              buttons: [{
                          label: '확인'
                          action: (dialogItself) ->
                              dialogItself.close()
                        }]
              })

    socket.on 'applyOk', (data) ->
      socket.emit 'loadCases', $scope.currentEventId
      #$dialogs.notify 'Success', data
      BootstrapDialog.show({
              type: BootstrapDialog.TYPE_SUCCESS 
              title: '확인'
              message: data
              autodestroy: true
              closable: true
              buttons: [{
                          label: '확인'
                          action: (dialogItself) ->
                              dialogItself.close()
                        }]
              })

    $scope.loadEvent =  (event) ->
      $scope.currentEventName = event.name
      $scope.currentEventId = event._id
      socket.emit 'loadCases', event._id
      socket.emit 'loadEventInfo', event._id

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

  

