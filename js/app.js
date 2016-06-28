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

  this.loadTopKillers = function() {
    mainCtrl.loading = true;
    $.post({
      url: "http://localhost:1337/localhost:8090/jobs?appName=csgoanalyst&classPath=csgoanalyst.TopKillers",
      data: '{"qtd": "10", "camp": "' + mainCtrl.camp+ '"}',
      contentType: "application/json",
      dataType: "json",
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Content-Type", "application/json")
      }
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
  };

  this.loadTopKDs = function() {
    mainCtrl.loading = true;
    $.post({
      url: "http://localhost:1337/localhost:8090/jobs?appName=csgoanalyst&classPath=csgoanalyst.TopKD",
      data: '{"qtd": "300", "camp": "' + mainCtrl.camp+ '"}',
      contentType: "application/json",
      dataType: "json",
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Content-Type", "application/json")
      }
    }).promise().then(function(jobRequest) {
      mainCtrl.interval = mainCtrl.$interval(function() {
        $.get({
          url: "http://localhost:1337/localhost:8090/jobs/" + jobRequest.result.jobId
        }).promise().then(function(jobResponse) {
          if(jobResponse.status == "FINISHED") {
            mainCtrl.$scope.$apply(function() {
              mainCtrl.$interval.cancel(mainCtrl.interval);
              mainCtrl.topKDs = jobResponse.result.sort(function(a,b) {
                return (b[1][0]/b[1][1]) - (a[1][0]/a[1][1]);
              }).slice(0,10);
              mainCtrl.loading = false;
            });
          }
        })
      }, 500);
    });
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
            console.log(player);
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

  this.showHome();
}]);

