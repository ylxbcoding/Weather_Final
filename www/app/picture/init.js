angular.module('weatherApp.picture.init', [
        'ngRoute'
    ])
    .config(function($routeProvider) {
        $routeProvider
            .when('/picture', {
                templateUrl: 'app/picture/index.html',
                controller: function($scope, $window, $location, $q, $http) {
                    var wRow_ = document.querySelector('.picNine').offsetWidth;
                    $(".picNine").css({ 'height': wRow_ + "px" });
                    $(".row_1,.row_2,.row_3").css({ 'height': (wRow_ * 0.33) + "px", 'line-height': (wRow_ * 0.33) + "px" });
                    var pageNo = 1;
                    var totalpageNo;
                    var localPageNo = window.localStorage.getItem("pageNo");
                    // console.log(localPageNo);

                    if (localPageNo == "" || localPageNo == null) { //是否有历史浏览记录
                        getExhibitImg(1);

                    } else {
                        pageNo = localPageNo;
                        getExhibitImg(localPageNo);
                    }

                    function getExhibitImg(pageNo) { //获取7个展品数据
                        var _popUri = urlApiTop + '/exhibit/find?pageSize=7&pageNo=' + pageNo;
                        $http.get(_popUri).success(function(result) {
                            $scope.exhibitArray = result.data;
                            totalpageNo = result.totalPageNum;
                            var resultpageNo = result.pageNo;
                            if (1 < parseInt(resultpageNo) && parseInt(resultpageNo) < 10) {
                                $("#box4").html("0" + resultpageNo);
                            } else if (parseInt(resultpageNo) == 1) {
                                $("#box4").html("Introduce");
                            } else {
                                $("#box4").html(resultpageNo);
                            }

                        }).error(function(error) {
                            httpErrorTip(error);
                            var pictureOnline = function() { //页面恢复网络
                                console.log("picture");
                                if (localPageNo == "" || localPageNo == null) {
                                    getExhibitImg(1);

                                } else {
                                    pageNo = localPageNo;
                                    getExhibitImg(localPageNo);
                                }
                            }
                            document.addEventListener("online", pictureOnline, false); //联网时触发
                            $scope.$on('$routeChangeStart', function() { //监听路由变化，跳出页面时触发
                                console.log("pictureremove");
                                document.removeEventListener("online", pictureOnline, false);
                            })
                        });　
                    }
                    $scope.savePageNo = function(obj) { //保存浏览记录并跳转
                        $location.path('exhibit/detail').search({ id: obj });
                        window.localStorage.setItem("pageNo", pageNo);
                    }
                    touch.on(".nextPageBtn", "tap doubletap", function(ev) {
                        //加载下一页数据
                        if (pageNo < totalpageNo) {
                            pageNo++;
                            getExhibitImg(pageNo);
                        } else {
                            new Toast({
                                context: $('body'),
                                message: '没有数据了。'
                            });
                            new Toast.init();
                            new Toast.show();
                        }
                    })
                    touch.on(".backPageBtn", "tap doubletap", function(ev) { //百度touch.js中的单击和双击事件
                        //加载上一页数据
                        if (2 <= pageNo) {
                            pageNo--;
                            getExhibitImg(pageNo);
                        }
                    })



                }

            })
    })
