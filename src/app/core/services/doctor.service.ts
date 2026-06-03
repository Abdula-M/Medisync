import { Injectable, signal } from '@angular/core';
import { Doctor } from '../models/consultation.model';


@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  readonly doctors = signal<Doctor[]>([
    { id: '1', name: 'Магомедов Али Магомедович', specialization: 'Терапевт' },
    { id: '2', name: 'Гаджиева Фатима Расуловна', specialization: 'Кардиолог' }
  ]);

  getDoctorById(id: string): Doctor | undefined {
    return this.doctors().find(d => d.id === id);
  }
}
