'use strict'

angular.module('hiin')
  .controller 'adminResultCtrl', ($scope, $rootScope, $window, socket, Util, $filter ) ->
    angular.element("#cirClock").tzineClock(new Date())
    $scope.uiConfig = {
      calendar:{
        editable: true
        header:{
          left:'title' 
          center:'' 
          right: 'today prev,next'
        }

      }
    }


    $scope.eventSources = []
    #socket.emit 'join'

    #socket.on 'joined', (data) ->
      #console.log data+'join socket'

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
    re = $scope.eventSources[0]

    $scope.filter = (filterObj) ->
        re = $filter('filter')($scope.eventSource[0],filterObj)




