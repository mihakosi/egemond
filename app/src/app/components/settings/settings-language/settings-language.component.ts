import { Component, Input } from "@angular/core";

import { User } from "../../../models/user";
import { Language } from "../../../models/language";
import { AppService } from "src/app/services/app.service";
import { UsersService } from "src/app/services/users.service";

@Component({
  selector: "app-settings-language",
  templateUrl: "./settings-language.component.html",
  styleUrls: ["./settings-language.component.css"]
})
export class SettingsLanguageComponent {
  constructor(private appService: AppService, private usersService: UsersService) {
  }

  @Input() public languages: Language[];
  @Input() public user: User;

  public saving: boolean;

  public alert: {
    variant: string,
    message: string,
  };

  public changeLanguage(language) {
    if (this.user.language == language) return;

    this.user.language = language;

    for (let i = 0; i < this.languages.length; i++) {
      this.languages[i]["active"] = this.languages[i]._id == this.user.language;
    }

    this.updateUser();
  }

  public updateUser() {
    this.saving = true;

    return this.usersService.updateUser(this.user).subscribe({
      next: ((user) => {
        this.appService.setLanguage(user.language);

        document.body.setAttribute("data-bs-theme", user.theme);
        this.appService.setTheme(user.theme);

        this.alert = {
          variant: "success",
          message: "Settings successfully saved.",
        };
      }),
      error: ((error) => {
        this.alert = {
          variant: "danger",
          message: this.appService.getErrorMessage(error),
        };
      }),
    }).add(() => {
      this.saving = false;
    });
  }
}
