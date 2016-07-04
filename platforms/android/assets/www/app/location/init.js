angular.module('weatherApp.location', [
        'ngRoute'
    ])
    .config(function($routeProvider) {
        $routeProvider
            .when('/location/:exhibitId?', {
                templateUrl: 'app/location/index.html',
                controller: function($scope, $http, $routeParams, $window) {
                    var _exhibitId = $routeParams.exhibitId; //展品页面跳转过来的的参数
                    var img, //加载的图片变量
                        myScroll, //初始化iscroll           
                        time1; //定时器获取我的位置的相关数据 
                    var backgroundimg = document.getElementById("map"); //平面图图片
                    var planetmap = document.getElementById("planetmap");
                    var myLocation = document.getElementById("myLocation"); //我的位置
                    var myexhibit = document.getElementById("exhibit"); //当前展品
                    //summary: 竖屏的意思就是：宽不变高压缩，竖向平移,横屏的意思是，高不变宽压缩，水平平移
                    document.addEventListener("deviceready", function() {
                        //横竖屏切换监听
                        window.addEventListener("orientationchange", function() {
                            if (window.localStorage.getItem('orientation') == "on") {
                                console.log("chongzai");
                                window.location.reload();
                            }
                        });
                    }, false);
                    $scope.$on('$routeChangeSuccess', function() {

                        $("#loadingImage").css("display", "");
                        console.log("获取得到的展品编号" + _exhibitId); //展品编号
                        $scope.getData(); //填充地图数据

                    });
                    //路由变化后清除我的位置定时器
                    $scope.$on('$routeChangeStart', function() {
                        console.log("change page"); //展品编号 
                        clearInterval(time1); //页面变化的时候清除定时器
                    });
                    $scope.getData = function() { //加载图片和热区的信息函数
                        var sumArray = new Array(); //总的有效数据
                        $http.get(urlApiTop + "/hot/find?pageNo=1&pageSize=25")
                            .success(function(response) { //请求相对应的数据包括图片以及map的area数据 
                                var itemsTemp = new Array();
                                if (response !== null && response != "") {
                                    itemsTemp = response.data; //获取得到的数据
                                    for (var i = 0; i < itemsTemp.length; i++) {
                                        //过滤得到的数据，循环添加数据
                                        if (itemsTemp[i].room.floorNo !== undefined) {
                                            sumArray.push(itemsTemp[i]);
                                        }
                                    }
                                    $scope.imgurl = (sumArray[0].hotUrl).toString(); //底图的url
                                    $scope.pageNum = response.totalPageNum; //获得能显示的数据页数
                                    if ($scope.pageNum >= 2) { //分页加载数据
                                        var a = 2; //加载完后的计数器
                                        for (var i = 2; i <= $scope.pageNum; i++) {
                                            $http.get(urlApiTop + "/hot/find?pageNo=" + i + "&pageSize=25")
                                                .success(function(response) {
                                                    var temp = new Array();
                                                    temp = response.data;
                                                    for (var i = 0; i < temp.length; i++) {
                                                        if (temp[i].room.floorNo !== undefined) {
                                                            sumArray.push(temp[i]);
                                                        }
                                                    }
                                                    a++;
                                                    if (a > $scope.pageNum) { //计数器达到总页数
                                                        // console.log("长度" + sumArray.length);
                                                        // console.log(sumArray);
                                                        $scope.slides = sumArray; //将获得的数据复制给我$scope,通过angularjs显示到页面
                                                        img = $scope.imgurl;
                                                        imgload(img); //加载图片
                                                    }
                                                })
                                        }
                                    } else {
                                        $scope.slides = sumArray;
                                        img = $scope.imgurl;
                                        imgload(img); //加载图片
                                    }
                                } else { //获取不到数据的情况
                                    console.log("没有获取到数据");
                                }
                            })
                            .error(function() { //加载失败的话触发下面代码
                                // $("#loadingImage").css("display", "");
                                $("#loadingImage").css("display", "none");
                                var locationOnline = function() { //全景页恢复网络
                                    console.log("locationOnline");
                                    $scope.getData();
                                }
                                document.addEventListener("online", locationOnline, false); //联网时触发
                                $scope.$on('$routeChangeStart', function() { //监听路由变化，跳出页面时触发
                                    console.log("locationremove");
                                    document.removeEventListener("online", locationOnline, false);
                                })
                            });
                    }

                    function imgload(o) { //图片加载函数
                        var image = new Image();
                        var Ratio;
                        //获取显示框的大小
                        var maxWidth = document.querySelector('.locationMap').offsetWidth,
                            maxHeight = document.querySelector('.locationMap').offsetHeight;
                        image.src = o;
                        image.onload = function() {
                            var w = image.width,
                                h = image.height;
                            $scope.maxHeight = maxHeight; //最大高度
                            // console.log(maxWidth + "----" + maxHeight);
                            // console.log(w + "-------" + h);
                            var wRatio = maxWidth / w;
                            var hRatio = maxHeight / h;
                            if (maxWidth == 0 && maxHeight == 0) {
                                //如果高宽没有限制
                                Ratio = 1;
                            } else if (maxWidth == 0) {
                                //如果宽没有限制
                                if (hRatio < 1) { Ratio = hRatio; }
                            } else if (maxHeight == 0) {
                                //如果高没有限制
                                if (wRatio < 1) { Ratio = wRatio; }
                            } else if (wRatio < 1 || hRatio < 1) {
                                Ratio = (wRatio <= hRatio ? wRatio : hRatio);
                                $scope.Rate = Ratio; //缩放比例赋值
                                // console.log("缩放比例" + $scope.Rate);　
                            }
                            if (Ratio < 1) {
                                w = w * Ratio;
                                h = h * Ratio;
                            }
                            // console.log(wRatio + "----" + hRatio + "----" + Ratio); //获得比例
                            image.height = h;
                            image.width = w;
                            if (wRatio < hRatio) {
                                // console.log(maxHeight + "sssss" + image.height);
                                $scope.offsetMap = (maxHeight - image.height) / 2;
                                console.log("竖向偏移量" + $scope.offsetMap); //竖向偏移
                                $scope.vertical = true;
                            } else {
                                // console.log(maxWidth + "hhhhh" + image.width);
                                $scope.offsetMap = (maxWidth - image.width) / 2; //横向偏移
                                console.log("横向偏移量" + $scope.offsetMap);
                            }
                            var qqqqq = setTimeout(function() {
                                //设置图片显示大小
                                var map = document.getElementById("map");
                                map.src = image.src;
                                map.style.height = image.height + 'px';
                                map.style.width = image.width + 'px';
                                // console.log(image.width + "..." + image.height);
                                if ($scope.vertical) { //竖向偏移
                                    map.style.marginTop = $scope.offsetMap + 'px';
                                    document.getElementById("scroller").style.top = $scope.offsetMap + 'px';
                                    document.getElementById("scroller").style.height = $scope.maxHeight + 'px';
                                } else { //横向偏移
                                    document.getElementById("scroller").style.left = $scope.offsetMap + 'px';
                                }
                                initIscroll();　
                                adjust(image, Ratio);　
                                $("#loadingImage").css("display", "none");
                                $scope.getExcibitInfo(); //获取展品位置
                                time1 = setInterval(function() {
                                    $scope.mylocationData();
                                }, 3000);
                                clearTimeout(qqqqq);
                            }, 200);
                        }
                    }

                    function initIscroll() { //初始化iscroll
                        myScroll = new IScroll('#wrapper', {
                            zoom: true,
                            zoomMax: 3,
                            zoomMin: 1,
                            scrollX: true,
                            scrollY: true,
                            mouseWheel: true,
                            hScrollbar: false,
                            vScrollbar: false,
                            wheelAction: 'zoom',
                            preventDefault: false
                        });
                        $("#wrapper").on("touchmove", function(e) {
                            e.preventDefault();
                        })
                    }

                    function adjust(o, n) { //获取MAP中元素属性
                        var element = document.getElementsByTagName("area");
                        for (var i = 0; i < element.length; i++) {
                            var oldCoords = element[i].coords;
                            if (oldCoords) {
                                var newcoords = adjustPosition(oldCoords, o, n);
                                element[i].setAttribute("coords", newcoords);
                            }
                        }

                        function adjustPosition(position, image, Ratio) { //调整MAP中坐标
                            //获取每个坐标点 
                            var each = position.split(","); //["295", "494", "100"] 
                            for (var i = 0; i < each.length; i++) {
                                each[i] = Math.round(parseInt(each[i]) * Ratio).toString(); //x坐标
                            }
                            //生成新的坐标点
                            var newPosition = "";
                            for (var i = 0; i < each.length; i++) {
                                newPosition += each[i];
                                if (i < each.length - 1) {
                                    newPosition += ",";
                                }
                            }
                            return newPosition;
                        }
                    }
                    $scope.mylocationData = function() { //我的位置的数据获取
                        var deviceMac = scanResultGlobal.deviceMac; //获得所扫描到的blemac
                        if (deviceMac !== "") { //根据设备mac查询设备信息
                            // console.log("扫描到mac" + deviceMac);
                            $http.get(urlApiTop + "/device/detail?mac=" + deviceMac)
                                .success(function(response) {
                                    $scope.getMyLocDesc = response.address; //我的位置所在房间的名称
                                    $scope.getmylocX = response.xcoord; //我的位置x
                                    $scope.getmylocY = response.ycoord; //我的位置y
                                    myLocation.style.display = "block"; //我的位置的显示 
                                    //等待填充我的位置方法 
                                    if ($scope.Rate !== undefined && $scope.offsetMap !== undefined) {
                                        $scope.myCoords($scope.getmylocX, $scope.getmylocY); //我的具体位置数据填充
                                    } else {
                                        myLocation.style.display = "none"; //我的位置的隐藏
                                    }
                                    console.log("获取我位置x" + $scope.getmylocX);
                                    console.log("获取我位置y" + $scope.getmylocY);
                                });
                        } else {
                            myLocation.style.display = "none"; //我的位置的显示 
                            console.log("未扫描到mac,重新获取");
                        }
                        $scope.myCoords = function(x, y) { //我的位置确定
                            var ml_width = myLocation.width; //我的位置图标的宽度31*40
                            var ml_height = myLocation.height;
                            if ($scope.vertical) { //如果是竖屏
                                myLocation.style.left = parseInt(x * $scope.Rate) + 'px'; //我的位置在屏幕上的位置x
                                myLocation.style.top = parseInt(y * $scope.Rate + $scope.offsetMap - 44) + 'px'; //我的位置在屏幕上的位置y
                                console.log("我竖屏处理后位置" + parseInt(x * $scope.Rate) + "-------" + parseInt(y * $scope.Rate + $scope.offsetMap - 44));
                            } else {
                                myLocation.style.left = parseInt(x * $scope.Rate + $scope.offsetMap) + 'px'; //我的位置在屏幕上的位置x
                                myLocation.style.top = parseInt(y * $scope.Rate - 44) + 'px'; //我的位置在屏幕上的位置y
                                console.log("我横屏处理后位置" + parseInt(x * $scope.Rate + $scope.offsetMap) + "-------" + parseInt(y * $scope.Rate - 44));
                            }
                        }
                        myLocation.addEventListener("touchstart", function() { //我的位置信息的toast提示
                            new Toast({
                                context: $('body'),
                                message: $scope.getMyLocDesc,
                                time: 3000
                            });
                            new Toast.init();
                            new Toast.show();
                        });
                    }
                    $scope.getExcibitInfo = function() { //根据展品页面跳转加载展品所在的信息
                        if (_exhibitId !== undefined) { //展品页面
                            //根据展品编号查询展品地址信息
                            $http.get(urlApiTop + "/exhibit/detail?id=" + _exhibitId)
                                .success(function(response) {
                                    $scope.getexhibitTiltle = response.title; //展品名字
                                    $scope.getexhibitX = response.device.xcoord; //展品x
                                    $scope.getexhibitY = response.device.ycoord; //展品y
                                    myexhibit.style.display = "block"; //我的位置的显示 
                                    //等待填充我的位置方法 
                                    console.log("获获展品位置x" + $scope.getexhibitX);
                                    console.log("获取展品位置y" + $scope.getexhibitY);
                                    if ($scope.Rate !== undefined && $scope.offsetMap !== undefined) {
                                        $scope.exhibitionCoods($scope.getexhibitX, $scope.getexhibitY); //展品位置数据填充
                                    } else {
                                        myexhibit.style.display = "none"; //我的位置的隐藏
                                    }
                                })
                        } else {
                            myexhibit.style.display = "none"; //我的位置的显示 
                        }
                        $scope.exhibitionCoods = function(x, y) { //展品具体位置的确定
                            var ex_width = myexhibit.width; //展品图标的宽度35*40
                            var ex_height = myexhibit.height;
                            console.log("展品宽度" + ex_width);
                            console.log("展品高度" + ex_height);
                            //矫正量
                            x = x - 16;
                            y = y - 16;
                            if ($scope.vertical) { //如果是竖屏
                                myexhibit.style.left = parseInt(x * $scope.Rate) + 'px'; //展品在屏幕上的位置x
                                myexhibit.style.top = parseInt(y * $scope.Rate + $scope.offsetMap) + 'px'; //展品在屏幕上的位置y
                                console.log("竖屏展品处理后位置" + parseInt(x * $scope.Rate) + "-------" + parseInt(y * $scope.Rate + $scope.offsetMap));
                            } else { // 横屏
                                myexhibit.style.left = parseInt(x * $scope.Rate + $scope.offsetMap) + 'px'; //展品在屏幕上的位置x
                                myexhibit.style.top = parseInt(y * $scope.Rate) + 'px'; //展品在屏幕上的位置y
                                console.log("横屏展品处理后位置" + parseInt(x * $scope.Rate + $scope.offsetMap) + "-------" + parseInt(y * $scope.Rate));
                            }
                        }
                        myexhibit.addEventListener("touchstart", function() { //展品信息的toast提示
                            new Toast({
                                context: $('body'),
                                message: $scope.getexhibitTiltle,
                                time: 3000
                            });
                            new Toast.init();
                            new Toast.show();
                        });
                    }
                }
            })
    })
