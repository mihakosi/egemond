import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";

import { AuthenticationService } from "../../../services/authentication.service";
import { AppService } from "src/app/services/app.service";

import { User } from "../../../models/user";

@Component({
  selector: "app-settings-two-factor-authentication",
  templateUrl: "./settings-two-factor-authentication.component.html",
  styleUrls: ["./settings-two-factor-authentication.component.css"]
})
export class SettingsTwoFactorAuthenticationComponent {
  constructor(public router: Router,
              private appService: AppService,
              private authenticationService: AuthenticationService,
  ) {}

  @Input() public user: User;

  public setupStarted: boolean = false;

  public url: string;
  public secret: string;

  public authenticationCode: string = "";
  public authenticationCodeError: string;

  public recoveryCodes: string[];

  public submitted: boolean = false;
  public saving: boolean = false;

  public alert: {
    variant: string,
    message: string,
  };

  public configure2FA() {
    this.saving = true;
    this.authenticationService.configure2FA().subscribe({
      next: ((secret) => {
        this.url = secret.url;
        this.secret = secret.secret;

        this.setupStarted = true;
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

  public activate2FA() {
    if (this.authenticationCode.length == 6) {
      this.saving = true;
      this.submitted = true;

      this.authenticationService.activate2FA(this.authenticationCode).subscribe({
        next: ((recoveryCodes) => {
          this.recoveryCodes = recoveryCodes;
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

  public finish2FA() {
    this.setupStarted = false;
    this.recoveryCodes = undefined;

    this.user.twoFactorAuthentication.enabled = true;
  }

  public remove2FA() {
    this.saving = true;
    this.authenticationService.remove2FA().subscribe({
      next: (() => {
        const closeModalButton = document.querySelector(`.btn-close[data-bs-dismiss="modal"]`) as HTMLElement;
        if (closeModalButton) {
          closeModalButton.click();
        }

        this.user.twoFactorAuthentication.enabled = false;
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
