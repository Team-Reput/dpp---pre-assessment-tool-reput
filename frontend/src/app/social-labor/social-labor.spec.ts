import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialLabor } from './social-labor';

describe('SocialLabor', () => {
  let component: SocialLabor;
  let fixture: ComponentFixture<SocialLabor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialLabor],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialLabor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
