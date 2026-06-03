import { Injectable, inject } from '@angular/core';
import { ConsultationFile } from '../models/consultation.model';
import { ConsultationStorageService } from './consultation-storage.service';


@Injectable({
  providedIn: 'root'
})
export class ConsultationFileService {
  private readonly storage = inject(ConsultationStorageService);

  addFile(consultationId: string, name: string, base64: string): void {
    const file: ConsultationFile = {
      id: this.storage.generateId(),
      name,
      base64,
      uploadedAt: new Date().toISOString()
    };

    this.storage.update(consultationId, (consultation) => ({
      ...consultation,
      files: [...consultation.files, file]
    }));
  }
}
