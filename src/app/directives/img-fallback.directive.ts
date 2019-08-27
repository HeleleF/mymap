import { Directive, Input, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'img[fallback]'
})
export class ImgFallbackDirective {

  @Input() fallback: string;

  constructor(private ref: ElementRef<HTMLImageElement>) { }

  @HostListener('error')
  loadFallback() {

    const elm = this.ref.nativeElement;
    elm.src = this.fallback || `../assets/gyms/placeholder.webp`; // xss?
  }

}
