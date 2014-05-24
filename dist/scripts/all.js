'use strict';

// AngularJS 에서 module을 정의할 때 뒤에 dependecy list를 주게 되면 새로운 module을 정의하겠다는 소리고
// 단순히 angular.module('services') 하게 되면 기존에 만들어진 module을 refer하겠다는 의미임.

// services 라는 모듈 선언
angular.module('services', [])
  // API_PORT를 상수로 정의. API_PORT는 나중에 dependency injection에서 쓰일 수 있음.
  .constant('API_PORT', 3000)
  // API_HOST를 상수로 정의.
  //.constant('API_HOST', "http://localhost");
  //.constant('API_HOST', "http://sdent.kr");
  .constant('API_HOST', "http://localhost");

(function() {
  angular.module('services').factory('Host', function($window, API_HOST, API_PORT) {
    var host, _API_HOST, _API_PORT;
    _API_HOST = API_HOST;
    if ($window.localStorage != null) {
      host = $window.localStorage.getItem("api_host");
      console.log("localstorage host = " + host);
      if (host && host !== "") {
        _API_HOST = host;
      }
    }
    _API_PORT = API_PORT;
    return {
      getAPIHost: function() {
        return _API_HOST;
      },
      getAPIPort: function() {
        return _API_PORT;
      },
      setAPIPort: function(port) {
        console.log("set api port! host = " + port);
        return _API_PORT = port;
      }
    };
  });

}).call(this);

(function() {
  angular.module('services').factory('socket', function(socketFactory, Host) {
    return socketFactory({
      ioSocket: io.connect("" + (Host.getAPIHost()) + ":" + (Host.getAPIPort()) + "/")
    });
  });

}).call(this);

(function() {
  'use strict';
  angular.module('services').factory('Util', function($q, $http, $location, $document, Host) {
    return {
      makeReq: function(method, path, param) {
        console.log("" + (Host.getAPIHost()) + ":" + (Host.getAPIPort()) + "/" + path);
        return $http[method]("" + (Host.getAPIHost()) + ":" + (Host.getAPIPort()) + "/" + path, (method === "get" ? {
          params: param
        } : param), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      },
      Go: function(path) {
        return $location.path(path);
      },
      getUsersList: function() {
        var deferred;
        deferred = $q.defer();
        this.makeReq('get', 'userList').success(function(data) {
          return deferred.resolve(data);
        }).error(function(data, status) {
          return deferred.reject(status);
        });
        return deferred.promise;
      },
      getEventsList: function() {
        var deferred;
        deferred = $q.defer();
        this.makeReq('get', 'eventList').success(function(data) {
          return deferred.resolve(data);
        }).error(function(data, status) {
          return deferred.reject(status);
        });
        return deferred.promise;
      },
      deleteEvent: function(para) {
        var deferred;
        deferred = $q.defer();
        this.makeReq('post', 'deleteEvent', para).success(function(data) {
          return deferred.resolve(data);
        }).error(function(data, status) {
          return deferred.reject(status);
        });
        return deferred.promise;
      },
      reqSdent: function(method, path, param) {
        console.log('hi');
        return $http[method]("https://sdent.snu.ac.kr/" + path, (method === "get" ? {
          params: param
        } : param), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Access-Control-Allow-Origin': '*'
          }
        });
      },
      reqSdentCal: function(method, path, param) {
        return $http[method]("https://sdent.snu.ac.kr/" + path, (method === "get" ? {
          params: param
        } : param), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Access-Control-Allow-Origin': '*'
          }
        });
      },
      loginSdent: function(para) {
        var deferred;
        deferred = $q.defer();
        console.log('gigi');
        this.reqSdent('post', '_common/login.php', para).success(function(data) {
          return deferred.resolve(data);
        }).error(function(data, status) {
          return deferred.reject(status);
        });
        return deferred.promise;
      }
    };
  });

}).call(this);

