import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent implements OnInit {
  @Input() message: string = "";
  @Input() time: string = "";
  @Output() destroy = new EventEmitter<void>();

  constructor() {

  }

  ngOnInit() {
    setTimeout(() => {
      this.destroy.emit();
    }, Number(this.time));
  }

}
