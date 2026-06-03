import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ConsultationService } from '../../../core/services/consultation.service';
import { ConsultationStatus, Consultation } from '../../../core/models/consultation.model';

export interface ConsultationGroup {
  dateLabel: string;
  consultations: Consultation[];
}
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CancelConsultationModalComponent } from '../../../shared/components/cancel-consultation-modal/cancel-consultation-modal.component';

@Component({
  selector: 'app-consultations-list',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, CancelConsultationModalComponent],
  templateUrl: './consultations-list.html',
  styleUrl: './consultations-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationsList {
  private authService = inject(AuthService);
  private consultationService = inject(ConsultationService);

  viewMode = signal<'grid' | 'list'>('grid');
  statusFilter = signal<ConsultationStatus | 'all'>('all');

  isCancelModalOpen = signal<boolean>(false);
  selectedConsultationId = signal<string>('');
  selectedConsultationStatus = signal<string>('');

  private allMyConsultations = this.consultationService.getPatientConsultations(
    this.authService.currentUser()?.id || ''
  );

  private formatDateLabel(isoString: string): string {
    const date = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(date, today)) return 'Сегодня';
    if (isSameDay(date, tomorrow)) return 'Завтра';
    if (isSameDay(date, yesterday)) return 'Вчера';

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  filteredConsultationsGrouped = computed<ConsultationGroup[]>(() => {
    const filter = this.statusFilter();
    const consultations = this.allMyConsultations();

    // Сортировка строго по дате добавления (новые сверху), независимо от статуса
    let sorted = [...consultations].sort((a, b) => {
      return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
    });

    if (filter === 'pending') {
      sorted = sorted.filter(c => c.status === 'pending' || c.status === 'confirmed' || c.status === 'in-progress');
    } else if (filter !== 'all') {
      sorted = sorted.filter(c => c.status === filter);
    }

    const groupsMap = new Map<string, Consultation[]>();
    const dateLabelsOrder: string[] = [];

    sorted.forEach(c => {
      const label = this.formatDateLabel(c.datetime);
      if (!groupsMap.has(label)) {
        groupsMap.set(label, []);
        dateLabelsOrder.push(label); // Keep track of order since Map doesn't guarantee insertion order in all old browsers (though ES6 does, better safe)
      }
      groupsMap.get(label)!.push(c);
    });

    return dateLabelsOrder.map(label => ({
      dateLabel: label,
      consultations: groupsMap.get(label)!
    }));
  });

  setStatusFilter(status: ConsultationStatus | 'all') {
    this.statusFilter.set(status);
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  canCancel(status: ConsultationStatus, datetimeISO: string): boolean {
    if (status === 'pending') return true;
    const now = new Date();
    const consultationTime = new Date(datetimeISO);
    const diffHours = (consultationTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours >= 2;
  }

  cancelConsultation(id: string, status: string, datetimeISO: string) {
    this.selectedConsultationId.set(id);
    this.selectedConsultationStatus.set(status);
    if (this.canCancel(status as ConsultationStatus, datetimeISO)) {
      this.isCancelModalOpen.set(true);
    }
  }

  submitCancel(reason: string) {
    const id = this.selectedConsultationId();
    if (id) {
      this.consultationService.cancelConsultation(id, reason);
    }
    this.isCancelModalOpen.set(false);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'confirmed': return 'Подтверждена';
      case 'in-progress': return 'В процессе';
      case 'completed': return 'Завершена';
      case 'cancelled': return 'Отменена';
      default: return status;
    }
  }

  logout() {
    this.authService.logout();
  }
}
