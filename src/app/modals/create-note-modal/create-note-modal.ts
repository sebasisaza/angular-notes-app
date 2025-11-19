import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Note, NoteAccent, NotePeriod, NotesService } from '../../data/notes';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-note-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-note-modal.html',
  styleUrl: './create-note-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateNoteModalComponent {
  private readonly notesService = inject(NotesService);

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly noteCreated = new EventEmitter<NotePeriod>();
  @Output() readonly noteUpdated = new EventEmitter<NotePeriod>();

  protected readonly isOpen = signal(false);
  protected readonly isEditMode = signal(false);
  protected readonly editingNoteId = signal<string | null>(null);
  protected readonly title = signal('');
  protected readonly timeLabel = signal('');
  protected readonly period = signal<NotePeriod>('today');
  protected readonly accent = signal<NoteAccent>('lavender');
  protected readonly items = signal<string[]>(['']);

  protected readonly periodOptions: { label: string; value: NotePeriod }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'This Month', value: 'thisMonth' },
  ];

  protected readonly accentOptions: { label: string; value: NoteAccent; color: string }[] = [
    { label: 'Lavender', value: 'lavender', color: '#d8ccff' },
    { label: 'Peach', value: 'peach', color: '#ffd7c5' },
    { label: 'Mint', value: 'mint', color: '#e6fac9' },
    { label: 'Sunrise', value: 'sunrise', color: '#ffe5b0' },
  ];

  open(): void {
    this.isEditMode.set(false);
    this.editingNoteId.set(null);
    this.resetForm();
    this.isOpen.set(true);
  }

  openForEdit(note: Note): void {
    this.isEditMode.set(true);
    this.editingNoteId.set(note.id);
    this.title.set(note.title);
    this.timeLabel.set(note.timeLabel);
    this.period.set(note.period);
    this.accent.set(note.accent);
    this.items.set(note.items.length > 0 ? [...note.items] : ['']);
    this.isOpen.set(true);
  }

  closeModal(): void {
    this.isOpen.set(false);
    this.resetForm();
    this.close.emit();
  }

  protected handleBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal__backdrop')) {
      this.closeModal();
    }
  }

  protected addItem(): void {
    this.items.update((items) => [...items, '']);
  }

  protected removeItem(index: number): void {
    this.items.update((items) => items.filter((_, i) => i !== index));
  }

  protected updateItem(index: number, value: string): void {
    this.items.update((items) => {
      const updated = [...items];
      updated[index] = value;
      return updated;
    });
  }

  protected handleSubmit(): void {
    const title = this.title().trim();
    const timeLabel = this.timeLabel().trim();
    const filteredItems = this.items()
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (!title || filteredItems.length === 0) {
      return;
    }

    const period = this.period();
    const noteId = this.editingNoteId();

    if (noteId && this.isEditMode()) {
      // Update existing note
      this.notesService.updateNote(noteId, {
        title,
        timeLabel: timeLabel || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        items: filteredItems,
        period,
        accent: this.accent(),
      });
      this.noteUpdated.emit(period);
    } else {
      // Create new note
      this.notesService.createNote({
        title,
        timeLabel: timeLabel || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        items: filteredItems,
        period,
        accent: this.accent(),
      });
      this.noteCreated.emit(period);
    }

    this.closeModal();
  }

  private resetForm(): void {
    this.isEditMode.set(false);
    this.editingNoteId.set(null);
    this.title.set('');
    this.timeLabel.set('');
    this.period.set('today');
    this.accent.set('lavender');
    this.items.set(['']);
  }
}

