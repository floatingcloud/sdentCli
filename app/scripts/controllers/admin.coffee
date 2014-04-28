'use strict'

angular.module('hiin').controller 'adminCtrl', ($scope, $q, $window, Util) ->
  userName=[]
  user_id=[]
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
    '오전/오후'
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
  ]
  sendData = {}
  $casesContainer = {}
  $eventContainer = {}
  $priorContainer = {}
  $scope.submit = -> 
    sendData.event = $eventContainer.data('handsontable').getData()
    sendData.cases = $casesContainer.data('handsontable').getData()
    sendData.prior =[]
    tmpPrior = $priorContainer.data('handsontable').getData()
    tmpPrior.forEach (item) ->
      index = userName.indexOf(item[0])
      sendData.prior.push user_id[index]
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
      startCols : 8
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

  return



