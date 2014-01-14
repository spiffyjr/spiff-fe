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
                    "casting": {
                        "color": "#9090ff"
                    },
                    "code": {
                        "color": "#008000"
                    },
                    "deaths": {
                        "color": "red"
                    },
                    "disk": {
                        "color": "#88aaff"
                    },
                    "familiar": {
                        "backgroundColor": "#00001a"
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
                    "logoffs": {
                        "color": "darkred"
                    },
                    "logons": {
                        "color": "darkgreen"
                    },
                    "magic": {
                        "color": "#9090ff"
                    },
                    "mono": {
                        "fontFamily": "\"Lucida Console\", Monaco, monospace",
                        "whiteSpace": "pre-wrap"
                    },
                    "numbers": {
                        "color": "#555555"
                    },
                    "paths": {
                        "color": "#0099ff"
                    },
                    "position": {
                        "color": "#565656"
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
                    "speech": {
                        "color": "#66ff66"
                    },
                    "status": {
                        "color": "#565656"
                    },
                    "thoughts": {
                        "backgroundColor": "#001a00"
                    },
                    "voln": {
                        "backgroundColor": "#001a00"
                    },
                    "whisper": {
                        "color": "#66ff66"
                    }
                },
                "highlights": [
                    {
                        "css": "numbers",
                        "regex": "\\([0-9][0-9]\\:[0-9][0-9]\\:[0-9][0-9]\\)$"
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
                    },
                    {
                        "css": "position",
                        "regex": "\\((?:calmed|dead|flying|hiding|kneeling|prone|sitting|sleeping|stunned)\\)"
                    },
                    {
                        "css": "magic",
                        "regex": "(?:You gesture|You intone a phrase of elemental power|You recite a series of mystical phrases|You trace a series of glowing runes|Your hands glow with power as you invoke|You trace a simple rune while intoning|You trace a sign while petitioning the spirits|You trace an intricate sign that contorts in the air).*"
                    },
                    {
                        "css": "magic",
                        "regex": "(?:Cast Roundtime 3 Seconds\\.|Your spell is ready\\.)"
                    },
                    {
                        "css": "disk",
                        "regex": "([A-Z][a-z]+ disk)"
                    }
                ],
                "macros": {
                    "ctrl+d": "\\xstance defensive\\r",
                    "ctrl+o": "\\xstance offensive\\r"
                },
                "presets": {
                    "bold": "bold",
                    "deaths": "deaths",
                    "disconnects": "logoffs",
                    "familiar": "familiar",
                    "link": "link",
                    "logoffs": "logoffs",
                    "logons": "logons",
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
    .controller('SettingsCtrl', function($scope, $modal, $location, Client, SettingsService) {
        SettingsService.load(function(settings) {
            $scope.settings = JSON.stringify(settings, undefined, 2);

            $scope.save = function() {
                var json = JSON.parse($scope.settings);

                if (json) {
                    SettingsService.settings = json;
                    SettingsService.save(function() {
                        Client.settings = json;
                        $modal.open({
                            templateUrl: 'settings/modal-settings-saved.html',
                            scope: $scope,
                            controller: function($scope, $modalInstance) {
                                $scope.ok = function() {
                                    $modalInstance.close();
                                    $location.path('/game');
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