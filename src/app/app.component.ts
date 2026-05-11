import { Component, signal } from '@angular/core';
import { StorefrontComponent } from '@spartacus/storefront';
import { CustomWidgetComponent } from './custom-widget/custom-widget.component';
import { CustomWithSpartacusComponent } from './custom-with-spartacus/custom-with-spartacus.component';

@Component({
  selector: 'app-root',
  imports: [StorefrontComponent, CustomWidgetComponent, CustomWithSpartacusComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {
  protected readonly title = signal('my-spartacus-app');
}
