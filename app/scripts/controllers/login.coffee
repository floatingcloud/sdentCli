'use strict'

angular.module('hiin')
  .controller 'LoginCtrl', ($scope,$window,Util) ->
    $scope.signUp = ->
      Util.Go('signUp')
    $scope.idLogin = ->
      Util.Go('idLogin')
