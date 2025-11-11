import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { Folder } from '../../data/notes';

@Component({
  selector: 'app-folder-card',
  standalone: true,
  imports: [DatePipe, NgClass],
  templateUrl: './folder-card.html',
  styleUrl: './folder-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FolderCardComponent {
  @Input({ required: true }) folder!: Folder;
}
