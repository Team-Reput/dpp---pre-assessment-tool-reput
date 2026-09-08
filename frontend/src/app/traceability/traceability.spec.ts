import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Traceability } from './traceability';

describe('Traceability', () => {
  let component: Traceability;
  let fixture: ComponentFixture<Traceability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Traceability],
    }).compileComponents();

    fixture = TestBed.createComponent(Traceability);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
