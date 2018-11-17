import {SimpleEventDispatcher} from 'strongly-typed-events';

class ThingyDataEvent {
    
    private timestamp: number;
    private thingyId: number;
    private value: number;
    
}

class TemperatureEvent extends ThingyDataEvent{}
class HumidityEvent extends ThingyDataEvent{}
class AirQualityEvent extends ThingyDataEvent{}
class PressureEvent extends ThingyDataEvent{}


class ThingyNotifyEvents {

    readonly temperatureEvent = new SimpleEventDispatcher<TemperatureEvent>();
    readonly humidityEvent = new SimpleEventDispatcher<HumidityEvent>();
    readonly airQualityEvent = new SimpleEventDispatcher<AirQualityEvent>();
    readonly pressureEvent = new SimpleEventDispatcher<PressureEvent>();



}

export {ThingyNotifyEvents, ThingyDataEvent, TemperatureEvent, HumidityEvent, AirQualityEvent, PressureEvent}