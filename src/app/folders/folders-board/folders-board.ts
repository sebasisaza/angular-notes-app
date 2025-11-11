import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Folder, FolderFilter } from '../../data/notes';
import { FolderCardComponent } from '../folder-card/folder-card';

interface FolderOption {
  label: string;
  value: FolderFilter;
  count: number;
}

@Component({
  selector: 'app-folders-board',
  standalone: true,
  imports: [FolderCardComponent],
  templateUrl: './folders-board.html',
  styleUrl: './folders-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoldersBoardComponent {
  @Input({ required: true }) folders: Folder[] = [];
  @Input({ required: true }) activeFilter!: FolderFilter;
  @Input({ required: true }) filterOptions: FolderOption[] = [];
  @Output() readonly filterChange = new EventEmitter<FolderFilter>();
}
