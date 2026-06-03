import { Injectable, signal } from '@angular/core';
import { Consultation } from '../models/consultation.model';


@Injectable({
  providedIn: 'root'
})
export class ConsultationStorageService {
  private readonly STORAGE_KEY = 'medisync_consultations';

  private readonly _consultations = signal<Consultation[]>(this.loadFromStorage());

  readonly consultations = this._consultations.asReadonly();

  constructor() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY) {
        this._consultations.set(this.loadFromStorage());
      }
    });
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  add(consultation: Consultation): void {
    const updated = [...this._consultations(), consultation];
    this.saveToStorage(updated);
  }

  update(id: string, updater: (consultation: Consultation) => Consultation): boolean {
    const current = this._consultations();
    const index = current.findIndex(c => c.id === id);
    if (index === -1) return false;

    const updated = [...current];
    updated[index] = updater(current[index]);
    this.saveToStorage(updated);
    return true;
  }

  private loadFromStorage(): Consultation[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(data: Consultation[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    this._consultations.set(data);
  }
}
