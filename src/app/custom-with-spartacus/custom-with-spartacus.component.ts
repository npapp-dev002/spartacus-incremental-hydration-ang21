import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBoxModule } from '@spartacus/storefront';

/**
 * Scenario 2: Custom standalone component that imports a Spartacus NgModule-based component.
 * Expected: chunk splitting collapses — the NgModule boundary prevents a separate chunk.
 * Hydration triggers still work syntactically but JS is NOT deferred.
 */
@Component({
  selector: 'app-custom-with-spartacus',
  standalone: true,
  imports: [CommonModule, SearchBoxModule],
  template: `
    <div class="ih-test-box ih-test-box--hybrid">
      <h3>Custom + Spartacus NgModule (SearchBox)</h3>
      <p>Hydrated: <strong>{{ hydrated() ? '✅ YES (client)' : '⏳ SSR only' }}</strong></p>
      <p class="ih-note">⚠️ Imports NgModule — expect no separate JS chunk.</p>
      <cx-searchbox></cx-searchbox>
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
    .ih-test-box--hybrid { border-color: #e80; }
    .ih-note { color: #c60; font-size: 0.85rem; }
  `],
})
export class CustomWithSpartacusComponent implements OnInit {
  hydrated = signal(false);

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.hydrated.set(true);
    }
  }
}
