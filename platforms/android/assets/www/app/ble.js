////////////蓝牙信号滑块/////////////////////////////////////////////////////
function getRange() {
    var rangeVal = document.getElementById("rangeBleRssi").value;
    localStorage.canScanRssi = rangeVal - 12;
    localStorage.canExhibitRssi = rangeVal;
    // console.log(localStorage.canScanRssi + "   " + localStorage.canExhibitRssi);
    // $("#canScanRssi").html(localStorage.canScanRssi);
    // $("#canExhibitRssi").html(localStorage.canExhibitRssi);
}
//////////////////////蓝牙扫描程序/////////////////////////////
var BLEJson = new Array(), //存储设备集合
    scanNumber = 1, //扫描次数
    postDevice = new Array(), //上传数据的数组
    platform, //手机平台
    scanResultGlobal = {
        "deviceMac": "",
        "hotId": "",
        "panoId": "",
        "floorNo": "",
        "roomNo": "",
        "panoP": "",
        "panoT": "",
        "panoF": "",
        "placeId": "",
        "historyEx": ""
    }; //用于传递蓝牙扫描结果的全局变量数组
document.addEventListener("deviceready", function() {
    platform = device.platform;
    // console.log(platform);
}, false);
getBleDevice();

function getBleDevice() {
    $.ajax({ //获取服务器的设备数据
        url: urlApiTop + "/device/find?pageSize=25",
        type: "GET",
        async: false,
        dataType: "json",
        success: function(result) {
            for (var i = 0; i < result.totalPageNum; i++) { //循环加载api获取设备集合
                $.ajax({
                    url: urlApiTop + "/device/find?pageSize=25&pageNo=" + (i + 1),
                    type: 'GET',
                    dataType: 'json',
                    success: function(result) {
                        BLEJson = BLEJson.concat(result.data);
                    }
                })
            }
        },
        error: function() {
            var getBleOnline = function() { //展品蓝牙触发页恢复网络
                //   console.log("exhibitBle");
                getBleDevice();
                document.removeEventListener("online", getBleOnline, false);
                //  console.log("getBleremove");
            }
            document.addEventListener("online", getBleOnline, false); //联网时触发
        }
    });
}

