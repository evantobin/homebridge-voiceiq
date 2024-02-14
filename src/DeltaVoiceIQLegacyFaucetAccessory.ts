import axios from 'axios';
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { DeltaVoiceIQ } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class DeltaVoiceIQLegacyFaucetAccessory {
  private service: Service;

  private state = {
    On: false,
  };

  constructor(
    private readonly platform: DeltaVoiceIQ,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Delta Faucet')
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.productId)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.macAddress);

    this.service = this.accessory.getService(this.platform.Service.Valve) || this.accessory.addService(this.platform.Service.Valve);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);
    this.service.setCharacteristic(this.platform.Characteristic.ValveType, this.platform.Characteristic.ValveType.WATER_FAUCET);

    this.service.getCharacteristic(this.platform.Characteristic.Active)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.InUse)
      .onGet(this.getOn.bind(this));

  }

  async setOn(value: CharacteristicValue) {
    this.state.On = value as boolean;
    const url = 'https://device.legacy.deltafaucet.com/api/device/toggleWater?deviceId='
      + this.accessory.context.device.id
      + '&toggle='
      + (this.state.On ? 'on' : 'off');
    await axios.post(url, {},
      {
        headers: {
          'Authorization': 'Bearer ' + this.platform.config.token,
        },
      },
    );

    this.platform.log.debug('Set Characteristic On ->', value);
  }

  getOn(): CharacteristicValue {
    const isOn = this.state.On ? this.platform.Characteristic.Active.ACTIVE : this.platform.Characteristic.Active.INACTIVE;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    return isOn;
  }

}
