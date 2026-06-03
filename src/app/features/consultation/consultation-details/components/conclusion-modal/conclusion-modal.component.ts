import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-conclusion-modal',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  templateUrl: './conclusion-modal.component.html',
  styleUrl: './conclusion-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConclusionModalComponent {
  readonly isOpen = input.required<boolean>();

  readonly close = output<void>();
  readonly submitted = output<string>();

  readonly conclusionInput = signal<string>('');

  onClose(): void {
    this.conclusionInput.set('');
    this.close.emit();
  }

  onSubmit(): void {
    const text = this.conclusionInput().trim();
    if (text) {
      this.submitted.emit(text);
      this.conclusionInput.set('');
    }
  }
}
