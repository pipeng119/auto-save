import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  public students: any[] = [
    {
      name: 'Tom',
      sex: 'male'
    },
    {
      name: 'Jerry',
      sex: 'male'
    },
    {
      name: 'Alice',
      sex: 'female'
    },
    {
      name: 'Henry',
      sex: 'male'
    }]; // 需要被管道处理的数据
  public filterObj = Object.create({});   // 对象： 创建一个空对象并作为传给管道的参数,

  constructFilterObj(name: string, sex: string) {  // 该方法用于构造传给管道的参数 filterObj
    this.filterObj['name'] = name;
    this.filterObj['sex'] = sex;
  }

  ngOnInit(): void {
  }




}
