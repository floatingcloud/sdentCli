'use strict'

angular.module('hiin')
  .controller 'SignUpCtrl', ($scope,$window,Util) ->
    $scope.signUp = ->
      Util.makeReq('post','user',$scope.userInfo )
        .success (data) ->
          if data isnt 'success user create'
            alert data
            Util.Go('idLogin')
            return
        .error (error, status) ->
          console.log "$http.error"
