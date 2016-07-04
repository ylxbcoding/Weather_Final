angular.module('weatherApp.index', [
        'ngRoute'
    ])
    .config(function($routeProvider) {
        $routeProvider
        // .when('/index', {
        //     templateUrl: 'app/index/index.html',
        //     controller: function($scope, $http, $routeParams, $window) {

        //         /////根据屏幕大小进行布局/////////////////////////////////////////////////////
        //         var wRow_ = document.querySelector('.row_1').offsetWidth;
        //         $(".row_1,.row_2,.row_3").css({ 'height': wRow_ + "px", 'line-height': wRow_ + "px" });

        //         /////监听按键//////////////////////////////////////////////////////////
        //         touch.on('.urlToPic', 'tap', function() { //图墙
        //             window.location.href = "#/picture";
        //         });
        //         touch.on('.urlToPano', 'tap', function() { //全景
        //             window.location.href = "#/map";
        //         });
        //         touch.on('.urlToLoc', 'tap', function() { //平面
        //             window.location.href = "#/location";
        //         });
        //         touch.on('.urlToRobot', 'tap', function() { //语音
        //             window.location.href = "#/robot";
        //         });
        //         touch.on('.urlToScan', 'tap', function() { //扫一扫
        //             window.location.href = "#/help";
        //         });
        //         // $scope.goSetting = function() {
        //         //     window.location.href = "#/setting";
        //         // }

        //         // touch.on('.settingIcon', 'tap', function() { //扫一扫
        //         //     window.location.href = "#/setting";
        //         // });
        //         touch.on('.backWelcome', 'tap', function() { //扫一扫
        //             localStorage.setItem("welcome", "");
        //             window.location.href = "#/welcome";

        //         });
        //         touch.on('.exitApp', 'tap', function() { //扫一扫
        //             navigator.app.exitApp();
        //         });
        //         localStorage.setItem("welcome", "visited");

        //     }
        // })

            .when('/welcome', { //跳转到index.html，还没进入index.html/#index
                templateUrl: 'app/index/welcome.html',
                controller: function($scope) {

                    // var hDom = document.querySelector('#welcomeContent').offsetHeight;
                    // console.log("hDom" + hDom);
                    // $(".welcomeBg").css('height', hDom + "px");
                    $("#loadingImage").css("display", "none");
                    ////判断是不是第一次进入页面
                    // var welcome = localStorage.getItem("welcome");
                    // if (welcome == "visited") {
                    //     var loadIndex = setTimeout(function() {
                    //         window.location.href = "#/index";
                    //         clearTimeout(loadIndex);
                    //     }, 200)

                    $scope.$on('$routeChangeSuccess', function(e, newurl, oldurl) { //监听路由变化,跳进页面时触发
                        var oldUrl = oldurl.loadedTemplateUrl; //赋值来源url
                        if (oldUrl != "app/map/index.html") {
                            document.addEventListener("deviceready", function() {
                                console.log(oldUrl);
                                updateApp(); //版本自动更新
                            }, false);
                        }
                    })

                    // } else {
                    //     $(".welcomePage").css("display", "");
                    // document.addEventListener("deviceready", function() {
                    //     updateApp(); //版本自动更新
                    // }, false);


                    touch.on(".enterLogo", "tap", function() { //立即体验按钮
                        window.location.href = "#/map";
                        // localStorage.setItem("welcome", "visited");
                    });
                    // }
                    $("#menu").css("display", "");
                }
            })
            .otherwise({
                redirectTo: '/welcome'
            })
    })
