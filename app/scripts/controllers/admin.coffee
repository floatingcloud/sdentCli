'use strict'

angular.module('hiin').controller 'adminCtrl', ($scope, $q, $window, Util) ->
  userName=[]
  user_id=[]
  $scope.selDataPrior=[]
  $scope.selOutputPrior=[]
  $scope.selDataEx=[]
  $scope.selOutpEx=[]
  $scope.selDataSuper=[]
  $scope.selOutpSuper=[]
  $scope.eventColor
  $scope.caseGridRows
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
    '날짜시간'
    '오전오후'
    '배정인원'
  ]
  $scope.header2 = [
    '이벤트'
    '이름'
    '시작일'
    '끝나는일'
    '신청시간'
    '신청종료'
    '신청횟수'
    '우선신청'
    '우선종료'
    '우선횟수'
  ]
  $scope.header3 = [
    '횟수예외'
    '횟수'
  ]
  $scope.header4 = [
    '우선권자'
  ]
  sendData = {}
  $casesContainer = {}
  $eventContainer = {}
  $priorContainer = {}
  $exceptionContainer = {}
  $superContainer = {}
  $scope.submit = -> 
    sendData.event = $eventContainer.data('handsontable').getData()
    sendData.cases = $casesContainer.data('handsontable').getData()
    sendData.prior =[]
    sendData.exception = []
    sendData.color = $scope.eventColor
    tmpPrior = $priorContainer.data('handsontable').getData()
    tmpPrior.forEach (item) ->
      index = userName.indexOf(item[0])
      sendData.prior.push user_id[index]
    tmpEx = $exceptionContainer.data('handsontable').getData()
    tmpEx.forEach (item) ->
      index = userName.indexOf(item[0])
      sendData.exception.push {
                                userId : user_id[index]
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
      startRows: 1
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
      startCols : 10
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
                    type:"numeric"
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
      colHeaders: $scope.header4
      contextMenu: true
      startCols : 1
      startRows : 1
      manualColumnResize: true
      columns:  [
                  {
                    type:"text"
                  }
                ]
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
                    type:"text"
                  }
                  {
                    type:"numeric"
                  }
                ]
      #beforeInit: Util.getUsersList()
                      #.then (data) ->
                        #for item in data
                          #userNameE.push item.number + item.name
                          #user_idE.push item._id
                      #,(status) ->
                         #alert status
  )
  #$superContainer=$("#superUser").handsontable(
      #rowHeaders: true
      #colHeaders: '슈퍼유저'
      #contextMenu: true
      #startCols : 1
      #startRows : 1
      #manualColumnResize: true
      #columns:  [
                  #{
                    #type:"text"

                  #}
                #]

  #)

  Util.getUsersList()
      .then (data) ->
        for item in data
          tpd1 = {
                  name : item.number+item.name
                  value: item._id
                  ticked: false
                }
          tpd2 = {
                  name : item.number+item.name
                  value: item._id
                  ticked: false
                }
          userName.push item.number+item.name
          user_id.push item._id
          $scope.selDataPrior.push tpd1
          $scope.selDataEx.push tpd2
      ,(status) ->
         alert status

  $scope.dlc = () ->
    console.log $scope.selOutputPrior
    console.log $scope.selOutputEx
  
  
  $scope.prior = () ->
    pr = new Array
    $scope.selOutputPrior.forEach (item) ->
      tmpA = new Array
      tmpA.push item.name
      pr.push tmpA
    $priorContainer.data('handsontable').loadData(pr)


  $scope.excep = () ->
    ecp = new Array
    $scope.selOutputEx.forEach (item) ->
      tmpA = new Array
      tmpA.push item.name
      ecp.push tmpA
    $exceptionContainer.data('handsontable').loadData(ecp)
    console.log $scope.eventColor
    console.log $scope.caseGridRows

  $scope.changeRows = () ->
    console.log $scope.caseGridRows
    $casesContainer.data('handsontable').alter(
      'insert_row',null,$scope.caseGridRows
    )


  #$scope.deleteEvent =  Util.getEventsList()
                            #.then (data) ->
                                #if data isnt 'success'
                                  #alert data
                                  #return
                                #alert '삭제성공'
                            #.error (error, status) ->
                                    #console.log "$http.error"
  return



