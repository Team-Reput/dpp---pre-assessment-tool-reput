import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialComp } from './material-comp';

describe('MaterialComp', () => {
  let component: MaterialComp;
  let fixture: ComponentFixture<MaterialComp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialComp],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialComp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
