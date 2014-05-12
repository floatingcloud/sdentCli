'use strict'

angular.module('hiin').controller 'adminEditCtrl', ($scope, $q, $window, Util, socket) ->
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
    da = "정말로\""+ $scope.cuEv.event+$scope.cuEv.name+"\"를 수정하시겠습니까?" 
    BootstrapDialog.show({
              type: BootstrapDialog.TYPE_DANGER
              title: '확인'
              message: da 
              buttons: [{
                          label: '수정'
                          cssClass: 'btn-primary',
                          action: (dialogItself) ->
                              socket.emit 'updel', $scope.cuEv 
                              dialogItself.close()
                        }
                        {
                          label: '취소'
                          action: (dialogItself) ->
                              dialogItself.close()
                        }]
              })



  socket.on 'updel', ()->
    console.log 'updel'
    Util.makeReq('post','makeEvent', sendData)
        .success (data) ->
          if data isnt 'success event create'
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
            return
          Util.Go('admin')
        .error (error, status) ->
          console.log "$http.error"

#/////////?


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

  socket.emit 'eventList'
    
  socket.on 'eventList', (data) ->
      #console.log data
      $scope.events = data

  #excel load
  $scope.loadForUpdate = (event) ->
    $scope.cuEv = event 
    socket.emit "loadForUpdate", event

  socket.on "loadForUpdate", (data) ->
    console.log data
    tempForEvnet = new Array
    tempForEvnetSec = new Array
    tempForEvnetSec.push(data.events.event)
    tempForEvnetSec.push(data.events.name)
    tempForEvnetSec.push(data.events.startDate)
    tempForEvnetSec.push(data.events.endDate)
    tempForEvnetSec.push(data.events.applyTime)
    tempForEvnetSec.push(data.events.applyEnd)
    tempForEvnetSec.push(data.events.min)
    tempForEvnetSec.push(data.events.priorTime)
    tempForEvnetSec.push(data.events.priorEnd)
    tempForEvnetSec.push(data.events.priorMin)
    tempForEvnet.push(tempForEvnetSec)
    console.log(tempForEvnet)
    $eventContainer.data('handsontable').loadData(tempForEvnet)
    
    tempForCases = new Array
    data.events.cases.forEach (data) ->
      tempForCasesSec = new Array
      tempForCasesSec.push(data.charger)
      tempForCasesSec.push(data.category)
      tempForCasesSec.push(data.startDate)
      tempForCasesSec.push(data.ampm)
      tempForCasesSec.push(data.maxPosition)
      tempForCases.push(tempForCasesSec)
    

    $casesContainer.data('handsontable').loadData(tempForCases) 


    data.events.priorList.forEach (data) ->
            tmpN = data.number+data.name
            $scope.selDataPrior.forEach (result) ->
              result.ticked = true  if result.name is tmpN

    data.expInfo.forEach (data) ->
      $scope.selDataEx.forEach (result) ->
              result.ticked = true  if result.name is data[0]
    

  return




