angular.module('weatherApp.help', [
        'ngRoute'
    ])
    .config(function($routeProvider) {
        $routeProvider
            .when('/help', {
                templateUrl: 'app/help/help.html',
                controller: function($window, $http, $scope) {
                    $("#loadingImage").css({ "display": "" });
                    getHelpJsonDate();

                    function getHelpJsonDate() {
                        var items = new Array();
                        $http.get(urlApiTop + '/help/find?pageNo=1&pageSize=25')
                            .success(function(response) {
                                $("#loadingImage").css("display", "none");
                                // $scope.datas = response.data;
                                var itemsTemp = new Array();
                                itemsTemp = response.data;
                                if (itemsTemp.length == 0) { //判断ble设备是否有绑定数据
                                    infoAlertDiv(1);
                                    $("#loadingImage").css("display", "none");
                                } else {
                                    for (var i = 0; i < itemsTemp.length; i++) { //将获取的数据导入items
                                        items[i] = {
                                            "src": "",
                                            "h": "",
                                            "w": "",
                                            "title": "",
                                            "helpId": "",
                                        };
                                        items[i].src = itemsTemp[i].url;
                                        items[i].h = itemsTemp[i].imagesLength;
                                        items[i].w = itemsTemp[i].imagesWidth;
                                        items[i].title = itemsTemp[i].title;
                                        items[i].helpId = itemsTemp[i].sort;
                                    };
                                    items.sort(function(a, b) { //对存储的数组进行排序（从小到大）
                                        var x = a.helpId;
                                        var y = b.helpId;
                                        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                                    });
                                    openPhotoSwipe(items); //定义图框 
                                }
                            })
                            .error(function(error) { //加载失败的话触发下面代码
                                httpErrorTip(error); //链接错误提示
                                var helpOnline = function() { //帮助页恢复网络
                                    console.log("help");
                                    getHelpJsonDate();
                                }
                                document.addEventListener("online", helpOnline, false); //联网时触发
                                $scope.$on('$routeChangeStart', function() { //监听路由变化，跳出页面时触发
                                    console.log("helpremove");
                                    document.removeEventListener("online", helpOnline, false);
                                })
                            });
                    }
                    var openPhotoSwipe = function(items) { //定义画廊
                        var pswpElement = document.querySelectorAll('.pswp')[0];
                        var options = {
                            tapToClose: false,
                            tapToToggleControls: false, //控制栏点击后会消失
                            clickToCloseNonZoomable: true,
                            indexIndicatorSep: ' / ',
                            history: false,
                            focus: true,
                            showAnimationDuration: 0,
                            hideAnimationDuration: 0,
                            closeOnVerticalDrag: false, //向上滑动关闭
                        };
                        // console.log("帮助页面加载的数组：");
                        // console.log(items);
                        var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
                        gallery.init(); //首次打开画廊时，加载对应信息
                        gallery.listen('close', function() {
                            if (typeof(navigator.app) !== "undefined") {
                                navigator.app.backHistory();
                            } else {
                                window.history.back();
                            }
                        });
                    };
                }
            })
            .when('/setting', {
                templateUrl: 'app/help/setting.html',
                controller: function($window, $http, $scope) {
                    //初始化设置页面上按钮状态
                    var palyMode = window.localStorage.getItem("playMode"); //初始化播放模式
                    if (palyMode == "earpiece") {
                        $("#speakerBtn").css({ "display": "none" });
                        $("#earpieceBtn").css({ "display": "" });
                    } else if (palyMode == "speaker") {
                        $("#speakerBtn").css({ "display": "" });
                        $("#earpieceBtn").css({ "display": "none" });
                    };
                    var bleStatus = window.localStorage.getItem("bleStatus"); //读取蓝牙状态
                    if (bleStatus == null || bleStatus == "on") {
                        $("#bleStatusOff").css({ "display": "none" });
                        $("#bleStatusOn").css({ "display": "" });
                    } else if (bleStatus == "off") {
                        $("#bleStatusOff").css({ "display": "" });
                        $("#bleStatusOn").css({ "display": "none" });
                    }
                    var orientation = window.localStorage.getItem("orientation"); //读取屏幕状态
                    if (orientation == null || orientation == "on") {
                        $("#orientationOff").css({ "display": "none" });
                        $("#orientationOn").css({ "display": "" });
                    } else if (orientation == "off") {
                        $("#orientationOff").css({ "display": "" });
                        $("#orientationOn").css({ "display": "none" });
                    }
                    var currentVersion = "";
                    document.addEventListener("deviceready", function() {
                        // $("#canScanRssi").html(localStorage.canScanRssi);
                        // $("#canExhibitRssi").html(localStorage.canExhibitRssi);
                        cordova.getAppVersion.getAppName(function(appname) { //读取app名字
                            $(".copyRight").html(appname + " © JKinfo");
                            // console.log(appname)
                        });
                        cordova.getAppVersion.getVersionNumber(function(version) { //读取app版本信息
                            $(".appVersion").html("当前版本：" + version);
                            // console.log(version)
                            currentVersion = version;
                        });
                    }, false);
                    var canExhibitRssi = window.localStorage.getItem("canExhibitRssi"); //读取蓝牙触发信号
                    if (canExhibitRssi == null) {
                        // $("#canScanRssi").html("-78");
                        // $("#canExhibitRssi").html("-66");
                        document.getElementById("rangeBleRssi").value = -61;
                    } else {
                        // $("#canScanRssi").html(localStorage.canScanRssi);
                        // $("#canExhibitRssi").html(localStorage.canExhibitRssi);
                        document.getElementById("rangeBleRssi").value = localStorage.canExhibitRssi;
                    }
                    /////////////////////监听设置页面的所有按钮////////////////////////////////////////
                    //设置播放方式
                    touch.on("#speakerBtn", "tap", function() {
                        window.localStorage.setItem("playMode", "earpiece"); //设置播放方式是听筒
                        $("#speakerBtn").css({ "display": "none" });
                        $("#earpieceBtn").css({ "display": "" });
                        document.addEventListener("deviceready", function() {
                            AudioToggle.setAudioMode(AudioToggle.EARPIECE); //用听筒播放音频
                        }, false);
                    });
                    touch.on("#earpieceBtn", "tap", function() {
                        window.localStorage.setItem("playMode", "speaker"); //设置播放方式是外放
                        $("#speakerBtn").css({ "display": "" });
                        $("#earpieceBtn").css({ "display": "none" });
                        document.addEventListener("deviceready", function() {
                            AudioToggle.setAudioMode(AudioToggle.NORMAL); //回到正常模式
                            // AudioToggle.setAudioMode(AudioToggle.SPEAKER); //用听筒播放音频
                        }, false);
                    });

                    //设置蓝牙状态
                    touch.on("#bleStatusOff", "tap", function() {
                        window.localStorage.setItem("bleStatus", "on"); //设置蓝牙状态为开
                        window.localStorage.setItem("bleSwitch", "1"); //设置蓝牙循环为开
                        $("#bleStatusOff").css({ "display": "none" });
                        $("#bleStatusOn").css({ "display": "" });
                    });
                    touch.on("#bleStatusOn", "tap", function() {
                        window.localStorage.setItem("bleStatus", "off"); //设置蓝牙状态为关
                        window.localStorage.setItem("bleSwitch", "0"); //设置蓝牙循环为关
                        $("#bleStatusOff").css({ "display": "" });
                        $("#bleStatusOn").css({ "display": "none" });
                    });
                    //设置屏幕状态
                    touch.on("#orientationOff", "tap", function() {
                        window.localStorage.setItem("orientation", "on"); //设置允许横屏状态为开
                        window.screen.unlockOrientation();
                        //console.log('允许横屏')
                        $("#orientationOff").css({ "display": "none" });
                        $("#orientationOn").css({ "display": "" });
                    });
                    touch.on("#orientationOn", "tap", function() {
                        window.localStorage.setItem("orientation", "off");
                        window.screen.lockOrientation('portrait-primary');
                        $("#orientationOff").css({ "display": "" });
                        $("#orientationOn").css({ "display": "none" });
                    });
                    //清除缓存
                    touch.on("#clearCacheSet", "tap", function() {
                        clearCacheFunc(); //清空app缓存
                        localStorage.clear(); //清空localStorage
                    });
                    //检查更新
                    touch.on("#checkVersionSet", "tap", function() {
                        updateApp("set");
                    });
                    //更新日志
                    touch.on("#updateLogBtn", "tap", function() {
                        $.ajax({
                            url: urlApiTop + "/version/checked?channelCode=1000&deviceType=Android&appVersion=" + currentVersion,
                            type: "GET",
                            async: false,
                            dataType: "json", //若没设置则返回字符串
                            success: function(data) { //回调的内容
                                $("#updateLogDiv").css('display', '');
                                // if (typeof(data.length) != "undefined") { //有数据，需要更新
                                var updateLog = data.description;
                                $("#updateLogTitle").html("更新日志");
                                $("#updateLogContent").html("<div style='text-align:center'>发现新版本：" +
                                    data.appVersion + "</div><p>" + updateLog + "</p>");
                                // } else {
                                //     $("#updateLogTitle").html("更新日志");
                                //     $("#updateLogContent").html("当前版本为：" + currentVersion + "，已是最新版本。");
                                // }

                            },
                            error: function(e) {
                                // console.log('检测版本错误：');
                                console.log(e);
                                $("#updateLogDiv").css('display', '');


                                if (e.status === 400) {
                                    $("#updateLogTitle").html("更新日志");
                                    $("#updateLogContent").html(e.responseJSON.error);
                                } else {
                                    $("#updateLogTitle").html("错误报告");
                                    $("#updateLogContent").html("检查版本，发生错误。");
                                }
                            }
                        });
                    });
                    //关闭更新日志
                    touch.on("#updateLogClose", "tap", function() {
                        $("#updateLogDiv").css('display', 'none');
                    });
                    //定位矫正
                    // touch.on("#bleRssi", "tap", function() {
                    //     correctBleRssi();
                    // });


                }
            })
    })
