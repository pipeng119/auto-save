import { FormBuilder, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Subject, timer, EMPTY, Observable, merge, interval, from, ConnectableObservable } from 'rxjs';
import { finalize, startWith, take, takeUntil, tap, switchMap, map, filter, throttleTime, publish } from 'rxjs/operators';

type UserInfo = {
  name: string;
  age: string;
  sex: string;
  address: string;
}

@Component({
  selector: 'app-test-auto-save',
  templateUrl: './test-auto-save.component.html',
  styleUrls: ['./test-auto-save.component.scss']
})
export class TestAutoSaveComponent implements OnInit {

  public isAutoSaveTimerStart: boolean = false;

  public autoSaveTimerCount: number;

  // 1. 初始化表单
  public userInfo = this.fb.group({
    name: [""],
    age: [""],
    sex: [""],
    address: [""]
  })

  public saveUserInfo: UserInfo;

  public toggleAutoSaveBtn: FormControl;

  public saveBtnClick$: Subject<void> = new Subject<void>();

  private save$: Observable<UserInfo>;

  constructor(private fb: FormBuilder) {
    // 2. 设置自动保存状态默认为开启
    this.toggleAutoSaveBtn = fb.control(true);

    // 3. 创建保存按钮点击流
    const clickSave$ = this.saveBtnClick$.asObservable();

    // 4. 创建表单变更数据流
    const formChanged$ = this.userInfo.valueChanges;

    // 5. 创建自动保存流
    const autoSaveTimer$ = timer(5000)
      .pipe(
        // take(6),
        // map(t => 5 - t),
        // tap(c => {
        //   this.isAutoSaveTimerStart = true;
        //   this.autoSaveTimerCount = c;
        // }),
        // 流完成时执行
        // finalize(() => {
        //   this.isAutoSaveTimerStart = false;
        //   this.autoSaveTimerCount = null;
        // }),
        // filter(num => num === 0),
        takeUntil(clickSave$)
      );

    // 6. 创建自动保存开关流
    const toggleAutoSave$ = this.toggleAutoSaveBtn.valueChanges.pipe(
      startWith(this.toggleAutoSaveBtn.value as boolean)
    )

    // 7. 创建自动保存任务流
    const autoSaveTask$ = formChanged$.pipe(switchMap(() => autoSaveTimer$))

    // 8. 自动保存消息流
    const autoSave$ = toggleAutoSave$.pipe(switchMap(status => status ? autoSaveTask$ : EMPTY))

    this.save$ = merge(clickSave$, autoSave$).pipe(map(() => this.userInfo.value))
  }

  ngOnInit(): void {
    this.save$.subscribe(res => {
      console.log(res);
      this.saveUserInfo = res;
    });
    // this.operatorTest();
  }

  operatorTest() {
    // const source = from([1, 2, 3, 4]);
    // source.subscribe(res => console.log('first:', res))
    // setTimeout(() => {
    //   source.subscribe(res => console.log('second:', res))

    // }, 1000)
    let obs$ = interval(1000).pipe(
      publish()
    ) as ConnectableObservable<any>;
    obs$.connect();

    setTimeout(() => {
      obs$.subscribe(data => { console.log("1st subscriber:" + data) });
    }, 1000);
    setTimeout(() => {
      obs$.subscribe(data => { console.log("2st subscriber:" + data) });
    }, 2000);
    // const source = merge(
    //   //  每0.75秒发出值
    //   interval(750),
    //   // 每1秒发出值
    //   interval(1000)
    // );
    // // 在发出值的中间进行节流
    // const example = source.pipe(throttleTime(1200));
    // // 输出: 0...1...4...4...8...7
    // const subscribe = example.subscribe(val => console.log(val));
  }

  public save(): void {
    this.saveBtnClick$.next();
  }

}
