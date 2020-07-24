import { Directive, Input, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'img[appFallback]'
})
export class ImgFallbackDirective {

  @Input() fallback: string = `../assets/gyms/placeholder.webp`;

  constructor(private ref: ElementRef<HTMLImageElement>) { }

  @HostListener('error')
  loadFallback() {

    const elm = this.ref.nativeElement;
    elm.src = this.fallback;
  }

}
