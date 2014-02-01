'use strict';

angular.module('settings', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/settings', { controller: 'SettingsCtrl', templateUrl: 'settings/settings.html' });
    })
    .factory('SettingsService', function() {
        var Settings = function() {
            var defaultSettings = {
                "highlights": [
                    {
                        "style": {
                            "color": "#555555"
                        },
                        "regex": "\\([0-9][0-9]\\:[0-9][0-9]\\:[0-9][0-9]\\)$"
                    },
                    {
                        "style": {
                            "color": "#0099ff"
                        },
                        "regex": "\\[LNet\\]"
                    },
                    {
                        "style": {
                            "color": "#808000"
                        },
                        "regex": "\\[Prime\\]"
                    },
                    {
                        "style": {
                            "color": "#008000"
                        },
                        "regex": "\\[Code\\]"
                    },
                    {
                        "style": {
                            "color": "#0099ff"
                        },
                        "regex": "Obvious (?:exits|paths):"
                    },
                    {
                        "style": {
                            "color": "#ffffff",
                            "fontWeight": "bold"
                        },
                        "regex": "\\[Private(?:To)?\\]"
                    },
                    {
                        "style": {
                            "color": "#008000"
                        },
                        "regex": "^--- Lich:.*"
                    },
                    {
                        "style": {
                            "color": "#565656"
                        },
                        "regex": "\\((?:calmed|dead|flying|hiding|kneeling|prone|sitting|sleeping|stunned)\\)"
                    },
                    {
                        "style": {
                            "color": "#9090ff"
                        },
                        "regex": "(?:You gesture|You intone a phrase of elemental power|You recite a series of mystical phrases|You trace a series of glowing runes|Your hands glow with power as you invoke|You trace a simple rune while intoning|You trace a sign while petitioning the spirits|You trace an intricate sign that contorts in the air).*"
                    },
                    {
                        "style": {
                            "color": "#9090ff"
                        },
                        "regex": "(?:Cast Roundtime 3 Seconds\\.|Your spell is ready\\.)"
                    },
                    {
                        "style": {
                            "color": "#88aaff"
                        },
                        "regex": "([A-Z][a-z]+ disk)"
                    },
                    {
                        "style": {
                            "color": "#3DB83D"
                        },
                        "regex": "Strike leaves foe vulnerable to a followup (?:jab|punch|grapple|kick) attack!| Foe remains vulnerable to a followup (?:jab|punch|grapple|kick) attack!"
                    },
                    {
                        "style": {
                            "color": "#9090ff"
                        },
                        "regex": "Your .* returns to normal."
                    }
                ],
                "macros": {
                    "ctrl+d": "\\xstance defensive\\r",
                    "ctrl+o": "\\xstance offensive\\r"
                },
                "presets": {
                    "bold": {
                        "color": "yellow",
                        "fontWeight": "bold"
                    },
                    "deaths": {
                        "color": "red"
                    },
                    "disconnects": {
                        "color": "darkred"
                    },
                    "familiar": {
                        "backgroundColor": "#00001a"
                    },
                    "link": {
                        "color": "#0099ff"
                    },
                    "logoffs": {
                        "color": "darkred"
                    },
                    "logons": {
                        "color": "darkgreen"
                    },
                    "mono": {
                        "fontFamily": "\"Lucida Console\", Monaco, monospace",
                        "whiteSpace": "pre-wrap"
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
                    "thoughts": {
                        "backgroundColor": "#001a00"
                    },
                    "voln": {
                        "backgroundColor": "#001a00"
                    },
                    "whisper": {
                        "color": "#66ff66"
                    }
                }
            };

            this.settings = {
                highlights: {},
                presets: {},
                macros: {}
            };

            this.save = function(callback) {
                angular.forEach(['highlights', 'macros', 'presets'], function(name)
                {
                    if (!this.settings[name]) {
                        this.settings[name] = {};
                    }
                }.bind(this));
                chrome.storage.sync.set(this.settings, callback);
            };

            this.load = function(callback) {
                chrome.storage.sync.get(null, function(value) {
                    if (Object.keys(value).length == 0) {
                        this.loadDefaults(callback);
                    } else {
                        this.settings = value;
                        if (callback) {
                            callback();
                        }
                    }
                }.bind(this));
            };

            this.loadDefaults = function(callback) {
                this.settings = defaultSettings;
                this.save(callback);
            };
        };

        return new Settings();
    })
    .controller('SettingsCtrl', function($scope, $modal, $location, Client, SettingsService) {
        $scope.settings = JSON.stringify(SettingsService.settings, undefined, 2);

        $scope.save = function() {
            try {
                var json = JSON.parse($scope.settings);
            } catch (err) {
                $modal.open({
                    templateUrl: 'settings/modal-settings-error.html',
                    scope: $scope,
                    controller: function($scope, $modalInstance) {
                        $scope.ok = function() {
                            $modalInstance.close();
                        };
                    }
                });
            }

            if (json) {
                var error = false;

                if (json.highlights) {
                    angular.forEach(json.highlights, function(hl)
                    {
                        if (error) {
                            return;
                        }

                        if (hl.regex) {
                            try {
                                new RegExp(hl.regex);
                            } catch (err) {
                                $modal.open({
                                    templateUrl: 'settings/modal-settings-regex.html',
                                    scope: $scope,
                                    controller: function($scope, $modalInstance) {
                                        $scope.highlight = hl;
                                        $scope.error = err.message;
                                        $scope.ok = function() {
                                            $modalInstance.close();
                                        };
                                    }
                                });

                                error = true;
                            }
                        }
                    });
                }

                if (!error) {
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
            }
        };

        $scope.defaults = function() {
            SettingsService.loadDefaults(function()
            {
                Client.settings = SettingsService.settings;
                $modal.open({
                    templateUrl: 'settings/modal-defaults-loaded.html',
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
    });