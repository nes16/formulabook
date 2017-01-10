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
import { RunComponent } from './formula/run/run'
import { ValComponent, InputValueAccessor } from './formula/run/val'
import { MathKeypad } from './keys/keypad'
import { MathQ, MathQValueAccessor } from './mathquill'
import { UnitSelector, UnitValueAccessor } from './selectors/unit'

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