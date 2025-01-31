import { Component, OnInit } from "@angular/core";
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from "@angular/router";

import { Collapse } from "bootstrap";

import { AppService } from "./services/app.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(public router: Router,
              private appService: AppService,
  ) {
    router.events.subscribe((routerEvent) => {
      if (routerEvent instanceof NavigationStart) {
        this.loading = true;
      }

      if (routerEvent instanceof NavigationEnd || routerEvent instanceof NavigationCancel || routerEvent instanceof NavigationError) {
        this.loading = false;
      }
    });
  }

  private navigation: any;

  public loading: boolean = true;

  public isSignedIn() {
    return this.appService.getCurrentUser() != null;
  }

  public signOut() {
    this.appService.signOut();
    this.router.navigateByUrl("/signin");
  }

  public toggleNavigation(e): void {
    if (!this.navigation) {
      this.navigation = new Collapse("#navigation", {
        toggle: false,
      });
    }

    if (e.target.tagName.toLowerCase() == "a") {
      this.navigation.hide();
    } else if (e.currentTarget.classList.contains("navbar-toggler")) {
      this.navigation.toggle();
    }
  }

  public setLanguage(language: string) {
    this.appService.setLanguage(language);
  }

  ngOnInit(): void {
    let theme = this.appService.getTheme();
    document.body.setAttribute("data-bs-theme", theme);
  }
}
