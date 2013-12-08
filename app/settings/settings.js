'use strict';

angular.module('settings', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/settings', { controller: 'SettingsCtrl', templateUrl: 'settings/settings.html' });
    })
    .factory('SettingsService', function() {
        var Settings = function() {
            var defaultSettings = {
                "css": {
                    "bold": {
                        "color": "yellow",
                        "fontWeight": "bold"
                    },
                    "deaths": {
                        "color": "red"
                    },
                    "casting": {
                        "color": "#9090ff"
                    },
                    "code": {
                        "color": "#008000"
                    },
                    "lich": {
                        "color": "#008000"
                    },
                    "link": {
                        "color": "saddlebrown"
                    },
                    "lnet": {
                        "color": "#0099ff"
                    },
                    "logons": {
                        "color": "darkgreen"
                    },
                    "logoffs": {
                        "color": "darkred"
                    },
                    "numbers": {
                        "color": "#555555"
                    },
                    "mono": {
                        "fontFamily": '"Lucida Console", Monaco, monospace',
                        "whiteSpace": "pre-wrap"
                    },
                    "paths": {
                        "color": "#0099ff"
                    },
                    "prime": {
                        "color": "#808000"
                    },
                    "private": {
                        "color": "#ffffff",
                        "fontWeight": "bold"
                    },
                    "prompt": {
                        "color": "#555555"
                    },
                    "roomName": {
                        "color": "white",
                        "fontWeight": "bold"
                    },
                    "status": {
                        "color": "#565656"
                    },
                    "speech": {
                        "color": "#66ff66"
                    },
                    "whisper": {
                        "color": "#66ff66"
                    },
                    "familiar": {
                        "backgroundColor": "#00001a"
                    },
                    "thoughts": {
                        "backgroundColor": "#001a00"
                    },
                    "voln": {
                        "backgroundColor": "#001a00"
                    }
                },
                "highlights": [
                    {
                        "css": "numbers",
                        "regex": "\\([0-9][0-9]:[0-9][0-9]:[0-9][0-9]\\)$"
                    },
                    {
                        "css": "lnet",
                        "regex": "^\\[LNet\\]"
                    },
                    {
                        "css": "prime",
                        "regex": "^\\[Prime\\]"
                    },
                    {
                        "css": "code",
                        "regex": "^\\[Code\\]"
                    },
                    {
                        "css": "paths",
                        "regex": "Obvious (?:exits|paths):"
                    },
                    {
                        "css": "private",
                        "regex": "^\\[Private(?:To)?\\]"
                    },
                    {
                        "css": "lich",
                        "regex": "^--- Lich:.*"
                    }
                ],
                "macros": {
                    "ctrl+d": "\\xstance defensive\\r",
                    "ctrl+o": "\\xstance offensive\\r"
                },
                "presets": {
                    "bold": "bold",
                    "disconnects": "logoffs",
                    "deaths": "deaths",
                    "familiar": "familiar",
                    "link": "link",
                    "logons": "logons",
                    "logoffs": "logoffs",
                    "mono": "mono",
                    "prompt": "prompt",
                    "roomName": "roomName",
                    "speech": "speech",
                    "thoughts": "thoughts",
                    "voln": "voln",
                    "whisper": "whisper"
                }
            };

            this.settings = null;

            this.save = function(callback) {
                chrome.storage.sync.set(this.settings, callback);
            };

            this.load = function(callback, forceDefaults) {
                if (this.settings) {
                    if (callback) {
                        callback(this.settings);
                    }
                    return;
                }

                var that = this;
                chrome.storage.sync.get(null, function(value) {
                    if (forceDefaults || Object.keys(value).length == 0) {
                        that.setDefaults(function() {
                            that.settings = defaultSettings;
                            if (callback) {
                                callback(that.settings);
                            }
                        });
                    } else {
                        that.settings = value;
                        if (callback) {
                            callback(value);
                        }
                    }
                });
            };

            this.setDefaults = function(callback) {
                chrome.storage.sync.set(defaultSettings, callback);
            };
        };

        var settings = new Settings();
        settings.load();

        return settings;
    })
    .controller('SettingsCtrl', function($scope, $modal, Client, SettingsService) {
        SettingsService.load(function(settings) {
            $scope.settings = JSON.stringify(settings, undefined, 2);

            $scope.save = function() {
                var json = JSON.parse($scope.settings);

                if (json) {
                    SettingsService.settings = json;
                    SettingsService.save(function() {
                        Client.Settings = json;
                        $modal.open({
                            templateUrl: 'settings/modal-settings-saved.html',
                            scope: $scope,
                            controller: function($scope, $modalInstance) {
                                $scope.ok = function() {
                                    $modalInstance.close();
                                };
                            }
                        });
                    });
                }
            };

            $scope.defaults = function() {
                SettingsService.load(function(settings) {
                    Client.settings = settings;

                    $modal.open({
                        templateUrl: 'settings/modal-defaults-loaded.html',
                        scope: $scope,
                        controller: function($scope, $modalInstance) {
                            $scope.ok = function() {
                                $modalInstance.close();
                            };
                        }
                    });
                }, true);
            }
        });
    });