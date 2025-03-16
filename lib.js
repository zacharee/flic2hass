'use strict';

function makeLogger(prefix) {
    var debugMode = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    return {
        info: function info() {
            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                args[_key] = arguments[_key];
            }
            console.log("".concat(prefix, "|INFO| ").concat(args.map(String).join("	")));
        },
        error: function error() {
            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                args[_key] = arguments[_key];
            }
            console.log("".concat(prefix, "|ERROR| ").concat(args.map(String).join("	")));
        },
        debug: function debug() {
            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                args[_key] = arguments[_key];
            }
            if (debugMode) {
                console.log("".concat(prefix, "|DEBUG| ").concat(args.map(String).join("	")));
            }
        }
    };
}

function _define_property$3(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread$3(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property$3(target, key, source[key]);
        });
    }
    return target;
}
var makeOptions$2 = function(opt) {
    return _object_spread$3({
        debug: false
    }, opt);
};
var ENTITIES = {
    action: [
        "sensor",
        {
            icon: "mdi:gesture-tap-button",
            name: "Click Action"
        }
    ],
    state: [
        "sensor",
        {
            icon: "mdi:radiobox-indeterminate-variant"
        }
    ],
    battery: [
        "sensor",
        {
            expire_after: 5,
            unit_of_measurement: "%",
            device_class: "battery"
        }
    ],
    batteryLastUpdate: [
        "sensor",
        {
            entity_category: "diagnostic",
            expire_after: 5,
            name: "Battery Last Update Time",
            device_class: "duration",
            unit_of_measurement: "s"
        }
    ],
    lifeline: [
        "binary_sensor",
        {
            entity_category: "diagnostic",
            expire_after: 5,
            name: "Flichub Connected",
            device_class: "connectivity",
            unit_of_measurement: "s",
            payload_not_available: "OFF"
        }
    ],
    connected: [
        "binary_sensor",
        {
            entity_category: "diagnostic",
            expire_after: 5,
            device_class: "connectivity",
            name: "Connection Established",
            payload_not_available: "OFF"
        }
    ],
    ready: [
        "binary_sensor",
        {
            entity_category: "config",
            expire_after: 5,
            device_class: "connectivity",
            name: "Connection Verified"
        }
    ],
    activeDisconnect: [
        "binary_sensor",
        {
            entity_category: "config",
            expire_after: 5,
            name: "User Active Disconnect"
        }
    ],
    passive: [
        "binary_sensor",
        {
            entity_category: "config",
            expire_after: 5,
            name: "Passive Mode"
        }
    ],
    button_short_press: [
        "device_automation",
        {
            type: "button_short_press",
            subtype: "button_1",
            automation_type: "trigger",
            payload: "ON"
        }
    ],
    button_long_press: [
        "device_automation",
        {
            type: "button_long_press",
            subtype: "button_1",
            automation_type: "trigger",
            payload: "ON"
        }
    ],
    button_double_press: [
        "device_automation",
        {
            type: "button_double_press",
            subtype: "button_1",
            automation_type: "trigger",
            payload: "ON"
        }
    ]
};
function makeButtonController(ha, buttonModule) {
    var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    options = makeOptions$2(options);
    var logger = makeLogger("btnc", options.debug);
    logger.info("Starting Flic ButtonController with", JSON.stringify(options, null, 4));
    var getDeviceFromButton = function(button) {
        return {
            name: button.name,
            identifiers: [
                button.serialNumber,
                button.uuid
            ],
            manufacturer: "Flic",
            model: "v".concat(button.flicVersion, "_").concat(button.color.trim().length > 0 ? button.color : "white"),
            sw: String(button.firmwareVersion),
            hw: String(button.flicVersion),
            configuration_url: "https://hubsdk.flic.io/"
        };
    };
    var genButtonUniqueId = function(bdaddr) {
        return bdaddr.replace(/:/g, "_");
    };
    var registerButton = function(button) {
        logger.info("Registering", JSON.stringify(button, null, 4));
        var haDevice = getDeviceFromButton(button);
        Object.keys(ENTITIES).forEach(function(objectId) {
            var avl = {
                availability: [
                    {
                        payload_available: "ON",
                        payload_not_available: "unavailable",
                        topic: ha.genFlicPrefix(genButtonUniqueId(button.bdaddr), "ready")
                    },
                    {
                        payload_available: "ON",
                        payload_not_available: "unavailable",
                        topic: ha.genFlicPrefix(genButtonUniqueId(button.bdaddr), "lifeline")
                    }
                ],
                availability_mode: "all"
            };
            if (objectId === "lifeline") {
                avl = {};
            }
            if (objectId === "ready" || objectId == "connected") {
                avl.availability = [
                    avl.availability[1]
                ];
            }
            if (ENTITIES[objectId][0] === "device_automation") {
                avl = {};
            }
            ha.registerEntity("Button ".concat(objectId), ENTITIES[objectId][0], genButtonUniqueId(button.bdaddr), objectId, haDevice, _object_spread$3({}, ENTITIES[objectId][1], avl));
        });
    };
    var deregisterButton = function(button) {
        logger.info("Deregistering", JSON.stringify(button, null, 4));
        Object.keys(ENTITIES).forEach(function(objectId) {
            ha.deregisterEntity(ENTITIES[objectId][0], genButtonUniqueId(button.bdaddr), objectId);
        });
    };
    var publishButtonState = function(button, state) {
        ha.publishState(genButtonUniqueId(button.bdaddr), "state", state);
    };
    var publishButtonAction = function(button, state) {
        ha.publishState(genButtonUniqueId(button.bdaddr), "action", state);
        if (state === "click") {
            ha.publishState(genButtonUniqueId(button.bdaddr), "button_short_press", "ON");
        } else if (state === "double_click") {
            ha.publishState(genButtonUniqueId(button.bdaddr), "button_double_press", "ON");
        } else if (state === "hold") {
            ha.publishState(genButtonUniqueId(button.bdaddr), "button_long_press", "ON");
        }
    };
    var publishButtonMeta = function(button) {
        ha.publishState(genButtonUniqueId(button.bdaddr), "battery", button.batteryStatus);
        ha.publishState(genButtonUniqueId(button.bdaddr), "batteryLastUpdate", button.batteryTimestamp ? "".concat(Math.round((Date.now() - button.batteryTimestamp) / 1000)) : "unknown");
        ha.publishState(genButtonUniqueId(button.bdaddr), "connected", button.connected ? "ON" : "OFF");
        ha.publishState(genButtonUniqueId(button.bdaddr), "ready", button.ready ? "ON" : "OFF");
        ha.publishState(genButtonUniqueId(button.bdaddr), "activeDisconnect", button.activeDisconnect ? "ON" : "OFF");
        ha.publishState(genButtonUniqueId(button.bdaddr), "passive", button.activeDisconnect ? "ON" : "OFF");
        ha.publishState(genButtonUniqueId(button.bdaddr), "lifeline", "ON");
    };
    var addBtn = function(eventName) {
        return function(obj) {
            var button = buttonModule.getButton(obj.bdaddr);
            logger.info(eventName, "upserting", button.name, genButtonUniqueId(button.bdaddr));
            registerButton(button);
        };
    };
    var start = function() {
        logger.info("Starting...");
        var resetActiontInv = null;
        buttonModule.on("buttonAdded", addBtn("buttonAdded"));
        buttonModule.on("buttonConnected", addBtn("buttonConnected"));
        buttonModule.on("buttonReady", function(btn) {
            addBtn("buttonReady")(btn);
            var button = buttonModule.getButton(btn.bdaddr);
            publishButtonState(button, "released");
            publishButtonAction(button, "none");
        });
        buttonModule.on("buttonUpdated", addBtn("buttonUpdated"));
        buttonModule.on("buttonDeleted", function(btn) {
            logger.debug("buttonDeleted", JSON.stringify(btn, null, 4));
            deregisterButton(btn);
            publishButtonMeta(btn);
        });
        buttonModule.on("buttonDisconnected", function(param) {
            var bdaddr = param.bdaddr;
            publishButtonMeta(buttonModule.getButton(bdaddr));
        });
        buttonModule.on("buttonDown", function(param) {
            var bdaddr = param.bdaddr;
            var btn = buttonModule.getButton(bdaddr);
            publishButtonState(btn, "pressed");
            publishButtonMeta(btn);
        });
        buttonModule.on("buttonUp", function(param) {
            var bdaddr = param.bdaddr;
            var btn = buttonModule.getButton(bdaddr);
            publishButtonState(btn, "released");
            publishButtonMeta(btn);
        });
        buttonModule.on("buttonSingleOrDoubleClickOrHold", function(obj) {
            if (resetActiontInv !== null) {
                clearTimeout(resetActiontInv);
            }
            var btn = buttonModule.getButton(obj.bdaddr);
            publishButtonAction(btn, obj.isSingleClick ? "click" : obj.isDoubleClick ? "double_click" : "hold");
            publishButtonMeta(btn);
            resetActiontInv = setTimeout(function() {
                publishButtonAction(btn, "none");
            }, 500);
        });
        logger.info("Registering all buttons...");
        buttonModule.getButtons().forEach(registerButton);
        setInterval(function() {
            return buttonModule.getButtons().forEach(publishButtonMeta);
        }, 3000);
        logger.info("is up");
    };
    return {
        start: start,
        publishButtonAction: publishButtonAction,
        publishButtonMeta: publishButtonMeta,
        publishButtonState: publishButtonState
    };
}

