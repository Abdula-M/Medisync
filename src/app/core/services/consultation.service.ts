import { Injectable, inject, computed } from '@angular/core';
import { Consultation, ConsultationStatus } from '../models/consultation.model';
import { ConsultationStorageService } from './consultation-storage.service';
import { DoctorService } from './doctor.service';


@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private readonly storage = inject(ConsultationStorageService);
  private readonly doctorService = inject(DoctorService);


  getPatientConsultations(patientId: string) {
    return computed(() => this.storage.consultations().filter(c => c.patientId === patientId));
  }

  getConsultationsByDoctor(doctorId: string) {
    return computed(() => this.storage.consultations().filter(c => c.doctorId === doctorId));
  }

  getAllConsultations() {
    return computed(() => this.storage.consultations());
  }

  getConsultationById(id: string) {
    return computed(() => this.storage.consultations().find(c => c.id === id));
  }


  sortConsultations(list: Consultation[]): Consultation[] {
    const statusPriority: Record<string, number> = {
      'in-progress': 0,
      'pending': 1,
      'confirmed': 2,
      'completed': 3,
      'cancelled': 4,
    };

    return [...list].sort((a, b) => {
      const priorityA = statusPriority[a.status] ?? 5;
      const priorityB = statusPriority[b.status] ?? 5;

      const timeA = new Date(a.datetime).getTime();
      const timeB = new Date(b.datetime).getTime();

      // Для истории (завершенные и отмененные) сортируем строго по дате убывания (новые сверху)
      if (priorityA >= 3 && priorityB >= 3) {
        return timeB - timeA;
      }

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Для активных с одинаковым приоритетом сортируем по дате возрастания (ближайшие сверху)
      return timeA - timeB;
    });
  }


  isDoctorAvailable(doctorId: string, datetimeISO: string): boolean {
    const existing = this.storage.consultations().find(
      c => c.doctorId === doctorId && c.datetime === datetimeISO && c.status !== 'cancelled'
    );
    return !existing;
  }


  createConsultation(patientId: string, patientName: string, doctorId: string, datetimeISO: string, symptoms: string): boolean {
    if (!this.isDoctorAvailable(doctorId, datetimeISO)) {
      return false;
    }

    const doctor = this.doctorService.getDoctorById(doctorId);
    if (!doctor) return false;

    const newConsultation: Consultation = {
      id: this.storage.generateId(),
      patientId,
      patientName,
      doctorId,
      doctorName: doctor.name,
      datetime: datetimeISO,
      status: 'pending',
      symptoms,
      chatMessages: [],
      files: []
    };

    this.storage.add(newConsultation);
    return true;
  }


  cancelConsultation(id: string, reason?: string): boolean {
    return this.updateConsultationStatus(id, 'cancelled', undefined, reason);
  }

  updateConsultationStatus(id: string, status: ConsultationStatus, conclusion?: string, cancelReason?: string): boolean {
    return this.storage.update(id, (consultation) => {
      let startedAt = consultation.startedAt;
      let durationSeconds = consultation.durationSeconds;

      if (status === 'in-progress' && !startedAt) {
        startedAt = new Date().toISOString();
      }

      if (status === 'completed' && startedAt && durationSeconds === undefined) {
        const diffMs = new Date().getTime() - new Date(startedAt).getTime();
        durationSeconds = Math.floor(diffMs / 1000);
      }

      return {
        ...consultation,
        status,
        ...(startedAt ? { startedAt } : {}),
        ...(durationSeconds !== undefined ? { durationSeconds } : {}),
        ...(conclusion ? { conclusion } : {}),
        ...(cancelReason ? { cancelReason } : {})
      };
    });
  }
}
