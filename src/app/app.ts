import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { NotesBoardComponent } from './notes/notes-board/notes-board';
import { CreateNoteModalComponent } from './modals/create-note-modal/create-note-modal';
import { SearchModalComponent } from './modals/search-modal/search-modal';
import { Note, NotePeriod, NotesService } from './data/notes';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, NotesBoardComponent, CreateNoteModalComponent, SearchModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly periodDefinitions = [
    { label: 'This Month', value: 'thisMonth' as NotePeriod },
    { label: 'This Week', value: 'thisWeek' as NotePeriod },
    { label: 'Today', value: 'today' as NotePeriod }
  ];

  private readonly notesService = inject(NotesService);
  
  protected readonly createNoteModal = viewChild(CreateNoteModalComponent);
  protected readonly searchModal = viewChild(SearchModalComponent);

  protected readonly activePeriod = signal<NotePeriod>('today');

  protected readonly periodOptions = computed(() =>
    this.periodDefinitions.map((definition) => ({
      ...definition,
      count: this.notesService.getNotesByPeriod(definition.value).length,
    }))
  );

  protected readonly notes = computed(() =>
    this.notesService.getNotesByPeriod(this.activePeriod())
  );

  protected readonly recentNotes = computed(() =>
    [...this.notesService.notes()].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ).slice(0, 5)
  );

  protected handleCreateNote(): void {
    const modal = this.createNoteModal();
    if (modal) {
      modal.open();
    }
  }

  protected handleSearch(): void {
    const modal = this.searchModal();
    if (modal) {
      modal.open();
    }
  }

  protected handleEditNote(note: Note): void {
    const modal = this.createNoteModal();
    if (modal) {
      modal.openForEdit(note);
    }
  }

  protected handleNoteCreated(period: NotePeriod): void {
    this.activePeriod.set(period);
  }

  protected handleNoteUpdated(period: NotePeriod): void {
    this.activePeriod.set(period);
  }

  protected handleNoteSelected(note: Note): void {
    // Switch to the period of the selected note
    this.activePeriod.set(note.period);
  }

  protected handleNoteDeleted(): void {
    // Note deleted - view will automatically update via signals
    // Optionally switch to default period if current period has no notes
    const currentNotes = this.notes();
    if (currentNotes.length === 0) {
      // Switch to first period that has notes, or keep current
      const periods: NotePeriod[] = ['today', 'thisWeek', 'thisMonth'];
      const periodWithNotes = periods.find((period) => 
        this.notesService.getNotesByPeriod(period).length > 0
      );
      if (periodWithNotes) {
        this.activePeriod.set(periodWithNotes);
      }
    }
  }

  protected handlePeriodChange(period: NotePeriod): void {
    this.activePeriod.set(period);
  }
}
