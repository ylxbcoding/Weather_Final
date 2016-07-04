angular.module('weatherApp.map', [
        'ngRoute'
    ])
    .config(function($routeProvider) {
        $routeProvider
            .when('/map/:id?/:hotId?/:floorNo?', {
                templateUrl: 'app/map/index.html',
                controller: function($scope, $http, $routeParams, $location, $window) {
                    var mapIframe = document.getElementById("oframe");
                    var mapUrl = window.location.href; //获取当前url
                    $("#loadingImage").css("display", "");
                    var getDefaultPano = function() { //获取默认全景
                        var historyPano = window.localStorage.getItem("historyPano");

                        $http.get(urlApiTop + "/hot/detail?id=1")
                            .success(function(response) {

                                if (historyPano == null) {
                                    mapIframe.src = urlMapTop + "/pano.html";
                                } else {
                                    var historyPanoSplit = historyPano.split(";");
                                    mapIframe.src = urlMapTop + "/pano.html?panoid=" + historyPanoSplit[1] + "&placeid=" + historyPanoSplit[0] + "&panoP=" + historyPanoSplit[2];
                                }
                            }).error(function(error) {
                                httpErrorTip(error); //错误提示
                                httpError();
                            });

                    }
                    var getLocationPano = function(getFloorId, hotId) { //获取location传递过来的全景
                            if (getFloorId == "2") { //2楼
                                $scope.placeid = 611;
                            } else if (getFloorId == "3") { //3楼
                                $scope.placeid = 610;
                            } else { //室外
                                $scope.placeid = 612;
                            }
                            if (hotId !== "" && hotId !== undefined) { //表示location页面传入的数据显示热区全景图
                                $http.get(urlApiTop + "/hot/detail?id=" + hotId)
                                    .success(function(response) {
                                        $scope.pid = response.panorama.panoId;
                                        mapIframe.src = urlMapTop + "/pano.html?panoid=" + $scope.pid + "&placeid=" + $scope.placeid;
                                    })
                                    .error(function(error) {
                                        httpErrorTip(error); //提示
                                        httpError();
                                    });
                            } else {
                                getDefaultPano();
                            }
                        }
                        // var iframeDom = document.getElementById("oframe").contentWindow;
                        // var getBlePano = function() {
                        //     var panoId = GetArgsFromHref(mapUrl, "panoid");
                        //     var placeId = GetArgsFromHref(mapUrl, "placeid");
                        //     var panoP = GetArgsFromHref(mapUrl, "panoP");
                        //     var panoT = GetArgsFromHref(mapUrl, "panoT");
                        //     var panoF = GetArgsFromHref(mapUrl, "panoF");
                        //     iframeDom.pano.showPano(placeId, panoId, panoP, panoT, panoF);
                        //     // mapIframe.src = urlMapTop + "/pano.html?panoid=" + panoId + "&placeid=" + placeId + "&panoP=" + panoP + "&panoT=" + panoT + "&panoF=" + panoF;
                        //     // console.log("panoid=" + panoId + "&placeid=" + placeId + "&panoP=" + panoP + "&panoT=" + panoT + "&panoF=" + panoF);
                        // }
                    var httpError = function() { //http发生错误的时候
                        var mapOnline = function() { //全景页恢复网络
                            console.log("map");
                            getDefaultPano();
                        }
                        document.addEventListener("online", mapOnline, false); //联网时触发
                        $scope.$on('$routeChangeStart', function() { //监听路由变化，跳出页面时触发
                            console.log("mapremove");
                            document.removeEventListener("online", mapOnline, false);
                        })
                    }
                    var mapBackBtn;
                    var iframeLoaded = false;
                    $scope.$on('$routeChangeSuccess', function(e, new1, old1) { //监听路由变化,跳进页面时触发
                        var oldurl = old1.loadedTemplateUrl;
                        var newurl = new1.loadedTemplateUrl;
                        if (oldurl.indexOf("location/") > -1) { //平面地图跳转过来
                            var getFloorId = GetArgsFromHref(mapUrl, "floorNo");
                            var hotId = GetArgsFromHref(mapUrl, "hotId");
                            getLocationPano(getFloorId, hotId);

                            console.log(oldurl + "    " + newurl);
                        } else { //当页面从index页面跳转过来
                            getDefaultPano();

                            // getBlePano();
                            console.log('from index');
                        }
                        mapBackBtn = function() {
                            if (slideout.isOpen()) { //判断侧边栏
                                slideout.close();
                            } else {
                                if (iframeLoaded == true) {
                                    var panoExDiv = mapIframe.contentWindow.document.getElementById("panoExDiv");
                                    if (panoExDiv) {
                                        mapIframe.contentWindow.fPanoClose();
                                    } else {
                                        if (typeof(navigator.app) !== "undefined") {
                                            navigator.app.cancelLoadUrl(); // 在 web 页面成功加载之前取消加载
                                            navigator.app.backHistory();
                                        } else {
                                            window.history.back();
                                        }
                                    }
                                } else {
                                    if (typeof(navigator.app) !== "undefined") {
                                        navigator.app.cancelLoadUrl(); // 在 web 页面成功加载之前取消加载
                                        navigator.app.backHistory();
                                    } else {
                                        window.history.back();
                                    }
                                }
                            }

                        }

                        //监听返回键
                        touch.on('.backIcon', 'tap', function(event) { mapBackBtn(); });
                        document.addEventListener("backbutton", mapBackBtn, false); // 返回键
                        document.addEventListener("pause", onPause, false); //当app在后台运行时触发
                    })

                    function onPause() { //当app在后台运行时触发
                        var panoExDiv = mapIframe.contentWindow.document.getElementById("panoExDiv");
                        if (panoExDiv) {
                            mapIframe.contentWindow.pauseAudio();
                        }
                        console.log("map-onPause");
                    }


                    $scope.$on('$routeChangeStart', function() { //监听路由变化，跳出页面时触发
                        document.removeEventListener("pause", onPause, false); //当app在后台运行时触发
                        document.removeEventListener("backbutton", mapBackBtn, false); // 返回键
                        console.log("$routeChangeStart");
                        var historyPano = mapIframe.contentWindow.getHistoryPano(); //获取全景页面记录的全景历史
                        window.localStorage.setItem("historyPano", historyPano);

                    })
                    if (mapIframe.attachEvent) { //判断iframe加载完成
                        mapIframe.attachEvent("onload", function() {
                            $("#loadingImage").css("display", "none");
                            iframeLoaded = true;
                        });
                    } else {
                        mapIframe.onload = function() {
                            $("#loadingImage").css("display", "none");
                            iframeLoaded = true;
                        };
                    }
                    // function showPanoTip() {
                    //     new Toast({
                    //         context: $('body'),
                    //         message: '请暂停正在播放的其他音频。'
                    //     });
                    //     new Toast.init();
                    //     new Toast.show();
                    // }
                    ////////开启侧边栏/////////////////////////////////////////////////////////////

                    document.querySelector('.toggle-button').addEventListener('click', function() {
                        slideout.toggle();
                    });


                }
            })
    })
