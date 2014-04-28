(function() {
  'use strict';
  angular.module('hiin').controller('adminCtrl', function($scope, $q, $window, Util) {
    var $casesContainer, $eventContainer, $priorContainer, sendData, userName, user_id;
    userName = [];
    user_id = [];
    $scope.header1 = ['담당자', '카테고리', '날짜', '오전/오후', '배정인원'];
    $scope.header2 = ['이벤트', '이름', '시작일', '끝나는일', '신청시간', '신청종료', '우선신청', '우선종료'];
    sendData = {};
    $casesContainer = {};
    $eventContainer = {};
    $priorContainer = {};
    $scope.submit = function() {
      var tmpPrior;
      sendData.event = $eventContainer.data('handsontable').getData();
      sendData.cases = $casesContainer.data('handsontable').getData();
      sendData.prior = [];
      tmpPrior = $priorContainer.data('handsontable').getData();
      tmpPrior.forEach(function(item) {
        var index;
        index = userName.indexOf(item[0]);
        sendData.prior.push(user_id[index]);
        console.log(index);
        console.log(item);
        return console.log(sendData.prior);
      });
      return Util.makeReq('post', 'makeEvent', sendData).success(function(data) {
        if (data !== 'success event create') {
          alert(data);
          return;
        }
        return Util.Go('admin');
      }).error(function(error, status) {
        return console.log("$http.error");
      });
    };
    $casesContainer = $("#dataTable").handsontable({
      minRows: 10,
      rowHeaders: true,
      colHeaders: $scope.header1,
      contextMenu: true,
      manualColumnResize: true,
      columns: [
        {
          type: "text"
        }, {
          type: "text"
        }, {
          type: "date"
        }, {
          type: "autocomplete",
          filter: false,
          source: ["오전", "오후"]
        }, {
          type: "numeric"
        }
      ]
    });
    $eventContainer = $("#setting").handsontable({
      colHeaders: $scope.header2,
      manualColumnResize: true,
      startRows: 1,
      startCols: 8,
      columns: [
        {
          type: "text"
        }, {
          type: "text"
        }, {
          type: "date"
        }, {
          type: "date"
        }, {
          type: "date"
        }, {
          type: "date"
        }, {
          type: "date"
        }, {
          type: "date"
        }
      ]
    });
    $priorContainer = $("#prior").handsontable({
      rowHeaders: true,
      colHeaders: ['우선권자'],
      contextMenu: true,
      startCols: 1,
      startRows: 1,
      manualColumnResize: true,
      columns: [
        {
          type: "autocomplete",
          filter: false,
          source: userName,
          strict: true
        }
      ]
    }, {
      beforeInit: Util.getUsersList().then(function(data) {
        var item, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          item = data[_i];
          userName.push(item.number + item.name);
          _results.push(user_id.push(item._id));
        }
        return _results;
      }, function(status) {
        return alert(status);
      })
    });
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('calendarCtrl', function($scope, $window, socket, Util) {
    var clock;
    clock = angular.element("#clock").FlipClock({
      clockFace: 'TwelveHourClock'
    });
    $scope.uiConfig = {
      calendar: {
        height: 450,
        width: 450,
        editable: true,
        header: {
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        eventClick: function(event) {
          var sendData;
          sendData = {
            _id: event._id
          };
          return socket.emit('apply', sendData);
        },
        eventMouseover: function(event) {
          var sendData;
          sendData = {
            _id: event._id
          };
          socket.emit('hoverResult', sendData);
          return console.log('hover');
        }
      }
    };
    $scope.eventSources = [];
    socket.emit('join');
    socket.on('joined', function(data) {
      return console.log(data + 'join socket');
    });
    socket.emit('eventList');
    socket.on('eventList', function(data) {
      console.log(data);
      return $scope.events = data;
    });
    socket.on('serverTime', function(data) {
      return clock.setTime(data);
    });
    socket.on('loadCases', function(data) {
      console.log(data);
      return $scope.eventSources.push(data);
    });
    socket.on('full', function() {
      socket.emit('eventList');
      return alert('이미 꽉찼습니다');
    });
    socket.on('dberr', function() {
      alert('저장에 실패했습니다. 다시시도해주세요');
      return socket.emit('eventList');
    });
    $scope.loadEvent = function(event_id) {
      return socket.emit('loadCases', event_id);
    };
    $scope.userName = sessionStorage.loginUserName;
    $scope.caseClick = function() {};
    return $scope.clockRe = function() {
      socket.emit('serverTime');
      return console.log('serverTime');
    };
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('idLoginCtrl', function($scope, $window, Util) {
    return $scope.signIn = function() {
      return Util.makeReq('post', 'login', $scope.userInfo).success(function(data) {
        if (data === 'wrong password' || data === 'not exist email' || data === 'no entered event') {
          alert(data);
          return;
        }
        return Util.makeReq('get', 'loginUser').success(function(data) {
          sessionStorage.setItem("logined", true);
          sessionStorage.setItem("loginUserName", data.name);
          sessionStorage.setItem("loginUserStNum", data.studentNumber);
          sessionStorage.setItem("loginUserNumber", data.number);
          sessionStorage.setItem("loginUserObjid", data._id);
          return Util.Go('cal');
        }).error(function(error, status) {
          console.log(status);
        });
      }).error(function(error, status) {
        return console.log("$http.error");
      });
    };
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('LoginCtrl', function($scope, $window, Util) {
    $scope.signUp = function() {
      return Util.Go('signUp');
    };
    return $scope.idLogin = function() {
      return Util.Go('idLogin');
    };
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('SignUpCtrl', function($scope, $window, Util) {
    return $scope.signUp = function() {
      return Util.makeReq('post', 'user', $scope.userInfo).success(function(data) {
        if (data !== 'success user create') {
          alert(data);
          return;
        }
        return Util.Go('login');
      }).error(function(error, status) {
        return console.log("$http.error");
      });
    };
  });

}).call(this);
