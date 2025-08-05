import * as React from 'react';
import treeChanges from 'tree-changes';

import {
  getClientRect,
  getDocumentHeight,
  getElement,
  getElementPosition,
  getScrollParent,
  hasCustomScrollParent,
  hasPosition,
} from '~/modules/dom';
import { getBrowser, isLegacy, log } from '~/modules/helpers';

import { LIFECYCLE } from '~/literals';

import { Lifecycle, OverlayProps } from '~/types';

import Spotlight from './Spotlight';

interface State {
  isScrolling: boolean;
  mouseOverSpotlight: boolean;
  showSpotlight: boolean;
}

interface SpotlightStyles extends React.CSSProperties {
  height: number;
  left: number;
  top: number;
  width: number;
}

export default class JoyrideOverlay extends React.Component<OverlayProps, State> {
  isActive = false;
  resizeTimeout?: number;
  scrollTimeout?: number;
  scrollParent?: Document | Element;
  state = {
    isScrolling: false,
    mouseOverSpotlight: false,
    showSpotlight: true,
  };

  componentDidMount() {
    const { debug, disableScrolling, disableScrollParentFix = false, target } = this.props;
    const element = getElement(target);

    this.scrollParent = getScrollParent(element ?? document.body, disableScrollParentFix, true);
    this.isActive = true;

    if (process.env.NODE_ENV !== 'production') {
      if (!disableScrolling && hasCustomScrollParent(element, true)) {
        log({
          title: 'step has a custom scroll parent and can cause trouble with scrolling',
          data: [{ key: 'parent', value: this.scrollParent }],
          debug,
        });
      }
    }

    window.addEventListener('resize', this.handleResize);
  }

  componentDidUpdate(previousProps: OverlayProps) {
    const { disableScrollParentFix, lifecycle, spotlightClicks, target } = this.props;
    const { changed } = treeChanges(previousProps, this.props);

    if (changed('target') || changed('disableScrollParentFix')) {
      const element = getElement(target);

      this.scrollParent = getScrollParent(element ?? document.body, disableScrollParentFix, true);
    }

    if (changed('lifecycle', LIFECYCLE.TOOLTIP)) {
      this.scrollParent?.addEventListener('scroll', this.handleScroll, { passive: true });

      setTimeout(() => {
        const { isScrolling } = this.state;

        if (!isScrolling) {
          this.updateState({ showSpotlight: true });
        }
      }, 100);
    }

    if (changed('spotlightClicks') || changed('disableOverlay') || changed('lifecycle')) {
      if (spotlightClicks && lifecycle === LIFECYCLE.TOOLTIP) {
        window.addEventListener('mousemove', this.handleMouseMove, false);
      } else if (lifecycle !== LIFECYCLE.TOOLTIP) {
        window.removeEventListener('mousemove', this.handleMouseMove);
      }
    }
  }

  componentWillUnmount() {
    this.isActive = false;

    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('resize', this.handleResize);

    clearTimeout(this.resizeTimeout);
    clearTimeout(this.scrollTimeout);
    this.scrollParent?.removeEventListener('scroll', this.handleScroll);
  }

  hideSpotlight = () => {
    const { continuous, disableOverlay, lifecycle } = this.props;
    const hiddenLifecycles = [
      LIFECYCLE.INIT,
      LIFECYCLE.BEACON,
      LIFECYCLE.COMPLETE,
      LIFECYCLE.ERROR,
    ] as Lifecycle[];

    return (
      disableOverlay ||
      (continuous ? hiddenLifecycles.includes(lifecycle) : lifecycle !== LIFECYCLE.TOOLTIP)
    );
  };

