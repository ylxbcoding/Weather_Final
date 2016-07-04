angular.module('weatherApp.robot', [
        'ngRoute'
    ])
    .config(function($routeProvider) {
        $routeProvider
            .when('/robot', {
                templateUrl: 'app/robot/index.html',
                controller: function($scope, $http) {
                    $("#loadingImage").css("display", "none");
                    //定义全局变量
                    var appkey = "qxj_NGcOVxT8eglV",
                        appsecret = "adPWJPRDSTAbKlHvCo8J",
                        userId = device.uuid, //用于区别用户
                        XAuthStr = "",
                        access_token, //百度api连接令牌
                        isLoaded = true, //是不是已经加载完毕
                        mediaRec,
                        recog_src = "qxj_Chat.wav",
                        chatNumber = 0; //用于显示当前对话
                    function newRec() { //实例化录音类
                        var src = recog_src //"rtmp://vcloud.xiaoi.com/recog.do?key=qxj_NGcOVxT8eglV&secret=adPWJPRDSTAbKlHvCo8J&userId=" + userId "; //定义录音文件保存名称及位置（现在默认保存在根目录）需要创建单独文件夹，保存相关文件
                        mediaRec = new Media(src, //实例化录音类
                            function() {
                                //console.log("实例化录音类"); // 成功实例化后执行函数
                            },
                            function(err) {
                                var useTip = "我没听懂，请重试！";
                                $("#talkContent").append('<div class="chatContent"><div class="chatCon chatConLeft">' + useTip + '</div><div class="chatHorn chatLeft"></div></div>');
                                // $("#talkContent").append("<div class='chatContent' style='float: left;'>" + useTip + "</div>");
                                baidusynth(useTip);
                                console.log("录音错误: " + err.code); // 录音失败执行函数
                                mediaRec.release();
                            },
                            function(mediaStatus) { //执行状态
                                if (mediaStatus == 1) { //开始录音（加载中）
                                    console.log("开始录音（加载中）");
                                }
                                if (mediaStatus == 2) { //正在录音
                                    console.log("正在录音");
                                    // $("#recordBtn").html("松开 停止");
                                    $(".xiaoiApiLoading").css({ "display": '' });
                                    $(".xiaoiApiLoading").html("倾听着...");
                                    // $("#recordBtn").addClass("robotRecording");
                                    // $("#recordBtn").removeClass("robotRecord");
                                    isLoaded = false;
                                    //$("#robotImage").html("<img src='img/robot/robot-2.png' />"); //录音界面
                                }
                                if (mediaStatus == 3) { //暂停录音
                                    console.log("暂停录音");
                                    // $(".xiaoiApiLoading").css({ "display": 'none' });
                                    // xiaoiRecog(); //调用语音识别方法
                                    // $("#robotImage").html("<img src='img/robot/robot-3.png' />"); //停止界面
                                }
                                if (mediaStatus == 4) { //结束录音
                                    console.log("结束录音");
                                    // $("#recordBtn").removeClass("robotRecording");
                                    // $("#recordBtn").addClass("robotRecord");
                                    // $("#recordBtn").html("按住 说话");
                                    $(".xiaoiApiLoading").css({ "display": 'none' });
                                    xiaoiRecog(); //调用语音识别方法
                                }
                            }
                        );

                    }

                    var sha1Signed = function() { //小i机器人签名加密过程
                        var enchars = "abcdefghijklmnopqrstuvwxyz0123456789",
                            realm = "xiaoi.com",
                            method = "POST",
                            uri = "/ask.do",
                            nonce = "";
                        for (i = 0; i < 40; i++) { //生成40位随机数  nonce
                            var index = Math.floor(Math.random() * 26);
                            nonce += enchars.charAt(index);
                        };
                        var HA1 = hex_sha1(appkey + ":" + realm + ":" + appsecret); //加密步骤1
                        var HA2 = hex_sha1(method + ":" + uri); //加密步骤2
                        var HA3 = hex_sha1(HA1 + ":" + nonce + ":" + HA2); //加密步骤3
                        XAuthStr = 'app_key="' + appkey + '", nonce="' + nonce + '", signature="' + HA3 + '"';
                    }
                    var useBaiduApi = function() { //链接百度语音api返回access_token的值
                        var url = "https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=lqvvbaMqQLsSaYgRD3bIkGbP&client_secret=4f30fe719ecc10eb00e22634d913923e";
                        $http.post(url).success(function(msg) { //连接api，验证身份
                            var token = msg.access_token;
                            if (token != "") {
                                access_token = msg.access_token;
                                console.log("百度api调用成功，access_token有值");
                                console.log(JSON.stringify(msg));
                                firstUseTip();
                            } else {
                                console.log("百度api调用成功，url参数错误");
                                console.log(JSON.stringify(msg));
                            }　
                        }).error(function(e) { //重新调用语音接口
                            var loaded = false; //限制代码只执行一次
                            var robotOnline = function() { //语音页恢复网络
                                console.log("robot");
                                if (!loaded) {
                                    useBaiduApi();
                                    loaded = true;
                                }
                            }
                            document.addEventListener("online", robotOnline, false); //联网时触发
                            $scope.$on('$routeChangeStart', function() { //监听路由变化，跳出页面时触发
                                console.log("robotremove");
                                document.removeEventListener("online", robotOnline, false);
                            })
                            console.log("百度api调用失败");
                            console.log(JSON.stringify(e));
                        });
                    }
                    var firstUseTip = function() { //首次进入页面，加载提示语
                        var useTip = "您好，我是上海气象机器人！您可以按住屏幕下方的按钮，向我提问，查询城市的天气和气象知识！";
                        // $("#talkContent").append("<div class='chatContent' style='float: left;'>" + useTip + "</div>");
                        $("#talkContent").append('<div class="chatContent"><div class="chatCon chatConLeft">' + useTip + '</div><div class="chatHorn chatLeft"></div></div>');
                        baidusynth(useTip);
                    }
                    var xiaoiRecog = function() { //语音识别模块
                        $(".xiaoiApiLoading").css({ "display": '' });
                        $(".xiaoiApiLoading").html("思考中...");
                        chatNumber++;
                        // 显式上传
                        var readFile = function() { //应用cordova-plugin-file-transfer插件上传音频文件给api接口
                            //var fileURL = "file:///storage/emulated/0/" + recog_src; //音频地址
                            var fileURL = cordova.file.externalRootDirectory + recog_src; //音频地址
                            function win(r) { //成功回调函数
                                console.log("Code = " + r.responseCode);
                                console.log("Response = " + r.response);
                                console.log("Sent = " + r.bytesSent);
                                var question = r.response;
                                // $("#talkContent").append("<div class='chatContent chatContentRight'>" + question + "</div>");
                                $("#talkContent").append('<div class="chatContentRight"><div class="chatCon chatConRight">' + question + ' </div><div class="chatHorn chatRight"></div></div>');
                                xiaoiAsk(XAuthStr, question, userId, "weixin", 0);
                            }

                            function fail(error) { //失败回调函数
                                isLoaded = true;
                                $(".xiaoiApiLoading").html("请检查网络！");
                                console.log("An error has occurred: Code = " + error.code);
                                console.log("upload error source " + error.source);
                                console.log("upload error target " + error.target);
                            }
                            //目标api地址
                            var uri = encodeURI("http://vcloud.xiaoi.com/recog.do?secret=adPWJPRDSTAbKlHvCo8J&key=qxj_NGcOVxT8eglV");
                            //上传参数
                            var options = new FileUploadOptions();
                            options.fileKey = "audio";
                            options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                            options.mimeType = "audio/x-wav";
                            options.httpMethod = "POST";
                            //请求头
                            var headers = {
                                "content-Type": "application/audio",
                                  
                                "X-AUE": "amr",
                                "X-TXE": "utf-8",
                                "X-AUF": "audio/L16;rate=8000"
                            };
                            options.headers = headers;
                            var ft = new FileTransfer();
                            //调用请求方法
                            ft.upload(fileURL, uri, win, fail, options);
                        }
                        readFile();
                    };
                    var xiaoiAsk = function(XAuthStr, question, userId, platform, askType) { //智能问答模块
                        if (XAuthStr != "" && !leaveRobot) {
                            $.ajax({
                                url: 'http://www.weather-huayun.com/ask.do?platform=' + platform,
                                type: "POST",
                                dataType: "text",
                                async: false,
                                data: {
                                    "question": question,
                                    "userId": userId,
                                    "type": askType
                                },
                                success: function(data) {
                                    var askContent = data; //回答的内容
                                    var writeHtml = "";
                                    var arr = new Array();
                                    if (askContent.indexOf("级级") > -1) { //接口回复的答案会出现多个级的情况
                                        arr = askContent.split("级级");
                                    } else {
                                        arr = askContent.split("级");
                                    }
                                    if (arr.length > 3) { //大于三天气象信息
                                        for (var i = 0, length1 = arr.length - 1; i < length1; i++) {
                                            writeHtml += arr[i] + "级<br/>";
                                        }
                                        // '<div id="chat '+ chatNumber + '" class="chatContent"><div class="chatCon chatConLeft">' + writeHtml + '</div><div class="chatHorn chatLeft"></div></div>'
                                        $("#talkContent").append('<div id="chat' + chatNumber + '" class="chatContent"><div class="chatCon chatConLeft">' + writeHtml + '</div><div class="chatHorn chatLeft"></div></div>');
                                        // $("#talkContent").append("<div id='chat" + chatNumber + "' class='chatContent' style='float: left;'>" + writeHtml + "</div>");
                                        if (askContent.indexOf("级级") > -1) {
                                            var askContent1 = askContent.replace(/级级/g, "级");
                                            baidusynth(askContent1, "tooLong");
                                        } else {
                                            baidusynth(askContent, "tooLong");
                                        }
                                    } else {
                                        writeHtml = data;
                                        baidusynth(askContent); //调用语音合成模块
                                        $("#talkContent").append('<div id="chat' + chatNumber + '" class="chatContent"><div class="chatCon chatConLeft">' + writeHtml + '</div><div class="chatHorn chatLeft"></div></div>');
                                    }
                                    // console.log(data);
                                    document.getElementById("chat" + chatNumber).scrollIntoView(); //定位文字
                                },
                                error: function(xhr, status, e) {
                                    var errCode = xhr.status;
                                    if (errCode == 401)
                                        console.log("身份认证失败，权限不足！", "error");
                                    else
                                        console.log("服务器内部错误！", "error");
                                },
                                headers: {
                                    "X-Auth": XAuthStr
                                }
                            });
                        }
                    };
                    var isPlaying = false;
                    var leaveRobot = false; //用于判断是否离开当前页面
                    var synthAudio = document.getElementById("synthAudio"); //声明全局的audio对象
                    var baidusynth = function(askContent, tooLong) { //百度语音合成模块
                        if (!leaveRobot) {
                            if (!tooLong) {
                                synthAudio.src = "http://tsn.baidu.com/text2audio?tex=" +
                                    askContent + "&lan=zh&cuid=" + userId + "&ctp=1&tok=" + access_token; //生成audio标签的内容
                                synthAudio.load();
                                console.log('执行播放');
                                synthAudio.play();
                            } else {
                                var divId = 'chat' + chatNumber;
                                var audioHtml = "<audio controls id='audio" + chatNumber + "'preload='auto' style='width:100%' src='http://tsn.baidu.com/text2audio?tex=" +
                                    askContent + "&lan=zh&cuid=" + userId + "&ctp=1&tok=" + access_token + "'></audio>"
                                $("#" + divId).prepend(audioHtml);
                                document.getElementById("audio" + chatNumber).addEventListener("play", function() { //监听开始播放
                                    isPlaying = true;
                                    console.log("音频播放状态：play");
                                });
                                document.getElementById("audio" + chatNumber).addEventListener("ended", function() { //监听开始播放
                                    isPlaying = false;
                                    $(".xiaoiApiLoading").css('display', 'none');
                                    console.log("音频播放状态：ended");
                                });
                                document.getElementById("audio" + chatNumber).addEventListener("pause", function() { //监听开始播放
                                    isPlaying = false;
                                    $(".xiaoiApiLoading").css('display', 'none');
                                    console.log("音频播放状态：pause");
                                });
                            }
                            isLoaded = true;
                            $(".xiaoiApiLoading").css({ "display": 'none' });
                        }
                    }
                    newRec(); //实例化录音类
                    sha1Signed();
                    useBaiduApi();
                    touch.on("#recordBtn", "tap doubletap", function(ev) { //百度touch.js中的单击和双击事件
                        // $("#recordBtn").html("时间太短，请重试！");
                        $(".xiaoiApiLoading").css({ "display": '' });
                        $(".xiaoiApiLoading").html("时间太短，请重试！");
                    })
                    touch.on("#recordBtn", "touchstart", function(ev) { //touchstart事件
                    })
                    touch.on("#recordBtn", "hold", function(ev) { //百度touch.js中的hold事件，默认650ms触发
                        if (!isPlaying) { //正在播放语音
                            if (isLoaded) {
                                synthAudio.pause();
                                mediaRec.startRecord(); //开始录音
                                var www = setTimeout(function() {
                                    mediaRec.stopRecord(); //30s后结束录音
                                    clearTimeout(www);
                                }, 30 * 1000);
                            } else {
                                $(".xiaoiApiLoading").html("正在思考中，请稍等！");
                            }
                        } else {
                            $(".xiaoiApiLoading").css('display', '');
                            $(".xiaoiApiLoading").html("请先暂停正在播放的语音，再重试！");
                        }
                    })
                    touch.on("#recordBtn", "touchend", function(ev) { //touchend事件
                        var ww = setTimeout(function() {
                            mediaRec.stopRecord(); //结束录音
                            clearTimeout(ww);
                        }, 200);
                    });
                    document.getElementById("recordBtn").addEventListener('touchmove', function(event) {
                        event.preventDefault();
                    }, false);
                    ////////////监听设备的暂停，音量加减/////////////////////////////////////
                    document.addEventListener("deviceready", function() { //监听设备准备就绪
                        document.addEventListener("pause", onPause, false); //当app在后台运行时触发
                        function onPause() { //当app在后台运行时触发
                            synthAudio.pause();
                            leaveRobot = true;
                            console.log("robot-onpause")
                        }
                        document.addEventListener("resume", onResume, false); //当app从后台回来是触发
                        function onResume() { //当app从后台回来是触发
                            leaveRobot = false;
                        }
                        $scope.$on('$routeChangeStart', function() { //监听路由变化，跳出页面时触发
                            leaveRobot = true;
                            console.log("routeChangeStart")
                            document.removeEventListener("pause", onPause, false);
                        })
                    }, false);
                }
            })
    })
