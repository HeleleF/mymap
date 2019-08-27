import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  private x0: number = null;
  private i: number = null;

  constructor() {
    this.i = 2;
   }

  ngOnInit() {
  }

  private unify(e: TouchEvent | MouseEvent) {
    return e instanceof TouchEvent ? e.changedTouches[0] : e;
  }

  private lock(e: TouchEvent | MouseEvent) {
    this.x0 = this.unify(e).clientX;
  }

  private move(e: TouchEvent | MouseEvent) {
    if (this.x0) {

      let dx = this.unify(e).clientX - this.x0,
        s = Math.sign(dx);

      if (Math.abs(dx) < 80) return;

      0 > s ? 4 > this.i && this.i++ : 0 < this.i && this.i--;
      this.x0 = null;
    }
  }

}
