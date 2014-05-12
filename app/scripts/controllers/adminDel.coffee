'use strict'

angular.module('hiin').controller 'adminDelCtrl', ($scope, $q, $window, Util, socket) ->
  socket.emit 'eventList'
    
  socket.on 'eventList', (data) ->
      #console.log data
      $scope.events = data

  $scope.delTriger = (data) ->
     da = "정말로\""+ data.event+data.name+"\"를 삭제하시겠습니까?" 
     BootstrapDialog.show({
              type: BootstrapDialog.TYPE_DANGER
              title: '확인'
              message: da 
              buttons: [{
                          label: '삭제'
                          cssClass: 'btn-primary',
                          action: (dialogItself) ->
                              socket.emit 'deleteAdminEvent', data
                              dialogItself.close()
                        }
                        {
                          label: '취소'
                          action: (dialogItself) ->
                              dialogItself.close()
                        }]
              })

  socket.on 'alert', (data) ->
      socket.emit 'eventList'
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

  return




