import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Subject, Observable, EMPTY, merge, timer } from 'rxjs';
import { filter, finalize, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';

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
  userForm: FormGroup;
  savedUserInfo: UserInfo;
  autoSaveToggleControl: FormControl;

  // 是否正在执行自动保存任务
  isAutoSaveTimerStart: boolean;
  // 自动保存任务的计时器秒数
  autoSaveTimerCount: number;

  private saveBtnClickSource = new Subject<void>();

  // 最后的保存用户信息的数据流
  private save$: Observable<UserInfo>;

  constructor(private fb: FormBuilder) {
    this.userForm = fb.group({
      name: [''],
      age: [''],
      height: [''],
      weight: ['']
    });
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
     */
    const autoSaveTimer$ = timer(0, 1000).pipe(
      take(6),
      map(t => 5 - t),
      tap(c => {
        this.isAutoSaveTimerStart = true;
        this.autoSaveTimerCount = c;
      }),
      finalize(() => {
        this.isAutoSaveTimerStart = false;
        this.autoSaveTimerCount = null;
      }),
      filter(t => t === 0),
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
    this.save$.subscribe(res => {
      this.savedUserInfo = res;
    });
  }

  onSaveBtnClick(): void {
    this.saveBtnClickSource.next();
  }

}
