import React from 'react';

import { ACTIONS, EVENTS, LIFECYCLE, STATUS } from '~/index';

import { act, fireEvent, render, screen, waitFor } from '../__fixtures__/test-utils';
import { callbackResponseFactory } from '../__fixtures__/test-helpers';
import Standard from '../__fixtures__/Standard';

const getCallbackResponse = callbackResponseFactory();

describe('Joyride > Center Placement', () => {
  const mockCallback = vi.fn();

  beforeEach(() => {
    mockCallback.mockClear();
  });

  describe('with body target', () => {
    const centerSteps = [
      {
        target: 'body',
        placement: 'center' as const,
        content: 'This is a centered welcome message',
        title: 'Welcome!',
      },
    ];

    it('should show overlay on initial render', async () => {
      render(
        <Standard
          callback={mockCallback}
          steps={centerSteps}
          run
        />
      );

      // Wait for the tour to start
      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: EVENTS.TOUR_START,
          })
        );
      });

      // Verify overlay is present immediately after tour starts
      expect(screen.getByTestId('overlay')).toBeInTheDocument();
      expect(screen.getByTestId('overlay')).toHaveStyle({
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      });

      // Wait for tooltip to be ready and verify it's present
      await waitFor(() => {
        const tooltip = screen.queryById('react-joyride-step-0');
        expect(tooltip).toBeInTheDocument();
      });

      const tooltip = screen.getById('react-joyride-step-0');
      expect(tooltip.querySelector('h1')).toHaveTextContent('Welcome!');
    });

    it('should show overlay when starting with multiple steps', async () => {
      const multipleSteps = [
        {
          target: 'body',
          placement: 'center' as const,
          content: 'Welcome to the tour!',
        },
        {
          target: '.demo__footer button',
          placement: 'top' as const,
          content: 'This is the next step',
        },
      ];

      const { container } = render(
        <Standard
          callback={mockCallback}
          steps={multipleSteps}
          run
        />
      );

      // Wait for tour to start
      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: EVENTS.TOUR_START,
          })
        );
      });

      // Verify overlay is present on first step - use container query to avoid multiple matches
      const overlay = container.querySelector('[data-test-id="overlay"]');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('with element target and center placement', () => {
    const centerElementSteps = [
      {
        target: '.demo',
        placement: 'center' as const,
        content: 'This element is centered',
        spotlightClicks: false,
      },
    ];

    it('should show overlay for element with center placement', async () => {
      render(
        <Standard
          callback={mockCallback}
          steps={centerElementSteps}
          run
        />
      );

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: EVENTS.TOUR_START,
          })
        );
      });

      // Verify overlay is present
      expect(screen.getByTestId('overlay')).toBeInTheDocument();
    });
  });

  describe('navigation behavior', () => {
    const navigationSteps = [
      {
        target: 'body',
        placement: 'center' as const,
        content: 'First step - centered',
      },
      {
        target: '.demo__footer button',
        placement: 'top' as const,
        content: 'Second step - not centered',
      },
      {
        target: 'body',
        placement: 'center' as const,
        content: 'Third step - centered again',
      },
    ];

    it('should maintain overlay when navigating back to center placement', async () => {
      render(
        <Standard
          callback={mockCallback}
          steps={navigationSteps}
          run
        />
      );

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: EVENTS.TOUR_START,
          })
        );
      });

      // First step - overlay should be present
      expect(screen.getByTestId('overlay')).toBeInTheDocument();

      // Navigate to second step
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            action: ACTIONS.NEXT,
            index: 1,
          })
        );
      });

      // Overlay should still be present
      expect(screen.getByTestId('overlay')).toBeInTheDocument();

      // Navigate back to first step
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            action: ACTIONS.PREV,
            index: 0,
          })
        );
      });

      // Overlay should still be present when back at center placement
      expect(screen.getByTestId('overlay')).toBeInTheDocument();
    });

    it('should show overlay immediately when navigating to center placement', async () => {
      render(
        <Standard
          callback={mockCallback}
          steps={navigationSteps}
          run
        />
      );

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: EVENTS.TOUR_START,
          })
        );
      });

      // Navigate to third step (center placement)
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            action: ACTIONS.NEXT,
            index: 2,
          })
        );
      });

      // Overlay should be present for the center placement step
      expect(screen.getByTestId('overlay')).toBeInTheDocument();
    });
  });

  describe('controlled mode', () => {
    it('should show overlay when stepIndex is set to center placement step', async () => {
      const { rerender } = render(
        <Standard
          callback={mockCallback}
          steps={[
            {
              target: '.demo__footer button',
              placement: 'top' as const,
              content: 'Regular step',
            },
            {
              target: 'body',
              placement: 'center' as const,
              content: 'Center step',
            },
          ]}
          run={false}
          stepIndex={0}
        />
      );

      // Start tour on center placement step
      rerender(
        <Standard
          callback={mockCallback}
          steps={[
            {
              target: '.demo__footer button',
              placement: 'top' as const,
              content: 'Regular step',
            },
            {
              target: 'body',
              placement: 'center' as const,
              content: 'Center step',
            },
          ]}
          run
          stepIndex={1}
        />
      );

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: EVENTS.TOUR_START,
          })
        );
      });

      // Overlay should be present immediately
      expect(screen.getByTestId('overlay')).toBeInTheDocument();
    });
  });
});