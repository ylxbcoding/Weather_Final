  $(function() {
          ///初始化相关设置
          var playMode = window.localStorage.getItem("playMode");
          if (playMode == null) {
              window.localStorage.setItem("playMode", "speaker");
          }; //添加localstorage判断设备播放方式
          var volume = window.localStorage.getItem("volume");
          if (volume == null) {
              window.localStorage.setItem("volume", "0.2");
          }; //添加localstorage判断设备播放音量
          var pageNo = window.localStorage.getItem("pageNo");
          if (pageNo !== null) {
              window.localStorage.removeItem("pageNo");
          } //清空picture历史位置
          var historyPano = window.localStorage.getItem("historyPano");
          if (historyPano !== null) {
              window.localStorage.removeItem("historyPano");
          } //清空全景历史位置
      })
      ////////声明全局变量/////////////////////////////////////////////////////
  var exhibitIdfromPicture; //全局变量exhibit页面传过来的id
  var postApiTop = "http://61.152.122.103/ble-collect-web";
  var urlApiTop = "http://61.152.122.103/ble-web";
  var urlMapTop = "http://61.152.122.103:8086";
  // var postApiTop = "http://211.144.121.76/ble-collect-web";
  // var urlApiTop = "http://211.144.121.76/ble-web";
  // var urlMapTop = "http://211.144.121.76:8086";
  ////////开启侧边栏/////////////////////////////////////////////////////////////
  var slideout = new Slideout({
      'panel': document.getElementById('panel'),
      'menu': document.getElementById('menu'),
      'padding': 120,
      'side': 'right'
  });
  slideout.disableTouch();
  document.querySelector('.menu').addEventListener('click', function(eve) {
      if (eve.target.nodeName === 'A') { slideout.close(); }
  });

  ////////请求错误提示/////////////////////////////////////////////////////////////
  function httpErrorTip(error) {
      var httpErrorTip = setTimeout(function() {
          $("#loadingImage").css({ "display": "none" });
          new Toast({
              context: $('body'),
              message: '网络错误，请检查网络！',
              time: 3000
          });
          new Toast.init();
          new Toast.show();
          console.log(error);
          clearTimeout(httpErrorTip);
      }, 2000)
  }
  ////////获取url参数值/////////////////////////////////////////////////////////////
  function GetArgsFromHref(sHref, sArgName) { //获取url传过来的参数
      var args = sHref.split("?");
      var retval = "";
      if (args[0] == sHref) /*参数为空*/ {
          return retval; /*无需做任何处理*/
      }
      var str = args[1];
      args = str.split("&");
      for (var i = 0; i < args.length; i++) {
          str = args[i];
          var arg = str.split("=");
          if (arg.length <= 1) continue;
          if (arg[0] == sArgName)
              retval = arg[1];
      }
      return retval;
  }
  ////////版本自动更新/////////////////////////////////////////////////////////////
  var clearCacheFunc = function() { //清空app缓存
      document.addEventListener('deviceready', onDeviceReady);

      function onDeviceReady() {
          var success = function(status) {
              // console.log('缓存清理: ' + status);
              new Toast({
                  context: $('body'),
                  message: '缓存清理成功！',
                  time: 2000
              });
              new Toast.init();
              new Toast.show();

          }
          var error = function(status) {
              // console.log('缓存清理: ' + status);
              new Toast({
                  context: $('body'),
                  message: '缓存清理失败！',
                  time: 2000
              });
              new Toast.init();
              new Toast.show();
          }
          window.cache.clear(success, error); //清空app缓存
          window.cache.cleartemp(); //清空app缓存
      }
  }

  ////////////file-transfer下载app/////////////////////////
  var startDownload = function(androidFile) {
      // console.log(androidFile);
      try {
          var ft = new FileTransfer();
          var uri = encodeURI(androidFile);
          //cordova.file.externalRootDirectory   安卓sd卡的根目录
          var fileURL = cordova.file.externalRootDirectory + androidFile.substr(androidFile.lastIndexOf('/') + 1);
          // console.log("准备下载" + fileURL);
          var nowValue = 0;
          ft.onprogress = function(progressEvent) { //正在下载的进程条
              if (progressEvent.lengthComputable) {
                  nowValue = (progressEvent.loaded / progressEvent.total) * 100;
                  // $("#appDownloading").css({ "width": nowValue.toFixed(0) + "%" });
                  // $("#appDownloading").html(nowValue.toFixed(0) + "%") //不保留小数点
                  $(".appDownloadprogress").html("<div id='appDownloading' class='progress-bar progress-bar-striped active' style='min-width: 0.5%;width:" +
                      nowValue.toFixed(0) + "%;'>" + nowValue.toFixed(0) + "%</div>")
              } else {
                  console.log(progressEvent);
              }
          };
          ft.download( //开始下载
              uri,
              fileURL,
              function(entry) {
                  //OpenFile(entry.fullPath);
                  updateAlertDiv("hidden"); //隐藏下载框
                  $(".appDownloadprogress").html(""); //清空进度条
                  localStorage.clear(); //清空localStorage
                  clearCacheFunc(); //清空app缓存
                  cordova.plugins.fileOpener2.open( //打开安装包
                      fileURL,
                      'application/vnd.android.package-archive', {
                          error: function() {
                              console.log("app opened error!");
                          },
                          success: function() {
                              console.log("app opened success!");
                          }
                      }
                  );
                  // console.log("download complete: " + entry.toURL());
              },
              function(error) {
                  console.log("download error source " + error.source);
                  console.log("download error target " + error.target);
                  console.log("upload error code" + error.code);
              }
          );
          $("#updateAlertBtn3").on("tap", function() { //取消下载按钮
              ft.abort();
              updateAlertDiv("hidden");
          });
      } catch (e) {
          console.log(e.name + ":" + e.message);
      }
  }

  ////////////更新app的Alert页面///////////////////////////
  /*参数：type--更新方式，强制更新1，普通更新0
   *show--显示隐藏，显示1，隐藏0
   *version--版本号
   */
  var updateAlertDiv = function(show, content) {
      if (show == "show") { //显示
          if (content.updateType == 1) { //强制更新
              $(".divContent").css("display", "");
              $(".infoAlertTitle").html("新版本：" + content.appVersion + "，更新提示：");
              $(".divContent").html("<div>" + content.description + "</div>");
              $(".infoAlert").css("display", "");
              $(".infoAlertBg").css("display", "");
              $("#updateAlertBtn2").css("display", "");
          } else if (content.updateType == 0) { //普通更新
              $(".divContent").css("display", "");
              $(".infoAlertTitle").html("新版本：" + content.appVersion + "，更新提示：");
              $(".divContent").html("<div>" + content.description + "</div>");
              $(".infoAlert").css("display", "");
              $(".infoAlertBg").css("display", "");
              $("#updateAlertBtn1").css("display", "");
          }
      } else if (show == "update") { //隐藏
          //$(".infoAlert").css("display", "none");
          if (content.updateType == 1) { //强制更新
              $(".divContent").css("display", "none");
              $("#updateAlertBtn3").css("display", "none");
              $("#updateAlertBtn2").css("display", "none");
              $("#updateAlertBtn1").css("display", "none");
              $("#updateAlertBtn4").css("display", "");
              $(".appDownload").css({ "display": "" });
          } else if (content.updateType == 0) { //普通更新
              $(".divContent").css("display", "none");
              $("#updateAlertBtn4").css("display", "none");
              $("#updateAlertBtn2").css("display", "none");
              $("#updateAlertBtn1").css("display", "none");
              $("#updateAlertBtn3").css("display", "");
              $(".appDownload").css({ "display": "" });
          }
      } else {
          $(".appDownload,.infoAlertBg,.divContent,.infoAlert").css({ "display": "none" });
          $("#updateAlertBtn1,#updateAlertBtn2,#updateAlertBtn3,#updateAlertBtn4").css({ "display": "none" });
      }
  }

  ////////////检查app与服务器的版本是否相同////////////////
  var checkVersion = function(version, fromPage) { //发送检测app版本请求
      $.ajax({
          url: urlApiTop + "/version/checked?channelCode=1000&deviceType=Android&appVersion=" + version,
          type: "GET",
          async: false,
          dataType: "json", //若没设置则返回字符串
          success: function(data) { //回调的内容
              if (data.length != 0 || data.length !== undefined) { //有数据，需要更新
                  // if (typeof(data.length) != "undefined") {
                  if (data.updateType == 0) { //更新类型
                      // alert("小版本更新。")
                      updateAlertDiv("show", data);
                  } else if (data.updateType == 1) {
                      // alert("大版本更新。")
                      updateAlertDiv("show", data);
                  }
                  listenBtn(data); //监听按键
              } else { //没数据，不需要更新
                  if (!fromPage) {
                      updateAlertDiv("hidden");
                  } else { //来源于设置页面的更新操作
                      new Toast({
                          context: $('body'),
                          message: '当前已是最新版本！',
                          time: 3000
                      });
                      new Toast.init();
                      new Toast.show();
                  }
              }
              // console.log(data);
          },
          error: function(e) {
              // console.log('检测版本错误：');
              // console.log(e);
              var currentUrl = window.location.href;
              if (!(currentUrl.indexOf("#/welcome") > -1)) {
                  if (e.status === 400) {
                      new Toast({
                          context: $('body'),
                          message: '当前已是最新版本！',
                          time: 3000
                      });
                      new Toast.init();
                      new Toast.show();
                  } else {
                      new Toast({
                          context: $('body'),
                          message: '检测版本，发生错误！',
                          time: 3000
                      });
                      new Toast.init();
                      new Toast.show();
                  }
              }
          }
      });
  }

  ////////////更新app的Alert页面//监听按键/////////////////
  var updateData;
  var listenBtn = function(data) {
      updateData = data;
  }
  $("#updateAlertBtn2,#updateConfirmBtn").on("tap", function() { //更新的确认键
      updateAlertDiv("update", updateData);
      // var url = "http://d.lookbuild.com/qq/QQStock_Android_4.7.1_1897.apk";
      // startDownload(url);
      startDownload(updateData.appUrl);
  });
  $("#updateCancelBtn").on("tap", function() { //普通更新的取消键
      updateAlertDiv("hidden");
      //window.location.href = "#/index";
  });
  $(".infoAlertBg").on("touchend", function() { //空白部分点击关闭
      var updateAlertBtn1 = document.getElementById("updateAlertBtn1");
      var updateAlertBtn3 = document.getElementById("updateAlertBtn3");
      if (updateAlertBtn1.style.display == "") {
          updateAlertDiv("hidden");
      } else if (updateAlertBtn3.style.display == "") {
          updateAlertDiv("hidden");
      }
  });

  function updateApp(fromPage) { //获取app版本号
      // createAlertDiv(); 
      if (!fromPage) { //每次打开app时触发
          cordova.getAppVersion.getAppName(function(appname) { //读取app名字
              $(".copyRight").html(appname + " © JKinfo");
          });
          cordova.getAppVersion.getVersionNumber(function(version) { //读取app版本信息
              $(".appVersion").html("当前版本：" + version);
              checkVersion(version);
          });
      } else { //从设置页面触发
          cordova.getAppVersion.getVersionNumber(function(version) { //读取app版本信息
              $(".appVersion").html("当前版本：" + version);
              checkVersion(version, "set");
          });
      }
  }
