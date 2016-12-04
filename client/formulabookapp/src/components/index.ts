import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FlNavBar } from './fl-nav-bar/fl-nav-bar'
import { CategoryComponent } from './category/category'
import { PropertyComponent } from './property/property'
import { UnitComponent } from './unit/unit'
import { GlobalComponent } from './global/global'
import { FormulaComponent } from './formula/formula'
import { VarComponent, GVarComponent } from './formula/variable/variable'
import { RunComponent, ValComponent, InputValueAccessor } from './formula/run/run'
import { MathKeypad } from './keys/keypad'
import { MathQ } from './mathquill'
import { MathQValueAccessor } from './mathquill-accessor'
import { UnitSelector } from './selectors/unit'
import { UnitValueAccessor } from './selectors/unit-accessor'

import { FBError } from './fb-error'



export const COMPONENTS = [
    FlNavBar,
    CategoryComponent,
    PropertyComponent,
    UnitComponent,
    GlobalComponent,
    FormulaComponent,
    VarComponent,
    GVarComponent,
    RunComponent,
    ValComponent,
    InputValueAccessor,
    MathKeypad,
    MathQ,
    MathQValueAccessor,
    UnitSelector,
    UnitValueAccessor,
    FBError
];


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS
})
export class ComponentsModule { }