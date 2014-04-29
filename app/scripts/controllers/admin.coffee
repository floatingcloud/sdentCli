'use strict'

angular.module('hiin').controller 'adminCtrl', ($scope, $q, $window, Util) ->
  userName=[]
  user_id=[]
  userNameE=[]
  user_idE=[]
  #Util.getUsersList()
    #.then (data) ->
      #for item in data
        #userName.push item.number + item.name
        #user_id.push item._id
    #,(status) ->
      #alert status
  $scope.header1 = [
    '담당자'
    '카테고리'
    '날짜'
    '시간'
    '배정인원'
  ]
  $scope.header2 = [
    '이벤트'
    '이름'
    '시작일'
    '끝나는일'
    '신청시간'
    '신청종료'
    '우선신청'
    '우선종료'
    '신청횟수'
  ]
  $scope.header3 = [
    '횟수에외'
    '횟수'
  ]
  sendData = {}
  $casesContainer = {}
  $eventContainer = {}
  $priorContainer = {}
  $exceptionContainer = {}
  $scope.submit = -> 
    sendData.event = $eventContainer.data('handsontable').getData()
    sendData.cases = $casesContainer.data('handsontable').getData()
    sendData.prior =[]
    sendData.exception = []
    tmpPrior = $priorContainer.data('handsontable').getData()
    tmpPrior.forEach (item) ->
      index = userName.indexOf(item[0])
      sendData.prior.push user_id[index]

    tmpEx = $exceptionContainer.data('handsontable').getData()
    tmpEx.forEach (item) ->
      index = userNameE.indexOf(item[0])
      sendData.exception.push {
                                userId : user_idE[index]
                                many : item[1]
                              }
      console.log index
      console.log item
      console.log sendData.prior
    Util.makeReq('post','makeEvent', sendData)
        .success (data) ->
          if data isnt 'success event create'
            alert data
            return
          Util.Go('admin')
        .error (error, status) ->
          console.log "$http.error"

  $casesContainer=$("#dataTable").handsontable(
      minRows: 10
      rowHeaders: true
      colHeaders: $scope.header1
      contextMenu: true
      manualColumnResize: true
      columns:  [
                  {
                    type:"text"
                  }
                  {
                    type:"text"
                  }
                  {
                    type:"date"
                  }
                  {
                    type:"autocomplete"
                    filter: false
                    source:[
                              "오전"
                              "오후"
                              "종일"
                          ]
                  }
                  {
                    type:"numeric"
                  }
                ]
  )
  $eventContainer=$("#setting").handsontable(
      colHeaders: $scope.header2
      manualColumnResize: true
      startRows : 1
      startCols : 9
      columns:  [
                  {
                    type:"text"
                  }
                  {
                    type:"text"
                  }
                  {
                    type:"date"
                  }
                  {
                    type:"date"
                  }
                  {
                    type:"date"
                  }
                  {
                    type:"date"
                  }
                  {
                    type:"date"
                  }
                  {
                    type:"date"
                  }
                  {
                    type:"numeric"
                  }

                ]
  )
  $priorContainer=$("#prior").handsontable(
      rowHeaders: true
      colHeaders: ['우선권자'] 
      contextMenu: true
      startCols : 1
      startRows : 1
      manualColumnResize: true
      columns:  [
                  {
                    type:"autocomplete"
                    filter: false
                    source: userName
                    strict: true
                  }
                ]
      beforeInit: Util.getUsersList()
                      .then (data) ->
                        for item in data
                          userName.push item.number + item.name
                          user_id.push item._id
                      ,(status) ->
                          alert status
 
  )
  $exceptionContainer=$("#exception").handsontable(
      rowHeaders: true
      colHeaders: $scope.header3
      contextMenu: true
      startCols : 2
      startRows : 1
      manualColumnResize: true
      columns:  [
                  {
                    type:"autocomplete"
                    filter: false
                    source: userName
                    strict: true
                  }
                  {
                    type:"numeric"
                  }
                ]
      beforeInit: Util.getUsersList()
                      .then (data) ->
                        for item in data
                          userNameE.push item.number + item.name
                          user_idE.push item._id
                      ,(status) ->
                         alert status
 
  )

  Util.getEventsList()
        .then (data) ->
            $scope.events = data
        ,(status) ->
            alert status

  #$scope.deleteEvent =  Util.getEventsList()
                            #.then (data) ->
                                #if data isnt 'success'
                                  #alert data
                                  #return
                                #alert '삭제성공'
                            #.error (error, status) ->
                                    #console.log "$http.error"
  return



