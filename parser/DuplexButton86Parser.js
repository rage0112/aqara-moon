const DeviceParser = require('./DeviceParser');
const AccessoryParser = require('./AccessoryParser');
const SwitchVirtualBasePressParser = require('./SwitchVirtualBasePressParser');

class DuplexButton86Parser extends DeviceParser {
    constructor(platform) {
        super(platform);
    }
    
    getAccessoriesParserInfo() {
        return {
            'DuplexButton86_StatelessProgrammableSwitch_Left': DuplexButton86StatelessProgrammableSwitchLeftParser,
            'DuplexButton86_Switch_VirtualSinglePress_Left': DuplexButton86SwitchVirtualSinglePressLeftParser,
         // 'DuplexButton86_Switch_VirtualDoublePress_Left': DuplexButton86SwitchVirtualDoublePressLeftParser,
         // 'DuplexButton86_Switch_VirtualLongPress_Left': DuplexButton86SwitchVirtualLongPressLeftParser,
            'DuplexButton86_StatelessProgrammableSwitch_Right': DuplexButton86StatelessProgrammableSwitchRightParser,
            'DuplexButton86_Switch_VirtualSinglePress_Right': DuplexButton86SwitchVirtualSinglePressRightParser,
         // 'DuplexButton86_Switch_VirtualDoublePress_Right': DuplexButton86SwitchVirtualDoublePressRightParser,
         // 'DuplexButton86_Switch_VirtualLongPress_Right': DuplexButton86SwitchVirtualLongPressRightParser,
            'DuplexButton86_StatelessProgrammableSwitch_Both': DuplexButton86StatelessProgrammableSwitchBothParser,
            'DuplexButton86_Switch_VirtualSinglePress_Both': DuplexButton86SwitchVirtualSinglePressBothPressParser
        }
    }
}
DuplexButton86Parser.modelName = ['86sw2', 'sensor_86sw2.aq1', 'sensor_86sw2'];
module.exports = DuplexButton86Parser;

class DuplexButton86StatelessProgrammableSwitchBaseParser extends AccessoryParser {
    constructor(platform, accessoryType) {
        super(platform, accessoryType)
    }
    
    getAccessoryCategory(deviceSid) {
        return this.Accessory.Categories.PROGRAMMABLE_SWITCH;
    }
    
    getAccessoryInformation(deviceSid) {
        return {
            'Manufacturer': 'Aqara',
            'Model': 'Duplex Button 86',
            'SerialNumber': deviceSid
        };
    }

    getServices(jsonObj, accessoryName) {
        var that = this;
        var result = [];
        
        var service = new that.Service.StatelessProgrammableSwitch(accessoryName);
        service.getCharacteristic(that.Characteristic.ProgrammableSwitchEvent);
        result.push(service);
        
        var batteryService  = new that.Service.BatteryService(accessoryName);
        batteryService.getCharacteristic(that.Characteristic.StatusLowBattery);
        batteryService.getCharacteristic(that.Characteristic.BatteryLevel);
        batteryService.getCharacteristic(that.Characteristic.ChargingState);
        result.push(batteryService);
        
        return result;
    }
    
    parserAccessories(jsonObj) {
        var that = this;
        var deviceSid = jsonObj['sid'];
        var uuid = that.getAccessoryUUID(deviceSid);
        var accessory = that.platform.AccessoryUtil.getByUUID(uuid);
        if(accessory) {
            var service = accessory.getService(that.Service.StatelessProgrammableSwitch);
            var programmableSwitchEventCharacteristic = service.getCharacteristic(that.Characteristic.ProgrammableSwitchEvent);
            programmableSwitchEventCharacteristic.setProps({
                validValues: [0]
            });
            var value = that.getProgrammableSwitchEventCharacteristicValue(jsonObj, null);
            if(null != value) {
                programmableSwitchEventCharacteristic.updateValue(value);
            }
            
            that.parserBatteryService(accessory, jsonObj);
        }
    }
}

class DuplexButton86StatelessProgrammableSwitchLeftParser extends DuplexButton86StatelessProgrammableSwitchBaseParser {
    getProgrammableSwitchEventCharacteristicValue(jsonObj, defaultValue) {
        var value = null;
        var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(jsonObj['sid']));
        if(1 == proto_version_prefix) {
            value = this.getValueFrJsonObjData1(jsonObj, 'channel_0');
        } else if(2 == proto_version_prefix) {
            value = this.getValueFrJsonObjData2(jsonObj, 'button_0');
        } else {
        }
        
        if(value === 'click') {
            return this.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
        } else if(value === 'double_click') {
            return this.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS;
        } else if(value === 'long_click_release') {
            /* 'long_click_press' */
            return this.Characteristic.ProgrammableSwitchEvent.LONG_PRESS;
        } else {
            return defaultValue;
        }
    }
}

