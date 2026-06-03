import { Component, ChangeDetectionStrategy, input, output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-symptoms-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './symptoms-form.component.html',
  styleUrl: './symptoms-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymptomsFormComponent implements OnInit, OnDestroy {
  readonly disabled = input<boolean>(false);

  readonly symptomsChanged = output<string>();
  readonly formValid = output<boolean>();

  form: FormGroup;
  private sub?: Subscription;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      symptoms: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.sub = this.form.valueChanges.subscribe(val => {
      this.symptomsChanged.emit(val.symptoms || '');
      this.formValid.emit(this.form.valid);
    });
    this.formValid.emit(this.form.valid);
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  markAsTouched(): void {
    this.form.markAllAsTouched();
  }
}
