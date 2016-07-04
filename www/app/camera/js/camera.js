angular.module('weatherApp.camera', ['ngCordova', 'ngDialog'])
    .controller('photoCtrl', photoCtrl) //camera页面的controller
    .directive("takePhoto", takePhoto) //拍照按钮
    .factory('getWeatherData', getWeatherData); //请求天气数据 

// 导航菜单中实现camera拍照
function takePhoto() {
    return {
        restrict: 'A',
        controller: function($scope, $element, $location, $cordovaCamera, getWeatherData) {
            $element.bind('click', function() {
                //cordova camera options 
                var options = {
                    quality: 100,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    destinationType: Camera.DestinationType.FILE_URL,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 1000,
                    targetHeight: 2000,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false,
                    correctOrientation: true
                };

                var weatherData = new getWeatherData(); // 天气数据
                // cordova camera 拍照成功
                $cordovaCamera.getPicture(options).then(function(imageData) {
                    $location.path('/camera').search({ weatherInfo: weatherData }).hash(imageData);
                }, function(error) {
                    console.log('拍照未成功！')
                });
            })
        }
    }
}

function photoCtrl($scope, ngDialog, $location, getWeatherData, $cordovaFile) {
    $scope.$on('$routeChangeSuccess', function() {
        $scope.checkImgMerged = false; //隐藏保存框
        //加载失败的话触发下面代码  
        var getData = function() {
            if (!$scope._getLineData) // online后仅请求一次数据
                _weatherInfo = new getWeatherData(); // 天气数据 
            setTimeout(function() {
                isWeatherInfo(_weatherInfo); //判断是否请求到数据
                initImg(); //计算canvas的大小
            }, 1000);
            $scope._getLineData = true;
        }

        var _weatherInfo = $location.search().weatherInfo;
        isWeatherInfo(_weatherInfo);

        function isWeatherInfo(obj) { //判断是否请求到数据
            if (_weatherInfo.weatherAutostations) {
                $scope.createWeatherCanvas(_weatherInfo); //创建天气水印层    
            } else {
                document.addEventListener("online", getData, false);
                $scope._getLineData = false;
            }
        }
        //加载照片
        var content = canvas.getContext('2d');
        var image = new Image();

        function initImg() {
            //加载照片到camera页面
            var wImage = image.width,
                hImage = image.height,
                wDom = document.querySelector('.content').offsetWidth,
                hDom = document.querySelector('.content').offsetHeight;
            var wRatio = wImage / wDom,
                hRatio = hImage / hDom;
            (wRatio > hRatio) ? (ratio = wRatio) : (ratio = hRatio);
            //图片的显示宽高
            var _w = (wImage / ratio).toFixed(2), //保留两位小数
                _h = (hImage / ratio).toFixed(2);
            canvas.style.width = _w + "px";
            canvas.style.height = _h + "px";
            canvas.style.marginLeft = -_w / 2 + "px";
            canvas.style.marginTop = -_h / 2 + "px";
            if ($("#weatherCanvas").length > 0) { //若存在水印层，则初始化水印层大小 
                var weatherCanvasArea = _w * _h / 8;
                var canvasX1 = Math.sqrt(weatherCanvasArea / (91 / 57));
                $("#weatherCanvas").css('width', parseInt(canvasX1 * 91 / 57) + "px");
                $("#weatherCanvas").css('height', parseInt(canvasX1) + "px");
                $("#weatherCanvas").css('left', canvas.offsetLeft + 10 + "px");
                $("#weatherCanvas").css('top', canvas.offsetTop + 10 + "px");
            }
            if (!$scope.isLoad) {
                //canvas的宽高  
                canvas.width = wImage;
                canvas.height = hImage;
                content.drawImage(image, 0, 0)
                $scope.isLoad = true;
            }
        }

        image.onload = function() {
            initImg();
        };
        image.src = $location.hash();
        var orientationChange = function() { //监听屏幕旋转                    
            var setTime = setTimeout(function() { //重新加载页面和广告页面
                initImg();
            }, 200)
        }
        window.addEventListener("orientationchange", orientationChange, false); //监听屏幕旋转

        $scope.$on('$routeChangeStart', function() { //监听路由变化，跳出页面时触发
            document.removeEventListener("online", getData, false);
            window.removeEventListener("orientationchange", orientationChange, false);
        })

    });
    //创建weatherCanvas水印
    $scope.createWeatherCanvas = function(weatherObj) {
            var autoStation, tempe, Weather, tempeHi, tempeLo, unitLength, hlLength, hlUnitLength;
            autoStation = weatherObj.weatherAutostations; //地点
            Weather = weatherObj.weatherForecastsWeather; //天气
            tempe = parseFloat(autoStation.tempe).toFixed(1); //气温值保留一位小数
            tempeHi = Math.ceil(weatherObj.weatherForecastsTempHi); //最高气温
            tempeLo = Math.ceil(weatherObj.weatherForecastsTempLo); //最低气温
            var tempeLength = tempe.toString().length;
            unitLength = tempeLength * 135; //气温的单位坐标
            // console.log('tempeLength' + tempeLength);
            var tempeHiLength = tempeHi.toString().length;
           //console.log('tempeHiLength' + tempeHiLength);
            hlLength = unitLength + 150 + tempeHiLength * 65; //最高低气温的坐标
            hlUnitLength = hlLength + 80; //最高低气温的单位坐标
            //创建Dom
            var newCanvas = document.createElement('canvas');
            newCanvas.id = "weatherCanvas";
            newCanvas.height = "570";
            newCanvas.width = "910";
            newCanvas.style.position = "absolute";
            $("#contentHolder").append(newCanvas);
            //往canvas中填充内容
            if (newCanvas.getContext) {
                //获取对应的CanvasRenderingContext2D对象(画笔)
                var ctx1 = newCanvas.getContext("2d");
                //设置字体填充颜色
                ctx1.fillStyle = "#fff";
                //阴影
                ctx1.shadowOffsetX = 5; // 阴影Y轴偏移
                ctx1.shadowOffsetY = 5; // 阴影X轴偏移
                ctx1.shadowBlur = 4; // 模糊尺寸
                ctx1.shadowColor = 'rgba(0, 0, 0, 0.5)'; // 颜色
                //实时温度
                ctx1.font = "280px SimHei";
                ctx1.textBaseline = "middle";
                ctx1.fillText(tempe, 0, 120);
                ctx1.font = "130px SimHei";
                ctx1.fillText("℃", unitLength, 170);
                //最高温和最低温
                ctx1.font = "100px SimHei";
                ctx1.textAlign = "end";
                ctx1.fillText(tempeHi, hlLength, 60);
                ctx1.fillText(tempeLo, hlLength, 170);
                //温度符号
                ctx1.font = "80px SimHei ";
                ctx1.textAlign = "end";
                ctx1.fillText("℃", hlUnitLength, 70);
                ctx1.fillText("℃", hlUnitLength, 180);
                //下半部分三行数据
                ctx1.textAlign = "start";
                ctx1.font = "100px SimHei ";
                ctx1.fillText(Weather, 10, 300); //天气情况
                ctx1.fillText("上海气象博物馆" + "", 10, 410); //地点
                ctx1.fillText(autoStation.datetime, 10, 520); //发布时间
            }
            // 天气信息canvas位置任意移动
            var watermarkCanvas = document.getElementById("weatherCanvas");
            if (watermarkCanvas) {
                watermarkCanvas.addEventListener('touchstart', touchStart, false);
                watermarkCanvas.addEventListener('touchmove', touchMove, false);
                // watermarkCanvas.addEventListener("touchend", touchEnd, false);
            }

            function touchStart(event) {
                event.preventDefault();
                event.stopPropagation();
                var touch = event.touches[0];
                var wLeft = watermarkCanvas.offsetLeft,
                    wTop = watermarkCanvas.offsetTop;
                startY = touch.pageY - wTop;
                startX = touch.pageX - wLeft;
            };

            function touchMove(event) {
                event.preventDefault();
                event.stopPropagation();
                var _e = event.targetTouches.length;
                if (_e == 1) {
                    var touch = event.targetTouches[0];
                    var _top = touch.pageY - startY,
                        _left = touch.pageX - startX;
                    if (_left > canvas.offsetLeft && _left + watermarkCanvas.offsetWidth < canvas.offsetWidth + canvas.offsetLeft) {
                        watermarkCanvas.style.left = _left + 'px';
                    }
                    if (_top > canvas.offsetTop && _top + watermarkCanvas.offsetHeight < canvas.offsetHeight + canvas.offsetTop) {
                        watermarkCanvas.style.top = _top + 'px';
                    }
                }
            };
        }
        // 检测手机中是否有Pictures目录，无则创建该目录
    document.addEventListener("deviceready", onDeviceReady);

    function onDeviceReady() {
        $cordovaFile.checkDir(cordova.file.externalRootDirectory, "Pictures")
            .then(function(success) {
                console.log(success);
                console.log("has picDir");
            }, function(error) {
                // CREATE
                $cordovaFile.createDir(cordova.file.externalRootDirectory, "Pictures", false).then(function(success) {
                    console.log(success);
                    console.log("CREATE picDir");
                });
            });

    }

    // 当camera页面中有弹框时，利用返回键关闭
    document.addEventListener("backbutton", onBackKeyDown, false);

    function onBackKeyDown(e) {
        //页面上若有ngdialog，单击返回键关闭窗口
        if ($("body").hasClass('ngdialog-open')) {
            e.preventDefault();
            ngDialog.close();
        }
    }


    // 将图片分享到微博
    $scope.shareWeibo = function() {
        window.plugins.socialsharing.shareVia('com.sina.weibo', '分享来自上海气象博物馆。', null, $scope.$parent.picture.src, null, function() {
            console.log('share ok')
        }, function(msg) {
            new Toast({
                context: $('body'),
                message: '未能分享成功，请确保已安装该应用'
            });
            new Toast.init();
            new Toast.show();
        });

    };
    // 将图片分享到微博
    $scope.shareQQ = function() {

        window.plugins.socialsharing.shareVia('com.tencent.mobileqq', '分享来自上海气象博物馆。', null, $scope.$parent.picture.src, null, function() {
            console.log('share ok')
        }, function(msg) {
            new Toast({
                context: $('body'),
                message: '未能分享成功，请确保已安装该应用'
            });
            new Toast.init();
            new Toast.show();

        });

    };
    // 通过电邮分享图片
    $scope.shareMail = function() {
        window.plugins.socialsharing.shareViaEmail(
            'Message', // can contain HTML tags, but support on Android is rather limited:  http://stackoverflow.com/questions/15136480/how-to-send-html-content-with-image-through-android-default-email-client
            'Subject',
            null, // TO: must be null or an array
            null, // CC: must be null or an array
            null, // BCC: must be null or an array
            [$scope.$parent.picture.src],
            function() {
                console.log('share ok')
            },
            function(errormsg) {
                new Toast({
                    context: $('body'),
                    message: '未能分享成功，请确保已安装该应用'
                });
                new Toast.init();
                new Toast.show();
            });
    };


    // 将图片分享到微信朋友圈
    $scope.shareMoments = function() {

        window.plugins.socialsharing.shareVia('com.tencent.mm/com.tencent.mm.ui.tools.ShareToTimeLineUI', '分享来自上海气象博物馆。', null, $scope.$parent.picture.src, null, function() {
            console.log('share ok')
        }, function(msg) {
            new Toast({
                context: $('body'),
                message: '未能分享成功，请确保已安装该应用'
            });
            new Toast.init();
            new Toast.show();
        });
    };

    // 将图片分享到微信
    $scope.shareWechat = function() {
        window.plugins.socialsharing.shareVia('com.tencent.mm/com.tencent.mm.ui.tools.ShareImgUI', '分享来自上海气象博物馆。', null, $scope.$parent.picture.src, null, function() {
            console.log('share ok')
        }, function(msg) {
            new Toast({
                context: $('body'),
                message: '未能分享成功，请确保已安装该应用'
            });
            new Toast.init();
            new Toast.show();
        });
    };

}

