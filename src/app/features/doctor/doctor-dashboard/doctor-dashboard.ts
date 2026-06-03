import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ConsultationService } from '../../../core/services/consultation.service';
import { Consultation } from '../../../core/models/consultation.model';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';

export interface ConsultationGroup {
  dateLabel: string;
  consultations: Consultation[];
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorDashboard implements OnInit {
  private authService = inject(AuthService);
  private consultationService = inject(ConsultationService);
  private elementRef = inject(ElementRef);

  doctor = computed(() => this.authService.currentUser());

  activeTab = signal<'schedule' | 'history'>('schedule');
  dateFilter = signal<string>('');
  statusFilter = signal<string>('all');
  isStatusDropdownOpen = signal<boolean>(false);

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isStatusDropdownOpen.set(false);
    }
  }

  toggleStatusDropdown(event: Event) {
    event.stopPropagation();
    this.isStatusDropdownOpen.update(v => !v);
  }

  selectStatus(status: string) {
    this.statusFilter.set(status);
    this.isStatusDropdownOpen.set(false);
  }

  setTab(tab: 'schedule' | 'history') {
    this.activeTab.set(tab);
    this.clearFilters();
  }

  clearFilters() {
    this.dateFilter.set('');
    this.statusFilter.set('all');
  }

  private formatDateLabel(isoString: string): string {
    const date = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(date, today)) return 'Сегодня';
    if (isSameDay(date, tomorrow)) return 'Завтра';

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  upcomingConsultationsGrouped = computed<ConsultationGroup[]>(() => {
    const doc = this.doctor();
    if (!doc) return [];

    let list = this.consultationService.getAllConsultations()();
    list = this.consultationService.sortConsultations(list);

    list = list.filter(c => {
      const matchStatus = this.statusFilter() === 'all' || c.status === this.statusFilter();
      const matchDate = !this.dateFilter() || c.datetime.startsWith(this.dateFilter());
      return matchStatus && matchDate && ['pending', 'confirmed', 'in-progress'].includes(c.status);
    });

    const groupsMap = new Map<string, Consultation[]>();

    list.forEach(c => {
      const label = this.formatDateLabel(c.datetime);
      if (!groupsMap.has(label)) {
        groupsMap.set(label, []);
      }
      groupsMap.get(label)!.push(c);
    });

    const groups: ConsultationGroup[] = [];
    groupsMap.forEach((consultations, dateLabel) => {
      groups.push({ dateLabel, consultations });
    });

    return groups;
  });

  pastConsultations = computed<Consultation[]>(() => {
    const doc = this.doctor();
    if (!doc) return [];

    let list = this.consultationService.getAllConsultations()();
    list = this.consultationService.sortConsultations(list);

    return list.filter(c => {
      const matchStatus = this.statusFilter() === 'all' || c.status === this.statusFilter();
      const matchDate = !this.dateFilter() || c.datetime.startsWith(this.dateFilter());
      return matchStatus && matchDate && ['completed', 'cancelled'].includes(c.status);
    });
  });

  ngOnInit(): void {
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

  getStatusFilterLabel(status: string): string {
    if (status === 'all') return 'Все статусы';
    return this.getStatusLabel(status);
  }

  logout() {
    this.authService.logout();
  }
}
