import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { NotesBoardComponent } from './notes/notes-board/notes-board';
import { FoldersBoardComponent } from './folders/folders-board/folders-board';
import { CreateNoteModalComponent } from './modals/create-note-modal/create-note-modal';
import { SearchModalComponent } from './modals/search-modal/search-modal';
import { FolderFilter, Note, NotePeriod, NotesService } from './data/notes';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, NotesBoardComponent, FoldersBoardComponent, CreateNoteModalComponent, SearchModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly periodDefinitions = [
    { label: 'This Month', value: 'thisMonth' as NotePeriod },
    { label: 'This Week', value: 'thisWeek' as NotePeriod },
    { label: 'Today', value: 'today' as NotePeriod }
  ];

  private readonly folderDefinitions = [
    { label: 'All', value: 'all' as FolderFilter },
    { label: 'Recent', value: 'recent' as FolderFilter },
    { label: 'Last modified', value: 'lastModified' as FolderFilter },
  ];

  private readonly notesService = inject(NotesService);
  
  protected readonly createNoteModal = viewChild(CreateNoteModalComponent);
  protected readonly searchModal = viewChild(SearchModalComponent);

  protected readonly activePeriod = signal<NotePeriod>('today');
  protected readonly activeFolderFilter = signal<FolderFilter>('all');

  protected readonly periodOptions = computed(() =>
    this.periodDefinitions.map((definition) => ({
      ...definition,
      count: this.notesService.getNotesByPeriod(definition.value).length,
    }))
  );

  protected readonly folderOptions = computed(() =>
    this.folderDefinitions.map((definition) => ({
      ...definition,
      count: this.notesService.getFoldersByFilter(definition.value).length,
    }))
  );

  protected readonly notes = computed(() =>
    this.notesService.getNotesByPeriod(this.activePeriod())
  );

  protected readonly folders = this.notesService.folders;

  protected readonly recentNotes = computed(() =>
    [...this.notesService.notes()].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ).slice(0, 5)
  );

  protected readonly filteredFolders = computed(() =>
    this.notesService.getFoldersByFilter(this.activeFolderFilter())
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

  protected handlePeriodChange(period: NotePeriod): void {
    this.activePeriod.set(period);
  }

  protected handleFolderFilterChange(filter: FolderFilter): void {
    this.activeFolderFilter.set(filter);
  }
}
