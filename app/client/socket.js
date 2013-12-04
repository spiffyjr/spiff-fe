'use strict';

angular.module('client.socket', [])
    .factory('Socket', function() {
        var Socket = function Socket() {
            var socketId;
            var cbOnData;
            var buffer = '';

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
                        buffer = buffer + str;

                        var index;
                        while ((index = buffer.search(/\r\n/)) != -1) {
                            cbOnData(buffer.slice(0, index + 2));
                            buffer = buffer.substr(index + 2);
                        }
                    });
                }

                chrome.socket.read(socketId, null, read);
            };

            this.ondata = function(callback) {
                cbOnData = callback;
            };

            this.connect = function(hostname, port, callback) {
                if (socketId) {
                    return;
                }

                chrome.socket.create('tcp', function(socketInfo) {
                    socketId = socketInfo.socketId;
                    chrome.socket.connect(socketId, hostname, port, function(result) {
                        if (result < 0) {
                            socketId = null;
                        }
                        if (callback) {
                            callback(result);
                        }

                        if (socketId) {
                            read();
                        }
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

        return new Socket();
    });