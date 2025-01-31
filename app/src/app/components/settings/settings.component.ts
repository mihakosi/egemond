import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { AppService } from "../../services/app.service";

import { User } from "../../models/user";
import { Language } from "../../models/language";

@Component({
  selector: "app-account",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.css"],
})
export class SettingsComponent {
  constructor(public router: Router,
              private route: ActivatedRoute,
              private appService: AppService,
  ) {
    this.languages = this.appService.getLanguages();

    this.user = this.route.snapshot.data.user;

    for (let i = 0; i < this.languages.length; i++) {
      this.languages[i]["active"] = this.languages[i]._id == this.user.language;
    }

    this.appService.setLanguage(this.user.language);
    this.appService.setTheme(this.user.theme);
  }

  public user: User;
  public languages: Language[];
}
