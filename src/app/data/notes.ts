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

interface NotesState {
  notes: Note[];
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
        const parsed = JSON.parse(stored) as { notes?: Note[]; folders?: unknown };
        if (parsed.notes && Array.isArray(parsed.notes) && parsed.notes.length > 0) {
          // Return only notes, ignoring any folders in stored data
          return { notes: parsed.notes };
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
    };
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return Math.random().toString(36).slice(2, 10);
  }
}
