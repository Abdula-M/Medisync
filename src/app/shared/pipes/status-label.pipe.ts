import { Pipe, PipeTransform } from '@angular/core';

const STATUS_LABELS: Record<string, string> = {
  'pending': 'Ожидает',
  'confirmed': 'Подтверждена',
  'in-progress': 'В процессе',
  'completed': 'Завершена',
  'cancelled': 'Отменена'
};

@Pipe({
  name: 'statusLabel',
  standalone: true
})
export class StatusLabelPipe implements PipeTransform {
  transform(status: string | undefined): string {
    if (!status) return '';
    return STATUS_LABELS[status] ?? status;
  }
}
