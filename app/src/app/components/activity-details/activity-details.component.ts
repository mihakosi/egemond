import { Component, LOCALE_ID } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";

import { ActivitiesService } from "../../services/activities.service";
import { AppService } from "../../services/app.service";

import { Activity } from "../../models/activity";

@Component({
  selector: "app-activity-details",
  templateUrl: "./activity-details.component.html",
  styleUrls: ["./activity-details.component.css"],
  providers: [
    {
      provide: LOCALE_ID,
      useFactory: (appService: AppService) => {
        return appService.getLanguage();
      },
      deps: [AppService],
    }
  ],
})
export class ActivityDetailsComponent {
  constructor(private router: Router,
              private route: ActivatedRoute,
              private appService: AppService,
              private sanitizer: DomSanitizer,
              private activitiesService: ActivitiesService,
  ) {
    this.activity = this.route.snapshot.data.activity;

    this.image = this.sanitizer.bypassSecurityTrustStyle(
      `url(${this.activity.category.image})`
    );
  }

  public activity: Activity;

  public image: SafeStyle;

  public saving = false;

  public error = {
    type: "",
    message: "",
  };

  public deleteActivity(): void {
    this.saving = true;

    this.activitiesService
      .deleteActivity(this.activity._id)
      .subscribe({
        next: ((result) => {
          this.router.navigateByUrl("/activities");
        }),
        error: ((error) => {
          this.error.type = "danger";
          this.error.message = this.appService.getErrorMessage(error);
        }),
      }).add(() => {
        const modalCloseButton = document.querySelector("#deleteModalButton") as HTMLElement;
        if (modalCloseButton) {
          modalCloseButton.click();
        }

        this.saving = false;
      });
  }
}
