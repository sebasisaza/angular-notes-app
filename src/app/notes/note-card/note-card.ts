import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Note } from '../../data/notes';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './note-card.html',
  styleUrl: './note-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteCardComponent {
  @Input({ required: true }) note!: Note;
  @Output() readonly editNote = new EventEmitter<Note>();
}
