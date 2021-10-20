import { FormControl, FormBuilder } from '@angular/forms';
import { DataService } from './../service/data.service';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, interval, merge, Observable, Subject, timer } from 'rxjs';
import { debounceTime, take, switchMap, takeUntil, switchMapTo, map } from 'rxjs/operators';

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

  @ViewChild('btn') btn: ElementRef<HTMLButtonElement>;
  @ViewChild('myInput') myInput: ElementRef<HTMLInputElement>;

  public testInput: FormControl = this.fb.control('');

  public cancelStream: Subject<void> = new Subject<void>();

  public result = {};
  public cacheResult = null;

  constructor(private dataService: DataService, private fb: FormBuilder) {

  }
  ngOnInit(): void {

    this.testInput.valueChanges
      .pipe(
        switchMap(() => this.dataService.getServiceData()),
      )
      .subscribe(
        res => {
          this.result = res;
        },
      )
  }
  ngAfterViewInit(): void {
    this.myInput.nativeElement.focus();
  }

  public getData(): void {
    this.dataService.getServiceData()
      .pipe(
        takeUntil(this.cancelStream)
      )
      .subscribe(res => {
        console.log('res', res);
        this.result = res;
      })
  }

}
