import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { RoomsService } from 'src/app/core/services/rooms.service';

import { Subject, takeUntil } from 'rxjs';

import { Time, START, END } from 'src/app/core/models/times';
import { Room } from 'src/app/core/models/room';
import { BookSearch } from 'src/app/core/models/bookSearch';
import { RoomBooking } from 'src/app/core/models/roomBooking';

@Component({
  selector: 'app-single-room',
  templateUrl: './single-room.component.html',
  styleUrls: ['./single-room.component.css']
})
export class SingleRoomComponent implements OnInit, OnDestroy {

  room!: Room;
  bookings!: RoomBooking[]
  bookedTimes: Array<Object> = [];

  minDate!: Date;

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  };

  startTimes!: Time[];
  endTimes!: Time[];

  form!: FormGroup;
  date!: FormControl;
  startTime!: FormControl;
  endTime!: FormControl;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private location: Location,
    private roomsService: RoomsService
  ) {
    const targetDate = new Date();
    this.minDate = new Date(targetDate.setDate(targetDate.getDate() + 1));
  }

  ngOnInit(): void {
    this.getRoom();

    this.date = new FormControl('', Validators.required);
    this.startTime = new FormControl('', Validators.required);
    this.endTime = new FormControl('', Validators.required);

    this.form = this.fb.group({
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
    });

    this.date.valueChanges.subscribe( (value) => {
      const bookSearch = new BookSearch(this.room.id, value);
      const bookings$ = this.roomsService.searchBookings(bookSearch);
      bookings$.pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(response => {

        this.startTimes= START;
        this.endTimes= END;

        if (response.data) {
          this.bookings = response.data;
          for (let i=0; i<this.bookings.length; i++ ) {
            let start = this.startTimes.find( time => time.data === this.bookings[i].start_time);
            let end = this.endTimes.find( time => time.data === this.bookings[i].end_time);

            if (start && end) {
              for (let j=0; j<this.startTimes.length; j++) {
                if (this.startTimes[j].id >= start.id && this.startTimes[j].id < end.id) {
                  this.startTimes[j].valid = false;
                  console.log("Inizio INVALIDO:");
                  console.log(this.startTimes[j]);
                }
              }
              for (let y=0; y<this.endTimes.length; y++) {
                if (this.endTimes[y].id > start.id && this.endTimes[y].id <= end.id) {
                  this.endTimes[y].valid = false;
                  console.log("Fine INVALIDATO:");
                  console.log(this.endTimes[y]);
                }
              }
            }
          
          }
          console.log("Inizio Disponibili Post Ciclo:");
          console.log(this.startTimes);
          console.log("Fine Disponibili Post Ciclo:");
          console.log(this.endTimes);
          
        } else {
          console.error(response.error);
        }
      })
    });

    this.form.valueChanges.subscribe( () => {
      if (this.endTime.value.id <= this.startTime.value.id) {
        this.form.controls.endTime.setErrors({ valid: false });
      } else {
        this.form.controls.endTime.setErrors(null);
      }
    });
  }

  getRoom(): void {
    
    const id = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
    this.roomsService.roomsList$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe( (response) => {
        let matchRoom = response.data.find(room => room.id === id);
        if (matchRoom != undefined) {
          this.room = matchRoom
        } else {
          console.error("Stanza non trovata");
        }
      }
    );
  }

  onSubmit(): void {
    console.log(this.form.value);
  }

  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

}
