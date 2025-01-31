import { BrowserModule } from "@angular/platform-browser";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { registerLocaleData } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { tap } from "rxjs";
import { QRCodeModule } from "angularx-qrcode";

import en from "@angular/common/locales/en";
import sl from "@angular/common/locales/sl";
import { AuthenticationGuardService as AuthenticationGuard } from "./services/authentication-guard.service";
import { AppService } from "./services/app.service";
import { UsersService } from "./services/users.service";

import { LocalizePipe } from "./pipes/localize.pipe";
import { MonthPipe } from "./pipes/month.pipe";

import { SigninComponent } from "./components/signin/signin.component";
import { SignupComponent } from "./components/signup/signup.component";
import { ActivitiesComponent } from "./components/activities/activities.component";
import { ActivityAddComponent } from "./components/activity-add/activity-add.component";
import { ActivityDetailsComponent } from "./components/activity-details/activity-details.component";
import { ActivityEditComponent } from "./components/activity-edit/activity-edit.component";
import { StatisticsComponent } from "./components/statistics/statistics.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { ActivityFormComponent } from "./forms/activity-form/activity-form.component";
import { SpinnerComponent } from "./common/spinner/spinner.component";
import { ButtonSpinnerComponent } from "./common/button-spinner/button-spinner.component";
import {
  SettingsTwoFactorAuthenticationComponent
} from "./components/settings/settings-two-factor-authentication/settings-two-factor-authentication.component";
import { SettingsThemeComponent } from "./components/settings/settings-theme/settings-theme.component";
import { SettingsLanguageComponent } from "./components/settings/settings-language/settings-language.component";
import {
  SettingsChangePasswordComponent
} from "./components/settings/settings-change-password/settings-change-password.component";
import {
  SettingsUpdateAccountComponent
} from "./components/settings/settings-update-account/settings-update-account.component";
import {
  SettingsDeleteAccountComponent
} from "./components/settings/settings-delete-account/settings-delete-account.component";
import { AppComponent } from './app.component';
import { provideHttpClient } from "@angular/common/http";
import { ActivityAIFormComponent } from "./forms/activity-ai-form/activity-ai-form.component";
import { activityResolver, categoriesResolver, currencyResolver, userResolver } from "./resolvers/resolvers";
import { ErrorComponent } from "./components/error/error.component";

registerLocaleData(en);

registerLocaleData(sl);

export function initializeAppFactory(appService: AppService, usersService: UsersService) {
  const user = appService.getCurrentUser();
  if (user != null) {
    return () => usersService.getUser(user._id).pipe(tap((user: any) => {
      appService.setLanguage(user.language);
      appService.setCurrency(user.currency);
      appService.setTheme(user.theme);
    }));
  }
  return () => {};
}

@NgModule({
  declarations: [
    SigninComponent,
    SignupComponent,
    ActivitiesComponent,
    SettingsComponent,
    ActivityDetailsComponent,
    ActivityAddComponent,
    LocalizePipe,
    ActivityEditComponent,
    MonthPipe,
    StatisticsComponent,
    ActivityAIFormComponent,
    ActivityFormComponent,
    SpinnerComponent,
    SettingsTwoFactorAuthenticationComponent,
    SettingsThemeComponent,
    ButtonSpinnerComponent,
    SettingsLanguageComponent,
    SettingsChangePasswordComponent,
    SettingsUpdateAccountComponent,
    SettingsDeleteAccountComponent,
    ErrorComponent,
    AppComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule,
    RouterModule.forRoot([
      {
        path: "signin",
        component: SigninComponent,
      },
      {
        path: "signup",
        component: SignupComponent,
      },
      {
        path: "activities",
        component: ActivitiesComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "statistics",
        component: StatisticsComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "settings",
        component: SettingsComponent,
        canActivate: [AuthenticationGuard],
        resolve: {
          user: userResolver,
        },
      },
      {
        path: "activity/add",
        component: ActivityAddComponent,
        canActivate: [AuthenticationGuard],
        resolve: {
          categories: categoriesResolver,
          currency: currencyResolver,
        },
      },
      {
        path: "activity/edit/:activityId",
        component: ActivityEditComponent,
        canActivate: [AuthenticationGuard],
        resolve: {
          activity: activityResolver,
          categories: categoriesResolver,
          currency: currencyResolver,
        },
      },
      {
        path: "activity/:activityId",
        component: ActivityDetailsComponent,
        canActivate: [AuthenticationGuard],
        resolve: {
          activity: activityResolver,
        },
      },
      {
        path: "error",
        component: ErrorComponent,
        canActivate: [AuthenticationGuard],
      },
      {
        path: "",
        redirectTo: "/activities",
        pathMatch: "full",
      },
      {
        path: "**",
        redirectTo: "/activities",
      },
    ]),
  ],
  exports: [RouterModule],
  providers: [
    provideHttpClient(),
    LocalizePipe,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      multi: true,
      deps: [AppService, UsersService],
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
