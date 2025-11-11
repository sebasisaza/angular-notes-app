import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Note } from '../../data/notes';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input({ required: true }) recentNotes: Note[] = [];
  @Output() readonly createNote = new EventEmitter<void>();
}