  detectProblematicElement(element: HTMLElement | null): boolean {
    if (!element) return false;
    
    // Check if element is in a table
    const isInTable = element.closest('table, tbody, thead, tfoot, tr, td, th') !== null;
    
    // Check for overflow properties
    let currentElement: HTMLElement | null = element;
    while (currentElement && currentElement !== document.body) {
      const style = window.getComputedStyle(currentElement);
      if (style.overflow === 'hidden' || style.overflow === 'auto' || style.overflow === 'scroll') {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
    
    return isInTable;
  }

  get overlayStyles() {
    const { mouseOverSpotlight } = this.state;
    const { disableOverlayClose, placement, styles, target } = this.props;
    let { spotlightMethod = 'blend-mode' } = this.props;
    
    // Auto-detect problematic elements and switch method
    const element = getElement(target);
    if (spotlightMethod === 'blend-mode' && this.detectProblematicElement(element)) {
      spotlightMethod = 'clip-path';
    }

    let baseStyles = styles.overlay;

    if (isLegacy()) {
      baseStyles = placement === 'center' ? styles.overlayLegacyCenter : styles.overlayLegacy;
    }

    const overlayStyles: React.CSSProperties = {
      cursor: disableOverlayClose ? 'default' : 'pointer',
      height: getDocumentHeight(),
      pointerEvents: mouseOverSpotlight ? 'none' : 'auto',
      ...baseStyles,
    };

    // Apply different spotlight methods
    if (placement !== 'center') {
      const element = getElement(target);
      const { spotlightPadding = 0 } = this.props;
      
      if (element) {
        const rect = element.getBoundingClientRect();
        const left = rect.left - spotlightPadding;
        const top = rect.top - spotlightPadding;
        const right = rect.left + rect.width + spotlightPadding;
        const bottom = rect.top + rect.height + spotlightPadding;
        
        if (spotlightMethod === 'clip-path') {
          overlayStyles.clipPath = `polygon(
            0% 0%, 
            0% 100%, 
            ${left}px 100%, 
            ${left}px ${top}px, 
            ${right}px ${top}px, 
            ${right}px ${bottom}px, 
            ${left}px ${bottom}px, 
            ${left}px 100%, 
            100% 100%, 
            100% 0%
          )`;
        }
      }
    }

    return overlayStyles;
  }

  get spotlightStyles(): SpotlightStyles {
    const { showSpotlight } = this.state;
    const {
      disableScrollParentFix = false,
      spotlightClicks,
      spotlightPadding = 0,
      styles,
      target,
    } = this.props;
    const element = getElement(target);
    const elementRect = getClientRect(element);
    const isFixedTarget = hasPosition(element);
    const top = getElementPosition(element, spotlightPadding, disableScrollParentFix);

    return {
      ...(isLegacy() ? styles.spotlightLegacy : styles.spotlight),
      height: Math.round((elementRect?.height ?? 0) + spotlightPadding * 2),
      left: Math.round((elementRect?.left ?? 0) - spotlightPadding),
      opacity: showSpotlight ? 1 : 0,
      pointerEvents: spotlightClicks ? 'none' : 'auto',
      position: isFixedTarget ? 'fixed' : 'absolute',
      top,
      transition: 'opacity 0.2s',
      width: Math.round((elementRect?.width ?? 0) + spotlightPadding * 2),
    } satisfies React.CSSProperties;
  }

  handleMouseMove = (event: MouseEvent) => {
    const { mouseOverSpotlight } = this.state;
    const { height, left, position, top, width } = this.spotlightStyles;

    const offsetY = position === 'fixed' ? event.clientY : event.pageY;
    const offsetX = position === 'fixed' ? event.clientX : event.pageX;
    const inSpotlightHeight = offsetY >= top && offsetY <= top + height;
    const inSpotlightWidth = offsetX >= left && offsetX <= left + width;
    const inSpotlight = inSpotlightWidth && inSpotlightHeight;

    if (inSpotlight !== mouseOverSpotlight) {
      this.updateState({ mouseOverSpotlight: inSpotlight });
    }
  };

  handleScroll = () => {
    const { target } = this.props;
    const element = getElement(target);

    if (this.scrollParent !== document) {
      const { isScrolling } = this.state;

      if (!isScrolling) {
        this.updateState({ isScrolling: true, showSpotlight: false });
      }

      clearTimeout(this.scrollTimeout);

      this.scrollTimeout = window.setTimeout(() => {
        this.updateState({ isScrolling: false, showSpotlight: true });
      }, 50);
    } else if (hasPosition(element, 'sticky')) {
      this.updateState({});
    }
  };

  handleResize = () => {
    clearTimeout(this.resizeTimeout);

    this.resizeTimeout = window.setTimeout(() => {
      if (!this.isActive) {
        return;
      }

      this.forceUpdate();
    }, 100);
  };

  updateState(state: Partial<State>) {
    if (!this.isActive) {
      return;
    }

    this.setState(previousState => ({ ...previousState, ...state }));
  }

  render() {
    const { showSpotlight } = this.state;
    const { onClickOverlay, placement, target } = this.props;
    let { spotlightMethod = 'blend-mode' } = this.props;
    const { hideSpotlight, overlayStyles, spotlightStyles } = this;
    
    // Auto-detect problematic elements and switch method
    const element = getElement(target);
    if (spotlightMethod === 'blend-mode' && this.detectProblematicElement(element)) {
      spotlightMethod = 'clip-path';
    }

    if (hideSpotlight()) {
      return null;
    }

    let spotlight = null;
    let content = null;
    
    // Different rendering based on spotlight method
    if (placement !== 'center' && showSpotlight) {
      if (spotlightMethod === 'blend-mode') {
        spotlight = <Spotlight styles={spotlightStyles} />;

        // Hack for Safari bug with mix-blend-mode with z-index
        if (getBrowser() === 'safari') {
          const { mixBlendMode, zIndex, ...safariOverlay } = overlayStyles;
          spotlight = <div style={{ ...safariOverlay }}>{spotlight}</div>;
          delete overlayStyles.backgroundColor;
        }
      } else if (spotlightMethod === 'box-shadow') {
        const element = getElement(this.props.target);
        const { spotlightPadding = 0 } = this.props;
        
        if (element) {
          const rect = element.getBoundingClientRect();
          const spotlightBoxStyle: React.CSSProperties = {
            position: 'fixed',
            left: rect.left - spotlightPadding,
            top: rect.top - spotlightPadding,
            width: rect.width + (spotlightPadding * 2),
            height: rect.height + (spotlightPadding * 2),
            boxShadow: `0 0 0 9999px ${overlayStyles.backgroundColor || 'rgba(0, 0, 0, 0.5)'}`,
            pointerEvents: this.props.spotlightClicks ? 'none' : 'auto',
            zIndex: 1,
          };
          
          content = <div className="react-joyride__spotlight-box" style={spotlightBoxStyle} />;
          // Remove background from overlay since box-shadow handles it
          delete overlayStyles.backgroundColor;
        }
      }
    }

    return (
      <div
        className="react-joyride__overlay"
        data-test-id="overlay"
        onClick={onClickOverlay}
        role="presentation"
        style={overlayStyles}
      >
        {spotlight}
        {content}
      </div>
    );
  }
}
