import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myFilter',
  pure: false
})
export class MyFilterPipe implements PipeTransform {

  transform(value: any, filterKey: any) {
    if (!filterKey['name'] && !filterKey['sex']) {
      return value;
    }
    console.log(value.filter(item => item.name === filterKey.name || item.sex === filterKey.sex))
    return value.filter(item => item.name === filterKey.name || item.sex === filterKey.sex);
  }
}
