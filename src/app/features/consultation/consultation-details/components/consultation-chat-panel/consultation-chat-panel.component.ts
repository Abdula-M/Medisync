import {
  Component, ChangeDetectionStrategy, input, output,
  signal, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../../../../core/models/consultation.model';
import { Role } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-consultation-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultation-chat-panel.component.html',
  styleUrl: './consultation-chat-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationChatPanelComponent implements OnInit, OnDestroy, AfterViewChecked {
  readonly messages = input.required<ChatMessage[]>();
  readonly currentUserRole = input.required<Role>();
  readonly canChat = input.required<boolean>();

  readonly messageSent = output<string>();

  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  readonly newMessage = signal<string>('');

  private shouldScroll = true;
  private previousMessageCount = 0;
  private chatInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    this.chatInterval = setInterval(() => {
      const currentMessages = this.messages();
      if (currentMessages.length > this.previousMessageCount) {
        this.shouldScroll = true;
        this.previousMessageCount = currentMessages.length;
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.chatInterval) {
      clearInterval(this.chatInterval);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage(): void {
    const text = this.newMessage().trim();
    if (!text) return;
    this.messageSent.emit(text);
    this.newMessage.set('');
    this.shouldScroll = true;
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }
}
