import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EsprDpp } from './espr-dpp';

describe('EsprDpp', () => {
  let component: EsprDpp;
  let fixture: ComponentFixture<EsprDpp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsprDpp],
    }).compileComponents();

    fixture = TestBed.createComponent(EsprDpp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
