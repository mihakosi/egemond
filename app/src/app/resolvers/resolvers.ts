import { inject } from "@angular/core";
import { CategoriesService } from "../services/categories.service";
import { LocalizePipe } from "../pipes/localize.pipe";
import { catchError, map } from "rxjs";
import { AppService } from "../services/app.service";
import { CurrenciesService } from "../services/currencies.service";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { ActivitiesService } from "../services/activities.service";
import { UsersService } from "../services/users.service";
import { Category } from "../models/category";

const activityResolver = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const activitiesService = inject(ActivitiesService);

  const activityId = route.paramMap.get("activityId");
  return activitiesService.getActivity(activityId).pipe(catchError(() => router.navigateByUrl("/error")));
};

const categoriesResolver = () => {
  const router = inject(Router);
  const categoriesService = inject(CategoriesService);
  const localizePipe = inject(LocalizePipe);

  return categoriesService.getCategories()
    .pipe(catchError(() => router.navigateByUrl("/error")))
    .pipe(
      map((categories: Category[]) => {
        return categories.sort((x, y) => {
          let titleX = localizePipe.transform(x.title);
          let titleY = localizePipe.transform(y.title);

          if (titleX < titleY) {
            return -1;
          } else if (titleX > titleY) {
            return 1;
          } else {
            return 0;
          }
        });
      })
    );
};

const currencyResolver = () => {
  const router = inject(Router);
  const appService = inject(AppService);
  const currenciesService = inject(CurrenciesService);

  let currencyId = appService.getCurrency();
  return currenciesService.getCurrency(currencyId).pipe(catchError(() => router.navigateByUrl("/error")));
};

const userResolver = () => {
  const router = inject(Router);
  const appService = inject(AppService);
  const usersService = inject(UsersService);

  let user = appService.getCurrentUser();
  return usersService.getUser(user._id).pipe(catchError(() => router.navigateByUrl("/error")));
};

export {
  activityResolver,
  categoriesResolver,
  currencyResolver,
  userResolver,
}
