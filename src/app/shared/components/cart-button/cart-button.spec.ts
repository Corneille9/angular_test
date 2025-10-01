import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartButton } from './cart-button';

describe('CartButton', () => {
  let component: CartButton;
  let fixture: ComponentFixture<CartButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
