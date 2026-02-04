import { fireEvent, render, screen } from '@testing-library/react';
import { generateCartLineItemData } from '__mock__/generateMockData';
import CartContextProvider from 'contexts/cartContext';
import { RangeFacetItem } from 'models/filter';
import keyCode from 'rc-util/lib/KeyCode';
import FacetedFilterSlider from './FacetedFilterSlider';

describe('Faceted Filter Slider Component', () => {
  test('should render correct min and max value as default', () => {
    const item: RangeFacetItem = {
      min: 100,
      max: 1000,
      selectedMax: null,
      selectedMin: null,
    };
    const cart = generateCartLineItemData(1, 1, 0);
    render(
      <CartContextProvider value={cart}>
        <FacetedFilterSlider
          item={item}
          groupId={'price'}
          onChange={() => {}}
        />
      </CartContextProvider>
    );
    expect(
      screen.getByTestId('faceted-filter-slider__selected-min')
    ).toHaveTextContent('100 SEK');
    expect(
      screen.getByTestId('faceted-filter-slider__selected-max')
    ).toHaveTextContent('1 000 SEK');
  });

  test('should render correct selected min and selected max if available', () => {
    const item: RangeFacetItem = {
      min: 100,
      max: 1000,
      selectedMin: 200,
      selectedMax: 300,
    };
    const cart = generateCartLineItemData(1, 1, 0);
    render(
      <CartContextProvider value={cart}>
        <FacetedFilterSlider
          item={item}
          groupId={'price'}
        ></FacetedFilterSlider>
      </CartContextProvider>
    );
    expect(
      screen.getByTestId('faceted-filter-slider__selected-min')
    ).toHaveTextContent('200 SEK');
    expect(
      screen.getByTestId('faceted-filter-slider__selected-max')
    ).toHaveTextContent('300 SEK');
  });

  test('should render min value if selected min is lower than min', () => {
    const item: RangeFacetItem = {
      min: 300,
      max: 1000,
      selectedMin: 100,
      selectedMax: 400,
    };
    const cart = generateCartLineItemData(1, 1, 0);
    render(
      <CartContextProvider value={cart}>
        <FacetedFilterSlider
          item={item}
          groupId={'price'}
        ></FacetedFilterSlider>
      </CartContextProvider>
    );
    expect(
      screen.getByTestId('faceted-filter-slider__selected-min')
    ).toHaveTextContent('300 SEK');
  });

  test('should render max value if selected max is greater than max', () => {
    const item: RangeFacetItem = {
      min: 100,
      max: 1000,
      selectedMin: 200,
      selectedMax: 1100,
    };
    const cart = generateCartLineItemData(1, 1, 0);
    render(
      <CartContextProvider value={cart}>
        <FacetedFilterSlider
          item={item}
          groupId={'price'}
        ></FacetedFilterSlider>
      </CartContextProvider>
    );

    expect(
      screen.getByTestId('faceted-filter-slider__selected-max')
    ).toHaveTextContent('1 000 SEK');
  });

  test('should trigger onChange callback on slider change', () => {
    const item: RangeFacetItem = {
      min: 100,
      max: 1000,
      selectedMin: 200,
      selectedMax: 1100,
    };
    const groupId = 'price';
    const onChange = jest.fn();

    const { container } = render(
      <FacetedFilterSlider item={item} groupId={groupId} onChange={onChange} />
    );

    const minThumb = container.getElementsByClassName('rc-slider-handle')[0];
    const maxThumb = container.getElementsByClassName('rc-slider-handle')[1];

    // Simulate slider change
    fireEvent.keyDown(minThumb, {
      keyCode: keyCode.RIGHT,
    });

    expect(onChange).toHaveBeenCalledWith('201-1000', groupId);

    fireEvent.keyDown(maxThumb, {
      keyCode: keyCode.LEFT,
    });
    expect(onChange).toHaveBeenCalledWith('201-999', groupId);
  });

  test('should be able to change selected min value of slider', () => {
    const item: RangeFacetItem = {
      min: 100,
      max: 1000,
      selectedMin: 200,
      selectedMax: 1100,
    };
    const groupId = 'price';
    const onChange = jest.fn();
    const cart = generateCartLineItemData(1, 1, 0);

    const { container } = render(
      <CartContextProvider value={cart}>
        <FacetedFilterSlider
          item={item}
          groupId={groupId}
          onChange={onChange}
        />
      </CartContextProvider>
    );

    const minThumb = container.getElementsByClassName('rc-slider-handle')[0];

    // Simulate slider change
    fireEvent.keyDown(minThumb, {
      keyCode: keyCode.RIGHT,
    });

    expect(
      screen.getByTestId('faceted-filter-slider__selected-min')
    ).toHaveTextContent('201 SEK');
  });

  test('should be able to change selected max value of slider', () => {
    const item: RangeFacetItem = {
      min: 100,
      max: 1000,
      selectedMin: 200,
      selectedMax: 1100,
    };
    const groupId = 'price';
    const onChange = jest.fn();
    const cart = generateCartLineItemData(1, 1, 0);

    const { container } = render(
      <CartContextProvider value={cart}>
        <FacetedFilterSlider
          item={item}
          groupId={groupId}
          onChange={onChange}
        />
      </CartContextProvider>
    );

    const maxThumb = container.getElementsByClassName('rc-slider-handle')[1];

    // Simulate slider change
    fireEvent.keyDown(maxThumb, {
      keyCode: keyCode.LEFT,
    });

    expect(
      screen.getByTestId('faceted-filter-slider__selected-max')
    ).toHaveTextContent('999 SEK');
  });
});