(function() {
  "use strict";
  angular.module("hiin", ["ngCookies", "ngResource", "ngSanitize", "ngRoute", "services", "btford.socket-io", "ui.calendar", "ui.bootstrap", "infinite-scroll", "multi-select"]).config(function($routeProvider) {
    $routeProvider.when("/", {
      templateUrl: "views/login/login.html",
      controller: "LoginCtrl"
    }).when("/signUp", {
      templateUrl: "views/login/signup.html",
      controller: "SignUpCtrl"
    }).when("/idLogin", {
      templateUrl: "views/login/id_login.html",
      controller: "idLoginCtrl"
    }).when("/cal", {
      templateUrl: "views/calv/calendar.html",
      controller: "calendarCtrl"
    }).when("/admin", {
      templateUrl: "views/admin/admin.html",
      controller: "adminCtrl"
    }).when("/user", {
      templateUrl: "views/calv/user.html",
      controller: "userCtrl"
    }).when("/adminEdit", {
      templateUrl: "views/admin/adminEditmini.html",
      controller: "adminEditminiCtrl"
    }).when("/adminDel", {
      templateUrl: "views/admin/adminDel.html",
      controller: "adminDelCtrl"
    }).when("/adminResult", {
      templateUrl: "views/admin/adminResult.html",
      controller: "adminResultCtrl"
    }).otherwise({
      redirectTo: "/"
    });
  }).config(function($httpProvider) {
    $httpProvider.defaults.transformRequest = function(data) {
      if (data === undefined) {
        return data;
      }
      return $.param(data);
    };
    return $httpProvider.defaults.withCredentials = true;
  });

  return;

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('adminCtrl', function($scope, $q, $window, Util) {
    var $casesContainer, $eventContainer, $exceptionContainer, $priorContainer, $superContainer, sendData, userName, user_id;
    userName = [];
    user_id = [];
    $scope.selDataPrior = [];
    $scope.selOutputPrior = [];
    $scope.selDataEx = [];
    $scope.selOutpEx = [];
    $scope.selDataSuper = [];
    $scope.selOutpSuper = [];
    $scope.eventColor;
    $scope.caseGridRows;
    $scope.header1 = ['담당자', '카테고리', '날짜시간', '오전오후', '배정인원'];
    $scope.header2 = ['이벤트', '이름', '시작일', '끝나는일', '신청시간', '신청종료', '신청횟수', '우선신청', '우선종료', '우선횟수'];
    $scope.header3 = ['횟수예외', '횟수'];
    $scope.header4 = ['우선권자'];
    sendData = {};
    $casesContainer = {};
    $eventContainer = {};
    $priorContainer = {};
    $exceptionContainer = {};
    $superContainer = {};
    $scope.submit = function() {
      var tmpEx, tmpPrior;
      sendData.event = $eventContainer.data('handsontable').getData();
      sendData.cases = $casesContainer.data('handsontable').getData();
      sendData.prior = [];
      sendData.exception = [];
      sendData.color = $scope.eventColor;
      tmpPrior = $priorContainer.data('handsontable').getData();
      tmpPrior.forEach(function(item) {
        var index;
        index = userName.indexOf(item[0]);
        return sendData.prior.push(user_id[index]);
      });
      tmpEx = $exceptionContainer.data('handsontable').getData();
      tmpEx.forEach(function(item) {
        var index;
        index = userName.indexOf(item[0]);
        sendData.exception.push({
          userId: user_id[index],
          many: item[1]
        });
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
      startRows: 1,
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
          source: ["오전", "오후", "종일"]
        }, {
          type: "numeric"
        }
      ]
    });
    $eventContainer = $("#setting").handsontable({
      colHeaders: $scope.header2,
      manualColumnResize: true,
      startRows: 1,
      startCols: 10,
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
          type: "numeric"
        }, {
          type: "date"
        }, {
          type: "date"
        }, {
          type: "numeric"
        }
      ]
    });
    $priorContainer = $("#prior").handsontable({
      rowHeaders: true,
      colHeaders: $scope.header4,
      contextMenu: true,
      startCols: 1,
      startRows: 1,
      manualColumnResize: true,
      columns: [
        {
          type: "text"
        }
      ]
    });
    $exceptionContainer = $("#exception").handsontable({
      rowHeaders: true,
      colHeaders: $scope.header3,
      contextMenu: true,
      startCols: 2,
      startRows: 1,
      manualColumnResize: true,
      columns: [
        {
          type: "text"
        }, {
          type: "numeric"
        }
      ]
    });
    Util.getUsersList().then(function(data) {
      var item, tpd1, tpd2, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        tpd1 = {
          name: item.number + item.name,
          value: item._id,
          ticked: false
        };
        tpd2 = {
          name: item.number + item.name,
          value: item._id,
          ticked: false
        };
        userName.push(item.number + item.name);
        user_id.push(item._id);
        $scope.selDataPrior.push(tpd1);
        _results.push($scope.selDataEx.push(tpd2));
      }
      return _results;
    }, function(status) {
      return alert(status);
    });
    $scope.dlc = function() {
      console.log($scope.selOutputPrior);
      return console.log($scope.selOutputEx);
    };
    $scope.prior = function() {
      var pr;
      pr = new Array;
      $scope.selOutputPrior.forEach(function(item) {
        var tmpA;
        tmpA = new Array;
        tmpA.push(item.name);
        return pr.push(tmpA);
      });
      return $priorContainer.data('handsontable').loadData(pr);
    };
    $scope.excep = function() {
      var ecp;
      ecp = new Array;
      $scope.selOutputEx.forEach(function(item) {
        var tmpA;
        tmpA = new Array;
        tmpA.push(item.name);
        return ecp.push(tmpA);
      });
      $exceptionContainer.data('handsontable').loadData(ecp);
      console.log($scope.eventColor);
      return console.log($scope.caseGridRows);
    };
    $scope.changeRows = function() {
      console.log($scope.caseGridRows);
      return $casesContainer.data('handsontable').alter('insert_row', null, $scope.caseGridRows);
    };
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('adminDelCtrl', function($scope, $q, $window, Util, socket) {
    socket.emit('eventList');
    socket.on('eventList', function(data) {
      return $scope.events = data;
    });
    $scope.delTriger = function(data) {
      var da;
      da = "정말로\"" + data.event + data.name + "\"를 삭제하시겠습니까?";
      return BootstrapDialog.show({
        type: BootstrapDialog.TYPE_DANGER,
        title: '확인',
        message: da,
        buttons: [
          {
            label: '삭제',
            cssClass: 'btn-primary',
            action: function(dialogItself) {
              socket.emit('deleteAdminEvent', data);
              return dialogItself.close();
            }
          }, {
            label: '취소',
            action: function(dialogItself) {
              return dialogItself.close();
            }
          }
        ]
      });
    };
    socket.on('alert', function(data) {
      socket.emit('eventList');
      return BootstrapDialog.show({
        type: BootstrapDialog.TYPE_WARNING,
        title: '경고',
        message: data,
        buttons: [
          {
            label: '확인',
            action: function(dialogItself) {
              return dialogItself.close();
            }
          }
        ]
      });
    });
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('adminEditCtrl', function($scope, $q, $window, Util, socket) {
    var $casesContainer, $eventContainer, $exceptionContainer, $priorContainer, $superContainer, sendData, userName, user_id;
    userName = [];
    user_id = [];
    $scope.selDataPrior = [];
    $scope.selOutputPrior = [];
    $scope.selDataEx = [];
    $scope.selOutpEx = [];
    $scope.selDataSuper = [];
    $scope.selOutpSuper = [];
    $scope.eventColor;
    $scope.caseGridRows;
    $scope.header1 = ['담당자', '카테고리', '날짜시간', '오전오후', '배정인원'];
    $scope.header2 = ['이벤트', '이름', '시작일', '끝나는일', '신청시간', '신청종료', '신청횟수', '우선신청', '우선종료', '우선횟수'];
    $scope.header3 = ['횟수예외', '횟수'];
    $scope.header4 = ['우선권자'];
    sendData = {};
    $casesContainer = {};
    $eventContainer = {};
    $priorContainer = {};
    $exceptionContainer = {};
    $superContainer = {};
    $scope.submit = function() {
      var da, tmpEx, tmpPrior;
      sendData.event = $eventContainer.data('handsontable').getData();
      sendData.cases = $casesContainer.data('handsontable').getData();
      sendData.prior = [];
      sendData.exception = [];
      sendData.color = $scope.eventColor;
      tmpPrior = $priorContainer.data('handsontable').getData();
      tmpPrior.forEach(function(item) {
        var index;
        index = userName.indexOf(item[0]);
        return sendData.prior.push(user_id[index]);
      });
      tmpEx = $exceptionContainer.data('handsontable').getData();
      tmpEx.forEach(function(item) {
        var index;
        index = userName.indexOf(item[0]);
        return sendData.exception.push({
          userId: user_id[index],
          many: item[1]
        });
      });
      da = "정말로\"" + $scope.cuEv.event + $scope.cuEv.name + "\"를 수정하시겠습니까?";
      return BootstrapDialog.show({
        type: BootstrapDialog.TYPE_DANGER,
        title: '확인',
        message: da,
        buttons: [
          {
            label: '수정',
            cssClass: 'btn-primary',
            action: function(dialogItself) {
              socket.emit('updel', $scope.cuEv);
              return dialogItself.close();
            }
          }, {
            label: '취소',
            action: function(dialogItself) {
              return dialogItself.close();
            }
          }
        ]
      });
    };
    socket.on('updel', function() {
      console.log('updel');
      Util.makeReq('post', 'makeEvent', sendData).success(function(data) {
        if (data !== 'success event create') {
          BootstrapDialog.show({
            type: BootstrapDialog.TYPE_SUCCESS,
            title: '확인',
            message: data,
            buttons: [
              {
                label: '확인',
                action: function(dialogItself) {
                  return dialogItself.close();
                }
              }
            ]
          });
        }
      });
      return Util.Go('admin').error(function(error, status) {
        return console.log("$http.error");
      });
    });
    $casesContainer = $("#dataTable").handsontable({
      startRows: 1,
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
          source: ["오전", "오후", "종일"]
        }, {
          type: "numeric"
        }
      ]
    });
    $eventContainer = $("#setting").handsontable({
      colHeaders: $scope.header2,
      manualColumnResize: true,
      startRows: 1,
      startCols: 10,
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
          type: "numeric"
        }, {
          type: "date"
        }, {
          type: "date"
        }, {
          type: "numeric"
        }
      ]
    });
    $priorContainer = $("#prior").handsontable({
      rowHeaders: true,
      colHeaders: $scope.header4,
      contextMenu: true,
      startCols: 1,
      startRows: 1,
      manualColumnResize: true,
      columns: [
        {
          type: "text"
        }
      ]
    });
    $exceptionContainer = $("#exception").handsontable({
      rowHeaders: true,
      colHeaders: $scope.header3,
      contextMenu: true,
      startCols: 2,
      startRows: 1,
      manualColumnResize: true,
      columns: [
        {
          type: "text"
        }, {
          type: "numeric"
        }
      ]
    });
    Util.getUsersList().then(function(data) {
      var item, tpd1, tpd2, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        tpd1 = {
          name: item.number + item.name,
          value: item._id,
          ticked: false
        };
        tpd2 = {
          name: item.number + item.name,
          value: item._id,
          ticked: false
        };
        userName.push(item.number + item.name);
        user_id.push(item._id);
        $scope.selDataPrior.push(tpd1);
        _results.push($scope.selDataEx.push(tpd2));
      }
      return _results;
    }, function(status) {
      return alert(status);
    });
    $scope.dlc = function() {
      console.log($scope.selOutputPrior);
      return console.log($scope.selOutputEx);
    };
    $scope.prior = function() {
      var pr;
      pr = new Array;
      $scope.selOutputPrior.forEach(function(item) {
        var tmpA;
        tmpA = new Array;
        tmpA.push(item.name);
        return pr.push(tmpA);
      });
      return $priorContainer.data('handsontable').loadData(pr);
    };
    $scope.excep = function() {
      var ecp;
      ecp = new Array;
      $scope.selOutputEx.forEach(function(item) {
        var tmpA;
        tmpA = new Array;
        tmpA.push(item.name);
        return ecp.push(tmpA);
      });
      $exceptionContainer.data('handsontable').loadData(ecp);
      console.log($scope.eventColor);
      return console.log($scope.caseGridRows);
    };
    $scope.changeRows = function() {
      console.log($scope.caseGridRows);
      return $casesContainer.data('handsontable').alter('insert_row', null, $scope.caseGridRows);
    };
    socket.emit('eventList');
    socket.on('eventList', function(data) {
      return $scope.events = data;
    });
    $scope.loadForUpdate = function(event) {
      $scope.cuEv = event;
      return socket.emit("loadForUpdate", event);
    };
    socket.on("loadForUpdate", function(data) {
      var tempForCases, tempForEvnet, tempForEvnetSec;
      console.log(data);
      tempForEvnet = new Array;
      tempForEvnetSec = new Array;
      tempForEvnetSec.push(data.events.event);
      tempForEvnetSec.push(data.events.name);
      tempForEvnetSec.push(data.events.startDate);
      tempForEvnetSec.push(data.events.endDate);
      tempForEvnetSec.push(data.events.applyTime);
      tempForEvnetSec.push(data.events.applyEnd);
      tempForEvnetSec.push(data.events.min);
      tempForEvnetSec.push(data.events.priorTime);
      tempForEvnetSec.push(data.events.priorEnd);
      tempForEvnetSec.push(data.events.priorMin);
      tempForEvnet.push(tempForEvnetSec);
      console.log(tempForEvnet);
      $eventContainer.data('handsontable').loadData(tempForEvnet);
      tempForCases = new Array;
      data.events.cases.forEach(function(data) {
        var tempForCasesSec;
        tempForCasesSec = new Array;
        tempForCasesSec.push(data.charger);
        tempForCasesSec.push(data.category);
        tempForCasesSec.push(data.startDate);
        tempForCasesSec.push(data.ampm);
        tempForCasesSec.push(data.maxPosition);
        return tempForCases.push(tempForCasesSec);
      });
      $casesContainer.data('handsontable').loadData(tempForCases);
      data.events.priorList.forEach(function(data) {
        var tmpN;
        tmpN = data.number + data.name;
        return $scope.selDataPrior.forEach(function(result) {
          if (result.name === tmpN) {
            return result.ticked = true;
          }
        });
      });
      return data.expInfo.forEach(function(data) {
        return $scope.selDataEx.forEach(function(result) {
          if (result.name === data[0]) {
            return result.ticked = true;
          }
        });
      });
    });
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('adminEditminiCtrl', function($scope, $q, $window, Util, socket) {
    var $eventContainer, $exceptionContainer, $priorContainer, $superContainer, sendData, userName, user_id;
    userName = [];
    user_id = [];
    $scope.selDataPrior = [];
    $scope.selOutputPrior = [];
    $scope.selDataEx = [];
    $scope.selOutpEx = [];
    $scope.selDataSuper = [];
    $scope.selOutpSuper = [];
    $scope.eventColor;
    $scope.caseGridRows;
    $scope.header2 = ['이벤트', '이름', '시작일', '끝나는일', '신청시간', '신청종료', '신청횟수', '우선신청', '우선종료', '우선횟수'];
    $scope.header3 = ['횟수예외', '횟수'];
    $scope.header4 = ['우선권자'];
    sendData = {};
    $eventContainer = {};
    $priorContainer = {};
    $exceptionContainer = {};
    $superContainer = {};
    $scope.submit = function() {
      var da, tmpEx, tmpPrior;
      sendData.event = $eventContainer.data('handsontable').getData();
      sendData.prior = [];
      sendData.exception = [];
      sendData.color = $scope.eventColor;
      tmpPrior = $priorContainer.data('handsontable').getData();
      tmpPrior.forEach(function(item) {
        var index;
        index = userName.indexOf(item[0]);
        return sendData.prior.push(user_id[index]);
      });
      tmpEx = $exceptionContainer.data('handsontable').getData();
      tmpEx.forEach(function(item) {
        var index;
        index = userName.indexOf(item[0]);
        return sendData.exception.push({
          userId: user_id[index],
          many: item[1]
        });
      });
      sendData.cuEv = $scope.cuEv;
      da = "정말로\"" + $scope.cuEv.event + $scope.cuEv.name + "\"를 수정하시겠습니까?";
      return BootstrapDialog.show({
        type: BootstrapDialog.TYPE_DANGER,
        title: '확인',
        message: da,
        buttons: [
          {
            label: '수정',
            cssClass: 'btn-primary',
            action: function(dialogItself) {
              socket.emit('update', sendData);
              return dialogItself.close();
            }
          }, {
            label: '취소',
            action: function(dialogItself) {
              return dialogItself.close();
            }
          }
        ]
      });
    };
    $eventContainer = $("#setting").handsontable({
      colHeaders: $scope.header2,
      manualColumnResize: true,
      startRows: 1,
      startCols: 10,
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
          type: "numeric"
        }, {
          type: "date"
        }, {
          type: "date"
        }, {
          type: "numeric"
        }
      ]
    });
    $priorContainer = $("#prior").handsontable({
      rowHeaders: true,
      colHeaders: $scope.header4,
      contextMenu: true,
      startCols: 1,
      startRows: 1,
      manualColumnResize: true,
      columns: [
        {
          type: "text"
        }
      ]
    });
    $exceptionContainer = $("#exception").handsontable({
      rowHeaders: true,
      colHeaders: $scope.header3,
      contextMenu: true,
      startCols: 2,
      startRows: 1,
      manualColumnResize: true,
      columns: [
        {
          type: "text"
        }, {
          type: "numeric"
        }
      ]
    });
    Util.getUsersList().then(function(data) {
      var item, tpd1, tpd2, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        tpd1 = {
          name: item.number + item.name,
          value: item._id,
          ticked: false
        };
        tpd2 = {
          name: item.number + item.name,
          value: item._id,
          ticked: false
        };
        userName.push(item.number + item.name);
        user_id.push(item._id);
        $scope.selDataPrior.push(tpd1);
        _results.push($scope.selDataEx.push(tpd2));
      }
      return _results;
    }, function(status) {
      return alert(status);
    });
    $scope.dlc = function() {
      console.log($scope.selOutputPrior);
      return console.log($scope.selOutputEx);
    };
    $scope.prior = function() {
      var pr;
      pr = new Array;
      $scope.selOutputPrior.forEach(function(item) {
        var tmpA;
        tmpA = new Array;
        tmpA.push(item.name);
        return pr.push(tmpA);
      });
      return $priorContainer.data('handsontable').loadData(pr);
    };
    $scope.excep = function() {
      var ecp;
      ecp = new Array;
      $scope.selOutputEx.forEach(function(item) {
        var tmpA;
        tmpA = new Array;
        tmpA.push(item.name);
        return ecp.push(tmpA);
      });
      $exceptionContainer.data('handsontable').loadData(ecp);
      console.log($scope.eventColor);
      return console.log($scope.caseGridRows);
    };
    socket.emit('eventList');
    socket.on('eventList', function(data) {
      return $scope.events = data;
    });
    $scope.loadForUpdate = function(event) {
      $scope.cuEv = event;
      return socket.emit("loadForUpdate", event);
    };
    socket.on("loadForUpdate", function(data) {
      var tempForEvnet, tempForEvnetSec;
      console.log(data);
      tempForEvnet = new Array;
      tempForEvnetSec = new Array;
      tempForEvnetSec.push(data.events.event);
      tempForEvnetSec.push(data.events.name);
      tempForEvnetSec.push(data.events.startDate);
      tempForEvnetSec.push(data.events.endDate);
      tempForEvnetSec.push(data.events.applyTime);
      tempForEvnetSec.push(data.events.applyEnd);
      tempForEvnetSec.push(data.events.min);
      tempForEvnetSec.push(data.events.priorTime);
      tempForEvnetSec.push(data.events.priorEnd);
      tempForEvnetSec.push(data.events.priorMin);
      tempForEvnet.push(tempForEvnetSec);
      console.log(tempForEvnet);
      $eventContainer.data('handsontable').loadData(tempForEvnet);
      data.events.priorList.forEach(function(data) {
        var tmpN;
        tmpN = data.number + data.name;
        return $scope.selDataPrior.forEach(function(result) {
          if (result.name === tmpN) {
            return result.ticked = true;
          }
        });
      });
      return data.expInfo.forEach(function(data) {
        return $scope.selDataEx.forEach(function(result) {
          if (result.name === data[0]) {
            return result.ticked = true;
          }
        });
      });
    });
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('adminResultCtrl', function($scope, $rootScope, $window, socket, Util, $filter) {
    var re;
    angular.element("#cirClock").tzineClock(new Date());
    $scope.uiConfig = {
      calendar: {
        editable: true,
        header: {
          left: 'title',
          center: '',
          right: 'today prev,next'
        }
      }
    };
    $scope.eventSources = [];
    socket.emit('eventList');
    socket.on('eventList', function(data) {
      return $scope.events = data;
    });
    socket.on('loadEventInfo', function(data) {
      console.log(data);
      $scope.eventInfo = data;
      console.log($scope.eventInfo);
      return console.log($scope.eventInfo.priorMin);
    });
    socket.on('serverTime', function(data) {
      console.log(data);
      angular.element("#cirClock").empty();
      return angular.element("#cirClock").tzineClock(new Date(data));
    });
    socket.on('loadCases', function(data) {
      $scope.eventSources.splice(0, $scope.eventSources.length);
      $scope.eventSources.push(data.events);
      $scope.eventSources.push(data.results);
      $scope.count = data.num;
      return $scope.max = data.max;
    });
    socket.on('alert', function(data) {
      socket.emit('loadCases', $scope.currentEventId);
      return BootstrapDialog.show({
        type: BootstrapDialog.TYPE_WARNING,
        title: '경고',
        message: data,
        buttons: [
          {
            label: '확인',
            action: function(dialogItself) {
              return dialogItself.close();
            }
          }
        ]
      });
    });
    socket.on('applyOk', function(data) {
      socket.emit('loadCases', $scope.currentEventId);
      return BootstrapDialog.show({
        type: BootstrapDialog.TYPE_SUCCESS,
        title: '확인',
        message: data,
        buttons: [
          {
            label: '확인',
            action: function(dialogItself) {
              return dialogItself.close();
            }
          }
        ]
      });
    });
    $scope.loadEvent = function(event) {
      $scope.currentEventName = event.name;
      $scope.currentEventId = event._id;
      socket.emit('loadCases', event._id);
      return socket.emit('loadEventInfo', event._id);
    };
    re = $scope.eventSources[0];
    return $scope.filter = function(filterObj) {
      return re = $filter('filter')($scope.eventSource[0], filterObj);
    };
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('calendarCtrl', function($scope, $rootScope, $window, socket, Util, $filter) {
    angular.element("#cirClock").tzineClock(new Date());
    $scope.uiConfig = {
      calendar: {
        editable: true,
        header: {
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        eventClick: function(event) {
          var da, sendData;
          if (event.type === "applyForm") {
            sendData = {
              _id: event._id
            };
            return socket.emit('apply', sendData);
          } else {
            da = "정말로\"" + event.title + '(' + $filter('date')(event.created_at, 'y MMM d, h:mm:ss.sss a') + ")\"를 삭제하시겠습니까?";
            sendData = {
              _id: event._id
            };
            return BootstrapDialog.show({
              type: BootstrapDialog.TYPE_DANGER,
              title: '확인',
              message: da,
              closable: true,
              autodestroy: true,
              buttons: [
                {
                  label: '삭제',
                  cssClass: 'btn-primary',
                  action: function(dialogItself) {
                    socket.emit('deleteEvent', sendData);
                    return dialogItself.close();
                  }
                }, {
                  label: '취소',
                  action: function(dialogItself) {
                    return dialogItself.close();
                  }
                }
              ]
            });
          }
        },
        eventRender: function(event, element) {
          var cnt;
          if (event.type !== "applyForm") {
            cnt = $filter('date')(event.created_at, 'y MMM d, h:mm:ss.sss a');
            return element.qtip({
              content: cnt,
              position: {
                my: 'bottom center',
                at: 'top center',
                target: element
              },
              style: {
                classes: 'qtip-dark qtip-shadow qtip-rounded'
              }
            });
          }
        }
      }
    };
    $scope.eventSources = [];
    socket.emit('eventList');
    socket.on('eventList', function(data) {
      return $scope.events = data;
    });
    socket.on('loadEventInfo', function(data) {
      console.log(data);
      $scope.eventInfo = data;
      console.log($scope.eventInfo);
      return console.log($scope.eventInfo.priorMin);
    });
    socket.on('serverTime', function(data) {
      console.log(data);
      angular.element("#cirClock").empty();
      return angular.element("#cirClock").tzineClock(new Date(data));
    });
    socket.on('loadCases', function(data) {
      $scope.eventSources.splice(0, $scope.eventSources.length);
      $scope.eventSources.push(data.events);
      $scope.eventSources.push(data.results);
      $scope.count = data.num;
      return $scope.max = data.max;
    });
    socket.on('alert', function(data) {
      socket.emit('loadCases', $scope.currentEventId);
      console.log("alert");
      return BootstrapDialog.show({
        type: BootstrapDialog.TYPE_WARNING,
        title: '경고',
        message: data,
        autodestroy: true,
        closable: true,
        buttons: [
          {
            label: '확인',
            action: function(dialogItself) {
              return dialogItself.close();
            }
          }
        ]
      });
    });
    socket.on('applyOk', function(data) {
      socket.emit('loadCases', $scope.currentEventId);
      console.log("applyOk");
      return BootstrapDialog.show({
        type: BootstrapDialog.TYPE_SUCCESS,
        title: '확인',
        message: data,
        autodestroy: true,
        closable: true,
        buttons: [
          {
            label: '확인',
            action: function(dialogItself) {
              return dialogItself.close();
            }
          }
        ]
      });
    });
    $scope.loadEvent = function(event) {
      $scope.currentEventName = event.name;
      $scope.currentEventId = event._id;
      socket.emit('loadCases', event._id);
      return socket.emit('loadEventInfo', event._id);
    };
    $scope.userName = localStorage.loginUserName || sessionStorage.loginUserName;
    $scope.clockRe = function() {
      return socket.emit('serverTime');
    };
    return $scope.logout = function() {
      Util.makeReq('get', 'logout').success(function(data) {
        if (data !== 'success logout') {
          alert(data);
          return;
        }
        return Util.Go('/');
      }).error(function(error, status) {
        return console.log("$http.error");
      });
      sessionStorage.removeItem("logined");
      sessionStorage.removeItem("loginUserName");
      sessionStorage.removeItem("loginUserStNum");
      sessionStorage.removeItem("loginUserNumber");
      sessionStorage.removeItem("loginUserObjid");
      localStorage.removeItem("logined");
      localStorage.removeItem("loginUserName");
      localStorage.removeItem("loginUserStNum");
      localStorage.removeItem("loginUserNumber");
      localStorage.removeItem("loginUserObjid");
      return console.log("logout");
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
          localStorage.setItem("logined", true);
          localStorage.setItem("loginUserName", data.name);
          localStorage.setItem("loginUserStNum", data.studentNumber);
          localStorage.setItem("loginUserNumber", data.number);
          localStorage.setItem("loginUserObjid", data._id);
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
          Util.Go('idLogin');
        }
      }).error(function(error, status) {
        return console.log("$http.error");
      });
    };
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('userCtrl', function($scope, $rootScope, $window, $log, socket, Util) {
    var parad;
    angular.element("#cirClock").tzineClock(new Date());
    $scope.uiConfig = {
      calendar: {
        editable: true,
        header: {
          left: 'month,agendaWeek,agendaDay',
          center: 'title',
          right: 'today prev,next'
        },
        viewRender: function(view, element) {
          var sendData;
          sendData = {
            start: view.visStart,
            end: view.visEnd
          };
          socket.emit('loadUserCases', sendData);
          return console.log(sendData);
        }
      }
    };
    $scope.sdentId = "d429";
    $scope.sdentPasswd = "d1093110";
    $scope.eventSources = [];
    parad = {};
    parad.action = "LOGIN";
    parad.userid = $scope.sdentId + "@snu.ac.kr";
    parad.userid1 = $scope.sdentId;
    parad.userid2 = "snu.ac,kr";
    parad.passwd = $scope.sdentPasswd;
    console.log(parad);
    Util.reqSdent('post', '_common/login.php', parad).success(function(data) {
      return console.log(data);
    }).error(function(data, status) {
      return console.log(status);
    });
    Util.reqSdentCal('post').success(function(data) {
      return console.log(data);
    }).error(function(data, status) {
      return console.log(status);
    });
    socket.on('loadUserCases', function(data) {
      console.log(data);
      $scope.eventSources.splice(0, $scope.eventSources.length);
      return $scope.eventSources.push(data);
    });
    socket.on('serverTime', function(data) {
      console.log(data);
      angular.element("#cirClock").empty();
      return angular.element("#cirClock").tzineClock(new Date(data));
    });
    socket.on('alert', function(data) {
      socket.emit('loadCases', $scope.currentEventId);
      return BootstrapDialog.show({
        type: BootstrapDialog.TYPE_WARNING,
        title: '경고',
        message: data,
        buttons: [
          {
            label: '확인',
            action: function(dialogItself) {
              return dialogItself.close();
            }
          }
        ]
      });
    });
    socket.on('applyOk', function(data) {
      socket.emit('loadCases', $scope.currentEventId);
      return BootstrapDialog.show({
        type: BootstrapDialog.TYPE_SUCCESS,
        title: '확인',
        message: data,
        buttons: [
          {
            label: '확인',
            action: function(dialogItself) {
              return dialogItself.close();
            }
          }
        ]
      });
    });
    $scope.userName = localStorage.loginUserName || sessionStorage.loginUserName;
    $scope.clockRe = function() {
      return socket.emit('serverTime');
    };
    return $scope.logout = function() {
      Util.makeReq('get', 'logout').success(function(data) {
        if (data !== 'success logout') {
          alert(data);
          return;
        }
        return Util.Go('/');
      }).error(function(error, status) {
        return console.log("$http.error");
      });
      sessionStorage.removeItem("logined");
      sessionStorage.removeItem("loginUserName");
      sessionStorage.removeItem("loginUserStNum");
      sessionStorage.removeItem("loginUserNumber");
      sessionStorage.removeItem("loginUserObjid");
      localStorage.removeItem("logined");
      localStorage.removeItem("loginUserName");
      localStorage.removeItem("loginUserStNum");
      localStorage.removeItem("loginUserNumber");
      localStorage.removeItem("loginUserObjid");
      return console.log("logout");
    };
  });

}).call(this);
