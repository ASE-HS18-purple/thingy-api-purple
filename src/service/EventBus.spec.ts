import { expect } from 'chai';
import 'mocha';
import {EventBus} from './EventBus';
import {AirQualityEvent, HumidityEvent, PressureEvent, TemperatureEvent} from './ThingyNotifyEventDispatchers';
import * as Sinon from 'sinon';

describe('Eventbus', () => {

    it('should should subscribe and fire to events', function() {
        let eventbus: EventBus = new EventBus();
        let temperatureSpy = Sinon.spy();
        let humiditySpy = Sinon.spy();
        let airQualitySpy = Sinon.spy();
        let pressureSpy = Sinon.spy();
        eventbus.subscribeToTemperature(temperatureSpy, (1).toString());
        eventbus.subscribeToHumidity(humiditySpy, (2).toString());
        eventbus.subscribeToAirQuality(airQualitySpy, (3).toString());
        eventbus.subscribeToPressure(pressureSpy, (4).toString());
        let temperatureEvent = new TemperatureEvent(0, (1).toString(), 5);
        let humidityEvent = new HumidityEvent(0, (2).toString(), 6);
        let airQualityEvent = new AirQualityEvent(0, (3).toString(), 7);
        let pressureEvent = new PressureEvent(0, (4).toString(), 8);
        eventbus.fireTemperatureEvent(temperatureEvent);
        eventbus.fireHumidityEvent(humidityEvent);
        eventbus.fireAirQualityEvent(airQualityEvent);
        eventbus.firePressureEvent(pressureEvent);
        setTimeout(() => {
            Sinon.assert.calledWith(temperatureSpy, temperatureEvent);
            Sinon.assert.calledWith(humiditySpy, humidityEvent);
            Sinon.assert.calledWith(airQualitySpy, airQualityEvent);
            Sinon.assert.calledWith(pressureSpy, pressureEvent);
        }, 500);
    });

    it('should should subscribe to all thingys and fire to events', function() {
        let eventbus: EventBus = new EventBus();
        let temperatureSpy = Sinon.spy();
        let humiditySpy = Sinon.spy();
        let airQualitySpy = Sinon.spy();
        let pressureSpy = Sinon.spy();
        eventbus.subscribeToTemperature(temperatureSpy);
        eventbus.subscribeToHumidity(humiditySpy);
        eventbus.subscribeToAirQuality(airQualitySpy);
        eventbus.subscribeToPressure(pressureSpy);
        let temperatureEvent = new TemperatureEvent(0, (1).toString(), 5);
        let humidityEvent = new HumidityEvent(0, (2).toString(), 6);
        let airQualityEvent = new AirQualityEvent(0, (3).toString(), 7);
        let pressureEvent = new PressureEvent(0, (4).toString(), 8);
        eventbus.fireTemperatureEvent(temperatureEvent);
        eventbus.fireHumidityEvent(humidityEvent);
        eventbus.fireAirQualityEvent(airQualityEvent);
        eventbus.firePressureEvent(pressureEvent);
        setTimeout(() => {
            Sinon.assert.calledWith(temperatureSpy, temperatureEvent);
            Sinon.assert.calledWith(humiditySpy, humidityEvent);
            Sinon.assert.calledWith(airQualitySpy, airQualityEvent);
            Sinon.assert.calledWith(pressureSpy, pressureEvent);
        }, 500);
    });

    it('unsubscribe to actually unsubscribe', function() {
        let eventbus: EventBus = new EventBus();
        let temperature = 0;
        let humidity = 0;
        let airQuality = 0;
        let pressure = 0;
        let temperatureHandler = (event: TemperatureEvent) => temperature = event.value;
        let humidityHandler = (event: HumidityEvent) => humidity = event.value;
        let airQualityHandler = (event: AirQualityEvent) => airQuality = event.value;
        let pressureHandler = (event: PressureEvent) => pressure = event.value;
        eventbus.subscribeToTemperature(temperatureHandler);
        eventbus.subscribeToHumidity(humidityHandler);
        eventbus.subscribeToAirQuality(airQualityHandler);
        eventbus.subscribeToPressure(pressureHandler);
        eventbus.unsubscribeToTemperature(temperatureHandler);
        eventbus.unsubscribeToHumidity(humidityHandler);
        eventbus.unsubscribeToAirQuality(airQualityHandler);
        eventbus.unsubscribeToPressure(pressureHandler);
        let temperatureEvent = new TemperatureEvent(0, (1).toString(), 5);
        let humidityEvent = new HumidityEvent(0, (2).toString(), 6);
        let airQualityEvent = new AirQualityEvent(0, (3).toString(), 7);
        let pressureEvent = new PressureEvent(0, (4).toString(), 8);
        eventbus.fireTemperatureEvent(temperatureEvent);
        eventbus.fireHumidityEvent(humidityEvent);
        eventbus.fireAirQualityEvent(airQualityEvent);
        eventbus.firePressureEvent(pressureEvent);
        this.timeout(1000);
        expect(temperature).to.equal(0);
        expect(humidity).to.equal(0);
        expect(airQuality).to.equal(0);
        expect(pressure).to.equal(0);
    });

});