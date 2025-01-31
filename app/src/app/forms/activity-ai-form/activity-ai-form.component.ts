import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { FormGroup } from "@angular/forms";

import { Category } from "../../models/category";
import { Currency } from "../../models/currency";

@Component({
  selector: 'app-activity-ai-form',
  templateUrl: './activity-ai-form.component.html',
  styleUrl: './activity-ai-form.component.css'
})
export class ActivityAIFormComponent implements OnChanges {
  constructor(private route: ActivatedRoute) {
    this.categories = this.route.snapshot.data.categories;
    this.currency = this.route.snapshot.data.currency;

    let today = new Date();
    for (let i = 2000; i <= today.getFullYear(); i++) {
      this.years.push(i.toString());
    }
  }

  @Input() public activity: FormGroup;

  @Input() public receiptItems: any;
  @Output() public receiptItemsChange = new EventEmitter();

  public get receiptItemsAmountValid(): boolean {
    const activityAmount = this.activity.value.amount ?? 0;

    if (this.receiptItems && this.receiptItems.length > 0) {
      return Math.round(this.receiptItems.reduce((currentSum: number, item: any) => {
        return currentSum + item.total;
      }, 0) * 100) === Math.round(activityAmount * 100);
    } else {
      return activityAmount === 0;
    }
  }

  public categories: Category[];
  public currency: Currency;
  public years: string[] = [];

  @Input() public alert: {
    variant: string,
    message: string,
  };

  public saving = false;

  public retrievalError: string;

  @Output() loaded = new EventEmitter<void>();
  @Output() saveActivity = new EventEmitter<any>();

  public switch(type: "income" | "expense"): void {
    this.activity.patchValue({
      type: type,
    });

    this.receiptItems = undefined;
    this.receiptItemsChange.emit(this.receiptItems);
  }

  public formatAmount() {
    if (this.activity.value.amount) {
      let amount = this.activity.value.amount.toString().replace(/[^\d.-]/g, "");

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
    if (this.activity.invalid || !this.receiptItemsAmountValid) {
      this.activity.markAllAsTouched();
      return;
    }

    let formattedTags = this.activity.value.tags.trim();
    formattedTags = formattedTags.replace(/#/g, "");
    formattedTags = formattedTags.replace(/\s+/g, " ");

    let tags = formattedTags.length > 0 ? formattedTags.split(" ") : [];

    let categories = {};
    this.receiptItems.forEach((item: any) => {
      if (!(item.category in categories)) {
        categories[item.category] = 0;
      }
      categories[item.category] -= item.total;
    });

    let subcategories = [];
    for (let category in categories) {
      subcategories.push({
        category: category,
        amount: categories[category],
      });
    }

    this.saving = true;

    const activity = {
      title: this.activity.value.title,
      category: this.activity.value.category,
      currency: this.currency._id,
      amount: this.activity.value.type === "expense" ? -this.activity.value.amount : this.activity.value.amount,
      date: `${this.activity.value.year}-${this.activity.value.month}-${this.activity.value.day}`,
      subcategories: [],
      tags: tags,
      description: this.activity.value.description,
      isExcluded: this.activity.value.isExcluded,
    };

    if (subcategories.length > 1) {
      activity.subcategories = subcategories;
    } else if (subcategories.length == 1) {
      activity.category = subcategories[0].category;
    }

    this.saveActivity.emit(activity);

    return;
  }

  public formatReceiptItemAmount(i: number) {
    if (this.receiptItems && this.receiptItems.length > i && this.receiptItems[i].total) {
      this.receiptItems[i].total = parseFloat(this.receiptItems[i].total.toString().replace(/[^\d.]/g, ""));
    }
  }

  ngOnChanges(): void {
    this.saving = false;

    if (!this.activity.value.type) {
      this.activity.value.type = "expense";
    }

    this.formatTags();
  }
}
