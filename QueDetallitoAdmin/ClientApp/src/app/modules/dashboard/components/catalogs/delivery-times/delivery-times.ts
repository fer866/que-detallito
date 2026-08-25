export class DeliveryTime {
    id?: number;
    name?: string;
    startTimeStr?: string;
    endTimeStr?: string;
    saturday: boolean = false;
    sunday: boolean = false;
    maxTimeStr?: string;
    created?: string;
    active?: boolean;
}