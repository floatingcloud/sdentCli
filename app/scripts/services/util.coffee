'use strict'

angular.module('services').factory 'Util', ($q, $http, $location,$document, Host) ->
  # 공통적으로 쓰이는 http request 만들어주는 함수
  makeReq: (method, path, param) ->
    # 요청 method가 get일때는 parameter를 url에 붙여 보내야하고 아닌 경우에는 body에 심어서 보냄
    # see : http://docs.angularjs.org/api/ng.$http
    console.log "#{Host.getAPIHost()}:#{Host.getAPIPort()}/#{path}"
    $http[method]("#{Host.getAPIHost()}:#{Host.getAPIPort()}/#{path}", (if method == "get" then params:param else param), headers: {'Content-Type': 'application/x-www-form-urlencoded'})
  Go: (path)->
    $location.path(path)
  getUsersList: ->
    deferred = $q.defer()
    this.makeReq('get','userList')
      .success (data) ->
        deferred.resolve data
      .error (data, status) ->
        deferred.reject status
      return deferred.promise




