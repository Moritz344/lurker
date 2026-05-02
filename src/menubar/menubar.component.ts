import { Component,Input,Output,EventEmitter,AfterViewInit,OnInit,ViewChild,ElementRef } from '@angular/core';

@Component({
  selector: 'app-menubar',
  imports: [],
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.css'
})
export class MenubarComponent implements OnInit,AfterViewInit{
  @Input("color") backgroundColor: string =  "";
  @Output() close = new EventEmitter<void>();
  @ViewChild("container") container!: ElementRef;


  constructor() {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.container.nativeElement.style.background = this.backgroundColor;
  }

  onClose() {
    this.close.emit();
  }
}
