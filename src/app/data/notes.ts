import { Injectable, computed, effect, signal } from '@angular/core';

export type NotePeriod = 'today' | 'thisWeek' | 'thisMonth';

export type NoteAccent = 'lavender' | 'peach' | 'mint' | 'sunrise';

export interface Note {
  id: string;
  title: string;
  timeLabel: string;
  period: NotePeriod;
  items: string[];
  accent: NoteAccent;
  updatedAt: string;
}

export type FolderFilter = 'all' | 'recent' | 'lastModified';

export interface Folder {
  id: string;
  name: string;
  abbreviation: string;
  accent: NoteAccent;
  updatedAt: string;
  isRecent?: boolean;
}

interface NotesState {
  notes: Note[];
  folders: Folder[];
}

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private readonly storageKey = 'notes-app-state';
  private readonly storage: Storage | undefined =
    typeof window !== 'undefined' && window.localStorage ? window.localStorage : undefined;
  private readonly state = signal<NotesState>(this.loadState());

  readonly notes = computed(() => this.state().notes);
  readonly folders = computed(() => this.state().folders);

  constructor() {
    effect(
      () => {
        if (!this.storage) {
          return;
        }
        const nextState = JSON.stringify(this.state());
        this.storage.setItem(this.storageKey, nextState);
      },
      { allowSignalWrites: true }
    );
  }

  getNotesByPeriod(period: NotePeriod): Note[] {
    return this.notes().filter((note) => note.period === period);
  }

  getFoldersByFilter(filter: FolderFilter): Folder[] {
    const folders = this.folders();
    if (filter === 'all') {
      return folders;
    }

    if (filter === 'recent') {
      return folders.filter((folder) => folder.isRecent);
    }

    return [...folders].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  createNote(payload: { title: string; timeLabel: string; items: string[]; period: NotePeriod; accent: NoteAccent }): void {
    const id = payload.title.toLowerCase().replace(/\s+/g, '-') + '-' + this.generateId();
    const now = new Date().toISOString();

    this.state.update((current) => ({
      ...current,
      notes: [
        {
          id,
          updatedAt: now,
          ...payload,
        },
        ...current.notes,
      ],
    }));
  }

  updateNote(id: string, partial: Partial<Omit<Note, 'id'>>): void {
    this.state.update((current) => ({
      ...current,
      notes: current.notes.map((note) =>
        note.id === id ? { ...note, ...partial, updatedAt: new Date().toISOString() } : note
      ),
    }));
  }

  deleteNote(id: string): void {
    this.state.update((current) => ({
      ...current,
      notes: current.notes.filter((note) => note.id !== id),
    }));
  }

  private loadState(): NotesState {
    const stored = this.storage?.getItem(this.storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as NotesState;
        if (parsed.notes?.length && parsed.folders?.length) {
          return parsed;
        }
      } catch {
        // ignore parse errors and fall back to defaults
      }
    }

    const defaults = this.defaultState();
    this.storage?.setItem(this.storageKey, JSON.stringify(defaults));
    return defaults;
  }

  private defaultState(): NotesState {
    const now = new Date();
    return {
      notes: [
        {
          id: 'reminders-' + this.generateId(),
          title: 'Reminders',
          timeLabel: '8:00 PM',
          period: 'today',
          items: ['Dentist appointment on Tuesday', 'Submit report by end of the day', 'Send email to boss', 'Pick up groceries'],
          accent: 'lavender',
          updatedAt: now.toISOString(),
        },
        {
          id: 'random-thoughts-' + this.generateId(),
          title: 'Random Thoughts',
          timeLabel: '9:45 PM',
          period: 'today',
          items: ['Success is a journey, not a destination.', 'Try a new recipe this weekend!', "Don't forget to water the plants."],
          accent: 'mint',
          updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: 'books-' + this.generateId(),
          title: 'Books to Read',
          timeLabel: '9:00 AM',
          period: 'thisWeek',
          items: ['The Power of Habit', 'Atomic Habits', 'The Alchemist'],
          accent: 'sunrise',
          updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
          id: 'ideas-' + this.generateId(),
          title: 'Ideas',
          timeLabel: '4:30 PM',
          period: 'thisMonth',
          items: ['Launch a monthly newsletter', 'Plan a team off-site', 'Explore UI animation concepts'],
          accent: 'peach',
          updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 72).toISOString(),
        },
      ],
      folders: [
        {
          id: 'bucket-list',
          name: 'Bucket List',
          abbreviation: 'BL',
          accent: 'sunrise',
          updatedAt: now.toISOString(),
          isRecent: true,
        },
        {
          id: 'finances',
          name: 'Finances',
          abbreviation: 'Fi',
          accent: 'sunrise',
          updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
          isRecent: true,
        },
        {
          id: 'travel',
          name: 'Travel Plans',
          abbreviation: 'TP',
          accent: 'sunrise',
          updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          isRecent: true,
        },
        {
          id: 'shopping',
          name: 'Shopping',
          abbreviation: 'Sh',
          accent: 'sunrise',
          updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        },
        {
          id: 'personal',
          name: 'Personal',
          abbreviation: 'Pe',
          accent: 'sunrise',
          updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        },
        {
          id: 'work',
          name: 'Work',
          abbreviation: 'Wo',
          accent: 'sunrise',
          updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        },
      ],
    };
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return Math.random().toString(36).slice(2, 10);
  }
}
