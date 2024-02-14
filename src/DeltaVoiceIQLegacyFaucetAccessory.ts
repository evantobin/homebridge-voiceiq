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

  on: boolean;

  constructor(
    private readonly platform: DeltaVoiceIQ,
    private readonly accessory: PlatformAccessory,
  ) {

    this.on = false;
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Delta Faucet')
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.productId)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.macAddress);

    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getActive.bind(this));

  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  async setOn(_value: CharacteristicValue) {
    this.on = !this.on;
    this.platform.log.debug(`Setting faucet to ${(this.on ? 'on' : 'off')}`);
    const url = 'https://device.legacy.deltafaucet.com/api/device/toggleWater?deviceId='
      + this.accessory.context.device.id
      + '&toggle='
      + (this.on ? 'on' : 'off');
    await axios.post(url, {},
      {
        headers: {
          'Authorization': 'Bearer ' + this.platform.config.token,
        },
      },
    );

    this.platform.log.debug('Set Characteristic On ->', this.on);
  }

  getActive(): CharacteristicValue {
    const isOn = this.on ? this.platform.Characteristic.Active.ACTIVE : this.platform.Characteristic.Active.INACTIVE;

    this.platform.log.debug('Get Characteristic Active ->', isOn);

    return isOn;
  }

}
