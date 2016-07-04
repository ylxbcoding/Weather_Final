//合并canvas
angular.module("weatherApp.canvasMerge", [])
    .factory('canvasMerge', canvasMerge);

function canvasMerge() {
    function picMerge() {
        var image = new Image();
        _canvasMerge();
        //两个canvas之间合并
        function _canvasMerge() {
            var _contentHolder = document.getElementById('contentHolder'),
                canvas = document.getElementById("canvas"),
                watermarkCanvas = document.getElementById("weatherCanvas"),
                context = canvas.getContext("2d");
            if (watermarkCanvas) {
                var canvasX = canvas.offsetLeft,
                    canvasY = canvas.offsetTop,
                    canvasW = canvas.offsetWidth,
                    canvasH = canvas.offsetHeight;
                var waterX = watermarkCanvas.offsetLeft,
                    waterY = watermarkCanvas.offsetTop,
                    waterW = watermarkCanvas.offsetWidth,
                    waterH = watermarkCanvas.offsetHeight;
                var xRatio = (waterX - canvasX) / canvasW,
                    yRatio = (waterY - canvasY) / canvasH,
                    wRatio = waterW / canvasW,
                    hRatio = waterH / canvasH;

                var x = xRatio * canvas.width,
                    y = yRatio * canvas.height,
                    w = wRatio * canvas.width,
                    h = hRatio * canvas.height;
                context.drawImage(watermarkCanvas, x, y, w, h);
                watermarkCanvas.style.display = 'none';
                _contentHolder.removeChild(watermarkCanvas);
            }
            console.log('--===drawImage-===' + new Date());
            image.src = canvas.toDataURL("image/png");
            _saveImage(image.src);
        }
        //将图片保存相册
        function _saveImage(obj) {
            window.Base64ImageSaverPlugin.saveImageDataToLibrary(
                function(msg) {
                    console.log(msg);
                },
                function(err) {
                    console.log(err);
                },
                obj
            );
            console.log('--===_saveImage-===' + new Date());
        }
        return image;
    }
    return picMerge;
}
