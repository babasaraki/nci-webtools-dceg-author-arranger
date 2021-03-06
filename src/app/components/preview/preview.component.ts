import { Component, Renderer2, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ArrangerService } from '../../services/arranger/arranger.service';
import { AppState } from '../../app.models';
import { isEmpty, isEqual } from 'lodash';

@Component({
  selector: 'author-arranger-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css'],
})
export class PreviewComponent implements OnChanges {

  @Input()
  state: Partial<AppState>

  @Input()
  loading: boolean = false;

  @ViewChild('preview')
  preview: ElementRef;

  @ViewChild('panel')
  panel: ElementRef;

  @Output()
  reorder: EventEmitter<number[]> = new EventEmitter<number[]>();

  alerts: { type: string, message: string }[] = [];

  hasData = false;

  selectedTab = 'preview';

  constructor(
    private arranger: ArrangerService,
    private renderer: Renderer2
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.state) {
      const { previousValue, currentValue } = changes.state;
      this.hasData = !isEmpty(currentValue.file.data);
      if (currentValue && previousValue && !isEqual(previousValue.markup, currentValue.markup))
        this.update();
    }
  }

  downloadPreview() {
    if (this.preview && this.hasData) {
      this.arranger.downloadDocument(
        this.state.file.filename,
        this.state.markup
      );
/*
      this.arranger.downloadPreview(
        this.state.file.filename,
        this.preview.nativeElement as HTMLElement
      );
      */
    }
  }

  async update() {
    let panelElement = this.panel.nativeElement;
    let lastScrollTop = panelElement.scrollTop;

    this.alerts = [];
    this.hasData = !isEmpty(this.state.file.data);

    if (!this.preview) return;

    let root = this.preview.nativeElement;

    for (let child of root.children) {
      this.renderer.removeChild(root, child);
    }

    // this.store.patchState({loading: true});
    // root.textContent = '';

    setTimeout(_ => {
      if (this.hasData && this.state.markup) {
        //      const asyncUpdate = this.state.file.data.length > 100;
        this.renderer.appendChild(
          root, this.arranger.createElement(this.state.markup, false)
        );
      }
      panelElement.scrollTop = lastScrollTop;
    }, 10);

    if (this.state.duplicateAuthors) {
      this.alerts = [{
        type: 'warning',
        message: 'Duplicate author names have been found.'
      }];
    }

    if (!this.state.format.affiliation.fields.find(a => a.column !== null)) {
      this.alerts.push({
        type: 'warning',
        message: 'No affiliation fields have been mapped.'
      });
    }

  }

}