import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Doctor } from '../../../../../core/models/consultation.model';
import { getInitials } from '../../../../../shared/utils/string.utils';

@Component({
  selector: 'app-doctor-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-selector.component.html',
  styleUrl: './doctor-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorSelectorComponent {
  readonly doctors = input.required<Doctor[]>();
  readonly selectedDoctorId = input.required<string>();

  readonly doctorSelected = output<string>();

  getDoctorInitials(name: string): string {
    return getInitials(name);
  }
}
