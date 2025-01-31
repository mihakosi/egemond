import { Category } from "./category";
import { Currency } from "./currency";

export class Activity {
  _id: string;
  amount: number;
  category: Category;
  currency: Currency;
  date: Date;
  description: string;
  isExcluded: boolean;
  tags: string[];
  title: string;
  user: string;
  subcategories: Subcategory[];
}

export class Subcategory {
  category: Category;
  amount: number;
}
