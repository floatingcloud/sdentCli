'use strict'

angular.module('hiin')
  .controller 'calendarCtrl', ($scope, $window, socket, Util ) ->
    clock = angular.element("#clock").FlipClock
                clockFace: 'TwelveHourClock'
    $scope.uiConfig = {
      calendar:{
        height: 450
        width: 450
        editable: true
        header:{
          left: 'title'
          center: ''
          right: 'today prev,next'
        }
        eventClick: (event) -> 
            sendData = {
                          _id : event._id
                        }
            socket.emit 'apply', sendData
        eventMouseover: (event) ->
            sendData = {
                          _id : event._id
                        }
            socket.emit 'hoverResult', sendData
            console.log 'hover'
        #dayClick: $scope.alertEventOnClick
        #eventDrop: $scope.alertOnDrop
        #eventResize: $scope.alertOnResize
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

    socket.on 'serverTime', (data) ->
      clock.setTime data

    socket.on 'loadCases', (data) ->
      console.log(data)
      $scope.eventSources.push data

    socket.on 'full', () ->
      socket.emit 'eventList'
      alert '이미 꽉찼습니다'

    socket.on 'dberr', () ->
      alert '저장에 실패했습니다. 다시시도해주세요'
      socket.emit 'eventList'

    $scope.loadEvent =  (event_id) ->
      socket.emit 'loadCases', event_id

    $scope.userName = sessionStorage.loginUserName

    $scope.caseClick = () ->
    $scope.clockRe = () ->
      socket.emit 'serverTime'
      console.log 'serverTime'