class DuplexButton86StatelessProgrammableSwitchRightParser extends DuplexButton86StatelessProgrammableSwitchBaseParser {
    getProgrammableSwitchEventCharacteristicValue(jsonObj, defaultValue) {
        var value = null;
        var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(jsonObj['sid']));
        if(1 == proto_version_prefix) {
            value = this.getValueFrJsonObjData1(jsonObj, 'channel_1');
        } else if(2 == proto_version_prefix) {
            value = this.getValueFrJsonObjData2(jsonObj, 'button_1');
        } else {
        }
        
        if(value === 'click') {
            return this.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
        } else if(value === 'double_click') {
            return this.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS;
        } else if(value === 'long_click_release') {
            /* 'long_click_press' */
            return this.Characteristic.ProgrammableSwitchEvent.LONG_PRESS;
        } else {
            return defaultValue;
        }
    }
}

class DuplexButton86StatelessProgrammableSwitchBothParser extends DuplexButton86StatelessProgrammableSwitchBaseParser {
    getProgrammableSwitchEventCharacteristicValue(jsonObj, defaultValue) {
        var value = this.getValueFrJsonObjData(jsonObj, 'dual_channel');
        
        if(value === 'both_click') {
            return this.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
        } else {
            return defaultValue;
        }
    }
}

class DuplexButton86SwitchVirtualBasePressParser extends SwitchVirtualBasePressParser {
    getAccessoryInformation(deviceSid) {
        return {
            'Manufacturer': 'Aqara',
            'Model': 'Duplex Button 86',
            'SerialNumber': deviceSid
        };
    }
}

class DuplexButton86SwitchVirtualSinglePressLeftParser extends DuplexButton86SwitchVirtualBasePressParser {
    getWriteCommand(deviceSid, value) {
        var model = this.platform.getDeviceModelBySid(deviceSid);
        var command = null;
        var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        if(1 == proto_version_prefix) {
            command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","data":{"channel_0":"click", "key": "${key}"}}';
        } else if(2 == proto_version_prefix) {
            command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","params":[{"button_0":"click"}], "key": "${key}"}';
        } else {
        }
        
        return command;
    }
    
    doSomething(jsonObj) {
        var deviceSid = jsonObj['sid'];
        var model = this.platform.getDeviceModelBySid(deviceSid);
        var command = null;
        var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        if(1 == proto_version_prefix) {
            command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "data":{"channel_0":"click"}}"';
        } else if(2 == proto_version_prefix) {
            command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "params":[{"button_0":"click"}]}"';
        } else {
        }
        var newObj = JSON.parse(command);
        this.platform.ParseUtil.parserAccessories(newObj);
    }
}

// class DuplexButton86SwitchVirtualDoublePressLeftParser extends DuplexButton86SwitchVirtualBasePressParser {
    // getWriteCommand(deviceSid, value) {
        // var model = this.platform.getDeviceModelBySid(deviceSid);
        // var command = null;
        // var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        // if(1 == proto_version_prefix) {
            // command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","data":{"channel_0":"double_click", "key": "${key}"}}';
        // } else if(2 == proto_version_prefix) {
            // command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","params":[{"button_0":"double_click"}], "key": "${key}"}';
        // } else {
        // }
        
        // return command;
    // }
    
    // doSomething(jsonObj) {
        // var deviceSid = jsonObj['sid'];
        // var model = this.platform.getDeviceModelBySid(deviceSid);
        // var command = null;
        // var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        // if(1 == proto_version_prefix) {
            // command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "data":{"channel_0":"double_click"}}"';
        // } else if(2 == proto_version_prefix) {
            // command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "params":[{"button_0":"double_click"}]}"';
        // } else {
        // }
        // var newObj = JSON.parse(command);
        // this.platform.ParseUtil.parserAccessories(newObj);
    // }
// }

// class DuplexButton86SwitchVirtualLongPressLeftParser extends DuplexButton86SwitchVirtualBasePressParser {
    // getWriteCommand(deviceSid, value) {
        // var model = this.platform.getDeviceModelBySid(deviceSid);
        // var command = null;
        // var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        // if(1 == proto_version_prefix) {
            // command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","data":{"channel_0":"long_click_press", "key": "${key}"}}';
        // } else if(2 == proto_version_prefix) {
            // command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","params":[{"button_0":"long_click_press"}], "key": "${key}"}';
        // } else {
        // }
        
        // return command;
    // }
    
    // doSomething(jsonObj) {
        // var deviceSid = jsonObj['sid'];
        // var model = this.platform.getDeviceModelBySid(deviceSid);
        // var command = null;
        // var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        // if(1 == proto_version_prefix) {
            // command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "data":{"channel_0":"long_click_press"}}"';
        // } else if(2 == proto_version_prefix) {
            // command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "params":[{"button_0":"long_click_press"}]}"';
        // } else {
        // }
        // var newObj = JSON.parse(command);
        // this.platform.ParseUtil.parserAccessories(newObj);
    // }
