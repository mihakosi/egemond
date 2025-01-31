import { Component, Input, Output, EventEmitter, OnChanges } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { Category } from "../../models/category";
import { Currency } from "../../models/currency";

import { Subcategory } from "../../models/activity";

@Component({
  selector: "app-activity-form",
  templateUrl: "./activity-form.component.html",
  styleUrls: ["./activity-form.component.css"]
})
export class ActivityFormComponent implements OnChanges {
  constructor(private route: ActivatedRoute) {
    this.categories = this.route.snapshot.data.categories;
    this.currency = this.route.snapshot.data.currency;

    let today = new Date();
    for (let i = 2000; i <= today.getFullYear(); i++) {
      this.years.push(i.toString());
    }
  }

  @Input() public activity: FormGroup;

  public categories: Category[];
  public currency: Currency;
  public years: string[] = [];

  public subcategories: any[];

  @Input() public alert: {
    variant: string,
    message: string,
  };

  public saving = false;

  @Output() saveActivity = new EventEmitter<any>();

  private formBuilder = new FormBuilder();

  public switch(type: "income" | "expense"): void {
    this.subcategoriesFormArray.clear();
    this.categories.forEach(category => {
      if (category.type === type) {
        this.subcategoriesFormArray.push(this.formBuilder.group({
          category: [category._id, Validators.required],
          amount: [<number>0.0, Validators.required],
        }));
      }
    });

    this.activity.patchValue({
      type: type,
    });
  }

  public get subcategoriesAmountValid(): boolean {
    const activityAmount = this.activity.value.amount ?? 0;

    if (this.subcategoriesFormArray.length > 0) {
      return Math.round(this.subcategoriesFormArray.value.reduce((currentSum: number, item: any) => {
        return currentSum + item.amount;
      }, 0) * 100) === Math.round(activityAmount * 100);
    } else {
      return 0 === activityAmount;
    }
  }

  public splitIntoSubcategories: boolean = false;

  public splitActivity(value: boolean): void {
    if (value) {
      this.splitIntoSubcategories = true;
      this.activity.controls.category.patchValue("split");

      this.subcategoriesFormArray.clear();
      this.categories.forEach(category => {
        if (category.type === this.activity.value.type) {
          this.subcategoriesFormArray.push(this.formBuilder.group({
            category: [category._id, Validators.required],
            amount: [<number>0.0, Validators.required],
          }));
        }
      });
    } else {
      this.splitIntoSubcategories = false;
      this.activity.controls.category.patchValue(null);

      this.subcategoriesFormArray.clear();
    }
  }

  get subcategoriesFormArray() {
    return this.activity.get('subcategories') as FormArray;
  }

  public findCategory(id: string): Category {
    return this.categories.find((category: any) => category._id === id);
  }

  public formatAmount() {
    if (this.activity.value.amount) {
      let amount = this.activity.value.amount.toString().replace(/[^\d.]/g, "");

      this.activity.patchValue({
        amount: parseFloat(amount),
      });
    }
  }

  public formatTags() {
    let tags = this.activity.value.tags.split(" ");
    tags.forEach((tag, i) => {
      if (tag && tag.charAt(0) != "#") {
        tags[i] = `#${tag}`;
      }
    });

    this.activity.patchValue({
      tags: tags.join(" "),
    });
  }

  public validate(): void {
    if (this.activity.invalid || (this.activity.value.category === "split" && !this.subcategoriesAmountValid)) {
      this.activity.markAllAsTouched();
      return;
    }

    let formattedTags = this.activity.value.tags.trim();
    formattedTags = formattedTags.replace(/#/g, "");
    formattedTags = formattedTags.replace(/\s+/g, " ");

    let tags = formattedTags.length > 0 ? formattedTags.split(" ") : [];

    const subcategories = this.subcategoriesFormArray.value
      .filter((subcategory: Subcategory) => subcategory.amount > 0)
      .map((subcategory: Subcategory) => {
        return {
          category: subcategory.category,
          amount: this.activity.value.type === "expense" ? -subcategory.amount : subcategory.amount,
        };
      });

    this.saving = true;

    this.saveActivity.emit({
      title: this.activity.value.title,
      category: this.activity.value.category,
      currency: this.currency._id,
      amount: this.activity.value.type === "expense" ? -this.activity.value.amount : this.activity.value.amount,
      date: `${this.activity.value.year}-${this.activity.value.month}-${this.activity.value.day}`,
      subcategories: subcategories,
      tags: tags,
      description: this.activity.value.description,
      isExcluded: this.activity.value.isExcluded,
    });

    return;
  }

  ngOnChanges(): void {
    this.saving = false;

    if (!this.activity.value.type) {
      this.activity.value.type = "expense";
    }

    if (this.subcategoriesFormArray) {
      this.splitIntoSubcategories = this.subcategoriesFormArray.value.some((subcategory: Subcategory) => subcategory.amount > 0);
    }

    this.formatTags();
  }
}
