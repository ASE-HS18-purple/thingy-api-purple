import {SimpleEventDispatcher, ISimpleEvent, ISimpleEventHandler} from 'strongly-typed-events';
import {AirQualityEvent, HumidityEvent, PressureEvent, TemperatureEvent, ThingyDataEvent, ThingyNotifyEvents} from './ThingyNotifyEvents';

export class EventBus {

    private specificThingyEvents: Map<number, ThingyNotifyEvents> = new Map<number, ThingyNotifyEvents>();
    // private allThingyEvents: ThingyNotifyEvents = new ThingyNotifyEvents();

    private createThingyEventsIfNotExisting(thingyId: number) {
        if (!this.specificThingyEvents.has(thingyId)) {
            this.specificThingyEvents.set(thingyId, new ThingyNotifyEvents());
        }
    }

    // public subscribeToAll(handler: ISimpleEventHandler<ThingyDataEvent>, thingyId?: number) {
    //     let thingyNotifyEvent: ThingyNotifyEvents;
    //     if (thingyId) {
    //         thingyNotifyEvent = this.allThingyEvents;
    //     } else {
    //         this.createThingyEventsIfNotExisting(thingyId);
    //         thingyNotifyEvent = this.specificThingyEvents.get(thingyId)
    //     }
    //     thingyNotifyEvent.temperatureEvent.subscribe(handler);
    //     thingyNotifyEvent.pressureEvent.subscribe(handler);
    //     thingyNotifyEvent.humidityEvent.subscribe(handler);
    //     thingyNotifyEvent.airQualityEvent.subscribe(handler);
    // }

    private getThingyNotifyEvent(thingyId: number) {
        let thingyEvents: ThingyNotifyEvents;
        if (thingyId) {
            this.createThingyEventsIfNotExisting(thingyId);
            thingyEvents = this.specificThingyEvents.get(thingyId);
        // } else {
        //     thingyEvents = this.allThingyEvents;
        }
        return thingyEvents;
    }

    public subscribeToTemperature(handler: ISimpleEventHandler<TemperatureEvent>, thingyId?: number) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.temperatureEvent.subscribe(handler);
    }

    public subscribeToHumidity(handler: ISimpleEventHandler<HumidityEvent>, thingyId?: number) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.humidityEvent.subscribe(handler);
    }

    public subscribeToAirQuality(handler: ISimpleEventHandler<AirQualityEvent>, thingyId?: number) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.airQualityEvent.subscribe(handler);
    }

    public subscribeToPressure(handler: ISimpleEventHandler<PressureEvent>, thingyId?: number) {
        let thingyEvents = this.getThingyNotifyEvent(thingyId);
        thingyEvents.pressureEvent.subscribe(handler);
    }

}