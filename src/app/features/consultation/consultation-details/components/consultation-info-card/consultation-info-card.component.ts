import { Component, ChangeDetectionStrategy, input, output, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Consultation } from '../../../../../core/models/consultation.model';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { FormatDurationPipe } from '../../../../../shared/pipes/format-duration.pipe';

@Component({
  selector: 'app-consultation-info-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, FormatDurationPipe],
  templateUrl: './consultation-info-card.component.html',
  styleUrl: './consultation-info-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationInfoCardComponent implements OnDestroy {
  readonly consultation = input.required<Consultation>();
  readonly isDoctor = input.required<boolean>();
  readonly isPatient = input.required<boolean>();

  readonly confirm = output<void>();
  readonly start = output<void>();
  readonly openCancelModal = output<void>();
  readonly openConclusionModal = output<void>();
  readonly print = output<void>();

  readonly elapsedTimeText = signal<string>('00:00');
  private timerInterval: ReturnType<typeof setInterval> | undefined;

  constructor() {
    effect(() => {
      const c = this.consultation();
      if (c && c.status === 'in-progress' && c.startedAt) {
        if (!this.timerInterval) {
          this.timerInterval = setInterval(() => {
            const diffMs = Date.now() - new Date(c.startedAt!).getTime();
            const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
            const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const secs = (totalSeconds % 60).toString().padStart(2, '0');
            this.elapsedTimeText.set(`${mins}:${secs}`);
          }, 1000);
        }
      } else {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = undefined;
        }
      }
    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  getPatientDisplayName(): string {
    const c = this.consultation();
    return c.patientName || 'Пациент ' + c.patientId;
  }

  canPatientCancel(): boolean {
    const c = this.consultation();
    if (c.status === 'pending') return true;
    if (c.status === 'confirmed') {
      const consultationTime = new Date(c.datetime).getTime();
      const now = Date.now();
      const hoursDiff = (consultationTime - now) / (1000 * 60 * 60);
      return hoursDiff > 2;
    }
    return false;
  }
}
