import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtendedData } from './extended-data';

describe('ExtendedData', () => {
  let component: ExtendedData;
  let fixture: ComponentFixture<ExtendedData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtendedData],
    }).compileComponents();

    fixture = TestBed.createComponent(ExtendedData);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
