import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateOption } from '../../../../../core/models/scheduling.model';

@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-time-picker.component.html',
  styleUrl: './date-time-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateTimePickerComponent {
  readonly occupiedTimes = input.required<Set<string>>();
  readonly selectedDate = input.required<string>();
  readonly selectedTime = input.required<string>();
  readonly doctorSelected = input<boolean>(false);

  readonly dateSelected = output<string>();
  readonly timeSelected = output<string>();

  readonly availableDates = computed(() => this.generateDates());
  readonly availableTimes = computed(() => this.generateTimes());

  private generateDates(): DateOption[] {
    const dates: DateOption[] = [];
    const today = new Date();
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      dates.push({
        date: `${year}-${month}-${day}`,
        label: `${d.getDate()} ${months[d.getMonth()]}`,
        dayName: i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : days[d.getDay()],
      });
    }
    return dates;
  }

  private generateTimes(): string[] {
    const times: string[] = [];
    for (let h = 9; h < 18; h++) {
      times.push(`${String(h).padStart(2, '0')}:00`);
      times.push(`${String(h).padStart(2, '0')}:30`);
    }
    return times;
  }

  isTimeDisabled(time: string): boolean {
    const date = this.selectedDate();
    if (!date) return true;

    if (this.occupiedTimes().has(time)) {
      return true;
    }

    const now = new Date();
    const selectedDate = new Date(`${date}T${time}`);
    if (selectedDate <= now) {
      return true;
    }

    return false;
  }

  onTimeSelect(time: string): void {
    if (!this.isTimeDisabled(time)) {
      this.timeSelected.emit(time);
    }
  }
}
