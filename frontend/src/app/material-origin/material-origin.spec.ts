import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialOrigin } from './material-origin';

describe('MaterialOrigin', () => {
  let component: MaterialOrigin;
  let fixture: ComponentFixture<MaterialOrigin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialOrigin],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialOrigin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
