import { Directive, Input, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'img[appFallback]'
})
export class ImgFallbackDirective {

  @Input() fallback = '../assets/gyms/placeholder.webp';

  constructor(private ref: ElementRef<HTMLImageElement>) { }

  @HostListener('error')
  loadFallback(): void {

    const elm = this.ref.nativeElement;
    elm.src = this.fallback;
  }

}
