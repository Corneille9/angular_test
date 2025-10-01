import {Component, inject, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {DarkModeService} from './services/darkmode/darkmode.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('My Shop');
  private readonly darkModeService = inject(DarkModeService);

  constructor() {
    this.darkModeService.initTheme();
  }
}
