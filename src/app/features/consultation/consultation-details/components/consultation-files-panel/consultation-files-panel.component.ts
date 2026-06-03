import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationFile } from '../../../../../core/models/consultation.model';

@Component({
  selector: 'app-consultation-files-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultation-files-panel.component.html',
  styleUrl: './consultation-files-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationFilesPanelComponent {
  readonly files = input.required<ConsultationFile[]>();
  readonly isPatient = input.required<boolean>();
  readonly isCancelled = input.required<boolean>();

  readonly fileSelected = output<{ name: string; base64: string }>();

  readonly fileWarning = signal<string | null>(null);

  openFile(file: ConsultationFile, event: Event): void {
    event.preventDefault();
    try {
      const parts = file.base64.split(';base64,');
      if (parts.length !== 2) return;

      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      const blob = new Blob([uInt8Array], { type: contentType });
      const url = URL.createObjectURL(blob);

      const newWin = window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);

      if (!newWin) {
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
      }
    } catch (e) {
      console.error('Error opening file:', e);
    }
  }

  onFileSelected(event: Event): void {
    this.fileWarning.set(null);
    const input = event.target as HTMLInputElement;
    const file: File | null = input.files ? input.files[0] : null;
    if (!file) return;

    if (file.size > 1048576) {
      this.fileWarning.set('Размер файла превышает 1 МБ. Пожалуйста, выберите файл меньшего размера.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const base64 = e.target?.result as string;
      if (base64) {
        this.fileSelected.emit({ name: file.name, base64 });
      }
    };
    reader.readAsDataURL(file);
    input.value = '';
  }
}
