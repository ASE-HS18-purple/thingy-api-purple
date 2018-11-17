import {SimpleEventDispatcher, ISimpleEvent, ISimpleEventHandler} from 'strongly-typed-events';
import {AirQualityEvent, HumidityEvent, PressureEvent, TemperatureEvent, ThingyDataEvent, ThingyNotifyEvents} from './ThingyNotifyEvents';

export class EventBus {

    private specificThingyEvents: Map<number, ThingyNotifyEvents> = new Map<number, ThingyNotifyEvents>();
    private allThingyEvents: ThingyNotifyEvents = new ThingyNotifyEvents();

    private createThingyEventsIfNotExisting(thingyId: number) {
        if (!this.specificThingyEvents.has(thingyId)) {
            this.specificThingyEvents.set(thingyId, new ThingyNotifyEvents());
        }
    }

    private getThingyNotifyEvent(thingyId: number) {
        let thingyEvents: ThingyNotifyEvents;
        if (thingyId) {
            this.createThingyEventsIfNotExisting(thingyId);
            thingyEvents = this.specificThingyEvents.get(thingyId);
        } else {
            thingyEvents = this.allThingyEvents;
        }
        return thingyEvents;
    }

    public subscribeToTemperature(handler: ISimpleEventHandler<TemperatureEvent>, thingyId?: number) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.temperatureEvent.subscribe(handler);
    }
    public unsubscribeToTemperature(handler: ISimpleEventHandler<TemperatureEvent>, thingyId?: number) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.temperatureEvent.unsubscribe(handler);
    }

    public subscribeToHumidity(handler: ISimpleEventHandler<HumidityEvent>, thingyId?: number) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.humidityEvent.subscribe(handler);
    }
    public unsubscribeToHumidity(handler: ISimpleEventHandler<HumidityEvent>, thingyId?: number) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.humidityEvent.unsubscribe(handler);
    }

    public subscribeToAirQuality(handler: ISimpleEventHandler<AirQualityEvent>, thingyId?: number) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.airQualityEvent.subscribe(handler);
    }
    public unsubscribeToAirQuality(handler: ISimpleEventHandler<AirQualityEvent>, thingyId?: number) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.airQualityEvent.unsubscribe(handler);
    }

    public subscribeToPressure(handler: ISimpleEventHandler<PressureEvent>, thingyId?: number) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.pressureEvent.subscribe(handler);
    }
    public unsubscribeToPressure(handler: ISimpleEventHandler<PressureEvent>, thingyId?: number) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.pressureEvent.unsubscribe(handler);
    }

    public fireTemperatureEvent(event: TemperatureEvent, thingyId?: number) {
        let eventDispatcher: SimpleEventDispatcher<TemperatureEvent> = this.getThingyNotifyEvent(thingyId).temperatureEvent;
        eventDispatcher.dispatch(event);
        this.allThingyEvents.temperatureEvent.dispatchAsync(event);
    }

    public fireHumidityEvent(event: HumidityEvent, thingyId?: number) {
        let eventDispatcher: SimpleEventDispatcher<HumidityEvent> = this.getThingyNotifyEvent(thingyId).humidityEvent;
        eventDispatcher.dispatchAsync(event);
        this.allThingyEvents.humidityEvent.dispatchAsync(event);
    }

    public fireAirQualityEvent(event: AirQualityEvent, thingyId?: number) {
        let eventDispatcher: SimpleEventDispatcher<AirQualityEvent> = this.getThingyNotifyEvent(thingyId).airQualityEvent;
        eventDispatcher.dispatchAsync(event);
        this.allThingyEvents.airQualityEvent.dispatchAsync(event);
    }

    public firePressureEvent(event: PressureEvent, thingyId?: number) {
        let eventDispatcher: SimpleEventDispatcher<PressureEvent> = this.getThingyNotifyEvent(thingyId).pressureEvent;
        eventDispatcher.dispatchAsync(event);
        this.allThingyEvents.pressureEvent.dispatchAsync(event);
    }

}