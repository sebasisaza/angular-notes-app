import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Note } from '../../data/notes';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input({ required: true }) recentNotes: Note[] = [];
  @Output() readonly createNote = new EventEmitter<void>();
  @Output() readonly search = new EventEmitter<void>();
  @Output() readonly noteSelected = new EventEmitter<Note>();
}
