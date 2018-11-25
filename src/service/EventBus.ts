import {SimpleEventDispatcher, ISimpleEvent, ISimpleEventHandler} from 'strongly-typed-events';
import {AirQualityEvent, HumidityEvent, PressureEvent, TemperatureEvent, ThingyDataEvent, ThingyNotifyEvents} from './ThingyNotifyEvents';

export class EventBus {

    private specificThingyEvents: Map<string, ThingyNotifyEvents> = new Map<string, ThingyNotifyEvents>();
    private allThingyEvents: ThingyNotifyEvents = new ThingyNotifyEvents();

    private createThingyEventsIfNotExisting(thingyId: string) {
        if (!this.specificThingyEvents.has(thingyId)) {
            this.specificThingyEvents.set(thingyId, new ThingyNotifyEvents());
        }
    }

    private getThingyNotifyEvent(thingyId?: string) {
        let thingyEvents: ThingyNotifyEvents;
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
        this.dispatchEvents(thingyId, eventDispatcher, event, allTemperatureEvent);
    }

    public fireHumidityEvent(event: HumidityEvent) {
        let thingyId = event.thingyId;
        let eventDispatcher: SimpleEventDispatcher<HumidityEvent> = this.getThingyNotifyEvent(thingyId).humidityEvent;
        let allHumidityEvent = this.allThingyEvents.humidityEvent;
        this.dispatchEvents(thingyId, eventDispatcher, event, allHumidityEvent);
    }

    public fireAirQualityEvent(event: AirQualityEvent) {
        let thingyId = event.thingyId;
        let eventDispatcher: SimpleEventDispatcher<AirQualityEvent> = this.getThingyNotifyEvent(thingyId).airQualityEvent;
        let allairQualityEvent = this.allThingyEvents.airQualityEvent;
        this.dispatchEvents(thingyId, eventDispatcher, event, allairQualityEvent);
    }

    private dispatchEvents(source: string, eventDispatcher: SimpleEventDispatcher<AirQualityEvent>, event: AirQualityEvent, allairQualityEvent: SimpleEventDispatcher<ThingyDataEvent>) {
        eventDispatcher.dispatchAsync(event);
        allairQualityEvent.dispatchAsync(event);
    }

    public firePressureEvent(event: PressureEvent) {
        let thingyId = event.thingyId;
        let eventDispatcher: SimpleEventDispatcher<PressureEvent> = this.getThingyNotifyEvent(thingyId).pressureEvent;
        let allEvent = this.allThingyEvents.pressureEvent;
        this.dispatchEvents(thingyId, eventDispatcher, event, allEvent);
    }

}