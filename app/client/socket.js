'use strict';

angular.module('client.socket', [])
    .factory('Socket', function() {
        var Socket = function Socket(hostname, port) {
            var socketId;
            var cbOnData;

            var stringToArrayBuffer = function(str, callback) {
                var bb = new Blob([str]);
                var f = new FileReader();
                f.onload = function(e) {
                    callback(e.target.result);
                };
                f.readAsArrayBuffer(bb);
            };

            var arrayBufferToString = function(buf, callback) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    callback(e.target.result);
                };
                var blob = new Blob([ buf ], { type: 'application/octet-stream' });
                reader.readAsText(blob);
            };

            var read = function(readInfo) {
                if (readInfo) {
                    if (readInfo.resultCode < 0) {
                        console.log('disconncted');
                        return;
                    }

                    arrayBufferToString(readInfo.data, function(str) {
                        if (cbOnData) {
                            cbOnData(str);
                        }
                    });
                }

                chrome.socket.read(socketId, null, read);
            };

            this.ondata = function(callback) {
                cbOnData = callback;
            };

            this.connect = function(callback) {
                if (socketId) {
                    return;
                }

                chrome.socket.create('tcp', function(socketInfo) {
                    socketId = socketInfo.socketId;
                    chrome.socket.connect(socketId, hostname, port, function() {
                        if (callback) {
                            callback();
                        }

                        read();
                    });
                });
            };

            this.disconnect = function() {
                if (!socketId) {
                    return;
                }
                chrome.socket.disconnect(socketId);
                socketId = null;
            };

            this.write = function(str) {
                stringToArrayBuffer(str + "\n", function(arrayBuffer) {
                    chrome.socket.write(socketId, arrayBuffer, function(writeInfo) {});
                });
            };
        };

        return new Socket('127.0.0.1', 8000);
    });