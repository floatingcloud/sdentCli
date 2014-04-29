'use strict'

angular.module('hiin')
  .controller 'calendarCtrl', ($scope, $window, socket, Util ) ->
    clock = angular.element("#clock").FlipClock
                clockFace: 'TwelveHourClock'
    $scope.uiConfig = {
      calendar:{
        editable: true
        header:{
          left: 'title'
          center: ''
          right: 'today prev,next'
        }
        eventClick: (event) ->
          console.log event
          if event.type is "applyForm"
            sendData = {
                          _id : event._id
                        }
            socket.emit 'apply', sendData
          else
            console.log "test"
            
      }
    }
    $scope.eventSources = []
    socket.emit 'join'

    socket.on 'joined', (data) ->
      console.log data+'join socket'

    socket.emit 'eventList'

    socket.on 'eventList', (data) ->
      console.log data
      $scope.events = data

    socket.on 'loadEventInfo', (data) ->
      console.log data
      $scope.eventInfo = data

    socket.on 'serverTime', (data) ->
      clock.setTime data

    socket.on 'loadCases', (data) ->
      console.log data
      $scope.eventSources.splice(0,$scope.eventSources.length)
      $scope.eventSources.push data

    socket.on 'alert', (data) ->
      socket.emit 'eventList'
      alert data

    $scope.loadEvent =  (event_id) ->
      socket.emit 'loadCases', event_id
      socket.emit 'loadEventInfo', event_id

    $scope.userName = sessionStorage.loginUserName

    $scope.caseClick = () ->
    $scope.clockRe = () ->
      socket.emit 'serverTime'
      console.log 'serverTime'
    $scope.logout = () ->
      Util.makeReq('get','logout')
        .success (data) ->
          if data isnt 'success logout'
            alert data
            return
          Util.Go('/')
        .error (error, status) ->
          console.log "$http.error"