function _define_property$2(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread$2(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property$2(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys$1(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props$1(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys$1(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
var makeOptions$1 = function(opt) {
    return _object_spread_props$1(_object_spread$2({
        debug: false
    }, opt), {
        topics: _object_spread$2({
            homeassistant: "homeassistant",
            flic: "flic"
        }, opt.topics)
    });
};
function makeHAmqtt(mqttServer) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    options = makeOptions$1(options);
    var logger = makeLogger("mqtt:ha", options.debug);
    logger.info("starting...", JSON.stringify(options, null, 4));
    var genFlicPrefix = function(nodeId, objectId) {
        return "".concat(options.topics.flic, "/").concat(nodeId, "/").concat(objectId);
    };
    var genHAPrefix = function(component, nodeId, objectId) {
        return "".concat(options.topics.homeassistant, "/").concat(component, "/").concat(nodeId, "/").concat(objectId);
    };
    var publishState = function(nodeId, objectId, state) {
        var opt = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
        var btntopic = genFlicPrefix(nodeId, objectId);
        mqttServer.publish(btntopic, state + "", opt);
        logger.debug(btntopic, state, JSON.stringify(opt));
    };
    var registerEntity = function(name, component, nodeId, objectId, device) {
        var additionalProps = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : {};
        var configtopic = genHAPrefix(component, nodeId, objectId) + "/config";
        if (component === "device_automation") {
            additionalProps.topic = genFlicPrefix(nodeId, objectId);
        } else {
            additionalProps.state_topic = genFlicPrefix(nodeId, objectId);
        }
        var configObj = _object_spread_props$1(_object_spread$2({
            name: name
        }, additionalProps), {
            unique_id: "Flic_".concat(nodeId, "_").concat(objectId),
            device: device
        });
        mqttServer.publish(configtopic, JSON.stringify(configObj), {
            retain: true
        });
        logger.debug(configtopic, JSON.stringify(configObj, null, 4));
    };
    var deregisterEntity = function(component, nodeId, objectId) {
        var configtopic = genHAPrefix(component, nodeId, objectId) + "/config";
        mqttServer.publish(configtopic, null, {
            retain: false
        });
        logger.debug(configtopic, null);
    };
    return {
        deregisterEntity: deregisterEntity,
        registerEntity: registerEntity,
        publishState: publishState,
        genFlicPrefix: genFlicPrefix
    };
}

// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.5
var LZString = function() {
    // private property
    var f = String.fromCharCode;
    var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
    var baseReverseDic = {};
    function getBaseValue(alphabet, character) {
        if (!baseReverseDic[alphabet]) {
            baseReverseDic[alphabet] = {};
            for(var i = 0; i < alphabet.length; i++){
                baseReverseDic[alphabet][alphabet.charAt(i)] = i;
            }
        }
        return baseReverseDic[alphabet][character];
    }
    var LZString = {
        compressToBase64: function compressToBase64(input) {
            if (input == null) return "";
            var res = LZString._compress(input, 6, function(a) {
                return keyStrBase64.charAt(a);
            });
            switch(res.length % 4){
                default:
                case 0:
                    return res;
                case 1:
                    return res + "===";
                case 2:
                    return res + "==";
                case 3:
                    return res + "=";
            }
        },
        decompressFromBase64: function decompressFromBase64(input) {
            if (input == null) return "";
            if (input == "") return null;
            return LZString._decompress(input.length, 32, function(index) {
                return getBaseValue(keyStrBase64, input.charAt(index));
            });
        },
        compressToUTF16: function compressToUTF16(input) {
            if (input == null) return "";
            return LZString._compress(input, 15, function(a) {
                return f(a + 32);
            }) + " ";
        },
        decompressFromUTF16: function decompressFromUTF16(compressed) {
            if (compressed == null) return "";
            if (compressed == "") return null;
            return LZString._decompress(compressed.length, 16384, function(index) {
                return compressed.charCodeAt(index) - 32;
            });
        },
        //compress into uint8array (UCS-2 big endian format)
        compressToUint8Array: function compressToUint8Array(uncompressed) {
            var compressed = LZString.compress(uncompressed);
            var buf = new Uint8Array(compressed.length * 2); // 2 bytes per character
            for(var i = 0, TotalLen = compressed.length; i < TotalLen; i++){
                var current_value = compressed.charCodeAt(i);
                buf[i * 2] = current_value >>> 8;
                buf[i * 2 + 1] = current_value % 256;
            }
            return buf;
        },
        //decompress from uint8array (UCS-2 big endian format)
        decompressFromUint8Array: function decompressFromUint8Array(compressed) {
            if (compressed === null || compressed === undefined) {
                return LZString.decompress(compressed);
            } else {
                var buf = new Array(compressed.length / 2); // 2 bytes per character
                for(var i = 0, TotalLen = buf.length; i < TotalLen; i++){
                    buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
                }
                var result = [];
                buf.forEach(function(c) {
                    result.push(f(c));
                });
                return LZString.decompress(result.join(""));
            }
        },
        //compress into a string that is already URI encoded
        compressToEncodedURIComponent: function compressToEncodedURIComponent(input) {
            if (input == null) return "";
            return LZString._compress(input, 6, function(a) {
                return keyStrUriSafe.charAt(a);
            });
        },
        //decompress from an output of compressToEncodedURIComponent
        decompressFromEncodedURIComponent: function decompressFromEncodedURIComponent(input) {
            if (input == null) return "";
            if (input == "") return null;
            input = input.replace(/ /g, "+");
            return LZString._decompress(input.length, 32, function(index) {
                return getBaseValue(keyStrUriSafe, input.charAt(index));
            });
        },
        compress: function compress(uncompressed) {
            return LZString._compress(uncompressed, 16, function(a) {
                return f(a);
            });
        },
        _compress: function _compress(uncompressed, bitsPerChar, getCharFromInt) {
            if (uncompressed == null) return "";
            var i, value, context_dictionary = {}, context_dictionaryToCreate = {}, context_c = "", context_wc = "", context_w = "", context_enlargeIn = 2, context_dictSize = 3, context_numBits = 2, context_data = [], context_data_val = 0, context_data_position = 0, ii;
            for(ii = 0; ii < uncompressed.length; ii += 1){
                context_c = uncompressed.charAt(ii);
                if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                    context_dictionary[context_c] = context_dictSize++;
                    context_dictionaryToCreate[context_c] = true;
                }
                context_wc = context_w + context_c;
                if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                    context_w = context_wc;
                } else {
                    if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                        if (context_w.charCodeAt(0) < 256) {
                            for(i = 0; i < context_numBits; i++){
                                context_data_val = context_data_val << 1;
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                            }
                            value = context_w.charCodeAt(0);
                            for(i = 0; i < 8; i++){
                                context_data_val = context_data_val << 1 | value & 1;
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = value >> 1;
                            }
                        } else {
                            value = 1;
                            for(i = 0; i < context_numBits; i++){
                                context_data_val = context_data_val << 1 | value;
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = 0;
                            }
                            value = context_w.charCodeAt(0);
                            for(i = 0; i < 16; i++){
                                context_data_val = context_data_val << 1 | value & 1;
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = value >> 1;
                            }
                        }
                        context_enlargeIn--;
                        if (context_enlargeIn == 0) {
                            context_enlargeIn = Math.pow(2, context_numBits);
                            context_numBits++;
                        }
                        delete context_dictionaryToCreate[context_w];
                    } else {
                        value = context_dictionary[context_w];
                        for(i = 0; i < context_numBits; i++){
                            context_data_val = context_data_val << 1 | value & 1;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    // Add wc to the dictionary.
                    context_dictionary[context_wc] = context_dictSize++;
                    context_w = String(context_c);
                }
            }
            // Output the code for w.
            if (context_w !== "") {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for(i = 0; i < context_numBits; i++){
                            context_data_val = context_data_val << 1;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                        }
                        value = context_w.charCodeAt(0);
                        for(i = 0; i < 8; i++){
                            context_data_val = context_data_val << 1 | value & 1;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    } else {
                        value = 1;
                        for(i = 0; i < context_numBits; i++){
                            context_data_val = context_data_val << 1 | value;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = 0;
                        }
                        value = context_w.charCodeAt(0);
                        for(i = 0; i < 16; i++){
                            context_data_val = context_data_val << 1 | value & 1;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    delete context_dictionaryToCreate[context_w];
                } else {
                    value = context_dictionary[context_w];
                    for(i = 0; i < context_numBits; i++){
                        context_data_val = context_data_val << 1 | value & 1;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
            }
            // Mark the end of the stream
            value = 2;
            for(i = 0; i < context_numBits; i++){
                context_data_val = context_data_val << 1 | value & 1;
                if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                } else {
                    context_data_position++;
                }
                value = value >> 1;
            }
            // Flush the last char
            while(true){
                context_data_val = context_data_val << 1;
                if (context_data_position == bitsPerChar - 1) {
                    context_data.push(getCharFromInt(context_data_val));
                    break;
                } else context_data_position++;
            }
            return context_data.join("");
        },
        decompress: function decompress(compressed) {
            if (compressed == null) return "";
            if (compressed == "") return null;
            return LZString._decompress(compressed.length, 32768, function(index) {
                return compressed.charCodeAt(index);
            });
        },
        _decompress: function _decompress(length, resetValue, getNextValue) {
            var dictionary = [], enlargeIn = 4, dictSize = 4, numBits = 3, entry = "", result = [], i, w, bits, resb, maxpower, power, c, data = {
                val: getNextValue(0),
                position: resetValue,
                index: 1
            };
            for(i = 0; i < 3; i += 1){
                dictionary[i] = i;
            }
            bits = 0;
            maxpower = Math.pow(2, 2);
            power = 1;
            while(power != maxpower){
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
            }
            switch(bits){
                case 0:
                    bits = 0;
                    maxpower = Math.pow(2, 8);
                    power = 1;
                    while(power != maxpower){
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    c = f(bits);
                    break;
                case 1:
                    bits = 0;
                    maxpower = Math.pow(2, 16);
                    power = 1;
                    while(power != maxpower){
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    c = f(bits);
                    break;
                case 2:
                    return "";
            }
            dictionary[3] = c;
            w = c;
            result.push(c);
            while(true){
                if (data.index > length) {
                    return "";
                }
                bits = 0;
                maxpower = Math.pow(2, numBits);
                power = 1;
                while(power != maxpower){
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                switch(c = bits){
                    case 0:
                        bits = 0;
                        maxpower = Math.pow(2, 8);
                        power = 1;
                        while(power != maxpower){
                            resb = data.val & data.position;
                            data.position >>= 1;
                            if (data.position == 0) {
                                data.position = resetValue;
                                data.val = getNextValue(data.index++);
                            }
                            bits |= (resb > 0 ? 1 : 0) * power;
                            power <<= 1;
                        }
                        dictionary[dictSize++] = f(bits);
                        c = dictSize - 1;
                        enlargeIn--;
                        break;
                    case 1:
                        bits = 0;
                        maxpower = Math.pow(2, 16);
                        power = 1;
                        while(power != maxpower){
                            resb = data.val & data.position;
                            data.position >>= 1;
                            if (data.position == 0) {
                                data.position = resetValue;
                                data.val = getNextValue(data.index++);
                            }
                            bits |= (resb > 0 ? 1 : 0) * power;
                            power <<= 1;
                        }
                        dictionary[dictSize++] = f(bits);
                        c = dictSize - 1;
                        enlargeIn--;
                        break;
                    case 2:
                        return result.join("");
                }
                if (enlargeIn == 0) {
                    enlargeIn = Math.pow(2, numBits);
                    numBits++;
                }
                if (dictionary[c]) {
                    entry = dictionary[c];
                } else {
                    if (c === dictSize) {
                        entry = w + w.charAt(0);
                    } else {
                        return null;
                    }
                }
                result.push(entry);
                // Add w+entry[0] to the dictionary.
                dictionary[dictSize++] = w + entry.charAt(0);
                enlargeIn--;
                w = entry;
                if (enlargeIn == 0) {
                    enlargeIn = Math.pow(2, numBits);
                    numBits++;
                }
            }
        }
    };
    return LZString;
}();

function _define_property$1(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread$1(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property$1(target, key, source[key]);
        });
    }
    return target;
}
var NODE_ID = "FlicHubIR";
var convertUint32Array2Str = function(arr) {
    var outStr = [];
    for(var i = 0; i < arr.length; i++){
        outStr.push(arr[i].toString(32));
    }
    return outStr.join("");
};
var convertStr2Uint32Array = function(s) {
    var a = [];
    for(var i = 0, charsLength = s.length; i < charsLength; i += 2){
        a.push(s.substring(i, i + 2));
    }
    return new Uint32Array(a.slice(0, a.length - 2).map(function(v) {
        return parseInt(v, 32);
    }));
};
var makeOptions = function(opt) {
    return _object_spread$1({
        debug: false,
        uniqueId: "0"
    }, opt);
};
var makeIRController = function(ir, ha, mqtt) {
    var options = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
    options = makeOptions(options);
    var logger = makeLogger("ir", options.debug);
    var haDevice = {
        name: "IR",
        manufacturer: "Flic",
        model: "".concat(NODE_ID).concat(options.uniqueId),
        identifiers: [
            "FlicHubIR"
        ],
        configuration_url: "https://hubsdk.flic.io/"
    };
    var nodeId = "".concat(NODE_ID).concat(options.uniqueId);
    var LIFELINE_SGINAL = ha.genFlicPrefix(nodeId, "lifeline");
    var RECORD_SIGNAL_SET = ha.genFlicPrefix(nodeId, "record/set");
    var VALUE_SIGNAL_SET = ha.genFlicPrefix(nodeId, "signal/set");
    var VALUE_SIGNAL_STATE = ha.genFlicPrefix(nodeId, "signal");
    var PLAY_SIGNAL_SET = ha.genFlicPrefix(nodeId, "play/set");
    var availability = [
        {
            payload_available: "ON",
            payload_not_available: "unavailable",
            topic: LIFELINE_SGINAL
        }
    ];
    var currentSignal = null;
    var set_topics = [
        RECORD_SIGNAL_SET,
        VALUE_SIGNAL_SET,
        PLAY_SIGNAL_SET,
        VALUE_SIGNAL_STATE
    ];
    return {
        start: function start() {
            logger.info("starting...");
            logger.debug("setting up entities...");
            ha.registerEntity("IR Available", "binary_sensor", nodeId, "lifeline", haDevice, {
                device_class: "connectivity",
                expire_after: 5,
                off_delay: 3,
                entity_category: "diagnostic",
                payload_available: "ON",
                payload_not_available: "OFF"
            });
            ha.registerEntity("Record Signal", "switch", nodeId, "record", haDevice, {
                icon: "mdi:record-rec",
                command_topic: RECORD_SIGNAL_SET,
                device_class: "switch",
                availability: availability
            });
            ha.registerEntity("Signal", "text", nodeId, "signal", haDevice, {
                command_topic: VALUE_SIGNAL_SET,
                icon: "mdi:broadcast",
                max: 255,
                availability: availability
            });
            ha.registerEntity("Play Signal", "button", nodeId, "play", haDevice, {
                icon: "mdi:play",
                command_topic: PLAY_SIGNAL_SET,
                availability: availability
            });
            logger.debug("setting default states....");
            ha.publishState(nodeId, "record", "OFF");
            ha.publishState(nodeId, "play", "OFF");
            logger.debug("registering events");
            mqtt.on("message", function(topic, message) {
                logger.debug("message:", JSON.stringify({
                    topic: topic,
                    message: message
                }));
                if (topic === RECORD_SIGNAL_SET) {
                    logger.debug("starting record");
                    ir.record();
                    ha.publishState(nodeId, "record", "ON");
                } else if (topic === PLAY_SIGNAL_SET) {
                    if (currentSignal !== null) {
                        logger.info("playing", currentSignal);
                        var arr = null;
                        try {
                            arr = convertStr2Uint32Array(currentSignal);
                        } catch (err) {
                            logger.error("invalid string signal set", JSON.stringify(err), err);
                            return;
                        }
                        logger.info("playing array", JSON.stringify(arr));
                        ir.play(arr, function(err) {
                            if (err) {
                                logger.error("failed to play signal", JSON.stringify(err), err);
                            } else {
                                logger.debug("signal played!");
                            }
                        });
                    } else {
                        logger.error("cannot play an unset signal");
                    }
                } else if (topic === VALUE_SIGNAL_STATE) {
                    currentSignal = LZString.decompress(message);
                    logger.info("setting currentSignal", currentSignal);
                } else if (topic === VALUE_SIGNAL_SET) {
                    ha.publishState(nodeId, "signal", message, {
                        retain: true
                    });
                }
            });
            ir.on("recordComplete", function(data) {
                var stringMessage = convertUint32Array2Str(data);
                var compressedMessage = LZString.compress(stringMessage);
                logger.debug("recording complete");
                logger.debug(JSON.stringify(data));
                logger.debug(stringMessage);
                logger.debug(JSON.stringify(convertStr2Uint32Array(stringMessage)));
                logger.debug(compressedMessage);
                if (compressedMessage.length > 255) {
                    logger.error("stringMessage is too big! size=", compressedMessage.length, "max=255");
                }
                ha.publishState(nodeId, "signal", compressedMessage, {
                    retain: true
                });
                ha.publishState(nodeId, "record", "OFF");
            });
            logger.debug("subscribing to", set_topics);
            mqtt.subscribe(set_topics);
            setInterval(function() {
                ha.publishState(nodeId, "lifeline", "ON");
            }, 2500);
            logger.info("is up");
        }
    };
};

/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd

------------------------------------------------------------------------------

All sections of code within this repository are licensed under an MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

-----------------------------------------------------------------------------

Modified by Flic Shortcut Labs.

*/ /** 'private' constants */ function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var C = {
    PROTOCOL_LEVEL: 4,
    DEF_PORT: 1883,
    DEF_KEEP_ALIVE: 60 // Default keep_alive (s)
};
/** Control packet types */ var TYPE = {
    CONNECT: 1,
    CONNACK: 2,
    PUBLISH: 3,
    PUBACK: 4,
    PUBREC: 5,
    PUBREL: 6,
    PUBCOMP: 7,
    SUBSCRIBE: 8,
    SUBACK: 9,
    UNSUBSCRIBE: 10,
    UNSUBACK: 11,
    PINGREQ: 12,
    PINGRESP: 13,
    DISCONNECT: 14
};
var pakId = Math.floor(Math.random() * 65534);
Uint8Array.prototype.charCodeAt = function(a, b) {
    return this.toString().charCodeAt(a, b);
};
/**
 Return Codes
 http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc385349256
 **/ var RETURN_CODES = {
    0: "ACCEPTED",
    1: "UNACCEPTABLE_PROTOCOL_VERSION",
    2: "IDENTIFIER_REJECTED",
    3: "SERVER_UNAVAILABLE",
    4: "BAD_USER_NAME_OR_PASSWORD",
    5: "NOT_AUTHORIZED"
};
/** MQTT constructor */ function MQTT(server, options) {
    this.server = server;
    options = options || {};
    this.port = options.port || C.DEF_PORT;
    this.client_id = options.client_id || mqttUid();
    this.keep_alive = options.keep_alive || C.DEF_KEEP_ALIVE;
    this.clean_session = options.clean_session || true;
    this.username = options.username;
    this.password = options.password;
    this.client = false;
    this.connected = false;
    /* if keep_alive is less than the ping interval we need to use
      a shorter ping interval, otherwise we'll just time out! */ this.ping_interval = this.keep_alive < this.C.PING_INTERVAL ? this.keep_alive - 5 : this.C.PING_INTERVAL;
    this.protocol_name = options.protocol_name || "MQTT";
    this.protocol_level = options.protocol_level || C.PROTOCOL_LEVEL;
    if (typeof this.client_id == "string") {
        var payloadarray = [
            this.client_id.length >> 8,
            this.client_id.length & 255
        ];
        var i = 2;
        var messagearray = this.client_id.split("");
        for(var j = 0; j < this.client_id.length; j++){
            var _char = messagearray[j];
            var numberrepres = _char.charCodeAt(0);
            payloadarray[i] = numberrepres;
            i = i + 1;
        }
        this.client_id = payloadarray;
    }
    if (this.password) {
        var payloadarray = [
            this.password.length >> 8,
            this.password.length & 255
        ];
        var i = 2;
        var messagearray = this.password.split("");
        for(var j = 0; j < this.password.length; j++){
            var _char = messagearray[j];
            var numberrepres = _char.charCodeAt(0);
            payloadarray[i] = numberrepres;
            i = i + 1;
        }
        this.password = payloadarray;
    }
    if (this.username) {
        var payloadarray = [
            this.username.length >> 8,
            this.username.length & 255
        ];
        var i = 2;
        var messagearray = this.username.split("");
        for(var j = 0; j < this.username.length; j++){
            var _char = messagearray[j];
            var numberrepres = _char.charCodeAt(0);
            payloadarray[i] = numberrepres;
            i = i + 1;
        }
        this.username = payloadarray;
    }
}
var __listeners = {};
Object.prototype.on = function(type, fn) {
    if (!__listeners[type]) {
        __listeners[type] = [];
    }
    __listeners[type].push(fn);
};
Object.prototype.emit = function(type) {
    for(var _len = arguments.length, data = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
        data[_key - 1] = arguments[_key];
    }
    if (__listeners[type]) {
        __listeners[type].map(function(fn) {
            fn.apply(void 0, _to_consumable_array(data));
        });
    }
};
if (!Buffer.from) {
    Buffer.from = function(a) {
        return new Buffer(a);
    };
}
/** 'public' constants here */ MQTT.prototype.C = {
    DEF_QOS: 0,
    CONNECT_TIMEOUT: 10000,
    PING_INTERVAL: 40 // Server ping interval (s)
};
/* Utility functions ***************************/ var fromCharCode = String.fromCharCode;
/** MQTT string (length MSB, LSB + data) */ function mqttStr(s) {
    var payloadarray = [
        s.length >> 8,
        s.length & 255
    ];
    var i = 2;
    var messagearray = s.split("");
    for(var j = 0; j < s.length; j++){
        var _char = messagearray[j];
        var numberrepres = _char.charCodeAt(0);
        payloadarray[i] = numberrepres;
        i = i + 1;
    }
    return payloadarray;
}
function mqttInt2Str(arr) {
    var outStr = "";
    for(var i = 0; i < arr.length; i++){
        outStr += createEscapedHex(arr[i]);
    }
    return outStr;
}
/** MQTT packet length formatter - algorithm from reference docs */ function mqttPacketLength(length) {
    var encLength = [];
    var i = 0;
    do {
        var encByte = length & 127;
        length = length >> 7;
        // if there are more data to encode, set the top bit of this byte
        if (length > 0) {
            encByte += 128;
        }
        encLength[i] = encByte;
        i++;
    }while (length > 0);
    return encLength;
}
/** MQTT packet length decoder - algorithm from reference docs */ function mqttPacketLengthDec(length) {
    var bytes = 0;
    var decL = 0;
    var lb = 0;
    do {
        lb = length[bytes];
        decL |= (lb & 127) << bytes++ * 7;
    }while (lb & 128 && bytes < 4);
    return {
        decLen: decL,
        lenBy: bytes
    };
}
/** MQTT standard packet formatter */ function mqttPacket(cmd, variable, payload) {
    var cmdAndLengthArray = [
        cmd
    ].concat(mqttPacketLength(variable.length + payload.length));
    var headerAndPayloadArray = cmdAndLengthArray.concat(variable).concat(payload);
    var messageBuffer = Buffer.from(headerAndPayloadArray);
    return messageBuffer;
}
/** Generate random UID */ var mqttUid = function() {
    function s4() {
        var numberstring = Math.floor(1 + Math.random() * 10);
        if (numberstring == 10) numberstring = 9;
        numberstring = 97 + numberstring;
        return numberstring;
    }
    return function() {
        var output = [
            0,
            12,
            s4(),
            s4(),
            s4(),
            s4(),
            s4(),
            s4(),
            s4(),
            s4(),
            s4(),
            s4(),
            s4(),
            s4()
        ];
        return output;
    };
}();
/** Generate PID */ function mqttPid() {
    pakId = pakId > 65534 ? 1 : ++pakId;
    return [
        pakId >> 8,
        pakId & 0xFF
    ];
}
/** Get PID from message */ function getPid(data) {
    return data.slice(0, 2);
}
/** PUBLISH control packet */ function mqttPublish(topic, message, qos, flags) {
    var cmd = TYPE.PUBLISH << 4 | qos << 1 | flags;
    var variable = mqttStr(topic);
    // Packet id must be included for QOS > 0
    if (qos > 0) {
        var newvariable = variable.concat(mqttPid());
        return mqttPacket(cmd, newvariable, message);
    } else {
        return mqttPacket(cmd, variable, message);
    }
}
/** SUBSCRIBE control packet */ function mqttSubscribe(topic, qos) {
    var cmd = TYPE.SUBSCRIBE << 4 | 2;
    var payloadarray = [];
    var i = 0;
    var messagearray = topic.split("");
    for(var j = 0; j < topic.length; j++){
        var _char = messagearray[j];
        var numberrepres = _char.charCodeAt(0);
        payloadarray[i] = numberrepres;
        i = i + 1;
    }
    return mqttPacket(cmd, mqttPid(), mqttStr(topic).concat([
        qos
    ]));
}
/** UNSUBSCRIBE control packet */ function mqttUnsubscribe(topic) {
    var cmd = TYPE.UNSUBSCRIBE << 4 | 2;
    return mqttPacket(cmd, mqttPid(), mqttStr(topic));
}
/** Create escaped hex value from number */ function createEscapedHex(n) {
    return fromCharCode(parseInt(n.toString(16), 16));
}
// Handle a single packet of data
MQTT.prototype.packetHandler = function(data) {
    // if we had some data left over from last
    // time, add it on
    if (this.partData && this.partData.length > 0) {
        data = Buffer.from(Array.prototype.slice.call(this.partData).concat(Array.prototype.slice.call(data)));
        this.partData = [];
    }
    // Figure out packet length...
    var dLen = mqttPacketLengthDec(data.slice(1, data.length));
    var pLen = dLen.decLen + dLen.lenBy + 1;
    // less than one packet?
    if (data.length < pLen) {
        this.partData = data;
        return;
    }
    // Allow zero-size pData, but detect if its indexes
    // will go out of bounds.
    if (1 + dLen.lenBy >= data.length) {
        return;
    }
    // Get the data for this packet
    var pData = data.slice(1 + dLen.lenBy, pLen);
    // more than one packet? re-emit it so we handle it later
    if (data.length > pLen) {
        this.client.emit("data", data.slice(pLen, data.length));
    }
    // Now handle this MQTT packet
    var cmd = data[0];
    var type = cmd >> 4;
    if (type === TYPE.PUBLISH) {
        var qos = (cmd & 0x6) >> 1;
        var topic_len = pData[0] << 8 | pData[1];
        var msg_start = 2 + topic_len + (qos ? 2 : 0);
        var parsedData = {
            topic: pData.slice(2, 2 + topic_len),
            message: pData.slice(msg_start, pData.length),
            dup: (cmd & 0x8) >> 3,
            qos: qos,
            pid: qos ? pData.slice(2 + topic_len, 4 + topic_len) : 0,
            retain: cmd & 0x1
        };
        if (parsedData.qos) {
            this.client.write([
                (parsedData.qos == 1 ? TYPE.PUBACK : TYPE.PUBREC) << 4,
                2,
                parsedData.pid
            ]);
        }
        this.emit("publish", parsedData);
        this.emit("message", mqttInt2Str(parsedData.topic), mqttInt2Str(parsedData.message));
    } else if (type === TYPE.PUBACK) {
        this.emit("puback", data.charCodeAt(2) << 8 | data.charCodeAt(3));
    } else if (type === TYPE.PUBREC) {
        var pubrelArray = [
            TYPE.PUBREL << 4 | 2,
            2
        ];
        var pidArray = Array.prototype.slice.call(getPid(pData));
        var pubrecResponse = pubrelArray.concat(pidArray);
        this.client.write(Buffer.from(pubrecResponse));
    } else if (type === TYPE.PUBREL) {
        var pubcompArray = [
            TYPE.PUBCOMP << 4,
            2
        ];
        var pidArray = Array.prototype.slice.call(getPid(pData));
        var pubrelResponse = pubcompArray.concat(pidArray);
        this.client.write(pubrelResponse);
    } else if (type === TYPE.PUBCOMP) {
        this.emit("pubcomp", data.charCodeAt(2) << 8 | data.charCodeAt(3));
    } else if (type === TYPE.SUBACK) {
        if (pData.length > 0) {
            if (pData[pData.length - 1] == 0x80) {
                this.emit("subscribed_fail");
            } else {
                this.emit("subscribed");
            }
        }
    } else if (type === TYPE.UNSUBACK) {
        this.emit("unsubscribed");
    } else if (type === TYPE.PINGREQ) {
        this.client.write([
            TYPE.PINGRESP << 4,
            0
        ]);
    } else if (type === TYPE.PINGRESP) {
        this.emit("ping_reply");
    } else if (type === TYPE.CONNACK) {
        if (this.ctimo) clearTimeout(this.ctimo);
        this.ctimo = undefined;
        this.partData = [];
        var returnCode = pData[1];
        if (RETURN_CODES[returnCode] === "ACCEPTED") {
            this.connected = true;
            // start pinging
            if (this.pintr) clearInterval(this.pintr);
            this.pintr = setInterval(this.ping.bind(this), this.ping_interval * 1000);
            // emit connected events
            this.emit("connected");
            this.emit("connect");
        } else {
            var mqttError = "Connection refused, ";
            this.connected = false;
            if (returnCode > 0 && returnCode < 6) {
                mqttError += RETURN_CODES[returnCode];
            } else {
                mqttError += "unknown return code: " + returnCode + ".";
            }
            this.emit("error", mqttError);
        }
    } else {
        this.emit("error", "MQTT unsupported packet type: " + type);
    }
};
/* Public interface ****************************/ /** Establish connection and set up keep_alive ping */ MQTT.prototype.connect = function(client) {
    if (this.connected) return;
    var mqo = this;
    var onConnect = function onConnect() {
        mqo.client = client;
        // write connection message
        var teststring = mqo.mqttConnect(mqo.client_id);
        client.write(teststring);
        // handle connection timeout if too slow
        mqo.ctimo = setTimeout(function() {
            mqo.ctimo = undefined;
            mqo.emit("disconnected");
            mqo.disconnect();
        }, mqo.C.CONNECT_TIMEOUT);
        // Incoming data
        client.on("data", mqo.packetHandler.bind(mqo));
        // Socket closed
        client.on("end", function() {
            mqo._scktClosed();
        });
    };
    if (client) {
        onConnect();
    } else {
        try {
            var self = this;
            client = require("net").Socket().connect({
                host: mqo.server,
                port: mqo.port
            }, onConnect);
            client.on("error", function(err) {
                self.emit("error", err.message);
            });
        } catch (e) {
            this.client = false;
            this.emit("error", e.message);
        }
    }
};
/** Called internally when the connection closes  */ MQTT.prototype._scktClosed = function() {
    if (this.connected) {
        this.connected = false;
        this.client = false;
        if (this.pintr) clearInterval(this.pintr);
        if (this.ctimo) clearTimeout(this.ctimo);
        this.pintr = this.ctimo = undefined;
        this.emit("disconnected");
        this.emit("close");
    }
};
/** Disconnect from server */ MQTT.prototype.disconnect = function() {
    if (!this.client) return;
    try {
        this.client.write(Buffer.from([
            TYPE.DISCONNECT << 4,
            0
        ]));
    } catch (e) {
        return this._scktClosed();
    }
    this.client.end();
    this.client = false;
};
/** Publish message using specified topic.
 opts = {
 retain: bool // the server should retain this message and send it out again to new subscribers
 dup : bool   // indicate the message is a duplicate because original wasn't ACKed (QoS > 0 only)
 }
 */ MQTT.prototype.publish = function(topic, message, opts) {
    if (!this.client) return;
    opts = opts || {};
    try {
        var payloadarray = [];
        var i = 0;
        var messagearray = message.split("");
        for(var j = 0; j < message.length; j++){
            var _char = messagearray[j];
            var numberrepres = _char.charCodeAt(0);
            payloadarray[i] = numberrepres;
            i = i + 1;
        }
        var publishMessage = mqttPublish(topic, payloadarray, opts.qos || this.C.DEF_QOS, (opts.retain ? 1 : 0) | (opts.dup ? 8 : 0));
        this.client.write(publishMessage);
    } catch (e) {
        this._scktClosed();
    }
};
/** Subscribe to topic (filter) */ MQTT.prototype.subscribe = function(topics, opts) {
    if (!this.client) return;
    opts = opts || {};
    var subs = [];
    if ("string" === typeof topics) {
        topics = [
            topics
        ];
    }
    if (Array.isArray(topics)) {
        topics.forEach((function(topic) {
            subs.push({
                topic: topic,
                qos: opts.qos || this.C.DEF_QOS
            });
        }).bind(this));
    } else {
        Object.keys(topics).forEach(function(k) {
            subs.push({
                topic: k,
                qos: topics[k]
            });
        });
    }
    subs.forEach((function(sub) {
        var subpacket = mqttSubscribe(sub.topic, sub.qos);
        this.client.write(subpacket);
    }).bind(this));
};
/** Unsubscribe to topic (filter) */ MQTT.prototype.unsubscribe = function(topic) {
    if (!this.client) return;
    this.client.write(mqttUnsubscribe(topic));
};
/** Send ping request to server */ MQTT.prototype.ping = function() {
    if (!this.client) return;
    try {
        this.client.write(Buffer.from([
            TYPE.PINGREQ << 4,
            0
        ]));
    } catch (e) {
        this._scktClosed();
    }
};
/* Packet specific functions *******************/ /** Create connection flags */ MQTT.prototype.createFlagsForConnection = function(options) {
    var flags = 0;
    flags |= this.username ? 0x80 : 0;
    flags |= this.username && this.password ? 0x40 : 0;
    flags |= options.clean_session ? 0x02 : 0;
    return flags;
};
/** CONNECT control packet
 Clean Session and Userid/Password are currently only supported
 connect flag. Wills are not
 currently supported.
 */ MQTT.prototype.mqttConnect = function(clean) {
    var cmd = TYPE.CONNECT << 4;
    var flags = this.createFlagsForConnection({
        clean_session: clean
    });
    var keep_alive = [
        this.keep_alive >> 8,
        this.keep_alive & 255
    ];
    /* payload */ var payload = this.client_id;
    if (this.username) {
        payload = payload.concat(this.username);
        if (this.password) {
            payload = payload.concat(this.password);
        }
    }
    return mqttPacket(cmd, mqttStr(this.protocol_name)/*protocol name*/ .concat([
        this.protocol_level
    ])/*protocol level*/ .concat([
        flags
    ]).concat(keep_alive), payload);
};
/* Exports *************************************/ /** This is 'exported' so it can be used with `require('MQTT.js').create(server, options)` */ function create(server, options) {
    return new MQTT(server, options);
}

function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
var start = function(buttonModule, irModule, options) {
    var mqttServer = create(options.mqtt.host, _object_spread_props(_object_spread({}, options.mqtt), {
        keep_alive: true
    }));
    var _options_debug;
    var logger = makeLogger("root", (_options_debug = options.debug) !== null && _options_debug !== void 0 ? _options_debug : false);
    var _options_ha;
    options.ha = (_options_ha = options.ha) !== null && _options_ha !== void 0 ? _options_ha : {};
    var _options_flicBtns;
    options.flicBtns = (_options_flicBtns = options.flicBtns) !== null && _options_flicBtns !== void 0 ? _options_flicBtns : {};
    var _options_flicIR;
    options.flicIR = (_options_flicIR = options.flicIR) !== null && _options_flicIR !== void 0 ? _options_flicIR : {};
    var _options_ha_debug, _ref;
    options.ha.debug = (_ref = (_options_ha_debug = options.ha.debug) !== null && _options_ha_debug !== void 0 ? _options_ha_debug : options.debug) !== null && _ref !== void 0 ? _ref : false;
    var _options_flicBtns_debug, _ref1;
    options.flicBtns.debug = (_ref1 = (_options_flicBtns_debug = options.flicBtns.debug) !== null && _options_flicBtns_debug !== void 0 ? _options_flicBtns_debug : options.debug) !== null && _ref1 !== void 0 ? _ref1 : false;
    var _options_flicBtns_debug1, _ref2;
    options.flicIR.debug = (_ref2 = (_options_flicBtns_debug1 = options.flicBtns.debug) !== null && _options_flicBtns_debug1 !== void 0 ? _options_flicBtns_debug1 : options.debug) !== null && _ref2 !== void 0 ? _ref2 : false;
    var ha = makeHAmqtt(mqttServer, options.ha);
    mqttServer.on("connected", function() {
        var _options_flicBtns, _options_flicIR;
        logger.info("connected to mqtt");
        if (!((_options_flicBtns = options.flicBtns) === null || _options_flicBtns === void 0 ? void 0 : _options_flicBtns.disabled)) {
            makeButtonController(ha, buttonModule, options.flicBtns).start();
        }
        if (!((_options_flicIR = options.flicIR) === null || _options_flicIR === void 0 ? void 0 : _options_flicIR.disabled)) {
            makeIRController(irModule, ha, mqttServer, options.flicIR).start();
        }
        logger.info("all services up!");
    });
    mqttServer.on("error", function(err) {
        logger.info("'Error' event", JSON.stringify(err));
        setTimeout(function() {
            throw new Error("Crashed");
        }, 1000);
    });
    mqttServer.on("disconnected", function(err) {
        logger.info("'Error' disconnected", JSON.stringify(err));
        setTimeout(function() {
            throw new Error("Crashed");
        }, 1000);
    });
    mqttServer.on("close", function(err) {
        logger.info("'Error' close", JSON.stringify(err));
        setTimeout(function() {
            throw new Error("Crashed");
        }, 1000);
    });
    mqttServer.connect();
};

exports.start = start;
