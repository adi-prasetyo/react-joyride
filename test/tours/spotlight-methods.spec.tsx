import React from 'react';

import Joyride from '~/index';
import { ACTIONS, EVENTS, LIFECYCLE, STATUS } from '~/literals';

import { act, fireEvent, render, screen, waitFor } from '../__fixtures__/test-utils';
import { callbackResponseFactory } from '../__fixtures__/test-helpers';

const getCallbackResponse = callbackResponseFactory();

// Test component with table
const TableComponent = ({ callback, run = true, spotlightMethod }: any) => {
  const steps = [
    {
      target: '[data-testid="table-cell"]',
      content: 'This targets a table cell',
      spotlightMethod,
    },
    {
      target: '[data-testid="overflow-element"]',
      content: 'This targets an element with overflow',
      spotlightMethod,
    },
  ];

  return (
    <div data-testid="demo">
      <table data-testid="test-table">
        <tbody>
          <tr>
            <td data-testid="table-cell">Table Cell Content</td>
            <td>Other Cell</td>
          </tr>
        </tbody>
      </table>
      
      <div 
        data-testid="overflow-container" 
        style={{ overflow: 'auto', height: '200px' }}
      >
        <div data-testid="overflow-element">
          Content inside overflow container
        </div>
      </div>

      <Joyride
        callback={callback}
        run={run}
        steps={steps}
        spotlightMethod={spotlightMethod}
      />
    </div>
  );
};

describe('Joyride > Spotlight Methods', () => {
  const mockCallback = vi.fn();

  beforeEach(() => {
    mockCallback.mockClear();
  });

  describe('with tables', () => {
    it('should auto-detect table and switch to clip-path', async () => {
      render(
        <TableComponent 
          callback={mockCallback}
          // Not specifying spotlightMethod, should default to blend-mode
          // but auto-detect table and switch to clip-path
        />
      );

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: EVENTS.TOUR_START,
          })
        );
      });

      // Check that overlay exists
      const overlay = screen.getByTestId('overlay');
      expect(overlay).toBeInTheDocument();
      
      // Check that clip-path is applied
      const overlayStyle = window.getComputedStyle(overlay);
      expect(overlayStyle.clipPath).not.toBe('none');
      expect(overlayStyle.clipPath).toContain('polygon');
      
      // Check that no spotlight element exists (clip-path doesn't use separate spotlight)
      expect(screen.queryByTestId('spotlight')).not.toBeInTheDocument();
    });

    it('should use clip-path method when explicitly set', async () => {
      render(
        <TableComponent 
          callback={mockCallback}
          spotlightMethod="clip-path"
        />
      );

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: EVENTS.TOUR_START,
          })
        );
      });

      const overlay = screen.getByTestId('overlay');
      const overlayStyle = window.getComputedStyle(overlay);
      expect(overlayStyle.clipPath).toContain('polygon');
    });

    it('should use box-shadow method when set', async () => {
      render(
        <TableComponent 
          callback={mockCallback}
          spotlightMethod="box-shadow"
        />
      );

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: EVENTS.TOUR_START,
          })
        );
      });

      // Check for box-shadow spotlight element
      const boxShadowElement = screen.getByTestId('overlay').querySelector('.react-joyride__spotlight-box');
      expect(boxShadowElement).toBeInTheDocument();
      
      const boxShadowStyle = window.getComputedStyle(boxShadowElement as Element);
      expect(boxShadowStyle.boxShadow).toContain('9999px');
    });
  });

  describe('with overflow containers', () => {
    it('should auto-detect overflow and switch to clip-path', async () => {
      render(
        <TableComponent 
          callback={mockCallback}
        />
      );

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: EVENTS.TOUR_START,
          })
        );
      });

      // Navigate to second step (overflow element)
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            action: ACTIONS.NEXT,
            index: 1,
          })
        );
      });

      const overlay = screen.getByTestId('overlay');
      const overlayStyle = window.getComputedStyle(overlay);
      expect(overlayStyle.clipPath).toContain('polygon');
    });
  });

  describe('spotlight method consistency', () => {
    it('should maintain blend-mode for regular elements', async () => {
      const RegularComponent = ({ callback }: any) => {
        const steps = [
          {
            target: '[data-testid="regular-element"]',
            content: 'This is a regular element',
          },
        ];

        return (
          <div data-testid="demo">
            <div data-testid="regular-element">Regular Content</div>
            <Joyride
              callback={callback}
              run
              steps={steps}
            />
          </div>
        );
      };

      render(<RegularComponent callback={mockCallback} />);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: EVENTS.TOUR_START,
          })
        );
      });

      // Should have spotlight element for blend-mode
      expect(screen.getByTestId('spotlight')).toBeInTheDocument();
      
      const overlay = screen.getByTestId('overlay');
      const overlayStyle = window.getComputedStyle(overlay);
      expect(overlayStyle.mixBlendMode).toBe('hard-light');
    });
  });
});