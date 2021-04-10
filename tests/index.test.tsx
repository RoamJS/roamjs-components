import React from 'react';
import Package from '../src';
import { render } from '@testing-library/react';

test('Renders Package', () => {
    const { container } = render(<Package/>);
    expect(container).toBeInTheDocument();
})