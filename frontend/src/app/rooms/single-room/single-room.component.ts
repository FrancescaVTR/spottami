import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { Time, TIMES } from 'src/app/core/models/times';

@Component({
  selector: 'app-single-room',
  templateUrl: './single-room.component.html',
  styleUrls: ['./single-room.component.css']
})
export class SingleRoomComponent implements OnInit {

  minDate!: Date;

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  };

  times: Time[] = TIMES

  form!: FormGroup;
  date!: FormControl;
  startTime!: FormControl;
  endTime!: FormControl;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    private location: Location
  ) {
    const targetDate = new Date();
    this.minDate = new Date(targetDate.setDate(targetDate.getDate() + 1));
  }

  ngOnInit(): void {
    this.date = new FormControl('', Validators.required);
    this.startTime = new FormControl('', Validators.required);
    this.endTime = new FormControl('', Validators.required);

    this.form = this.fb.group({
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
    });

    this.form.valueChanges.subscribe( () => {
      if (this.endTime.value.id <= this.startTime.value.id) {
        this.form.controls.endTime.setErrors({ valid: false });
      } else {
        this.form.controls.endTime.setErrors(null);
      }
    });
  }

  onSubmit(): void {
    console.log(this.form.value);
  }

  goBack(): void {
    this.location.back();
  }

}