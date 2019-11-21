import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appSidepaleholder]'
})
export class SidepaleholderDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