// }

class DuplexButton86SwitchVirtualSinglePressRightParser extends DuplexButton86SwitchVirtualBasePressParser {
    getWriteCommand(deviceSid, value) {
        var model = this.platform.getDeviceModelBySid(deviceSid);
        var command = null;
        var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        if(1 == proto_version_prefix) {
            command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","data":{"channel_1":"click", "key": "${key}"}}';
        } else if(2 == proto_version_prefix) {
            command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","params":[{"button_1":"click"}], "key": "${key}"}';
        } else {
        }
        
        return command;
    }
    
    doSomething(jsonObj) {
        var deviceSid = jsonObj['sid'];
        var model = this.platform.getDeviceModelBySid(deviceSid);
        var command = null;
        var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        if(1 == proto_version_prefix) {
            command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "data":{"channel_1":"click"}}"';
        } else if(2 == proto_version_prefix) {
            command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "params":[{"button_1":"click"}]}"';
        } else {
        }
        var newObj = JSON.parse(command);
        this.platform.ParseUtil.parserAccessories(newObj);
    }
}

// class DuplexButton86SwitchVirtualDoublePressLeftParser extends DuplexButton86SwitchVirtualBasePressParser {
    // getWriteCommand(deviceSid, value) {
        // var model = this.platform.getDeviceModelBySid(deviceSid);
        // var command = null;
        // var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        // if(1 == proto_version_prefix) {
            // command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","data":{"channel_1":"double_click", "key": "${key}"}}';
        // } else if(2 == proto_version_prefix) {
            // command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","params":[{"button_1":"double_click"}], "key": "${key}"}';
        // } else {
        // }
        
        // return command;
    // }
    
    // doSomething(jsonObj) {
        // var deviceSid = jsonObj['sid'];
        // var model = this.platform.getDeviceModelBySid(deviceSid);
        // var command = null;
        // var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        // if(1 == proto_version_prefix) {
            // command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "data":{"channel_1":"double_click"}}"';
        // } else if(2 == proto_version_prefix) {
            // command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "params":[{"button_1":"double_click"}]}"';
        // } else {
        // }
        // var newObj = JSON.parse(command);
        // this.platform.ParseUtil.parserAccessories(newObj);
    // }
// }

// class DuplexButton86SwitchVirtualLongPressLeftParser extends DuplexButton86SwitchVirtualBasePressParser {
    // getWriteCommand(deviceSid, value) {
        // var model = this.platform.getDeviceModelBySid(deviceSid);
        // var command = null;
        // var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        // if(1 == proto_version_prefix) {
            // command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","data":{"channel_1":"long_click_press", "key": "${key}"}}';
        // } else if(2 == proto_version_prefix) {
            // command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","params":[{"button_1":"long_click_press"}], "key": "${key}"}';
        // } else {
        // }
        
        // return command;
    // }
    
    // doSomething(jsonObj) {
        // var deviceSid = jsonObj['sid'];
        // var model = this.platform.getDeviceModelBySid(deviceSid);
        // var command = null;
        // var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        // if(1 == proto_version_prefix) {
            // command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "data":{"channel_1":"long_click_press"}}"';
        // } else if(2 == proto_version_prefix) {
            // command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "params":[{"button_1":"long_click_press"}]}"';
        // } else {
        // }
        // var newObj = JSON.parse(command);
        // this.platform.ParseUtil.parserAccessories(newObj);
    // }
// }

class DuplexButton86SwitchVirtualSinglePressBothPressParser extends DuplexButton86SwitchVirtualBasePressParser {
    getWriteCommand(deviceSid, value) {
        var model = this.platform.getDeviceModelBySid(deviceSid);
        var command = null;
        var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        if(1 == proto_version_prefix) {
            command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","data":{"dual_channel":"both_click", "key": "${key}"}}';
        } else if(2 == proto_version_prefix) {
            command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","params":[{"dual_channel":"both_click"}], "key": "${key}"}';
        } else {
        }
        
        return command;
    }
    
    doSomething(jsonObj) {
        var deviceSid = jsonObj['sid'];
        var model = this.platform.getDeviceModelBySid(deviceSid);
        var command = null;
        var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        if(1 == proto_version_prefix) {
            command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "data":{"dual_channel":"both_click"}}"';
        } else if(2 == proto_version_prefix) {
            command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "params":[{"dual_channel":"both_click"}]}"';
        } else {
        }
        var newObj = JSON.parse(command);
        this.platform.ParseUtil.parserAccessories(newObj);
    }
}
