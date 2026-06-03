import { Injectable, inject } from '@angular/core';
import { ChatMessage } from '../models/consultation.model';
import { ConsultationStorageService } from './consultation-storage.service';


@Injectable({
  providedIn: 'root'
})
export class ConsultationChatService {
  private readonly storage = inject(ConsultationStorageService);

  addMessage(consultationId: string, senderId: string, senderRole: 'patient' | 'doctor', text: string): void {
    const message: ChatMessage = {
      id: this.storage.generateId(),
      senderId,
      senderRole,
      text,
      timestamp: new Date().toISOString()
    };

    this.storage.update(consultationId, (consultation) => ({
      ...consultation,
      chatMessages: [...consultation.chatMessages, message]
    }));
  }
}
