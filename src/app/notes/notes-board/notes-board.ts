import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Note, NotePeriod } from '../../data/notes';
import { NoteCardComponent } from '../note-card/note-card';

interface PeriodOption {
  label: string;
  value: NotePeriod;
  count: number;
}

@Component({
  selector: 'app-notes-board',
  standalone: true,
  imports: [NoteCardComponent],
  templateUrl: './notes-board.html',
  styleUrl: './notes-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesBoardComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) notes: Note[] = [];
  @Input({ required: true }) activePeriod!: NotePeriod;
  @Input({ required: true }) periodOptions: PeriodOption[] = [];
  @Output() readonly periodChange = new EventEmitter<NotePeriod>();
  @Output() readonly editNote = new EventEmitter<Note>();

  @ViewChild('carousel') private carouselRef?: ElementRef<HTMLDivElement>;

  canScrollLeft = false;
  canScrollRight = false;
  isScrollable = false;

  private resizeObserver?: ResizeObserver;
  private scrollListener?: () => void;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    this.initializeScrollTracking();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('notes' in changes && this.carouselRef) {
      this.deferScrollStateUpdate();
    }
  }

  ngOnDestroy(): void {
    if (this.scrollListener && this.carouselRef) {
      this.carouselRef.nativeElement.removeEventListener('scroll', this.scrollListener);
    }
    this.resizeObserver?.disconnect();
  }

  onCarouselScroll(): void {
    this.updateScrollState();
  }

  scroll(direction: 'left' | 'right'): void {
    const carousel = this.carouselRef?.nativeElement;
    if (!carousel) {
      return;
    }

    const scrollAmount = carousel.clientWidth * 0.8;
    const nextPosition = direction === 'left' ? carousel.scrollLeft - scrollAmount : carousel.scrollLeft + scrollAmount;
    carousel.scrollTo({ left: nextPosition, behavior: 'smooth' });
  }

  private initializeScrollTracking(): void {
    const carousel = this.carouselRef?.nativeElement;
    if (!carousel) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.scrollListener = () => this.ngZone.run(() => this.updateScrollState());
      carousel.addEventListener('scroll', this.scrollListener!, { passive: true });

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() =>
          this.ngZone.run(() => this.updateScrollState()),
        );
        this.resizeObserver.observe(carousel);
      }
    });

    this.deferScrollStateUpdate();
  }

  private deferScrollStateUpdate(): void {
    requestAnimationFrame(() => this.updateScrollState());
  }

  private updateScrollState(): void {
    const carousel = this.carouselRef?.nativeElement;
    if (!carousel) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = carousel;
    const maxScrollLeft = Math.max(scrollWidth - clientWidth, 0);
    const canScrollLeft = scrollLeft > 8;
    const canScrollRight = scrollLeft < maxScrollLeft - 8;
    const isScrollable = scrollWidth > clientWidth + 1;

    if (
      this.canScrollLeft !== canScrollLeft ||
      this.canScrollRight !== canScrollRight ||
      this.isScrollable !== isScrollable
    ) {
      this.canScrollLeft = canScrollLeft;
      this.canScrollRight = canScrollRight;
      this.isScrollable = isScrollable;
      this.cdr.markForCheck();
    }
  }
}
