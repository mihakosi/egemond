import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormArray, FormBuilder, Validators } from "@angular/forms";

import { ActivitiesService } from "../../services/activities.service";
import { AppService } from "src/app/services/app.service";
import { Category } from "../../models/category";

@Component({
  selector: "app-activity-edit",
  templateUrl: "./activity-edit.component.html",
  styleUrls: ["./activity-edit.component.css"],
})
export class ActivityEditComponent {
  constructor(private router: Router,
              private route: ActivatedRoute,
              private appService: AppService,
              private activitiesService: ActivitiesService,
  ) {
    const activity = this.route.snapshot.data.activity;

    this.activityId = activity._id;

    let date = new Date(activity.date);
    this.activity.patchValue({
      title: activity.title,
      category: activity.category._id,
      amount: Math.abs(activity.amount),
      type: activity.amount < 0 ? "expense" : "income",
      day: `0${date.getDate()}`.slice(-2),
      month: `0${date.getMonth() + 1}`.slice(-2),
      year: date.getFullYear().toString(),
      tags: activity.tags.join(" "),
      description: activity.description,
      isExcluded: activity.isExcluded,
    });

    const subcategoriesFormArray = this.activity.get('subcategories') as FormArray;
    this.route.snapshot.data.categories.forEach((category: Category) => {
      const type = activity.amount < 0 ? "expense" : "income";
      if (category.type == type) {
        const subcategory = activity.subcategories.find((subcategory) => subcategory.category._id === category._id);

        let amount = 0;
        if (subcategory) {
          amount = Math.abs(subcategory.amount);
        }

        subcategoriesFormArray.push(this.formBuilder.group({
          category: [category._id, Validators.required],
          amount: [<number>amount, Validators.required],
        }));
      }
    });
  }

  public activityId: string;

  private formBuilder = new FormBuilder();
  public activity = this.formBuilder.group({
    title: ["", Validators.required],
    category: ["", Validators.required],
    subcategories: new FormArray([]),
    amount: [<undefined | number>undefined, Validators.required],
    type: [<"income" | "expense">"expense", Validators.required],
    day: [<undefined | String>undefined, Validators.required],
    month: [<undefined | String>undefined, Validators.required],
    year: [<undefined | String>undefined, Validators.required],
    tags: [""],
    description: [""],
    isExcluded: [false, Validators.required],
  });

  public alert: {
    variant: string,
    message: string,
  };

  public updateActivity(activity: any): void {
    this.activitiesService
      .updateActivity(this.activityId, activity)
      .subscribe({
        next: ((activity) => {
          this.router.navigateByUrl("/activity/" + this.activityId);
        }),
        error: ((error) => {
          this.alert = {
            variant: "danger",
            message: this.appService.getErrorMessage(error),
          };
        }),
      });
  }
}
