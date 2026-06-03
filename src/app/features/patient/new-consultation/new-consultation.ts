import { Component, ChangeDetectionStrategy, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ConsultationService } from '../../../core/services/consultation.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { DoctorSelectorComponent } from './components/doctor-selector/doctor-selector.component';
import { DateTimePickerComponent } from './components/date-time-picker/date-time-picker.component';
import { SymptomsFormComponent } from './components/symptoms-form/symptoms-form.component';

@Component({
  selector: 'app-new-consultation',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    HeaderComponent,
    DoctorSelectorComponent,
    DateTimePickerComponent,
    SymptomsFormComponent
  ],
  templateUrl: './new-consultation.html',
  styleUrl: './new-consultation.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewConsultation {
  private readonly authService = inject(AuthService);
  private readonly consultationService = inject(ConsultationService);
  private readonly doctorService = inject(DoctorService);
  private readonly router = inject(Router);

  @ViewChild(SymptomsFormComponent) private symptomsForm!: SymptomsFormComponent;

  readonly doctors = this.doctorService.doctors;
  readonly error = signal<string | null>(null);

  readonly selectedDoctorId = signal<string>('');
  readonly selectedDate = signal<string>('');
  readonly selectedTime = signal<string>('');
  
  private symptoms = signal<string>('');
  private isFormValid = signal<boolean>(false);

  readonly occupiedTimes = computed(() => {
    const docId = this.selectedDoctorId();
    const date = this.selectedDate();
    if (!docId || !date) return new Set<string>();

    const consults = this.consultationService.getAllConsultations()();
    const occupied = new Set<string>();

    consults.forEach(c => {
      if (c.doctorId === docId && c.status !== 'cancelled') {
        const cDate = new Date(c.datetime);
        const y = cDate.getFullYear();
        const m = String(cDate.getMonth() + 1).padStart(2, '0');
        const d = String(cDate.getDate()).padStart(2, '0');
        const cDateStr = `${y}-${m}-${d}`;
        if (cDateStr === date) {
          const time = `${String(cDate.getHours()).padStart(2, '0')}:${String(cDate.getMinutes()).padStart(2, '0')}`;
          occupied.add(time);
        }
      }
    });

    return occupied;
  });

  readonly isSubmitDisabled = computed(() => {
    return !this.selectedDoctorId() || !this.selectedDate() || !this.selectedTime() || !this.isFormValid();
  });

  onDoctorSelect(id: string): void {
    this.selectedDoctorId.set(id);
    this.selectedTime.set('');
  }

  onDateSelect(date: string): void {
    this.selectedDate.set(date);
    this.selectedTime.set('');
  }

  onTimeSelect(time: string): void {
    this.selectedTime.set(time);
  }

  onSymptomsChange(symptoms: string): void {
    this.symptoms.set(symptoms);
  }

  onFormValidationChange(isValid: boolean): void {
    this.isFormValid.set(isValid);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.symptomsForm?.markAsTouched();
      return;
    }

    const docId = this.selectedDoctorId();
    const date = this.selectedDate();
    const time = this.selectedTime();

    if (!docId || !date || !time) {
      this.error.set('Пожалуйста, выберите врача, дату и время.');
      return;
    }

    const localDate = new Date(`${date}T${time}`);
    const isoString = localDate.toISOString();

    const patient = this.authService.currentUser();
    if (!patient) return;

    this.error.set(null);
    const success = this.consultationService.createConsultation(
      patient.id, 
      patient.username, 
      docId, 
      isoString, 
      this.symptoms()
    );

    if (success) {
      this.router.navigate(['/consultations']);
    } else {
      this.error.set('Выбранное время уже занято у данного врача. Пожалуйста, выберите другое.');
    }
  }
}
