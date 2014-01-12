var count = 0;

chrome.app.runtime.onLaunched.addListener(function (test) {
    chrome.app.window.create('app/app.html', {
        id: "spiffy-fe" + count++,
        minWidth: 640,
        minHeight: 480,
        frame: 'none'
    }, function(appWindow, test) {
        var window  = appWindow.contentWindow;
        var angular, client;

        window.onload = function() {
            angular = window.angular;
            client  = angular.element(window.document.children[0]).injector().get('Client');
        };

        appWindow.onClosed.addListener(function() {
            var socketId = client.getSocket().getSocketId();
            chrome.socket.disconnect(socketId);
            chrome.socket.destroy(socketId);
        });
    });
});