//请求天气数据
function getWeatherData($http) {
    function _getWeatherData() {
        var weatherObj = {}; //天气数据obj
        var _weatherAutostationsUrl = 'http://61.152.122.112:8080/api/v1/auto_stations?appid=bFLKk0uV7IZvzcBoWJ1j&appkey=mXwnhDkYIG6S9iOyqsAW7vPVQ5ZxBe',
            _weatherForecastsUrl = 'http://61.152.122.112:8080/api/v1/weather_forecasts/today?appid=iUnghyaCG1sbQxVwqm7f&appkey=RrU7HfOEJNFZDIkgC3Y9VdlSoqht8s';　　
        $http.get(_weatherAutostationsUrl, {
            headers: {
                'Accept': 'application/json'
            }
        }).success(function(_data) {
            for (var k in _data.data) {
                if (_data.data[k].name === '徐家汇公园') {
                    weatherObj.weatherAutostations = _data.data[k];
                }
            }
            console.log('http');　　
        }).error(function() {
            console.log('error');　
        });
        $http.get(_weatherForecastsUrl, {
            headers: {
                'Accept': 'application/json'
            }
        }).success(function(_data) {
            weatherObj.weatherForecastsWeather = _data.data.weather || '';
            var _weatherForecastsTemp = _data.data.tempe;
            var a = _weatherForecastsTemp.indexOf('~');
            var aa = _weatherForecastsTemp.indexOf('℃');
            weatherObj.weatherForecastsTempHi = _weatherForecastsTemp.substring(a + 1, aa) || ''; //最高气温
            weatherObj.weatherForecastsTempLo = _weatherForecastsTemp.substring(0, a) || ''; //最低气温
            console.log('http' + _data.data.datatime);　　
        }).error(function() {
            console.log('error');　　
        });
        return weatherObj;
    }
    return _getWeatherData;
}
