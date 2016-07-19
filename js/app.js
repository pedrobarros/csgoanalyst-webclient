var spa = angular.module('spa',['ngAnimate', 'ngMaterial', 'ngAria']);

spa.controller('MainController', ['$scope', '$interval', '$mdDialog', function($scope, $interval, $mdDialog) {
  var mainCtrl = this;
  this.$scope = $scope;
  this.$interval = $interval;
  this.$mdDialog = $mdDialog;
  this.interval = null;
  this.loading = true;
  $scope.Math = window.Math;

  this.showHome = function() {
    this.page = "home";
    this.camps = [];
    this.camp = null;
    this.loading = true;

    $.post({
      url: "http://localhost:1337/localhost:8090/jobs?appName=csgoanalyst&classPath=csgoanalyst.ListCamps"
    }).promise().then(function(jobRequest) {
      mainCtrl.interval = mainCtrl.$interval(function() {
        $.get({
          url: "http://localhost:1337/localhost:8090/jobs/" + jobRequest.result.jobId
        }).promise().then(function(jobResponse) {
          if(jobResponse.status == "FINISHED") {
            mainCtrl.$scope.$apply(function() {
              mainCtrl.$interval.cancel(mainCtrl.interval);
              mainCtrl.camps = jobResponse.result;
              mainCtrl.loading = false;
            });
          }
        })
      }, 500);
    });
  };

  this.showCamp = function() {
    this.page = "camp";
    this.allPlayers = [];
    this.topKillers = [];
    this.topKDs = [];
    this.allMaps = [];
    this.firstKillsMap = null;
    this.firstKills = [];
    this.smokesMap = null;
    this.smokes = [];
    this.molotovsMap = null;
    this.molotovs = [];
    this.loadingPlayer = null;
  };

  this.loadAllPlayers = function() {
    mainCtrl.loading = true;
    $.post({
      url: "http://localhost:1337/localhost:8090/jobs?appName=csgoanalyst&classPath=csgoanalyst.ListPlayers",
      data: '{"qtd": "10", "camp": "' + mainCtrl.camp+ '"}'
    }).promise().then(function(jobRequest) {
      mainCtrl.interval = mainCtrl.$interval(function() {
        $.get({
          url: "http://localhost:1337/localhost:8090/jobs/" + jobRequest.result.jobId
        }).promise().then(function(jobResponse) {
          if(jobResponse.status == "FINISHED") {
            mainCtrl.$scope.$apply(function() {
              mainCtrl.$interval.cancel(mainCtrl.interval);
              mainCtrl.allPlayers = jobResponse.result;
              mainCtrl.loading = false;
            });
          }
        })
      }, 500);
    });
  };

  this.loadTopKillers = function(ev) {
    var confirm = mainCtrl.$mdDialog.prompt()
        .title('How many players?')
        .placeholder('Quantity')
        .targetEvent(ev)
        .ok('Ok')
        .cancel('Cancel');

    mainCtrl.$mdDialog.show(confirm).then(function(qtd) {
      mainCtrl.loading = true;
      $.post({
        url: "http://localhost:1337/localhost:8090/jobs?appName=csgoanalyst&classPath=csgoanalyst.TopKillers",
        data: '{"qtd": "'+ qtd + '", "camp": "' + mainCtrl.camp+ '"}'
      }).promise().then(function(jobRequest) {
        mainCtrl.interval = mainCtrl.$interval(function() {
          $.get({
            url: "http://localhost:1337/localhost:8090/jobs/" + jobRequest.result.jobId
          }).promise().then(function(jobResponse) {
            if(jobResponse.status == "FINISHED") {
              mainCtrl.$scope.$apply(function() {
                mainCtrl.$interval.cancel(mainCtrl.interval);
                mainCtrl.topKillers = jobResponse.result;
                mainCtrl.loading = false;
              });
            }
          })
        }, 500);
      });
    }, function() {});
  };

  this.loadTopKDs = function(ev) {
    var confirm = mainCtrl.$mdDialog.prompt()
        .title('How many players?')
        .placeholder('Quantity')
        .targetEvent(ev)
        .ok('Ok')
        .cancel('Cancel');

    mainCtrl.$mdDialog.show(confirm).then(function(qtd) {
      mainCtrl.loading = true;
      $.post({
        url: "http://localhost:1337/localhost:8090/jobs?appName=csgoanalyst&classPath=csgoanalyst.TopKD",
        data: '{"qtd": "300", "camp": "' + mainCtrl.camp + '"}'
      }).promise().then(function (jobRequest) {
        mainCtrl.interval = mainCtrl.$interval(function () {
          $.get({
            url: "http://localhost:1337/localhost:8090/jobs/" + jobRequest.result.jobId
          }).promise().then(function (jobResponse) {
            if (jobResponse.status == "FINISHED") {
              mainCtrl.$scope.$apply(function () {
                mainCtrl.$interval.cancel(mainCtrl.interval);
                mainCtrl.topKDs = jobResponse.result.sort(function (a, b) {
                  return (b[1][0] / b[1][1]) - (a[1][0] / a[1][1]);
                }).slice(0, qtd);
                mainCtrl.loading = false;
              });
            }
          })
        }, 500);
      });
    }, function() {});
  };

  this.showKDEspec = function(ev, player) {
    if(mainCtrl.loadingPlayer != null) return;
    mainCtrl.loadingPlayer = player;
    $.post({
      url: "http://localhost:1337/localhost:8090/jobs?appName=csgoanalyst&classPath=csgoanalyst.KDESpec",
      data: '{"nickname": "' + player + '", "camp": "' + mainCtrl.camp+ '"}'
    }).promise().then(function(jobRequest) {
      mainCtrl.interval = mainCtrl.$interval(function() {
        $.get({
          url: "http://localhost:1337/localhost:8090/jobs/" + jobRequest.result.jobId
        }).promise().then(function(jobResponse) {
          if(jobResponse.status == "FINISHED") {
            var player = jobResponse.result[0];
            mainCtrl.$scope.$apply(function() {
              mainCtrl.$interval.cancel(mainCtrl.interval);
              mainCtrl.$mdDialog.show(
                  mainCtrl.$mdDialog.alert()
                      .parent(angular.element(document.querySelector('body')))
                      .clickOutsideToClose(true)
                      .title(player[0] + '\'s KD')
                      .textContent('K/D: ' + player[1][0] + '/' + player[1][1] + ' ; Ratio: ' + Math.round(player[1][0]/player[1][1]*100)/100)
                      .ok('Close')
                      .targetEvent(ev)
              );
              mainCtrl.loadingPlayer = null;
            });
          }
        })
      }, 500);
    });
  };

  this.loadAllMaps = function() {
    mainCtrl.loading = true;
    $.post({
      url: "http://localhost:1337/localhost:8090/jobs?appName=csgoanalyst&classPath=csgoanalyst.ListMaps",
      data: '{"camp": "' + mainCtrl.camp+ '"}'
    }).promise().then(function(jobRequest) {
      mainCtrl.interval = mainCtrl.$interval(function() {
        $.get({
          url: "http://localhost:1337/localhost:8090/jobs/" + jobRequest.result.jobId
        }).promise().then(function(jobResponse) {
          if(jobResponse.status == "FINISHED") {
            mainCtrl.$scope.$apply(function() {
              mainCtrl.$interval.cancel(mainCtrl.interval);
              mainCtrl.allMaps = jobResponse.result;
              mainCtrl.loading = false;
            });
          }
        })
      }, 500);
    });
  };

  this.loadFirstKills = function() {
    mainCtrl.loading = true;
    $.post({
      url: "http://localhost:1337/localhost:8090/jobs?appName=csgoanalyst&classPath=csgoanalyst.PosFirstKillers",
      data: '{"qtd": "10", "camp": "' + mainCtrl.camp+ '", "map": "' + mainCtrl.firstKillsMap + '"}'
    }).promise().then(function(jobRequest) {
      mainCtrl.interval = mainCtrl.$interval(function() {
        $.get({
          url: "http://localhost:1337/localhost:8090/jobs/" + jobRequest.result.jobId
        }).promise().then(function(jobResponse) {
          if(jobResponse.status == "FINISHED") {
            mainCtrl.$scope.$apply(function() {
              mainCtrl.$interval.cancel(mainCtrl.interval);
              mainCtrl.firstKills = jobResponse.result;
              mainCtrl.drawFirstKills();
              mainCtrl.loading = false;
            });
          }
        })
      }, 500);
    });
  };

  this.drawFirstKills = function() {
    var data = [];
    for(var i = 0; i < this.firstKills.length; i++) {
      var point = mainCtrl.mapScale(mainCtrl.firstKillsMap, this.firstKills[i]);
      data.push(
          [Math.floor(point[0]), Math.floor(point[1]), 0.5]);
    }
    simpleheat('firstKillsCanvas').data(data).draw();
  };

  this.loadSmokes = function() {
    mainCtrl.loading = true;
    $.post({
      url: "http://localhost:1337/localhost:8090/jobs?appName=csgoanalyst&classPath=csgoanalyst.PosSmokes",
      data: '{"camp": "' + mainCtrl.camp+ '", "map": "' + mainCtrl.smokesMap + '"}'
    }).promise().then(function(jobRequest) {
      mainCtrl.interval = mainCtrl.$interval(function() {
        $.get({
          url: "http://localhost:1337/localhost:8090/jobs/" + jobRequest.result.jobId
        }).promise().then(function(jobResponse) {
          if(jobResponse.status == "FINISHED") {
            mainCtrl.$scope.$apply(function() {
              mainCtrl.$interval.cancel(mainCtrl.interval);
              mainCtrl.smokes = jobResponse.result;
              mainCtrl.drawSmokes();
              mainCtrl.loading = false;
            });
          }
        })
      }, 500);
    });
  };

  this.drawSmokes = function() {
    var data = [];
    for(var i = 0; i < this.smokes.length; i++) {
      var point = mainCtrl.mapScale(mainCtrl.smokesMap, this.smokes[i]);
      data.push(
          [Math.floor(point[0]), Math.floor(point[1]), 0.4]);
    }
    simpleheat('smokesCanvas').data(data).draw();
  };

  this.loadMolotovs = function() {
    mainCtrl.loading = true;
    $.post({
      url: "http://localhost:1337/localhost:8090/jobs?appName=csgoanalyst&classPath=csgoanalyst.PosMolotovs",
      data: '{"qtd": "10", "camp": "' + mainCtrl.camp+ '", "map": "' + mainCtrl.molotovsMap + '"}'
    }).promise().then(function(jobRequest) {
      mainCtrl.interval = mainCtrl.$interval(function() {
        $.get({
          url: "http://localhost:1337/localhost:8090/jobs/" + jobRequest.result.jobId
        }).promise().then(function(jobResponse) {
          if(jobResponse.status == "FINISHED") {
            mainCtrl.$scope.$apply(function() {
              mainCtrl.$interval.cancel(mainCtrl.interval);
              mainCtrl.molotovs = jobResponse.result;
              mainCtrl.drawMolotovs();
              mainCtrl.loading = false;
            });
          }
        })
      }, 500);
    });
  };

  this.drawMolotovs = function() {
    var data = [];
    for(var i = 0; i < this.molotovs.length; i++) {
      var point = mainCtrl.mapScale(mainCtrl.molotovsMap, this.molotovs[i]);
      data.push(
          [Math.floor(point[0]), Math.floor(point[1]), 0.4]);
    }
    simpleheat('molotovsCanvas').data(data).draw();
  };

  this.mapScale = function(map, point) {
    var x = parseFloat(point[0]);
    var y = parseFloat(point[1]);
    switch(map) {
      case "de_dust2":
        return [((x+2191)*0.2309631870902673 + 50),((-y+3119)*0.2260024301336574 + 63)];
      case "de_cache":
        return [((x+1803)*0.1807511737089202 + 45),((-y+2261)*0.1825993555316864 + 178)];
      case "de_mirage":
        return [((x+2655)*0.1997566909975669 + 112),((-y+887)*0.2031518624641834 + 162)];
      case "de_overpass":
        return [((x + 3959)*0.1912430800201309 + 165),((-y+1672)*0.1919876137023418 + 19)];
      case "de_train":
        return [((x+2245)*0.2143359100491918 + 48),((-y+1775)*0.2145680406549972 + 130)];
      case "de_cbblestone":
        return [((x+3471)*0.1677076104557021 + 63),((-y + 3021)*0.1688649080735412 +8)];
      case "de_nuke":
        return [((x+2991)*0.1438039457459926 +65),((-y + 934)*0.1441547026076765 + 277)];
      case "de_inferno":
        return [((x+1963)*0.1727389627089584 + 30),((-y+3599)*0.1722095671981777 + 122)];
    }
  };

  this.showHome();
}]);

