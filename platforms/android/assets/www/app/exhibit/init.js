angular.module('weatherApp.exhibit', ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/exhibit/:Id?', {
                templateUrl: 'app/exhibit/picDetail.html',
                controller: function($scope, $http, $routeParams, $window) {
                    $("#loadingImage").css("display", "");
                    var exhibitUrl = window.location.href; //获取当前url
                    var n1 = exhibitUrl.length; //地址的总长度
                    var n2 = exhibitUrl.indexOf("id="); //取得=号的位置
                    var exhibitId = exhibitUrl.substr(n2 + 3, n1 - n2); //从=号后面的内容
                    console.log(exhibitId);

                    function getExhibit() {
                        var picDesAudio;
                        $scope.picDetailArray = new Array();
                        $http.get(urlApiTop + "/exhibit/detail?id=" + exhibitId)
                            .success(function(response) {
                                console.log(response)
                                $("#loadingImage").css("display", "none");
                                $(".picDetail,.picFooter").css('display', '');
                                $scope.picDetailArray = response;
                                $(".picImage").attr('data-original', response.thumbnail);
                                if (response.voice !== undefined) { //判断是否有音频解说
                                    $(".picAudio").html('<img src="img/svg/play.svg">');
                                    $(".picPlusCon").append('<audio id="picDesAudio" src="' + response.voice + '" preload></audio>');
                                    listenAudio();
                                } else {
                                    $(".picAudio").html('<img src="img/svg/nosound.svg">');
                                }
                                console.log(response.voice);
                                var hDescribe = document.querySelector('.picDetail').offsetHeight - document.querySelector('.picImageDiv').offsetHeight - 72 - 46;
                                $(".picDescribe").css('max-height', hDescribe + "px");
                                $(".picDescribe").html(response.description); //展品详情
                                $('img.picImage').lazyload();
                                var hDescribe1 = document.querySelector('.picDescribe').offsetHeight;
                                console.log(hDescribe1);
                                if (hDescribe1 < 200) {
                                    $(".picDescLine").css('height', hDescribe1 + "px");
                                }
                            })
                            .error(function(error) { //加载失败的话触发下面代码
                                httpErrorTip(error); 
                                var exhibitOnline = function() { //帮助页恢复网络
                                    console.log("exhibit");
                                    getExhibit();
                                }
                                document.addEventListener("online", exhibitOnline, false); //联网时触发
                                $scope.$on('$routeChangeStart', function() { //监听路由变化，跳出页面时触发
                                    console.log("exhibitremove");
                                    document.removeEventListener("online", exhibitOnline, false);
                                })
                            });
                    }
                    getExhibit();

                    var audioStatus = "pause";

                    function listenAudio() {//监听Audio
                        var picDesAudio = document.getElementById("picDesAudio");
                        picDesAudio.addEventListener("play", function() { //监听开始播放
                            $(".picAudio img").attr('src', 'img/svg/pause.svg');
                            audioStatus = "play";
                            console.log("音频播放状态：play");
                        });
                        picDesAudio.addEventListener("ended", function() { //监听开始播放
                            var gotoPlay = setTimeout(function() {
                                $(".picAudio img").attr('src', 'img/svg/play.svg');
                                audioStatus = "pause";
                                clearTimeout(gotoPlay);
                            }, 1000)
                            $(".picAudio img").attr('src', 'img/svg/stop.svg');
                            audioStatus = "pause";
                            console.log("音频播放状态：ended");
                        });
                        picDesAudio.addEventListener("pause", function() { //监听开始播放
                            $(".picAudio img").attr('src', 'img/svg/play.svg');
                            audioStatus = "pause";
                            console.log("音频播放状态：pause");
                        });
                        touch.on(".picAudio", "tap doubletap", function(ev) { //百度touch.js中的单击和双击事件
                            if (audioStatus == "pause") {
                                picDesAudio.play();
                            } else {
                                picDesAudio.pause();
                            }
                        })
                    }
                    ////////////监听设备的暂停，音量加减///////////////////////////////////////////
                    document.addEventListener("deviceready", function() { //监听设备准备就绪
                        document.addEventListener("pause", onPause, false); //当app在后台运行时触发
                        function onPause() { //当app在后台运行时触发
                            if (audioStatus == "play") {
                                picDesAudio.pause();
                            }
                            console.log("exhibit-onpause")
                        }
                        $scope.$on('$routeChangeStart', function() { //监听路由变化，跳出页面时触发
                            console.log("routeChangeStart")
                            document.removeEventListener("pause", onPause, false);
                        })
                    }, false);
                }
            })
            .when('/bigImage/:Id?', {
                templateUrl: 'app/exhibit/bigImage.html',
                controller: function($scope, $http, $routeParams, $window) {
                    $("#loadingImage").css("display", "");
                    var exhibitUrl = window.location.href; //获取当前url
                    var n1 = exhibitUrl.length; //地址的总长度
                    var n2 = exhibitUrl.indexOf("id="); //取得=号的位置
                    var exhibitId = exhibitUrl.substr(n2 + 3, n1 - n2); //从=号后面的内容
                    console.log(exhibitId);

                    function getbigImage() {
                        var items = new Array(); //多媒体数据数组
                        // exhibitIdfromPicture = $routeParams.Id;
                        $http.get(urlApiTop + "/exhibit/detail?id=" + exhibitId)
                            .success(function(response) {
                                console.log(response)
                                $("#loadingImage").css("display", "none");
                                var itemsTemp = new Array();
                                itemsTemp = response;
                                items[0] = {
                                    "src": "",
                                    "h": "",
                                    "w": ""
                                };
                                items[0].src = itemsTemp.images;
                                items[0].h = itemsTemp.imagesLength;
                                items[0].w = itemsTemp.imagesWidth;
                                openPhotoSwipe(items); //定义图框   
                            })
                            .error(function(error) { //加载失败的话触发下面代码
                                httpErrorTip(error);
                                var bigImageOnline = function() { //帮助页恢复网络
                                    console.log("bigImage");
                                    getbigImage();
                                }
                                document.addEventListener("online", bigImageOnline, false); //联网时触发
                                $scope.$on('$routeChangeStart', function() { //监听路由变化，跳出页面时触发
                                    console.log("bigImageremove");
                                    document.removeEventListener("online", bigImageOnline, false);
                                })
                            });
                    }
                    getbigImage();
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
                        var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
                        gallery.init(); //首次打开画廊时，加载对应信息
                        // pswp.applyZoomPan(1, 0, 0);
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
    })
