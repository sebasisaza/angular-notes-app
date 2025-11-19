import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Note, NotesService } from '../../data/notes';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-modal.html',
  styleUrl: './search-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchModalComponent {
  private readonly notesService = inject(NotesService);

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly noteSelected = new EventEmitter<Note>();

  protected readonly isOpen = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly allNotes = computed(() => this.notesService.notes());

  protected readonly searchResults = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return [];
    }

    return this.allNotes().filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(query);
      const itemsMatch = note.items.some((item) => item.toLowerCase().includes(query));
      const timeLabelMatch = note.timeLabel.toLowerCase().includes(query);
      return titleMatch || itemsMatch || timeLabelMatch;
    });
  });

  open(): void {
    this.isOpen.set(true);
    this.searchQuery.set('');
  }

  closeModal(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.close.emit();
  }

  protected handleBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal__backdrop')) {
      this.closeModal();
    }
  }

  protected selectNote(note: Note): void {
    this.noteSelected.emit(note);
    this.closeModal();
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
  }
}

