 angular.module('weatherApp.socialSharing', ['ngCordova', 'ngDialog', 'ngTouch', 'weatherApp.canvasMerge'])
     //利用手机的tap事件代替click事件，快速响应单击事件
     .directive("ngTap", function() {
         return function($scope, $element, $attributes) {
             var tapped;
             tapped = false;
             $element.bind("click", function() {
                 if (!tapped) {
                     return $scope.$apply($attributes["ngTap"]);
                 }
             });
             $element.bind("touchstart", function(event) {
                 return tapped = true;
             });
             $element.bind("touchmove", function(event) {
                 tapped = false;
                 return event.stopImmediatePropagation();
             });
             return $element.bind("touchend", function() {
                 if (tapped) {
                     return $scope.$apply($attributes["ngTap"]);
                 }
             });
         };
     })
     //分享按钮
     .directive("socialSharing", function($window) {
         return {
             scope: {},
             restrict: 'AE',
             replace: true,
             template: ' <a id="saveCanvas" class="shareIcon pull-right" ng-tap="checkMerged()" ng-click="share()"> </a>  ',
             controller: function($scope, $q, canvasMerge, ngDialog) {

                 $scope.checkMerged = function() {
                     if (!$scope.isMerged) //声明仅合并一次的布尔值
                         $scope.$parent.checkImgMerged = true; //显示保存框
                 }

                 $scope.share = function() {
                     setTimeout(function() {
                         checkCanvasMerge().then(function() {
                             _openDialog(); //打开分享框 
                         })
                     }, 10)
                 }


                 function checkCanvasMerge() {
                     var deferred = $q.defer();
                     if (!$scope.isMerged) {
                         $scope.picture = new canvasMerge(); //合并成图片 
                         $scope.isMerged = true;
                     }
                     deferred.resolve(); //声明执行成功  
                     return deferred.promise;
                 }

                 function _openDialog() {
                     $scope.$parent.checkImgMerged = false; //隐藏保存框
                     ngDialog.open({ //打开分享框 
                         scope: $scope,
                         templateUrl: 'app/camera/myModalContent.html',
                         controller: 'photoCtrl',
                         overlay: true,
                         showClose: false,
                         closeByDocument: true,
                         closeByEscape: true,
                         closeByNavigation: true
                     });
                     console.log('--===ngDialog-===' + new Date());
                 }
             }
         }
     });
