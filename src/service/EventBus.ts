import {SimpleEventDispatcher, ISimpleEventHandler} from 'strongly-typed-events';
import {
    AirQualityEvent,
    HumidityEvent,
    PressureEvent,
    TemperatureEvent,
    ThingyDataEvent,
    ThingyNotifyEventDispatchers,
} from './ThingyNotifyEventDispatchers';
import {MqttConnectionEvent} from './MqttConnection';
import {AlarmActive, AlarmEvent, ButtonPressed, ConfigurationAdded} from './AlarmService';

export class EventBus {

    private specificThingyEvents: Map<string, ThingyNotifyEventDispatchers> = new Map<string, ThingyNotifyEventDispatchers>();
    private allThingyEvents: ThingyNotifyEventDispatchers = new ThingyNotifyEventDispatchers();
    private mqttEventDispatcher: SimpleEventDispatcher<MqttConnectionEvent> = new SimpleEventDispatcher<MqttConnectionEvent>();
    private alarmEventDispatcher: SimpleEventDispatcher<AlarmEvent> = new SimpleEventDispatcher<AlarmEvent>();
    private buttonPressedDispatcher: SimpleEventDispatcher<ButtonPressed> = new SimpleEventDispatcher<ButtonPressed>();
    private configurationAddedDispatcher: SimpleEventDispatcher<ConfigurationAdded> = new SimpleEventDispatcher<ConfigurationAdded>();

    private createThingyEventsIfNotExisting(thingyId: string) {
        if (!this.specificThingyEvents.has(thingyId)) {
            this.specificThingyEvents.set(thingyId, new ThingyNotifyEventDispatchers());
        }
    }

    private getThingyNotifyEvent(thingyId?: string) {
        let thingyEvents: ThingyNotifyEventDispatchers;
        if (thingyId) {
            this.createThingyEventsIfNotExisting(thingyId);
            thingyEvents = this.specificThingyEvents.get(thingyId);
        } else {
            thingyEvents = this.allThingyEvents;
        }
        return thingyEvents;
    }

    public subscribeToTemperature(handler: ISimpleEventHandler<TemperatureEvent>, thingyId?: string) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.temperatureEvent.subscribe(handler);
    }
    public unsubscribeToTemperature(handler: ISimpleEventHandler<TemperatureEvent>, thingyId?: string) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.temperatureEvent.unsubscribe(handler);
    }

    public subscribeToHumidity(handler: ISimpleEventHandler<HumidityEvent>, thingyId?: string) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.humidityEvent.subscribe(handler);
    }
    public unsubscribeToHumidity(handler: ISimpleEventHandler<HumidityEvent>, thingyId?: string) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.humidityEvent.unsubscribe(handler);
    }

    public subscribeToAirQuality(handler: ISimpleEventHandler<AirQualityEvent>, thingyId?: string) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.airQualityEvent.subscribe(handler);
    }
    public unsubscribeToAirQuality(handler: ISimpleEventHandler<AirQualityEvent>, thingyId?: string) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.airQualityEvent.unsubscribe(handler);
    }

    public subscribeToPressure(handler: ISimpleEventHandler<PressureEvent>, thingyId?: string) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.pressureEvent.subscribe(handler);
    }
    public unsubscribeToPressure(handler: ISimpleEventHandler<PressureEvent>, thingyId?: string) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.pressureEvent.unsubscribe(handler);
    }

    public fireTemperatureEvent(event: TemperatureEvent) {
        let thingyId = event.thingyId;
        let eventDispatcher: SimpleEventDispatcher<TemperatureEvent> = this.getThingyNotifyEvent(thingyId).temperatureEvent;
        let allTemperatureEvent = this.allThingyEvents.temperatureEvent;
        this.dispatchThingyEvents(thingyId, eventDispatcher, event, allTemperatureEvent);
    }

    public fireHumidityEvent(event: HumidityEvent) {
        let thingyId = event.thingyId;
        let eventDispatcher: SimpleEventDispatcher<HumidityEvent> = this.getThingyNotifyEvent(thingyId).humidityEvent;
        let allHumidityEvent = this.allThingyEvents.humidityEvent;
        this.dispatchThingyEvents(thingyId, eventDispatcher, event, allHumidityEvent);
    }

    public fireAirQualityEvent(event: AirQualityEvent) {
        let thingyId = event.thingyId;
        let eventDispatcher: SimpleEventDispatcher<AirQualityEvent> = this.getThingyNotifyEvent(thingyId).airQualityEvent;
        let allairQualityEvent = this.allThingyEvents.airQualityEvent;
        this.dispatchThingyEvents(thingyId, eventDispatcher, event, allairQualityEvent);
    }

    private dispatchThingyEvents(source: string, eventDispatcher: SimpleEventDispatcher<AirQualityEvent>, event: AirQualityEvent, allairQualityEvent: SimpleEventDispatcher<ThingyDataEvent>) {
        eventDispatcher.dispatchAsync(event);
        allairQualityEvent.dispatchAsync(event);
    }

    public firePressureEvent(event: PressureEvent) {
        let thingyId = event.thingyId;
        let eventDispatcher: SimpleEventDispatcher<PressureEvent> = this.getThingyNotifyEvent(thingyId).pressureEvent;
        let allEvent = this.allThingyEvents.pressureEvent;
        this.dispatchThingyEvents(thingyId, eventDispatcher, event, allEvent);
    }

    public fireMqttConnectionEvent(mqttConnectionEvent: MqttConnectionEvent) {
        this.mqttEventDispatcher.dispatchAsync(mqttConnectionEvent);
    }

    subscribeToMqtt(mqttUpdate: ISimpleEventHandler<MqttConnectionEvent>) {
        this.mqttEventDispatcher.subscribe(mqttUpdate);
    }

    public unsubscribeToMqtt(handler: ISimpleEventHandler<MqttConnectionEvent>) {
        this.mqttEventDispatcher.unsubscribe(handler);
    }

    public fireAlarmEvent(alarmEvent: AlarmEvent) {
        this.alarmEventDispatcher.dispatchAsync(alarmEvent);
    }

    public subscribeToAlarm(handler: ISimpleEventHandler<AlarmEvent>) {
        this.alarmEventDispatcher.subscribe(handler);
    }

    public unsubscribeToAlarm(handler: ISimpleEventHandler<AlarmEvent>) {
        this.alarmEventDispatcher.unsubscribe(handler);
    }

    public fireButtonPressed(buttonEvent: ButtonPressed) {
        this.buttonPressedDispatcher.dispatchAsync(buttonEvent);
    }

    public subscribeToButtonPressed(handler: ISimpleEventHandler<ButtonPressed>) {
        this.buttonPressedDispatcher.subscribe(handler);
    }

    public unsubscribeButtonPressed(handler: ISimpleEventHandler<ButtonPressed>) {
        this.buttonPressedDispatcher.unsubscribe(handler);
    }

    public fireConfigurationAdded(configurationAdded: ConfigurationAdded) {
        this.configurationAddedDispatcher.dispatchAsync(configurationAdded);
    }

    public subscribeToConfigurationAdded(handler: ISimpleEventHandler<ConfigurationAdded>) {
        this.configurationAddedDispatcher.subscribe(handler);
    }

    public unsubscribeConfigurationAdded(handler: ISimpleEventHandler<ConfigurationAdded>) {
        this.configurationAddedDispatcher.unsubscribe(handler);
    }

}