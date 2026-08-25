export class Calendar {
    id?: number;
    calDate?: string;
}

export class GroupCalendar {
    groupDate?: string
    calendars: Array<Calendar> = [];
}