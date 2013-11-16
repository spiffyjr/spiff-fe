chrome.app.runtime.onLaunched.addListener(function (launchData) {
    chrome.app.window.create('app/index.html', {
        id: "spiffy-fe",
        minWidth: 800,
        minHeight: 480
    });
});