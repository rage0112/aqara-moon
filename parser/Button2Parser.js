const DeviceParser = require('./DeviceParser');
const AccessoryParser = require('./AccessoryParser');
const SwitchVirtualBasePressParser = require('./SwitchVirtualBasePressParser');

class Button2Parser extends DeviceParser {
    constructor(platform) {
        super(platform);
    }
    
    getAccessoriesParserInfo() {
        return {
            'Button2_StatelessProgrammableSwitch': Button2StatelessProgrammableSwitchParser,
            'Button2_Switch_VirtualSinglePress': Button2SwitchVirtualSinglePressParser,
            'Button2_Switch_VirtualDoublePress': Button2SwitchVirtualDoublePressParser
            // 'Button_Switch_VirtualLongPress': ButtonSwitchVirtualLongPressParser
        }
    }
}
Button2Parser.modelName = ['sensor_switch', 'sensor_switch.aq2'];
module.exports = Button2Parser;

class Button2StatelessProgrammableSwitchParser extends AccessoryParser {
    constructor(platform, accessoryType) {
        super(platform, accessoryType)
		this.pressed = 0;
    }
    
    getAccessoryCategory(deviceSid) {
        return this.Accessory.Categories.PROGRAMMABLE_SWITCH;
    }
    
    getAccessoryInformation(deviceSid) {
        return {
            'Manufacturer': 'Aqara',
            'Model': 'Button 2',
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
            var value = that.getProgrammableSwitchEventCharacteristicValue(jsonObj, null);
            
			//this.platform.log.error("key value[Send]" + value +" moon "+this.pressed);

			if(value == 0) {
				if(this.pressed == 0) 
					programmableSwitchEventCharacteristic.updateValue(0);
				else
					this.pressed = 2;
			}
			else if(value == 1) {
				programmableSwitchEventCharacteristic.updateValue(1);
			}
			else if (value == null) {
				this.pressed = 1;
				
				setTimeout(() => {
					//this.platform.log.error("moon "+this.pressed);

					if(this.pressed == 2) {
						programmableSwitchEventCharacteristic.updateValue(2);		
					}
					
					this.pressed = 0;
				}, 2000);
			}
	/*
	
			if(null != value) {				
                //programmableSwitchEventCharacteristic.updateValue(value);
				setTimeout(() => {
					this.platform.log.error("22 ");
					programmableSwitchEventCharacteristic.updateValue(value);
				}, 1000);
				
            }
			else {
				//programmableSwitchEventCharacteristic.updateValue(2);
			}
      */      
            that.parserBatteryService(accessory, jsonObj);
        }
    }
    
    getProgrammableSwitchEventCharacteristicValue(jsonObj, defaultValue) {
        var value = null;
        var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(jsonObj['sid']));
        if(1 == proto_version_prefix) {
            value = this.getValueFrJsonObjData1(jsonObj, 'status');
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

class Button2SwitchVirtualBasePressParser extends SwitchVirtualBasePressParser {
    getAccessoryInformation(deviceSid) {
        return {
            'Manufacturer': 'Aqara',
            'Model': 'Button',
            'SerialNumber': deviceSid
        };
    }
}

class Button2SwitchVirtualSinglePressParser extends Button2SwitchVirtualBasePressParser {
    getWriteCommand(deviceSid, value) {
        var model = this.platform.getDeviceModelBySid(deviceSid);
        var command = null;
        var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        if(1 == proto_version_prefix) {
            command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","data":{"status":"click", "key": "${key}"}}';
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
        var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(jsonObj['sid']));
        if(1 == proto_version_prefix) {
            command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "data":{"status":"click"}}"';
        } else if(2 == proto_version_prefix) {
            command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "params":[{"button_0":"click"}]}"';
        } else {
        }
        var newObj = JSON.parse(command);
        this.platform.ParseUtil.parserAccessories(newObj);
    }
}

class Button2SwitchVirtualDoublePressParser extends Button2SwitchVirtualBasePressParser {
    getWriteCommand(deviceSid, value) {
        var model = this.platform.getDeviceModelBySid(deviceSid);
        var command = null;
        var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        if(1 == proto_version_prefix) {
            command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","data":{"status":"double_click", "key": "${key}"}}';
        } else if(2 == proto_version_prefix) {
            command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","params":[{"button_0":"double_click"}], "key": "${key}"}';
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
            command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "data":{"status":"double_click"}}"';
        } else if(2 == proto_version_prefix) {
            command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "params":[{"button_0":"double_click"}]}"';
        } else {
        }
        var newObj = JSON.parse(command);
        this.platform.ParseUtil.parserAccessories(newObj);
    }
}

// class Button2SwitchVirtualLongPressParser extends Button2SwitchVirtualBasePressParser {
    // getWriteCommand(deviceSid, value) {
        // var model = this.platform.getDeviceModelBySid(deviceSid);
        // var command = null;
        // var proto_version_prefix = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(deviceSid));
        // if(1 == proto_version_prefix) {
            // command = '{"cmd":"write","model":"' + model + '","sid":"' + deviceSid + '","data":{"status":"long_click_press", "key": "${key}"}}';
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
            // command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "data":{"status":"long_click_press"}}"';
        // } else if(2 == proto_version_prefix) {
            // command = '{"cmd":"report","model":"' + model + '","sid":"' + deviceSid + '", "params":[{"button_0":"long_click_press"}]}"';
        // } else {
        // }
        // var newObj = JSON.parse(command);
        // this.platform.ParseUtil.parserAccessories(newObj);
    // }
// }

