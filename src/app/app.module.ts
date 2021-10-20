import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AutoSaveComponent } from './auto-save/auto-save.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestAutoSaveComponent } from './test-auto-save/test-auto-save.component';
import { AutoSaveFormDirective } from './auto-save-form.directive';
import { MyFilterPipe } from './pipe/my-filter.pipe';
import { TestComponent } from './test/test.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    AutoSaveComponent,
    TestAutoSaveComponent,
    AutoSaveFormDirective,
    MyFilterPipe,
    TestComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
