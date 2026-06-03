import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ConsultationService } from '../../../core/services/consultation.service';
import { ConsultationChatService } from '../../../core/services/consultation-chat.service';
import { ConsultationFileService } from '../../../core/services/consultation-file.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ConsultationInfoCardComponent } from './components/consultation-info-card/consultation-info-card.component';
import { ConsultationFilesPanelComponent } from './components/consultation-files-panel/consultation-files-panel.component';
import { ConsultationChatPanelComponent } from './components/consultation-chat-panel/consultation-chat-panel.component';
import { CancelConsultationModalComponent } from '../../../shared/components/cancel-consultation-modal/cancel-consultation-modal.component';
import { ConclusionModalComponent } from './components/conclusion-modal/conclusion-modal.component';

@Component({
  selector: 'app-consultation-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    ConsultationInfoCardComponent,
    ConsultationFilesPanelComponent,
    ConsultationChatPanelComponent,
    CancelConsultationModalComponent,
    ConclusionModalComponent
  ],
  templateUrl: './consultation-details.html',
  styleUrl: './consultation-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly consultationService = inject(ConsultationService);
  private readonly chatService = inject(ConsultationChatService);
  private readonly fileService = inject(ConsultationFileService);

  private readonly consultationId = signal<string>('');
  readonly currentUser = this.authService.currentUser;
  readonly consultation = computed(() => this.consultationService.getConsultationById(this.consultationId())());

  readonly isCancelModalOpen = signal<boolean>(false);
  readonly isConclusionModalOpen = signal<boolean>(false);

  readonly isPatient = computed(() => this.currentUser()?.role === 'patient');
  readonly isDoctor = computed(() => this.currentUser()?.role === 'doctor');
  readonly backUrl = computed(() => this.isPatient() ? '/consultations' : '/consultations/doctor');

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.consultationId.set(id);
      }
    });
  }

  confirmConsultation(): void {
    this.consultationService.updateConsultationStatus(this.consultationId(), 'confirmed');
  }

  startConsultation(): void {
    this.consultationService.updateConsultationStatus(this.consultationId(), 'in-progress');
  }

  submitCancel(reason: string): void {
    this.consultationService.updateConsultationStatus(this.consultationId(), 'cancelled', undefined, reason);
    this.isCancelModalOpen.set(false);
  }

  submitConclusion(conclusion: string): void {
    this.consultationService.updateConsultationStatus(this.consultationId(), 'completed', conclusion);
    this.isConclusionModalOpen.set(false);
  }

  onFileUploaded(file: { name: string; base64: string }): void {
    this.fileService.addFile(this.consultationId(), file.name, file.base64);
  }

  sendMessage(text: string): void {
    const user = this.currentUser();
    if (user) {
      this.chatService.addMessage(this.consultationId(), user.id, user.role, text);
    }
  }

  printProtocol(): void {
    window.print();
  }
}
