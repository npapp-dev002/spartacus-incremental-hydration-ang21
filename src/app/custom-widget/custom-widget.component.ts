import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Scenario 1: 100% custom standalone component — zero Spartacus imports.
 * Expected: gets its own JS chunk, hydrates lazily when scrolled into viewport.
 */
@Component({
  selector: 'app-custom-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ih-test-box ih-test-box--custom">
      <h3>Custom Widget (no Spartacus)</h3>
      <p>Rendered at: <strong>{{ renderTime }}</strong></p>
      <p>Hydrated: <strong>{{ hydrated() ? '✅ YES (client)' : '⏳ SSR only' }}</strong></p>
      <button (click)="increment()">Clicks: {{ count() }}</button>
    </div>
  `,
  styles: [`
    .ih-test-box {
      border: 2px solid #888;
      border-radius: 6px;
      padding: 1rem;
      margin: 1rem 0;
      font-family: monospace;
    }
    .ih-test-box--custom { border-color: #2a7; }
    button { margin-top: 0.5rem; padding: 0.25rem 0.75rem; cursor: pointer; }
  `],
})
export class CustomWidgetComponent implements OnInit {
  renderTime = new Date().toISOString();
  hydrated = signal(false);
  count = signal(0);

  ngOnInit() {
    // Only runs in the browser after hydration
    if (typeof window !== 'undefined') {
      this.hydrated.set(true);
    }
  }

  increment() {
    this.count.update((c) => c + 1);
  }
}