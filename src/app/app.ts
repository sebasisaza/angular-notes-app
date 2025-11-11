import { Component, computed, inject, signal } from '@angular/core';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { NotesBoardComponent } from './notes/notes-board/notes-board';
import { FoldersBoardComponent } from './folders/folders-board/folders-board';
import { FolderFilter, NotePeriod, NotesService } from './data/notes';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, NotesBoardComponent, FoldersBoardComponent],
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
    const defaults = [
      {
        title: 'Daily Reflections',
        timeLabel: '7:30 PM',
        items: ['Highlight of the day', 'One thing I learned', 'Gratitude moment'],
        period: 'today' as NotePeriod,
        accent: 'mint' as const,
      },
      {
        title: 'Weekend Prep',
        timeLabel: 'Friday 5:00 PM',
        items: ['Plan a hike route', 'Call the grandparents', 'Prep grocery list'],
        period: 'thisWeek' as NotePeriod,
        accent: 'peach' as const,
      },
      {
        title: 'Reading List',
        timeLabel: 'Anytime',
        items: ['Finish blog draft', 'Review design notes', 'Sketch new hero layout'],
        period: 'thisMonth' as NotePeriod,
        accent: 'lavender' as const,
      },
    ];

    const suggestion = defaults[Math.floor(Math.random() * defaults.length)];
    this.notesService.createNote(suggestion);
    this.activePeriod.set(suggestion.period);
  }

  protected handlePeriodChange(period: NotePeriod): void {
    this.activePeriod.set(period);
  }

  protected handleFolderFilterChange(filter: FolderFilter): void {
    this.activeFolderFilter.set(filter);
  }
}
