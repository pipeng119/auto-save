import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Subject, Observable, EMPTY, merge, timer, of, interval } from 'rxjs';
import { concatMap, filter, finalize, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';

export interface UserInfo {
  name: string;
  age: string;
  height: string;
  weight: string;
}

@Component({
  selector: 'app-auto-save',
  templateUrl: './auto-save.component.html',
  styleUrls: ['./auto-save.component.scss']
})
export class AutoSaveComponent implements OnInit {
  // 表单实例
  userForm: FormGroup;
  // 保存的用户信息
  savedUserInfo: UserInfo;
  // 是否自动保存的标识
  autoSaveToggleControl: FormControl;

  // 是否正在执行自动保存任务
  isAutoSaveTimerStart: boolean;
  // 自动保存任务的计时器秒数
  autoSaveTimerCount: number;

  private saveBtnClickSource: Subject<void> = new Subject<void>();

  // 最后的保存用户信息的数据流
  private save$: Observable<UserInfo>;

  constructor(private fb: FormBuilder) {
    // 初始化表单
    this.userForm = fb.group({
      name: [''],
      age: [''],
      height: [''],
      weight: ['']
    });
    // 默认开启自动保存
    this.autoSaveToggleControl = fb.control(true);

    /**
     * 点击保存消息流
     */
    const clickSave$ = this.saveBtnClickSource.asObservable();

    /**
     * 表单变更数据流
     */
    const formChanged$ = this.userForm.valueChanges;

    /**
     * 自定保存定时器流
     * 为了方便展示倒计时，所以使用了 timer(0, 1000) 来实时展示定时器秒数
     * 实际中可以直接使用 timer(5000).pipe(takeUntil(this.clickSave$))
     * takeUntil 的作用是当手动保存触发时中断定时器
     * timer 不做延迟，间隔1000ms从0开始的正整数递增
     */
    const autoSaveTimer$ = timer(0, 1000)
      .pipe(
        // 取前六条数据等价于5秒后
        take(6),
        // 映射成倒计时5，4，3，2，1，0
        map(t => 5 - t),
        tap(c => {
          this.isAutoSaveTimerStart = true;
          this.autoSaveTimerCount = c;
        }),
        // 流完成时执行
        finalize(() => {
          this.isAutoSaveTimerStart = false;
          this.autoSaveTimerCount = null;
        }),
        // 0的时候才发送流
        filter(t => t === 0),
        // 取消订阅
        takeUntil(clickSave$)
      );

    /**
     * 自动保存功能开关控制流
     * startWith 用来发出表单的默认值
     */
    const toggleAutoSave$ = this.autoSaveToggleControl.valueChanges.pipe(
      startWith(this.autoSaveToggleControl.value as boolean)
    );

    const autoSaveTask$ = formChanged$.pipe(switchMap(() => autoSaveTimer$));

    /**
     * 自动保存消息流
     * 自动保存消息的发送会受到 toggleAutoSave$ 的控制，所以 toggleAutoSave$ 会作为最上游的 Observable
     * 使用 switchMap 中断上一次自动任务
     */
    const autoSave$ = toggleAutoSave$.pipe(
      switchMap(status => {
        return status ? autoSaveTask$ : EMPTY;
      })
    );

    /**
     * clickSave$ 和 autoSave$ 都可以触发 save，通过 merge 操作符将它们合并
     */
    this.save$ = merge(clickSave$, autoSave$).pipe(
      map(() => this.userForm.value)
    );
  }

  ngOnInit(): void {
    this.operatorTests();
    this.save$.subscribe(res => {
      this.savedUserInfo = res;
    });
  }

  onSaveBtnClick(): void {
    this.saveBtnClickSource.next();
  }

  operatorTests() {
    // const cancel$ = new Subject();
    // timer(0, 1000).pipe(
    //   take(6),
    //   map(t => {
    //     // console.log('映射', t);
    //     return 5 - t
    //   }),
    //   tap(c => {
    //     // console.log('我是tap', c)
    //   }),
    //   finalize(() => console.log('完成时执行')),
    //   filter(t => {
    //     console.log('filter', t);
    //     return t === 0
    //   }),
    //   takeUntil(cancel$)
    // ).subscribe(res => {
    //   console.log('res', res)
    // });
    // setTimeout(() => {
    //   cancel$.next();
    //   cancel$.complete();
    // }, 4000)
    // const num$ = of(1, 2, 3);
    // num$.pipe(startWith(88,99,172))
    //   .subscribe(res => {
    //     console.log('res: ', res);
    //   })

    // // 立即发出值， 然后每5秒发出值
    // const source = timer(0, 5000);
    // // 当 source 发出值时切换到新的内部 observable，发出新的内部 observable 所发出的值
    // const example = source.pipe(switchMap(() => interval(500)));
    // // 输出: 0,1,2,3,4,5,6,7,8,9...0,1,2,3,4,5,6,7,8
    // const subscribe = example.subscribe(val => console.log(val));
    // of(1, 2, 3).pipe(switchMap(x => of(x, x ** 2, x ** 3))).subscribe(res => console.log(res))
    // interval(500).pipe(switchMap(x => interval(200)), take(5)).subscribe(res => console.log(res))
    // interval(500).pipe(concatMap(x => interval(200)), take(5)).subscribe(res => console.log(res))
    const test$ = new Subject<number>();
    // test$.subscribe(res => {
    //   console.log(res)
    // });
    // setTimeout(()=> test$.next(2),2000)
    const deriveTest$ = test$.asObservable();

    deriveTest$.subscribe(res => {
      console.log(res)
    });

    setTimeout(() => test$.next(2), 2000)
  }

}
