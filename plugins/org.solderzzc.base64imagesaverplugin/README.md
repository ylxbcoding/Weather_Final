Base64ImageSaverPlugin
============

This plugin(based on devgeeks/Canvas2ImagePlugin) allows you to save BASE64 data to the iOS Photo Library, Android Gallery or WindowsPhone 8 Photo Album from your app.

Usage:
------

Call the `window.Base64ImageSaverPlugin.saveImageDataToLibrary()` method using success and error callbacks and the id attribute or the element object of the canvas to save:

### Example

```javascript
function onDeviceReady()
{
	window.Base64ImageSaverPlugin.saveImageDataToLibrary(
        function(msg){
            console.log(msg);
        },
        function(err){
            console.log(err);
        },
        BASE64DATA
    );
}
```

## License

The MIT License

Copyright (c) 2011 Tommy-Carlos Williams (http://github.com/devgeeks)

Copyright (c) 2015 Simba Zhang (http://github.com/solderzzc)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
