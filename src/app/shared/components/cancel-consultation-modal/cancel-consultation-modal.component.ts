import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-cancel-consultation-modal',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  templateUrl: './cancel-consultation-modal.component.html',
  styleUrl: './cancel-consultation-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CancelConsultationModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly requireReason = input<boolean>(false);

  readonly close = output<void>();
  readonly submitted = output<string>();

  readonly cancelReasonInput = signal<string>('');

  onClose(): void {
    this.cancelReasonInput.set('');
    this.close.emit();
  }

  onSubmit(): void {
    const reason = this.cancelReasonInput().trim();
    if (this.requireReason() && !reason) {
      return;
    }
    this.submitted.emit(reason || 'Отменено пациентом');
    this.cancelReasonInput.set('');
  }
}