function scan() {
    // console.log(BLEJson);
    if (localStorage.canScanRssi == null && localStorage.canExhibitRssi == null) {
        localStorage.canScanRssi = -73;
        localStorage.canExhibitRssi = -61;
        new Toast({
            context: $('body'),
            message: '请查阅帮助，已获得更好的体验！',
            time: 2000
        });
        new Toast.init();
        new Toast.show();
    }
    var canScanRssi = localStorage.canScanRssi, //进入扫描范围的信号强度
        canExhibitRssi = localStorage.canExhibitRssi, //触发展品信标的信号强度
        d_noRepeat = new Array(),
        sn = 0; //去重后device信息的存放
    function success(device) { //扫描成功后的运行代码（每扫描到一个设备就会运行一次）
        if (platform == "Android") {
            var adv = new Uint8Array(device.advertising); //将广播包数据解析出来
            if (adv[7].toString(16) == '4a' && adv[8].toString(16) == '4b') {
                if (device.rssi >= canScanRssi) { //满足扫描信号强度
                    d_noRepeat[sn] = device; //将设备信息存入数组中
                    sn++; //计数加1
                    // console.log(".");
                }
            }
        } else if (platform == "iOS") {
            var adv = new Uint8Array(device.advertising.kCBAdvDataManufacturerData);
            if (adv[2].toString(16) == '4a' && adv[3].toString(16) == '4b') {
                if (device.rssi >= canScanRssi) { //满足扫描信号强度
                    d_noRepeat[sn] = device; //将设备信息存入数组中
                    sn++; //计数加1
                }
            }
        }
    }
    ble.startScan([], success, function() {}); //第一次开始扫描
    var setTimeOut1 = setTimeout(function() { //等待一段时间后执行结束扫描代码
        clearTimeout(setTimeOut1) //终止setTimeOut1
        ble.stopScan( //第一次结束扫描
            function() { ScanLoop(); },
            function() {}
        );
    }, 1500); //第一次间隔时间
    function ScanLoop() {
        //按信号强度排序
        d_noRepeat.sort(function(b, a) { //对存储的数组进行排序(从大到小)
            var x = a.rssi;
            var y = b.rssi;
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        //赋值设备集合数组
        var bleDeviceData = BLEJson;
        //通过判断当前页面的href来控制ble的开关//////=========================
        var isShowExTip; //标识是否加载展品详情
        function ContrastDevice() { //扫描到的数据对比数据库设备信息
            try { //判断扫描到的设备是否在设备集合中
                if (d_noRepeat.length != 0) { //判断数组不为空
                    console.log('对比前：name:' + d_noRepeat[0].name + " rssi:" + d_noRepeat[0].rssi);
                    for (var j = 0; j < bleDeviceData.length; j++) {
                        if (bleDeviceData[j].xcoord !== undefined && bleDeviceData[j].xcoord != "") {
                            if (d_noRepeat[0].name == bleDeviceData[j].name) {
                                // 若出现没有name属性时，因为d_noRepeat数组为undefined
                                InitGlobalData(bleDeviceData[j], d_noRepeat[0].rssi);
                            }
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
        /**
         * [InitGlobalData 重新赋值全局变量]
         * @param  {[type]} deviceData [数据库所绑定的设备信息]
         * @param  {[type]} rssi       [扫描到设备的信号强度]
         * @return {[type]}            [description]
         */
        function InitGlobalData(deviceData, rssi) { //
            scanResultGlobal.floorNo = deviceData.room.floorNo;
            if (deviceData.room.floorNo == "2") { //对楼层号进行赋值 //2楼
                scanResultGlobal.placeId = 611; //全景代号
            } else if (deviceData.room.floorNo == "3") {
                scanResultGlobal.placeId = 610;
            } else {
                scanResultGlobal.placeId = 612;
            }
            console.log('对比后：name:' + deviceData.name + " rssi:" + rssi);
            if (rssi >= canExhibitRssi) { //判断信号强度是否大于55
                isShowExTip = true;
                //调用AjaxMacToPanoId方法
                AjaxMacToPanoId(deviceData.mac);
            } else {
                // if (scanResultGlobal.roomNo != deviceData.room.roomNo) {
                isShowExTip = false;
                //调用AjaxMacToPanoId方法
                AjaxMacToPanoId(deviceData.mac);
                // }
            }
            // scanResultGlobal.roomNo = deviceData.room.roomNo;
        }
        /**
         * [AjaxMacToPanoId 发送两次请求，获取两组展品数据]
         * @param  {[type]} mac [扫描到设备的mac地址]
         * @return {[type]}     [description]
         */
        function AjaxMacToPanoId(mac) { //
            if (localStorage.bleSwitch == 1) { //判断开关状态   
                $.ajax({ //获取由mac->热区->全景->一组展品
                    url: urlApiTop + "/panoramaExhibit/detail?deviceMac=" + mac,
                    type: 'GET',
                    dataType: 'json',
                    success: function(result) {
                        var panoExhibitArray = result.data;
                        if (localStorage.bleSwitch == 1) { //判断开关状态   
                            $.ajax({ //获取由mac->一组展品
                                url: urlApiTop + "/exhibit/find?deviceMac=" + mac,
                                type: 'GET',
                                dataType: 'json',
                                success: function(result) {
                                    var exhibitArray = result.data;
                                    Contrast2Ajax(panoExhibitArray, exhibitArray);
                                }
                            })
                        }
                    }
                })
            }
        }
        /**
         * [Contrast2Ajax 对比两次请求的数据]
         * @param  {[type]} panoExhibitArray [由全景接口获得的一组展品]
         * @param  {[type]} exhibitArray     [由展品详情获取的一组展品]
         * @return {[type]}                  [description]
         */
        function Contrast2Ajax(panoExhibitArray, exhibitArray) {
            var exhibitHasVoice = new Array(), //展品有数据音频
                canChangePano = new Array(), //所有能够触发的展品
                ehv = 0, //计数器
                ccp = 0; //计数器
            for (var a = 0; a < panoExhibitArray.length; a++) { //筛选两组展品结果
                for (var b = 0; b < exhibitArray.length; b++) {
                    if (panoExhibitArray[a].exhibit.id == exhibitArray[b].id) { //判断两个数组之间的相同展品
                        canChangePano[ccp] = panoExhibitArray[a]; //有相同展品
                        ccp++;
                        if (isShowExTip) { //排除没有音频的展品，累计有音频的展品 现去除该功能&& panoExhibitArray[a].exhibit.voice !== undefined
                            if (exhibitHasVoice.length != 0) { //判断有音频的数据内是否有重复的展品
                                var sameNum = 0;
                                for (var i = 0; i < exhibitHasVoice.length; i++) { //判断有无重复展品
                                    if (exhibitHasVoice[i] == panoExhibitArray[a].exhibit.id) {
                                        sameNum++;
                                    }
                                }
                                if (sameNum == 0) { //没有相同展品
                                    exhibitHasVoice[ehv] = panoExhibitArray[a].exhibit.id;
                                    ehv++;
                                }
                            } else {
                                exhibitHasVoice[ehv] = panoExhibitArray[a].exhibit.id;
                                ehv++;
                            }
                        }
                    }
                }
            }
            ShowPanoAndExhinbit(canChangePano, exhibitHasVoice);
        }
        /**
         * [ShowPanoAndExhinbit 控制展品和全景的跳转]
         * @param  {[type]} canChangePano   [两组展品中所包含的相同展品数组]
         * @param  {[type]} exhibitHasVoice [包含相同且有音频的展品数组]
         * @return {[type]}                 [description]
         */
        function ShowPanoAndExhinbit(canChangePano, exhibitHasVoice) {
            if (localStorage.bleSwitch == 1) { //判断开关状态   
                if (canChangePano.length != 0) {
                    var currentUrl = window.location.href;
                    if (currentUrl.indexOf("#/map") > -1) {
                        var panoWindow = document.getElementById("oframe").contentWindow;
                        var container = panoWindow.document.getElementById("container");
                        var panoExDiv = panoWindow.document.getElementById("panoExDiv");
                        if (container) { //有全景页面
                            if (isShowExTip) { //需要显示展品，即大于触发强度
                                var roomNoArray = (canChangePano[0].exhibit.id).split("_"); //获取房间号
                                var roomNo = roomNoArray[0] + roomNoArray[1];
                                if (panoExDiv) { //已有展品详情
                                    if (scanResultGlobal.roomNo != roomNo) { //房间号与历史记录不相同
                                        scanResultGlobal.roomNo = roomNo;
                                        ShowEx();
                                        ShowPano();
                                    } else {
                                        ShowEx();
                                    }
                                } else { //无展品详情
                                    ShowEx();
                                    ShowPano();
                                }
                            } else { //不需要显示展品，即小于触发强度
                                if (!panoExDiv) {
                                    ShowPano();
                                }
                            }
                        }
                    }
                }
            }

            function ShowEx() { //显示展品
                if (exhibitHasVoice.length > 0) {
                    var currentEx = "";
                    for (var i = 0; i < exhibitHasVoice.length; i++) {
                        currentEx = currentEx + exhibitHasVoice[i]
                    }
                    if (scanResultGlobal.historyEx != currentEx) { //有可跳转的数据
                        // console.log(scanResultGlobal.historyEx);
                        // console.log(currentEx);
                        scanResultGlobal.historyEx = currentEx;
                        if (panoExDiv) { panoWindow.fPanoClose(); }
                        panoWindow.panoShowExhibit(exhibitHasVoice);
                    }
                }
            }

            function ShowPano() { //切换全景
                console.log("ShowPano");
                if (scanResultGlobal.panoId != canChangePano[0].panorama.panoId ||
                    scanResultGlobal.panoP != canChangePano[0].p ||
                    scanResultGlobal.panoT != canChangePano[0].t ||
                    scanResultGlobal.panoF != canChangePano[0].f) { //判断全景id与之前不同
                    scanResultGlobal.panoId = canChangePano[0].panorama.panoId;
                    scanResultGlobal.panoP = canChangePano[0].p;
                    scanResultGlobal.panoT = canChangePano[0].t;
                    scanResultGlobal.panoF = canChangePano[0].f;
                    console.log("showPano  ing");
                    panoWindow.pano.showPano(scanResultGlobal.placeId, canChangePano[0].panorama.panoId, canChangePano[0].p, canChangePano[0].t, canChangePano[0].f);
                }
            }
        }
        var currentUrl = window.location.href; //判断当前页面
        if (currentUrl.indexOf("#/map") > -1) { //如果当前页面为map页面
            ContrastDevice();
        } else if (currentUrl.indexOf("#/location") > -1) {
            if (d_noRepeat.length > 0) {
                for (var i = 0; i < d_noRepeat.length; i++) { //i表示扫描到数据的个数
                    for (var j = 0; j < bleDeviceData.length; j++) { //j表示设备集合的长度
                        if (bleDeviceData[j].xcoord !== undefined && bleDeviceData[j].xcoord != "") { //判断设备的xcoord是否有值
                            if (d_noRepeat[i].name == bleDeviceData[j].name) { //扫描到的设备与设备集合做对比
                                if (scanResultGlobal.deviceMac != bleDeviceData[j].mac) {
                                    scanResultGlobal.deviceMac = bleDeviceData[j].mac; //赋值给全局变量
                                }
                            }
                        }
                    }
                }
            }
        }
        PostDevicePower(d_noRepeat);
        // //显示扫描结果
        // for (var i = d_noRepeat.length - 1; i >= 0; i--) {
        //     console.log(d_noRepeat[i]);
        // };
        if (localStorage.bleSwitch == 1) { //判断开关状态  
            var sT = setTimeout(function() {
                console.log("扫描一次。");
                scan();
                scanNumber++;
                clearTimeout(sT) //终止setTimeOut
            }, 500);
        }
    }
    /**
     * [PostDevicePower   扫描次数每达到800次，
     * 就会上传扫描到设备的电量信息,未达到800次的，
     * 会将扫描到的数据进行合并同类项处理，以便之后的数据上传]
     * @param {[type]} d_noRepeat [每次扫描到的设备数组]
     */
    function PostDevicePower(d_noRepeat) {
        if (scanNumber % 800 == 0) {
            var postData = new Array(); //上传的信息
            var getDate = new Date(); //时间
            for (var i = 0; i < postDevice.length; i++) {
                postData[i] = {
                    "collectName": "手机",
                    "model": device.model,
                    "bluetoothMac": "",
                    "brand": device.manufacturer,
                    "serialNumber": device.serial,
                    "collectTime": getDate.getTime(),
                    "data": [{
                        "isTrace": 0,
                        "isData": 1,
                        "rssiReference": postDevice[i].rssi,
                        "deviceMac": postDevice[i].id,
                        "deviceName": postDevice[i].name,
                        "deviceType": 9, //对应数据库为定位信标
                        "pointCode": "1007", //对应数据库“电量”
                        "value": PostDeviceAdv(postDevice[i]),
                    }]
                }
            }
            var postDataString = JSON.stringify(postData); //将json数据序列化，否则上传会报错
            $.ajax({ //提交请求
                type: 'POST',
                url: postApiTop + "/collect",
                data: postDataString,
                success: function() {
                    // console.log('postdata success!')
                },
                dataType: "json",
                contentType: "application/json"
            });
        } else {
            if (d_noRepeat.length > 0) { //判断扫描到的数组有值
                var postDeviceRepeat = postDevice.concat(d_noRepeat);
                // console.log(postDeviceRepeat);
                postDevice = MergeSameArray(postDeviceRepeat);
                // console.log(postDevice);
            }
        }
    }
    /**
     * [PostDeviceAdv 将广播包数据解析出来，电量信息]
     * @param {[type]} device [单个设备数组]
     */
    function PostDeviceAdv(device) {
        if (device.advertising != "") { //保证数据不是空的
            if (platform == "Android") {
                var adv = new Uint8Array(device.advertising); //将广播包数据解析出来
                var advertising = "";
                for (var i = 0; i < 31; i++) { //截取前半部分广播包
                    advertising += adv[i].toString(16) + "_";
                }
                // return advertising;//返回设备的广播包
                return adv[25].toString(16) + "." + adv[26].toString(16); //读出蓝牙电量信息
            } else if (platform == "iOS") {
                var adv = new Uint8Array(device.advertising.kCBAdvDataManufacturerData);
                var advertising = "";
                for (var i = 0; i < adv.length; i++) { //截取前半部分广播包
                    advertising += adv[i].toString(16) + "_";
                }
                // return advertising;//返回设备的广播包
                return adv[20].toString(16) + "." + adv[21].toString(16); //读出蓝牙电量信息
            }
        }
    }
    /**
     * [MergeSameArray 对每次扫描到的数据进行合并同类项，减少上传的数据]
     * @param {[type]} myArray [需要合并的数组]
     */
    function MergeSameArray(myArray) { //对数组进行合并同类项
        myArray.sort(function(a, b) { //对存储的数组进行排序(从小到大)
            var x = a.name;
            var y = b.name;
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        var k = 0,
            j = 0,
            mac = myArray[0].name,
            tempArray = new Array();
        // console.log("merge");
        for (var a = 0; a < myArray.length; a++) { //遍历数组内的数据
            tempArray[k] = {}; //去重后device信息的存放
            try {
                if (mac == myArray[a].name) { //判断device的id是否与mac地址相同
                    j++; //计数器（有多少个重复的device）           
                    if (a == myArray.length - 1) { //判断该device是不是最后一个
                        tempArray[k].id = myArray[a].id; //将device信息赋值到新数组上
                        tempArray[k].name = myArray[a].name;
                        tempArray[k].advertising = myArray[a].advertising; //解析出广播包
                        tempArray[k].repeatNumber = j;
                        tempArray[k].rssi = myArray[a].rssi;
                    }
                } else {
                    tempArray[k].id = myArray[a - 1].id; //将device信息赋值到新数组上
                    tempArray[k].name = myArray[a - 1].name;
                    tempArray[k].advertising = myArray[a - 1].advertising; //解析出广播包
                    tempArray[k].repeatNumber = j;
                    tempArray[k].rssi = myArray[a - 1].rssi;
                    k++;
                    mac = myArray[a].name; //初始mac地址
                    j = 0;
                    a = a - 1; //退回上一级跟被初始后的mac进行比较
                }
            } catch (e) {
                // console.log("去重的数组没有值：");
                console.log(e);
            }
            if (a == myArray.length - 1) {
                return tempArray;
                break;
            }
        }
    }
}
// ////////蓝牙信号矫正/////////////////////////////////////////////////////////////
// function correctBleRssi() {
//     //创建div，动态生成信号矫正动画
//     var correctBleRssi = document.createElement("div");
//     correctBleRssi.id = "correctBleRssi";
//     $("body").before(correctBleRssi)
//     $("#correctBleRssi").html('<div class="spinner"><div class="double-bounce1"></div>' + '<div class="double-bounce2"></div></div><div class="correctText">矫正定位中</div>')
//     var deviceRssi = new Array();
//     var n = 0;
//     function sacnOne() {
//         var success = function(device) { //扫描成功后的运行代码（每扫描到一个设备就会运行一次）
//             if (device.name == "EX 003") { //7C:EC:79:E5:C6:FB
//                 // if (device.id == "98:7B:F3:5B:24:A3") {
//                 deviceRssi[n] = device.rssi;
//                 n++;
//                 $(".correctText").append('.');
//                 console.log(device);
//             }
//         }
//         var err = function(e) {
//             console.log(e);
//         }
//         ble.startScan([], success, err);
//         var bleStop = setTimeout(function() {
//             ble.stopScan(
//                 function() {
//                     //console.log("ScanOne complete");
//                     if (document.getElementById("correctBleRssi")) { //判断蓝牙矫正页面是否存在
//                         if (n <= 6) { //确保扫描到六次
//                             sacnOne();
//                         } else {
//                             var aveBleRssi = 0,
//                                 sumBleRssi = 0;
//                             for (var i = 0; i < deviceRssi.length; i++) {
//                                 // console.log(deviceRssi[i]);
//                                 sumBleRssi += deviceRssi[i];
//                             }
//                             aveBleRssi = parseInt(sumBleRssi / deviceRssi.length); //计算平均值
//                             $("#correctBleRssi").remove();
//                             console.log("aveBleRssi" + aveBleRssi);
//                             localStorage.canScanRssi = aveBleRssi - 12;
//                             localStorage.canExhibitRssi = aveBleRssi;
//                             document.getElementById("rangeBleRssi").value = aveBleRssi;
//                             // $("#canScanRssi").html(localStorage.canScanRssi);
//                             // $("#canExhibitRssi").html(localStorage.canExhibitRssi);
//                             new Toast({
//                                 context: $('body'),
//                                 message: '矫正定位完成！触发信号值：' + aveBleRssi,
//                                 time: 2000
//                             });
//                             new Toast.init();
//                             new Toast.show();
//                         }
//                     }
//                 }, err
//             );
//         }, 600);
//     }
//     sacnOne();
// }
