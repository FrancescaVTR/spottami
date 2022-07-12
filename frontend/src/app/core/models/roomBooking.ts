export class RoomBooking {
    constructor (
        public user_id: number,
        public room_id: number,
        public booking_date: string,  // DATE => YYYY-MM-DD hh:mm:ss
        public start_time: string,
        public end_time: string
    ) { }
}