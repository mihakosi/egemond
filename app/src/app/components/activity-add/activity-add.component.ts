import { AfterViewInit, Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormArray, FormBuilder, Validators } from "@angular/forms";
import * as bootstrap from "bootstrap";

import { ActivitiesService } from "../../services/activities.service";
import { AppService } from "src/app/services/app.service";

import { LocalizePipe } from "../../pipes/localize.pipe";
import { Category } from "../../models/category";

@Component({
  selector: "app-activity-add",
  templateUrl: "./activity-add.component.html",
  styleUrls: ["./activity-add.component.css"],
  providers: [
    LocalizePipe,
  ],
})
export class ActivityAddComponent implements AfterViewInit {
  constructor(private router: Router,
              private route: ActivatedRoute,
              private appService: AppService,
              private activitiesService: ActivitiesService,
  ) {
    let today = new Date();

    this.activity.patchValue({
      day: `0${today.getDate()}`.slice(-2),
      month: `0${today.getMonth() + 1}`.slice(-2),
      year: today.getFullYear().toString(),
    });

    const subcategories = this.activity.get('subcategories') as FormArray;
    this.route.snapshot.data.categories.forEach((category: Category) => {
      if (this.activity.value.type === category.type) {
        subcategories.push(this.formBuilder.group({
          category: [category._id, Validators.required],
          amount: [<number>0.0, Validators.required],
        }));
      }
    });
  }

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

  public receiptItems: any;

  public alert: {
    variant: string,
    message: string,
  };

  private analyzeReceiptModal: bootstrap.Modal | null;

  public createActivity(activity: any): void {
    this.activitiesService
      .createActivity(activity)
      .subscribe({
        next: ((activity) => {
          this.router.navigateByUrl("/activities");
        }),
        error: ((error) => {
          this.alert = {
            variant: "danger",
            message: this.appService.getErrorMessage(error),
          };
        }),
      });
  }

  public analyzeReceipt(event: Event): void {
    const element = event.target as HTMLInputElement;

    if (element.files.length > 0) {
      if (this.analyzeReceiptModal) {
        this.analyzeReceiptModal.show();
      }

      const file = element.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.activitiesService.analyzeInvoice({
          base64: (reader.result as string).split(',')[1],
        }).subscribe({
          next: ((result) => {
            const date = result.date.split("-");

            this.activity.controls.title.patchValue(result.merchant.name);
            this.activity.controls.amount.patchValue(result.total);
            this.activity.controls.type.patchValue('expense');
            this.activity.controls.day.patchValue(date[2]);
            this.activity.controls.month.patchValue(date[1]);
            this.activity.controls.year.patchValue(date[0]);

            this.receiptItems = result.items;
            this.activity.controls.category.patchValue("split");

            try {
              this.analyzeReceiptModal.hide();
            } catch (error) {
              setTimeout(() => {
                if (this.analyzeReceiptModal) {
                  this.analyzeReceiptModal.hide();
                }
              }, 250);
            }
          }),
          error: ((error) => {
            this.alert = {
              variant: "warning",
              message: this.appService.getErrorMessage(error),
            };

            (document.querySelector("#receiptInput") as HTMLInputElement).value = null;

            if (this.analyzeReceiptModal) {
              this.analyzeReceiptModal.hide();
            }
          }),
        });
      };
      reader.readAsDataURL(file);
    } else {
      this.alert = {
        variant: "warning",
        message: this.appService.getErrorMessage("You haven't selected a file."),
      };
    }
  }

  public ngAfterViewInit(): void {
    this.analyzeReceiptModal = new bootstrap.Modal('#analyzeReceiptModal', {
      backdrop: 'static',
    });
  }
}
