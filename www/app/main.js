angular.module('weatherApp', ['ngCordova',
        'weatherApp.socialSharing',
        'weatherApp.map',
        'weatherApp.location',
        'weatherApp.help',
        'weatherApp.camera.init',
        'weatherApp.picture.init',
        'weatherApp.camera',
        'weatherApp.exhibit',
        // 'weatherApp.picture', /*'ngPhotoswipe',*/
        // 'weatherApp.robot',
        'weatherApp.index',
        'ngRoute'
    ]).config(function($compileProvider, $httpProvider) {
        // angular unsafe blob
        var oldWhiteList = $compileProvider.imgSrcSanitizationWhitelist();
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
        $httpProvider.defaults.timeout = 3000; //http请求事件，超过n后不请求
    })
    .run(['$rootScope', '$window', '$location', '$log', function($rootScope, $window, $location, $log) { //监听angular路由改变
        ////////////////////////////
        ////监听返回键//////////////
        ////////////////////////////
        document.addEventListener("backbutton", _onBackKeyDown, false); //监听返回键
        function exitApp() { //退出app
            window.localStorage.removeItem("slides")
            navigator.app.exitApp();
        }

        function _onBackKeyDown() { //返回键方法
            var currentUrl = window.location.href;
            //console.log(currentUrl);
            if (currentUrl.indexOf("#/welcome") > -1) {
                navigator.app.clearHistory(); //清空浏览历史
                var indexSetTimeOut = window.setTimeout(function() { //延迟注销监听返回键
                    document.removeEventListener("backbutton", _onBackKeyDown, false); // 注销监听返回键
                    new Toast({
                        context: $('body'),
                        message: "再按一次退出APP",
                        time: 2000
                    });
                    new Toast.init();
                    new Toast.show();
                    document.addEventListener("backbutton", exitApp, false); //绑定退出事件 
                    var intervalID = window.setTimeout(function() { // 2秒后重新注册
                        document.removeEventListener("backbutton", exitApp, false); // 注销监听返回键
                        document.addEventListener("backbutton", _onBackKeyDown, false); // 返回键
                        window.clearTimeout(intervalID);
                    }, 2000);
                    window.clearTimeout(indexSetTimeOut);
                }, 800);
            } else if (currentUrl.indexOf("#/map") > -1) { //map页面的返回键
            } else if (currentUrl.indexOf("#/setting") > -1) {
                var blePage = document.getElementById("correctBleRssi");
                var updateLog = document.getElementById("updateLogDiv").style.display;
                //console.log(updateLog);
                if (blePage) { //判断蓝牙矫正页面是否存在
                    $("#correctBleRssi").remove();
                } else if (updateLog == "") {
                    $("#updateLogDiv").css('display', 'none');
                } else {
                    if (typeof(navigator.app) !== "undefined") {
                        navigator.app.cancelLoadUrl(); // 在 web 页面成功加载之前取消加载
                        navigator.app.backHistory();
                    } else {
                        window.history.back();
                    }
                }
            } else {
                if (!$("body").hasClass('ngdialog-open') && $(".otherTemp").css('display') != 'block') {
                    screen.unlockOrientation();
                    if (typeof(navigator.app) !== "undefined") {
                        navigator.app.cancelLoadUrl(); // 在 web 页面成功加载之前取消加载
                        navigator.app.backHistory();
                    } else {
                        window.history.back();
                    }
                }
            }
        }
        document.addEventListener("deviceready", openBluetooth, false); //监听设备准备完毕，打开蓝牙
        function openBluetooth() { //打开蓝牙设备
            ble.isEnabled( //每次扫描都检查蓝牙是否打开
                function() {},
                function() {
                    ble.enable(
                        function() {
                            console.log('bluetooth opened!');
                        })
                });
        }
        document.addEventListener("deviceready", onDeviceReady, false);

        function onDeviceReady() {
            ////////////////////////////
            ///监听网络状态/////////////
            ////////////////////////////
            function _networkToastState() { //设备网络状态
                var networkState = navigator.network.connection.type;
                var states = {};
                states[Connection.WIFI] = 'WiFi已连接！';
                states[Connection.UNKNOWN] = '未知连接！';
                states[Connection.ETHERNET] = '以太网已连接！';
                states[Connection.CELL_2G] = '2G信号已连接！';
                states[Connection.CELL_3G] = '3G信号已连接！';
                states[Connection.CELL_4G] = '4G信号已连接！';
                states[Connection.NONE] = '未连接网络！';
                console.log('Connection type: ' + networkState);
                new Toast({
                    context: $('body'),
                    message: states[networkState],
                    time: 3000
                });
                new Toast.init();
                new Toast.show();
            }
            document.addEventListener("offline", function() { //监听断网  
                var networkState = navigator.network.connection.type;
                var states = {};
                states[Connection.NONE] = '未连接网络！';
                new Toast({
                    context: $('body'),
                    message: states[networkState],
                    time: 5000
                });
                new Toast.init();
                new Toast.show();
            }, false); //断网时触发
            document.addEventListener("online", _networkToastState, false); //联网时触发
            ////////////////////////////
            ///监听路由变化/////////////
            ////////////////////////////
            var newUrlGlobal = ""; //全局的跳转目标url
            $rootScope.$on('$locationChangeStart', locationChangeStart); //监听路由开始变化
            // var locationChangeSuccessOff = $rootScope.$on('$locationChangeSuccess', locationChangeSuccess);
            function locationChangeStart(event, newUrl, oldUrl) {
                console.log('页面发生跳转，newUrl：' + newUrl + '  oldUrl' + oldUrl);
                $("#loadingImage").css("display", "none");
                scanResultGlobal.panoId = ""; //每次发生路由变化，都清空历史记录

                function listenNetwork() {
                    // 监听网络情况
                    var networkState = navigator.network.connection.type;
                    if (networkState != Connection.WIFI) {
                        var states = {};
                        //states[Connection.WIFI] = 'WiFi已连接！';
                        states[Connection.UNKNOWN] = '未知连接！';
                        states[Connection.ETHERNET] = '以太网已连接！';
                        states[Connection.CELL_2G] = '2G信号已连接！';
                        states[Connection.CELL_3G] = '3G信号已连接！';
                        states[Connection.CELL_4G] = '4G信号已连接！';
                        states[Connection.NONE] = '未连接网络！';
                        new Toast({
                            context: $('body'),
                            message: states[networkState],
                            time: 5000
                        });
                        new Toast.init();
                        new Toast.show();
                    }; //每次切换页面来判断信号状态
                    // console.log('页面发生跳转  Connection type: ' + networkState);
                }

                function controlBleStatus() {
                    //控制蓝牙的开关情况
                    if (newUrl.indexOf("#/map") > -1) {
                        var sT = setTimeout(function() {
                            if (oldUrl.indexOf("#/location") > -1 && (newUrl.indexOf("#/map?hotId") > -1)) {
                                $(".toggle-button").css('display', 'none');
                                window.localStorage.setItem("bleSwitch", "0"); //关闭蓝牙
                            } else {
                                $(".toggle-button").css('display', '');
                                var bleStatus = window.localStorage.getItem("bleStatus"); //读取蓝牙状态
                                if (bleStatus == null || bleStatus == "on") {
                                    scan();
                                    openBluetooth();
                                }
                                window.localStorage.setItem("bleSwitch", "1");
                            }
                            clearTimeout(sT);
                        }, 500)
                    } else if (newUrl.indexOf("#/location") > -1) {
                        var sT = setTimeout(function() {
                            var bleStatus = window.localStorage.getItem("bleStatus"); //读取蓝牙状态
                            if (bleStatus == null || bleStatus == "on") {
                                openBluetooth();
                                scan();
                            }
                            window.localStorage.setItem("bleSwitch", "1");
                            clearTimeout(sT);
                        }, 500)
                    } else {
                        window.localStorage.setItem("bleSwitch", "0"); //关闭蓝牙
                    }
                }

                function initManySet() {
                    //初始化app设置
                    var playMode = window.localStorage.getItem("playMode");
                    if (playMode == null || playMode == "speaker") { //添加localstorage判断设备播放方式
                        window.localStorage.setItem("playMode", "speaker");
                        AudioToggle.setAudioMode(AudioToggle.NORMAL); //回到正常模式
                    } else {
                        window.localStorage.setItem("playMode", "earpiece");
                        AudioToggle.setAudioMode(AudioToggle.EARPIECE); //用听筒播放音频
                    };
                    var orientation = window.localStorage.getItem("orientation");
                    if (orientation == null || orientation == "off") { //添加localstorage判断设备屏幕方式
                        window.localStorage.setItem("orientation", "off");
                        window.screen.lockOrientation('portrait-primary');
                    } else {
                        window.localStorage.setItem("orientation", "on");
                        window.screen.unlockOrientation();
                    };
                }
                listenNetwork();
                controlBleStatus();
                initManySet();
                newUrlGlobal = newUrl;
            }
            ////////////////////////////
            ////监听设备是否在暂停状态//
            ////////////////////////////
            var bleSwitchHistory;
            document.addEventListener("pause", onPause, false); //当app在后台运行时触发
            function onPause() { //当app在后台运行时触发
                bleSwitchHistory = window.localStorage.getItem("bleSwitch");
                window.localStorage.setItem("bleSwitch", "0");
                console.log('main-onPause')
            }
            document.addEventListener("resume", onResume, false); //当app从后台回来是触发
            function onResume() { //当app从后台回来是触发
                console.log('main-onResume')
                if (newUrlGlobal.indexOf("camera") < 0) { //防止从相机回来的时候，蓝牙扫描会被开启
                    if (bleSwitchHistory == 1) {
                        scan();
                        window.localStorage.setItem("bleSwitch", "1");
                    }
                }
            }
        }
    }])
    ////////////////////////////
    ///监听页面上的close按键////
    ////////////////////////////
    .directive("backView", function($window) {
        return {
            scope: {},
            restrict: 'AE',
            replace: true,
            template: '<a class="backIcon pull-left" ng-click="goBack()"></a> ',
            controller: function($scope, $window) {
                $scope.goBack = function() {
                    var currentUrl = window.location.href;
                    if (currentUrl.indexOf("#/setting") > -1) {
                        var blePage = document.getElementById("correctBleRssi");
                        var updateLog = document.getElementById("updateLogDiv").style.display;
                        //console.log(updateLog);
                        if (blePage) { //判断蓝牙矫正页面是否存在
                            $("#correctBleRssi").remove();
                        } else if (updateLog == "") {
                            $("#updateLogDiv").css('display', 'none');
                        } else {
                            if (typeof(navigator.app) !== "undefined") {
                                navigator.app.cancelLoadUrl(); // 在 web 页面成功加载之前取消加载
                                navigator.app.backHistory();
                            } else {
                                window.history.back();
                            }
                        }
                    } else if (currentUrl.indexOf("#/map") > -1) {} else {
                        if (!$("body").hasClass('ngdialog-open') && $(".otherTemp").css('display') != 'block') {
                            screen.unlockOrientation();
                            if (typeof(navigator.app) !== "undefined") {
                                navigator.app.cancelLoadUrl(); // 在 web 页面成功加载之前取消加载
                                navigator.app.backHistory();
                            } else {
                                window.history.back();
                            }
                        }
                    }
                }
            }
        }
    });
