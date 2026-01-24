import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tab',
  imports: [],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.css'
})

export class TabComponent {
  @Input() data: any;
  @Output() remove = new EventEmitter<any>();
  @Output() tabChange = new EventEmitter<any>();

  constructor() { }

  onChangeTab() {
    this.tabChange.emit(this.data);
  }

  onRemoveTab() {
    this.remove.emit(this.data);
  }

}
