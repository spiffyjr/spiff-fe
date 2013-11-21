chrome.app.runtime.onLaunched.addListener(function (launchData) {
    chrome.app.window.create('app/app.html', {
        id: "spiffy-fe",
        minWidth: 640,
        minHeight: 480
    });
});